'use client';
import { useState, useRef } from 'react';

export default function PriceChart({ data, cycleStart }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const W=800, H=180, PAD={t:8,r:8,b:24,l:52};
  const cw=W-PAD.l-PAD.r, ch=H-PAD.t-PAD.b;
  const prices=data.map(d=>d.p), minP=Math.min(...prices), maxP=Math.max(...prices), rng=maxP-minP||0.001;
  const toX=i=>PAD.l+(i/(data.length-1))*cw;
  const toY=p=>PAD.t+(1-(p-minP)/rng)*ch;
  const linePts=data.map((d,i)=>`${toX(i)},${toY(d.p)}`).join(' ');
  const areaPts=`${PAD.l},${PAD.t+ch} `+data.map((d,i)=>`${toX(i)},${toY(d.p)}`).join(' ')+` ${PAD.l+cw},${PAD.t+ch}`;
  const gridPrices=[minP,minP+rng*0.33,minP+rng*0.66,maxP];

  const handleMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relX = (clientX - rect.left) / rect.width * W;
    const idx = Math.round(((relX - PAD.l) / cw) * (data.length - 1));
    if (idx >= 0 && idx < data.length) setHover({ idx, x:toX(idx), y:toY(data[idx].p), p:data[idx].p, t:data[idx].t });
  };

  return (
    <div style={{ position:'relative', width:'100%', userSelect:'none' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', display:'block', overflow:'visible' }}
        onMouseMove={handleMove} onTouchMove={handleMove} onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity="0.15"/><stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/></linearGradient>
          <clipPath id="cc"><rect x={PAD.l} y={PAD.t} width={cw} height={ch}/></clipPath>
        </defs>
        {gridPrices.map((p,i) => (
          <g key={i}>
            <line x1={PAD.l} y1={toY(p)} x2={PAD.l+cw} y2={toY(p)} stroke="var(--border)" strokeWidth="1"/>
            <text x={PAD.l-4} y={toY(p)+4} textAnchor="end" fill="var(--text-muted)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">{p.toFixed(4)}</text>
          </g>
        ))}
        {cycleStart && <g>
          <line x1={toX(cycleStart)} y1={PAD.t} x2={toX(cycleStart)} y2={PAD.t+ch} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
          <text x={toX(cycleStart)+4} y={PAD.t+12} fill="var(--text-dim)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">Cycle 2</text>
        </g>}
        <polygon points={areaPts} fill="url(#ag)" clipPath="url(#cc)"/>
        <polyline points={linePts} fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" clipPath="url(#cc)"/>
        {hover && <g>
          <line x1={hover.x} y1={PAD.t} x2={hover.x} y2={PAD.t+ch} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
          <circle cx={hover.x} cy={hover.y} r="4" fill="#8B5CF6"/>
          <circle cx={hover.x} cy={hover.y} r="7" fill="#8B5CF6" opacity="0.2"/>
        </g>}
        {[0,0.25,0.5,0.75,1].map((f,i) => { const idx=Math.round(f*(data.length-1)); const d=new Date(data[idx].t); return (<text key={i} x={toX(idx)} y={H-6} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">{(d.getMonth()+1)}/{d.getDate()}</text>); })}
      </svg>
      {hover && <div style={{ position:'absolute', top:8, left:`clamp(8px,${(hover.x/W*100).toFixed(1)}%,calc(100% - 120px))`, background:'var(--panel)', border:'1px solid #252848', borderRadius:6, padding:'5px 10px', pointerEvents:'none' }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>{hover.p.toFixed(6)} SOL</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)' }}>{new Date(hover.t).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
      </div>}
    </div>
  );
}
