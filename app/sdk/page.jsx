'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ui/ThemeToggle';
import BrandMark from '../../components/BrandMark';
import WalletButton from '../../components/wallet/WalletButton';
import WalletModal from '../../components/wallet/WalletModal';
import { useApp } from '../../lib/AppContext';

const DEMO_MINT = '1';
const BASE = 'https://mammothprotocol.com';

const SNIPPET_IFRAME = (mint, theme, accent, size) => `<iframe
  src="${BASE}/widget/${mint}?theme=${theme}&accent=${encodeURIComponent(accent)}&size=${size}"
  width="${size === 'compact' ? '340' : '420'}"
  height="${size === 'compact' ? '220' : '560'}"
  frameborder="0"
  style="border-radius:12px;overflow:hidden;"
  allow="clipboard-write"
></iframe>`;

const SNIPPET_SCRIPT = (mint, theme, accent, size) => `<div id="mammoth-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = "${BASE}/widget/${mint}?theme=${theme}&accent=${encodeURIComponent(accent)}&size=${size}";
    iframe.width = "${size === 'compact' ? '340' : '420'}";
    iframe.height = "${size === 'compact' ? '220' : '560'}";
    iframe.frameBorder = "0";
    iframe.style.cssText = "border-radius:12px;overflow:hidden;";
    document.getElementById('mammoth-widget').appendChild(iframe);
  })();
</script>`;

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

