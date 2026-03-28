'use client';
import { useState } from 'react';

const SECTIONS = [
  {
    id: 'abstract',
    label: 'Abstract',
    content: `Crypto capital formation currently exists at two extremes.

On one end, meme-coin launchpads maximize attention, reflexivity, and upside asymmetry, but sacrifice longevity, discipline, and repeatability. On the other, principled funding platforms such as Juicebox enable transparent and repeatable fundraising, but suppress speculation, remove asymmetry, and fail to generate organic discovery or excitement.

This paper introduces Cycle-Based Rights Issuance — a token issuance framework that preserves the asymmetric, event-driven dynamics of meme markets while enabling repeatable, disciplined capital formation over time.

The system replaces continuous inflation and one-time launches with discrete minting cycles, bounded bonding curves, and rights-based anti-dilution, allowing projects to raise capital multiple times without structurally suppressing price.

Mammoth supports both fixed-supply and cycle-bounded elastic-supply issuance, with an optional, irreversible transition from elastic issuance to a final hard cap. Mammoth is designed first for Solana, where low fees and an active speculative culture enable granular participation and rapid experimentation.`,
  },
  {
    id: 'motivation',
    label: '1. Motivation',
    subsections: [
      {
        title: '1.1 The Meme Coin Problem',
        body: `Meme-coin launchpads succeed because they offer extreme upside asymmetry, immediate liquidity, cultural virality, and simple and legible tokenomics.

They fail because they exhaust attention in a single event, lack durable treasury discipline, incentivize short-term extraction, and cannot support repeat capital raises without collapsing trust or price.`,
      },
      {
        title: '1.2 The DAO Funding Problem',
        body: `Principled funding platforms succeed because they offer transparent capital flows, on-chain accountability, repeatable fundraising mechanisms, and structured governance primitives.

They fail because they remove asymmetry, rely on continuous dilution, suppress speculative energy, and lack organic discovery and excitement.`,
      },
      {
        title: '1.3 The Gap',
        body: `There is no dominant system that enables high-asymmetry early participation, repeatable structured capital formation, and voluntary rather than forced dilution.

Mammoth is designed to occupy this gap.`,
      },
    ],
  },
  {
    id: 'design',
    label: '2. Core Design Principles',
    content: `**Invariant:** All capital formation in Mammoth must occur through bounded, on-chain, event-based issuance. Continuous or implicit inflation is explicitly disallowed.

**Discrete Minting Cycles** — Tokens are issued only through bounded, event-based cycles.

**Rights-Based Anti-Dilution** — Existing holders are given the option — not the obligation — to preserve ownership in future issuance.

**Bounded Bonding Curves** — Each cycle uses a finite pricing function that terminates when allocation is exhausted.

**Free Market Between Cycles** — No minting occurs between cycles. Price discovery is unconstrained.

**Explicit Supply Commitments** — Issuance rules are enforced by code, not promises.

**Low-Friction Participation** — Small participants must be able to act economically rationally.`,
  },
  {
    id: 'overview',
    label: '3. System Overview',
    subsections: [
      {
        title: '3.1 Token Supply Modes',
        body: `Mammoth supports two issuance modes, selectable at token creation.

Fixed Supply (Default): Total supply defined at genesis. No inflation or emissions. All issuance occurs via pre-allocated cycles. Typical default is 1,000,000,000 tokens.

Elastic Supply (Advanced): Initial supply defined at genesis with no maximum initially set. New tokens may be minted only through cycles. Continuous emissions are disallowed. Rights-based participation is mandatory. Elastic supply allows creators to test market appetite before committing to final scarcity.`,
      },
      {
        title: '3.2 Optional Hard-Cap Commitment',
        body: `In elastic supply mode, creators may at any time set an irreversible hard cap on total supply. Once a cap is set, total supply becomes fixed, no further minting is possible, rights issuance ceases permanently, and the token behaves identically to a fixed-supply token.

This transition is one-way, on-chain, and irreversible.`,
      },
      {
        title: '3.3 Allocation Structure',
        body: `At creation, supply is divided into Public Allocation (issued through cycles) and Treasury Allocation (controlled by the creator). All other uses — team, advisors, reserves — are treasury concerns and are explicitly out of scope for Mammoth.`,
      },
      {
        title: '3.4 Cycles',
        body: `A Cycle is a discrete minting event defined by a token allocation, pricing function, rights snapshot, treasury routing, and termination condition.

Once a cycle ends, no additional tokens may be minted from that allocation, and the market trades freely until the next cycle. Cycle parameters are immutable once a cycle begins.`,
      },
      {
        title: '3.5 Cycle Completion and Termination',
        body: `Cycles are not guaranteed to fully exhaust their allocation. A cycle may remain open indefinitely until its allocation is sold or may be explicitly terminated by the creator.

If a cycle is terminated before exhaustion, no further minting may occur. Unminted tokens remain inaccessible and may only be reallocated to a future cycle. Cycles cannot be canceled, repriced, or retroactively modified once opened.`,
      },
    ],
  },
  {
    id: 'curves',
    label: '4. Bounded Bonding Curves',
    content: `Each cycle uses a bounded bonding curve that starts at a defined minimum price, increases according to a predefined function, and terminates when the cycle's allocation is sold.

Unlike infinite or continuous curves, price discovery occurs primarily between cycles, issuance does not permanently suppress upside, and cycles become discrete market events rather than background processes.`,
  },
  {
    id: 'rights',
    label: '5. Rights-Based Issuance',
    subsections: [
      {
        title: '5.1 The Dilution Problem',
        body: `Markets rationally price future issuance as inflation, often leading to pre-issuance sell-offs and structural price suppression.`,
      },
      {
        title: '5.2 Rights as the Solution',
        body: `Before a new cycle opens, a snapshot of existing holders is taken, holders receive pro-rata rights to participate, rights allow purchase up to a capped amount, and rights expire automatically if unused.

Rights are non-transferable, cycle-specific, and invalid after the associated cycle ends.

If a holder exercises their rights, ownership percentage is preserved. If they do not, dilution occurs by choice, not force.`,
      },
      {
        title: '5.3 Elastic Supply Requirement',
        body: `In elastic supply mode, rights-based issuance is mandatory for all cycles. Elastic minting without rights is explicitly disallowed.`,
      },
      {
        title: '5.4 Why This Works',
        body: `This mirrors equity rights offerings and converts future inflation into future opportunity, and forced dilution into optional participation.`,
      },
    ],
  },
  {
    id: 'asymmetry',
    label: '6. Cycle Progression and Asymmetry',
    subsections: [
      {
        title: '6.1 Asymmetry Through Time',
        body: `Mammoth does not enforce a single issuance pattern. It supports time-based asymmetry, allowing projects to decide how early advantage is expressed through price advantage, ownership concentration, or both. The protocol is intentionally neutral.`,
      },
      {
        title: '6.2 Front-Loaded vs. Back-Loaded Issuance',
        body: `Front-Loaded Issuance (Ownership Asymmetry): Larger early allocations declining over time. Example — Cycle 1: 400–500K tokens, Cycle 2: 100–200K tokens, Cycle 3: 50–100K tokens. Emphasizes early ownership dominance and declining dilution pressure.

Back-Loaded Issuance (Price Asymmetry): Smaller early allocations at lower prices, larger later allocations at higher prices. Emphasizes extreme early price asymmetry and gradual legitimacy building.`,
      },
      {
        title: '6.3 Progressive Reduction of Asymmetry',
        body: `Across all configurations, Mammoth supports a progression from high-risk, high-asymmetry early participation toward lower-risk, lower-asymmetry later participation. Asymmetry naturally declines as credibility is earned.`,
      },
      {
        title: '6.4 Design Neutrality',
        body: `Mammoth does not determine the "correct" issuance strategy. Poorly designed cycles are punished by the market; well-designed cycles compound trust over time.`,
      },
    ],
  },
  {
    id: 'treasury',
    label: '7. Treasury Mechanics',
    content: `Each cycle routes proceeds deterministically: a percentage to operating treasury, a percentage to reserve assets, and optionally a percentage to burn or sink.

Routing is on-chain, deterministic, and non-governed in the MVP. Treasury usage remains under creator control and is not governed or enforced by Mammoth.`,
  },
  {
    id: 'solana',
    label: '8. Why Solana First',
    content: `Solana is selected for the MVP because low fees enable rights-based participation, micro-allocations remain viable, speculative culture is active, and meme-market literacy already exists.`,
  },
  {
    id: 'mvp',
    label: '9. MVP Scope',
    content: `The MVP deliberately excludes governance frameworks, NFTs or passes, gamification layers, discovery feeds, and studio tooling. These exclusions minimize surface area and validate core issuance mechanics.

The MVP includes: fixed or elastic supply SPL token, cycle manager contract, rights-based issuance, bounded bonding curves, deterministic treasury routing, and optional hard-cap commitment.

Success is measured by completing at least two cycles, raising capital in both, and avoiding structural price collapse.`,
  },
  {
    id: 'risks',
    label: '10. Risks and Tradeoffs',
    content: `Poorly designed cycles can suppress price. Over-frequent issuance erodes asymmetry. Elastic supply introduces uncertainty. Rights mechanisms must remain simple. Creators may misuse cycles; participants may speculate irresponsibly.

These risks are mitigated by long gaps between cycles, meaningful progress between raises, conservative allocation sizing, and irreversible supply commitments.`,
  },
  {
    id: 'vision',
    label: '11. Vision Beyond MVP',
    content: `Once validated, Mammoth can support multi-project studios, NFT-based access layers, creator-specific configurations, EVM deployments, and richer discovery and signaling mechanisms.

Protocol Neutrality: Mammoth is an issuance framework, not a curator or guarantor. The protocol does not evaluate, endorse, or underwrite projects. All projects are subject to market discipline.

The long-term goal is not a launchpad, but a primitive for narrative-driven capital formation.`,
  },
  {
    id: 'economics',
    label: '12. Protocol Economics',
    subsections: [
      {
        title: '12.1 Design Goals',
        body: `Mammoth is designed to be sustainable without distorting creator incentives or undermining market dynamics. Protocol revenue must be simple, predictable, difficult to game, and aligned with long-term platform usage rather than short-term extraction.`,
      },
      {
        title: '12.2 Transaction Fees',
        body: `Mammoth charges a 2% transaction fee on all token trades executed through the Mammoth interface, including primary purchases during minting cycles and secondary buys and sells routed through the platform.

This fee applies symmetrically to buys and sells, is enforced at the interface level, and does not apply to external markets. Mammoth does not impose transfer taxes or extract value from off-platform activity.`,
      },
      {
        title: '12.3 Protocol Participation in Issuance',
        body: `In addition to transaction fees, Mammoth receives a 2% protocol stake in each token created using the framework.

Fixed Supply Tokens: 2% of total supply allocated at genesis, fixed and non-inflationary.
Elastic Supply Tokens: 2% of tokens minted per cycle, ceasing permanently once a hard cap is set.`,
      },
      {
        title: '12.4 Alignment and Incentives',
        body: `This model aligns incentives across all participants: creators retain control, participants avoid hidden dilution, and the protocol benefits only when usage is real.

Mammoth does not impose emissions, require governance to extract value, or interfere with cycle design or pricing.`,
      },
    ],
  },
  {
    id: 'conclusion',
    label: '13. Conclusion',
    content: `Mammoth proposes a middle path between chaos and control: preserving speculative energy, enabling repeat fundraising, and enforcing credibility through code.

If successful, Mammoth demonstrates that crypto does not need to choose between memes and mechanics — it can support both.`,
  },
];

