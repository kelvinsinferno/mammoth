import {
  getProgram,
  getProjectStatePDA,
  getCycleStatePDA,
  getHolderRightsPDA,
  getProtocolConfigPDA,
  getProtocolTreasuryPDA,
  getReservePDA,
  parseTransactionError,
  solToLamports,
} from './anchorClient';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';

// ─── Curve math (client-side, mirrors on-chain) ───────────────────────────────

export function computeStepCurve({ solIn, sold, allocation, startPrice, stepSize, stepIncrement, feeBps = 200 }) {
  const fee = solIn * (feeBps / 10000);
  let budget = solIn - fee;
  let tokensSold = sold;
  let tokensOut = 0;
  const steps = [];

  while (budget > 0 && tokensSold < allocation) {
    const stepIndex = Math.floor(tokensSold / stepSize);
    const priceNow = startPrice + stepIndex * stepIncrement;
    const tokensThisStep = Math.min(stepSize - (tokensSold % stepSize), allocation - tokensSold);
    const costForStep = tokensThisStep * priceNow;

    if (budget >= costForStep) {
      budget -= costForStep;
      tokensSold += tokensThisStep;
      tokensOut += tokensThisStep;
      steps.push({ price: priceNow, tokens: tokensThisStep });
    } else {
      const partial = Math.floor(budget / priceNow);
      tokensOut += partial;
      tokensSold += partial;
      budget -= partial * priceNow;
      steps.push({ price: priceNow, tokens: partial });
      break;
    }
  }

  const effectivePrice = tokensOut > 0 ? (solIn - fee) / tokensOut : startPrice;
  const newPrice = startPrice + Math.floor(tokensSold / stepSize) * stepIncrement;
  const nextStepIn = stepSize - (tokensSold % stepSize);
  const remainingAfter = allocation - tokensSold;

  return { tokensOut, fee, effectivePrice, newPrice, nextStepIn, remainingAfter, soldAfter: tokensSold };
}

// ─── Mock implementations (kept for fallback / non-wallet preview) ────────────

export async function mockExecuteBuy({ solIn, tokensOut, ticker }) {
  await new Promise(r => setTimeout(r, 900));
  await new Promise(r => setTimeout(r, 700));
  if (Math.random() < 0.15) throw new Error('Transaction rejected by network');
  const sig = Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 6)).join('');
  return { signature: sig, solIn, tokensOut, ticker, ts: Date.now() };
}

export async function mockDeployToken(form) {
  await new Promise(r => setTimeout(r, 900));
  await new Promise(r => setTimeout(r, 600));
  if (Math.random() < 0.12) throw new Error('Rejected');
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const mint = Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return { ...form, mint, createdAt: new Date().toISOString() };
}

// ─── Real on-chain: buy_tokens ────────────────────────────────────────────────

/**
 * Execute a real buy_tokens instruction on-chain.
 * @param {object} opts
 * @param {Connection} opts.connection
 * @param {object} opts.walletAdapter — { publicKey, signTransaction, signAllTransactions }
 * @param {string} opts.mintAddress — token mint address string
 * @param {number} opts.amount — number of tokens to buy
 * @param {number} opts.solIn — SOL amount to spend (for UI receipt)
 * @param {string} opts.ticker
 * @returns {{ signature, solIn, tokensOut, ticker, ts }}
 */
