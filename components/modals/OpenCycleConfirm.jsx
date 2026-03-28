'use client';
import { useState, useEffect } from 'react';

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtSOL(n) {
  if (!n && n !== 0) return '—';
  return n < 0.001 ? n.toFixed(7) : n.toFixed(5);
}
function fmtNum(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Row({ label, value, accent }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '7px 0',
      borderBottom: '1px solid #1a1f3a',
    }}>
      <span style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        fontFamily: "'IBM Plex Mono',monospace",
      }}>{label}</span>
      <span style={{
        fontSize: 12,
        color: accent || 'var(--text)',
        fontFamily: "'IBM Plex Mono',monospace",
        fontWeight: 600,
      }}>{value}</span>
    </div>
  );
}

function SectionBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 9,
        fontFamily: "'IBM Plex Mono',monospace",
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-dim)',
        marginBottom: 6,
        paddingBottom: 4,
        borderBottom: '1px solid #1d2540',
      }}>{title}</div>
      {children}
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────

export default function OpenCycleConfirm({ params, onCancel, onConfirm }) {
  const [step, setStep] = useState('review'); // 'review' | 'confirming' | 'success'
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleConfirm = async () => {
    setStep('confirming');
    try {
      // Mock open_cycle — TASK-012 will wire real on-chain call
      await new Promise(r => setTimeout(r, 1400));
      setStep('success');
      setTimeout(() => {
        if (onConfirm) onConfirm();
      }, 2000);
    } catch (err) {
      setStep('review');
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setTimeout(() => { if (onCancel) onCancel(); }, 180);
  };

  // Derived display values
  const curveLabel = {
    step: 'Step',
    linear: 'Linear',
    explite: 'ExpLite',
  }[params.curveType] || params.curveType;

  const curveParams = () => {
    if (params.curveType === 'step') return [
      { l: 'Start price', v: fmtSOL(params.startPrice) + ' SOL' },
      { l: 'Step size', v: fmtNum(params.stepSize) + ' tokens/tier' },
      { l: 'Step increment', v: '+' + fmtSOL(params.stepIncrement) + ' SOL/step' },
    ];
    if (params.curveType === 'linear') return [
      { l: 'Start price', v: fmtSOL(params.startPrice) + ' SOL' },
      { l: 'End price', v: fmtSOL(params.endPrice) + ' SOL' },
    ];
    if (params.curveType === 'explite') return [
      { l: 'Start price', v: fmtSOL(params.startPrice) + ' SOL' },
      { l: 'Growth factor (k)', v: String(params.expK) },
    ];
    return [];
  };

  const rightsHours = params.rightsWindowHours || 24;

  // ── Overlay backdrop
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backdropFilter: 'blur(4px)',
    transition: 'opacity 0.18s ease',
    opacity: visible ? 1 : 0,
  };

  const cardStyle = {
    background: '#0f1225',
    border: '1px solid #252848',
    borderRadius: 16,
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
    transition: 'transform 0.18s ease, opacity 0.18s ease',
    opacity: visible ? 1 : 0,
  };

  // ── Success state
  if (step === 'success') {
    return (
      <div style={overlayStyle}>
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
            Cycle opened successfully
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace" }}>
            Redirecting to your dashboard…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div style={cardStyle}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #1d2540',
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>
              Confirm: Open Cycle
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>
              Review parameters before opening
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={step === 'confirming'}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '4px 8px', opacity: step === 'confirming' ? 0.3 : 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>

          {/* ── IMMUTABILITY WARNING ── */}
          <div style={{
            background: 'rgba(251,146,60,0.08)',
            border: '1.5px solid rgba(251,146,60,0.5)',
            borderRadius: 10,
            padding: '13px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>⚠️</span>
            <div>
              <div style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: '#FB923C',
                marginBottom: 3,
              }}>
                These parameters cannot be changed once this cycle opens.
              </div>
              <div style={{
                fontSize: 11,
                color: '#FDBA74',
                fontFamily: "'IBM Plex Mono',monospace",
                lineHeight: 1.55,
              }}>
                The curve, allocation, rights settings, and treasury routing are locked on-chain at open. Verify everything below before confirming.
              </div>
            </div>
          </div>

          {/* ── HOLDER SNAPSHOT NOTICE ── */}
          <div style={{
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 8,
            padding: '11px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>📸</span>
            <div style={{ fontSize: 11, color: '#22D3EE', fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.6 }}>
              A snapshot of current token holders will be taken when this cycle opens. Holders will receive pro-rata rights to participate before the public.
            </div>
          </div>

          {/* ── RIGHTS WINDOW NOTICE (conditional) ── */}
          {params.rightsRequired && (
            <div style={{
              background: 'rgba(139,92,246,0.07)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: 8,
              padding: '11px 14px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>⏱</span>
              <div style={{ fontSize: 11, color: '#a78bfa', fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.6 }}>
                Rights window opens immediately. Holders have <strong style={{ color: '#c4b5fd' }}>{rightsHours} hours</strong> to exercise before public sale begins.
              </div>
            </div>
          )}

          {/* ── PARAMETER RECAP ── */}
          <SectionBlock title="Supply">
            <Row label="Allocation" value={fmtNum(params.allocation) + ' tokens'} />
          </SectionBlock>

          <SectionBlock title={`Bonding Curve — ${curveLabel}`}>
            {curveParams().map(({ l, v }) => (
              <Row key={l} label={l} value={v} />
            ))}
            <Row label="Est. raise (full cycle)" value={params.totalRaiseEst?.toFixed(2) + ' SOL'} accent="#22D3EE" />
          </SectionBlock>

          <SectionBlock title="Rights">
            <Row
              label="Rights required"
              value={params.rightsRequired ? 'Yes — holders only' : 'No — open public sale'}
              accent={params.rightsRequired ? '#22D3EE' : undefined}
            />
            {params.rightsRequired && (
              <Row label="Rights window" value={`${rightsHours}h exclusive window`} accent="#a78bfa" />
            )}
          </SectionBlock>

          <SectionBlock title="Treasury Routing">
            <Row label="Creator" value={(params.creatorBps / 100).toFixed(0) + '%'} accent="#8B5CF6" />
            <Row label="Reserve" value={(params.reserveBps / 100).toFixed(0) + '%'} accent="#22D3EE" />
            <Row label="Sink" value={(params.sinkBps / 100).toFixed(0) + '%'} />
            <Row label="Protocol fee" value="2% (hardcoded)" accent="var(--text-muted)" />
            {params.totalRaiseEst > 0 && (
              <>
                <div style={{ height: 6 }} />
                <Row label="Creator receives" value={(params.totalRaiseEst * params.creatorBps / 10000).toFixed(3) + ' SOL'} accent="#8B5CF6" />
                <Row label="Reserve receives" value={(params.totalRaiseEst * params.reserveBps / 10000).toFixed(3) + ' SOL'} accent="#22D3EE" />
                <Row label="Sink receives" value={(params.totalRaiseEst * params.sinkBps / 10000).toFixed(3) + ' SOL'} />
                <Row label="Protocol receives" value={(params.totalRaiseEst * 200 / 10000).toFixed(3) + ' SOL'} accent="var(--text-muted)" />
              </>
            )}
          </SectionBlock>

          {/* ── ACTIONS ── */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              onClick={handleCancel}
              disabled={step === 'confirming'}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'var(--panel-alt)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace",
                fontWeight: 700,
                fontSize: 12,
                color: 'var(--text-muted)',
                cursor: step === 'confirming' ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
                opacity: step === 'confirming' ? 0.4 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              disabled={step === 'confirming'}
              style={{
                flex: 2,
                padding: '12px 0',
                background: step === 'confirming' ? 'rgba(255,159,28,0.5)' : '#FF9F1C',
                border: 'none',
                borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace",
                fontWeight: 700,
                fontSize: 13,
                color: '#0f1225',
                cursor: step === 'confirming' ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
                transition: 'opacity 0.15s, background 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {step === 'confirming' ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(15,18,37,0.4)',
                    borderTopColor: '#0f1225',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  OPENING…
                </>
              ) : '🚀 OPEN CYCLE'}
            </button>
          </div>

          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
            This action is irreversible. Cycle can be ended early but parameters cannot be modified.
          </div>

        </div>
      </div>

      {/* Spinner keyframe — injected inline since no global CSS */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
