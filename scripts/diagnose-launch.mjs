#!/usr/bin/env node
/**
 * diagnose-launch.mjs — end-to-end diagnostic for Mammoth token launch on devnet.
 *
 * Runs the exact same flow the frontend uses (createProject), but headless,
 * with verbose logging so we can see exactly where/why it fails.
 *
 *   node scripts/diagnose-launch.mjs
 *
 * Optional env:
 *   KEYPAIR_PATH   path to a funded devnet keypair json (default: ephemeral + airdrop)
 *   RPC_URL        devnet rpc (default: https://api.devnet.solana.com)
 *   PROGRAM_ID     override program id
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Program, AnchorProvider, BN, Wallet } from '@coral-xyz/anchor';
import {
  Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync,
} from '@solana/spl-token';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IDL = JSON.parse(readFileSync(resolve(__dirname, '../lib/idl/mammoth_core.json'), 'utf8'));

const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || IDL.address);

const log = (...a) => console.log('[diag]', ...a);
const ok = (m) => console.log('  \x1b[32m✓\x1b[0m', m);
const fail = (m, e) => { console.log('  \x1b[31m✗\x1b[0m', m); if (e) console.log('    →', e.message || e); };

// ─── PDAs (mirror anchorClient.js) ───
const pdaProtocolConfig = () =>
  PublicKey.findProgramAddressSync([Buffer.from('protocol_config')], PROGRAM_ID)[0];
const pdaProtocolTreasury = () =>
  PublicKey.findProgramAddressSync([Buffer.from('protocol_treasury')], PROGRAM_ID)[0];
const pdaProjectState = (mint) =>
  PublicKey.findProgramAddressSync([Buffer.from('project'), mint.toBuffer()], PROGRAM_ID)[0];

async function main() {
  log('RPC     :', RPC_URL);
  log('Program :', PROGRAM_ID.toBase58());

  const connection = new Connection(RPC_URL, 'confirmed');

  // Step 0 — RPC reachable + program deployed
  console.log('\n[0] RPC + program deployment');
  try {
    const { 'feature-set': fs } = await connection.getVersion();
    ok(`RPC reachable (feature-set ${fs})`);
  } catch (e) { fail('RPC not reachable', e); process.exit(1); }
  try {
    const info = await connection.getAccountInfo(PROGRAM_ID);
    if (!info) { fail('program account not found — wrong program id or not deployed'); process.exit(1); }
    if (!info.executable) { fail('program account exists but is not executable'); process.exit(1); }
    ok(`program deployed (${info.data.length} bytes, owner ${info.owner.toBase58()})`);
  } catch (e) { fail('failed to fetch program account', e); process.exit(1); }

  // Step 1 — protocol_config + protocol_treasury initialized?
  console.log('\n[1] Protocol initialization state');
  const protocolConfig = pdaProtocolConfig();
  const protocolTreasury = pdaProtocolTreasury();
  log('protocol_config  PDA:', protocolConfig.toBase58());
  log('protocol_treasury PDA:', protocolTreasury.toBase58());

  const cfgInfo = await connection.getAccountInfo(protocolConfig);
  const treasInfo = await connection.getAccountInfo(protocolTreasury);

  if (!cfgInfo) {
    fail('protocol_config NOT initialized on devnet');
    console.log('\n\x1b[33m>>> ROOT CAUSE LIKELY FOUND <<<\x1b[0m');
    console.log('    createProject requires protocol_config to exist.');
    console.log('    An admin must call initialize_protocol() once before anyone can launch a token.');
    console.log('    This cannot be done from the frontend — it is a one-time admin setup call.\n');
    process.exit(2);
  }
  ok('protocol_config exists');
  if (!treasInfo) fail('protocol_treasury NOT initialized (but config is — partial init?)');
  else ok('protocol_treasury exists');

  // Step 2 — funded keypair
  console.log('\n[2] Funding test wallet');
  let payer;
  if (process.env.KEYPAIR_PATH) {
    payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(process.env.KEYPAIR_PATH))));
    ok(`loaded keypair ${payer.publicKey.toBase58()}`);
  } else {
    payer = Keypair.generate();
    log('ephemeral keypair:', payer.publicKey.toBase58());
    try {
      const sig = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, 'confirmed');
      ok('airdropped 2 SOL');
    } catch (e) {
      fail('airdrop failed — devnet faucet often rate-limits. Set KEYPAIR_PATH to a funded keypair.', e);
      process.exit(1);
    }
  }
  const bal = await connection.getBalance(payer.publicKey);
  log(`balance: ${(bal / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  if (bal < 0.5 * LAMPORTS_PER_SOL) { fail('balance < 0.5 SOL — top up'); process.exit(1); }

  // Step 3 — build Anchor program
  console.log('\n[3] Build Anchor program client');
  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed', preflightCommitment: 'confirmed' });
  let program;
  try {
    program = new Program(IDL, provider);
    ok('program instance created');
  } catch (e) { fail('Program constructor threw', e); process.exit(1); }

  // Step 4 — createProject
  console.log('\n[4] createProject() simulation + send');
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  const projectState = pdaProjectState(mint);
  const protocolTreasuryToken = getAssociatedTokenAddressSync(mint, protocolTreasury, true);
  const creatorToken = getAssociatedTokenAddressSync(mint, payer.publicKey, false);
  const projectEscrowToken = getAssociatedTokenAddressSync(mint, projectState, true);

  log('mint:', mint.toBase58());
  log('project_state:', projectState.toBase58());

  const params = {
    supplyMode: { fixed: {} },
    totalSupply: new BN('1000000000000000'), // 1B * 10^6
    publicAllocationBps: 8000,
    creatorBps: 7000,
    reserveBps: 2000,
    sinkBps: 1000,
    launchAt: null,
  };
  log('params:', JSON.stringify({
    supplyMode: Object.keys(params.supplyMode)[0],
    totalSupply: params.totalSupply.toString(),
    publicAllocationBps: params.publicAllocationBps,
    splits: [params.creatorBps, params.reserveBps, params.sinkBps],
    splitSum: params.creatorBps + params.reserveBps + params.sinkBps,
    launchAt: params.launchAt,
  }));

  const method = program.methods.createProject(
    params.supplyMode,
    params.totalSupply,
    params.publicAllocationBps,
    params.creatorBps,
    params.reserveBps,
    params.sinkBps,
    params.launchAt,
    { human: {} },  // operatorType
  ).accounts({
    mint,
    creator: payer.publicKey,
  }).signers([mintKeypair]);

  try {
    const ix = await method.instruction();
    ok(`instruction built (${ix.keys.length} keys)`);
    const ixDef = IDL.instructions.find(i=>i.name==='create_project').accounts;
    ix.keys.forEach((k, i) => console.log(`   [${i}] ${ixDef[i].name.padEnd(28)} ${k.pubkey.toBase58()} s=${k.isSigner} w=${k.isWritable}`));
  } catch (e) {
    fail('instruction() build failed', e);
    process.exit(3);
  }

  // send
  try {
    const sig = await method.rpc({ commitment: 'confirmed' });
    ok(`createProject tx confirmed: ${sig}`);
    console.log(`    https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  } catch (e) {
    fail('rpc send failed after successful simulation — investigate');
    console.log(e.message || e);
    if (e.logs) e.logs.forEach(l => console.log('   ', l));
    process.exit(4);
  }

  console.log('\n\x1b[32mAll steps passed — launch works end-to-end from Node.\x1b[0m');
  console.log('If the UI still fails, the issue is in the frontend (wallet adapter, env vars, or input validation).');
}

main().catch((e) => { console.error('[diag] fatal:', e); process.exit(10); });
