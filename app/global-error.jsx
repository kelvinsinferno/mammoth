'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Catches errors in the root layout — replaces the entire page
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[Mammoth Global Error]', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        margin: 0, padding: 0,
        background: '#080c14',
        color: '#F0F4FF',
        fontFamily: "'IBM Plex Mono', monospace",
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 460, width: '100%' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🦣</div>

          <div style={{ fontWeight: 700, fontSize: 22, color: '#F0F4FF', marginBottom: 8, fontFamily: 'sans-serif' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: '#7B8EC8', marginBottom: 24 }}>
            Mammoth hit an unexpected error.
          </div>

          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: '#F43F5E', fontWeight: 700, marginBottom: 6 }}>ERROR</div>
            <div style={{ fontSize: 11, color: 'rgba(248,113,113,0.85)', lineHeight: 1.7, wordBreak: 'break-word' }}>
              {error?.message || 'A client-side exception occurred.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} style={{ background: '#8B5CF6', border: 'none', borderRadius: 7, padding: '11px 24px', color: '#fff', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' }}>
              TRY AGAIN
            </button>
            <button onClick={() => { window.location.href = '/'; }} style={{ background: 'transparent', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 7, padding: '11px 24px', color: '#A78BFA', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.04em' }}>
              ← HOME
            </button>
          </div>

          <div style={{ marginTop: 24, fontSize: 10, color: '#4a5680', lineHeight: 1.8 }}>
            Try refreshing or clearing your browser cache.<br />
            Check the browser console for full details.
          </div>
        </div>
      </body>
    </html>
  );
}
