'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  {
    id: 'what-is-mammoth',
    icon: '🦣',
    title: 'What is Mammoth?',
    audience: 'everyone',
    content: [
      {
        type: 'text',
        body: `Mammoth is a token launch platform built on Solana. But it works differently from anything else you've seen.

Most token platforms let you launch once and hope for the best. Mammoth is built around the idea that great projects need to raise capital multiple times — and their holders deserve protection when that happens.

The result is a system where projects raise in discrete rounds called cycles, prices are predictable, and existing holders always get first access before new buyers.`
      },
      {
        type: 'highlight',
        label: 'The core idea',
        body: 'Markets don\'t hate dilution. They hate forced dilution. Mammoth lets projects raise again and again without suppressing price — because holders always have the right to protect their position first.'
      }
    ]
  },
  {
    id: 'cycles',
    icon: '🔄',
    title: 'What is a Cycle?',
    audience: 'both',
    content: [
      {
        type: 'text',
        body: `A cycle is a bounded fundraising round. Each cycle has a fixed token allocation, a starting price, and a bonding curve that determines how price increases as tokens are sold.

When a cycle ends — either because all tokens sold or the creator ends it — no more tokens are issued until the creator opens a new cycle. This creates scarcity between cycles and gives the market time to breathe.`
      },
      {
        type: 'steps',
        items: [
          { icon: '1', label: 'Rights Window', desc: 'Existing holders get first access at the launch price. They can buy their pro-rata share before the public.' },
          { icon: '2', label: 'Active Cycle', desc: 'Public can buy. Price rises along the bonding curve as more tokens are sold.' },
          { icon: '3', label: 'Cycle Ends', desc: 'Supply locks. Holders trade freely on secondary markets (Jupiter). No new tokens until next cycle.' },
          { icon: '4', label: 'Next Cycle', desc: 'Creator opens a new cycle. Rights window activates again for existing holders.' },
        ]
      }
    ]
  },
  {
    id: 'bonding-curves',
    icon: '📊',
    title: 'Bonding Curves',
    audience: 'both',
    content: [
      {
        type: 'text',
        body: `A bonding curve is a mathematical formula that sets token price based on how many tokens have been sold. The more tokens sold, the higher the price. Early buyers always get a better price than late buyers.

Mammoth supports three curve types:`
      },
      {
        type: 'cards',
        items: [
          {
            icon: '📊',
            color: '#22D3EE',
            title: 'Step Curve',
            desc: 'Price increases in fixed jumps. Every N tokens sold, the price steps up by a set amount. You always know exactly when the next price increase hits — creating urgency without surprise. Best for projects that want milestone-driven price action.'
          },
          {
            icon: '📈',
            color: '#A78BFA',
            title: 'Linear Curve',
            desc: 'Price rises smoothly and continuously with every token sold. No sudden jumps — predictable and gradual. Best for projects that want steady, consistent appreciation.'
          },
          {
            icon: '🚀',
            color: '#FF9F1C',
            title: 'Exp-Lite Curve',
            desc: 'Price rises slowly at first, then accelerates sharply as supply fills. Extreme asymmetry for early buyers — late buyers pay a significant premium. Best for high-conviction early communities.'
          }
        ]
      }
    ]
  },
  {
    id: 'rights',
    icon: '🛡️',
    title: 'Rights-Based Anti-Dilution',
    audience: 'both',
    content: [
      {
        type: 'text',
        body: `Every time a new cycle opens, existing holders receive rights — a pro-rata allocation they can exercise at the new cycle's launch price before the public gets access.

Rights are non-transferable and cycle-specific. If you hold 1% of the supply, you can buy up to 1% of the new cycle's allocation at the base price during the rights window.`
      },
      {
        type: 'highlight',
        label: 'Why this matters',
        body: 'Without rights protection, every new cycle dilutes existing holders. With rights, you can maintain your ownership percentage through every fundraising round — at the same price as day-one buyers in that cycle.'
      },
      {
        type: 'text',
        body: `Rights are optional — you don't have to exercise them. If you pass, your tokens remain unaffected. You just won't be able to maintain your exact percentage if others exercise theirs.`
      }
    ]
  },
  {
    id: 'supply-modes',
    icon: '⚙️',
    title: 'Supply Modes',
    audience: 'launcher',
    content: [
      {
        type: 'text',
        body: `When you launch a token on Mammoth, you choose how supply works:`
      },
      {
        type: 'cards',
        items: [
          {
            icon: '♾️',
            color: '#22D3EE',
            title: 'Elastic Supply',
            desc: 'No hard cap. Each cycle can mint new tokens indefinitely. The project can raise as many times as needed. Good for long-term projects with ongoing capital needs.'
          },
          {
            icon: '🔒',
            color: '#A78BFA',
            title: 'Fixed Supply',
            desc: 'You set a maximum supply. Once all cycles complete and that cap is reached, no more tokens can ever be minted. Creates absolute scarcity. Good for projects that want a hard ceiling.'
          }
        ]
      },
      {
        type: 'highlight',
        label: 'Important',
        body: 'The transition from Elastic to Fixed is irreversible. Once you set a hard cap, it cannot be removed. Think carefully before locking supply.'
      }
    ]
  },
  {
    id: 'treasury',
    icon: '💰',
    title: 'Treasury Routing',
    audience: 'launcher',
    content: [
      {
        type: 'text',
        body: `Every SOL raised in a cycle gets automatically split and routed on-chain at the moment the cycle closes. As a launcher, you set the percentages when you create each cycle.`
      },
      {
        type: 'steps',
        items: [
          { icon: '👤', label: 'Creator Treasury', desc: 'Your share. Goes directly to the wallet you control. Default: 70%.' },
          { icon: '🏦', label: 'Reserve', desc: 'Held in a protocol-managed reserve account. Can be used for future cycles or project runway. Default: 20%.' },
          { icon: '🔥', label: 'Sink / Burn', desc: 'Removed from circulation permanently. Deflationary pressure. Default: 10%.' },
          { icon: '⚡', label: 'Protocol Fee', desc: '2% of all trades routed through Mammoth. Fixed. Cannot be changed.' },
        ]
      },
      {
        type: 'text',
        body: `The routing is deterministic and on-chain — no one can intercept or redirect funds after a cycle closes. What you set is what happens.`
      }
    ]
  },
  {
    id: 'how-to-launch',
    icon: '🚀',
    title: 'How to Launch a Token',
    audience: 'launcher',
    content: [
      {
        type: 'text',
        body: 'Launching on Mammoth takes about 2 minutes. Here\'s the full process:'
      },
      {
        type: 'steps',
        items: [
          { icon: '1', label: 'Connect your wallet', desc: 'Phantom or Solflare on Solana devnet. You\'ll need a small amount of SOL for transaction fees.' },
          { icon: '2', label: 'Click LAUNCH', desc: 'Hit the launch button in the top nav. A 3-step wizard opens.' },
          { icon: '3', label: 'Step 1 — Basics', desc: 'Name, ticker (1–6 chars), and description for your token.' },
          { icon: '4', label: 'Step 2 — Supply mode', desc: 'Choose Elastic (no cap) or Fixed (hard cap). Choose your bonding curve type.' },
          { icon: '5', label: 'Step 3 — Allocation', desc: 'Set initial allocation size, starting price in SOL, and treasury split percentages.' },
          { icon: '6', label: 'Deploy', desc: 'Sign the transaction. Your token deploys on-chain and appears in the discovery feed.' },
          { icon: '7', label: 'Open your first cycle', desc: 'Go to your Creator Dashboard, find your token, and open Cycle 1 to start raising.' },
        ]
      },
      {
        type: 'highlight',
        label: 'Devnet first',
        body: 'Mammoth is currently on Solana Devnet. All transactions use test SOL with no real value. Mainnet launch coming soon.'
      }
    ]
  },
  {
    id: 'how-to-buy',
    icon: '💳',
    title: 'How to Buy into a Cycle',
    audience: 'buyer',
    content: [
      {
        type: 'text',
        body: 'Buying on Mammoth is straightforward. Here\'s what you need to know:'
      },
      {
        type: 'steps',
        items: [
          { icon: '1', label: 'Connect your wallet', desc: 'Hit CONNECT in the top right. Phantom and Solflare are supported.' },
          { icon: '2', label: 'Find a token', desc: 'Browse the discovery feed on the homepage. Filter by New, Trending, Most Raised, or Ending Soon.' },
          { icon: '3', label: 'Check the cycle panel', desc: 'On the token page, the cycle panel shows: curve type, launch price, current price, remaining allocation, and when the next price jump hits.' },
          { icon: '4', label: 'Enter an amount', desc: 'Use the preset buttons (5%/10%/25%/50% of remaining cycle) or type a custom SOL amount.' },
          { icon: '5', label: 'Review the quote', desc: 'You\'ll see exactly how many tokens you receive, the Mammoth fee (2%), and price impact before you confirm.' },
          { icon: '6', label: 'Confirm purchase', desc: 'Sign the transaction in your wallet. Tokens arrive immediately.' },
        ]
      },
      {
        type: 'highlight',
        label: 'Rights window',
        body: 'If you already hold tokens and a new cycle opens, you\'ll see a Rights Available notice. Exercise your rights first to get the launch price before the public can buy.'
      }
    ]
  },
  {
    id: 'secondary-trading',
    icon: '🔁',
    title: 'Secondary Trading',
    audience: 'buyer',
    content: [
      {
        type: 'text',
        body: `When a cycle ends, no more tokens can be bought through Mammoth until the creator opens a new cycle. During this window — called "Between Cycles" — you can trade freely on Jupiter.

Mammoth automatically generates a Jupiter deeplink for each token. Hit "Trade on Jupiter →" on any token page with an ended cycle to swap directly.`
      },
      {
        type: 'highlight',
        label: 'No lock-ups',
        body: 'Mammoth tokens are standard SPL tokens. You can trade them on any DEX that supports Solana at any time — you\'re never locked in.'
      }
    ]
  }
];

