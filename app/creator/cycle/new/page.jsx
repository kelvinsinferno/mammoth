'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../../lib/AppContext';
import OpenCycleConfirm from '../../../../components/modals/OpenCycleConfirm';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtSOL(n) { return n < 0.001 ? n.toFixed(7) : n.toFixed(5); }
function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// Compute step curve preview points (no floats — mirrors on-chain math)
function previewStepCurve({ allocation, startPrice, stepSize, stepIncrement, points = 60 }) {
  const out = [];
  const step = Math.max(1, Math.floor(allocation / points));
  for (let sold = 0; sold <= allocation; sold += step) {
    const stepIndex = Math.floor(sold / stepSize);
    const price = startPrice + stepIndex * stepIncrement;
    out.push({ sold, price });
  }
  return out;
}

function previewLinearCurve({ allocation, startPrice, endPrice, points = 60 }) {
  const out = [];
  const step = Math.max(1, Math.floor(allocation / points));
  for (let sold = 0; sold <= allocation; sold += step) {
    const price = startPrice + (endPrice - startPrice) * (sold / allocation);
    out.push({ sold, price });
  }
  return out;
}

function previewExpCurve({ allocation, startPrice, k = 3, points = 60 }) {
  const out = [];
  const step = Math.max(1, Math.floor(allocation / points));
  for (let sold = 0; sold <= allocation; sold += step) {
    const t = sold / allocation;
    const price = startPrice * Math.exp(k * t);
    out.push({ sold, price });
  }
  return out;
}

// ─── mini SVG chart ─────────────────────────────────────────────────────────

function CurvePreviewChart({ points, color = '#8B5CF6' }) {
  if (!points || points.length < 2) return null;
  const W = 340, H = 100, PAD = 10;
  const prices = points.map(p => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const maxSold = points[points.length - 1].sold || 1;

  const toX = (sold) => PAD + (sold / maxSold) * (W - PAD * 2);
  const toY = (price) => H - PAD - ((price - minP) / range) * (H - PAD * 2);

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.sold).toFixed(1)} ${toY(p.price).toFixed(1)}`).join(' ');
  const fill = `${d} L ${toX(points[points.length - 1].sold).toFixed(1)} ${H} L ${PAD} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 100, display: 'block' }}>
      <defs>
        <linearGradient id="cgfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#cgfill)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

// ─── field components ────────────────────────────────────────────────────────

function Field({ label, hint, children, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && !error && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 3 }}>{hint}</div>}
      {error && <div style={{ fontSize: 10, color: '#F43F5E', fontFamily: "'IBM Plex Mono',monospace", marginTop: 3 }}>⚠ {error}</div>}
    </div>
  );
}