export default function SDKPage() {
  const router = useRouter();
  const { walletState, setWalletState, theme, toggleTheme } = useApp();
  const [showWallet, setShowWallet] = useState(false);
  const [widgetTheme, setWidgetTheme] = useState('dark');
  const [widgetAccent, setWidgetAccent] = useState('#8B5CF6');
  const [widgetSize, setWidgetSize] = useState('full');
  const [activeSnippet, setActiveSnippet] = useState('iframe');

  const snippet = activeSnippet === 'iframe'
    ? SNIPPET_IFRAME('MINT_ADDRESS', widgetTheme, widgetAccent, widgetSize)
    : SNIPPET_SCRIPT('MINT_ADDRESS', widgetTheme, widgetAccent, widgetSize);

  const previewUrl = (t) => `${BASE}/widget/${DEMO_MINT}?theme=${t}&accent=${encodeURIComponent(widgetAccent)}&size=${widgetSize}`;

  const iframeH = widgetSize === 'compact' ? 220 : 560;
  const iframeW = widgetSize === 'compact' ? 320 : 420;

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }}>

        {/* App header — matches Learn / Whitepaper */}
        <header style={{ background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--header-border)', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--header-shadow)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center' }}>←</button>
              <a href="/" style={{ display: 'flex', flexShrink: 0 }}>
                <BrandMark size={28} alt="Mammoth" rounded={6} />
              </a>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', whiteSpace: 'nowrap' }}>Mammoth SDK</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <WalletButton walletState={walletState} onOpenModal={() => setShowWallet(true)} onDisconnect={() => setWalletState({ status: 'disconnected', address: null, short: null, balance: 0, adapter: null, error: null })} />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px 80px' }}>

          {/* Hero */}
          <div style={{ marginBottom: 48, maxWidth: 600 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Embeddable Widget SDK</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 36, color: 'var(--text)', margin: '0 0 14px', lineHeight: 1.15 }}>
              Put Mammoth on<br />
              <span style={{ background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>any website.</span>
            </h1>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, margin: '0 0 24px' }}>
              Two lines of code. Your token&apos;s full buy panel — chart, cycle stats, wallet connect, quick-buy presets — embedded anywhere. Dark and light mode built in.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href="#preview" style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em' }}>SEE IT LIVE ↓</a>
              <a href="#embed" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.04em' }}>GET THE CODE ↓</a>
            </div>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 48 }}>
            {['Live price chart','Cycle progress','Quick-buy presets','SOL input + quote','Wallet connect','Dark & light mode','Custom accent','iframe or script tag','No API key','Solana native'].map(f => (
              <span key={f} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-dim)', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px' }}>{f}</span>
            ))}
          </div>

          {/* Live widget preview */}
          <div id="preview" style={{ scrollMarginTop: 68, marginBottom: 56 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', margin: '0 0 4px' }}>Live Preview</h2>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Real widgets — interactive. Same token, two themes.</p>
            </div>

            {/* Customise strip */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>Customise</span>
              {/* Size */}
              <div style={{ display: 'flex', gap: 4 }}>
                {['full','compact'].map(s => (
                  <button key={s} onClick={() => setWidgetSize(s)}
                    style={{ padding: '5px 12px', background: widgetSize === s ? 'rgba(139,92,246,0.18)' : 'var(--panel-alt)', border: `1px solid ${widgetSize === s ? '#8B5CF6' : 'var(--border)'}`, borderRadius: 5, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: widgetSize === s ? '#22D3EE' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.12s' }}>
                    {s}
                  </button>
                ))}
              </div>
              {/* Accent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)' }}>accent</span>
                <input type="color" value={widgetAccent} onChange={e => setWidgetAccent(e.target.value)}
                  style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'none' }} />
                <input type="text" value={widgetAccent} onChange={e => setWidgetAccent(e.target.value)} maxLength={7}
                  style={{ width: 72, background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 5, padding: '5px 8px', color: 'var(--text)', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#8B5CF6'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(420px,100%),1fr))', gap: 28, justifyItems: 'center' }}>
              {[['dark','#0d1117','#252848'],['light','#f6f8fa','#d0d7de']].map(([t, bg, borderColor]) => (
                <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: iframeW + 2 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: bg, border: `1px solid ${borderColor}`, display: 'inline-block', flexShrink: 0 }} />
                    {t}
                  </div>
                  <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: t === 'dark' ? '0 0 40px rgba(139,92,246,0.15)' : '0 4px 32px rgba(0,0,0,0.1)', border: `1px solid ${t === 'dark' ? 'rgba(139,92,246,0.2)' : '#d0d7de'}`, width: '100%', maxWidth: iframeW }}>
                    <iframe src={previewUrl(t)} width="100%" height={iframeH} frameBorder="0" style={{ display: 'block', minWidth: Math.min(iframeW, 300) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embed code */}
          <div id="embed" style={{ scrollMarginTop: 68, marginBottom: 56 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', margin: '0 0 4px' }}>Get the Code</h2>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Once you&apos;ve launched a token, grab the personalised snippet from your <a href="/creator" style={{ color: '#A78BFA', textDecoration: 'none' }}>Creator Dashboard</a>.
              </p>
            </div>

            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {/* Tab bar */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 6, padding: 3, gap: 2 }}>
                  {[['iframe','iframe (recommended)'],['script','script tag']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveSnippet(key)}
                      style={{ padding: '5px 14px', background: activeSnippet === key ? '#8B5CF6' : 'transparent', border: 'none', borderRadius: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: activeSnippet === key ? '#fff' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 6, padding: 3, gap: 2 }}>
                  {[['dark','dark'],['light','light']].map(([key, label]) => (
                    <button key={key} onClick={() => setWidgetTheme(key)}
                      style={{ padding: '5px 12px', background: widgetTheme === key ? '#8B5CF6' : 'transparent', border: 'none', borderRadius: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: widgetTheme === key ? '#fff' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.12s' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code */}
              <div style={{ padding: '16px', position: 'relative' }}>
                <pre style={{ background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', fontSize: 11, color: '#22D3EE', fontFamily: "'IBM Plex Mono',monospace", overflowX: 'auto', whiteSpace: 'pre', margin: 0, lineHeight: 1.8 }}>
                  {snippet}
                </pre>
                <div style={{ position: 'absolute', top: 26, right: 26 }}>
                  <CopyButton text={snippet} />
                </div>
              </div>

              {/* URL line */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>Widget URL:</span>
                <code style={{ flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-dim)', wordBreak: 'break-all' }}>
                  {BASE}/widget/MINT_ADDRESS?theme={widgetTheme}&accent={encodeURIComponent(widgetAccent)}&size={widgetSize}
                </code>
                <CopyButton text={`${BASE}/widget/MINT_ADDRESS?theme=${widgetTheme}&accent=${encodeURIComponent(widgetAccent)}&size=${widgetSize}`} small />
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', margin: '0 0 14px' }}>URL Parameters</h2>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 150px 180px 1fr', padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel-alt)' }}>
                {['param','type','default','description'].map(h => (
                  <span key={h} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                ))}
              </div>
              {[
                { param:'theme',   type:'dark | light',   def:'dark',        desc:'Widget colour scheme — matches your site' },
                { param:'accent',  type:'#hexcolor',      def:'%238B5CF6',   desc:'Primary colour — URL-encode the # as %23' },
                { param:'size',    type:'full | compact', def:'full',        desc:'Full: chart + cycle stats + buy. Compact: header + buy form only.' },
              ].map((row, i, arr) => (
                <div key={row.param} style={{ display: 'grid', gridTemplateColumns: '100px 150px 180px 1fr', padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', gap: 4 }}>
                  <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#FF9F1C', fontWeight: 700 }}>{row.param}</code>
                  <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#22D3EE' }}>{row.type}</code>
                  <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)' }}>{row.def}</code>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>{row.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>Ready to embed your token?</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>Launch on Mammoth → Dashboard → {'</>'} button → paste the code.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href="/creator" style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>OPEN DASHBOARD →</a>
              <a href="/learn" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 20px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>READ THE DOCS</a>
            </div>
          </div>
        </main>
      </div>

      {showWallet && (
        <WalletModal onClose={() => setShowWallet(false)} onConnected={s => { setWalletState(s); setShowWallet(false); }} />
      )}
    </>
  );
}