const CURVE_COLORS = { '#22D3EE': true, '#A78BFA': true, '#FF9F1C': true };

export default function LearnPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('what-is-mammoth');
  const [audienceFilter, setAudienceFilter] = useState('everyone');

  const filtered = SECTIONS.filter(s =>
    audienceFilter === 'everyone' ||
    s.audience === 'everyone' ||
    s.audience === 'both' ||
    s.audience === audienceFilter
  );

  const current = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Header */}
      <header style={{ background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--header-border)', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--header-shadow)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center' }}>←</button>
            <img src="/mammoth-logo-dark.gif" alt="Mammoth" width={28} height={28} style={{ borderRadius: 6, objectFit: 'cover' }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mammoth Learn</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['everyone', '👤 All'], ['buyer', '💳 Buyers'], ['launcher', '🚀 Launchers']].map(([val, label]) => (
              <button key={val} onClick={() => setAudienceFilter(val)}
                style={{ background: audienceFilter === val ? 'rgba(139,92,246,0.2)' : 'transparent', border: `1px solid ${audienceFilter === val ? '#8B5CF6' : 'var(--border)'}`, borderRadius: 6, padding: '5px 10px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: audienceFilter === val ? '#22D3EE' : 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }} className="learn-grid">
        {/* Sidebar nav */}
        <div style={{ position: 'sticky', top: 76, height: 'fit-content' }} className="learn-sidebar">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ background: activeSection === s.id ? 'rgba(139,92,246,0.15)' : 'transparent', border: activeSection === s.id ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent', borderRadius: 6, padding: '8px 10px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.12s' }}
                onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'rgba(139,92,246,0.06)' }}
                onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: activeSection === s.id ? '#22D3EE' : 'var(--text-dim)', fontWeight: activeSection === s.id ? 700 : 400, lineHeight: 1.3 }}>{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 28px', animation: 'fadeUp 0.2s ease' }} key={current.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 32 }}>{current.icon}</span>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text)', margin: 0 }}>{current.title}</h1>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {current.audience === 'launcher' ? '🚀 For launchers' : current.audience === 'buyer' ? '💳 For buyers' : '👤 For everyone'}
                </div>
              </div>
            </div>

            {current.content.map((block, i) => {
              if (block.type === 'text') return (
                <p key={i} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 20, whiteSpace: 'pre-line' }}>{block.body}</p>
              );

              if (block.type === 'highlight') return (
                <div key={i} style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, color: '#A78BFA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{block.label}</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{block.body}</div>
                </div>
              );

              if (block.type === 'steps') return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {block.items.map((step, j) => (
                    <div key={j} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#A78BFA', fontWeight: 700 }}>{step.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{step.label}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );

              if (block.type === 'cards') return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {block.items.map((card, j) => (
                    <div key={j} style={{ background: 'var(--panel-alt)', border: `1px solid ${card.color}33`, borderRadius: 10, padding: '16px' }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{card.icon}</div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: card.color, marginBottom: 6 }}>{card.title}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>{card.desc}</div>
                    </div>
                  ))}
                </div>
              );

              return null;
            })}

            {/* Prev / Next navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              {(() => {
                const idx = filtered.findIndex(s => s.id === current.id);
                const prev = filtered[idx - 1];
                const next = filtered[idx + 1];
                return (<>
                  {prev
                    ? <button onClick={() => setActiveSection(prev.id)} style={{ background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 7, padding: '9px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>← {prev.title}</button>
                    : <div/>
                  }
                  {next
                    ? <button onClick={() => setActiveSection(next.id)} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 7, padding: '9px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#A78BFA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>{next.title} →</button>
                    : <button onClick={() => router.push('/')} style={{ background: '#FF9F1C', border: 'none', borderRadius: 7, padding: '9px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#000', cursor: 'pointer', fontWeight: 700 }}>GO TO APP →</button>
                  }
                </>);
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
