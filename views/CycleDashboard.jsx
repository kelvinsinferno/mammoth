'use client';
import { useState } from 'react';
import { fmtTokens } from '../lib/utils';

function CycleManagerModal({ cycle, project, onClose, onLaunchCycle, onTerminate }) {
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

  const handleTerminate = async () => {
    if (!confirm('Terminate cycle? This cannot be undone.')) return;
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      onTerminate?.();
      onClose();
    } catch(e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:400, padding:'22px 20px', animation:'slideUp 0.18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'var(--text)' }}>{action?'Settings':'Manage cycle'}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}{project.name} · Cycle #{cycle.id}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16, lineHeight:1 }}>✕</button>
        </div>

        {!action ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8, animation:'fadeUp 0.15s ease' }}>
            {cycle.status==='ACTIVE' && (
              <>
                <button onClick={() => setAction('launch')}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(139,92,246,0.13)', border:'1px solid rgba(139,92,246,0.28)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#8B5CF6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.28)'}>
                  <span style={{ fontSize:16, lineHeight:1 }}>🚀</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', fontWeight:600 }}>Launch next cycle</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>Continue issuance with new params</div>
                  </div>
                </button>
                <button onClick={() => setAction('terminate')}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all 0.12s', width:'100%' }}
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

export default function CycleDashboard({ myProjects, onClose, onLaunchCycle, onTerminateProject, theme }) {
  const [expandedId, setExpandedId] = useState(null);
  const [manageModal, setManageModal] = useState(null);

  if (myProjects.length === 0) return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, padding:'32px 24px', textAlign:'center', maxWidth:400, animation:'slideUp 0.18s ease' }}>
        <div style={{ fontSize:24, marginBottom:12 }}>📭</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:4 }}>No tokens yet</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:16 }}>Launch your first token to manage cycles</div>
        <button onClick={onClose}
          style={{ background:'#8B5CF6', border:'none', borderRadius:6, padding:'10px 18px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:'#fff', cursor:'pointer', letterSpacing:'0.04em' }}>CLOSE</button>
      </div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease', overflow:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:600, padding:'24px 20px', animation:'slideUp 0.18s ease', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Your tokens</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>{myProjects.length} token{myProjects.length!==1?'s':''}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1 }}>✕</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {myProjects.map(p => (
            <div key={p.id} style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:10, padding:'14px', cursor:'pointer', transition:'all 0.12s', animation:'fadeUp 0.2s ease both', animationDelay:`${myProjects.indexOf(p)*0.05}s` }}
              onClick={() => setExpandedId(expandedId===p.id?null:p.id)}
              onMouseEnter={e => e.currentTarget.style.borderColor='#7C3AED'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-sub)'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:3 }}>{p.name} <span style={{ fontSize:11, color:'var(--text-dim)' }}>/ ${p.ticker}</span></div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>Cycle #{p.cycleData.id} · {p.cycleData.status} · {fmtTokens(p.cycleData.sold)} / {fmtTokens(p.cycleData.allocation)} sold</div>
                </div>
                <span style={{ fontSize:14, opacity:expandedId===p.id?0.6:1 }}>{expandedId===p.id?'▼':'▶'}</span>
              </div>

              {expandedId === p.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #1a2438', animation:'slideDown 0.15s ease' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
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
        </div>
      </div>

      {manageModal && (
        <CycleManagerModal cycle={manageModal.cycleData} project={manageModal} onClose={() => setManageModal(null)} onLaunchCycle={onLaunchCycle} onTerminate={() => onTerminateProject?.(manageModal.id)}/>
      )}
    </div>
  );
}
