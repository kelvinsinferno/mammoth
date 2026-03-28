'use client';
import { useState, useRef } from 'react';

export default function PriceChart({ data, cycleStart, launchPrice }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const W=800, H=180, PAD={t:8,r:8,b:24,l:56};
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

  const ChartSVG = () => (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', display:'block', overflow:'visible' }}
      onMouseMove={handleMove} onTouchMove={handleMove} onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="cc"><rect x={PAD.l} y={PAD.t} width={cw} height={ch}/></clipPath>
      </defs>
      {gridPrices.map((p,i) => (
        <g key={i}>
          <line x1={PAD.l} y1={toY(p)} x2={PAD.l+cw} y2={toY(p)} stroke="rgba(139,92,246,0.15)" strokeWidth="1"/>
          <text x={PAD.l-4} y={toY(p)+4} textAnchor="end" fill="#8B9EC8" fontSize="10" fontWeight="500" fontFamily="'IBM Plex Mono',monospace">{p.toFixed(4)}</text>
        </g>
      ))}
      {cycleStart && <g>
        <line x1={toX(cycleStart)} y1={PAD.t} x2={toX(cycleStart)} y2={PAD.t+ch} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
        <text x={toX(cycleStart)+4} y={PAD.t+12} fill="#A78BFA" fontSize="10" fontWeight="600" fontFamily="'IBM Plex Mono',monospace">Cycle 2</text>
      </g>}
      <polygon points={areaPts} fill="url(#ag)" clipPath="url(#cc)"/>
      <polyline points={linePts} fill="none" stroke="#22D3EE" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" clipPath="url(#cc)"/>
      {hover && <g>
        <line x1={hover.x} y1={PAD.t} x2={hover.x} y2={PAD.t+ch} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
        <circle cx={hover.x} cy={hover.y} r="4" fill="#22D3EE"/>
        <circle cx={hover.x} cy={hover.y} r="8" fill="#22D3EE" opacity="0.15"/>
      </g>}
      {[0,0.25,0.5,0.75,1].map((f,i) => {
        const idx=Math.round(f*(data.length-1));
        const d=new Date(data[idx].t);
        return (<text key={i} x={toX(idx)} y={H-4} textAnchor="middle" fill="#8B9EC8" fontSize="10" fontWeight="500" fontFamily="'IBM Plex Mono',monospace">{(d.getMonth()+1)}/{d.getDate()}</text>);
      })}
    </svg>
  );

  return (
    <>
      {/* Inline chart */}
      <div style={{ position:'relative', width:'100%', userSelect:'none' }}>
        <ChartSVG />
        {/* Expand button */}
        <button
          onClick={() => setFullscreen(true)}
          title="Expand chart"
          style={{ position:'absolute', top:6, right:6, background:'rgba(15,20,32,0.85)', border:'1px solid rgba(139,92,246,0.35)', borderRadius:5, padding:'4px 7px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#A78BFA', fontWeight:600, letterSpacing:'0.03em', backdropFilter:'blur(6px)', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#8B5CF6'; e.currentTarget.style.color='#22D3EE'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(139,92,246,0.35)'; e.currentTarget.style.color='#A78BFA'; }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 4V1h3M6 1h3v3M9 6v3H6M4 9H1V6"/>
          </svg>
          EXPAND
        </button>
        {hover && (
          <div style={{ position:'absolute', top:8, left:`clamp(8px,${(hover.x/W*100).toFixed(1)}%,calc(100% - 130px))`, background:'var(--panel)', border:'1px solid #252848', borderRadius:6, padding:'5px 10px', pointerEvents:'none', zIndex:10 }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>{hover.p.toFixed(6)} SOL</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)' }}>{new Date(hover.t).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(4,6,12,0.97)', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px', backdropFilter:'blur(8px)' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:900, background:'var(--panel)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:14, padding:'20px 16px 16px', position:'relative' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Price Chart</span>
              <button onClick={() => setFullscreen(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>✕</button>
            </div>
            {/* Full-size chart — taller */}
            <div style={{ position:'relative', width:'100%', userSelect:'none' }}>
              <svg viewBox={`0 0 ${W} ${H * 2.2}`} style={{ width:'100%', display:'block', overflow:'visible' }}
                onMouseMove={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = (e.clientX - rect.left) / rect.width * W;
                  const FPAD = {t:8,r:8,b:24,l:56};
                  const FCW = W-FPAD.l-FPAD.r, FCH = H*2.2-FPAD.t-FPAD.b;
                  const fToX = i => FPAD.l+(i/(data.length-1))*FCW;
                  const fToY = p => FPAD.t+(1-(p-minP)/rng)*FCH;
                  const idx = Math.round(((relX - FPAD.l) / FCW) * (data.length - 1));
                  if (idx >= 0 && idx < data.length) setHover({ idx, x:fToX(idx), y:fToY(data[idx].p), p:data[idx].p, t:data[idx].t });
                }}
                onMouseLeave={() => setHover(null)}
              >
                {(() => {
                  const FPAD={t:8,r:8,b:24,l:56};
                  const FCW=W-FPAD.l-FPAD.r, FCH=H*2.2-FPAD.t-FPAD.b;
                  const FH=H*2.2;
                  const fToX=i=>FPAD.l+(i/(data.length-1))*FCW;
                  const fToY=p=>FPAD.t+(1-(p-minP)/rng)*FCH;
                  const fLine=data.map((d,i)=>`${fToX(i)},${fToY(d.p)}`).join(' ');
                  const fArea=`${FPAD.l},${FPAD.t+FCH} `+data.map((d,i)=>`${fToX(i)},${fToY(d.p)}`).join(' ')+` ${FPAD.l+FCW},${FPAD.t+FCH}`;
                  return (<>
                    <defs>
                      <linearGradient id="agf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity="0.18"/><stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/></linearGradient>
                      <clipPath id="ccf"><rect x={FPAD.l} y={FPAD.t} width={FCW} height={FCH}/></clipPath>
                    </defs>
                    {gridPrices.map((p,i) => (<g key={i}>
                      <line x1={FPAD.l} y1={fToY(p)} x2={FPAD.l+FCW} y2={fToY(p)} stroke="rgba(139,92,246,0.15)" strokeWidth="1"/>
                      <text x={FPAD.l-4} y={fToY(p)+4} textAnchor="end" fill="#8B9EC8" fontSize="10" fontWeight="500" fontFamily="'IBM Plex Mono',monospace">{p.toFixed(5)}</text>
                    </g>))}
                    {cycleStart && <g>
                      <line x1={fToX(cycleStart)} y1={FPAD.t} x2={fToX(cycleStart)} y2={FPAD.t+FCH} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
                      <text x={fToX(cycleStart)+5} y={FPAD.t+14} fill="#A78BFA" fontSize="11" fontFamily="'IBM Plex Mono',monospace">Cycle 2</text>
                    </g>}
                    <polygon points={fArea} fill="url(#agf)" clipPath="url(#ccf)"/>
                    <polyline points={fLine} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" clipPath="url(#ccf)"/>
                    {hover && <g>
                      <line x1={hover.x} y1={FPAD.t} x2={hover.x} y2={FPAD.t+FCH} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
                      <circle cx={hover.x} cy={fToY(hover.p)} r="5" fill="#22D3EE"/>
                      <circle cx={hover.x} cy={fToY(hover.p)} r="10" fill="#22D3EE" opacity="0.15"/>
                    </g>}
                    {[0,0.25,0.5,0.75,1].map((f,i) => {
                      const idx=Math.round(f*(data.length-1));
                      const d=new Date(data[idx].t);
                      return (<text key={i} x={fToX(idx)} y={FH-4} textAnchor="middle" fill="#8B9EC8" fontSize="10" fontFamily="'IBM Plex Mono',monospace">{(d.getMonth()+1)}/{d.getDate()}</text>);
                    })}
                  </>);
                })()}
              </svg>
              {hover && (
                <div style={{ position:'absolute', top:12, left:`clamp(8px,${(hover.x/W*100).toFixed(1)}%,calc(100% - 140px))`, background:'rgba(12,16,32,0.95)', border:'1px solid #252848', borderRadius:6, padding:'7px 12px', pointerEvents:'none' }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:'#22D3EE', fontWeight:700 }}>{hover.p.toFixed(6)} SOL</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginTop:2 }}>{new Date(hover.t).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              )}
            </div>
            <div style={{ marginTop:10, textAlign:'center', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>click outside or ✕ to close</div>
          </div>
        </div>
      )}
    </>
  );
}
