'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log to console for debugging
    console.error('[Mammoth Error]', error);
  }, [error]);

  return (
    <html>
      <body style={{ margin:0, padding:0, background:'#080c14', color:'#F0F4FF', fontFamily:"'IBM Plex Mono', monospace, sans-serif", minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', padding:'40px 24px', maxWidth:460 }}>
          {/* Icon */}
          <div style={{ fontSize:48, marginBottom:20 }}>🦣</div>

          {/* Headline */}
          <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:22, color:'#F0F4FF', marginBottom:8 }}>
            Something went wrong
          </div>

          {/* Error message */}
          <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'12px 16px', marginBottom:24, textAlign:'left' }}>
            <div style={{ fontSize:11, color:'#F43F5E', fontWeight:600, marginBottom:4 }}>Error</div>
            <div style={{ fontSize:11, color:'rgba(248,113,113,0.8)', lineHeight:1.6, wordBreak:'break-word' }}>
              {error?.message || 'An unexpected client-side error occurred.'}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button
              onClick={reset}
              style={{ background:'#8B5CF6', border:'none', borderRadius:7, padding:'11px 22px', color:'#fff', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, cursor:'pointer', letterSpacing:'0.04em' }}
            >
              TRY AGAIN
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{ background:'transparent', border:'1px solid rgba(139,92,246,0.4)', borderRadius:7, padding:'11px 22px', color:'#A78BFA', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, cursor:'pointer', letterSpacing:'0.04em' }}
            >
              ← HOME
            </button>
          </div>

          <div style={{ marginTop:24, fontSize:10, color:'rgba(74,86,128,0.8)', lineHeight:1.7 }}>
            If this keeps happening, try refreshing or clearing your browser cache.<br/>
            Open browser console for full error details.
          </div>
        </div>
      </body>
    </html>
  );
}
