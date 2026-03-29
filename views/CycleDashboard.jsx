'use client';
import { useState, useEffect } from 'react';
import { getAllPositions } from './ProjectDetail';
import { fmtTokens } from '../lib/utils';
import { closeCycleOnChain } from '../lib/curves';
import { parseTransactionError, activateCycle } from '../lib/anchorClient';
import { useApp } from '../lib/AppContext';
import { useToast } from '../components/ui/Toast';
import { SkeletonList } from '../components/ui/Skeleton';

function CycleManagerModal({ cycle, project, onClose, onLaunchCycle, onTerminate }) {
  const { connection, getWalletAdapter } = useApp();
  const toast = useToast();
  const [action, setAction] = useState(null);
  const [params, setParams] = useState({ cycleAllocation:cycle.allocation, stepSize:cycle.stepSize||5000 });
  const [submitting, setSubmitting] = useState(false);

  const handleLaunch = async () => {
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      onLaunchCycle?.({ ...cycle, id:cycle.id+1, allocation:params.cycleAllocation, stepSize:params.stepSize });
      onClose();
    } catch(e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    setSubmitting(true);
    try {
      const walletAdapter = getWalletAdapter();
      const mintAddress = project?.mint || project?.id;
      const isRealMint = mintAddress && mintAddress.length >= 32 && !mintAddress.includes('...');

      if (walletAdapter && isRealMint) {
        const { getProgram } = await import('../lib/anchorClient');
        const program = getProgram(walletAdapter, connection);
        await activateCycle(program, mintAddress, cycle.id);
        toast.success('Cycle activated — public buying is now open!');
      } else {
        await new Promise(r => setTimeout(r, 800));
        toast.success('Cycle activated (demo)');
      }
      onClose();
    } catch(e) {
      const userMsg = parseTransactionError(e);
      if (userMsg === null) { setSubmitting(false); return; }
      toast.error(userMsg || 'Failed to activate cycle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminate = async () => {
    if (!confirm('Terminate cycle? This cannot be undone.')) return;
    setSubmitting(true);
    try {
      const walletAdapter = getWalletAdapter();
      const mintAddress = project?.mint || project?.id;
      const isRealMint = mintAddress && mintAddress.length >= 32 && !mintAddress.includes('...');

      if (walletAdapter && isRealMint) {
        await closeCycleOnChain({ connection, walletAdapter, mintAddress });
        toast.success('Cycle ended on-chain');
      } else {
        await new Promise(r => setTimeout(r, 800));
      }
      onTerminate?.();
      onClose();
    } catch(e) {
      const userMsg = parseTransactionError(e);
      if (userMsg === null) { setSubmitting(false); return; }
      toast.error(userMsg || 'Failed to end cycle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="cycle-manager-overlay" style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} className="cycle-manager-card" style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:400, padding:'22px 20px', animation:'slideUp 0.18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'var(--text)' }}>{action?'Settings':'Manage cycle'}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>{project.name} · Cycle #{cycle.id}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16, lineHeight:1 }}>✕</button>
        </div>

        {!action ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8, animation:'fadeUp 0.15s ease' }}>

            {/* RIGHTS_WINDOW status — show countdown + activate button */}
            {(cycle.status==='RIGHTS_WINDOW' || cycle.status==='rightsWindow') && (() => {
              const now = Math.floor(Date.now() / 1000);
              const expired = cycle.rightsWindowEnd && now >= cycle.rightsWindowEnd;
              const remaining = cycle.rightsWindowEnd ? Math.max(0, cycle.rightsWindowEnd - now) : null;
              const hrs = remaining !== null ? Math.floor(remaining / 3600) : null;
              const mins = remaining !== null ? Math.floor((remaining % 3600) / 60) : null;
              return (
                <>
                  <div style={{ background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:8, padding:'12px 14px' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600, marginBottom:4 }}>
                      🛡️ Rights Window {expired ? 'EXPIRED' : 'ACTIVE'}
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', lineHeight:1.6 }}>
                      {expired
                        ? 'Rights window has ended. You can now activate the cycle to open public buying.'
                        : remaining !== null
                          ? `Holders can exercise rights for ${hrs}h ${mins}m. Activate after window closes.`
                          : 'Existing holders may exercise their pro-rata rights at launch price.'}
                    </div>
                  </div>
                  {expired && (
                    <button
                      onClick={handleActivate}
                      disabled={submitting}
                      style={{ display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.12))', border:'1px solid rgba(34,211,238,0.35)', borderRadius:8, padding:'12px 14px', cursor:submitting?'not-allowed':'pointer', transition:'all 0.12s', width:'100%', minHeight:52, opacity:submitting?0.6:1 }}
                      onMouseEnter={e => { if(!submitting) e.currentTarget.style.borderColor='#22D3EE'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(34,211,238,0.35)'; }}>
                      {submitting
                        ? <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid #1a2438', borderTopColor:'#22D3EE', animation:'spin 0.7s linear infinite' }}/>
                        : <span style={{ fontSize:16, lineHeight:1 }}>⚡</span>
                      }
                      <div style={{ textAlign:'left' }}>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#22D3EE', fontWeight:700 }}>
                          {submitting ? 'Activating...' : 'Activate cycle'}
                        </div>
                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>
                          Open public buying — rights window is closed
                        </div>
                      </div>
                    </button>
                  )}
                </>
              );
            })()}

            {cycle.status==='ACTIVE' && (
              <>
                <button onClick={() => setAction('launch')}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(139,92,246,0.13)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%', minHeight:52 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#8B5CF6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.28)'}>
                  <span style={{ fontSize:16, lineHeight:1 }}>🚀</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>Launch next cycle</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>Continue issuance with new params</div>
                  </div>
                </button>
                <button onClick={() => setAction('terminate')}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%', minHeight:52 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(248,113,113,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(248,113,113,0.2)'}>
                  <span style={{ fontSize:16, lineHeight:1 }}>⏹</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>End cycle early</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>Lock supply; skip to secondary</div>
                  </div>
                </button>
              </>
            )}
            {cycle.status==='COMPLETED' && (
              <button onClick={() => setAction('launch')}
                style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(139,92,246,0.13)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%' }}>
                <span style={{ fontSize:16, lineHeight:1 }}>🚀</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>Launch next cycle</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>Begin cycle #{cycle.id+1}</div>
                </div>
              </button>
            )}
          </div>
        ) : action === 'launch' ? (
          <div style={{ animation:'fadeUp 0.15s ease' }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Cycle allocation</label>
              <input type="number" value={params.cycleAllocation} onChange={e => setParams(p => ({ ...p, cycleAllocation:parseInt(e.target.value) }))} min={1}
                style={{ width:'100%', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none' }}
                onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:3 }}>{fmtTokens(params.cycleAllocation)} tokens</div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Step size (for stepwise curves)</label>
              <input type="number" value={params.stepSize} onChange={e => setParams(p => ({ ...p, stepSize:parseInt(e.target.value) }))} min={100}
                style={{ width:'100%', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none' }}
                onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setAction(null)} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'var(--text-dim)', cursor:'pointer', opacity:submitting?0.5:1 }}>CANCEL</button>
              <button onClick={handleLaunch} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'#8B5CF6', border:'none', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#fff', cursor:'pointer', opacity:submitting?0.5:1 }}>CONFIRM</button>
            </div>
          </div>
        ) : action === 'terminate' ? (
          <div style={{ animation:'fadeUp 0.15s ease' }}>
            <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'12px', marginBottom:16 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#F43F5E', fontWeight:600, marginBottom:4 }}>⚠ Terminate cycle?</div>
              <div style={{ fontSize:11, color:'rgba(248,113,113,0.8)', fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.6 }}>
                Cycle will end immediately. No more tokens issued. Holders move to secondary market. This cannot be reversed.
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setAction(null)} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'var(--text-dim)', cursor:'pointer', opacity:submitting?0.5:1 }}>CANCEL</button>
              <button onClick={handleTerminate} disabled={submitting}
                style={{ flex:1, padding:'10px 0', background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.4)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#F43F5E', cursor:'pointer', opacity:submitting?0.5:1 }}>TERMINATE</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CycleDashboard({ myProjects, onClose, onLaunchCycle, onTerminateProject, theme, loading, onLaunchNew, onResumeDraft }) {
  const [expandedId, setExpandedId] = useState(null);
  const [manageModal, setManageModal] = useState(null);
  const [activeTab, setActiveTab] = useState('tokens'); // 'tokens' | 'drafts' | 'portfolio'
  const [drafts, setDrafts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Load drafts from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('mammoth_drafts') || '[]');
      setDrafts(saved);
    } catch {}
    try {
      setPortfolio(getAllPositions());
    } catch {}
    // Tick every 30s to update countdowns
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const deleteDraft = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('mammoth_drafts', JSON.stringify(updated));
  };

  // Loading state
  if (loading) return (
    <div onClick={onClose} className="cycle-dash-overlay" style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} className="cycle-dash-card" style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:600, padding:'24px 20px', animation:'slideUp 0.18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Your tokens</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1 }}>✕</button>
        </div>
        <SkeletonList count={3} />
      </div>
    </div>
  );

  // Empty state — no tokens launched
  if (myProjects.length === 0) return (
    <div onClick={onClose} className="cycle-dash-overlay" style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} className="cycle-dash-card" style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, padding:'40px 28px', textAlign:'center', maxWidth:400, width:'100%', animation:'slideUp 0.18s ease' }}>
        <div style={{ fontSize:36, marginBottom:14 }}>📭</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:8 }}>You haven&apos;t launched a token yet.</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:24, lineHeight:1.6 }}>Create your first token to start managing cycles and raising capital.</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          {onLaunchNew && (
            <button onClick={() => { onClose(); onLaunchNew(); }}
              style={{ background:'#FF9F1C', border:'none', borderRadius:6, padding:'10px 18px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#000', cursor:'pointer', letterSpacing:'0.04em' }}>
              LAUNCH YOUR FIRST TOKEN →
            </button>
          )}
          <button onClick={onClose}
            style={{ background:'transparent', border:'1px solid #252848', borderRadius:6, padding:'10px 18px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'var(--text-dim)', cursor:'pointer', letterSpacing:'0.04em' }}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div onClick={onClose} className="cycle-dash-overlay" style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease', overflow:'auto' }}>
      <div onClick={e => e.stopPropagation()} className="cycle-dash-card" style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:600, padding:'24px 20px', animation:'slideUp 0.18s ease', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Creator Dashboard</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:2, background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:7, padding:3, marginBottom:16 }}>
          {[['tokens', `🪙 Tokens (${myProjects.length})`], ['portfolio', `📊 Portfolio${portfolio.length > 0 ? ` (${portfolio.length})` : ''}`], ['drafts', `📝 Drafts${drafts.length > 0 ? ` (${drafts.length})` : ''}`]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ flex:1, background:activeTab===key?'#8B5CF6':'none', border:'none', cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:600, padding:'7px 10px', borderRadius:5, color:activeTab===key?'#fff':'var(--text-dim)', transition:'all 0.12s', minHeight:36 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tokens tab */}
        {activeTab === 'tokens' && <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {myProjects.map(p => (
            <div key={p.id} className="token-row-card" style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:10, padding:'14px', cursor:'pointer', transition:'all 0.12s', animation:'fadeUp 0.2s ease both', animationDelay:`${myProjects.indexOf(p)*0.05}s` }}
              onClick={() => setExpandedId(expandedId===p.id?null:p.id)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:3 }}>{p.name} <span style={{ fontSize:11, color:'var(--text-dim)' }}>/ ${p.ticker}</span></div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>
                      Cycle #{p.cycleData.id} · {fmtTokens(p.cycleData.sold)} / {fmtTokens(p.cycleData.allocation)} sold
                    </span>
                    {(p.cycleData.status==='RIGHTS_WINDOW'||p.cycleData.status==='rightsWindow') && (() => {
                      const expired = p.cycleData.rightsWindowEnd && Math.floor(Date.now()/1000) >= p.cycleData.rightsWindowEnd;
                      return (
                        <span style={{ fontSize:9, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, padding:'2px 6px', borderRadius:3, background: expired ? 'rgba(255,159,28,0.15)' : 'rgba(34,211,238,0.1)', color: expired ? '#FF9F1C' : '#22D3EE', border: expired ? '1px solid rgba(255,159,28,0.3)' : '1px solid rgba(34,211,238,0.25)' }}>
                          {expired ? '⚡ READY TO ACTIVATE' : '🛡 RIGHTS WINDOW'}
                        </span>
                      );
                    })()}
                    {p.cycleData.status==='ACTIVE' && <span style={{ fontSize:9, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, padding:'2px 6px', borderRadius:3, background:'rgba(139,92,246,0.13)', color:'#22D3EE', border:'1px solid rgba(139,92,246,0.28)' }}>● OPEN</span>}
                  </div>
                </div>
                <span style={{ fontSize:14, opacity:expandedId===p.id?0.6:1 }}>{expandedId===p.id?'▼':'▶'}</span>
              </div>

              {expandedId === p.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #1a2438', animation:'slideDown 0.15s ease' }}>
                  {/* No active cycle state */}
                  {(!p.cycleData || p.cycleData.status !== 'ACTIVE') && (
                    <div style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:7, padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                      <div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', fontWeight:600 }}>No active cycle</div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Open a new cycle to start raising.</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setManageModal(p); }}
                        style={{ background:'#FF9F1C', border:'none', borderRadius:5, padding:'6px 14px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color:'#000', cursor:'pointer', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                        OPEN CYCLE →
                      </button>
                    </div>
                  )}
                  <div className="creator-project-stats" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                    {[
                      { k:'Current price', v:`${p.price.toFixed(5)} SOL`, c:'#22D3EE' },
                      { k:'24h change', v:`${p.change>=0?'▲':'▼'} ${Math.abs(p.change).toFixed(1)}%`, c:p.change>=0?'#22D3EE':'#F43F5E' },
                      { k:'24h volume', v:`${p.volume} SOL`, c:'var(--text-dim)' },
                      { k:'Total raised', v:p.raised, c:'var(--text-dim)' },
                    ].map((x,i) => (
                      <div key={i} style={{ background:'var(--panel)', border:'1px solid #1a2438', borderRadius:6, padding:'9px 10px' }}>
                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:3 }}>{x.k}</div>
                        <div style={{ fontSize:12, color:x.c, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{x.v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={e => { e.stopPropagation(); setManageModal(p); }}
                    style={{ width:'100%', padding:'10px 0', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#22D3EE', cursor:'pointer', letterSpacing:'0.04em', transition:'all 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.28)'}>
                    MANAGE CYCLES →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>}

        {/* Portfolio tab */}
        {activeTab === 'portfolio' && (
          <div>
            {portfolio.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 16px' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>📊</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:6 }}>No holdings yet</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>Tokens you buy on Mammoth will appear here.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {/* Portfolio summary */}
                {(() => {
                  const totalSpent = portfolio.reduce((s, p) => s + p.totalSol, 0);
                  return (
                    <div style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>{portfolio.length} token{portfolio.length > 1 ? 's' : ''} held</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>Total spent: <span style={{ color:'var(--text)', fontWeight:700 }}>{totalSpent.toFixed(4)} SOL</span></span>
                    </div>
                  );
                })()}
                {portfolio.map((pos) => {
                  const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'2-digit' });
                  const fmt = (n) => n >= 0.01 ? n.toFixed(4) : n.toPrecision(3);
                  // Look up current price from all projects if available
                  const liveProject = myProjects?.find(p => String(p.mint || p.id) === String(pos.mintAddress));
                  const currentPrice = liveProject?.price || pos.avgPrice;
                  const currentValue = pos.totalTokens * currentPrice;
                  const pnlSol = currentValue - pos.totalSol;
                  const pnlPct = pos.totalSol > 0 ? (pnlSol / pos.totalSol) * 100 : 0;
                  const up = pnlSol >= 0;
                  const cycleOpen = pos.cycleStatus === 'ACTIVE';
                  return (
                    <div key={pos.mintAddress} style={{ background:'var(--panel)', border:'1px solid #1d2540', borderRadius:9, padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)' }}>{pos.name || pos.ticker}</span>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', background:'var(--badge-bg)', border:'1px solid #252848', borderRadius:3, padding:'1px 6px' }}>${pos.ticker}</span>
                            {cycleOpen && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'#22D3EE', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:3, padding:'1px 6px', fontWeight:700 }}>CYCLE OPEN</span>}
                          </div>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>
                            {pos.buyCount} buy{pos.buyCount > 1 ? 's' : ''} · last {fmtDate(pos.lastBuy.ts)}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, color: up ? '#10B981' : '#F43F5E' }}>
                            {up ? '+' : ''}{fmt(pnlSol)} SOL
                          </div>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color: up ? '#10B981' : '#F43F5E' }}>
                            {up ? '+' : ''}{pnlPct.toFixed(1)}% P&L
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                        {[
                          { label:'Holdings', value:`${pos.totalTokens.toLocaleString()}` },
                          { label:'Avg price', value:`${pos.avgPrice.toPrecision(3)} SOL` },
                          { label:'Current val', value:`${fmt(currentValue)} SOL`, color:'#22D3EE' },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background:'var(--panel-alt)', borderRadius:5, padding:'7px 8px' }}>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color: color || 'var(--text)' }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Drafts tab */}
        {activeTab === 'drafts' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {drafts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:10 }}>📝</div>
                No drafts saved yet.<br/>
                <span style={{ fontSize:10, opacity:0.7 }}>Use the wizard to save a draft or schedule a launch.</span>
              </div>
            ) : drafts.map(draft => {
              const isScheduled = !!draft.scheduledFor;
              const launchTime = isScheduled ? new Date(draft.scheduledFor) : null;
              const msUntil = launchTime ? launchTime - now : null;
              const ready = msUntil !== null && msUntil <= 0;
              const hrsUntil = msUntil ? Math.floor(msUntil / 3600000) : 0;
              const minsUntil = msUntil ? Math.floor((msUntil % 3600000) / 60000) : 0;

              return (
                <div key={draft.id} className="draft-card" style={{ background:'var(--panel-alt)', border:`1px solid ${ready ? 'rgba(255,159,28,0.3)' : '#1d2540'}`, borderRadius:10, padding:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)' }}>
                        {draft.name || 'Unnamed Token'}
                        {draft.ticker && <span style={{ fontSize:11, color:'var(--text-dim)', marginLeft:6 }}>/ ${draft.ticker.toUpperCase()}</span>}
                      </div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:3 }}>
                        Saved {new Date(draft.savedAt).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                        {isScheduled && (
                          <span style={{ marginLeft:8, color: ready ? '#FF9F1C' : '#22D3EE', fontWeight:600 }}>
                            {ready ? '⚡ READY TO LAUNCH' : `⏰ launches in ${hrsUntil}h ${minsUntil}m`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteDraft(draft.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:14, lineHeight:1, padding:'0 0 0 8px' }} title="Delete draft">✕</button>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                    {[
                      ['Supply', draft.supplyMode || '—'],
                      ['Start price', draft.startPrice ? `${draft.startPrice} SOL` : '—'],
                      ['Allocation', draft.initialAllocation ? `${Number(draft.initialAllocation).toLocaleString()} tokens` : '—'],
                      ['Curve', draft.curveType || '—'],
                    ].map(([k,v],i) => (
                      <div key={i} style={{ background:'var(--panel)', border:'1px solid #1a2438', borderRadius:5, padding:'6px 9px' }}>
                        <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k}</div>
                        <div style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => onResumeDraft?.(draft)}
                      style={{ flex:1, padding:'9px 0', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color:'#A78BFA', cursor:'pointer' }}>
                      ✏️ EDIT & LAUNCH
                    </button>
                    {(ready || !isScheduled) && (
                      <button onClick={() => onResumeDraft?.(draft, true)}
                        style={{ flex:1, padding:'9px 0', background: ready ? '#FF9F1C' : 'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:11, color: ready ? '#000' : '#fff', cursor:'pointer' }}>
                        🚀 LAUNCH
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {manageModal && (
        <CycleManagerModal cycle={manageModal.cycleData} project={manageModal} onClose={() => setManageModal(null)} onLaunchCycle={onLaunchCycle} onTerminate={() => onTerminateProject?.(manageModal.id)}/>
      )}
    </div>
  );
}
