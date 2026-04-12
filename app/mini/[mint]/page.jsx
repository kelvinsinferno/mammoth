'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import BrandMark from '../../../components/BrandMark';
import { MOCK_PROJECTS } from '../../../lib/data';
import { useApp } from '../../../lib/AppContext';
import PriceChart from '../../../components/charts/PriceChart';
import TokenLogo, { getTokenPalette } from '../../../components/ui/TokenLogo';
import WalletModal from '../../../components/wallet/WalletModal';
import WalletButton from '../../../components/wallet/WalletButton';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import { computeStepCurve } from '../../../lib/curves';
import { getPositionForMint, savePurchase } from '../../../views/ProjectDetail';

const BASE = 'https://mammoth-protocol.vercel.app';
const FAKE_BARS = Array.from({length:36},(_,i)=>18+Math.abs(Math.sin(i*0.8+1.2)*28+Math.sin(i*0.3)*14));
function pad(n) { return String(n).padStart(2,'0'); }

// ── Reused sub-components (identical logic to ProjectDetail) ─────────────────

function CountdownOverlay({ goPublicAt, ticker }) {
  const [, tick] = useState(0);
  useEffect(()=>{ const t=setInterval(()=>tick(n=>n+1),1000); return()=>clearInterval(t); },[]);
  const diff = Math.max(0,new Date(goPublicAt)-Date.now());
  const days=Math.floor(diff/86400000), hrs=Math.floor((diff%86400000)/3600000);
  const mins=Math.floor((diff%3600000)/60000), secs=Math.floor((diff%60000)/1000);
  return (
    <div style={{ position:'relative', borderRadius:10, overflow:'hidden', marginBottom:12 }}>
      <div style={{ padding:'10px 8px 6px', filter:'blur(2px)', opacity:0.15, pointerEvents:'none' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:80 }}>
          {FAKE_BARS.map((h,i)=><div key={i} style={{ flex:1, borderRadius:'2px 2px 0 0', background:'linear-gradient(180deg,#8B5CF6,#22D3EE)', height:`${h}px` }}/>)}
        </div>
        <div style={{ height:1, background:'var(--border)', margin:'3px 2px 0' }}/>
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(8,12,20,0.8)', backdropFilter:'blur(3px)' }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#A78BFA', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>${ticker} launches in</div>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          {[[days,'DAYS'],[hrs,'HRS'],[mins,'MIN'],[secs,'SEC']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:7, padding:'7px 9px', minWidth:44 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:20, color:'#fff', lineHeight:1 }}>{pad(v)}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'#A78BFA', marginTop:3, letterSpacing:'0.1em' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>
          {new Date(goPublicAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {new Date(goPublicAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
}

function CyclePanel({ cycle }) {
  const [open, setOpen] = useState(false);
  if (!cycle) return null;
  const pct = Math.round((cycle.sold/cycle.allocation)*100);
  const launchPrice = cycle.basePrice ?? cycle.launchPrice ?? cycle.currentPrice;
  return (
    <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, padding:'14px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)' }}>Cycle #{cycle.id}</span>
        {cycle.status==='ACTIVE'
          ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:9, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace", padding:'2px 8px', borderRadius:4, background:'rgba(139,92,246,0.13)', color:'#22D3EE', border:'1px solid rgba(139,92,246,0.28)' }}><span style={{ width:4, height:4, borderRadius:'50%', background:'#8B5CF6', display:'inline-block' }}/>OPEN</span>
          : <span style={{ fontSize:9, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace", color:'var(--text-muted)' }}>PENDING</span>
        }
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{cycle.sold?.toLocaleString()} / {cycle.allocation?.toLocaleString()} sold</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>{pct}%</span>
      </div>
      <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden', marginBottom:12 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)', borderRadius:3 }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[
          { label:'Curve', value:cycle.curveType },
          { label:'Launch price', value:`${launchPrice?.toFixed(5)} SOL`, color:'#A78BFA' },
          { label:'Current price', value:`${cycle.currentPrice?.toFixed(5)} SOL`, color:'#22D3EE' },
          { label:'Remaining', value:(cycle.allocation-cycle.sold)?.toLocaleString() },
        ].map(({label,value,color})=>(
          <div key={label} style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'8px 10px' }}>
            <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:3 }}>{label}</div>
            <div style={{ fontSize:11, color:color||'var(--text)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{value}</div>
          </div>
        ))}
      </div>
      {cycle.nextStepIn && cycle.status==='ACTIVE' && (
        <div style={{ background:'rgba(255,159,28,0.07)', border:'1px solid rgba(255,159,28,0.18)', borderRadius:6, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#d97706' }}>⚡ next price jump in</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#F59E0B', fontWeight:700 }}>{cycle.nextStepIn?.toLocaleString()} tokens</span>
        </div>
      )}
    </div>
  );
}

const LINK_DEFS = [
  { key:'website',   label:'Website',   color:'#22D3EE' },
  { key:'twitter',   label:'X',         color:'var(--text)' },
  { key:'telegram',  label:'Telegram',  color:'#29B6F6' },
  { key:'discord',   label:'Discord',   color:'#5865F2' },
  { key:'github',    label:'GitHub',    color:'var(--text)' },
  { key:'farcaster', label:'Farcaster', color:'#855DCD' },
  { key:'youtube',   label:'YouTube',   color:'#FF0000' },
  { key:'docs',      label:'Docs',      color:'#A78BFA' },
];

function ShareAfterBuyMini({ tokensOut, ticker, mint }) {
  const [copied, setCopied] = useState(false);
  const shareUrl  = `${BASE}/mini/${mint}`;
  const shareText = `Just bought ${tokensOut?.toLocaleString()} $${ticker} on Mammoth Protocol 🦣`;
  const enc = encodeURIComponent;
  const isTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp;

  const openShare = (href) => window.open(href, '_blank', 'noopener,noreferrer');

  return (
    <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.05))', border:'1px solid rgba(139,92,246,0.2)', borderRadius:9, padding:'13px', marginBottom:8 }}>
      <div style={{ textAlign:'center', marginBottom:10 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:2 }}>🎉 Pump your bags</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>You backed ${ticker}. Let your community know.</div>
      </div>
      {isTelegram ? (
        <button onClick={() => window.Telegram.WebApp.openLink(`https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareText)}`)}
          style={{ width:'100%', padding:'10px 0', background:'rgba(41,182,246,0.15)', border:'1px solid rgba(41,182,246,0.3)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#29B6F6', cursor:'pointer' }}>
          ✈️ Share on Telegram
        </button>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
          {[
            { label:'𝕏 Post on X',          href:`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}` },
            { label:'✈️ Share on Telegram',  href:`https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareText)}` },
            { label:'🟣 Cast on Farcaster',  href:`https://warpcast.com/~/compose?text=${enc(shareText + ' ' + shareUrl)}` },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{ padding:'9px 0', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#A78BFA', textDecoration:'none', textAlign:'center', display:'block' }}>
              {label}
            </a>
          ))}
          <button onClick={async()=>{ await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`); setCopied(true); setTimeout(()=>setCopied(false),2500); }}
            style={{ padding:'9px 0', background:copied?'rgba(16,185,129,0.1)':'var(--panel-alt)', border:`1px solid ${copied?'rgba(16,185,129,0.3)':'var(--border)'}`, borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:copied?'#10B981':'var(--text-muted)', cursor:'pointer' }}>
            {copied?'✓ Copied!':'🔗 Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MiniPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mint = params?.mint;
  // forceTheme lets the showcase page display dark/light previews independently of user's theme
  const forceTheme = searchParams?.get('forceTheme');
  const { walletState, setWalletState, theme, toggleTheme, connection, getWalletAdapter } = useApp();
  const [project, setProject] = useState(null);
  const [tab, setTab] = useState('About');
  const tabsRef = useRef(null);
  const [sol, setSol] = useState('');
  const [txState, setTxState] = useState('idle');
  const [receipt, setReceipt] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [shared, setShared] = useState(false);
  const [slippage] = useState(5);

  useEffect(() => {
    const found = MOCK_PROJECTS.find(p => String(p.mint||p.id) === String(mint));
    setProject(found||null);
  }, [mint]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); tg.expand();
      tg.BackButton.show();
      tg.BackButton.onClick(()=>window.history.back());
    }
  }, []);

  // When forceTheme is set (e.g. from the showcase iframe), override CSS vars regardless of user preference
  const effectiveTheme = forceTheme || theme;
  const lightOverrides = effectiveTheme === 'light' ? {
    '--page-bg': '#ffffff',
    '--panel': '#f6f8fa',
    '--panel-alt': '#eaeef2',
    '--border': '#d0d7de',
    '--border-sub': '#d0d7de',
    '--text': '#1f2328',
    '--text-secondary': '#2d333b',
    '--text-dim': '#444c56',
    '--text-muted': '#656d76',
    '--badge-bg': '#eaeef2',
    '--badge-border': '#d0d7de',
    '--bar-empty': '#d0d7de',
    '--header-bg': 'rgba(246,248,250,0.9)',
    '--header-border': '#d0d7de',
    '--header-shadow': '0 1px 0 #d0d7de',
    '--hero-bg': '#eaeef2',
    '--hero-border': '#d0d7de',
    '--overlay': 'rgba(0,0,0,0.4)',
    '--stats-bg': '#f6f8fa',
    '--stats-border': '#d0d7de',
  } : {};

  const wallet = walletState.status === 'connected';
  const isProcessing = txState === 'awaiting' || txState === 'loading';
  const solNum = parseFloat(sol)||0;
  const p = project;
  const cycle = p?.cycleData;
  const comingSoon = p?.status === 'COMING_SOON';

  const quote = (() => {
    if (!cycle||solNum<=0) return null;
    if (cycle.curveType==='Step') return computeStepCurve({ solIn:solNum, sold:cycle.sold, allocation:cycle.allocation, startPrice:cycle.basePrice||cycle.currentPrice, stepSize:cycle.stepSize||5000, stepIncrement:cycle.stepIncrement||0.00022 });
    const fee=solNum*0.02, net=solNum-fee;
    return { tokensOut:Math.floor(net/(cycle.currentPrice||0.001)), fee, effectivePrice:cycle.currentPrice };
  })();
  const tokensOut = quote?.tokensOut||0;

  const presets = (() => {
    if (!cycle) return [0.01,0.05,0.1,0.25];
    const rem = (cycle.allocation-cycle.sold)*(cycle.currentPrice||0.001);
    return [0.05,0.10,0.25,0.50].map(pct => {
      const raw=rem*pct;
      const dec=raw<0.01?Math.max(2,Math.ceil(-Math.log10(raw))+1):2;
      return parseFloat(raw.toFixed(dec));
    });
  })();

  const handleBuy = async () => {
    if (!wallet) { setShowWallet(true); return; }
    if (solNum<=0) return;
    setTxState('loading'); setErrMsg('');
    try {
      await new Promise(r=>setTimeout(r,1000));
      const sig='MOCK'+Math.random().toString(36).slice(2,10).toUpperCase();
      const result={ tokensOut, solIn:solNum, sig, mock:true };
      savePurchase?.({ mintAddress:mint, ticker:p?.ticker, name:p?.name, tokensOut, solIn:solNum, price:solNum/tokensOut, cycleId:cycle?.id, cycleStatus:cycle?.status });
      setReceipt(result); setTxState('success');
    } catch(e) { setErrMsg(e.message||'Transaction failed'); setTxState('error'); }
  };

  const handleShare = async () => {
    const url=`${BASE}/mini/${mint}`;
    const text=p?`${p.name} ($${p.ticker}) on Mammoth`:'Mammoth Protocol';
    if (typeof window!=='undefined'&&window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    } else if (navigator.share) {
      await navigator.share({title:text,url});
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true); setTimeout(()=>setShared(false),2000);
    }
  };

  if (!p) return (
    <div style={{ minHeight:'100vh', background:'var(--page-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', color:'var(--text-muted)', fontSize:12 }}>Token not found</div>
  );

  const up = p.change>=0;
  const pal = getTokenPalette(p.id);
  const pos = wallet ? getPositionForMint(p.mint||p.id) : null;
  const TABS = ['About','Tokenomics','Cycles','Treasury'];

  return (
    <>
      <script src="https://telegram.org/js/telegram-web-app.js" async/>
      <div style={{ minHeight:'100vh', background:'var(--page-bg)', color:'var(--text)', fontFamily:"'IBM Plex Mono',monospace", ...lightOverrides }}>

        {/* Header — same style as project page, no main nav */}
        <header style={{ background:'var(--header-bg)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--header-border)', position:'sticky', top:0, zIndex:50, boxShadow:'var(--header-shadow)' }}>
          <div style={{ maxWidth:600, margin:'0 auto', padding:'0 14px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1, overflow:'hidden' }}>
              <a href="/" style={{ background:'none', border:'none', color:'var(--text-dim)', fontSize:16, padding:'4px 6px 4px 0', display:'flex', alignItems:'center', textDecoration:'none', flexShrink:0 }}>←</a>
              <BrandMark size={24} alt="Mammoth" rounded={5} />
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', background:'var(--badge-bg)', border:'1px solid #252848', borderRadius:3, padding:'1px 6px', flexShrink:0 }}>${p.ticker}</span>
              {p.status==='ACTIVE' && <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:8, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace", padding:'1px 6px', borderRadius:3, background:'rgba(139,92,246,0.13)', color:'#22D3EE', border:'1px solid rgba(139,92,246,0.28)', flexShrink:0 }}><span style={{ width:4, height:4, borderRadius:'50%', background:'#8B5CF6', display:'inline-block' }}/>OPEN</span>}
              {comingSoon && <span style={{ fontSize:8, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace", padding:'1px 6px', borderRadius:3, background:'rgba(139,92,246,0.1)', color:'#A78BFA', border:'1px solid rgba(139,92,246,0.25)', flexShrink:0 }}>COMING SOON</span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <button onClick={handleShare} style={{ background:shared?'rgba(16,185,129,0.12)':'rgba(139,92,246,0.1)', border:`1px solid ${shared?'rgba(16,185,129,0.3)':'rgba(139,92,246,0.25)'}`, borderRadius:5, padding:'4px 10px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:shared?'#10B981':'#A78BFA', cursor:'pointer' }}>
                {shared?'✓':'↗'} SHARE
              </button>
              <ThemeToggle theme={effectiveTheme} onToggle={toggleTheme}/>
              <WalletButton walletState={walletState} onOpenModal={()=>setShowWallet(true)} onDisconnect={()=>setWalletState({status:'disconnected',address:null,short:null,balance:0,adapter:null,error:null})}/>
            </div>
          </div>
        </header>

        <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px 32px' }}>

          {/* Price header */}
          <div style={{ marginBottom:14, display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ flexShrink:0, filter:`drop-shadow(0 0 10px ${pal.accent}88)` }}>
              <TokenLogo id={p.id} size={48} image={p.image||null}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap', marginBottom:3 }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:26, color:'#22D3EE', letterSpacing:'-0.02em', textShadow:'0 0 16px rgba(34,211,238,0.5)' }}>{p.price.toFixed(5)}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:'var(--text-dim)' }}>SOL</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color:up?'#22D3EE':'#F43F5E' }}>{up?'▲':'▼'} {Math.abs(p.change).toFixed(1)}% (24h)</span>
              </div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>{p.volume?.toLocaleString()} vol · creator: {p.creator}</div>
            </div>
          </div>

          {/* Chart or countdown */}
          {comingSoon && p.goPublicAt
            ? <CountdownOverlay goPublicAt={p.goPublicAt} ticker={p.ticker}/>
            : p.chartData?.length>0 && (
              <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, padding:'10px 6px 6px', marginBottom:12 }}>
                <PriceChart data={p.chartData} cycleStart={Math.floor(p.chartData.length*0.62)}/>
              </div>
            )
          }

          {/* Cycle panel */}
          <CyclePanel cycle={cycle}/>

          {/* Your Position (if holding) */}
          {pos && (() => {
            const curVal=pos.totalTokens*p.price;
            const pnl=curVal-pos.totalSol;
            const pnlPct=pos.totalSol>0?(pnl/pos.totalSol)*100:0;
            const pup=pnl>=0;
            const fmt=n=>n>=1?n.toFixed(4):n.toPrecision(4);
            return (
              <div style={{ background:'var(--panel)', border:`1px solid ${pup?'rgba(16,185,129,0.3)':'rgba(244,63,94,0.3)'}`, borderRadius:10, padding:'13px', marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Your Position</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>{pos.buyCount} buy{pos.buyCount>1?'s':''}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:10 }}>
                  {[
                    {label:'Holdings',value:`${pos.totalTokens.toLocaleString()} ${p.ticker}`,color:'var(--text)'},
                    {label:'Current value',value:`${fmt(curVal)} SOL`,color:'#22D3EE'},
                    {label:'Avg buy price',value:`${pos.avgPrice.toPrecision(4)} SOL`,color:'var(--text-secondary)'},
                    {label:'Total spent',value:`${fmt(pos.totalSol)} SOL`,color:'var(--text-secondary)'},
                  ].map(({label,value,color})=>(
                    <div key={label} style={{ background:'var(--panel-alt)', borderRadius:6, padding:'7px 9px' }}>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:700, color }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:pup?'rgba(16,185,129,0.07)':'rgba(244,63,94,0.07)', border:`1px solid ${pup?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'}`, borderRadius:7, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>Unrealized P&L</span>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, color:pup?'#10B981':'#F43F5E' }}>{pup?'+':''}{fmt(pnl)} SOL</div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:pup?'#10B981':'#F43F5E' }}>{pup?'+':''}{pnlPct.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Buy panel */}
          {comingSoon ? (
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:10, padding:'18px 16px', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Buy ${p.ticker}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#A78BFA', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:3, padding:'2px 8px' }}>COMING SOON</span>
              </div>
              <button disabled style={{ width:'100%', padding:'13px 0', background:'var(--border)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-muted)', cursor:'not-allowed' }}>🔒 BUYING LOCKED</button>
            </div>
          ) : txState==='success'&&receipt ? (
            <div style={{ background:'var(--panel)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'18px 16px', marginBottom:12, textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:8 }}>✅</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'#10B981', marginBottom:14 }}>Purchase confirmed!</div>
              <div style={{ background:'var(--panel-alt)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8, padding:'12px', marginBottom:12 }}>
                {[['Tokens received',`${receipt.tokensOut?.toLocaleString()} ${p.ticker}`],['SOL spent',`${receipt.solIn} SOL`],['Fee (2%)',`${(receipt.solIn*0.02).toFixed(4)} SOL`]].map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:11 }}>
                    <span style={{ color:'var(--text-muted)' }}>{l}</span><span style={{ color:'var(--text)', fontWeight:700 }}>{v}</span>
                  </div>
                ))}
                {receipt.mock&&<div style={{ fontSize:9, color:'var(--text-muted)', marginTop:6, textAlign:'center' }}>demo — connect wallet for real trades</div>}
              </div>
              <ShareAfterBuyMini tokensOut={receipt.tokensOut} ticker={p.ticker} mint={mint} />
              <button onClick={()=>{setTxState('idle');setSol('');setReceipt(null);}} style={{ width:'100%', padding:'10px 0', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-dim)', cursor:'pointer', marginTop:8 }}>BUY MORE</button>
            </div>
          ) : (
            <div style={{ background:'var(--panel)', border:`1px solid ${txState==='error'?'rgba(248,113,113,0.3)':'var(--border)'}`, borderRadius:10, padding:'16px', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: wallet?8:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Buy ${p.ticker}</span>
                  <a href="/learn" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#A78BFA', textDecoration:'none' }}>how this works?</a>
                </div>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)' }}>slip {slippage}%</span>
              </div>
              {wallet && <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}><span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>Balance: <span style={{ color:'#22D3EE', fontWeight:600 }}>{walletState.balance??0} SOL</span></span></div>}
              {/* Presets */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginBottom:10 }}>
                {presets.map((v,i)=>{
                  const labels=['5%','10%','25%','50%'];
                  const active=sol===String(v);
                  return (
                    <button key={i} onClick={()=>setSol(String(v))} disabled={isProcessing}
                      style={{ background:active?'rgba(139,92,246,0.18)':'var(--panel-alt)', border:`1px solid ${active?'#7C3AED':'var(--border)'}`, borderRadius:5, padding:'5px 0', fontFamily:"'IBM Plex Mono',monospace", cursor:'pointer', opacity:isProcessing?0.5:1, minHeight:42, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1 }}>
                      <span style={{ fontSize:11, color:active?'#22D3EE':'var(--text-dim)', fontWeight:700 }}>{labels[i]}</span>
                      <span style={{ fontSize:9, color:active?'#A78BFA':'var(--text-muted)' }}>{v} SOL</span>
                    </button>
                  );
                })}
              </div>
              {/* Input */}
              <div style={{ position:'relative', marginBottom:10 }}>
                <input type="number" value={sol} onChange={e=>setSol(e.target.value)} placeholder="0.00" disabled={isProcessing}
                  style={{ width:'100%', background:'var(--panel-alt)', border:`1px solid ${errMsg?'#F43F5E':'var(--border)'}`, borderRadius:6, padding:'11px 46px 11px 12px', color:'var(--text)', fontSize:15, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:44 }}
                  onFocus={e=>e.currentTarget.style.borderColor='#8B5CF6'}
                  onBlur={e=>e.currentTarget.style.borderColor=errMsg?'#F43F5E':'var(--border)'}/>
                <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-dim)', fontWeight:600 }}>SOL</span>
              </div>
              {/* Quote */}
              {quote&&solNum>0&&(
                <div style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'10px 12px', marginBottom:10 }}>
                  {[['You receive',`~${tokensOut.toLocaleString()} ${p.ticker}`,'var(--text)'],['Mammoth fee (2%)',`${quote.fee?.toFixed(4)} SOL`,'var(--text-dim)']].map(([l,v,c])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:11 }}>
                      <span style={{ color:'var(--text-muted)' }}>{l}</span><span style={{ color:c, fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {errMsg&&<div style={{ color:'#F43F5E', fontSize:10, marginBottom:8 }}>⚠ {errMsg}</div>}
              <button onClick={handleBuy} disabled={isProcessing||(wallet&&solNum<=0)}
                style={{ width:'100%', padding:'12px 0', background:wallet?'linear-gradient(135deg,#7C3AED,#8B5CF6)':'var(--panel-alt)', border:`1px solid ${wallet?'#8B5CF6':'var(--border)'}`, borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:wallet?'#fff':'var(--text)', cursor:isProcessing?'not-allowed':'pointer', letterSpacing:'0.04em', minHeight:48 }}>
                {isProcessing?'PROCESSING...' : wallet?(solNum>0?`BUY ${tokensOut.toLocaleString()} ${p.ticker}`:'ENTER AMOUNT'):'CONNECT WALLET'}
              </button>
            </div>
          )}

          {/* Tabs — identical to project page */}
          <div ref={tabsRef} style={{ display:'flex', gap:0, borderBottom:'1px solid #1d2540', marginBottom:16, overflowX:'auto', scrollbarWidth:'none' }}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:'10px 14px', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:500, letterSpacing:'0.04em', color:tab===t?'#22D3EE':'var(--text-muted)', borderBottom:`2px solid ${tab===t?'#8B5CF6':'transparent'}`, transition:'all 0.13s', whiteSpace:'nowrap', flexShrink:0, minHeight:44 }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* About tab */}
          {tab==='About' && (
            <div>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.75, fontFamily:"'Space Grotesk',sans-serif", marginBottom:16 }}>{p.description}</p>
              {(() => {
                const activeLinks = LINK_DEFS.filter(l=>p[l.key]);
                if (!activeLinks.length) return null;
                return (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
                    {activeLinks.map(l=>(
                      <a key={l.key} href={p[l.key]} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:5, background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'5px 11px', textDecoration:'none', color:l.color, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600 }}>
                        {l.label}
                      </a>
                    ))}
                  </div>
                );
              })()}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                {[['Creator',p.creator],['Launched',p.createdAt],['Supply mode',p.supplyMode],['Hard cap',p.hardCap?'Yes — final':'No']].map(([k,v])=>(
                  <div key={k} style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
                    <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:3 }}>{k}</div>
                    <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:"'IBM Plex Mono',monospace", wordBreak:'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tokenomics tab */}
          {tab==='Tokenomics' && p.totalSupply && (
            <div>
              {[{label:'Public (cycles)',val:p.publicAlloc,color:'#22D3EE'},{label:'Treasury',val:p.treasuryAlloc,color:'#6D28D9'},{label:'Protocol (2%)',val:p.totalSupply*0.02,color:'var(--text-muted)'}].map((b,i)=>(
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-secondary)' }}>{b.label}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text)', fontWeight:600 }}>{((b.val||0)/1_000_000).toFixed(0)}M · {(((b.val||0)/p.totalSupply)*100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${((b.val||0)/p.totalSupply)*100}%`, background:b.color, borderRadius:3 }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cycles tab */}
          {tab==='Cycles' && (
            <div>
              {(p.cycleHistory||[]).map(c=>(
                <div key={c.id} style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:8, padding:'12px 13px', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--text)' }}>Cycle #{c.id}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:600, color:c.status==='COMPLETED'?'#22D3EE':c.status==='ACTIVE'?'#8B5CF6':'var(--text-muted)' }}>{c.status}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>
                    {[['Allocation',`${((c.allocation||0)/1000).toFixed(0)}K`],['Raised',c.raised],['Price range',c.priceRange]].map(([k,v])=>(
                      <div key={k}>
                        <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:2 }}>{k}</div>
                        <div style={{ fontSize:10, color:'var(--text)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!p.cycleHistory||p.cycleHistory.length===0)&&<div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', textAlign:'center', padding:'24px 0' }}>No cycle history yet</div>}
            </div>
          )}

          {/* Treasury tab */}
          {tab==='Treasury' && cycle?.treasuryRouting && (
            <div>
              <div style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:10, padding:'14px', marginBottom:12 }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Proceeds routing</div>
                {[['Creator treasury',cycle.treasuryRouting.creator+'%','#10B981'],['Reserve (SOL)',cycle.treasuryRouting.reserve+'%','var(--text-dim)'],['Sink / burn',cycle.treasuryRouting.sink+'%','var(--text-muted)'],['Protocol fee','2% (fixed)','#6D28D9']].map(([k,v,c])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #1a2438' }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)' }}>{k}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600, color:c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Powered by + full page link */}
          <div style={{ marginTop:24, paddingTop:16, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <a href={`${BASE}/token/${p.mint||p.id}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', textDecoration:'none' }}>Full page on Mammoth ↗</a>
            <a href={BASE} target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              Powered by <span style={{ background:'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontWeight:700 }}>Mammoth</span>
            </a>
          </div>
        </div>
      </div>

      {showWallet && <WalletModal onClose={()=>setShowWallet(false)} onConnected={s=>{setWalletState(s);setShowWallet(false);}}/>}
    </>
  );
}
