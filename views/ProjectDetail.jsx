'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ── Purchase history helpers ──────────────────────────────────────────────────
const PURCHASES_KEY = 'mammoth_purchases';

function loadPurchases() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]'); } catch { return []; }
}

export function savePurchase({ mintAddress, ticker, name, tokensOut, solIn, price, cycleId, cycleStatus }) {
  const all = loadPurchases();
  all.unshift({ mintAddress, ticker, name, tokensOut, solIn, price, cycleId, cycleStatus, ts: Date.now() });
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(all.slice(0, 500)));
}

export function getPositionForMint(mintAddress) {
  const all = loadPurchases();
  const mine = all.filter(p => String(p.mintAddress) === String(mintAddress));
  if (!mine.length) return null;
  const totalTokens = mine.reduce((s, p) => s + (p.tokensOut || 0), 0);
  const totalSol = mine.reduce((s, p) => s + (p.solIn || 0), 0);
  const avgPrice = totalTokens > 0 ? totalSol / totalTokens : 0;
  const firstBuy = mine[mine.length - 1];
  const lastBuy = mine[0];
  return { totalTokens, totalSol, avgPrice, firstBuy, lastBuy, buyCount: mine.length, source: 'local-history' };
}

export function getAllPositions() {
  const all = loadPurchases();
  const byMint = {};
  for (const p of all) {
    if (!byMint[p.mintAddress]) byMint[p.mintAddress] = [];
    byMint[p.mintAddress].push(p);
  }
  return Object.entries(byMint).map(([mintAddress, buys]) => {
    const totalTokens = buys.reduce((s, p) => s + (p.tokensOut || 0), 0);
    const totalSol = buys.reduce((s, p) => s + (p.solIn || 0), 0);
    const avgPrice = totalTokens > 0 ? totalSol / totalTokens : 0;
    const lastBuy = buys[0];
    return { mintAddress, ticker: lastBuy.ticker, name: lastBuy.name, totalTokens, totalSol, avgPrice, lastBuy, buyCount: buys.length, cycleStatus: lastBuy.cycleStatus };
  });
}
import { PublicKey } from '@solana/web3.js';
import { computeStepCurve, executeBuyTokens, executeExerciseRights } from '../lib/curves';
import { parseTransactionError, activateCycle, getProgram } from '../lib/anchorClient';
import { useApp } from '../lib/AppContext';
import { useToast } from '../components/ui/Toast';
import TokenLogo, { getTokenPalette } from '../components/ui/TokenLogo';
import ThemeToggle from '../components/ui/ThemeToggle';
import WalletButton from '../components/wallet/WalletButton';
import PriceChart from '../components/charts/PriceChart';

// ── Jupiter Terminal inline swap panel ───────────────────────────────────────
function JupiterPanel({ mintAddress, ticker }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const initiated = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    // Load Jupiter Terminal script once
    const existing = document.getElementById('jupiter-terminal-script');
    const init = () => {
      try {
        if (window.Jupiter) {
          window.Jupiter.init({
            displayMode: 'integrated',
            integratedTargetId: 'jupiter-terminal-container',
            endpoint: process.env.NEXT_PUBLIC_JUPITER_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
            defaultExplorer: 'Solscan',
            formProps: {
              initialInputMint: 'So11111111111111111111111111111111111111112', // SOL
              initialOutputMint: mintAddress || undefined,
              fixedOutputMint: !!mintAddress && mintAddress.length > 10,
            },
          });
          setLoaded(true);
        }
      } catch (e) {
        console.error('Jupiter init error:', e);
        setError(true);
      }
    };

    if (existing) {
      // Script already in DOM — just init
      if (window.Jupiter) init();
      else existing.addEventListener('load', init);
    } else {
      const script = document.createElement('script');
      script.id = 'jupiter-terminal-script';
      script.src = 'https://terminal.jup.ag/main-v3.js';
      script.async = true;
      script.onload = init;
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    }
  }, [mintAddress]);

  const fallbackUrl = `https://jup.ag/swap/SOL-${mintAddress || 'So11111111111111111111111111111111111111112'}`;

  return (
    <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid #1a2438' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>Cycle ended · secondary market</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Trade ${ticker}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#22D3EE', fontWeight:600 }}>Jupiter</span>
          </div>
        </div>
      </div>

      {/* Terminal container */}
      {!error ? (
        <div style={{ position:'relative', minHeight: 380 }}>
          {!loaded && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'var(--panel)' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid #1a2438', borderTopColor:'#22D3EE', animation:'spin 0.8s linear infinite' }}/>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>Loading Jupiter swap...</div>
            </div>
          )}
          <div id="jupiter-terminal-container" style={{ width:'100%' }}/>
        </div>
      ) : (
        /* Fallback if script fails to load */
        <div style={{ padding:'20px 16px' }}>
          <div style={{ background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:8, padding:'12px 14px', marginBottom:14, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>
            Jupiter swap is temporarily unavailable inline. Trade directly on Jupiter — your token address is pre-filled.
          </div>
          <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', display:'block' }}>
            <button style={{ width:'100%', padding:'13px 0', background:'#FF9F1C', color:'#000', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, cursor:'pointer', letterSpacing:'0.04em' }}>
              OPEN JUPITER →
            </button>
          </a>
        </div>
      )}

      <div style={{ padding:'8px 16px 12px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', textAlign:'center', lineHeight:1.6 }}>
        Powered by Jupiter · best-price routing across Solana DEXes · 2% Mammoth fee on Mammoth-routed trades
      </div>
    </div>
  );
}

// ── Inline info tooltip ──────────────────────────────────────────────────────
function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, lineHeight: 1, padding: '0 2px', display: 'inline-flex', alignItems: 'center' }}
      >ⓘ</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 300 }} />
          <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', zIndex: 301, background: 'var(--panel)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '10px 13px', width: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'fadeUp 0.15s ease', pointerEvents: 'none' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{text}</div>
          </div>
        </>
      )}
    </span>
  );
}