export async function executeBuyTokens({ connection, walletAdapter, mintAddress, amount, solIn, ticker }) {
  const program = getProgram(connection, walletAdapter);
  const buyerPubkey = walletAdapter.publicKey;
  const mintPubkey = new PublicKey(mintAddress);

  const [projectStatePda] = getProjectStatePDA(mintPubkey);
  const projectState = await program.account.projectState.fetch(projectStatePda);
  // Anchor 0.32 returns camelCase: currentCycle
  const cycleIndex = projectState.currentCycle - 1;
  const [cycleStatePda] = getCycleStatePDA(projectStatePda, cycleIndex);
  const [protocolConfigPda] = getProtocolConfigPDA();
  const [protocolTreasuryPda] = getProtocolTreasuryPDA();
  // buyerToken = ATA for buyer (key name matches IDL: buyer_token → buyerToken)
  const buyerToken = await getAssociatedTokenAddress(mintPubkey, buyerPubkey);

  // buy_tokens accounts per real IDL: projectState, cycleState, protocolConfig,
  // protocolTreasury, projectEscrowToken (PDA), buyerToken, mint, buyer, programs
  // PDAs with seeds are resolved automatically by Anchor 0.32 — only pass manually-resolved ones
  const tx = await program.methods
    .buyTokens(new BN(amount))
    .accounts({
      projectState: projectStatePda,
      cycleState: cycleStatePda,
      protocolConfig: protocolConfigPda,
      protocolTreasury: protocolTreasuryPda,
      buyerToken,
      mint: mintPubkey,
      buyer: buyerPubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return {
    signature: tx,
    solIn,
    tokensOut: amount,
    ticker,
    ts: Date.now(),
  };
}

// ─── Real on-chain: exercise_rights ──────────────────────────────────────────

/**
 * Execute exercise_rights instruction on-chain.
 */
export async function executeExerciseRights({ connection, walletAdapter, mintAddress, amount, ticker }) {
  const program = getProgram(connection, walletAdapter);
  const holderPubkey = walletAdapter.publicKey;
  const mintPubkey = new PublicKey(mintAddress);

  const [projectStatePda] = getProjectStatePDA(mintPubkey);
  const projectState = await program.account.projectState.fetch(projectStatePda);
  // Anchor 0.32 returns camelCase: currentCycle
  const cycleIndex = projectState.currentCycle - 1;
  const [cycleStatePda] = getCycleStatePDA(projectStatePda, cycleIndex);
  const [holderRightsPda] = getHolderRightsPDA(cycleStatePda, holderPubkey);
  // holderToken = ATA for holder (key: holder_token → holderToken)
  const holderToken = await getAssociatedTokenAddress(mintPubkey, holderPubkey);

  // exercise_rights accounts per real IDL: projectState, cycleState, holderRights,
  // projectEscrowToken (PDA auto-resolved), holderToken, mint, holder, programs
  const tx = await program.methods
    .exerciseRights(new BN(amount))
    .accounts({
      projectState: projectStatePda,
      cycleState: cycleStatePda,
      holderRights: holderRightsPda,
      holderToken,
      mint: mintPubkey,
      holder: holderPubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, amount, ticker, ts: Date.now() };
}

// ─── Real on-chain: create_project ───────────────────────────────────────────

/**
 * Deploy a new project on-chain via create_project instruction.
 * Requires a new Keypair for mint (generated and passed as signer).
 */
export async function deployProject({ connection, walletAdapter, form }) {
  const { Keypair } = await import('@solana/web3.js');
  const program = getProgram(connection, walletAdapter);
  const creatorPubkey = walletAdapter.publicKey;

  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  const mintPubkey = mintKeypair.publicKey;

  const [projectStatePda] = getProjectStatePDA(mintPubkey);
  const [protocolConfigPda] = getProtocolConfigPDA();

  // Map form values to instruction args
  const supplyMode = form.supplyMode === 'elastic'
    ? { elastic: {} }
    : { fixed: {} };

  const totalSupply = new BN(form.totalSupply || 1_000_000_000);
  const publicAllocationBps = form.publicAllocationBps || 6000; // 60%
  const creatorBps = form.creatorBps || 7000;
  const reserveBps = form.reserveBps || 2000;
  const sinkBps = form.sinkBps || 800;

  const [protocolTreasuryPda] = getProtocolTreasuryPDA();
  const creatorToken = await getAssociatedTokenAddress(mintPubkey, creatorPubkey);

  // create_project accounts per real IDL: mint, projectState, protocolTreasury,
  // protocolTreasuryToken (PDA), creatorToken, projectEscrowToken (PDA), protocolConfig,
  // creator, programs
  const tx = await program.methods
    .createProject(
      supplyMode,
      totalSupply,
      publicAllocationBps,
      creatorBps,
      reserveBps,
      sinkBps
    )
    .accounts({
      mint: mintPubkey,
      projectState: projectStatePda,
      protocolTreasury: protocolTreasuryPda,
      creatorToken,
      protocolConfig: protocolConfigPda,
      creator: creatorPubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([mintKeypair])
    .rpc();

  return {
    mint: mintPubkey.toBase58(),
    signature: tx,
    createdAt: new Date().toISOString(),
  };
}

// ─── Real on-chain: open_cycle ────────────────────────────────────────────────

/**
 * Open a new cycle on-chain.
 */
export async function openCycleOnChain({ connection, walletAdapter, mintAddress, params }) {
  const program = getProgram(connection, walletAdapter);
  const creatorPubkey = walletAdapter.publicKey;
  const mintPubkey = new PublicKey(mintAddress);

  const [projectStatePda] = getProjectStatePDA(mintPubkey);
  const projectState = await program.account.projectState.fetch(projectStatePda);
  const nextCycleIndex = projectState.currentCycle;
  const [cycleStatePda] = getCycleStatePDA(projectStatePda, nextCycleIndex);

  const curveType = params.curveType === 'step' ? { step: {} }
    : params.curveType === 'linear' ? { linear: {} }
    : { expLite: {} };

  const rightsWindowDuration = new BN(
    params.rightsRequired ? (params.rightsWindowHours || 24) * 3600 : 0
  );

  const tx = await program.methods
    .openCycle(
      curveType,
      new BN(params.supplyCap || params.allocation),
      solToLamports(params.startPrice),
      rightsWindowDuration,
      new BN(params.stepSize || 0),
      solToLamports(params.stepIncrement || 0),
      solToLamports(params.endPrice || 0),
      new BN(params.expK ? Math.floor(params.expK * 1000) : 0)
    )
    .accounts({
      cycleState: cycleStatePda,
      projectState: projectStatePda,
      creator: creatorPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, cycleIndex: nextCycleIndex };
}

// ─── Real on-chain: close_cycle ───────────────────────────────────────────────

/**
 * Close the active cycle early.
 */
export async function closeCycleOnChain({ connection, walletAdapter, mintAddress }) {
  const program = getProgram(connection, walletAdapter);
  const creatorPubkey = walletAdapter.publicKey;
  const mintPubkey = new PublicKey(mintAddress);

  const [projectStatePda] = getProjectStatePDA(mintPubkey);
  const projectState = await program.account.projectState.fetch(projectStatePda);
  const cycleIndex = projectState.currentCycle - 1;
  const [cycleStatePda] = getCycleStatePDA(projectStatePda, cycleIndex);

  const [reservePda] = getReservePDA(projectStatePda);

  // close_cycle accounts per real IDL: projectState, cycleState, reserve (PDA), creator, systemProgram
  const tx = await program.methods
    .closeCycle()
    .accounts({
      projectState: projectStatePda,
      cycleState: cycleStatePda,
      reserve: reservePda,
      creator: creatorPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: tx };
}
