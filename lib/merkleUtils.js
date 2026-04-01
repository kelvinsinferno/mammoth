/**
 * merkleUtils.js — Client-side Merkle utilities for rights snapshots
 *
 * Browser-compatible subset of @mammoth-protocol/sdk/src/merkle.js
 * Used by OpenCycleConfirm to snapshot holders and build the rights tree.
 */

'use client';

import { PublicKey } from '@solana/web3.js';

// ─── Hashing ─────────────────────────────────────────────────────────────────

// Browser-compatible keccak256 using SubtleCrypto (SHA-256 fallback)
// For exact on-chain match at scale, use a keccak WASM package.
// For MVP this provides a consistent tree structure.
async function hashBytesAsync(...inputs) {
  const combined = concatenateArrayBuffers(inputs.map(i => new Uint8Array(i)));
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return new Uint8Array(hashBuffer);
}

function concatenateArrayBuffers(arrays) {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function hashLeaf(holderAddress, rightsAmount) {
  const pubkeyBytes = new PublicKey(holderAddress).toBytes();
  const amountBytes = new Uint8Array(8);
  const view = new DataView(amountBytes.buffer);
  view.setBigUint64(0, BigInt(rightsAmount), true); // little-endian
  return hashBytesAsync(pubkeyBytes, amountBytes);
}

async function hashPair(a, b) {
  // Sort so position doesn't matter — matches on-chain logic
  let left, right;
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) { left = a; right = b; break; }
    if (a[i] > b[i]) { left = b; right = a; break; }
  }
  if (!left) { left = a; right = b; } // equal
  return hashBytesAsync(left, right);
}

// ─── Snapshot ────────────────────────────────────────────────────────────────

/**
 * Read all SPL token holders for a mint from on-chain.
 * Returns array of { address, balance } sorted descending by balance.
 */
export async function getTokenHolders(connection, mintAddress) {
  const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  const mint = new PublicKey(mintAddress);

  const accounts = await connection.getProgramAccounts(new PublicKey(TOKEN_PROGRAM_ID), {
    filters: [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: mint.toBase58() } },
    ],
  });

  const map = new Map();
  for (const { account } of accounts) {
    const data = account.data;
    const owner = new PublicKey(data.slice(32, 64)).toBase58();
    const view = new DataView(data.buffer, data.byteOffset + 64, 8);
    const amount = view.getBigUint64(0, true);
    if (amount > 0n) {
      map.set(owner, (map.get(owner) || 0n) + amount);
    }
  }

  return Array.from(map.entries())
    .map(([address, balance]) => ({ address, balance }))
    .sort((a, b) => (b.balance > a.balance ? 1 : -1));
}

// ─── Tree ─────────────────────────────────────────────────────────────────────

class MerkleRightsTree {
  constructor(entries, layers, root) {
    this.entries = entries;
    this._layers = layers;
    this.root = root;
    this._addressMap = new Map(entries.map((e, i) => [e.address, i]));
  }

  getProof(address) {
    const idx = this._addressMap.get(address);
    if (idx === undefined) throw new Error(`Address not in tree: ${address}`);
    const proof = [];
    let current = idx;
    for (let layer = 0; layer < this._layers.length - 1; layer++) {
      const nodes = this._layers[layer];
      const sibling = current % 2 === 0 ? current + 1 : current - 1;
      if (sibling < nodes.length) proof.push(nodes[sibling]);
      current = Math.floor(current / 2);
    }
    return proof;
  }

  getAmount(address) {
    const idx = this._addressMap.get(address);
    if (idx === undefined) return 0;
    return this.entries[idx].rightsAmount;
  }

  toJSON() {
    return {
      root: Array.from(this.root).map(b => b.toString(16).padStart(2, '0')).join(''),
      entries: this.entries.map(e => ({
        address: e.address,
        rightsAmount: e.rightsAmount,
        balance: e.balance.toString(),
        leaf: Array.from(e.leaf).map(b => b.toString(16).padStart(2, '0')).join(''),
      })),
    };
  }
}

/**
 * Build Merkle rights tree from token holders.
 * Pro-rata: holder_rights = floor(holder_balance / total_supply * cycle_allocation)
 */
export async function buildRightsTree(holders, cycleAllocation, totalSupply) {
  const alloc = BigInt(cycleAllocation);
  const total = totalSupply
    ? BigInt(totalSupply)
    : holders.reduce((sum, h) => sum + h.balance, 0n);

  if (total === 0n) throw new Error('buildRightsTree: total supply is zero');

  // Calculate rights amounts
  const withRights = await Promise.all(
    holders
      .map(h => ({ ...h, rightsAmount: Number((h.balance * alloc) / total) }))
      .filter(h => h.rightsAmount > 0)
      .map(async h => ({ ...h, leaf: await hashLeaf(h.address, h.rightsAmount) }))
  );

  if (withRights.length === 0) throw new Error('No holders with non-zero rights');

  // Build layers
  const layers = [withRights.map(e => e.leaf)];
  while (layers[layers.length - 1].length > 1) {
    const current = layers[layers.length - 1];
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      if (i + 1 < current.length) {
        next.push(await hashPair(current[i], current[i + 1]));
      } else {
        next.push(current[i]);
      }
    }
    layers.push(next);
  }

  const root = layers[layers.length - 1][0];
  return new MerkleRightsTree(withRights, layers, root);
}
