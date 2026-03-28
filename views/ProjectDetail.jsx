'use client';
import { useState, useRef } from 'react';
import { computeStepCurve, executeBuyTokens, executeExerciseRights } from '../lib/curves';
import { parseTransactionError } from '../lib/anchorClient';
import { useApp } from '../lib/AppContext';
import { useToast } from '../components/ui/Toast';
import TokenLogo, { getTokenPalette } from '../components/ui/TokenLogo';
import ThemeToggle from '../components/ui/ThemeToggle';
import WalletButton from '../components/wallet/WalletButton';
import PriceChart from '../components/charts/PriceChart';

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

function CurveTooltip({ curveType, stepSize, stepIncrement }) {
  const [open, setOpen] = useState(false);
  const def = CURVE_DEFS[curveType] || CURVE_DEFS['Step'];
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background:'none', border:`1px solid ${def.color}55`, borderRadius:4, padding:'2px 8px', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:def.color, cursor:'pointer', fontWeight:600, display:'inline-flex', alignItems:'center', gap:4 }}
      >
        {curveType} 🔥 <span style={{ fontSize:10, opacity:0.8 }}>ⓘ</span>
      </button>
      {open && <CurveModal curveType={curveType} stepSize={stepSize} stepIncrement={stepIncrement} onClose={() => setOpen(false)} />}
    </>
  );
}

