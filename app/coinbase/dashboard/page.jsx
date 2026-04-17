'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CoinbaseShell from '../CoinbaseShell';
import WalletModal from '../../../components/wallet/WalletModal';
import { useApp } from '../../../lib/AppContext';

const BASE = 'https://mammothprotocol.com';

export default function CoinbaseDashboard() {
  const router = useRouter();
  const { walletState, setWalletState, myProjects, handleLaunchToken, theme } = useApp();
  const [showWallet, setShowWallet] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(null);

  const wallet = walletState.status === 'connected';

  const copyLink = (text, key) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  };

  if (!wallet) return (
    <CoinbaseShell onOpenModal={() => setShowWallet(true)}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'32px 20px', textAlign:'center', gap:16 }}>
        <div style={{ fontSize:40 }}>⚡</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'var(--text)' }}>Creator Dashboard</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.7, maxWidth:280 }}>Connect your wallet to manage your tokens, open cycles, and share your project.</div>
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

        {/* Wallet summary */}
        <div style={{ background:'var(--panel)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:10, padding:'13px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Connected</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#A78BFA' }}>{walletState.short}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:3 }}>Balance</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14, color:'#22D3EE' }}>{walletState.balance ?? 0} SOL</div>
          </div>
        </div>

        {/* Launch CTA */}
        <button onClick={() => router.push('/')}
          style={{ width:'100%', padding:'13px 0', background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(34,211,238,0.08))', border:'1px solid rgba(139,92,246,0.35)', borderRadius:9, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#A78BFA', cursor:'pointer', letterSpacing:'0.04em', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          🚀 LAUNCH NEW TOKEN
        </button>

        {/* Token list */}
        {myProjects.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🦣</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:6 }}>No tokens yet</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>Launch your first token to start managing cycles.</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {myProjects.map(p => {
              const open = expandedId === p.id;
              const mint = p.mint || p.id;
              const miniUrl = `${BASE}/mini/${mint}`;
              const cycleOpen = p.cycleData?.status === 'ACTIVE';

              return (
                <div key={p.id} style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:10, overflow:'hidden' }}>
                  {/* Token header row */}
                  <div onClick={() => setExpandedId(open?null:p.id)}
                    style={{ padding:'13px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:3 }}>
                        {p.name} <span style={{ fontSize:11, color:'var(--text-dim)' }}>/ ${p.ticker}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        {p.cycleData ? (
                          <>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>Cycle #{p.cycleData.id}</span>
                            {cycleOpen
                              ? <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#22D3EE', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:3, padding:'1px 6px' }}>● OPEN</span>
                              : <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)' }}>BETWEEN</span>
                            }
                          </>
                        ) : (
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>No active cycle</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color:'#22D3EE' }}>{p.price?.toFixed(5)} SOL</div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: p.change>=0?'#22D3EE':'#F43F5E' }}>{p.change>=0?'▲':'▼'} {Math.abs(p.change).toFixed(1)}%</div>
                      </div>
                      <span style={{ color:'var(--text-muted)', fontSize:12, transition:'transform 0.18s', transform:open?'rotate(180deg)':'none' }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded */}
                  {open && (
                    <div style={{ padding:'0 14px 14px', borderTop:'1px solid #1d2540', animation:'fadeUp 0.15s ease' }}>
                      {/* Stats */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginTop:12, marginBottom:12 }}>
                        {[
                          { k:'24h volume',  v:`${p.volume} SOL`,  c:'var(--text-dim)' },
                          { k:'Total raised', v:p.raised,          c:'var(--text-dim)' },
                          p.cycleData && p.cycleData.allocation
                            ? { k:'Cycle sold', v:`${Math.round((p.cycleData.sold/p.cycleData.allocation)*100)}%`, c:'#A78BFA' }
                            : { k:'Cycle sold', v:'—', c:'var(--text-muted)' },
                          { k:'Current price', v:`${p.price?.toFixed(5)} SOL`, c:'#22D3EE' },
                        ].map(({ k,v,c }) => (
                          <div key={k} style={{ background:'var(--panel)', border:'1px solid #1a2438', borderRadius:6, padding:'8px 10px' }}>
                            <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:2 }}>{k}</div>
                            <div style={{ fontSize:11, color:c, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      {p.cycleData && p.cycleData.allocation > 0 && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>{p.cycleData.sold?.toLocaleString()} / {p.cycleData.allocation?.toLocaleString()} sold</span>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#22D3EE' }}>{Math.round((p.cycleData.sold/p.cycleData.allocation)*100)}%</span>
                          </div>
                          <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${Math.round((p.cycleData.sold/p.cycleData.allocation)*100)}%`, background:'linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)', borderRadius:2 }}/>
                          </div>
                        </div>
                      )}

                      {/* Share links */}
                      <div style={{ background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.15)', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#A78BFA', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Share links</div>
                        {[
                          { label:'Mini App', url: miniUrl },
                          { label:'Widget URL', url: `${BASE}/widget/${mint}` },
                        ].map(({ label, url }) => (
                          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>{label}</span>
                            <div style={{ display:'flex', gap:6 }}>
                              <button onClick={() => copyLink(url, label)}
                                style={{ background: copied===label?'rgba(16,185,129,0.12)':'var(--panel-alt)', border:`1px solid ${copied===label?'rgba(16,185,129,0.3)':'var(--border)'}`, borderRadius:4, padding:'2px 9px', fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:copied===label?'#10B981':'var(--text-muted)', cursor:'pointer' }}>
                                {copied===label?'✓':'COPY'}
                              </button>
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 9px', fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#A78BFA', textDecoration:'none' }}>
                                OPEN ↗
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display:'flex', gap:7 }}>
                        <button onClick={() => router.push(`/coinbase/token/${mint}`)}
                          style={{ flex:1, padding:'9px 0', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color:'#22D3EE', cursor:'pointer' }}>
                          VIEW PAGE →
                        </button>
                        <button onClick={() => router.push('/')}
                          style={{ flex:1, padding:'9px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color:'var(--text-dim)', cursor:'pointer' }}>
                          MANAGE CYCLES
                        </button>
                      </div>
                    </div>
                  )}
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
