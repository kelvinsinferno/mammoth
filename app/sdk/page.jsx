'use client';
import { useState } from 'react';
import Link from 'next/link';

const DEMO_MINT = '1'; // MegaTusk mock
const BASE = 'https://mammoth-protocol.vercel.app';

const SNIPPET_IFRAME = (mint, theme) => `<iframe
  src="${BASE}/widget/${mint}?theme=${theme}&accent=%238B5CF6&size=full"
  width="420"
  height="560"
  frameborder="0"
  style="border-radius:12px;overflow:hidden;"
  allow="clipboard-write"
></iframe>`;

const SNIPPET_SCRIPT = (mint, theme) => `<div id="mammoth-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = "${BASE}/widget/${mint}?theme=${theme}&accent=%238B5CF6&size=full";
    iframe.width = "420";
    iframe.height = "560";
    iframe.frameBorder = "0";
    iframe.style.cssText = "border-radius:12px;overflow:hidden;";
    document.getElementById('mammoth-widget').appendChild(iframe);
  })();
</script>`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'transparent', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`, borderRadius: 5, padding: '4px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: copied ? '#10B981' : '#A78BFA', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
      {copied ? '✓ COPIED' : 'COPY'}
    </button>
  );
}

function CodeBlock({ code }) {
  return (
    <div style={{ position: 'relative' }}>
      <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '14px 16px', fontSize: 11, color: '#22D3EE', fontFamily: "'IBM Plex Mono',monospace", overflowX: 'auto', whiteSpace: 'pre', margin: 0, lineHeight: 1.7 }}>
        {code}
      </pre>
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

export default function SDKPage() {
  const [widgetTheme, setWidgetTheme] = useState('dark');
  const [activeSnippet, setActiveSnippet] = useState('iframe');

  const widgetUrl = `${BASE}/widget/${DEMO_MINT}?theme=${widgetTheme}&accent=%238B5CF6&size=full`;
  const snippet = activeSnippet === 'iframe' ? SNIPPET_IFRAME(DEMO_MINT, widgetTheme) : SNIPPET_SCRIPT(DEMO_MINT, widgetTheme);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', fontFamily: "'IBM Plex Mono',monospace" }}>

      {/* Header */}
      <header style={{ background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--header-border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/mammoth-logo-dark.gif" alt="Mammoth" width={26} height={26} style={{ borderRadius: 6, objectFit: 'cover' }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mammoth</span>
          </Link>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/ SDK</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link href="/learn" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>Docs</Link>
            <Link href="/whitepaper" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>Whitepaper</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 16px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 20, padding: '4px 14px', marginBottom: 18 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Embeddable Widget SDK</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 40, color: 'var(--text)', margin: '0 0 14px', lineHeight: 1.15 }}>
            Put Mammoth on<br />
            <span style={{ background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>any website.</span>
          </h1>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.75 }}>
            Two lines of code. Your token&apos;s live buy panel — chart, cycle stats, wallet connect, quick-buy presets — embedded anywhere. Dark mode and light mode included.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#embed" style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', border: 'none', borderRadius: 7, padding: '10px 22px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em' }}>
              GET THE CODE →
            </a>
            <Link href="/creator" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 22px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.04em' }}>
              MY DASHBOARD
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 56 }}>
          {['Live price chart','Cycle progress','Quick-buy presets','SOL input + quote','Wallet connect','Dark & light mode','Accent colour','iframe or script tag','No API key needed','Powered by Solana'].map(f => (
            <span key={f} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-dim)', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px' }}>{f}</span>
          ))}
        </div>

        {/* Side-by-side widget showcase */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text)', margin: '0 0 6px' }}>Live Preview</h2>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)' }}>This is a real widget. Both are the same token — dark and light.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(420px,100%),1fr))', gap: 24, justifyItems: 'center' }}>
            {/* Dark */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#252848', border: '1px solid #30363d', display: 'inline-block' }}/>
                Dark
              </div>
              <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 40px rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <iframe
                  src={`${BASE}/widget/${DEMO_MINT}?theme=dark&accent=%238B5CF6&size=full`}
                  width={420} height={560} frameBorder="0"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
            {/* Light */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f6f8fa', border: '1px solid #d0d7de', display: 'inline-block' }}/>
                Light
              </div>
              <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.12)', border: '1px solid #d0d7de' }}>
                <iframe
                  src={`${BASE}/widget/${DEMO_MINT}?theme=light&accent=%238B5CF6&size=full`}
                  width={420} height={560} frameBorder="0"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Code section */}
        <div id="embed" style={{ scrollMarginTop: 72, marginBottom: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text)', margin: '0 0 6px' }}>Get the Code</h2>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)' }}>Grab the snippet for your token from your Creator Dashboard. Or try it with the demo below.</p>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Controls */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Theme toggle */}
              <div style={{ display: 'flex', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 6, padding: 3, gap: 2 }}>
                {['dark', 'light'].map(t => (
                  <button key={t} onClick={() => setWidgetTheme(t)}
                    style={{ padding: '5px 14px', background: widgetTheme === t ? '#8B5CF6' : 'transparent', border: 'none', borderRadius: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: widgetTheme === t ? '#fff' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.12s' }}>
                    {t}
                  </button>
                ))}
              </div>
              {/* Snippet type */}
              <div style={{ display: 'flex', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 6, padding: 3, gap: 2 }}>
                {[['iframe', 'iframe'], ['script', 'script tag']].map(([key, label]) => (
                  <button key={key} onClick={() => setActiveSnippet(key)}
                    style={{ padding: '5px 14px', background: activeSnippet === key ? '#8B5CF6' : 'transparent', border: 'none', borderRadius: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: activeSnippet === key ? '#fff' : 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.12s' }}>
                    {label}
                  </button>
                ))}
              </div>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                Replace <span style={{ color: '#FF9F1C' }}>MINT_ADDRESS</span> with your token&apos;s mint
              </span>
            </div>

            {/* Code block */}
            <div style={{ padding: '16px 20px' }}>
              <CodeBlock code={snippet.replace(DEMO_MINT, 'MINT_ADDRESS')} />
            </div>

            {/* URL line */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)' }}>Widget URL:</span>
              <code style={{ flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#22D3EE', wordBreak: 'break-all' }}>
                {widgetUrl.replace(DEMO_MINT, 'MINT_ADDRESS')}
              </code>
              <CopyButton text={widgetUrl.replace(DEMO_MINT, 'MINT_ADDRESS')} />
            </div>
          </div>
        </div>

        {/* Parameters table */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', margin: '0 0 16px' }}>URL Parameters</h2>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { param: 'theme', type: 'dark | light', default: 'dark', desc: 'Widget colour scheme' },
              { param: 'accent', type: 'hex colour', default: '%238B5CF6', desc: 'Primary accent colour (URL-encode the #)' },
              { param: 'size', type: 'full | compact', default: 'full', desc: 'Full includes chart + cycle stats. Compact is header + buy form only.' },
            ].map((row, i, arr) => (
              <div key={row.param} style={{ display: 'grid', gridTemplateColumns: '120px 130px 160px 1fr', gap: 0, padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#FF9F1C', fontWeight: 700 }}>{row.param}</code>
                <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#22D3EE' }}>{row.type}</code>
                <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)' }}>default: {row.default}</code>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>{row.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(34,211,238,0.07))', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>Ready to embed your token?</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.7 }}>
            Launch your token on Mammoth, then grab the embed code from your Creator Dashboard.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/creator" style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', borderRadius: 7, padding: '11px 24px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: '#fff', textDecoration: 'none', letterSpacing: '0.04em' }}>
              OPEN DASHBOARD →
            </Link>
            <Link href="/learn" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, padding: '11px 24px', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.04em' }}>
              READ THE DOCS
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['/', '← App'], ['/whitepaper', 'Whitepaper'], ['/learn', 'Learn'], ['/terms', 'Terms'], ['/risk', 'Risk']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
