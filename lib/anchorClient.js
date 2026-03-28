/**
 * anchorClient.js — Mammoth Protocol Anchor client
 * TASK-012: wire frontend to Devnet program DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31
 */

import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import IDL from './idl/mammoth_core.json';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31'
);

// ─── Program factory ──────────────────────────────────────────────────────────

/**
 * Returns an Anchor Program instance.
 * @param {Connection} connection
 * @param {object} wallet — wallet adapter (must have publicKey + signTransaction)
 */
export function getProgram(connection, wallet) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed', preflightCommitment: 'confirmed' }
  );
  // Anchor 0.32: Program(idl, provider) — programId is read from idl.address
  return new Program(IDL, provider);
}

// ─── PDA helpers ─────────────────────────────────────────────────────────────

export function getProtocolConfigPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('protocol_config')],
    PROGRAM_ID
  );
}

export function getProtocolTreasuryPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('protocol_treasury')],
    PROGRAM_ID
  );
}

export function getProjectStatePDA(mintPubkey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('project'), mintPubkey.toBuffer()],
    PROGRAM_ID
  );
}

export function getCycleStatePDA(projectStatePda, cycleIndex) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('cycle'), projectStatePda.toBuffer(), Buffer.from([cycleIndex])],
    PROGRAM_ID
  );
}

export function getHolderRightsPDA(cycleStatePda, holderPubkey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('rights'), cycleStatePda.toBuffer(), holderPubkey.toBuffer()],
    PROGRAM_ID
  );
}

export function getReservePDA(projectStatePda) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('reserve'), projectStatePda.toBuffer()],
    PROGRAM_ID
  );
}

// ─── Price compute helpers (mirror on-chain curve math for UI preview) ────────

/** Lamports-per-token → SOL price as float */
export function lamportsToSol(lamports) {
  return Number(lamports) / 1e9;
}

/** SOL price → lamports (as BN for anchor) */
export function solToLamports(sol) {
  return new BN(Math.floor(sol * 1e9));
}

/**
 * Compute current token price from a CycleState account (on-chain data).
 * Returns price in SOL (float).
 */
export function computeCurrentPrice(cycleState) {
  if (!cycleState) return 0;
  // Anchor 0.32 fetch() returns camelCase field names
  const { curveType, basePrice, stepSize, stepIncrement, minted, supplyCap, endPrice, growthFactorK } = cycleState;

  const basePriceSol = lamportsToSol(basePrice);
  const mintedN = Number(minted);
  const supplyCapN = Number(supplyCap);

  if (curveType.step !== undefined) {
    // Step curve
    const stepSizeN = Number(stepSize);
    const stepIncrementSol = lamportsToSol(stepIncrement);
    const stepIndex = stepSizeN > 0 ? Math.floor(mintedN / stepSizeN) : 0;
    return basePriceSol + stepIndex * stepIncrementSol;
  }

  if (curveType.linear !== undefined) {
    // Linear curve
    const endPriceSol = lamportsToSol(endPrice);
    const t = supplyCapN > 0 ? mintedN / supplyCapN : 0;
    return basePriceSol + (endPriceSol - basePriceSol) * t;
  }

  if (curveType.expLite !== undefined) {
    // Exp-Lite curve
    const k = Number(growthFactorK) / 1000; // stored as k*1000
    const t = supplyCapN > 0 ? mintedN / supplyCapN : 0;
    return basePriceSol * Math.exp(k * t);
  }

  return basePriceSol;
}

/**
 * Compute how many tokens a buyer gets for `solIn` SOL, given current cycle state.
 * Returns { tokensOut, effectivePrice, fee, newPrice, nextStepIn, remainingAfter }
 */
export function computeBuyQuote({ cycleState, solIn, feeBps = 200 }) {
  if (!cycleState || solIn <= 0) return null;
  const { curveType, basePrice, stepSize, stepIncrement, minted, supplyCap } = cycleState;

  const fee = solIn * (feeBps / 10000);
  let budget = solIn - fee;

  const basePriceSol = lamportsToSol(basePrice);
  const stepSizeN = Number(stepSize);
  const stepIncrSol = lamportsToSol(stepIncrement);
  const mintedN = Number(minted);
  const supplyCapN = Number(supplyCap);
  const remaining = supplyCapN - mintedN;

  // Step curve quote (used for step; approximate for others)
  if (curveType?.step !== undefined && stepSizeN > 0) {
    let tokensSold = mintedN;
    let tokensOut = 0;

    while (budget > 0 && tokensSold < supplyCapN) {
      const stepIndex = Math.floor(tokensSold / stepSizeN);
      const priceNow = basePriceSol + stepIndex * stepIncrSol;
      const tokensThisStep = Math.min(stepSizeN - (tokensSold % stepSizeN), supplyCapN - tokensSold);
      const costForStep = tokensThisStep * priceNow;

      if (budget >= costForStep) {
        budget -= costForStep;
        tokensSold += tokensThisStep;
        tokensOut += tokensThisStep;
      } else {
        const partial = Math.floor(budget / priceNow);
        tokensOut += partial;
        tokensSold += partial;
        budget = 0;
        break;
      }
    }

    const effectivePrice = tokensOut > 0 ? (solIn - fee) / tokensOut : basePriceSol;
    const newMinted = mintedN + tokensOut;
    const newStepIndex = stepSizeN > 0 ? Math.floor(newMinted / stepSizeN) : 0;
    const newPrice = basePriceSol + newStepIndex * stepIncrSol;
    const nextStepIn = stepSizeN - (newMinted % stepSizeN);

    return {
      tokensOut: Math.floor(tokensOut),
      effectivePrice,
      fee,
      newPrice,
      nextStepIn,
      remainingAfter: remaining - tokensOut,
    };
  }

  // Linear / ExpLite: simple average price approximation
  const currentPrice = computeCurrentPrice(cycleState);
  const tokensOut = Math.min(Math.floor(budget / currentPrice), remaining);
  return {
    tokensOut,
    effectivePrice: currentPrice,
    fee,
    newPrice: currentPrice,
    nextStepIn: null,
    remainingAfter: remaining - tokensOut,
  };
}

