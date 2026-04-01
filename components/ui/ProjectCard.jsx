'use client';
import { useState } from 'react';
import TokenLogo, { getTokenPalette } from './TokenLogo';

export default function ProjectCard({ p, onClick, theme = 'dark' }) {
  const up = p.change >= 0;
  const [hov, setHov] = useState(false);
  const nearFull = p.status === 'ACTIVE' && p.progress >= 75;
  const pal = getTokenPalette(p.id);
  const isActive = p.status === 'ACTIVE';

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:hov?'var(--card-hover)':'var(--card-bg)', border:`1px solid ${hov?pal.accent+'77':pal.accent+'28'}`, borderRadius:12, padding:'16px', cursor:'pointer', transition:'all 0.18s', position:'relative', overflow:'hidden', boxShadow:hov?`0 0 32px ${pal.glow}, 0 4px 24px rgba(0,0,0,0.5)`:'0 2px 16px rgba(0,0,0,0.4)' }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:pal.glow.replace('0.5','0.07').replace('0.45','0.07').replace('0.35','0.07'), pointerEvents:'none', filter:'blur(20px)' }}/>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flexShrink:0, filter:hov?`drop-shadow(0 0 8px ${pal.accent}99)`:'none', transition:'filter 0.18s' }}>
            <TokenLogo id={p.id} size={40} image={p.image || null}/>
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', letterSpacing:'-0.01em' }}>{p.name}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:'0.08em', color:pal.accent, background:pal.accent+'18', border:`1px solid ${pal.accent}44`, borderRadius:3, padding:'1px 6px', fontWeight:700 }}>${p.ticker}</span>
              {p.operatorType === 'ai_autonomous' && (
                <span title="This project is operated by an autonomous AI agent" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:'0.06em', color:'#22D3EE', background:'rgba(34,211,238,0.10)', border:'1px solid rgba(34,211,238,0.30)', borderRadius:3, padding:'1px 5px', fontWeight:700 }}>AI</span>
              )}
              {p.operatorType === 'ai_assisted' && (
                <span title="This project is AI-assisted" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:'0.06em', color:'#A78BFA', background:'rgba(167,139,250,0.10)', border:'1px solid rgba(167,139,250,0.25)', borderRadius:3, padding:'1px 5px', fontWeight:700 }}>AI+</span>
              )}
            </div>
            <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>Cycle #{p.cycle} · {p.raised} raised</span>
          </div>
        </div>
        <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, letterSpacing:'0.06em', fontFamily:"'IBM Plex Mono',monospace", padding:'3px 9px', borderRadius:4, background:isActive?pal.accent+'20':'rgba(55,60,90,0.15)', color:isActive?pal.accent:'var(--text-muted)', border:`1px solid ${isActive?pal.accent+'55':'rgba(55,60,90,0.35)'}`, flexShrink:0 }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:isActive?pal.accent:'var(--text-muted)', display:'inline-block', animation:isActive?'blink 2s ease-in-out infinite':'none', boxShadow:isActive?`0 0 8px ${pal.accent}, 0 0 16px ${pal.accent}55`:'none' }}/>
          {isActive ? 'OPEN' : 'BETWEEN'}
        </span>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:16, color:pal.accent, letterSpacing:'-0.02em', textShadow:hov?`0 0 12px ${pal.accent}88`:'none', transition:'text-shadow 0.18s' }}>
            {p.price.toFixed(5)}<span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:400, marginLeft:4 }}>SOL</span>
          </div>
          <div style={{ marginTop:3, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color:up?'#22D3EE':'#F43F5E', textShadow:up?'0 0 8px rgba(34,211,238,0.6)':'0 0 8px rgba(244,63,94,0.6)' }}>
              {up ? '▲' : '▼'} {Math.abs(p.change).toFixed(1)}%
            </span>
            <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>{p.volume >= 1000 ? `${(p.volume/1000).toFixed(1)}K` : p.volume} vol</span>
          </div>
        </div>
        <svg width={72} height={30} viewBox="0 0 72 30" style={{ display:'block', flexShrink:0 }}>
          <polyline points={p.sparkline.map((v,i) => { const mn=Math.min(...p.sparkline),rng=Math.max(...p.sparkline)-mn||1; return `${(i/(p.sparkline.length-1))*72},${30-((v-mn)/rng)*27-1.5}`; }).join(' ')} fill="none" stroke={pal.accent} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </div>

      <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>cycle fill</span>
          <span style={{ fontSize:10, color:pal.accent, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{p.progress}%</span>
        </div>
        <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${p.progress}%`, background:isActive?`linear-gradient(90deg,${pal.accent2},${pal.accent})`:'var(--bar-empty)', borderRadius:2, transition:'width 0.4s ease', boxShadow:isActive?`0 0 12px ${pal.accent}cc, 0 0 24px ${pal.accent}44`:'none' }}/>
        </div>
        {nearFull && (
          <div style={{ marginTop:5, fontSize:10, color:'#F59E0B', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, textShadow:'0 0 8px rgba(245,158,11,0.7)' }}>
            ⚡ {100-p.progress}% remaining — filling fast
          </div>
        )}
      </div>
    </div>
  );
}
