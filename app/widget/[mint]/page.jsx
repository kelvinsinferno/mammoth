'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MOCK_PROJECTS } from '../../../lib/data';
import { computeStepCurve } from '../../../lib/curves';
import { useApp } from '../../../lib/AppContext';
import WalletModal from '../../../components/wallet/WalletModal';
import PriceChart from '../../../components/charts/PriceChart';

// Minimal self-contained buy widget — designed for iframe embedding
// URL params: theme=dark|light, accent=#hex, size=compact|full

function getAccent(param) {
  if (!param) return '#8B5CF6';
  return param.startsWith('%23') ? '#' + param.slice(3) : param.startsWith('#') ? param : '#' + param;
}

export default function WidgetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mint = params?.mint;
  const theme = searchParams?.get('theme') || 'dark';
  const accentRaw = searchParams?.get('accent') || '';
  const accent = getAccent(accentRaw) || '#8B5CF6';
  const size = searchParams?.get('size') || 'full';

  const { walletState, setWalletState, connection, getWalletAdapter } = useApp();
  const [project, setProject] = useState(null);
  const [sol, setSol] = useState('');
  const [txState, setTxState] = useState('idle');
  const [receipt, setReceipt] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const isDark = theme !== 'light';
  const bg      = isDark ? '#0d1117' : '#ffffff';
  const panel   = isDark ? '#161b22' : '#f6f8fa';
  const border  = isDark ? '#30363d' : '#d0d7de';
  const text    = isDark ? '#e6edf3' : '#1f2328';
  const muted   = isDark ? '#7d8590' : '#656d76';
  const panelAlt= isDark ? '#1c2128' : '#eaeef2';

  useEffect(() => {
    // Try to find by mint address or id
    const found = MOCK_PROJECTS.find(p => String(p.mint || p.id) === String(mint));
    if (found) { setProject(found); return; }
    // In production this would fetch from on-chain / API
    setProject(null);
  }, [mint]);

  const wallet = walletState.status === 'connected';
  const isProcessing = txState === 'awaiting' || txState === 'loading';

  const solNum = parseFloat(sol) || 0;
  const cycle = project?.cycleData;

  // Quote calculation
  const quote = (() => {
    if (!cycle || solNum <= 0) return null;
    if (cycle.curveType === 'Step') {
      return computeStepCurve({ solIn: solNum, sold: cycle.sold, allocation: cycle.allocation, startPrice: cycle.basePrice || cycle.currentPrice, stepSize: cycle.stepSize || 5000, stepIncrement: cycle.stepIncrement || 0.00022 });
    }
    const fee = solNum * 0.02;
    const net = solNum - fee;
    const tokensOut = Math.floor(net / (cycle.currentPrice || 0.001));
    return { tokensOut, fee, effectivePrice: cycle.currentPrice };
  })();

  const tokensOut = quote?.tokensOut || 0;

  const handleBuy = async () => {
    if (!wallet) { setShowWallet(true); return; }
    if (solNum <= 0) return;
    setTxState('loading');
    setErrMsg('');
    try {
      await new Promise(r => setTimeout(r, 1000));
      const sig = 'MOCK' + Math.random().toString(36).slice(2, 10).toUpperCase();
      setReceipt({ tokensOut, solIn: solNum, sig, mock: true });
      setTxState('success');
    } catch(e) {
      setErrMsg(e.message || 'Transaction failed');
      setTxState('error');
    }
  };

  if (!project) return (
    <div style={{ minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', color:muted, fontSize:12 }}>
      Token not found: {mint}
    </div>
  );

  const pct = cycle ? Math.round((cycle.sold / cycle.allocation) * 100) : 0;
  const remaining = cycle ? (cycle.allocation - cycle.sold).toLocaleString() : '—';

  return (
    <div style={{ minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', padding:0, fontFamily:"'IBM Plex Mono', monospace" }}>
      <div style={{ width:'100%', maxWidth: size === 'compact' ? 320 : 400, background:panel, border:`1px solid ${border}`, borderRadius:12, overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:10 }}>
          {project.image && <img src={project.image} alt="" width={28} height={28} style={{ borderRadius:6, objectFit:'cover', flexShrink:0 }} onError={e=>e.currentTarget.style.display='none'}/>}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{project.name}</div>
            <div style={{ fontSize:10, color:muted }}>${project.ticker} · {project.cycleData?.status === 'ACTIVE' ? <span style={{ color:'#22D3EE' }}>● OPEN</span> : 'BETWEEN CYCLES'}</div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:16, color:accent }}>{project.price?.toFixed(5)}</div>
            <div style={{ fontSize:9, color:muted }}>SOL</div>
          </div>
        </div>

        {/* Price chart */}
        {size !== 'compact' && project.chartData?.length > 0 && (
          <div style={{ padding:'8px 8px 4px', borderBottom:`1px solid ${border}` }}>
            <PriceChart data={project.chartData} cycleStart={Math.floor(project.chartData.length * 0.62)} />
          </div>
        )}

        {/* Cycle progress */}
        {size !== 'compact' && cycle && (
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:10, color:muted }}>Cycle #{cycle.id} · {remaining} remaining</span>
              <span style={{ fontSize:10, fontWeight:700, color:accent }}>{pct}%</span>
            </div>
            <div style={{ height:5, background:panelAlt, borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${accent}99,${accent})`, borderRadius:3, transition:'width 0.4s' }}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginTop:10 }}>
              {[
                { label:'Curve', value: cycle.curveType },
                { label:'Launch price', value:`${(cycle.basePrice||cycle.currentPrice)?.toFixed(5)} SOL` },
                { label:'Current price', value:`${cycle.currentPrice?.toFixed(5)} SOL` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background:panelAlt, borderRadius:5, padding:'7px 8px' }}>
                  <div style={{ fontSize:8, color:muted, marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:text }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buy form */}
        <div style={{ padding:'14px 16px' }}>
          {txState === 'success' && receipt ? (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <div style={{ fontSize:20, marginBottom:8 }}>✅</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'#10B981', marginBottom:4 }}>Purchase confirmed!</div>
              <div style={{ background:panelAlt, border:`1px solid ${border}`, borderRadius:7, padding:'10px 12px', marginBottom:12, fontSize:10 }}>
                {[['Tokens received',`${receipt.tokensOut.toLocaleString()} ${project.ticker}`],['SOL spent',`${receipt.solIn} SOL`],['Fee (2%)',`${(receipt.solIn*0.02).toFixed(4)} SOL`]].map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', color:muted }}>
                    <span>{l}</span><span style={{ color:text, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
                {receipt.mock && <div style={{ color:muted, fontSize:9, marginTop:6, textAlign:'center' }}>demo — connect wallet for real trades</div>}
              </div>
              <button onClick={() => { setTxState('idle'); setSol(''); setReceipt(null); }}
                style={{ width:'100%', padding:'10px 0', background:panelAlt, border:`1px solid ${border}`, borderRadius:7, fontSize:12, color:muted, cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace" }}>
                BUY MORE
              </button>
            </div>
          ) : (
            <>
              {/* Quick buy presets */}
              {(() => {
                const total = cycle?.allocation || 0;
                const remaining = cycle ? (cycle.allocation - cycle.sold) : 0;
                const currentPrice = cycle?.currentPrice || project.price || 0.001;
                const cycleValue = remaining * currentPrice;
                const presets = [0.05, 0.10, 0.25, 0.50].map(pct => {
                  const raw = cycleValue * pct;
                  const decimals = raw < 0.01 ? Math.max(2, Math.ceil(-Math.log10(raw)) + 1) : 2;
                  return parseFloat(raw.toFixed(decimals));
                });
                const labels = ['5%','10%','25%','50%'];
                return (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginBottom:10 }}>
                    {presets.map((v, i) => {
                      const active = sol === String(v);
                      return (
                        <button key={i} onClick={() => setSol(String(v))} disabled={isProcessing}
                          style={{ background: active ? `${accent}22` : panelAlt, border:`1px solid ${active ? accent : border}`, borderRadius:5, padding:'5px 0', fontFamily:"'IBM Plex Mono',monospace", cursor:'pointer', opacity:isProcessing?0.5:1, minHeight:38, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1, transition:'all 0.12s' }}>
                          <span style={{ fontSize:10, color: active ? accent : muted, fontWeight:700 }}>{labels[i]}</span>
                          <span style={{ fontSize:8, color: active ? accent : muted, opacity:0.8 }}>{v} SOL</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div style={{ position:'relative', marginBottom:10 }}>
                <input type="number" value={sol} onChange={e => setSol(e.target.value)} placeholder="0.00" disabled={isProcessing}
                  style={{ width:'100%', background:panelAlt, border:`1px solid ${border}`, borderRadius:7, padding:'11px 46px 11px 12px', color:text, fontSize:15, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:44 }}
                  onFocus={e => e.currentTarget.style.borderColor=accent}
                  onBlur={e => e.currentTarget.style.borderColor=border}/>
                <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:12, color:muted, fontWeight:600 }}>SOL</span>
              </div>

              {quote && solNum > 0 && (
                <div style={{ background:panelAlt, border:`1px solid ${border}`, borderRadius:6, padding:'9px 12px', marginBottom:10, fontSize:10 }}>
                  {[['You receive',`~${tokensOut.toLocaleString()} ${project.ticker}`, accent],['Fee (2%)',`${quote.fee?.toFixed(4)} SOL`, muted]].map(([l,v,c])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'2px 0' }}>
                      <span style={{ color:muted }}>{l}</span><span style={{ color:c, fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {errMsg && <div style={{ color:'#F43F5E', fontSize:10, marginBottom:8 }}>⚠ {errMsg}</div>}

              <button onClick={handleBuy} disabled={isProcessing || (solNum <= 0 && wallet)}
                style={{ width:'100%', padding:'12px 0', background: wallet ? accent : panelAlt, border:`1px solid ${wallet ? accent : border}`, borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color: wallet ? '#fff' : text, cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: (isProcessing || (!wallet && false)) ? 0.7 : 1, letterSpacing:'0.04em', transition:'all 0.15s' }}>
                {isProcessing ? 'PROCESSING...' : wallet ? (solNum > 0 ? `BUY ${tokensOut.toLocaleString()} ${project.ticker}` : 'ENTER AMOUNT') : 'CONNECT WALLET'}
              </button>

              {wallet && (
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                  <span style={{ fontSize:9, color:muted }}>Connected: {walletState.short}</span>
                  <a href={`https://mammoth-protocol.vercel.app/token/${project.mint||project.id}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:9, color:accent, textDecoration:'none' }}>View on Mammoth ↗</a>
                </div>
              )}
              {!wallet && (
                <div style={{ textAlign:'center', marginTop:8 }}>
                  <a href={`https://mammoth-protocol.vercel.app/token/${project.mint||project.id}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:9, color:muted, textDecoration:'none' }}>View full page on Mammoth ↗</a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Powered by footer */}
        <div style={{ padding:'8px 16px', borderTop:`1px solid ${border}`, display:'flex', justifyContent:'center', alignItems:'center', gap:5 }}>
          <a href="https://mammoth-protocol.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:5, textDecoration:'none', opacity:0.6 }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:muted }}>Powered by</span>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:9, background:`linear-gradient(90deg,${accent},#22D3EE)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Mammoth Protocol</span>
          </a>
        </div>
      </div>

      {showWallet && (
        <WalletModal
          onClose={() => setShowWallet(false)}
          onConnected={s => { setWalletState(s); setShowWallet(false); }}
        />
      )}
    </div>
  );
}
