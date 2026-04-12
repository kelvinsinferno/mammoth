'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ui/ThemeToggle';
import BrandMark from '../../components/BrandMark';
import WalletButton from '../../components/wallet/WalletButton';
import WalletModal from '../../components/wallet/WalletModal';
import { useApp } from '../../lib/AppContext';

const DEMO_MINT_LIVE = '1';   // MegaTusk — active cycle
const DEMO_MINT_SOON = '99';  // IronHide — coming soon
const BASE = 'https://mammoth-protocol.vercel.app';

function CopyButton({ text, small }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'transparent', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`, borderRadius: 5, padding: small ? '3px 10px' : '5px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: copied ? '#10B981' : '#A78BFA', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
      {copied ? '✓ COPIED' : 'COPY'}
    </button>
  );
}

export default function MiniAppPage() {
  const router = useRouter();
  const { walletState, setWalletState, theme, toggleTheme } = useApp();
  const [showWallet, setShowWallet] = useState(false);
  const [previewMint, setPreviewMint] = useState(DEMO_MINT_LIVE);

  const miniUrl = (mint) => `${BASE}/mini/${mint}`;
  const shareSnippet = (mint) => `${BASE}/mini/${mint}`;
  const tgSnippet = (mint) => `https://t.me/share/url?url=${encodeURIComponent(miniUrl(mint))}&text=${encodeURIComponent('Check out this token on Mammoth Protocol')}`;
  const fcSnippet = (mint) => `<!-- Farcaster Frame meta tags — add to your page <head> -->
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="${BASE}/api/og?mint=${mint}" />
<meta property="fc:frame:button:1" content="View on Mammoth" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="${miniUrl(mint)}" />`;

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }}>

        {/* App header */}
        <header style={{ background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--header-border)', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--header-shadow)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center' }}>←</button>
              <a href="/" style={{ display: 'flex', flexShrink: 0 }}>
                <BrandMark size={28} alt="Mammoth" rounded={6} />
              </a>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', whiteSpace: 'nowrap' }}>Mammoth Mini App</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <WalletButton walletState={walletState} onOpenModal={() => setShowWallet(true)} onDisconnect={() => setWalletState({ status: 'disconnected', address: null, short: null, balance: 0, adapter: null, error: null })} />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px 80px' }}>

          {/* Hero */}
          <div style={{ marginBottom: 48, maxWidth: 620 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Shareable Mini App</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 36, color: 'var(--text)', margin: '0 0 14px', lineHeight: 1.15 }}>
              Share your token<br />
              <span style={{ background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>anywhere it lands.</span>
            </h1>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, margin: '0 0 24px' }}>
              Every Mammoth token gets a shareable mini app page — a full mobile-optimised buy experience with chart, cycle stats, your position, and social links. Share it on Telegram, Farcaster, X, or anywhere else. Works as a Telegram Mini App out of the box.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href="#preview" style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em' }}>SEE IT LIVE ↓</a>
              <a href="#share" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.04em' }}>GET YOUR LINK ↓</a>
            </div>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 48 }}>
            {['Full project page','Price chart','Cycle panel','Your position + P&L','Buy form + wallet','Coming Soon countdown','Dark & light mode','Telegram Mini App','Farcaster Frame','OG share image','↗ SHARE button built in'].map(f => (
              <span key={f} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-dim)', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px' }}>{f}</span>
            ))}
          </div>

          {/* Live preview */}
          <div id="preview" style={{ scrollMarginTop: 68, marginBottom: 56 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', margin: '0 0 4px' }}>Live Preview</h2>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Real pages — interactive. Switch between a live token and a Coming Soon token.</p>
            </div>

            {/* Preview selector */}
            <div style={{ display: 'flex', gap: 2, background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 7, padding: 3, marginBottom: 20, width: 'fit-content' }}>
              {[
                { mint: DEMO_MINT_LIVE, label: '🚀 Live token (MegaTusk)' },
                { mint: DEMO_MINT_SOON, label: '📅 Coming Soon (IronHide)' },
              ].map(({ mint, label }) => (
                <button key={mint} onClick={() => setPreviewMint(mint)}
                  style={{ padding: '7px 16px', background: previewMint === mint ? '#8B5CF6' : 'transparent', border: 'none', borderRadius: 5, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 700, color: previewMint === mint ? '#fff' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Side by side — dark and light */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(390px,100%),1fr))', gap: 28, justifyItems: 'center' }}>
              {[['dark','#0d1117','#252848'],['light','#f6f8fa','#d0d7de']].map(([t, bg, borderColor]) => (
                <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 390 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: bg, border: `1px solid ${borderColor}`, display: 'inline-block' }} />
                    {t}
                  </div>
                  <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: t === 'dark' ? '0 0 40px rgba(139,92,246,0.15)' : '0 4px 32px rgba(0,0,0,0.1)', border: `1px solid ${t === 'dark' ? 'rgba(139,92,246,0.2)' : '#d0d7de'}`, width: '100%' }}>
                    <iframe
                      src={`${BASE}/mini/${previewMint}?forceTheme=${t}`}
                      width="100%"
                      height={680}
                      frameBorder="0"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <a href={`${BASE}/mini/${previewMint}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#A78BFA', textDecoration: 'none' }}>
                    Open full page ↗
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Share links section */}
          <div id="share" style={{ scrollMarginTop: 68, marginBottom: 56 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', margin: '0 0 4px' }}>Share Links</h2>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Your mini app URL is generated automatically. Grab it from your <a href="/creator" style={{ color: '#A78BFA', textDecoration: 'none' }}>Creator Dashboard</a> — or use the ↗ SHARE button on any project page.
              </p>
            </div>

            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {[
                {
                  label: 'Mini App URL',
                  desc: 'Direct link — works in any browser, Telegram, Discord, anywhere.',
                  code: `${BASE}/mini/MINT_ADDRESS`,
                  color: '#A78BFA',
                },
                {
                  label: 'Telegram share link',
                  desc: 'Pre-filled share URL. Opens Telegram share sheet with your token link.',
                  code: `https://t.me/share/url?url=${encodeURIComponent(BASE + '/mini/MINT_ADDRESS')}&text=${encodeURIComponent('Check out this token on Mammoth Protocol')}`,
                  color: '#29B6F6',
                },
                {
                  label: 'OG image (for embeds)',
                  desc: 'Auto-generated 1200×630 card — used by Twitter/X, Discord, iMessage, Farcaster.',
                  code: `${BASE}/api/og?mint=MINT_ADDRESS`,
                  color: '#22D3EE',
                },
                {
                  label: 'Farcaster Frame meta tags',
                  desc: 'Paste into your page <head> to make it a Farcaster Frame cast.',
                  code: fcSnippet('MINT_ADDRESS'),
                  color: '#855DCD',
                  multiline: true,
                },
              ].map(({ label, desc, code, color, multiline }, i, arr) => (
                <div key={label} style={{ padding: '16px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 700, color, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                    <CopyButton text={code} small />
                  </div>
                  <pre style={{ background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 10, color: '#22D3EE', fontFamily: "'IBM Plex Mono',monospace", overflowX: 'auto', whiteSpace: multiline ? 'pre' : 'nowrap', margin: 0, lineHeight: 1.7 }}>
                    {code}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', margin: '0 0 16px' }}>How it works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(240px,100%),1fr))', gap: 10 }}>
              {[
                { step:'01', title:'Launch on Mammoth', desc:'Create your token through the launch wizard. Your mini app is live at /mini/[mint] the moment you deploy.', color:'#A78BFA' },
                { step:'02', title:'Get your link', desc:'Hit ↗ SHARE on the project page, or grab the URL from your Creator Dashboard.', color:'#22D3EE' },
                { step:'03', title:'Share anywhere', desc:'Post it on X, paste in a Telegram message, drop it in a Farcaster cast — it unfurls as a rich preview everywhere.', color:'#FF9F1C' },
                { step:'04', title:'Buyers tap and buy', desc:'They see the full project page — chart, cycle info, buy form — and can purchase directly without leaving the app they\'re in.', color:'#10B981' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} style={{ background: 'var(--panel-alt)', border: `1px solid ${color}22`, borderRadius: 10, padding: '16px 14px' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${color}55`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `${color}22`}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color, fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em' }}>{step}</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Telegram & Farcaster callout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: 12, marginBottom: 56 }}>
            {[
              { icon:'✈️', platform:'Telegram Mini App', color:'#29B6F6', border:'rgba(41,182,246,0.2)', desc:'The mini app integrates with Telegram\'s WebApp SDK. When opened inside Telegram, it auto-expands to full screen, the back button is wired, and the share button opens Telegram\'s native share sheet.' },
              { icon:'🟣', platform:'Farcaster Frame', color:'#855DCD', border:'rgba(133,93,205,0.2)', desc:'Every /mini/[mint] page includes Farcaster Frame meta tags automatically. Post the URL as a cast and it becomes an interactive frame — viewers see the OG card and can tap through to buy.' },
            ].map(({ icon, platform, color, border, desc }) => (
              <div key={platform} style={{ background: 'var(--panel)', border: `1px solid ${border}`, borderRadius: 10, padding: '18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color }}>{platform}</span>
                </div>
                <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Coinbase Mini App callout */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ background: 'linear-gradient(135deg,rgba(0,82,255,0.06),rgba(0,82,255,0.02))', border: '1px solid rgba(0,82,255,0.2)', borderRadius: 12, padding: '24px 24px', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 36, flexShrink: 0 }}>🔵</div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Coinbase Mini App</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 700, color: '#0052FF', background: 'rgba(0,82,255,0.1)', border: '1px solid rgba(0,82,255,0.25)', borderRadius: 3, padding: '2px 7px' }}>BUILT IN</span>
                </div>
                <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8, margin: '0 0 16px' }}>
                  Every token launched on Mammoth is automatically available inside Coinbase Wallet as a full mini app — no extra setup required. Coinbase Wallet users get a dedicated discovery feed, portfolio tracker, and project pages, all accessible from within the wallet they already use.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(180px,100%),1fr))', gap: 8, marginBottom: 16 }}>
                  {[
                    { icon: '🔍', label: 'Discover feed',       desc: 'Your token appears in the Mammoth discovery feed inside Coinbase Wallet' },
                    { icon: '📊', label: 'Portfolio tracking',  desc: 'Buyers can track their position and P&L from within their wallet' },
                    { icon: '🛒', label: 'In-wallet buying',    desc: 'Full buy form — presets, quote, receipt — without leaving Coinbase Wallet' },
                    { icon: '🔔', label: 'New cycle alerts',    desc: 'Backed holders see new cycle notifications when they open the app' },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} style={{ background: 'var(--panel-alt)', border: '1px solid rgba(0,82,255,0.12)', borderRadius: 8, padding: '11px 12px' }}>
                      <div style={{ fontSize: 16, marginBottom: 5 }}>{icon}</div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, color: '#0052FF', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href="/coinbase" target="_blank" rel="noopener noreferrer"
                    style={{ background: '#0052FF', borderRadius: 7, padding: '9px 18px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 11, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    🔵 OPEN COINBASE APP ↗
                  </a>
                  <a href={`${BASE}/coinbase-manifest.json`} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'transparent', border: '1px solid rgba(0,82,255,0.3)', borderRadius: 7, padding: '9px 18px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 11, color: '#0052FF', textDecoration: 'none', letterSpacing: '0.04em' }}>
                    VIEW MANIFEST
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>Ready to share your token?</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>Launch on Mammoth → project page → ↗ SHARE MINI APP.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href="/creator" style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>OPEN DASHBOARD →</a>
              <a href="/sdk" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>EMBED SDK</a>
            </div>
          </div>
        </main>
      </div>

      {showWallet && <WalletModal onClose={() => setShowWallet(false)} onConnected={s => { setWalletState(s); setShowWallet(false); }} />}
    </>
  );
}