function CyclePanelDetail({ cycle }) {
  const pct = Math.round((cycle.sold/cycle.allocation)*100);
  const launchPrice = cycle.launchPrice ?? cycle.currentPrice;
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
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{cycle.sold.toLocaleString()} / {cycle.allocation.toLocaleString()} sold</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>{pct}%</span>
        </div>
        <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:cycle.status==='ACTIVE'?'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)':'var(--bar-empty)', borderRadius:3 }}/>
        </div>
      </div>
      <div className="cycle-panel-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        {/* Curve — clickable tooltip */}
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Curve</div>
          <CurveTooltip curveType={cycle.curveType} stepSize={cycle.stepSize} stepIncrement={cycle.stepIncrement}/>
        </div>
        {/* Launch price */}
        <div style={{ background:'var(--panel-alt)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:6, padding:'9px 11px' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Launch price</div>
          <div style={{ fontSize:12, color:'#A78BFA', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{launchPrice.toFixed(5)} SOL</div>
        </div>
        {/* Current price */}
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Current price</div>
          <div style={{ fontSize:12, color:'#22D3EE', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{cycle.currentPrice.toFixed(5)} SOL</div>
        </div>
        {/* Remaining */}
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Remaining</div>
          <div style={{ fontSize:12, color:'var(--text)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{(cycle.allocation-cycle.sold).toLocaleString()}</div>
        </div>
        {cycle.nextStepPrice && (
          <div style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 11px' }}>
            <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Next step</div>
            <div style={{ fontSize:12, color:'var(--text)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{cycle.nextStepPrice.toFixed(5)} SOL</div>
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

function BuyPanel({ cycle, price, ticker, mintAddress, walletConnected, walletBalance, walletLoading, onConnect, onPurchaseComplete }) {
  const { connection, getWalletAdapter } = useApp();
  const toast = useToast();
  const [txState, setTxState] = useState('idle');
  const [sol, setSol] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const [slippage, setSlippage] = useState(5);
  const [showSlippage, setShowSlippage] = useState(false);
  // Dynamic presets — 5%, 10%, 25%, 50% of remaining cycle value in SOL
  // This scales correctly whether the cycle is worth 0.5 SOL or 500 SOL
  const remainingTokens = cycle.allocation - cycle.sold;
  const cycleRemainingSOL = remainingTokens * cycle.currentPrice;
  const PRESETS = [0.05, 0.10, 0.25, 0.50].map(pct => {
    const raw = cycleRemainingSOL * pct;
    // Round to 4 sig figs so it looks clean
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw)) - 1);
    return Math.max(0.0001, Math.round(raw / magnitude) * magnitude);
  });
  const solNum = parseFloat(sol) || 0;

  // Mock projects have a numeric id — must be declared first, used below
  const isMockProject = mintAddress && /^\d+$/.test(String(mintAddress));

  const quote = solNum > 0 ? computeStepCurve({ solIn:solNum, sold:cycle.sold, allocation:cycle.allocation, startPrice:cycle.currentPrice, stepSize:cycle.stepSize||5000, stepIncrement:cycle.stepIncrement||0.00022, feeBps:200 }) : null;
  const tokensOut = quote?.tokensOut ?? 0;
  const exceedsRights = walletConnected && cycle.userRights > 0 && tokensOut > (cycle.userRights - (cycle.userRightsUsed||0));
  const exceedsAllocation = quote ? quote.remainingAfter < 0 : false;
  // Skip slippage check on mock/demo projects — only enforce on real on-chain trades
  const priceImpactPct = quote ? ((quote.effectivePrice - cycle.currentPrice) / cycle.currentPrice * 100) : 0;
  const slippageOk = isMockProject ? true : (quote ? priceImpactPct <= slippage : true);
  const hasError = exceedsRights || exceedsAllocation || (!slippageOk && solNum > 0);

  const validationMsg = exceedsRights ? `Exceeds your rights allocation (${(cycle.userRights||0).toLocaleString()} tokens)`
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
        toast.success(`Bought ${tokensOut.toLocaleString()} ${ticker}!`);
        onPurchaseComplete?.(result, quote);
      } else {
        // Fallback mock for demo/devnet projects
        await new Promise(r => setTimeout(r, 900)); // simulate latency
        const mockSig = 'MOCK' + Math.random().toString(36).slice(2, 10).toUpperCase();
        const result = { tokensOut, solIn: solNum, fee: solNum * 0.02, signature: mockSig, mock: true };
        setReceipt(result);
        setTxState('success');
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

  if (cycle.status !== 'ACTIVE') {
    // TASK-013: Jupiter secondary trading panel — shown when cycle is Closed or Between
    const jupiterUrl = `https://jup.ag/swap/SOL-${mintAddress || 'So11111111111111111111111111111111111111112'}`;
    return (
      <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, padding:'20px 18px' }}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>Cycle ended</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Trade on secondary market</div>
        </div>
        <a
          href={jupiterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display:'block', textDecoration:'none' }}
        >
          <button style={{
            width:'100%',
            padding:'14px 0',
            background:'#FF9F1C',
            color:'#000',
            border:'none',
            borderRadius:7,
            fontFamily:"'IBM Plex Mono',monospace",
            fontSize:14,
            fontWeight:700,
            cursor:'pointer',
            letterSpacing:'0.04em',
            transition:'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Trade ${ticker} on Jupiter →
          </button>
        </a>
        <div style={{ marginTop:10, fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", textAlign:'center', lineHeight:1.5 }}>
          2% fee on trades routed via Mammoth interface
        </div>
        <div style={{ marginTop:10, background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 12px', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>No active cycle · trade freely on secondary</span>
        </div>
      </div>
    );
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
      <button onClick={handleReset} style={{ width:'100%', padding:'11px 0', borderRadius:7, border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.08)', color:'#10B981', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, cursor:'pointer', letterSpacing:'0.04em' }}>BUY MORE</button>
    </div>
  );

  return (
    <div style={{ background:'var(--panel)', border:`1px solid ${txState==='error'?'rgba(248,113,113,0.3)':'var(--border)'}`, borderRadius:10, padding:'18px 16px', transition:'border-color 0.2s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:walletConnected?8:14 }}>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>Buy ${ticker}</span>
        <button onClick={() => setShowSlippage(s => !s)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)' }}>⚙ {slippage}% slip</button>
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
          const solStr = v < 0.01 ? v.toFixed(4) : v < 0.1 ? v.toFixed(3) : v.toFixed(2);
          const active = sol === String(v);
          return (
            <button key={i} onClick={() => !isProcessing && setSol(String(v))}
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
            <div style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:10, padding:'12px 8px 8px', marginBottom:12 }}>
              <PriceChart data={p.chartData} cycleStart={Math.floor(p.chartData.length*0.62)}/>
            </div>
            <div className="desktop-only"><CyclePanelDetail cycle={{ ...p.cycleData, launchPrice: p.chartData?.[0]?.p }}/></div>
          </div>

          <div style={{ position:'sticky', top:68 }}>
            <div className="mobile-only" style={{ marginBottom:12 }}><CyclePanelDetail cycle={{ ...p.cycleData, launchPrice: p.chartData?.[0]?.p }}/></div>
            <BuyPanel cycle={p.cycleData} price={p.price} ticker={p.ticker} mintAddress={p.mint || p.id} walletConnected={wallet} walletBalance={walletState?.balance} walletLoading={walletState?.status === 'connecting'} onConnect={onConnect} onPurchaseComplete={(r,q) => onPurchase?.(r,q)}/>
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
                <div key={c.id} style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:8, padding:'13px 14px', marginBottom:8 }}>
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

          {tab==='Treasury' && (
            <div>
              <div style={{ marginBottom:16, fontSize:13, color:'var(--text-dim)', fontFamily:"'IBM Plex Mono',monospace" }}>Proceeds routing — on-chain, deterministic</div>
              {[['Creator treasury',p.cycleData.treasuryRouting.creator+'%','#10B981'],['Reserve (SOL)',p.cycleData.treasuryRouting.reserve+'%','var(--text-dim)'],['Sink / burn',p.cycleData.treasuryRouting.sink+'%','var(--text-muted)'],['Protocol fee','2% (fixed)','#6D28D9']].map(([k,v,c],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #1a2438' }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:c, fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