// ─── Account fetchers ─────────────────────────────────────────────────────────

/**
 * Fetch all ProjectState accounts from on-chain.
 * Returns array of { publicKey, account } with parsed data.
 */
export async function fetchAllProjects(program) {
  try {
    return await program.account.projectState.all();
  } catch (e) {
    console.warn('[mammoth] fetchAllProjects failed:', e.message);
    return [];
  }
}

/**
 * Fetch ProjectState for a specific mint address.
 */
export async function fetchProjectByMint(program, mintAddress) {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const [pda] = getProjectStatePDA(mintPubkey);
    const account = await program.account.projectState.fetch(pda);
    return { publicKey: pda, account };
  } catch (e) {
    console.warn('[mammoth] fetchProjectByMint failed:', e.message);
    return null;
  }
}

/**
 * Fetch active CycleState for a project (using current_cycle index).
 */
export async function fetchActiveCycle(program, projectStatePda, currentCycleIndex) {
  try {
    const [cyclePda] = getCycleStatePDA(projectStatePda, currentCycleIndex);
    const account = await program.account.cycleState.fetch(cyclePda);
    return { publicKey: cyclePda, account };
  } catch (e) {
    console.warn('[mammoth] fetchActiveCycle failed:', e.message);
    return null;
  }
}

/**
 * Fetch HolderRights for connected wallet on a given cycle.
 */
export async function fetchHolderRights(program, cycleStatePda, holderPubkey) {
  try {
    const [rightsPda] = getHolderRightsPDA(cycleStatePda, holderPubkey);
    const account = await program.account.holderRights.fetch(rightsPda);
    return { publicKey: rightsPda, account };
  } catch (e) {
    // Account doesn't exist = no rights — not an error condition
    return null;
  }
}

// ─── Error message parser ─────────────────────────────────────────────────────

/**
 * Maps Anchor/Solana errors to user-friendly messages.
 */
export function parseTransactionError(error) {
  if (!error) return 'Transaction failed, please try again';

  const msg = error.message || String(error);

  // User rejection
  if (
    msg.includes('User rejected') ||
    msg.includes('Transaction cancelled') ||
    msg.includes('WalletSignTransactionError') ||
    msg.includes('rejected the request')
  ) {
    return null; // silently close — user cancelled
  }

  // Insufficient funds
  if (msg.includes('0x1') || msg.includes('insufficient funds') || msg.includes('insufficient lamports')) {
    return 'Insufficient balance';
  }

  // Custom program errors — real Anchor 0.32 IDL error codes
  if (msg.includes('6000') || msg.includes('Unauthorized')) return 'Not authorized';
  if (msg.includes('6001') || msg.includes('HardCapAlreadySet')) return 'Hard cap already set — irreversible';
  if (msg.includes('6002') || msg.includes('NotElasticMode')) return 'Hard cap only settable in Elastic mode';
  if (msg.includes('6003') || msg.includes('NotRightsWindow')) return 'Cycle is not in Rights Window';
  if (msg.includes('6004') || msg.includes('RightsWindowExpired')) return 'Rights window has expired';
  if (msg.includes('6005') || msg.includes('ExceedsRightsAllocation')) return 'Exceeds your rights allocation';
  if (msg.includes('6006') || msg.includes('NotActive')) return 'Cycle is not active';
  if (msg.includes('6007') || msg.includes('SupplyCapExceeded')) return 'Cycle supply cap reached';
  if (msg.includes('6008') || msg.includes('CycleParamsImmutable')) return 'Cycle params are immutable once opened';
  if (msg.includes('6009') || msg.includes('ElasticRequiresRights')) return 'Elastic supply requires rights issuance';
  if (msg.includes('6010') || msg.includes('MathOverflow')) return 'Arithmetic overflow';
  if (msg.includes('6011') || msg.includes('NotClosed')) return 'Cycle is not closed';
  if (msg.includes('6012') || msg.includes('ZeroAmount')) return 'Amount must be greater than zero';
  if (msg.includes('6013') || msg.includes('ZeroStepSize')) return 'Step size cannot be zero';

  // Generic RPC / network errors
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch')) {
    return 'Network error — please try again';
  }

  return 'Transaction failed, please try again';
}
