'use client';
import { fmtTokens } from '../../lib/utils';

export function CycleBadge({ status }) {
  const cfg = {
    draft:      { color:'var(--text-dim)', bg:'rgba(112,85,168,0.1)',  border:'rgba(112,85,168,0.25)',  label:'DRAFT'      },
    open:       { color:'#22D3EE', bg:'rgba(139,92,246,0.13)', border:'rgba(139,92,246,0.28)',  label:'OPEN', pulse:true },
    completed:  { color:'#10B981', bg:'rgba(16,185,129,0.1)',   border:'rgba(16,185,129,0.25)',  label:'COMPLETED'  },
    terminated: { color:'#F43F5E', bg:'rgba(248,113,113,0.08)', border:'rgba(248,113,113,0.2)', label:'TERMINATED' },
  }[status] || {};
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, letterSpacing:'0.06em', fontFamily:"'IBM Plex Mono',monospace", padding:'3px 9px', borderRadius:4, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      {cfg.pulse && <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, display:'inline-block', animation:'blink 2s ease-in-out infinite' }}/>}
      {cfg.label}
    </span>
  );
}

export function CycleProgress({ sold, allocation, status }) {
  const pct = allocation > 0 ? Math.min(100, Math.round(sold/allocation*100)) : 0;
  const active = status === 'open';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{fmtTokens(sold)} / {fmtTokens(allocation)} sold</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>{pct}%</span>
      </div>
      <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:active?'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)':'var(--bar-empty)', borderRadius:3, transition:'width 0.4s' }}/>
      </div>
    </div>
  );
}
