'use client';
import { useState } from 'react';
import BrandMark from '../../components/BrandMark';

const SECTIONS = [
  {
    id: 'abstract',
    number: null,
    title: 'Abstract',
    content: `Crypto capital formation currently exists at two extremes. On one end, meme-coin launchpads maximize attention, reflexivity, and upside asymmetry, but sacrifice longevity, discipline, and repeatability. On the other, principled funding platforms enable transparent and repeatable fundraising, but suppress speculation, remove asymmetry, and fail to generate organic discovery or excitement.

This paper introduces Cycle-Based Rights Issuance — a token issuance framework that preserves the asymmetric, event-driven dynamics of meme markets while enabling repeatable, disciplined capital formation over time.

The system replaces continuous inflation and one-time launches with discrete minting cycles, bounded bonding curves, and rights-based anti-dilution, allowing projects to raise capital multiple times without structurally suppressing price.

Mammoth supports both fixed-supply and cycle-bounded elastic-supply issuance, with an optional, irreversible transition from elastic issuance to a final hard cap. This enables early-stage experimentation while preserving the ability to make credible long-term scarcity commitments.

Mammoth is designed first for Solana, where low fees and an active speculative culture enable granular participation and rapid experimentation.`,
  },
  {
    id: 'motivation',
    number: '1',
    title: 'Motivation',
    subsections: [
      {
        number: '1.1',
        title: 'The Meme Coin Problem',
        content: `Meme-coin launchpads succeed because they offer extreme upside asymmetry (1000× narratives), immediate liquidity, cultural virality, and simple and legible tokenomics.

They fail because they exhaust attention in a single event, lack durable treasury discipline, incentivize short-term extraction, and cannot support repeat capital raises without collapsing trust or price.`,
      },
      {
        number: '1.2',
        title: 'The DAO Funding Problem',
        content: `Principled funding platforms succeed because they offer transparent capital flows, on-chain accountability, repeatable fundraising mechanisms, and structured governance primitives.

They fail because they remove asymmetry, rely on continuous dilution, suppress speculative energy, and lack organic discovery and excitement.`,
      },
      {
        number: '1.3',
        title: 'The Gap',
        content: `There is no dominant system that enables high-asymmetry early participation, repeatable structured capital formation, and voluntary rather than forced dilution. Mammoth is designed to occupy this gap.`,
      },
    ],
  },
  {
    id: 'principles',
    number: '2',
    title: 'Core Design Principles',
    content: `Invariant: All capital formation in Mammoth must occur through bounded, on-chain, event-based issuance. Continuous or implicit inflation is explicitly disallowed.

Discrete Minting Cycles — Tokens are issued only through bounded, event-based cycles.

Rights-Based Anti-Dilution — Existing holders are given the option — not the obligation — to preserve ownership in future issuance.

Bounded Bonding Curves — Each cycle uses a finite pricing function that terminates when allocation is exhausted.

Free Market Between Cycles — No minting occurs between cycles. Price discovery is unconstrained.

Explicit Supply Commitments — Issuance rules are enforced by code, not promises.

Low-Friction Participation — Small participants must be able to act economically rationally.`,
  },
  {
    id: 'system',
    number: '3',
    title: 'System Overview',
    subsections: [
      {
        number: '3.1',
        title: 'Token Supply Modes',
        content: `Mammoth supports two issuance modes, selectable at token creation.

Fixed Supply (Default): Total supply defined at genesis, no inflation or emissions, all issuance occurs via pre-allocated cycles. Typical default supply is 1,000,000,000 tokens.

Elastic Supply (Advanced): Initial supply defined at genesis, no maximum supply initially set, new tokens may be minted only through cycles, continuous emissions are disallowed, rights-based participation is mandatory.

Elastic supply allows creators to test market appetite before committing to final scarcity.`,
      },
      {
        number: '3.2',
        title: 'Optional Hard-Cap Commitment',
        content: `In elastic supply mode, creators may at any time set an irreversible hard cap on total supply. Once a cap is set, total supply becomes fixed, no further minting is possible, rights issuance ceases permanently, and the token behaves identically to a fixed-supply token.

This transition is one-way, on-chain, and irreversible.`,
      },
      {
        number: '3.3',
        title: 'Allocation Structure',
        content: `At creation, supply is divided into Public Allocation (issued through cycles) and Treasury Allocation (controlled by the creator). All other uses such as team, advisors, and reserves are treasury concerns and are explicitly out of scope for Mammoth.`,
      },
      {
        number: '3.4',
        title: 'Cycles',
        content: `A Cycle is a discrete minting event defined by token allocation, pricing function, rights snapshot, treasury routing, and termination condition.

Once a cycle ends, no additional tokens may be minted from that allocation, and the market trades freely until the next cycle. Cycle parameters are immutable once a cycle begins.`,
      },
      {
        number: '3.5',
        title: 'Cycle Completion and Termination',
        content: `Cycles are not guaranteed to fully exhaust their allocation. A cycle may remain open indefinitely until its allocation is sold, or may be explicitly terminated by the creator.

If a cycle is terminated before exhaustion, no further minting may occur. Unminted tokens remain inaccessible and may only be reallocated to a future cycle under the same issuance constraints. Cycles cannot be canceled, repriced, or retroactively modified once opened.`,
      },
    ],
  },
  {
    id: 'curves',
    number: '4',
    title: 'Bounded Bonding Curves',
    content: `Each cycle uses a bounded bonding curve that starts at a defined minimum price, increases according to a predefined function, and terminates when the cycle's allocation is sold.

Unlike infinite or continuous curves, price discovery occurs primarily between cycles, issuance does not permanently suppress upside, and cycles become discrete market events rather than background processes.

Mammoth supports three curve types:

Step Curve: Price increases in fixed jumps. Every N tokens sold, the price steps up by a defined increment. Buyers know exactly when the next price increase hits, creating urgency without surprise.

Linear Curve: Price rises smoothly and continuously with every token sold. No sudden jumps — predictable and gradual appreciation.

Exp-Lite Curve: An exponential-style curve using integer math for on-chain safety. Price rises slowly at first then accelerates as supply fills. Maximum asymmetry for early buyers.`,
  },
  {
    id: 'rights',
    number: '5',
    title: 'Rights-Based Issuance',
    highlight: true,
    subsections: [
      {
        number: '5.1',
        title: 'The Dilution Problem',
        content: `Markets rationally price future issuance as inflation, often leading to pre-issuance sell-offs and structural price suppression. Any signal that new tokens will be minted creates anticipatory selling. The result is a cycle where repeat fundraising becomes self-defeating — the announcement of a new raise suppresses the very price needed to make the raise meaningful.`,
      },
      {
        number: '5.2',
        title: 'Rights as the Solution',
        content: `Before a new cycle opens, a snapshot of existing holders is taken, holders receive pro-rata rights to participate at the launch price, rights allow purchase up to a capped amount, and rights expire automatically if unused.

Rights are non-transferable, cycle-specific, and invalid after the associated cycle ends.

If a holder exercises their rights, ownership percentage is preserved or nearly preserved. If they do not, dilution occurs by choice, not force.

Rights are derived from an end-of-cycle snapshot and are scoped exclusively to the subsequent cycle. They are non-transferable, non-fungible in effect, and expire automatically when the associated cycle ends.`,
      },
      {
        number: '5.3',
        title: 'Rights Allocation Mechanics',
        content: `Rights are allocated proportionally based on a holder's token balance at the time the cycle opens, measured as a fraction of total circulating supply.

If a holder controls 1% of circulating supply at snapshot time, they receive rights to purchase up to 1% of the new cycle's total allocation at the cycle's base (launch) price.

The snapshot is taken at cycle open. Token transfers after the snapshot do not affect rights entitlements for that cycle. Rights amounts are set by the creator via the create_holder_rights instruction during the rights window, and are enforced immutably by the smart contract.

Rights amount per holder = (holder balance / total supply) × cycle allocation`,
      },
      {
        number: '5.4',
        title: 'The Rights Window',
        content: `When a creator opens a new cycle, the cycle enters a Rights Window — a time-bounded period during which only rights holders may transact at the base price.

The duration of the rights window is set by the creator at cycle open (in seconds) and encoded immutably in the contract. During this window, public buying is blocked. Only holders with allocated rights may exercise them.

Once the rights window expires, anyone may call activate_cycle to transition the cycle from RightsWindow to Active status. This call is permissionless — any wallet may trigger it once the timestamp has passed. At this point public buying via the bonding curve opens.

Rights window durations are creator-configurable but should be long enough to allow holders to act (typically 24–72 hours).`,
      },
      {
        number: '5.5',
        title: 'Exercising Rights',
        content: `During the rights window, a rights holder may exercise some or all of their allocated rights by submitting a transaction to the exercise_rights instruction.

The transaction:
1. Validates the holder has available rights (rights_amount − exercised_amount ≥ requested_amount)
2. Validates the rights window has not expired
3. Transfers SOL from the holder to the cycle at the base price (base_price × amount)
4. Transfers tokens from the project escrow to the holder's wallet
5. Updates the holder's exercised_amount in the HolderRights account

Partial exercises are allowed. A holder may exercise rights in multiple transactions as long as the window is open and their allocation is not exhausted.`,
      },
      {
        number: '5.6',
        title: 'Rights Expiry',
        content: `When the rights window expires, unexercised rights lapse permanently. There is no extension, recovery, or rollover mechanism. Expired rights cannot be reinstated by the creator or the protocol.

The tokens that would have been allocated to unexercised rights remain in the project escrow and become available to public buyers once the cycle is activated.

This creates a natural incentive for holders to monitor active cycles and act within the window. Platforms integrating Mammoth should surface rights window status prominently and notify holders before expiry.`,
      },
      {
        number: '5.7',
        title: 'Elastic Supply Requirement',
        content: `In elastic supply mode, rights-based issuance is mandatory for all cycles. Elastic minting without rights is explicitly disallowed by the protocol.

This requirement exists because elastic supply tokens have no hard scarcity guarantee. The rights mechanism is the primary protection against unchecked dilution for elastic supply holders.`,
      },
      {
        number: '5.8',
        title: 'Why This Works',
        content: `This mirrors equity rights offerings and converts future inflation into future opportunity, and forced dilution into optional participation.

The market impact is significant: a rights announcement is not a dilution event — it is a participation offer. Holders who understand the system treat it as an opportunity to maintain position at the base price, not a threat to sell ahead of.

This structural difference is what allows Mammoth to support repeat fundraising without the price-collapse dynamic that kills most repeat-raise attempts in crypto.`,
      },
    ],
  },
  {
    id: 'progression',
    number: '6',
    title: 'Cycle Progression and Asymmetry',
    subsections: [
      {
        number: '6.1',
        title: 'Asymmetry Through Time',
        content: `Mammoth does not enforce a single issuance pattern. Instead, it supports time-based asymmetry, allowing projects to decide how early advantage is expressed through price advantage, ownership concentration, or both. The protocol is intentionally neutral.`,
      },
      {
        number: '6.2',
        title: 'Front-Loaded vs. Back-Loaded Issuance',
        content: `Front-Loaded Issuance (Ownership Asymmetry): Larger early allocations, declining over time. Example: Cycle 1 at 400–500k tokens, Cycle 2 at 100–200k, Cycle 3 at 50–100k. This emphasizes early ownership dominance and declining dilution pressure.

Back-Loaded Issuance (Price Asymmetry): Smaller early allocations at lower prices, larger later allocations at higher prices. This emphasizes extreme early price asymmetry and gradual legitimacy building.`,
      },
      {
        number: '6.3',
        title: 'Rights Across Models',
        content: `Regardless of issuance shape, rights are issued before new cycles, exercising preserves position, and non-participation results in voluntary dilution.`,
      },
    ],
  },
  {
    id: 'treasury',
    number: '7',
    title: 'Treasury Mechanics',
    content: `Each cycle routes proceeds deterministically: a percentage to operating treasury, a percentage to reserve asset, and an optional percentage to burn or sink. Routing is on-chain, deterministic, and non-governed in the MVP.

Default routing is 70% creator / 20% reserve / 10% sink. Creators may configure custom routing at cycle creation, subject to the constraint that all percentages sum to 100%. Treasury usage remains under creator control and is not governed or enforced by Mammoth.`,
  },
  {
    id: 'protocol-economics',
    number: '8',
    title: 'Protocol Economics',
    subsections: [
      {
        number: '8.1',
        title: 'Transaction Fees',
        content: `Mammoth charges a 2% transaction fee on all token trades executed through the Mammoth interface, including primary purchases during minting cycles and secondary buys and sells routed through the platform.

This fee applies symmetrically to buys and sells, is enforced at the interface level, and does not apply to external markets. Mammoth does not impose transfer taxes or extract value from off-platform activity.`,
      },
      {
        number: '8.2',
        title: 'Protocol Participation in Issuance',
        content: `Mammoth receives a 2% protocol stake in each token created using the framework.

Fixed Supply Tokens: 2% of total supply allocated at genesis, fixed and non-inflationary.

Elastic Supply Tokens: 2% of tokens minted per cycle, issuance ceases permanently once a hard cap is set.`,
      },
      {
        number: '8.3',
        title: 'Alignment and Incentives',
        content: `This model aligns incentives across all participants: creators retain control, participants avoid hidden dilution, and the protocol benefits only when usage is real. Mammoth does not impose emissions, require governance to extract value, or interfere with cycle design or pricing.`,
      },
    ],
  },
  {
    id: 'risks',
    number: '9',
    title: 'Risks and Tradeoffs',
    content: `Poorly designed cycles can suppress price. Over-frequent issuance erodes asymmetry. Elastic supply introduces uncertainty. Rights mechanisms must remain simple. Creators may misuse cycles; participants may speculate irresponsibly.

These risks are mitigated by long gaps between cycles, meaningful progress between raises, conservative allocation sizing, and irreversible supply commitments.

Mammoth does not protect bad projects. It makes them fail cleanly and early, rather than slowly and expensively.`,
  },
  {
    id: 'vision',
    number: '10',
    title: 'Vision Beyond MVP',
    content: `Once validated, Mammoth can support multi-project studios, NFT-based access layers, creator-specific configurations, EVM deployments, and richer discovery and signaling mechanisms.

Protocol Neutrality: Mammoth is an issuance framework, not a curator or guarantor. The protocol does not evaluate, endorse, or underwrite projects launched using the framework. All projects are subject to market discipline.

The long-term goal is not a launchpad, but a primitive for narrative-driven capital formation.`,
  },
  {
    id: 'conclusion',
    number: '11',
    title: 'Conclusion',
    content: `Mammoth proposes a middle path between chaos and control: preserving speculative energy, enabling repeat fundraising, and enforcing credibility through code.

The core insight is that markets don't hate dilution — they hate forced dilution. By converting future issuance from a threat into an opportunity through the rights mechanism, Mammoth enables a new class of crypto-native capital formation that was previously impossible.

If successful, Mammoth demonstrates that crypto does not need to choose between memes and mechanics. It can support both.`,
  },
];

