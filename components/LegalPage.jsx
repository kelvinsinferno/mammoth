'use client';
import { useState } from 'react';

export default function LegalPage({ title, subtitle, icon, warning, sections }) {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Header */}
      <header style={{ background: 'var(--header-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--header-border)', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--header-shadow)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <img src="/mammoth-logo-dark.gif" alt="Mammoth" width={28} height={28} style={{ borderRadius: 6, objectFit: 'cover' }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Mammoth</span>
          </a>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>/ {title}</span>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 80px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>{icon}</span>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: 'var(--text)', margin: 0 }}>{title}</h1>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', marginBottom: warning ? 16 : 0 }}>{subtitle}</div>
          {warning && (
            <div style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '12px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#F43F5E', lineHeight: 1.65 }}>
              {warning}
            </div>
          )}
        </div>

        {/* Sections — accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ background: 'var(--panel)', border: `1px solid ${open === i ? 'rgba(139,92,246,0.35)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.15s' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#A78BFA', fontWeight: 700, minWidth: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: open === i ? '#22D3EE' : 'var(--text)', transition: 'color 0.15s' }}>{s.title}</span>
                </div>
                <span style={{ color: open === i ? '#22D3EE' : 'var(--text-muted)', fontSize: 14, flexShrink: 0, transition: 'transform 0.2s', transform: open === i ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 18px 16px', animation: 'fadeUp 0.15s ease' }}>
                  <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                    {s.body}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer nav between legal pages */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['/terms', '⚖️ Terms of Service'],
            ['/privacy', '🔒 Privacy Policy'],
            ['/risk', '⚠️ Risk Disclosure'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#A78BFA'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          These documents are drafts pending attorney review.<br />
          Not legal advice. Not financial advice. Use at your own risk.
        </div>
      </main>
    </div>
  );
}
