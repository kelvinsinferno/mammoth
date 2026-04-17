// curves.js — UI curve math + on-chain instruction wrappers
//
// On-chain calls now delegate to @mammoth-protocol/sdk so the API stays in lockstep
// with the deployed contract (max_sol_cost slippage, rights reservation, etc.).
// Local computeStepCurve is kept for legacy UI quote display; new code should use
// computeBuyQuote from the SDK.

import { MammothClient, computeBuyQuote, solToLamports as sdkSolToLamports } from '@mammoth-protocol/sdk';
import { Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// ─── Curve math (client-side, kept for legacy UI components) ─────────────────

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

// Re-export the SDK's curve-aware quote for new code paths
export { computeBuyQuote };

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeClient(connection, walletAdapter) {
  // SDK's MammothClient expects { publicKey, signTransaction, signAllTransactions }
  // walletAdapter from web3 wallet adapter has exactly that shape, so pass through.
  return new MammothClient({ connection, wallet: walletAdapter });
}

// Compute a conservative slippage cap for a buy: 102% of the spot estimate
// (covers fee + small price drift). Caller can override with explicit maxSolCostLamports.
function computeSlippageCap(estimateLamports, slippageBps = 200) {
  const cap = Math.ceil(estimateLamports * (1 + slippageBps / 10000));
  return Math.max(cap, estimateLamports + 1);
}

// ─── Real on-chain: buy_tokens ───────────────────────────────────────────────

/**
 * Buy tokens from the active cycle on-chain.
 * Auto-computes a slippage cap unless maxSolCostLamports is provided.
 *
 * @param {object} opts
 * @param {Connection} opts.connection
 * @param {object} opts.walletAdapter — { publicKey, signTransaction, signAllTransactions }
 * @param {string} opts.mintAddress
 * @param {number|BN} opts.amount — token amount (base units)
 * @param {number} opts.solIn — SOL amount the user intends to spend (used for slippage cap if no explicit cap)
 * @param {number} [opts.maxSolCostLamports] — explicit slippage cap; defaults to ~2% above solIn
 * @param {string} opts.ticker
 */
export async function executeBuyTokens({ connection, walletAdapter, mintAddress, amount, solIn, maxSolCostLamports, ticker }) {
  const client = makeClient(connection, walletAdapter);
  // Use solIn × 1.02 as default cap, or explicit override
  const cap = maxSolCostLamports != null
    ? maxSolCostLamports
    : computeSlippageCap(sdkSolToLamports(solIn));
  const result = await client.buyTokens(mintAddress, amount, cap);
  return {
    signature: result.tx || result.signature,
    solIn,
    tokensOut: amount,
    ticker,
    ts: Date.now(),
  };
}

// ─── Real on-chain: exercise_rights ──────────────────────────────────────────

export async function executeExerciseRights({ connection, walletAdapter, mintAddress, amount, maxSolCostLamports, ticker }) {
  const client = makeClient(connection, walletAdapter);
  // Rights price is fixed at base_price; allow caller to override cap
  const cap = maxSolCostLamports != null
    ? maxSolCostLamports
    // Default to a generous cap — base_price is fixed during rights window so slippage is minimal
    : Number.MAX_SAFE_INTEGER;
  const result = await client.exerciseRights(mintAddress, amount, cap);
  return { signature: result.tx || result.signature, amount, ticker, ts: Date.now() };
}

// ─── Real on-chain: create_project ───────────────────────────────────────────

/**
 * Deploy a new project on-chain via create_project.
 * Generates a fresh mint keypair and includes the new reserve+sink+operator_type
 * accounts the v2 contract requires.
 */
export async function deployProject({ connection, walletAdapter, form }) {
  console.log('[mammoth deployProject] called with form:', form);
  const client = makeClient(connection, walletAdapter);
  const mintKeypair = Keypair.generate();

  const supplyMode = form.supplyMode === 'elastic' ? 'elastic' : 'fixed';
  const operatorType = form.operatorType || 'human'; // 'human' | 'ai_assisted' | 'ai_autonomous'

  // Anchor serializes i64 launchAt via BN.toTwos; a plain JS number throws
  // "t.toTwos is not a function". Coerce here so callers can pass either.
  const launchAt = form.launchAt == null
    ? null
    : (BN.isBN(form.launchAt) ? form.launchAt : new BN(form.launchAt));

  console.log('[mammoth deployProject] calling SDK createProject, mint:', mintKeypair.publicKey.toBase58());
  const result = await client.createProject({
    supplyMode,
    totalSupply: form.totalSupply || 1_000_000_000,
    publicAllocationBps: form.publicAllocationBps || 6000,
    creatorBps: form.creatorBps || 7000,
    reserveBps: form.reserveBps || 2000,
    sinkBps: form.sinkBps || 1000,
    launchAt,
    operatorType,
    mintKeypair, // SDK accepts a pre-generated keypair so we know the mint up-front
  });

  return {
    mint: mintKeypair.publicKey.toBase58(),
    signature: result.tx || result.signature,
    createdAt: new Date().toISOString(),
  };
}

// ─── Real on-chain: open_cycle ───────────────────────────────────────────────

export async function openCycleOnChain({ connection, walletAdapter, mintAddress, params }) {
  const client = makeClient(connection, walletAdapter);
  const curveType = params.curveType === 'step' ? 'step'
    : params.curveType === 'linear' ? 'linear'
    : 'expLite';
  const rightsWindowDuration = params.rightsRequired ? (params.rightsWindowHours || 24) * 3600 : 60;

  const result = await client.openCycle(mintAddress, {
    curveType,
    supplyCap: params.supplyCap || params.allocation,
    startPrice: params.startPrice,
    rightsWindowDuration,
    stepSize: params.stepSize || 0,
    stepIncrement: params.stepIncrement || 0,
    endPrice: params.endPrice || 0,
    growthFactorK: params.expK ? Math.floor(params.expK * 1000) : 0,
  });
  return { signature: result.tx || result.signature, cycleIndex: result.cycleIndex };
}

// ─── Real on-chain: close_cycle ──────────────────────────────────────────────

export async function closeCycleOnChain({ connection, walletAdapter, mintAddress }) {
  const client = makeClient(connection, walletAdapter);
  const result = await client.closeCycle(mintAddress);
  return { signature: result.tx || result.signature };
}
