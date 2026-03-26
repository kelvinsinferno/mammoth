# Mammoth

**A Rights-Based, Cycle-Driven Token Issuance Framework**

Mammoth is a Solana-native token issuance framework that lets builders raise capital multiple times without destroying trust, price, or upside asymmetry.

---

## What It Is

Mammoth occupies the gap between two broken extremes:

- **Meme launchpads** — massive asymmetry, exhausted in a single event, no repeatability
- **DAO funding platforms** — repeatable fundraising, but kill speculation and organic discovery

The insight: **markets don't hate dilution — they hate forced dilution.**

Mammoth turns future issuance from a threat into an opportunity.

---

## How It Works

Projects issue tokens through **discrete minting cycles**, not continuous emissions.

Each cycle has:
- A fixed token allocation
- A bounded bonding curve (Step, Linear, or Exp-Lite)
- Deterministic treasury routing
- A clear start and end

Before each new cycle:
- Existing holders receive pro-rata rights to participate
- Exercising rights preserves ownership
- Ignoring them results in voluntary dilution

Between cycles: no minting, free price discovery.

---

## Protocol Economics

- **2% transaction fee** on all trades executed through Mammoth
- **2% protocol stake** in each project (fixed at genesis for fixed-supply; per-cycle for elastic-supply)

No emissions. No governance overhead. No hidden taxes on external markets.

---

## Tech Stack

- **Chain:** Solana (SPL Token)
- **Frontend:** Next.js + Wallet Adapter + Jupiter SDK
- **UI:** Dark mode, pump.fun-familiar flow

---

## Current State

MVP — core UI prototype in active development.

Whitepaper available in `/docs`.

---

## License

MIT
