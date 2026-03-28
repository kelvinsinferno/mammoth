'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    info: (msg, dur) => addToast(msg, 'info', dur),
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warn: (msg, dur) => addToast(msg, 'warn', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Individual Toast ─────────────────────────────────────────────────────────

function ToastItem({ id, message, type, duration, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const showT = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const hideT = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, duration);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  }, [id, duration, onRemove]);

  const colors = {
    info:    { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', icon: 'ℹ', text: '#a78bfa' },
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', icon: '✓', text: '#10B981' },
    error:   { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', icon: '⚠', text: '#F43F5E' },
    warn:    { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.35)', icon: '⚠', text: '#FB923C' },
  };

  const c = colors[type] || colors.info;

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 300); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: '11px 14px',
        cursor: 'pointer',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        color: 'var(--text)',
        maxWidth: 340,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 14, color: c.text, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ lineHeight: 1.4, color: 'var(--text)' }}>{message}</span>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