function Input({ value, onChange, type = 'text', min, max, step, placeholder }) {
  return (
    <input
      type={type} value={value} onChange={onChange} min={min} max={max} step={step} placeholder={placeholder}
      style={{ width: '100%', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", outline: 'none', boxSizing: 'border-box' }}
      onFocus={e => e.currentTarget.style.borderColor = '#8B5CF6'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width: '100%', background: 'var(--panel-alt)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", outline: 'none', cursor: 'pointer' }}
      onFocus={e => e.currentTarget.style.borderColor = '#8B5CF6'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange}
        style={{ width: 36, height: 20, borderRadius: 10, background: checked ? '#8B5CF6' : 'var(--panel-alt)', border: `1px solid ${checked ? '#8B5CF6' : 'var(--border)'}`, position: 'relative', transition: 'all 0.15s', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: checked ? '#fff' : 'var(--text-muted)', transition: 'left 0.15s' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: "'IBM Plex Mono',monospace" }}>{label}</span>
    </label>
  );
}

// ─── section header ──────────────────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ borderBottom: '1px solid #1d2540', paddingBottom: 10, marginBottom: 18 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── bps split editor ────────────────────────────────────────────────────────

function BpsSplit({ creator, reserve, sink, onChange }) {
  const total = creator + reserve + sink;
  const valid = total === 9800;
  const remaining = 9800 - creator - reserve;
  // sink is auto-derived
  const handleCreator = (v) => {
    const c = Math.max(0, Math.min(9800, parseInt(v) || 0));
    const r = Math.max(0, Math.min(9800 - c, reserve));
    onChange({ creator: c, reserve: r, sink: Math.max(0, 9800 - c - r) });
  };
  const handleReserve = (v) => {
    const r = Math.max(0, Math.min(9800 - creator, parseInt(v) || 0));
    onChange({ creator, reserve: r, sink: Math.max(0, 9800 - creator - r) });
  };

  return (
    <div>
      <div className="bps-grid-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        {[
          { label: 'Creator', key: 'creator', val: creator, handler: handleCreator, desc: 'To your wallet' },
          { label: 'Reserve', key: 'reserve', val: reserve, handler: handleReserve, desc: 'Protocol reserve' },
          { label: 'Sink', key: 'sink', val: sink, handler: null, desc: 'Auto-computed' },
        ].map(({ label, val, handler, desc }) => (
          <div key={label} style={{ background: 'var(--panel-alt)', border: `1px solid ${handler === null ? '#1d2540' : 'var(--border)'}`, borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 4 }}>{label}</div>
            {handler !== null ? (
              <input type="number" value={val} onChange={e => handler(e.target.value)} min={0} max={9800} step={100}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", outline: 'none', padding: 0 }}
              />
            ) : (
              <div style={{ fontSize: 13, color: '#22D3EE', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>{val}</div>
            )}
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{(val / 100).toFixed(0)}% · {desc}</div>
          </div>
        ))}
      </div>
      {/* BPS bar */}
      <div style={{ height: 4, background: 'var(--panel-alt)', borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: `${creator / 98}%`, background: '#8B5CF6', transition: 'width 0.2s' }} />
        <div style={{ width: `${reserve / 98}%`, background: '#22D3EE', transition: 'width 0.2s' }} />
        <div style={{ width: `${sink / 98}%`, background: '#1d2540', transition: 'width 0.2s' }} />
        <div style={{ flex: 1, background: '#FF4466', opacity: valid ? 0 : 0.6 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace" }}>2% protocol fee hardcoded</div>
        <div style={{ fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", color: valid ? '#22D3EE' : '#F43F5E', fontWeight: 600 }}>
          {valid ? '✓ 100% allocated' : `${(total / 100).toFixed(0)}% / 98%`}
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  // basic
  projectId: '',
  cycleId: '',
  allocation: 1000000,
  // curve
  curveType: 'step',
  startPrice: 0.00010,
  stepSize: 10000,
  stepIncrement: 0.00005,
  endPrice: 0.00050,      // linear only
  expK: 3,                 // explite only
  // rights
  rightsRequired: false,
  rightsWindowHours: 24,   // hours holders have before public sale
  // treasury
  creatorBps: 7000,
  reserveBps: 1800,
  sinkBps: 1000,
};

export default function NewCyclePage() {
  const router = useRouter();
  const { myProjects, walletState } = useApp();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Pre-fill projectId from ?mint=... so the "Open New Cycle →" button on the
  // dashboard lands here with the right project already selected. Read
  // window.location.search directly so the page stays static-prerenderable
  // (useSearchParams forces dynamic and broke the build).
  useEffect(() => {
    if (typeof window === 'undefined' || form.projectId) return;
    const params = new URLSearchParams(window.location.search);
    const mint = params.get('mint');
    if (!mint) return;
    const match = myProjects?.find(p => (p.mint || p.id) === mint);
    if (match) {
      setForm(f => ({ ...f, projectId: match.mint || match.id }));
    }
  }, [myProjects, form.projectId]);

  const set = (key) => (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
    setErrors(er => ({ ...er, [key]: null }));
  };

  // Live curve preview
  const curvePoints = useMemo(() => {
    if (form.curveType === 'step') return previewStepCurve({ allocation: form.allocation, startPrice: form.startPrice, stepSize: form.stepSize, stepIncrement: form.stepIncrement });
    if (form.curveType === 'linear') return previewLinearCurve({ allocation: form.allocation, startPrice: form.startPrice, endPrice: form.endPrice });
    if (form.curveType === 'explite') return previewExpCurve({ allocation: form.allocation, startPrice: form.startPrice, k: form.expK });
    return [];
  }, [form.curveType, form.allocation, form.startPrice, form.stepSize, form.stepIncrement, form.endPrice, form.expK]);

  const endPrice = curvePoints.length ? curvePoints[curvePoints.length - 1].price : 0;
  const totalRaiseEst = curvePoints.reduce((acc, pt, i) => {
    if (i === 0) return acc;
    const prev = curvePoints[i - 1];
    acc += (pt.sold - prev.sold) * prev.price;
    return acc;
  }, 0);

  const validate = () => {
    const e = {};
    if (!form.projectId) e.projectId = 'Select a project';
    if (form.allocation < 1000) e.allocation = 'Min allocation is 1,000 tokens';
    if (form.startPrice <= 0) e.startPrice = 'Start price must be > 0';
    if (form.curveType === 'step' && form.stepSize < 100) e.stepSize = 'Step size must be ≥ 100';
    if (form.curveType === 'step' && form.stepIncrement <= 0) e.stepIncrement = 'Step increment must be > 0';
    if (form.curveType === 'linear' && form.endPrice <= form.startPrice) e.endPrice = 'End price must be > start price';
    if ((form.creatorBps + form.reserveBps + form.sinkBps) !== 9800) e.bps = 'Treasury split must total 98%';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    // Open the confirm modal — actual deploy happens inside it
    setShowConfirm(true);
  };

  const handleConfirmSuccess = () => {
    setShowConfirm(false);
    setSubmitted(true);
    setTimeout(() => router.push('/creator'), 2000);
  };

  if (walletState.status !== 'connected') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>Wallet required</div>
          <div>Connect a wallet to create a cycle</div>
          <button onClick={() => router.push('/')} style={{ marginTop: 16, background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'IBM Plex Mono',monospace" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>Cycle created</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Redirecting to dashboard…</div>
        </div>
      </div>
    );
  }

  const bpsValid = (form.creatorBps + form.reserveBps + form.sinkBps) === 9800;
  const curveColor = form.curveType === 'linear' ? '#22D3EE' : form.curveType === 'explite' ? '#a78bfa' : '#8B5CF6';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1d2540', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.push('/creator')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>←</button>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Create Cycle</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 1 }}>Configure issuance parameters</div>
        </div>
      </div>

      <div className="new-cycle-grid" style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── LEFT COLUMN: Form ─────────────────────────────────── */}
        <div>

          {/* PROJECT */}
          <Section title="Project" subtitle="Which token is this cycle for?">
            <Field label="Token" error={errors.projectId}>
              {myProjects.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", padding: '10px 0' }}>
                  No tokens yet. <span style={{ color: '#8B5CF6', cursor: 'pointer' }} onClick={() => router.push('/')}>Launch one first →</span>
                </div>
              ) : (
                <Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                  options={[{ value: '', label: '— Select token —' }, ...myProjects.map(p => ({ value: p.id, label: `${p.name} / $${p.ticker}` }))]}
                />
              )}
            </Field>
          </Section>

          {/* SUPPLY */}
          <Section title="Supply" subtitle="How many tokens in this cycle?">
            <Field label="Cycle allocation" hint={`${fmtNum(form.allocation)} tokens`} error={errors.allocation}>
              <Input type="number" value={form.allocation} onChange={set('allocation')} min={1000} step={1000} />
            </Field>
          </Section>

          {/* CURVE */}
          <Section title="Bonding Curve" subtitle="Price discovery mechanism">
            <Field label="Curve type">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 4 }}>
                {[
                  { id: 'step', label: 'Step', desc: 'Tiered price steps' },
                  { id: 'linear', label: 'Linear', desc: 'Smooth gradient' },
                  { id: 'explite', label: 'Exp', desc: 'Accelerating' },
                ].map(ct => (
                  <button key={ct.id} onClick={() => setForm(f => ({ ...f, curveType: ct.id }))}
                    style={{ padding: '10px 8px', background: form.curveType === ct.id ? 'rgba(139,92,246,0.15)' : 'var(--panel-alt)', border: `1px solid ${form.curveType === ct.id ? '#8B5CF6' : 'var(--border)'}`, borderRadius: 7, cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 12, color: form.curveType === ct.id ? '#8B5CF6' : 'var(--text)' }}>{ct.label}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{ct.desc}</div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Start price (SOL)" hint={`${fmtSOL(form.startPrice)} SOL per token`} error={errors.startPrice}>
              <Input type="number" value={form.startPrice} onChange={set('startPrice')} min={0.000001} step={0.00001} />
            </Field>

            {form.curveType === 'step' && (
              <>
                <Field label="Step size (tokens per tier)" hint={`Price increases every ${fmtNum(form.stepSize)} tokens`} error={errors.stepSize}>
                  <Input type="number" value={form.stepSize} onChange={set('stepSize')} min={100} step={100} />
                </Field>
                <Field label="Step increment (SOL)" hint={`+${fmtSOL(form.stepIncrement)} SOL per step`} error={errors.stepIncrement}>
                  <Input type="number" value={form.stepIncrement} onChange={set('stepIncrement')} min={0.000001} step={0.00001} />
                </Field>
              </>
            )}

            {form.curveType === 'linear' && (
              <Field label="End price (SOL)" hint={`Gradual increase to ${fmtSOL(form.endPrice)} SOL`} error={errors.endPrice}>
                <Input type="number" value={form.endPrice} onChange={set('endPrice')} min={0.000001} step={0.00001} />
              </Field>
            )}

            {form.curveType === 'explite' && (
              <Field label="Growth factor (k)" hint="Higher k = steeper curve. Typical: 1–5">
                <Input type="number" value={form.expK} onChange={set('expK')} min={0.1} max={10} step={0.1} />
              </Field>
            )}
          </Section>

          {/* RIGHTS */}
          <Section title="Rights" subtitle="Require prior holder entitlement to buy?">
            <Toggle checked={form.rightsRequired} onChange={() => setForm(f => ({ ...f, rightsRequired: !f.rightsRequired }))} label="Require rights to buy" />
            {form.rightsRequired && (
              <div style={{ marginTop: 12 }}>
                <div style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#22D3EE', fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.6 }}>
                    A holder snapshot will be taken at cycle open.<br />
                    Rights are verified via Merkle proof on-chain.<br />
                    Snapshot slot is recorded and immutable once open.
                  </div>
                </div>
                <Field label="Rights window (hours)" hint="How long holders have before public sale opens">
                  <Input type="number" value={form.rightsWindowHours} onChange={set('rightsWindowHours')} min={1} max={168} step={1} />
                </Field>
              </div>
            )}
          </Section>

          {/* TREASURY */}
          <Section title="Treasury Routing" subtitle="How SOL raised is split (excluding 2% protocol fee)">
            <BpsSplit
              creator={form.creatorBps}
              reserve={form.reserveBps}
              sink={form.sinkBps}
              onChange={({ creator, reserve, sink }) => setForm(f => ({ ...f, creatorBps: creator, reserveBps: reserve, sinkBps: sink }))}
            />
            {errors.bps && <div style={{ fontSize: 10, color: '#F43F5E', fontFamily: "'IBM Plex Mono',monospace", marginTop: 6 }}>⚠ {errors.bps}</div>}
          </Section>

        </div>

        {/* ── RIGHT COLUMN: Live preview ────────────────────────── */}
        <div className="new-cycle-preview" style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid #252848', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Live preview</div>

            {/* Chart */}
            <div style={{ background: 'var(--panel-alt)', borderRadius: 8, padding: '10px 8px 4px', marginBottom: 16 }}>
              <CurvePreviewChart points={curvePoints} color={curveColor} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginTop: 2 }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace" }}>0</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace" }}>{fmtNum(form.allocation)}</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { k: 'Allocation', v: fmtNum(form.allocation) + ' tokens' },
                { k: 'Start price', v: fmtSOL(form.startPrice) + ' SOL' },
                { k: 'End price', v: fmtSOL(endPrice) + ' SOL', c: curveColor },
                { k: 'Est. raise', v: totalRaiseEst.toFixed(1) + ' SOL', c: '#22D3EE' },
                { k: 'Protocol fee', v: '2% (200 BPS)', c: 'var(--text-dim)' },
                { k: 'Rights', v: form.rightsRequired ? 'Required' : 'Open', c: form.rightsRequired ? '#22D3EE' : 'var(--text-dim)' },
              ].map(({ k, v, c }) => (
                <div key={k} style={{ background: 'var(--panel-alt)', border: '1px solid #1d2540', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 11, color: c || 'var(--text)', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Treasury preview */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1d2540' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Treasury routing</div>
              {[
                { label: 'Creator', bps: form.creatorBps, color: '#8B5CF6' },
                { label: 'Reserve', bps: form.reserveBps, color: '#22D3EE' },
                { label: 'Sink', bps: form.sinkBps, color: '#1d2540' },
                { label: 'Protocol', bps: 200, color: '#F43F5E' },
              ].map(({ label, bps, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: "'IBM Plex Mono',monospace", flex: 1 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono',monospace" }}>{(bps / 100).toFixed(0)}%</div>
                  <div style={{ fontSize: 11, color: color === '#1d2540' ? 'var(--text-muted)' : color, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>
                    {(totalRaiseEst * bps / 10000).toFixed(2)} SOL
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          {errors.submit && (
            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#F43F5E', fontFamily: "'IBM Plex Mono',monospace" }}>
              ⚠ {errors.submit}
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting || !bpsValid}
            style={{ width: '100%', padding: '13px 0', background: bpsValid ? '#8B5CF6' : 'var(--panel-alt)', border: 'none', borderRadius: 8, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13, color: bpsValid ? '#fff' : 'var(--text-muted)', cursor: bpsValid ? 'pointer' : 'not-allowed', letterSpacing: '0.04em', transition: 'opacity 0.15s', opacity: submitting ? 0.6 : 1 }}>
            REVIEW & OPEN CYCLE →
          </button>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono',monospace", textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
            Cycle params are immutable once opened.<br />Snapshot taken at open slot.
          </div>
        </div>

      </div>

      {/* ── Open Cycle Confirm Modal ── */}
      {showConfirm && (
        <OpenCycleConfirm
          params={{
            allocation: form.allocation,
            curveType: form.curveType,
            startPrice: form.startPrice,
            stepSize: form.stepSize,
            stepIncrement: form.stepIncrement,
            endPrice: form.endPrice,
            expK: form.expK,
            rightsRequired: form.rightsRequired,
            rightsWindowHours: form.rightsWindowHours,
            creatorBps: form.creatorBps,
            reserveBps: form.reserveBps,
            sinkBps: form.sinkBps,
            totalRaiseEst: totalRaiseEst,
          }}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmSuccess}
        />
      )}
    </div>
  );
}