export default function WhitepaperPage() {
  const [openSection, setOpenSection] = useState('abstract');
  const [openSub, setOpenSub] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
    setOpenSub(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Header */}
      <header style={{ background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--header-border)', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--header-shadow)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <BrandMark size={28} alt="Mammoth" rounded={6} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mammoth</span>
          </a>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>/ Whitepaper</span>
          <a href="/Mammoth.pdf" download="Mammoth.pdf" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, padding: '5px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#A78BFA', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>
            ↓ PDF
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 80px' }}>
        {/* Title block */}
        <div style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 28 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#A78BFA', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Technical Whitepaper</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 32, color: 'var(--text)', margin: '0 0 10px', lineHeight: 1.2 }}>Mammoth Protocol</h1>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: 'var(--text-secondary)', marginBottom: 14 }}>A Rights-Based, Cycle-Driven Token Issuance Framework<br/>Bridging Meme-Market Asymmetry with Sustainable Capital Formation</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[['Network','Solana'],['Version','1.1'],['Updated','March 2026'],['Status','Devnet Live']].map(([k,v]) => (
              <div key={k} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SECTIONS.map((s) => {
            const isOpen = openSection === s.id;
            return (
              <div key={s.id} style={{ background: 'var(--panel)', border: `1px solid ${isOpen ? (s.highlight ? 'rgba(34,211,238,0.35)' : 'rgba(139,92,246,0.35)') : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                <button onClick={() => toggleSection(s.id)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {s.number && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: s.highlight ? '#22D3EE' : '#A78BFA', fontWeight: 700, flexShrink: 0 }}>{s.number}.</span>}
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: isOpen ? (s.highlight ? '#22D3EE' : '#A78BFA') : 'var(--text)', transition: 'color 0.15s' }}>
                      {s.title}
                      {s.highlight && <span style={{ marginLeft: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 3, padding: '1px 6px', color: '#22D3EE', fontWeight: 700, verticalAlign: 'middle' }}>UPDATED v1.1</span>}
                    </span>
                  </div>
                  <span style={{ color: isOpen ? (s.highlight ? '#22D3EE' : '#A78BFA') : 'var(--text-muted)', fontSize: 14, flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 18px 18px', animation: 'fadeUp 0.15s ease' }}>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

                    {/* Top-level content */}
                    {s.content && (
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85, whiteSpace: 'pre-line', marginBottom: s.subsections ? 16 : 0 }}>
                        {s.content}
                      </div>
                    )}

                    {/* Subsections */}
                    {s.subsections && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {s.subsections.map((sub) => {
                          const subKey = `${s.id}-${sub.number}`;
                          const subOpen = openSub === subKey;
                          return (
                            <div key={subKey} style={{ background: 'var(--panel-alt)', border: `1px solid ${subOpen ? 'rgba(139,92,246,0.25)' : 'var(--border-sub)'}`, borderRadius: 7, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                              <button onClick={() => setOpenSub(subOpen ? null : subKey)}
                                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{sub.number}</span>
                                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13, color: subOpen ? '#A78BFA' : 'var(--text)', transition: 'color 0.15s' }}>{sub.title}</span>
                                </div>
                                <span style={{ color: subOpen ? '#A78BFA' : 'var(--text-muted)', fontSize: 12, flexShrink: 0, transition: 'transform 0.18s', transform: subOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                              </button>
                              {subOpen && (
                                <div style={{ padding: '0 14px 14px', animation: 'fadeUp 0.12s ease' }}>
                                  <div style={{ height: 1, background: 'var(--border-sub)', marginBottom: 12 }} />
                                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                                    {sub.content}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: 16 }}>
            Mammoth Protocol Whitepaper v1.1 · March 2026<br />
            Section 5 (Rights-Based Issuance) updated with full mechanics documentation
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['/', '← App'],['https://github.com/kelvinsinferno/mammoth','GitHub'],[ '/learn', 'Learn'],[ '/terms', 'Terms'],[ '/risk', 'Risk']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#A78BFA'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