export default function WhitepaperPage() {
  const [open, setOpen] = useState('abstract');

  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n\n').map((para, i) => {
      if (para.startsWith('**') && para.includes('**')) {
        const parts = para.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 14 }}>
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} style={{ color: '#22D3EE', fontWeight: 700 }}>{part}</strong>
                : part
            )}
          </p>
        );
      }
      return <p key={i} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 14 }}>{para}</p>;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Header */}
      <header style={{ background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--header-border)', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--header-shadow)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <img src="/mammoth-logo-dark.gif" alt="Mammoth" width={28} height={28} style={{ borderRadius: 6, objectFit: 'cover' }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mammoth</span>
          </a>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>/ Whitepaper</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }} className="learn-grid">

        {/* Sidebar TOC */}
        <div style={{ position: 'sticky', top: 76, height: 'fit-content' }} className="learn-sidebar">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>Contents</div>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setOpen(s.id)}
                style={{ width: '100%', background: open === s.id ? 'rgba(139,92,246,0.15)' : 'transparent', border: open === s.id ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent', borderRadius: 6, padding: '7px 10px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s', marginBottom: 2 }}
                onMouseEnter={e => { if (open !== s.id) e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; }}
                onMouseLeave={e => { if (open !== s.id) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: open === s.id ? '#22D3EE' : 'var(--text-dim)', fontWeight: open === s.id ? 700 : 400, lineHeight: 1.4, display: 'block' }}>{s.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, padding: '0 4px' }}>
            <a href="/learn" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#A78BFA'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>📖 Full Guide →</a>
            <a href="/risk" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#A78BFA'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>⚠️ Risk Disclosure →</a>
          </div>
        </div>

        {/* Main content */}
        <div>
          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>🦣</span>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, color: 'var(--text)', margin: 0 }}>Mammoth Whitepaper</h1>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              A Rights-Based, Cycle-Driven Token Issuance Framework<br />
              Bridging Meme-Market Asymmetry with Sustainable Capital Formation
            </div>
          </div>

          {/* Active section */}
          {SECTIONS.map(s => s.id === open && (
            <div key={s.id} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 24px', animation: 'fadeUp 0.2s ease' }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#22D3EE', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>{s.label}</h2>

              {s.content && renderContent(s.content)}

              {s.subsections && s.subsections.map((sub, i) => (
                <div key={i} style={{ marginBottom: 22 }}>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#A78BFA', marginBottom: 10 }}>{sub.title}</h3>
                  {renderContent(sub.body)}
                </div>
              ))}

              {/* Prev / Next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                {(() => {
                  const idx = SECTIONS.findIndex(x => x.id === open);
                  const prev = SECTIONS[idx - 1];
                  const next = SECTIONS[idx + 1];
                  return (<>
                    {prev
                      ? <button onClick={() => setOpen(prev.id)} style={{ background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer' }}>← {prev.label}</button>
                      : <div />
                    }
                    {next
                      ? <button onClick={() => setOpen(next.id)} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 7, padding: '8px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#A78BFA', cursor: 'pointer' }}>{next.label} →</button>
                      : <a href="/" style={{ background: '#FF9F1C', border: 'none', borderRadius: 7, padding: '8px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#000', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>GO TO APP →</a>
                    }
                  </>);
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
