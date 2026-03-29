import { ImageResponse } from '@vercel/og';
import { MOCK_PROJECTS } from '../../../lib/data';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get('mint') || '1';

  const project = MOCK_PROJECTS.find(p => String(p.mint || p.id) === String(mint));

  const name    = project?.name    || 'Mammoth Token';
  const ticker  = project?.ticker  || '???';
  const price   = project?.price   ? project.price.toFixed(5) : '—';
  const change  = project?.change  ?? 0;
  const status  = project?.status  || 'BETWEEN';
  const raised  = project?.raised  || '0 SOL';
  const cycle   = project?.cycle   || 1;
  const pct     = project?.cycleData
    ? Math.round((project.cycleData.sold / project.cycleData.allocation) * 100)
    : 0;
  const comingSoon = status === 'COMING_SOON';
  const goPublicAt = project?.goPublicAt;
  const up = change >= 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #080c14 0%, #0d1420 60%, #0a0f1e 100%)',
          padding: '40px 48px',
          fontFamily: 'monospace',
        }}>

        {/* Top: Mammoth brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B5CF6', boxShadow: '0 0 12px #8B5CF6' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#7d8590', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mammoth Protocol</span>
        </div>

        {/* Center: Token info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 52, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>{name}</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#30363d', background: '#161b22', border: '2px solid #252848', borderRadius: 8, padding: '4px 14px' }}>${ticker}</span>
          </div>

          {comingSoon && goPublicAt ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, color: '#A78BFA', fontWeight: 700, letterSpacing: '0.08em' }}>📅 COMING SOON</span>
              </div>
              <span style={{ fontSize: 16, color: '#7d8590' }}>
                {new Date(goPublicAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: '#22D3EE', letterSpacing: '-0.02em', textShadow: '0 0 24px rgba(34,211,238,0.5)' }}>{price}</span>
              <span style={{ fontSize: 18, color: '#7d8590' }}>SOL</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: up ? '#22D3EE' : '#F43F5E' }}>{up ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Bottom stats bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#0d1117', border: '1px solid #1d2540', borderRadius: 12, overflow: 'hidden' }}>
          {comingSoon ? (
            <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: '#1d2540', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg,#7C3AED,#22D3EE)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#A78BFA' }}>NOT YET OPEN</span>
              </div>
            </div>
          ) : (
            <>
              {[
                { label: 'STATUS', value: status === 'ACTIVE' ? '● OPEN' : 'BETWEEN', color: status === 'ACTIVE' ? '#22D3EE' : '#7d8590' },
                { label: 'CYCLE', value: `#${cycle}`, color: '#A78BFA' },
                { label: 'RAISED', value: raised, color: '#FF9F1C' },
                { label: 'FILL', value: `${pct}%`, color: '#10B981' },
              ].map(({ label, value, color }, i, arr) => (
                <div key={label} style={{ flex: 1, padding: '14px 20px', borderRight: i < arr.length - 1 ? '1px solid #1d2540' : 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#7d8590', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color }}>{value}</span>
                </div>
              ))}
            </>
          )}

          {/* Cycle progress bar (full width bottom) */}
          {!comingSoon && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#1d2540' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)' }} />
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