// ── Curve type definitions ───────────────────────────────────────────────────
const CURVE_DEFS = {
  'Step': {
    title: 'Step Curve',
    color: '#22D3EE',
    icon: '📊',
    desc: 'Price increases in fixed jumps. Every {stepSize} tokens sold, the price steps up by a set amount. You always know exactly when the next price increase hits — creating urgency without surprise.',
    detail: 'This is the most common curve on Mammoth. Great for projects that want predictable, milestone-driven price action.',
  },
  'Linear': {
    title: 'Linear Curve',
    color: '#A78BFA',
    icon: '📈',
    desc: 'Price rises smoothly and continuously with every token sold. No sudden jumps — the more that\'s bought, the higher the price climbs at a steady, consistent rate.',
    detail: 'Good for projects that want gradual, predictable appreciation without sharp step-up moments.',
  },
  'Exp-Lite': {
    title: 'Exp-Lite Curve',
    color: '#FF9F1C',
    icon: '🚀',
    desc: 'Price rises slowly at first, then accelerates as more tokens are sold. Early buyers get the best entry — late buyers pay a significant premium.',
    detail: 'Uses integer math for on-chain safety. High asymmetry for early buyers. Best for projects with strong early community.',
  },
};

function CurveModal({ curveType, stepSize, stepIncrement, onClose }) {
  const def = CURVE_DEFS[curveType] || CURVE_DEFS['Step'];
  const desc = def.desc.replace('{stepSize}', stepSize ? stepSize.toLocaleString() : '5,000');
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:`1px solid ${def.color}55`, borderRadius:14, padding:'24px 20px', width:'100%', maxWidth:380, boxShadow:'0 16px 48px rgba(0,0,0,0.6)', animation:'fadeUp 0.18s ease' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:28 }}>{def.icon}</span>
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:def.color }}>{def.title}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>how this cycle's pricing works</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 0 0 8px' }}>✕</button>
        </div>

        {/* Description */}
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-secondary)', lineHeight:1.75, marginBottom:16 }}>
          {desc}
        </div>

        {/* This cycle's specific params */}
        {(stepSize || stepIncrement) && (
          <div style={{ background:'var(--panel-alt)', border:`1px solid ${def.color}22`, borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>This cycle's parameters</div>
            {stepSize && (
              <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>Step size</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text)', fontWeight:600 }}>{stepSize.toLocaleString()} tokens</span>
              </div>
            )}
            {stepIncrement && (
              <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>Price increase per step</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:def.color, fontWeight:600 }}>+{stepIncrement.toFixed(5)} SOL</span>
              </div>
            )}
          </div>
        )}

        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.65, marginBottom:20 }}>
          {def.detail}
        </div>

        <button onClick={onClose} style={{ width:'100%', padding:'11px 0', background:def.color, border:'none', borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#000', cursor:'pointer', letterSpacing:'0.04em' }}>
          GOT IT
        </button>
      </div>
    </div>
  );
}

function CurveCard({ curveType, stepSize, stepIncrement }) {
  const [open, setOpen] = useState(false);
  const def = CURVE_DEFS[curveType] || CURVE_DEFS['Step'];
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{ background:'var(--panel-alt)', border:`1px solid ${def.color}33`, borderRadius:6, padding:'9px 11px', cursor:'pointer', transition:'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = `${def.color}88`}
        onMouseLeave={e => e.currentTarget.style.borderColor = `${def.color}33`}
      >
        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:5, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>Curve</span>
          <span style={{ fontSize:9, color:def.color, opacity:0.7 }}>tap to learn ⓘ</span>
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:def.color, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
          {def.icon} {curveType}
        </div>
      </div>
      {open && <CurveModal curveType={curveType} stepSize={stepSize} stepIncrement={stepIncrement} onClose={() => setOpen(false)} />}
    </>
  );
}

