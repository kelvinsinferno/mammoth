'use client';
// Reuses the full mini app project page inside the Coinbase shell
// Rather than duplicating, we import the mini app content directly
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import CoinbaseShell from '../../CoinbaseShell';
import PriceChart from '../../../../components/charts/PriceChart';
import TokenLogo, { getTokenPalette } from '../../../../components/ui/TokenLogo';
import WalletModal from '../../../../components/wallet/WalletModal';
import { useApp } from '../../../../lib/AppContext';
import { computeStepCurve } from '../../../../lib/curves';
import { getPositionForMint, savePurchase, ShareAfterBuy } from '../../../../views/ProjectDetail';
import { MOCK_PROJECTS } from '../../../../lib/data';

const BASE = 'https://mammoth-protocol.vercel.app';
const FAKE_BARS = Array.from({length:36},(_,i)=>18+Math.abs(Math.sin(i*0.8+1.2)*28+Math.sin(i*0.3)*14));
function pad(n) { return String(n).padStart(2,'0'); }

function CountdownOverlay({ goPublicAt, ticker }) {
  const [,tick] = useState(0);
  useEffect(()=>{const t=setInterval(()=>tick(n=>n+1),1000);return()=>clearInterval(t);},[]);
  const diff=Math.max(0,new Date(goPublicAt)-Date.now());
  const days=Math.floor(diff/86400000),hrs=Math.floor((diff%86400000)/3600000);
  const mins=Math.floor((diff%3600000)/60000),secs=Math.floor((diff%60000)/1000);
  return (
    <div style={{position:'relative',borderRadius:10,overflow:'hidden',marginBottom:12}}>
      <div style={{padding:'10px 8px 6px',filter:'blur(2px)',opacity:0.15,pointerEvents:'none'}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:2,height:80}}>
          {FAKE_BARS.map((h,i)=><div key={i} style={{flex:1,borderRadius:'2px 2px 0 0',background:'linear-gradient(180deg,#8B5CF6,#22D3EE)',height:`${h}px`}}/>)}
        </div>
      </div>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(8,12,20,0.8)',backdropFilter:'blur(3px)'}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:'#A78BFA',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:10}}>${ticker} launches in</div>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          {[[days,'DAYS'],[hrs,'HRS'],[mins,'MIN'],[secs,'SEC']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:7,padding:'7px 9px',minWidth:44}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:20,color:'#fff',lineHeight:1}}>{pad(v)}</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'#A78BFA',marginTop:3,letterSpacing:'0.1em'}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--text-muted)'}}>
          {new Date(goPublicAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {new Date(goPublicAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
}

const LINK_DEFS = [
  {key:'website',label:'Website',color:'#22D3EE'},{key:'twitter',label:'X',color:'var(--text)'},
  {key:'telegram',label:'Telegram',color:'#29B6F6'},{key:'discord',label:'Discord',color:'#5865F2'},
  {key:'github',label:'GitHub',color:'var(--text)'},{key:'farcaster',label:'Farcaster',color:'#855DCD'},
  {key:'youtube',label:'YouTube',color:'#FF0000'},{key:'docs',label:'Docs',color:'#A78BFA'},
];

export default function CoinbaseTokenPage() {
  const params = useParams();
  const router = useRouter();
  const mint = params?.mint;
  const { walletState, setWalletState } = useApp();
  const [project, setProject] = useState(null);
  const [tab, setTab] = useState('About');
  const [sol, setSol] = useState('');
  const [txState, setTxState] = useState('idle');
  const [receipt, setReceipt] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    setProject(MOCK_PROJECTS.find(p => String(p.mint||p.id)===String(mint))||null);
  }, [mint]);

  const wallet = walletState.status === 'connected';
  const isProcessing = txState === 'awaiting' || txState === 'loading';
  const solNum = parseFloat(sol)||0;
  const p = project;
  const cycle = p?.cycleData;
  const comingSoon = p?.status === 'COMING_SOON';

  const quote = (() => {
    if (!cycle||solNum<=0) return null;
    if (cycle.curveType==='Step') return computeStepCurve({solIn:solNum,sold:cycle.sold,allocation:cycle.allocation,startPrice:cycle.basePrice||cycle.currentPrice,stepSize:cycle.stepSize||5000,stepIncrement:cycle.stepIncrement||0.00022});
    const fee=solNum*0.02,net=solNum-fee;
    return {tokensOut:Math.floor(net/(cycle.currentPrice||0.001)),fee,effectivePrice:cycle.currentPrice};
  })();
  const tokensOut = quote?.tokensOut||0;

  const presets = (() => {
    if (!cycle) return [0.01,0.05,0.1,0.25];
    const rem=(cycle.allocation-cycle.sold)*(cycle.currentPrice||0.001);
    return [0.05,0.10,0.25,0.50].map(pct=>{const raw=rem*pct;const dec=raw<0.01?Math.max(2,Math.ceil(-Math.log10(raw))+1):2;return parseFloat(raw.toFixed(dec));});
  })();

  const handleBuy = async () => {
    if (!wallet){setShowWallet(true);return;}
    if (solNum<=0) return;
    setTxState('loading');setErrMsg('');
    try {
      await new Promise(r=>setTimeout(r,1000));
      const sig='MOCK'+Math.random().toString(36).slice(2,10).toUpperCase();
      const result={tokensOut,solIn:solNum,sig,mock:true};
      savePurchase?.({mintAddress:mint,ticker:p?.ticker,name:p?.name,tokensOut,solIn:solNum,price:solNum/tokensOut,cycleId:cycle?.id,cycleStatus:cycle?.status});
      setReceipt(result);setTxState('success');
    } catch(e){setErrMsg(e.message||'Failed');setTxState('error');}
  };

  if (!p) return (
    <CoinbaseShell onOpenModal={()=>setShowWallet(true)}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'50vh',fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:'var(--text-muted)'}}>Token not found</div>
    </CoinbaseShell>
  );

  const up = p.change>=0;
  const pal = getTokenPalette(p.id);
  const pos = wallet ? getPositionForMint(p.mint||p.id) : null;
  const pct = cycle ? Math.round((cycle.sold/cycle.allocation)*100) : 0;
  const TABS = ['About','Tokenomics','Cycles','Treasury'];

  return (
    <CoinbaseShell onOpenModal={()=>setShowWallet(true)}>
      <div style={{padding:'14px 14px 16px'}}>

        {/* Price header */}
        <div style={{marginBottom:12,display:'flex',alignItems:'flex-start',gap:12}}>
          <div style={{flexShrink:0,filter:`drop-shadow(0 0 10px ${pal.accent}88)`}}>
            <TokenLogo id={p.id} size={44} image={p.image||null}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap',marginBottom:2}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:24,color:'#22D3EE',letterSpacing:'-0.02em',textShadow:'0 0 16px rgba(34,211,238,0.5)'}}>{p.price.toFixed(5)}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:'var(--text-dim)'}}>SOL</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,color:up?'#22D3EE':'#F43F5E'}}>{up?'▲':'▼'} {Math.abs(p.change).toFixed(1)}%</span>
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--text-muted)'}}>{p.volume?.toLocaleString()} vol · {p.creator}</div>
          </div>
        </div>

        {/* Chart or countdown */}
        {comingSoon && p.goPublicAt ? <CountdownOverlay goPublicAt={p.goPublicAt} ticker={p.ticker}/> : p.chartData?.length>0 && (
          <div style={{background:'var(--panel)',border:'1px solid #1d2540',borderRadius:10,padding:'10px 6px 6px',marginBottom:12}}>
            <PriceChart data={p.chartData} cycleStart={Math.floor(p.chartData.length*0.62)}/>
          </div>
        )}

        {/* Cycle panel */}
        {cycle && (
          <div style={{background:'var(--panel)',border:'1px solid #1d2540',borderRadius:10,padding:'12px 14px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,color:'var(--text)'}}>Cycle #{cycle.id}</span>
              {cycle.status==='ACTIVE' ? <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:'#22D3EE',background:'rgba(34,211,238,0.08)',border:'1px solid rgba(34,211,238,0.25)',borderRadius:3,padding:'2px 8px'}}>● OPEN</span>
              : <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--text-muted)'}}>PENDING</span>}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--text-muted)'}}>{cycle.sold?.toLocaleString()} / {cycle.allocation?.toLocaleString()}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:'#22D3EE'}}>{pct}%</span>
            </div>
            <div style={{height:4,background:'var(--border)',borderRadius:2,overflow:'hidden',marginBottom:10}}>
              <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)',borderRadius:2}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
              {[{label:'Curve',value:cycle.curveType},{label:'Launch price',value:`${(cycle.basePrice||cycle.currentPrice)?.toFixed(5)} SOL`,color:'#A78BFA'},{label:'Current',value:`${cycle.currentPrice?.toFixed(5)} SOL`,color:'#22D3EE'}].map(({label,value,color})=>(
                <div key={label} style={{background:'var(--panel-alt)',border:'1px solid #1a2438',borderRadius:6,padding:'7px 8px'}}>
                  <div style={{fontSize:8,color:'var(--text-muted)',fontFamily:"'IBM Plex Mono',monospace",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:10,color:color||'var(--text)',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Position */}
        {pos && (() => {
          const cv=pos.totalTokens*p.price,pnl=cv-pos.totalSol,pnlp=pos.totalSol>0?(pnl/pos.totalSol)*100:0,pu=pnl>=0;
          const f=n=>n>=1?n.toFixed(4):n.toPrecision(4);
          return (
            <div style={{background:'var(--panel)',border:`1px solid ${pu?'rgba(16,185,129,0.3)':'rgba(244,63,94,0.3)'}`,borderRadius:10,padding:'12px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em'}}>Your Position</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--text-muted)'}}>{pos.buyCount} buy{pos.buyCount>1?'s':''}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:9}}>
                {[{label:'Holdings',value:`${pos.totalTokens.toLocaleString()} ${p.ticker}`,color:'var(--text)'},{label:'Value',value:`${f(cv)} SOL`,color:'#22D3EE'},{label:'Avg price',value:`${pos.avgPrice.toPrecision(4)} SOL`},{label:'Spent',value:`${f(pos.totalSol)} SOL`}].map(({label,value,color})=>(
                  <div key={label} style={{background:'var(--panel-alt)',borderRadius:5,padding:'6px 8px'}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:'var(--text-muted)',marginBottom:2}}>{label}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:color||'var(--text-secondary)'}}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{background:pu?'rgba(16,185,129,0.07)':'rgba(244,63,94,0.07)',border:`1px solid ${pu?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'}`,borderRadius:6,padding:'7px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:'var(--text-muted)'}}>Unrealized P&L</span>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,color:pu?'#10B981':'#F43F5E'}}>{pu?'+':''}{f(pnl)} SOL</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:pu?'#10B981':'#F43F5E'}}>{pu?'+':''}{pnlp.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Buy panel */}
        {comingSoon ? (
          <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:10,padding:'16px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:'var(--text)'}}>Buy ${p.ticker}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:'#A78BFA',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.28)',borderRadius:3,padding:'2px 8px'}}>COMING SOON</span>
            </div>
            <button disabled style={{width:'100%',padding:'12px 0',background:'var(--border)',border:'none',borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:12,color:'var(--text-muted)',cursor:'not-allowed'}}>🔒 BUYING LOCKED</button>
          </div>
        ) : txState==='success'&&receipt ? (
          <div style={{background:'var(--panel)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:10,padding:'16px',marginBottom:12,textAlign:'center'}}>
            <div style={{fontSize:22,marginBottom:6}}>✅</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,color:'#10B981',marginBottom:12}}>Purchase confirmed!</div>
            <div style={{background:'var(--panel-alt)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:8,padding:'11px',marginBottom:10}}>
              {[['Tokens',`${receipt.tokensOut?.toLocaleString()} ${p.ticker}`],['SOL spent',`${receipt.solIn} SOL`],['Fee',`${(receipt.solIn*0.02).toFixed(4)} SOL`]].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontSize:11}}>
                  <span style={{color:'var(--text-muted)'}}>{l}</span><span style={{color:'var(--text)',fontWeight:700}}>{v}</span>
                </div>
              ))}
              {receipt.mock&&<div style={{fontSize:9,color:'var(--text-muted)',marginTop:4,textAlign:'center'}}>demo — connect wallet for real trades</div>}
            </div>
            <ShareAfterBuy tokensOut={receipt.tokensOut} ticker={p.ticker} mintAddress={mint} context="coinbase"/>
            <button onClick={()=>{setTxState('idle');setSol('');setReceipt(null);}} style={{width:'100%',padding:'9px 0',background:'var(--panel-alt)',border:'1px solid var(--border)',borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'var(--text-dim)',cursor:'pointer',marginTop:8}}>BUY MORE</button>
          </div>
        ) : (
          <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:10,padding:'14px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:wallet?8:12}}>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,color:'var(--text)'}}>Buy ${p.ticker}</span>
              {wallet&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--text-muted)'}}>bal: <span style={{color:'#22D3EE',fontWeight:600}}>{walletState.balance??0} SOL</span></span>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:9}}>
              {presets.map((v,i)=>{const labels=['5%','10%','25%','50%'];const active=sol===String(v);return(
                <button key={i} onClick={()=>setSol(String(v))} disabled={isProcessing}
                  style={{background:active?'rgba(139,92,246,0.18)':'var(--panel-alt)',border:`1px solid ${active?'#7C3AED':'var(--border)'}`,borderRadius:5,padding:'5px 0',fontFamily:"'IBM Plex Mono',monospace",cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:1,minHeight:40}}>
                  <span style={{fontSize:10,color:active?'#22D3EE':'var(--text-dim)',fontWeight:700}}>{labels[i]}</span>
                  <span style={{fontSize:8,color:active?'#A78BFA':'var(--text-muted)'}}>{v}</span>
                </button>
              );})}
            </div>
            <div style={{position:'relative',marginBottom:9}}>
              <input type="number" value={sol} onChange={e=>setSol(e.target.value)} placeholder="0.00" disabled={isProcessing}
                style={{width:'100%',background:'var(--panel-alt)',border:'1px solid var(--border)',borderRadius:7,padding:'11px 46px 11px 12px',color:'var(--text)',fontSize:15,fontFamily:"'IBM Plex Mono',monospace",outline:'none',boxSizing:'border-box',minHeight:44}}
                onFocus={e=>e.currentTarget.style.borderColor='#8B5CF6'} onBlur={e=>e.currentTarget.style.borderColor='var(--border)'}/>
              <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:11,color:'var(--text-dim)',fontWeight:600}}>SOL</span>
            </div>
            {quote&&solNum>0&&(
              <div style={{background:'var(--panel-alt)',border:'1px solid #1d2540',borderRadius:6,padding:'9px 11px',marginBottom:9}}>
                {[['You receive',`~${tokensOut.toLocaleString()} ${p.ticker}`,'var(--text)'],['Fee (2%)',`${quote.fee?.toFixed(4)} SOL`,'var(--text-dim)']].map(([l,v,c])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'2px 0',fontSize:10}}>
                    <span style={{color:'var(--text-muted)'}}>{l}</span><span style={{color:c,fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {errMsg&&<div style={{color:'#F43F5E',fontSize:10,marginBottom:8}}>⚠ {errMsg}</div>}
            <button onClick={handleBuy} disabled={isProcessing||(wallet&&solNum<=0)}
              style={{width:'100%',padding:'12px 0',background:wallet?'linear-gradient(135deg,#7C3AED,#8B5CF6)':'var(--panel-alt)',border:`1px solid ${wallet?'#8B5CF6':'var(--border)'}`,borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:13,color:wallet?'#fff':'var(--text)',cursor:isProcessing?'not-allowed':'pointer',letterSpacing:'0.04em',minHeight:46}}>
              {isProcessing?'PROCESSING...' : wallet?(solNum>0?`BUY ${tokensOut.toLocaleString()} ${p.ticker}`:'ENTER AMOUNT'):'CONNECT WALLET'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:0,borderBottom:'1px solid #1d2540',marginBottom:14,overflowX:'auto',scrollbarWidth:'none'}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{background:'none',border:'none',cursor:'pointer',padding:'9px 13px',fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:500,letterSpacing:'0.04em',color:tab===t?'#22D3EE':'var(--text-muted)',borderBottom:`2px solid ${tab===t?'#8B5CF6':'transparent'}`,transition:'all 0.12s',whiteSpace:'nowrap',flexShrink:0,minHeight:40}}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {tab==='About'&&(
          <div>
            <p style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,color:'var(--text-secondary)',lineHeight:1.75,marginBottom:14}}>{p.description}</p>
            {(() => { const al=LINK_DEFS.filter(l=>p[l.key]); if(!al.length) return null; return (<div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:14}}>{al.map(l=>(<a key={l.key} href={p[l.key]} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,background:'var(--panel-alt)',border:'1px solid var(--border)',borderRadius:5,padding:'5px 10px',textDecoration:'none',color:l.color,fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600}}>{l.label}</a>))}</div>); })()}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
              {[['Creator',p.creator],['Launched',p.createdAt],['Supply mode',p.supplyMode],['Hard cap',p.hardCap?'Yes':'No']].map(([k,v])=>(
                <div key={k} style={{background:'var(--panel-alt)',border:'1px solid #1a2438',borderRadius:6,padding:'8px 10px'}}>
                  <div style={{fontSize:9,color:'var(--text-muted)',fontFamily:"'IBM Plex Mono',monospace",marginBottom:2}}>{k}</div>
                  <div style={{fontSize:11,color:'var(--text-secondary)',fontFamily:"'IBM Plex Mono',monospace",wordBreak:'break-all'}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==='Tokenomics'&&p.totalSupply&&(
          <div>{[{label:'Public (cycles)',val:p.publicAlloc,color:'#22D3EE'},{label:'Treasury',val:p.treasuryAlloc,color:'#6D28D9'},{label:'Protocol (2%)',val:p.totalSupply*0.02,color:'var(--text-muted)'}].map((b,i)=>(
            <div key={i} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--text-secondary)'}}>{b.label}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--text)',fontWeight:600}}>{((b.val||0)/1_000_000).toFixed(0)}M · {(((b.val||0)/p.totalSupply)*100).toFixed(1)}%</span></div>
              <div style={{height:4,background:'var(--border)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${((b.val||0)/p.totalSupply)*100}%`,background:b.color,borderRadius:2}}/></div>
            </div>
          ))}</div>
        )}
        {tab==='Cycles'&&(
          <div>{(p.cycleHistory||[]).map(c=>(
            <div key={c.id} style={{background:'var(--panel-alt)',border:'1px solid #1a2438',borderRadius:8,padding:'11px 12px',marginBottom:7}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}><span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,color:'var(--text)'}}>Cycle #{c.id}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:c.status==='COMPLETED'?'#22D3EE':c.status==='ACTIVE'?'#8B5CF6':'var(--text-muted)'}}>{c.status}</span></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>{[['Allocation',`${((c.allocation||0)/1000).toFixed(0)}K`],['Raised',c.raised],['Range',c.priceRange]].map(([k,v])=>(<div key={k}><div style={{fontSize:8,color:'var(--text-muted)',fontFamily:"'IBM Plex Mono',monospace",marginBottom:1}}>{k}</div><div style={{fontSize:10,color:'var(--text)',fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{v}</div></div>))}</div>
            </div>
          ))}{(!p.cycleHistory||p.cycleHistory.length===0)&&<div style={{textAlign:'center',padding:'20px 0',fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:'var(--text-muted)'}}>No cycle history yet</div>}</div>
        )}
        {tab==='Treasury'&&cycle?.treasuryRouting&&(
          <div style={{background:'var(--panel-alt)',border:'1px solid #1a2438',borderRadius:9,padding:'13px'}}>
            {[['Creator treasury',cycle.treasuryRouting.creator+'%','#10B981'],['Reserve',cycle.treasuryRouting.reserve+'%','var(--text-dim)'],['Sink / burn',cycle.treasuryRouting.sink+'%','var(--text-muted)'],['Protocol fee','2% (fixed)','#6D28D9']].map(([k,v,c])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1a2438'}}><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'var(--text-dim)'}}>{k}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600,color:c}}>{v}</span></div>
            ))}
          </div>
        )}
      </div>
      {showWallet&&<WalletModal onClose={()=>setShowWallet(false)} onConnected={s=>{setWalletState(s);setShowWallet(false);}}/>}
    </CoinbaseShell>
  );
}
