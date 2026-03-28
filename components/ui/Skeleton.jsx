'use client';

// ─── Skeleton pulse animation ─────────────────────────────────────────────────
// Inline keyframes injected once per page.

let injected = false;

function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes skelPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style: extra = {} }) {
  if (typeof window !== 'undefined') injectStyles();
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'rgba(139,92,246,0.12)',
      animation: 'skelPulse 1.6s ease-in-out infinite',
      ...extra,
    }} />
  );
}

// ─── Skeleton for a ProjectCard ───────────────────────────────────────────────

export function SkeletonCard() {
  if (typeof window !== 'undefined') injectStyles();
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid #1d2540',
      borderRadius: 10,
      padding: '14px',
      minHeight: 160,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', animation: 'skelPulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={10} />
        </div>
        <Skeleton width={48} height={18} borderRadius={4} />
      </div>

      {/* Price row */}
      <Skeleton width="50%" height={20} style={{ marginBottom: 10 }} />

      {/* Progress bar */}
      <Skeleton width="100%" height={6} borderRadius={3} style={{ marginBottom: 10 }} />

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton width="33%" height={10} />
        <Skeleton width="33%" height={10} />
        <Skeleton width="33%" height={10} />
      </div>
    </div>
  );
}

// ─── Skeleton grid (6 cards) ──────────────────────────────────────────────────

export function SkeletonCardGrid({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── Skeleton for chart + cycle panel ────────────────────────────────────────

export function SkeletonChartPanel() {
  if (typeof window !== 'undefined') injectStyles();
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid #1d2540', borderRadius: 10, padding: '12px 8px', marginBottom: 12 }}>
      <Skeleton width="100%" height={180} borderRadius={6} />
    </div>
  );
}

export function SkeletonCyclePanel() {
  if (typeof window !== 'undefined') injectStyles();
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid #1d2540', borderRadius: 10, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <Skeleton width={80} height={14} />
        <Skeleton width={50} height={18} borderRadius={4} />
      </div>
      <Skeleton width="100%" height={6} borderRadius={3} style={{ marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'var(--panel-alt)', border: '1px solid #1a2438', borderRadius: 6, padding: '9px 11px' }}>
            <Skeleton width="50%" height={10} style={{ marginBottom: 6 }} />
            <Skeleton width="70%" height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton list item (creator dashboard) ───────────────────────────────────

export function SkeletonListItem() {
  if (typeof window !== 'undefined') injectStyles();
  return (
    <div style={{ background: 'var(--panel-alt)', border: '1px solid #1d2540', borderRadius: 10, padding: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Skeleton width="45%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="65%" height={10} />
        </div>
        <Skeleton width={16} height={16} borderRadius={3} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}
