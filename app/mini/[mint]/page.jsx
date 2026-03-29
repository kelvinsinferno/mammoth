'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_PROJECTS } from '../../../lib/data';
import { useApp } from '../../../lib/AppContext';
import { computeStepCurve } from '../../../lib/curves';
import { savePurchase } from '../../../views/ProjectDetail';
import WalletModal from '../../../components/wallet/WalletModal';
import PriceChart from '../../../components/charts/PriceChart';

const BASE = 'https://mammoth-protocol.vercel.app';

const FAKE_BARS = Array.from({length:36},(_,i)=>18+Math.abs(Math.sin(i*0.8+1.2)*28+Math.sin(i*0.3)*14));

function pad(n) { return String(n).padStart(2,'0'); }

function Countdown({ goPublicAt, ticker }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(()=>tick(n=>n+1),1000); return ()=>clearInterval(t); },[]);
  const diff = Math.max(0, new Date(goPublicAt) - Date.now());
  const days = Math.floor(diff/86400000);
  const hrs  = Math.floor((diff%86400000)/3600000);
  const mins = Math.floor((diff%3600000)/60000);
  const secs = Math.floor((diff%60000)/1000);
  return (
    <div style={{ position:'relative', borderRadius:12, overflow:'hidden', marginBottom:12 }}>
      <div style={{ padding:'10px 8px 6px', filter:'blur(2px)', opacity:0.15, pointerEvents:'none' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:80 }}>
          {FAKE_BARS.map((h,i)=><div key={i} style={{ flex:1, borderRadius:'2px 2px 0 0', background:'linear-gradient(180deg,#8B5CF6,#22D3EE)', height:`${h}px` }}/>)}
        </div>
        <div style={{ height:1, background:'#252848', margin:'3px 2px 0' }}/>
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(8,12,20,0.8)', backdropFilter:'blur(3px)' }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#A78BFA', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>
          ${ticker} launches in
        </div>
        <div style={{ display:'flex', gap:10, marginBottom:8 }}>
          {[[days,'DAYS'],[hrs,'HRS'],[mins,'MIN'],[secs,'SEC']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:8, padding:'8px 10px', minWidth:48 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:22, color:'#fff', lineHeight:1 }}>{pad(v)}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'#A78BFA', marginTop:4, letterSpacing:'0.1em' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#7d8590' }}>
          {new Date(goPublicAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {new Date(goPublicAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
}

export default function MiniPage() {
  const params = useParams();
  const mint = params?.mint;
  const { walletState, setWalletState, connection, getWalletAdapter } = useApp();
  const [project, setProject] = useState(null);
  const [tab, setTab] = useState('buy');
  const [sol, setSol] = useState('');
  const [txState, setTxState] = useState('idle');
  const [receipt, setReceipt] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const found = MOCK_PROJECTS.find(p => String(p.mint||p.id) === String(mint));
    setProject(found || null);
  }, [mint]);

  // Telegram WebApp integration
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.BackButton.show();
      tg.BackButton.onClick(() => window.history.back());
    }
  }, []);

  const wallet = walletState.status === 'connected';
  const isProcessing = txState === 'awaiting' || txState === 'loading';
  const solNum = parseFloat(sol) || 0;
  const cycle = project?.cycleData;
  const comingSoon = project?.status === 'COMING_SOON';

  const quote = (() => {
    if (!cycle || solNum <= 0) return null;
    if (cycle.curveType === 'Step') return computeStepCurve({ solIn:solNum, sold:cycle.sold, allocation:cycle.allocation, startPrice:cycle.basePrice||cycle.currentPrice, stepSize:cycle.stepSize||5000, stepIncrement:cycle.stepIncrement||0.00022 });
    const fee = solNum*0.02, net = solNum-fee;
    return { tokensOut: Math.floor(net/(cycle.currentPrice||0.001)), fee, effectivePrice:cycle.currentPrice };
  })();
  const tokensOut = quote?.tokensOut || 0;

  const presets = (() => {
    if (!cycle) return [0.01,0.05,0.1,0.25];
    const remaining = cycle.allocation - cycle.sold;
    const val = remaining * (cycle.currentPrice||0.001);
    return [0.05,0.10,0.25,0.50].map(p => {
      const raw = val*p;
      const dec = raw<0.01 ? Math.max(2,Math.ceil(-Math.log10(raw))+1) : 2;
      return parseFloat(raw.toFixed(dec));
    });
  })();

  const handleBuy = async () => {
    if (!wallet) { setShowWallet(true); return; }
    if (solNum <= 0) return;
    setTxState('loading'); setErrMsg('');
    try {
      await new Promise(r => setTimeout(r, 1000));
      const sig = 'MOCK'+Math.random().toString(36).slice(2,10).toUpperCase();
      const result = { tokensOut, solIn:solNum, sig, mock:true };
      savePurchase?.({ mintAddress:mint, ticker:project?.ticker, name:project?.name, tokensOut, solIn:solNum, price:solNum/tokensOut, cycleId:cycle?.id, cycleStatus:cycle?.status });
      setReceipt(result); setTxState('success');
    } catch(e) { setErrMsg(e.message||'Transaction failed'); setTxState('error'); }
  };

  const handleShare = async () => {
    const url = `${BASE}/mini/${mint}`;
    const text = project ? `${project.name} ($${project.ticker}) — buy on Mammoth` : 'Mammoth Protocol';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    } else if (navigator.share) {
      await navigator.share({ title: text, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true); setTimeout(()=>setShared(false), 2000);
    }
  };

  if (!project) return (
    <div style={{ minHeight:'100vh', background:'#080c14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', color:'#7d8590', fontSize:12 }}>
      Token not found
    </div>
  );

  const pct = cycle ? Math.round((cycle.sold/cycle.allocation)*100) : 0;
  const up = project.change >= 0;
  const LINKS = [
    { key:'website', icon:'🌐', label:'Website' }, { key:'twitter', icon:'𝕏', label:'X' },
    { key:'telegram', icon:'✈️', label:'Telegram' }, { key:'discord', icon:'💬', label:'Discord' },
    { key:'github', icon:'⌥', label:'GitHub' }, { key:'docs', icon:'📄', label:'Docs' },
  ].filter(l => project[l.key]);

  return (
    <>
      {/* Telegram WebApp SDK */}
      <script src="https://telegram.org/js/telegram-web-app.js" async/>

      <div style={{ minHeight:'100vh', background:'#080c14', color:'#e6edf3', fontFamily:"'IBM Plex Mono',monospace", paddingBottom:80 }}>

        {/* Mini app top bar */}
        <div style={{ background:'#0d1117', borderBottom:'1px solid #1d2540', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {project.image && <img src={project.image} alt="" width={24} height={24} style={{ borderRadius:5, objectFit:'cover', flexShrink:0 }} onError={e=>e.currentTarget.style.display='none'}/>}
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'#e6edf3' }}>{project.name}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#7d8590', background:'#161b22', border:'1px solid #30363d', borderRadius:3, padding:'1px 6px' }}>${project.ticker}</span>
            {project.status==='ACTIVE' && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#22D3EE', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:3, padding:'1px 6px' }}>● OPEN</span>}
            {comingSoon && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#A78BFA', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:3, padding:'1px 6px' }}>COMING SOON</span>}
          </div>
          <button onClick={handleShare}
            style={{ background:shared?'rgba(16,185,129,0.15)':'rgba(139,92,246,0.12)', border:`1px solid ${shared?'rgba(16,185,129,0.3)':'rgba(139,92,246,0.3)'}`, borderRadius:6, padding:'5px 12px', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:shared?'#10B981':'#A78BFA', cursor:'pointer', transition:'all 0.15s' }}>
            {shared ? '✓ COPIED' : '↗ SHARE'}
          </button>
        </div>

        <div style={{ padding:'12px 14px' }}>
          {/* Price */}
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:4 }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:28, color:'#22D3EE', letterSpacing:'-0.02em', textShadow:'0 0 16px rgba(34,211,238,0.5)' }}>{project.price.toFixed(5)}</span>
            <span style={{ fontSize:13, color:'#7d8590' }}>SOL</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color:up?'#22D3EE':'#F43F5E' }}>{up?'▲':'▼'} {Math.abs(project.change).toFixed(1)}%</span>
          </div>
          <div style={{ fontSize:10, color:'#7d8590', marginBottom:14 }}>vol {project.volume?.toLocaleString()} · creator: {project.creator}</div>

          {/* Chart / Countdown */}
          {comingSoon && project.goPublicAt
            ? <Countdown goPublicAt={project.goPublicAt} ticker={project.ticker} />
            : project.chartData?.length > 0 && (
              <div style={{ background:'#0d1117', border:'1px solid #1d2540', borderRadius:10, padding:'10px 6px 6px', marginBottom:12 }}>
                <PriceChart data={project.chartData} cycleStart={Math.floor(project.chartData.length*0.62)}/>
              </div>
            )
          }

          {/* Cycle panel */}
          {cycle && (
            <div style={{ background:'#0d1117', border:'1px solid #1d2540', borderRadius:10, padding:'12px 14px', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'#e6edf3' }}>Cycle #{cycle.id}</span>
                {cycle.status==='ACTIVE'
                  ? <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#22D3EE', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:3, padding:'2px 8px' }}>● OPEN</span>
                  : <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#7d8590' }}>PENDING</span>
                }
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:10, color:'#7d8590' }}>{cycle.sold?.toLocaleString()} / {cycle.allocation?.toLocaleString()} sold</span>
                <span style={{ fontSize:10, fontWeight:700, color:'#8B5CF6' }}>{pct}%</span>
              </div>
              <div style={{ height:5, background:'#1d2540', borderRadius:3, overflow:'hidden', marginBottom:12 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)', borderRadius:3 }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {[
                  { label:'Curve', value:cycle.curveType },
                  { label:'Launch price', value:`${(cycle.basePrice||cycle.currentPrice)?.toFixed(5)} SOL` },
                  { label:'Current price', value:`${cycle.currentPrice?.toFixed(5)} SOL` },
                ].map(({label,value})=>(
                  <div key={label} style={{ background:'#161b22', border:'1px solid #252848', borderRadius:6, padding:'7px 8px' }}>
                    <div style={{ fontSize:8, color:'#7d8590', marginBottom:2 }}>{label}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#e6edf3' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display:'flex', gap:2, background:'#0d1117', border:'1px solid #1d2540', borderRadius:7, padding:3, marginBottom:12 }}>
            {[['buy','Buy'],['about','About'],['rights','Rights & Treasury']].map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)}
                style={{ flex:1, padding:'7px 0', background:tab===key?'#8B5CF6':'transparent', border:'none', borderRadius:5, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:tab===key?'#fff':'#7d8590', cursor:'pointer', transition:'all 0.12s' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Buy tab */}
          {tab === 'buy' && (
            <div>
              {comingSoon ? (
                <div style={{ background:'#0d1117', border:'1px solid #252848', borderRadius:10, padding:'20px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>🔒</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'#e6edf3', marginBottom:6 }}>Buying opens at launch</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#7d8590', lineHeight:1.7 }}>Come back when the countdown hits zero. The buy form will appear automatically.</div>
                </div>
              ) : txState === 'success' && receipt ? (
                <div style={{ background:'#0d1117', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'20px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>✅</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'#10B981', marginBottom:14 }}>Purchase confirmed!</div>
                  <div style={{ background:'#161b22', border:'1px solid #252848', borderRadius:8, padding:'12px', marginBottom:14 }}>
                    {[['Tokens received',`${receipt.tokensOut?.toLocaleString()} ${project.ticker}`],['SOL spent',`${receipt.solIn} SOL`],['Fee (2%)',`${(receipt.solIn*0.02).toFixed(4)} SOL`]].map(([l,v])=>(
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:11 }}>
                        <span style={{ color:'#7d8590' }}>{l}</span><span style={{ color:'#e6edf3', fontWeight:700 }}>{v}</span>
                      </div>
                    ))}
                    {receipt.mock && <div style={{ fontSize:9, color:'#7d8590', marginTop:6, textAlign:'center' }}>demo — connect wallet for real trades</div>}
                  </div>
                  <button onClick={()=>{ setTxState('idle'); setSol(''); setReceipt(null); }}
                    style={{ width:'100%', padding:'11px 0', background:'#161b22', border:'1px solid #252848', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#7d8590', cursor:'pointer' }}>
                    BUY MORE
                  </button>
                </div>
              ) : (
                <div style={{ background:'#0d1117', border:'1px solid #1d2540', borderRadius:10, padding:'14px' }}>
                  {/* Presets */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:10 }}>
                    {presets.map((v,i)=>{
                      const labels=['5%','10%','25%','50%'];
                      const active = sol===String(v);
                      return (
                        <button key={i} onClick={()=>setSol(String(v))} disabled={isProcessing}
                          style={{ background:active?'rgba(139,92,246,0.18)':'#161b22', border:`1px solid ${active?'#8B5CF6':'#252848'}`, borderRadius:6, padding:'7px 0', fontFamily:"'IBM Plex Mono',monospace", cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, minHeight:44 }}>
                          <span style={{ fontSize:11, color:active?'#22D3EE':'#7d8590', fontWeight:700 }}>{labels[i]}</span>
                          <span style={{ fontSize:9, color:active?'#A78BFA':'#4a5568' }}>{v} SOL</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Input */}
                  <div style={{ position:'relative', marginBottom:10 }}>
                    <input type="number" value={sol} onChange={e=>setSol(e.target.value)} placeholder="0.00" disabled={isProcessing}
                      style={{ width:'100%', background:'#161b22', border:'1px solid #252848', borderRadius:7, padding:'12px 46px 12px 14px', color:'#e6edf3', fontSize:16, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:48 }}
                      onFocus={e=>e.currentTarget.style.borderColor='#8B5CF6'}
                      onBlur={e=>e.currentTarget.style.borderColor='#252848'}/>
                    <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'#7d8590', fontWeight:600 }}>SOL</span>
                  </div>
                  {/* Quote */}
                  {quote && solNum > 0 && (
                    <div style={{ background:'#161b22', border:'1px solid #252848', borderRadius:7, padding:'10px 12px', marginBottom:10 }}>
                      {[['You receive',`~${tokensOut.toLocaleString()} ${project.ticker}`,'#8B5CF6'],['Fee (2%)',`${quote.fee?.toFixed(4)} SOL`,'#7d8590']].map(([l,v,c])=>(
                        <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:11 }}>
                          <span style={{ color:'#7d8590' }}>{l}</span><span style={{ color:c, fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {errMsg && <div style={{ color:'#F43F5E', fontSize:10, marginBottom:8 }}>⚠ {errMsg}</div>}
                  <button onClick={handleBuy} disabled={isProcessing||(wallet&&solNum<=0)}
                    style={{ width:'100%', padding:'13px 0', background:wallet?'linear-gradient(135deg,#7C3AED,#8B5CF6)':'#161b22', border:`1px solid ${wallet?'#8B5CF6':'#252848'}`, borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14, color:wallet?'#fff':'#7d8590', cursor:isProcessing?'not-allowed':'pointer', letterSpacing:'0.04em', minHeight:50 }}>
                    {isProcessing ? 'PROCESSING...' : wallet ? (solNum>0?`BUY ${tokensOut.toLocaleString()} ${project.ticker}`:'ENTER AMOUNT') : 'CONNECT WALLET'}
                  </button>
                  {wallet && <div style={{ textAlign:'right', marginTop:6, fontSize:9, color:'#7d8590' }}>Connected: {walletState.short}</div>}
                </div>
              )}
            </div>
          )}

          {/* About tab */}
          {tab === 'about' && (
            <div>
              <div style={{ background:'#0d1117', border:'1px solid #1d2540', borderRadius:10, padding:'14px', marginBottom:10 }}>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, color:'#8b949e', lineHeight:1.75, margin:'0 0 16px' }}>{project.description}</p>
                {LINKS.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {LINKS.map(l=>(
                      <a key={l.key} href={project[l.key]} target="_blank" rel="noopener noreferrer"
                        style={{ display:'flex', alignItems:'center', gap:5, background:'#161b22', border:'1px solid #252848', borderRadius:6, padding:'5px 11px', textDecoration:'none', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:600, color:'#A78BFA' }}>
                        <span>{l.icon}</span>{l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                {[['Creator',project.creator],['Launched',project.createdAt],['Supply mode',project.supplyMode],['Hard cap',project.hardCap?'Yes — final':'No']].map(([k,v])=>(
                  <div key={k} style={{ background:'#0d1117', border:'1px solid #1d2540', borderRadius:7, padding:'9px 11px' }}>
                    <div style={{ fontSize:9, color:'#7d8590', marginBottom:3 }}>{k}</div>
                    <div style={{ fontSize:11, color:'#e6edf3', fontWeight:600, wordBreak:'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rights & Treasury tab */}
          {tab === 'rights' && cycle && (
            <div style={{ background:'#0d1117', border:'1px solid #1d2540', borderRadius:10, padding:'14px' }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#A78BFA', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Your Rights</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:14 }}>
                {[
                  { label:'Rights allocated', value:cycle.userRights?.toLocaleString()||'—', color:'#22D3EE' },
                  { label:'Rights used', value:cycle.userRightsUsed?.toLocaleString()||'0', color:'#A78BFA' },
                  { label:'Available', value:((cycle.userRights||0)-(cycle.userRightsUsed||0)).toLocaleString(), color:'#10B981' },
                  { label:'Base price', value:`${(cycle.basePrice||cycle.currentPrice)?.toFixed(5)} SOL`, color:'#FF9F1C' },
                ].map(({label,value,color})=>(
                  <div key={label} style={{ background:'#161b22', border:'1px solid #252848', borderRadius:7, padding:'9px 11px' }}>
                    <div style={{ fontSize:9, color:'#7d8590', marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:12, color, fontWeight:700 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ height:1, background:'#1d2540', marginBottom:14 }}/>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#22D3EE', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Treasury Routing</div>
              {cycle.treasuryRouting && Object.entries(cycle.treasuryRouting).map(([key,pct])=>(
                <div key={key} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:10, color:'#7d8590', textTransform:'capitalize' }}>{key}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:'#e6edf3' }}>{pct}%</span>
                  </div>
                  <div style={{ height:4, background:'#1d2540', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:key==='creator'?'#A78BFA':key==='reserve'?'#22D3EE':'#F43F5E', borderRadius:2 }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#0d1117', borderTop:'1px solid #1d2540', padding:'10px 14px', display:'flex', gap:8, alignItems:'center' }}>
          <a href={`${BASE}/token/${project.mint||project.id}`} target="_blank" rel="noopener noreferrer"
            style={{ flex:1, padding:'10px 0', background:'transparent', border:'1px solid #252848', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:700, color:'#7d8590', textDecoration:'none', textAlign:'center', letterSpacing:'0.04em' }}>
            FULL PAGE ↗
          </a>
          <button
            disabled={comingSoon||isProcessing}
            onClick={() => { if (!comingSoon) { setTab('buy'); if (!wallet) { setShowWallet(true); } else { handleBuy(); } } }}
            style={{ flex:2, padding:'10px 0', background:comingSoon?'#161b22':'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color:comingSoon?'#7d8590':'#fff', cursor:comingSoon?'not-allowed':'pointer', letterSpacing:'0.04em', minHeight:44 }}>
            {comingSoon ? '🔒 COMING SOON' : wallet ? '🚀 BUY NOW' : 'CONNECT WALLET'}
          </button>
        </div>
      </div>

      {showWallet && <WalletModal onClose={()=>setShowWallet(false)} onConnected={s=>{setWalletState(s);setShowWallet(false);}}/>}
    </>
  );
}
