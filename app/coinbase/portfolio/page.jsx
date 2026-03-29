'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CoinbaseShell from '../CoinbaseShell';
import WalletModal from '../../../components/wallet/WalletModal';
import { useApp } from '../../../lib/AppContext';
import { getAllPositions } from '../../../views/ProjectDetail';

export default function CoinbasePortfolio() {
  const router = useRouter();
  const { walletState, setWalletState, projects } = useApp();
  const [showWallet, setShowWallet] = useState(false);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    try { setPortfolio(getAllPositions()); } catch {}
  }, [walletState.address]);

  const wallet = walletState.status === 'connected';

  const totalSpent   = portfolio.reduce((s,p) => s+p.totalSol, 0);
  const totalValue   = portfolio.reduce((s,pos) => {
    const lp = projects.find(p => String(p.mint||p.id)===String(pos.mintAddress));
    return s + (pos.totalTokens * (lp?.price || pos.avgPrice));
  }, 0);
  const totalPnl     = totalValue - totalSpent;
  const totalPnlPct  = totalSpent > 0 ? (totalPnl/totalSpent)*100 : 0;
  const pup          = totalPnl >= 0;
  const fmt          = n => n >= 1 ? n.toFixed(4) : n.toPrecision(3);

  if (!wallet) return (
    <CoinbaseShell onOpenModal={() => setShowWallet(true)}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'32px 20px', textAlign:'center', gap:16 }}>
        <div style={{ fontSize:40 }}>📊</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'var(--text)' }}>Your portfolio</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.7, maxWidth:280 }}>Connect your wallet to see your holdings, P&L, and new cycle alerts.</div>
        <button onClick={() => setShowWallet(true)}
          style={{ background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:8, padding:'12px 28px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor:'pointer', letterSpacing:'0.04em' }}>
          CONNECT WALLET
        </button>
      </div>
      {showWallet && <WalletModal onClose={()=>setShowWallet(false)} onConnected={s=>{setWalletState(s);setShowWallet(false);}}/>}
    </CoinbaseShell>
  );

  return (
    <CoinbaseShell onOpenModal={() => setShowWallet(true)}>
      <div style={{ padding:'14px 14px' }}>

        {/* Summary card */}
        {portfolio.length > 0 && (
          <div style={{ background:'var(--panel)', border:`1px solid ${pup?'rgba(16,185,129,0.25)':'rgba(244,63,94,0.25)'}`, borderRadius:12, padding:'16px', marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Total portfolio value</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:26, color:'#22D3EE', letterSpacing:'-0.02em' }}>{fmt(totalValue)} SOL</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Unrealized P&L</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:18, color:pup?'#10B981':'#F43F5E' }}>{pup?'+':''}{fmt(totalPnl)} SOL</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:pup?'#10B981':'#F43F5E' }}>{pup?'+':''}{totalPnlPct.toFixed(1)}%</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'Tokens held', value:`${portfolio.length}`, color:'var(--text)' },
                { label:'Total invested', value:`${fmt(totalSpent)} SOL`, color:'var(--text-secondary)' },
              ].map(({label,value,color})=>(
                <div key={label} style={{ background:'var(--panel-alt)', borderRadius:7, padding:'8px 10px' }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings list */}
        {portfolio.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🦣</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:6 }}>No holdings yet</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', marginBottom:20, lineHeight:1.6 }}>Tokens you buy on Mammoth appear here.</div>
            <button onClick={() => router.push('/coinbase')}
              style={{ background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:7, padding:'10px 22px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#fff', cursor:'pointer' }}>
              DISCOVER TOKENS →
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {portfolio.map(pos => {
              const lp = projects.find(p => String(p.mint||p.id)===String(pos.mintAddress));
              const curPrice = lp?.price || pos.avgPrice;
              const curVal   = pos.totalTokens * curPrice;
              const pnl      = curVal - pos.totalSol;
              const pnlPct   = pos.totalSol > 0 ? (pnl/pos.totalSol)*100 : 0;
              const up       = pnl >= 0;
              const hasNew   = lp && (lp.cycle||lp.cycleData?.id||0) > (pos.lastBuy?.cycleId||0);
              const newOpen  = hasNew && lp?.status === 'ACTIVE';

              return (
                <div key={pos.mintAddress}
                  onClick={() => lp && router.push(`/coinbase/token/${pos.mintAddress}`)}
                  style={{ background:'var(--panel)', border:`1px solid ${hasNew?'rgba(255,159,28,0.3)':'#1d2540'}`, borderRadius:10, padding:'13px 14px', cursor:lp?'pointer':'default', transition:'border-color 0.13s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)' }}>{pos.name||pos.ticker}</span>
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', background:'var(--badge-bg)', border:'1px solid #252848', borderRadius:3, padding:'1px 6px' }}>${pos.ticker}</span>
                        {newOpen && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#22D3EE', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:3, padding:'1px 6px' }}>🔔 OPEN</span>}
                        {hasNew && !newOpen && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#FF9F1C', background:'rgba(255,159,28,0.08)', border:'1px solid rgba(255,159,28,0.25)', borderRadius:3, padding:'1px 6px' }}>🔔 NEW CYCLE</span>}
                      </div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>
                        {pos.buyCount} buy{pos.buyCount>1?'s':''} · last {new Date(pos.lastBuy.ts).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:700, color:up?'#10B981':'#F43F5E' }}>{up?'+':''}{fmt(pnl)} SOL</div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:up?'#10B981':'#F43F5E' }}>{up?'+':''}{pnlPct.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                    {[
                      { label:'Holdings', value:`${pos.totalTokens.toLocaleString()}` },
                      { label:'Avg price', value:`${pos.avgPrice.toPrecision(3)} SOL` },
                      { label:'Current val', value:`${fmt(curVal)} SOL`, color:'#22D3EE' },
                    ].map(({label,value,color})=>(
                      <div key={label} style={{ background:'var(--panel-alt)', borderRadius:5, padding:'6px 8px' }}>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:color||'var(--text)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showWallet && <WalletModal onClose={()=>setShowWallet(false)} onConnected={s=>{setWalletState(s);setShowWallet(false);}}/>}
    </CoinbaseShell>
  );
}
