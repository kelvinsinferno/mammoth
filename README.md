<div align="center">

<img src="public/mammoth-logo-dark.gif" alt="Mammoth Protocol" width="96" height="96" />

# Mammoth Protocol

**A rights-based, cycle-driven token issuance framework on Solana.**

Fills the gap between meme-coin launchpads (high excitement, no repeatability) and DAO funding platforms (repeatable but kill speculation). Mammoth lets projects raise capital multiple times without structurally suppressing price.

[![Live App](https://img.shields.io/badge/app-mammoth--protocol.vercel.app-8B5CF6?style=flat-square&logo=vercel)](https://mammoth-protocol.vercel.app)
[![Whitepaper](https://img.shields.io/badge/whitepaper-read%20now-22D3EE?style=flat-square)](https://mammoth-protocol.vercel.app/whitepaper)
[![Solana Devnet](https://img.shields.io/badge/network-Solana%20Devnet-9945FF?style=flat-square&logo=solana)](https://explorer.solana.com/address/DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31?cluster=devnet)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## The Problem

Crypto capital formation is stuck at two broken extremes:

| | Meme Launchpads | DAO Funding Platforms |
|---|---|---|
| **Asymmetry** | ✅ Extreme upside | ❌ Suppressed |
| **Repeatability** | ❌ One-shot only | ✅ Repeatable |
| **Speculation** | ✅ Organic | ❌ Killed |
| **Trust** | ❌ Burns fast | ✅ Transparent |
| **Price on re-raise** | ❌ Collapses | ❌ Never existed |

**The gap:** No system enables high-asymmetry early participation *and* repeatable, structured capital formation.

Mammoth occupies that gap.

---

## The Core Insight

> Markets don't hate dilution. They hate **forced** dilution.

By converting future issuance from a threat into an *opportunity* — via the rights mechanism — Mammoth enables repeat fundraising without the price-collapse dynamic that kills most second raises in crypto.

---

## How It Works

### 1 · Cycle-Based Rights Issuance

Tokens are only ever minted through discrete, bounded cycles — never through continuous emissions or hidden inflation. Each cycle is an on-chain event with fixed parameters, immutable once opened.

```
Cycle 1 opens → Rights Window (existing holders only, base price)
             → Rights Window expires → Cycle goes Active (bonding curve, public)
             → Allocation exhausted OR creator closes → Cycle ends
             → Free market trading until Cycle 2
```

### 2 · Rights-Based Anti-Dilution

Before each new cycle, a snapshot of existing holders is taken. Holders receive pro-rata rights to purchase at the cycle's launch price — preserving ownership percentage if they choose to act.

```
Holder owns 1% of supply
→ Gets rights to buy 1% of new cycle allocation at base price
→ Exercises rights → ownership maintained
→ Ignores rights → diluted by choice, not force
```

Rights are non-transferable, cycle-specific, and expire automatically. A rights announcement is not a sell signal — it's a participation offer.

### 3 · Bounded Bonding Curves

Three curve types, all finite:

| Curve | Behavior | Best For |
|---|---|---|
| **Step** | Price jumps at fixed intervals | Urgency, predictable entry points |
| **Linear** | Smooth continuous rise | Gradual, fair appreciation |
| **Exp-Lite** | Slow start, accelerating finish | Maximum early-buyer asymmetry |

Price discovery happens *between* cycles — not suppressed by background emissions.

### 4 · Supply Modes

**Fixed Supply** (default) — 1B tokens, all issuance through pre-allocated cycles. No inflation ever.

**Elastic Supply** (advanced) — No max supply until you set one. Rights-based issuance is mandatory. At any point, the creator can set an **irreversible hard cap** — locking total supply permanently.

### 5 · Treasury Routing

Every cycle routes proceeds deterministically on-chain:

```
Default: 70% → Creator treasury
         20% → Protocol reserve
         10% → Burn / sink
```

Fully configurable at cycle creation. Immutable once the cycle opens.

---

## Protocol Economics

| Fee | Amount | Applied To |
|---|---|---|
| Transaction fee | 2% | All trades via Mammoth interface |
| Protocol stake | 2% | Each token created (of supply) |

No governance required to extract value. No hidden emissions. No rug vectors built into the protocol layer.

---

## Program Architecture

**Devnet Program ID:** `DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31`

### Account Model

```
ProtocolConfig (global singleton)
└── admin, protocol treasury, fee BPS, default routing

ProjectState (per token)
└── SPL mint, creator, supply mode, hard cap, total minted, current cycle, treasury config

CycleState (per cycle per project)
└── curve type, supply cap, minted, base price
└── status FSM: Pending → RightsWindow → Active → Closed

HolderRights (per holder per cycle)
└── rights amount, exercised amount, expiry timestamp
```

### Instructions

| Instruction | Who | What |
|---|---|---|
| `initialize_protocol` | Admin | Sets global config, protocol treasury |
| `create_project` | Creator | Mints SPL token, creates ProjectState, reserves 2% protocol stake |
| `open_cycle` | Creator | Sets curve/cap/price, enters RightsWindow |
| `exercise_rights` | Holder | Buys allocation at base price during rights window |
| `buy_tokens` | Anyone | Bonding curve purchase during Active phase |
| `close_cycle` | Creator | Routes treasury, locks cycle |
| `set_hard_cap` | Creator | Elastic mode only — irreversible supply lock |

### Key Invariants (enforced on-chain)

- No floating point — ExpLite uses integer approximation
- Hard cap is irreversible — cannot be unset
- Freeze authority set to `null` at genesis
- Mint authority transfers to Cycle Manager PDA in same tx as genesis mint
- Cycle parameters are immutable once `open_cycle` is called
- Rights window blocks public buys until expiry
- `activate_cycle` is permissionless — anyone can call it once the timestamp passes

---

## Frontend

**Live:** [mammoth-protocol.vercel.app](https://mammoth-protocol.vercel.app)

Built with Next.js 14 (App Router), React 18, Anchor client, and Solana wallet adapter. Dark-first design. Mobile responsive down to 320px.

### Routes

| Route | Screen |
|---|---|
| `/` | Discovery — live projects, stats, ticker |
| `/token/[mint]` | Project detail — chart, cycle panel, buy |
| `/creator` | Creator dashboard — active tokens, drafts, cycles |
| `/creator/cycle/new` | Create cycle — curve builder, rights config, treasury editor |
| `/learn` | Protocol explainer + AI assistant |
| `/whitepaper` | Full technical whitepaper |
| `/terms` `/privacy` `/risk` | Legal |

### Wallet Support

- **Phantom** (primary)
- **Solflare**
- Solana Mobile Wallet Adapter (mobile)
- WalletConnect (via `@solana/wallet-adapter-wallets`)

### Tech Stack

```
Frontend      Next.js 14 · React 18 · App Router · JSX
Styling       CSS-in-JS (inline) · globals.css design tokens · no Tailwind
On-chain      @coral-xyz/anchor ^0.32 · @solana/web3.js ^1.98 · @solana/spl-token ^0.4
Wallets       @solana/wallet-adapter-react · Phantom · Solflare
Trading       Jupiter SDK (deeplink) for secondary market
Deploy        Vercel (frontend) · Solana Devnet → Mainnet (contracts)
```

---

## Repo Structure

```
mammoth/
├── app/                        # Next.js App Router pages
│   ├── page.jsx                # Discovery (/)
│   ├── creator/page.jsx        # Creator dashboard
│   ├── learn/page.jsx          # Protocol explainer
│   ├── whitepaper/page.jsx     # Technical whitepaper
│   ├── token/[mint]/           # Project detail (dynamic route)
│   └── terms|privacy|risk/     # Legal pages
│
├── views/                      # Full-page view components
│   ├── Homepage.jsx            # Discovery feed
│   ├── ProjectDetail.jsx       # Token page (active + closed cycle states)
│   ├── CycleDashboard.jsx      # Creator cycle management
│   └── LaunchWizard.jsx        # 3-step token launch modal
│
├── components/
│   ├── charts/PriceChart.jsx   # Recharts bonding curve visualizer
│   ├── modals/                 # OpenCycleConfirm, EndCycle
│   ├── ui/                     # ProjectCard, CycleBadge, Toast, Skeleton, Supernova
│   └── wallet/                 # WalletButton, WalletModal, AccountDropdown
│
├── lib/
│   ├── anchorClient.js         # All Anchor instructions + on-chain reads
│   ├── AppContext.jsx          # Global state (wallet, theme, toasts)
│   ├── curves.js               # Step / Linear / Exp-Lite math
│   ├── idl/mammoth_core.json   # Anchor IDL (Devnet)
│   └── data.js                 # Mock data (dev/demo)
│
└── contracts/mammoth_core/     # Anchor smart contract (separate repo path)
    ├── programs/mammoth_core/
    │   └── src/lib.rs          # Core program logic
    └── tests/mammoth_core.ts   # Integration tests
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Solana CLI (`sh -c "$(curl -sSfL https://release.solana.com/stable/install)"`)
- Anchor CLI (`cargo install --git https://github.com/coral-xyz/anchor avm --locked`)
- Phantom or Solflare wallet (browser extension)

### Frontend

```bash
git clone https://github.com/kelvinsinferno/mammoth.git
cd mammoth
npm install
npm run dev
# → http://localhost:3000
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_MAMMOTH_PROGRAM_ID=DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31
NEXT_PUBLIC_NETWORK=devnet
```

### Smart Contract (WSL / Linux)

```bash
cd contracts/mammoth_core
anchor build
anchor test        # runs against local validator
anchor deploy      # deploy to devnet (requires funded keypair)
```

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| **Whitepaper** | ✅ Done | Protocol design, rights mechanics, economics |
| **Frontend MVP** | ✅ Done | All 9 screens, wallet, mobile responsive |
| **Anchor Devnet** | ✅ Done | Core instructions deployed + IDL generated |
| **On-chain Wiring** | ✅ Done | Frontend fully wired to Devnet contract |
| **Jupiter Integration** | ✅ Done | Secondary trading via Jupiter deeplink |
| **Mainnet Deploy** | 🔜 Next | Audit → mainnet program deploy |
| **Discovery Feed** | 🔜 Planned | Real on-chain project indexing |
| **Governance Layer** | 🔮 Future | Protocol parameter voting |
| **EVM Port** | 🔮 Future | Framework generalized beyond Solana |

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--mammoth-orange` | `#FF9F1C` | Primary brand, CTAs |
| `--accent-purple` | `#8B5CF6` | Interactive, highlights |
| `--accent-cyan` | `#22D3EE` | Data, status indicators |
| `--accent-rose` | `#F43F5E` | Warnings, destructive |
| `--page-bg` | `#080c14` (dark) | Page background |
| Font (UI) | `Space Grotesk` | Headers, labels |
| Font (data) | `IBM Plex Mono` | Values, code, metadata |

Dark mode is default. Light mode supported via CSS variable swap.

---

## Links

| | |
|---|---|
| 🌐 **App** | [mammoth-protocol.vercel.app](https://mammoth-protocol.vercel.app) |
| 📄 **Whitepaper** | [mammoth-protocol.vercel.app/whitepaper](https://mammoth-protocol.vercel.app/whitepaper) |
| 🔍 **Program (Devnet)** | [Explorer →](https://explorer.solana.com/address/DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31?cluster=devnet) |
| 🐦 **X** | [@kelvinsinfernox](https://x.com/kelvinsinfernox) |
| 🏗️ **Studio** | [Kelvinsinferno Studio](https://kelvinsinferno.wixsite.com/kelvinsinferno-studi) |

---

## License

MIT © [Kelvinsinferno Studio](https://kelvinsinferno.wixsite.com/kelvinsinferno-studi)

*Mammoth is an issuance framework, not a curator or guarantor. The protocol does not evaluate, endorse, or underwrite any project launched using the framework. All projects are subject to market discipline.*

---

<div align="center">
<sub>Built by <a href="https://x.com/kelvinsinfernox">Kelvin</a> · Kelvinsinferno Studio · 2026</sub>
</div>
