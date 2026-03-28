'use client';
import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'How do cycles work?',
  'What is a rights window?',
  'What\'s the difference between Step and Linear curves?',
  'How do I launch a token?',
  'What happens when a cycle ends?',
  'What is slippage tolerance?',
];

export default function MammothChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! I\'m the Mammoth AI. Ask me anything about cycles, curves, rights, launching tokens, or buying in.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setError(null);

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0)
            .map(m => ({ role: m.role, content: m.content }))
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (e) {
      setError('Connection error. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 400,
          width: 54, height: 54, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7C3AED,#22D3EE)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(124,58,237,0.5), 0 0 0 3px rgba(34,211,238,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg) scale(0.9)' : 'scale(1)',
        }}
        title="Ask Mammoth AI"
      >
        {open ? '✕' : '🦣'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 400,
          width: 'min(380px, calc(100vw - 32px))',
          background: 'var(--panel)',
          border: '1px solid rgba(139,92,246,0.35)',
          borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.1)',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'min(520px, calc(100vh - 120px))',
          animation: 'slideUp 0.2s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(124,58,237,0.08)', flexShrink: 0 }}>
            <a href="/" style={{ display:'flex', flexShrink:0 }}><img src="/mammoth-logo-dark.gif" alt="Mammoth" width={24} height={24} style={{ borderRadius:4, objectFit:'cover', display:'block' }}/></a>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Mammoth AI</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#22D3EE', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22D3EE', display: 'inline-block', animation: 'blink 2s ease-in-out infinite' }} />
                online · powered by Groq
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg,#7C3AED,#8B5CF6)'
                    : 'var(--panel-alt)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  padding: '9px 12px',
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 13,
                  color: m.role === 'user' ? '#fff' : 'var(--text-secondary)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 3px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', display: 'inline-block', animation: `blink 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '8px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#F43F5E' }}>
                ⚠ {error}
              </div>
            )}

            {/* Suggestions — only show at start */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 20, padding: '5px 10px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#A78BFA', cursor: 'pointer', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; e.currentTarget.style.borderColor = '#8B5CF6'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(139,92,246,0.15)', display: 'flex', gap: 8, flexShrink: 0, background: 'var(--panel)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask anything about Mammoth..."
              disabled={loading}
              style={{
                flex: 1, background: 'var(--panel-alt)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8,
                padding: '9px 12px', color: 'var(--text)', fontSize: 13,
                fontFamily: "'Space Grotesk',sans-serif", outline: 'none',
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#7C3AED'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? 'linear-gradient(135deg,#7C3AED,#8B5CF6)' : 'var(--border)',
                border: 'none', borderRadius: 8, width: 38, height: 38,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