function CyclePanelDetail({ cycle }) {
  const pct = Math.round((cycle.sold/cycle.allocation)*100);
  const launchPrice = cycle.basePrice ?? cycle.launchPrice ?? cycle.currentPrice;
  return (
    <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, padding:'16px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Cycle #{cycle.id}</span>
        {cycle.status==='ACTIVE'
          ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, letterSpacing:'0.06em', fontFamily:"'IBM Plex Mono',monospace", padding:'3px 9px', borderRadius:4, background:'rgba(139,92,246,0.13)', color:'#22D3EE', border:'1px solid rgba(139,92,246,0.28)' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#8B5CF6', display:'inline-block', animation:'blink 2s ease-in-out infinite' }}/>OPEN</span>
          : <span style={{ fontSize:10, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace", color:'var(--text-muted)' }}>ENDED</span>
        }
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{(cycle.sold ?? 0).toLocaleString()} / {(cycle.allocation ?? 0).toLocaleString()} sold</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>{pct}%</span>
        </div>
        <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:cycle.status==='ACTIVE'?'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)':'var(--bar-empty)', borderRadius:3 }}/>
        </div>
      </div>
      <div className="cycle-panel-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        {/* Curve — entire card is clickable */}
        <CurveCard curveType={cycle.curveType} stepSize={cycle.stepSize} stepIncrement={cycle.stepIncrement}/>
        {/* Launch price */}
        <div className="cycle-stat-tile" style={{ background:'var(--panel-alt)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:6, padding:'9px 11px' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4, display:'flex', alignItems:'center' }}>Launch price<InfoTip text="The price per token when this cycle first opened. Early buyers pay this — price only goes up from here." /></div>
          <div style={{ fontSize:12, color:'#A78BFA', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{(launchPrice ?? 0).toFixed(5)} SOL</div>
        </div>
        {/* Current price */}
        <div className="cycle-stat-tile" style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Current price</div>
          <div style={{ fontSize:12, color:'#22D3EE', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{(cycle.currentPrice ?? 0).toFixed(5)} SOL</div>
        </div>
        {/* Remaining */}
        <div className="cycle-stat-tile" style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4, display:'flex', alignItems:'center' }}>Remaining<InfoTip text="Tokens still available in this cycle. Once zero, the cycle ends and no more tokens can be bought here." /></div>
          <div style={{ fontSize:12, color:'var(--text)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{((cycle.allocation ?? 0) - (cycle.sold ?? 0)).toLocaleString()}</div>
        </div>
        {cycle.nextStepPrice && (
          <div style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
            <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Next step</div>
            <div style={{ fontSize:12, color:'var(--text)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{(cycle.nextStepPrice ?? 0).toFixed(5)} SOL</div>
          </div>
        )}
      </div>
      {cycle.nextStepIn && cycle.status==='ACTIVE' && (
        <div className="next-step-banner" style={{ background:'rgba(255,159,28,0.07)', border:'1px solid rgba(255,159,28,0.18)', borderRadius:6, padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:2 }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#d97706' }}>⚡ next price jump in</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:'#F59E0B', fontWeight:700 }}>{cycle.nextStepIn.toLocaleString()} tokens</span>
        </div>
      )}
    </div>
  );
}

const BASE_URL = 'https://mammothprotocol.com';

export function ShareAfterBuy({ tokensOut, ticker, mintAddress, context }) {
  const [shared, setShared] = useState(null);

  const shareText = `Just bought ${tokensOut?.toLocaleString()} $${ticker} on Mammoth Protocol 🦣`;
  const miniUrl   = `${BASE_URL}/mini/${mintAddress}`;
  const pageUrl   = `${BASE_URL}/token/${mintAddress}`;
  const shareUrl  = context === 'mini' ? miniUrl : pageUrl;

  const handleShare = async (platform) => {
    const encoded = encodeURIComponent;
    const urls = {
      twitter:   `https://twitter.com/intent/tweet?text=${encoded(shareText)}&url=${encoded(shareUrl)}`,
      telegram:  `https://t.me/share/url?url=${encoded(shareUrl)}&text=${encoded(shareText)}`,
      farcaster: `https://warpcast.com/~/compose?text=${encoded(shareText + ' ' + shareUrl)}`,
      copy:      null,
    };

    if (platform === 'native' && navigator.share) {
      await navigator.share({ title: `$${ticker} on Mammoth`, text: shareText, url: shareUrl });
      setShared('native');
    } else if (platform === 'tg-native' && typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(`https://t.me/share/url?url=${encoded(shareUrl)}&text=${encoded(shareText)}`);
      setShared('tg-native');
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShared('copy');
      setTimeout(() => setShared(null), 2500);
    } else if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
      setShared(platform);
    }
  };

  // In Telegram mini app — show single native share button
  const isTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp;

  return (
    <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.05))', border:'1px solid rgba(139,92,246,0.2)', borderRadius:9, padding:'14px', marginBottom:8 }}>
      <div style={{ textAlign:'center', marginBottom:12 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:3 }}>
          🎉 Pump your bags
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', lineHeight:1.6 }}>
          You just backed {ticker}. Let your community know.
        </div>
      </div>

      {isTelegram ? (
        <button onClick={() => handleShare('tg-native')}
          style={{ width:'100%', padding:'10px 0', background:'rgba(41,182,246,0.15)', border:'1px solid rgba(41,182,246,0.3)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#29B6F6', cursor:'pointer', letterSpacing:'0.04em' }}>
          ✈️ Share on Telegram
        </button>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
          {[
            { key:'twitter',   icon:'𝕏',  label:'Post on X',       color:'var(--text)' },
            { key:'telegram',  icon:'✈️', label:'Share on Telegram', color:'#29B6F6' },
            { key:'farcaster', icon:'🟣', label:'Cast on Farcaster', color:'#855DCD' },
            { key:'copy',      icon:'🔗', label: shared==='copy' ? '✓ Copied!' : 'Copy link', color: shared==='copy' ? '#10B981' : '#A78BFA' },
          ].map(({ key, icon, label, color }) => (
            <button key={key} onClick={() => handleShare(key)}
              style={{ padding:'9px 0', background:'var(--panel-alt)', border:`1px solid ${shared===key&&key!=='copy'?'rgba(139,92,246,0.4)':'var(--border)'}`, borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.13s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor=shared===key&&key!=='copy'?'rgba(139,92,246,0.4)':'var(--border)'}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BuyPanel({ cycle, price, ticker, mintAddress, walletConnected, walletBalance, walletLoading, onConnect, onPurchaseComplete, comingSoon, goPublicAt }) {
  // Live countdown for coming soon state
  const [, csForce] = useState(0);
  useEffect(() => {
    if (!comingSoon) return;
    const t = setInterval(() => csForce(n => n + 1), 1000);
    return () => clearInterval(t);
  }, [comingSoon]);
  const { connection, getWalletAdapter, loadOnChainProjects } = useApp();
  const toast = useToast();
  const [txState, setTxState] = useState('idle');
  const [sol, setSol] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const [slippage, setSlippage] = useState(5);
  const [showSlippage, setShowSlippage] = useState(false);
  const [activating, setActivating] = useState(false);
  // Dynamic presets — 5%, 10%, 25%, 50% of remaining cycle value in SOL
  const remainingTokens = (cycle?.allocation ?? 0) - (cycle?.sold ?? 0);
  const cycleRemainingSOL = remainingTokens * (cycle?.currentPrice ?? 0);
  const PRESETS = [0.05, 0.10, 0.25, 0.50].map(pct => {
    const raw = cycleRemainingSOL * pct;
    if (raw <= 0) return 0.0001;
    // Find how many decimal places we need to show 2 significant figures
    const decimals = raw >= 1 ? 2 : Math.max(2, Math.ceil(-Math.log10(raw)) + 1);
    return parseFloat(raw.toFixed(decimals));
  });
  const solNum = parseFloat(sol) || 0;

  // Mock projects have a numeric id — must be declared first, used below
  const isMockProject = mintAddress && /^\d+$/.test(String(mintAddress));

  const quote = solNum > 0 && cycle ? computeStepCurve({ solIn:solNum, sold:cycle.sold ?? 0, allocation:cycle.allocation ?? 0, startPrice:cycle.currentPrice ?? 0, stepSize:cycle.stepSize||5000, stepIncrement:cycle.stepIncrement||0.00022, feeBps:200 }) : null;
  const tokensOut = quote?.tokensOut ?? 0;
  const exceedsRights = walletConnected && (cycle?.userRights ?? 0) > 0 && tokensOut > ((cycle?.userRights ?? 0) - (cycle?.userRightsUsed||0));
  const exceedsAllocation = quote ? quote.remainingAfter < 0 : false;
  // Skip slippage check on mock/demo projects — only enforce on real on-chain trades
  const currentPrice = cycle?.currentPrice ?? 0;
  const priceImpactPct = quote && currentPrice > 0 ? ((quote.effectivePrice - currentPrice) / currentPrice * 100) : 0;
  const slippageOk = isMockProject ? true : (quote ? priceImpactPct <= slippage : true);
  const hasError = exceedsRights || exceedsAllocation || (!slippageOk && solNum > 0);

  const validationMsg = exceedsRights ? `Exceeds your rights allocation (${(cycle?.userRights||0).toLocaleString()} tokens)`
    : exceedsAllocation ? 'Amount exceeds remaining cycle allocation'
    : !slippageOk && solNum > 0 ? `Price impact too high (${priceImpactPct.toFixed(1)}%) — tap ⚙ to raise slippage tolerance`
    : null;
  const canSubmit = (walletConnected || isMockProject) && solNum > 0 && !hasError && txState === 'idle';
  const btnLabel = {
    idle: solNum > 0 ? 'CONFIRM PURCHASE' : 'ENTER AMOUNT',
    awaiting: 'AWAITING WALLET...',
    loading: 'CONFIRMING...',
    success: 'DONE',
    error: 'TRY AGAIN',
  }[txState];

  const handleBuy = async () => {
    if (!walletConnected && !isMockProject) { onConnect(); return; }
    if (!canSubmit && txState !== 'error') return;
    setTxState('awaiting'); setErrMsg('');

    try {
      setTxState('loading');

      // Use real on-chain if we have a real mint address (44-char base58, not a numeric mock id)
      const isRealMint = mintAddress && mintAddress.length >= 32 && !mintAddress.includes('...') && !/^\d+$/.test(mintAddress);
      const walletAdapter = getWalletAdapter?.();

      if (isRealMint && walletAdapter) {
        const result = await executeBuyTokens({
          connection,
          walletAdapter,
          mintAddress,
          amount: tokensOut,
          solIn: solNum,
          ticker,
        });
        setReceipt(result);
        setTxState('success');
        savePurchase({ mintAddress, ticker, name: ticker, tokensOut, solIn: solNum, price: solNum / tokensOut, cycleId: cycle?.id, cycleStatus: cycle?.status });
        toast.success(`Bought ${tokensOut.toLocaleString()} ${ticker}!`);
        onPurchaseComplete?.(result, quote);
      } else {
        // Fallback mock for demo/devnet projects
        await new Promise(r => setTimeout(r, 900)); // simulate latency
        const mockSig = 'MOCK' + Math.random().toString(36).slice(2, 10).toUpperCase();
        const result = { tokensOut, solIn: solNum, fee: solNum * 0.02, signature: mockSig, mock: true };
        setReceipt(result);
        setTxState('success');
        savePurchase({ mintAddress, ticker, name: ticker, tokensOut, solIn: solNum, price: solNum / tokensOut, cycleId: cycle?.id, cycleStatus: cycle?.status });
        toast.success(`Bought ${tokensOut.toLocaleString()} ${ticker}!`);
        onPurchaseComplete?.(result, quote);
      }
    } catch(e) {
      const userMsg = parseTransactionError ? parseTransactionError(e) : null;
      if (userMsg === null) {
        setTxState('idle');
        return;
      }
      if (userMsg === 'Insufficient balance') {
        toast.error('Insufficient balance');
        setTxState('idle');
        return;
      }
      setErrMsg(userMsg || e?.message || 'Unknown error');
      setTxState('error');
      toast.error(userMsg || 'Transaction failed, please try again');
    }
  };

  const handleReset = () => { setTxState('idle'); setSol(''); setReceipt(null); setErrMsg(''); };
  const isProcessing = txState === 'awaiting' || txState === 'loading';

  // ── Phase detection for non-ACTIVE cycles ────────────────────────────────────
  // Pre-launch: countdown still ticking. Pending-activation: countdown expired
  // but cycle isn't ACTIVE yet — typically RIGHTS_WINDOW awaiting activate_cycle.
  // Be permissive: any non-ACTIVE / non-ended cycle past goPublicAt gets the
  // GO LIVE button. The on-chain call surfaces a real error if it can't run
  // (e.g. cycle never opened), instead of silently falling through to Jupiter.
  const countdownActive = comingSoon && goPublicAt && new Date(goPublicAt) > new Date();
  const launchTimePast = goPublicAt && new Date(goPublicAt) <= new Date();
  const cycleEnded = cycle?.status === 'CLOSED' || cycle?.status === 'TERMINATED';
  const needsActivation = launchTimePast && cycle?.status !== 'ACTIVE' && !cycleEnded;

  const handleActivate = async () => {
    const walletAdapter = getWalletAdapter?.();
    if (!walletAdapter) { onConnect?.(); return; }
    setActivating(true);
    try {
      const program = getProgram(connection, walletAdapter);
      // getProjectStatePDA calls .toBuffer() — must pass PublicKey, not string.
      const mintPubkey = new PublicKey(mintAddress);
      // mapOnChainProject sets cycleData.id = project.current_cycle (the count
      // after open_cycle increments it). The active cycle's PDA index is one
      // less. activate_cycle's PDA seed must match cycle_state.cycle_index.
      const cycleIndex = Math.max(0, (cycle?.id ?? 1) - 1);
      await activateCycle(program, mintPubkey, cycleIndex);
      toast.success(`${ticker} is live — public buying open!`);
      await loadOnChainProjects?.();
    } catch (e) {
      const userMsg = parseTransactionError(e);
      toast.error(userMsg || 'Failed to activate cycle');
    } finally {
      setActivating(false);
    }
  };

  if (cycle?.status !== 'ACTIVE' && !countdownActive && !needsActivation) {
    return <JupiterPanel mintAddress={mintAddress} ticker={ticker} />;
  }

  if (txState === 'success' && receipt) return (
    <div style={{ background:'var(--panel)', border:'1px solid rgba(16,185,129,0.35)', borderRadius:10, padding:'24px 18px', animation:'fadeUp 0.25s ease' }}>
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(16,185,129,0.15)', border:'2px solid rgba(16,185,129,0.5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:24 }}>✓</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:'#10B981', marginBottom:4 }}>Purchase confirmed!</div>
        {receipt.mock && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>demo transaction — connect wallet for real trades</div>}
      </div>
      <div className="receipt-rows" style={{ background:'var(--panel-alt)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8, padding:'14px', marginBottom:16 }}>
        {[
          ['Tokens received', `${(receipt.tokensOut||0).toLocaleString()} ${ticker}`, '#10B981'],
          ['SOL spent', `${Number(receipt.solIn||0).toFixed(4)} SOL`, 'var(--text)'],
          ['Mammoth fee (2%)', `${(Number(receipt.solIn||0)*0.02).toFixed(4)} SOL`, 'var(--text-dim)'],
          ['Tx signature', (receipt.signature||'').slice(0,10)+'...', 'var(--text-muted)'],
        ].map(([l,v,c],i,arr) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:i<arr.length-1?'1px solid #1a2438':'none', flexWrap:'wrap', gap:4 }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{l}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:c, fontWeight:600, wordBreak:'break-all' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.18)', borderRadius:7, padding:'10px 12px', marginBottom:14, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(16,185,129,0.8)', lineHeight:1.6 }}>
        Your tokens are now in your wallet. Trading via Jupiter is available when the cycle ends. Check the Cycles tab for history.
      </div>

      {/* Share after buy */}
      <ShareAfterBuy tokensOut={receipt.tokensOut} ticker={ticker} mintAddress={mintAddress} context="app" />

      <button onClick={handleReset} style={{ width:'100%', padding:'11px 0', borderRadius:7, border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.08)', color:'#10B981', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, cursor:'pointer', letterSpacing:'0.04em', marginTop:8 }}>BUY MORE</button>
    </div>
  );

  // Coming soon locked state — countdown only, rest of panel header stays
  if (countdownActive) {
    const diff = Math.max(0, new Date(goPublicAt) - Date.now());
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const pad  = n => String(n).padStart(2, '0');
    return (
      <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:10, padding:'18px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Buy ${ticker}</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#A78BFA', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:3, padding:'2px 8px' }}>COMING SOON</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginBottom:14 }}>
          {[[days,'DAYS'],[hrs,'HRS'],[mins,'MIN'],[secs,'SEC']].map(([val,label]) => (
            <div key={label} style={{ background:'var(--panel-alt)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:7, padding:'10px 4px', textAlign:'center' }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:20, color:'#A78BFA', lineHeight:1 }}>{pad(val)}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginTop:4, letterSpacing:'0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', textAlign:'center', marginBottom:14, lineHeight:1.7 }}>
          Opens {new Date(goPublicAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} at {new Date(goPublicAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
        </div>
        <button disabled style={{ width:'100%', padding:'13px 0', background:'var(--border)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-muted)', cursor:'not-allowed', letterSpacing:'0.04em' }}>
          🔒 BUYING LOCKED
        </button>
      </div>
    );
  }

  // Pending activation — countdown ended but on-chain cycle still in
  // RIGHTS_WINDOW. activate_cycle is permissionless, so any visitor with a
  // wallet can flip it to Active.
  if (needsActivation) {
    return (
      <div style={{ background:'var(--panel)', border:'1px solid rgba(139,92,246,0.35)', borderRadius:10, padding:'18px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Buy ${ticker}</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#22D3EE', background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.3)', borderRadius:3, padding:'2px 8px' }}>READY TO LAUNCH</span>
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.6, marginBottom:14, textAlign:'center' }}>
          Launch time has passed. One on-chain confirmation flips the cycle live and opens public buying.
        </div>
        <button
          onClick={handleActivate}
          disabled={activating}
          style={{ width:'100%', padding:'13px 0', background: activating ? 'var(--border)' : 'linear-gradient(90deg,#7C3AED,#22D3EE)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor: activating ? 'wait' : 'pointer', letterSpacing:'0.04em' }}>
          {activating ? 'ACTIVATING...' : (walletConnected ? '⚡ GO LIVE' : 'CONNECT WALLET TO ACTIVATE')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ background:'var(--panel)', border:`1px solid ${txState==='error'?'rgba(248,113,113,0.3)':'var(--border)'}`, borderRadius:10, padding:'18px 16px', transition:'border-color 0.2s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:walletConnected?8:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Buy ${ticker}</span>
          <a href="/learn" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#A78BFA', textDecoration:'none', letterSpacing:'0.03em', opacity:0.8 }}>how this works?</a>
        </div>
        <button onClick={() => setShowSlippage(s => !s)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', display:'flex', alignItems:'center', gap:2 }}>
          ⚙ {slippage}% slip<InfoTip text="Slippage tolerance — the max price increase you'll accept between submitting and confirming. Bonding curves move price as tokens are bought, so large orders may pay slightly more." />
        </button>
      </div>
      {walletConnected && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:10 }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>
            Balance: <span style={{ color:'#22D3EE', fontWeight:600 }}>{walletLoading ? '—' : `${walletBalance ?? 0} SOL`}</span>
          </span>
        </div>
      )}

      {showSlippage && (
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'10px 12px', marginBottom:12, animation:'fadeUp 0.15s ease' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:8 }}>slippage tolerance</div>
          <div style={{ display:'flex', gap:6 }}>
            {[0.5,1,2,5].map(v => (
              <button key={v} onClick={() => { setSlippage(v); setShowSlippage(false); }}
                style={{ flex:1, padding:'6px 0', background:slippage===v?'rgba(139,92,246,0.18)':'var(--panel)', border:`1px solid ${slippage===v?'#7C3AED':'var(--border)'}`, borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:slippage===v?'#22D3EE':'var(--text-dim)', cursor:'pointer' }}>
                {v}%
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="sol-presets" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12 }}>
        {PRESETS.map((v, i) => {
          const labels = ['5%','10%','25%','50%'];
          const solStr = v.toString();
          const active = sol === solStr;
          return (
            <button key={i} onClick={() => !isProcessing && setSol(solStr)}
              style={{ background:active?'rgba(139,92,246,0.18)':'var(--panel-alt)', border:`1px solid ${active?'#7C3AED':'var(--border)'}`, borderRadius:5, padding:'5px 0', fontFamily:"'IBM Plex Mono',monospace", cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1, minHeight:44, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1 }}>
              <span style={{ fontSize:11, color:active?'#22D3EE':'var(--text-dim)', fontWeight:700 }}>{labels[i]}</span>
              <span style={{ fontSize:9, color:active?'#A78BFA':'var(--text-muted)' }}>{solStr} SOL</span>
            </button>
          );
        })}
      </div>
      <div style={{ position:'relative', marginBottom:12 }}>
        <input type="number" value={sol} onChange={e => !isProcessing && setSol(e.target.value)} placeholder="0.00" disabled={isProcessing}
          style={{ width:'100%', background:'var(--panel-alt)', border:`1px solid ${hasError?'#F43F5E':'var(--border)'}`, borderRadius:6, padding:'12px 52px 12px 14px', color:'var(--text)', fontSize:16, fontFamily:"'IBM Plex Mono',monospace", outline:'none', opacity:isProcessing?0.6:1, boxSizing:'border-box', minHeight:44 }}/>
        <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:'var(--text-dim)', fontWeight:600 }}>SOL</span>
      </div>
      {quote && solNum > 0 && (
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'11px 13px', marginBottom:12, animation:'fadeUp 0.15s ease' }}>
          {[['You receive',`~${tokensOut.toLocaleString()} ${ticker}`,'var(--text)'],['Mammoth fee (2%)',`${quote.fee.toFixed(4)} SOL`,'var(--text-dim)'],['Price impact',`+${((quote.effectivePrice - cycle.currentPrice) / cycle.currentPrice * 100).toFixed(2)}%`,'var(--text-dim)']].map(([l,v,c],i,arr) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', borderBottom:i<arr.length-1?'1px solid #1a2438':'none' }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{l}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:c, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      {validationMsg && <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, padding:'8px 12px', marginBottom:12, fontSize:11, color:'#F43F5E', fontFamily:"'IBM Plex Mono',monospace" }}>⚠ {validationMsg}</div>}
      {txState === 'error' && errMsg && (
        <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:6, padding:'10px 12px', marginBottom:12 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#F43F5E', fontWeight:600, marginBottom:3 }}>Transaction failed</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(248,113,113,0.7)' }}>{errMsg}</div>
        </div>
      )}
      {isProcessing && (
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'12px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid #252848', borderTopColor:'#8B5CF6', animation:'spin 0.7s linear infinite', flexShrink:0 }}/>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>{txState==='awaiting'?'Waiting for wallet signature...':'Confirming on-chain...'}</div>
        </div>
      )}
      <button onClick={txState==='error'?handleReset:handleBuy} disabled={isProcessing||(txState==='idle'&&!canSubmit)}
        style={{ width:'100%', padding:'13px 0', borderRadius:7, border:txState==='error'?'1px solid rgba(248,113,113,0.3)':'none', background:txState==='error'?'rgba(248,113,113,0.12)':isProcessing?'#2d1f7a':canSubmit?'#8B5CF6':'var(--border)', color:txState==='error'?'#F43F5E':isProcessing?'var(--text-dim)':canSubmit?'#fff':'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14, cursor:isProcessing||(!canSubmit&&txState==='idle')?'not-allowed':'pointer', letterSpacing:'0.05em', transition:'all 0.15s', minHeight:48 }}>
        {btnLabel}
      </button>
      <div style={{ marginTop:10, fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", textAlign:'center' }}>{slippage}% slippage · 2% Mammoth fee · no custody</div>
    </div>
  );
}

// Fake chart bars — stable across renders (seeded by index)
const FAKE_BARS = Array.from({length:40}, (_,i) => 18 + Math.abs(Math.sin(i * 0.8 + 1.2) * 28 + Math.sin(i * 0.3) * 14));

function CountdownChart({ goPublicAt, ticker }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(goPublicAt) - Date.now());
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const pad  = n => String(n).padStart(2,'0');

  return (
    <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, marginBottom:12, overflow:'hidden', position:'relative' }}>
      {/* Blurred fake chart bars */}
      <div style={{ padding:'12px 8px 8px', filter:'blur(1.5px)', opacity:0.18, pointerEvents:'none', userSelect:'none' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:80, padding:'0 4px' }}>
          {FAKE_BARS.map((h,i) => (
            <div key={i} style={{ flex:1, borderRadius:'2px 2px 0 0', background:`linear-gradient(180deg,#8B5CF6,#22D3EE)`, height:`${h}px`, opacity: i > FAKE_BARS.length * 0.62 ? 1 : 0.5 }}/>
          ))}
        </div>
        {/* Fake x-axis */}
        <div style={{ height:1, background:'var(--border)', margin:'4px 4px 0' }}/>
      </div>

      {/* Countdown overlay */}
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(8,12,20,0.72)', backdropFilter:'blur(2px)' }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#A78BFA', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>
          ${ticker} launches in
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
          {[[days,'D'],[hrs,'H'],[mins,'M'],[secs,'S']].map(([val, label]) => (
            <div key={label} style={{ textAlign:'center', minWidth:44 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:22, color:'#fff', lineHeight:1, letterSpacing:'-0.02em' }}>{pad(val)}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginTop:3, letterSpacing:'0.1em' }}>{label}</div>
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

function ComingSoonPanel({ goPublicAt, ticker }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(goPublicAt) - Date.now());
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const pad  = n => String(n).padStart(2, '0');
  const gone = diff === 0;

  return (
    <div style={{ background:'var(--panel)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:10, padding:'20px 16px' }}>
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#A78BFA', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
          {gone ? '🚀 Launching now' : '📅 Not yet open'}
        </div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:4 }}>
          ${ticker} goes public on
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#A78BFA' }}>
          {new Date(goPublicAt).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
          {' at '}
          {new Date(goPublicAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
        </div>
      </div>

      {/* Countdown */}
      {!gone && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginBottom:16 }}>
          {[[days,'DAYS'],[hrs,'HRS'],[mins,'MIN'],[secs,'SEC']].map(([val, label]) => (
            <div key={label} style={{ background:'var(--panel-alt)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:7, padding:'10px 6px', textAlign:'center' }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:20, color:'#A78BFA', lineHeight:1 }}>{pad(val)}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginTop:4, letterSpacing:'0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.15)', borderRadius:7, padding:'10px 14px', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', lineHeight:1.75, textAlign:'center' }}>
        Buying opens when the cycle launches. Check back then — or come back to this page and the buy panel will appear automatically.
      </div>
    </div>
  );
}

export default function ProjectDetail({ project: p, onBack, wallet, walletState, onOpenModal, onDisconnect, onConnect, onPurchase, onManageCycles, theme, onToggleTheme, rpcError }) {
  const [tab, setTab] = useState('About');
  const tabsRef = useRef(null);
  const tabBtnRefs = useRef([]);
  const up = p.change >= 0;
  const TABS = ['About','Tokenomics','Cycles','Treasury'];

  const handleTabClick = (t, idx) => {
    setTab(t);
    const btn = tabBtnRefs.current[idx];
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--page-bg)', color:'var(--text)' }}>
      <header style={{ background:'var(--header-bg)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--header-border)', position:'sticky', top:0, zIndex:50, boxShadow:'var(--header-shadow)' }}>
        <div className="header-inner" style={{ maxWidth:960, margin:'0 auto', padding:'0 16px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, minWidth:0 }}>
          <div className="detail-header-left" style={{ display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1, overflow:'hidden' }}>
            <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:18, lineHeight:1, padding:'4px 6px 4px 0', flexShrink:0, minWidth:28, minHeight:44, display:'flex', alignItems:'center' }}>←</button>
            <a href="/" style={{ display:'flex', flexShrink:0 }}>
              <img src="/mammoth-logo-dark.gif" alt="Mammoth" width={28} height={28} style={{ borderRadius:6, objectFit:'cover', display:'block' }}/>
            </a>
            <div className="detail-header-name-row" style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'nowrap', overflow:'hidden', minWidth:0 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', background:'var(--badge-bg)', border:'1px solid #252848', borderRadius:3, padding:'2px 7px', flexShrink:0 }}>${p.ticker}</span>
              {p.status==='ACTIVE' && <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace", padding:'2px 8px', borderRadius:4, background:'rgba(139,92,246,0.13)', color:'#22D3EE', border:'1px solid rgba(139,92,246,0.28)', flexShrink:0 }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'#8B5CF6', display:'inline-block', animation:'blink 2s ease-in-out infinite' }}/>OPEN</span>}
              {(p.status==='BETWEEN' || p.status==='CLOSED') && <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace", padding:'2px 8px', borderRadius:4, background:'rgba(255,159,28,0.10)', color:'#FF9F1C', border:'1px solid rgba(255,159,28,0.28)', flexShrink:0 }}>BETWEEN</span>}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <span className="nav-theme-toggle"><ThemeToggle theme={theme} onToggle={onToggleTheme}/></span>
            <WalletButton walletState={walletState} onOpenModal={onOpenModal} onDisconnect={onDisconnect}/>
          </div>
        </div>
      </header>

      {rpcError && (
        <div style={{ background:'rgba(251,146,60,0.08)', borderBottom:'1px solid rgba(251,146,60,0.22)', padding:'8px 16px', display:'flex', alignItems:'center', gap:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#FB923C' }}>
          <span>⚠️</span>
          <span>{rpcError}</span>
        </div>
      )}

      <div className="detail-main" style={{ maxWidth:960, margin:'0 auto', padding:'0 16px 64px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 310px', gap:16, alignItems:'start', paddingTop:20 }} className="detail-grid">
          <div>
            <div style={{ marginBottom:16, display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ flexShrink:0, filter:`drop-shadow(0 0 12px ${getTokenPalette(p.id).accent}88)` }}>
                <TokenLogo id={p.id} size={56} image={p.image||null}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap', marginBottom:4 }}>
                  <span className="price-display" style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:28, color:'#22D3EE', letterSpacing:'-0.03em', textShadow:'0 0 20px rgba(34,211,238,0.6)' }}>{p.price.toFixed(5)}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, color:'var(--text-dim)' }}>SOL</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:700, color:up?'#22D3EE':'#F43F5E' }}>{up?'▲':'▼'} {Math.abs(p.change).toFixed(1)}% (24h)</span>
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{p.volume.toLocaleString()} vol · creator: {p.creator}</div>
              </div>
            </div>
            {p.status === 'COMING_SOON' && p.goPublicAt
              ? <CountdownChart goPublicAt={p.goPublicAt} ticker={p.ticker} />
              : (
                <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, padding:'12px 8px 8px', marginBottom:12 }}>
                  <PriceChart data={p.chartData} cycleStart={Math.floor(p.chartData.length*0.62)}/>
                </div>
              )
            }
            <div className="desktop-only"><CyclePanelDetail cycle={{ ...p.cycleData, launchPrice: p.chartData?.[0]?.p }}/></div>
          </div>

          <div style={{ position:'sticky', top:68 }}>
            <div className="mobile-only" style={{ marginBottom:12 }}><CyclePanelDetail cycle={{ ...p.cycleData, launchPrice: p.chartData?.[0]?.p }}/></div>

            {/* ── Your Position panel ── */}
            {wallet && (() => {
              const pos = getPositionForMint(p.mint || p.id);
              if (!pos) return null;
              const currentValue = pos.totalTokens * p.price;
              const pnlSol = currentValue - pos.totalSol;
              const pnlPct = pos.totalSol > 0 ? (pnlSol / pos.totalSol) * 100 : 0;
              const up = pnlSol >= 0;
              const fmt = (n) => n >= 1 ? n.toFixed(4) : n.toPrecision(4);
              const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric' });
              return (
                <div style={{ background:'var(--panel)', border:`1px solid ${up ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`, borderRadius:10, padding:'14px', marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Your Position</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>{pos.buyCount} buy{pos.buyCount > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:7, padding:'8px 10px', marginBottom:10, fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#F59E0B', lineHeight:1.6 }}>
                    Local purchase history only — not authoritative wallet balance.
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                    {[
                      { label:'Holdings', value:`${pos.totalTokens.toLocaleString()} ${p.ticker}`, color:'var(--text)' },
                      { label:'Current value', value:`${fmt(currentValue)} SOL`, color:'#22D3EE' },
                      { label:'Avg buy price', value:`${pos.avgPrice.toPrecision(4)} SOL`, color:'var(--text-secondary)' },
                      { label:'Total spent', value:`${fmt(pos.totalSol)} SOL`, color:'var(--text-secondary)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background:'var(--panel-alt)', borderRadius:6, padding:'8px 10px' }}>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:3 }}>{label}</div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:700, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {/* P&L row */}
                  <div style={{ background: up ? 'rgba(16,185,129,0.07)' : 'rgba(244,63,94,0.07)', border:`1px solid ${up ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`, borderRadius:7, padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>Unrealized P&L</span>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, color: up ? '#10B981' : '#F43F5E' }}>
                        {up ? '+' : ''}{fmt(pnlSol)} SOL
                      </div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: up ? '#10B981' : '#F43F5E' }}>
                        {up ? '+' : ''}{pnlPct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', display:'flex', justifyContent:'space-between' }}>
                    <span>First buy: {fmtDate(pos.firstBuy.ts)}</span>
                    <span>Last buy: {fmtDate(pos.lastBuy.ts)}</span>
                  </div>
                </div>
              );
            })()}

            <BuyPanel cycle={p.cycleData} price={p.price} ticker={p.ticker} mintAddress={p.mint || p.id} walletConnected={wallet} walletBalance={walletState?.balance} walletLoading={walletState?.status === 'connecting'} onConnect={onConnect} onPurchaseComplete={(r,q) => onPurchase?.(r,q)} comingSoon={p.status === 'COMING_SOON'} goPublicAt={p.goPublicAt}/>
            {/* Share as Mini App */}
            {(() => {
              const [shared, setShared] = useState(false);
              const miniUrl = `https://mammothprotocol.com/mini/${p.mint||p.id}`;
              const handleShare = async () => {
                if (navigator.share) {
                  await navigator.share({ title:`${p.name} ($${p.ticker}) on Mammoth`, url: miniUrl });
                } else {
                  await navigator.clipboard.writeText(miniUrl);
                  setShared(true); setTimeout(()=>setShared(false), 2000);
                }
              };
              return (
                <button onClick={handleShare}
                  style={{ marginTop:8, width:'100%', padding:'9px 0', background: shared?'rgba(16,185,129,0.1)':'transparent', border:`1px solid ${shared?'rgba(16,185,129,0.3)':'rgba(139,92,246,0.25)'}`, borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:700, color:shared?'#10B981':'#A78BFA', cursor:'pointer', letterSpacing:'0.04em', transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {shared ? '✓ LINK COPIED' : '↗ SHARE MINI APP'}
                </button>
              );
            })()}

            {p._mine && onManageCycles && (
              <button onClick={onManageCycles} style={{ marginTop:8, width:'100%', padding:'9px 0', background:'transparent', border:'1px solid #252848', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-dim)', cursor:'pointer', fontWeight:500, letterSpacing:'0.04em', transition:'all 0.13s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#8B5CF6'; e.currentTarget.style.color='#22D3EE'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--badge-border)'; e.currentTarget.style.color='var(--text-dim)'; }}>
                MANAGE CYCLES →
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop:32, animation:'fadeUp 0.3s ease 0.1s both' }}>
          <div ref={tabsRef} style={{ display:'flex', gap:0, borderBottom:'1px solid #1d2540', marginBottom:20, overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {TABS.map((t, idx) => (
              <button key={t} ref={el => tabBtnRefs.current[idx] = el} onClick={() => handleTabClick(t, idx)} className="detail-tab-btn"
                style={{ background:'none', border:'none', cursor:'pointer', padding:'10px 16px', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500, letterSpacing:'0.04em', color:tab===t?'#22D3EE':'var(--text-muted)', borderBottom:`2px solid ${tab===t?'#8B5CF6':'transparent'}`, transition:'all 0.13s', whiteSpace:'nowrap', flexShrink:0, minHeight:44 }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {tab==='About' && (
            <div>
              <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.75, fontFamily:"'Space Grotesk',sans-serif", marginBottom:20 }}>{p.description}</p>

              {/* Social / project links */}
              {(() => {
                const linkDefs = [
                  { key:'website',   label:'Website',   color:'#22D3EE', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93V18c0-.552-.448-1-1-1H8c-1.105 0-2-.895-2-2v-1c0-1.105.895-2 2-2h1c.552 0 1-.448 1-1v-1c0-.552.448-1 1-1h.5c.276 0 .5-.224.5-.5V8c0-.276-.224-.5-.5-.5H10c-.552 0-1-.448-1-1V4.07A8.003 8.003 0 0 1 12 4c1.48 0 2.86.402 4.05 1.1L14 7c-.552 0-1 .448-1 1v1c0 .552.448 1 1 1h2c.552 0 1 .448 1 1v1c0 .552-.448 1-1 1h-1c-.552 0-1 .448-1 1v3.93A8.003 8.003 0 0 1 11 19.93z"/></svg> },
                  { key:'twitter',   label:'X',         color:'var(--text)', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { key:'telegram',  label:'Telegram',  color:'#29B6F6', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                  { key:'discord',   label:'Discord',   color:'#5865F2', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.036.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> },
                  { key:'github',    label:'GitHub',    color:'var(--text)', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                  { key:'farcaster', label:'Farcaster', color:'#855DCD', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24.24H5.76A5.76 5.76 0 0 0 0 6v12a5.76 5.76 0 0 0 5.76 5.76h12.48A5.76 5.76 0 0 0 24 18V6A5.76 5.76 0 0 0 18.24.24zm.816 17.166v.504h-2.208v-6.814l-2.256 5.23h-1.171l-2.25-5.23v6.814H8.96v-.504l.023-8.772H11.2l2.52 5.833 2.52-5.833h2.17l.024 8.35-.023.422z"/></svg> },
                  { key:'youtube',   label:'YouTube',   color:'#FF0000', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
                  { key:'docs',      label:'Docs',      color:'#A78BFA', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg> },
                ];
                const activeLinks = linkDefs.filter(l => p[l.key]);
                if (!activeLinks.length) return null;
                return (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                    {activeLinks.map(l => (
                      <a key={l.key} href={p[l.key]} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'6px 12px', textDecoration:'none', color:l.color, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600, transition:'all 0.13s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=l.color; e.currentTarget.style.background='rgba(139,92,246,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--panel-alt)'; }}>
                        <span style={{ display:'flex', alignItems:'center' }}>{l.icon}</span>
                        {l.label}
                      </a>
                    ))}
                  </div>
                );
              })()}

              <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['Creator',p.creator],['Launched',p.createdAt],['Supply mode',p.supplyMode],['Hard cap',p.hardCap?'Yes — final':'No']].map(([k,v],i) => (
                  <div key={i} style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'10px 12px' }}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:"'IBM Plex Mono',monospace", wordBreak:'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='Tokenomics' && (
            <div>
              <div style={{ marginBottom:20 }}>
                {[{label:'Public (cycles)',val:p.publicAlloc,color:'#22D3EE'},{label:'Treasury',val:p.treasuryAlloc,color:'#6D28D9'},{label:'Protocol (2%)',val:p.totalSupply*0.02,color:'var(--text-muted)'}].map((b,i) => (
                  <div key={i} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-secondary)' }}>{b.label}</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>{(b.val/1_000_000).toFixed(0)}M · {((b.val/p.totalSupply)*100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(b.val/p.totalSupply)*100}%`, background:b.color, borderRadius:3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='Cycles' && (
            <div>
              {p.cycleHistory.map(c => (
                <div key={c.id} className="cycles-history-card" style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:8, padding:'13px 14px', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)' }}>Cycle #{c.id}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:600, color:c.status==='COMPLETED'?'#22D3EE':c.status==='ACTIVE'?'#8B5CF6':'var(--text-muted)' }}>{c.status}</span>
                  </div>
                  <div className="cycles-history-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                    {[['Allocation',`${(c.allocation/1000).toFixed(0)}K`],['Raised',c.raised],['Price range',c.priceRange]].map(([k,v],i) => (
                      <div key={i}>
                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:3 }}>{k}</div>
                        <div style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==='Treasury' && (() => {
            const routing = p.cycleData?.treasuryRouting || {
              creator: (p.creatorBps ?? 0) / 100,
              reserve: (p.reserveBps ?? 0) / 100,
              sink: (p.sinkBps ?? 0) / 100,
            };
            return (
              <div>
                <div style={{ marginBottom:16, fontSize:13, color:'var(--text-dim)', fontFamily:"'IBM Plex Mono',monospace" }}>Proceeds routing — on-chain, deterministic</div>
                {[['Creator treasury',routing.creator+'%','#10B981'],['Reserve (SOL)',routing.reserve+'%','var(--text-dim)'],['Sink / burn',routing.sink+'%','var(--text-muted)'],['Protocol fee','2% (fixed)','#6D28D9']].map(([k,v,c],i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #1a2438' }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:c, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
