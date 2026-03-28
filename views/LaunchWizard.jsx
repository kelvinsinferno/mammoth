'use client';
import { useState, useEffect } from 'react';
import { deployProject } from '../lib/curves';
import { parseTransactionError } from '../lib/anchorClient';
import { useApp } from '../lib/AppContext';
import { useToast } from '../components/ui/Toast';

const DRAFTS_KEY = 'mammoth_drafts'

function getDrafts() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]'); } catch { return []; }
}
function saveDraft(data) {
  const drafts = getDrafts();
  const draft = { id: Date.now(), savedAt: new Date().toISOString(), ...data };
  drafts.unshift(draft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 20)));
  return draft;
}

export default function LaunchWizard({ onClose, onLaunch, walletState, theme, initialData }) {
  const { connection, getWalletAdapter } = useApp();
  const toast = useToast();

  // Mobile detection — lazy init reads real width immediately on first render (client only)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => ({
    name: '', ticker: '', description: '', website: '', twitter: '', discord: '', image: null, imagePreview: null,
    supplyMode: 'elastic', initialAllocation: 1000000, hardCapSupply: 0, curveType: 'bonding', startPrice: 0.001,
    stepSize: 5000, stepIncrement: 0.00022, creatorAlloc: 10, treasuryAlloc: 15, protocolFee: 2,
    // Pre-fill from draft if provided
    ...(initialData ? {
      name: initialData.name || '',
      ticker: initialData.ticker || '',
      description: initialData.description || '',
      supplyMode: initialData.supplyMode || 'elastic',
      initialAllocation: initialData.initialAllocation || 1000000,
      hardCapSupply: initialData.hardCapSupply || 0,
      curveType: initialData.curveType || 'bonding',
      startPrice: initialData.startPrice || 0.001,
      creatorAlloc: initialData.creatorAlloc || 10,
      treasuryAlloc: initialData.treasuryAlloc || 15,
    } : {}),
  }));
  const [errors, setErrors] = useState({});
  const [txState, setTxState] = useState('idle');
  const [launchMode, setLaunchMode] = useState('now'); // 'now' | 'draft' | 'schedule'
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [countdown, setCountdown] = useState(null); // seconds remaining until launch unlocks
  const [scheduledAt, setScheduledAt] = useState(() => {
    // Restore scheduled time from draft on resume
    if (initialData?.scheduledFor) {
      const d = new Date(initialData.scheduledFor);
      if (!isNaN(d)) return d;
    }
    return null;
  });

  // If reopened from a scheduled draft, jump straight to the scheduled state
  useEffect(() => {
    if (initialData?.scheduledFor && scheduledAt) {
      setLaunchMode('schedule');
      setTxState('scheduled');
      const d = new Date(initialData.scheduledFor);
      setScheduleDate(d.toISOString().split('T')[0]);
      setScheduleTime(d.toTimeString().slice(0, 5));
      setStep(3);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown ticker — updates every second when a schedule is set
  useEffect(() => {
    if (!scheduledAt) return;
    const tick = () => {
      const remaining = Math.ceil((scheduledAt - Date.now()) / 1000);
      setCountdown(Math.max(0, remaining));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData(prev => ({ ...prev, image:file, imagePreview:reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Required';
    else if (formData.name.length > 32) errs.name = 'Max 32 chars';
    if (!formData.ticker?.trim()) errs.ticker = 'Required';
    else if (!/^[A-Z0-9]{1,6}$/.test(formData.ticker.toUpperCase())) errs.ticker = '1–6 alphanumeric';
    if (!formData.description?.trim()) errs.description = 'Required';
    else if (formData.description.length < 20) errs.description = 'Min 20 chars';
    if (formData.supplyMode==='fixed' && (!formData.hardCapSupply||formData.hardCapSupply<=0)) errs.hardCapSupply = 'Required for fixed mode';
    if (formData.startPrice <= 0) errs.startPrice = 'Must be > 0';
    if (formData.initialAllocation <= 0) errs.initialAllocation = 'Must be > 0';
    if (formData.creatorAlloc + formData.treasuryAlloc >= 100) errs.alloc = 'Creator + treasury must be < 100%';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name?.trim() || !formData.ticker?.trim() || !formData.description?.trim()) {
        setErrors({ form:'All fields required' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.supplyMode || !formData.curveType) {
        setErrors({ form:'Select options' });
        return;
      }
      setStep(3);
    }
  };

  const handleSaveDraft = () => {
    if (!formData.name?.trim()) { setErrors({ form: 'Add a token name before saving' }); return; }
    saveDraft(formData);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSchedule = () => {
    if (!validate()) return;
    if (!scheduleDate || !scheduleTime) { setErrors({ form: 'Pick a date and time to schedule' }); return; }
    const launchAt = new Date(`${scheduleDate}T${scheduleTime}`);
    if (launchAt <= new Date()) { setErrors({ form: 'Schedule time must be in the future' }); return; }
    // Save as draft with scheduled time
    saveDraft({ ...formData, scheduledFor: launchAt.toISOString() });
    setScheduledAt(launchAt);
    setTxState('scheduled');
  };

  const handleLaunch = async () => {
    if (!validate()) return;
    if (walletState.status !== 'connected') {
      setErrors({ form:'Connect wallet first' });
      return;
    }
    setTxState('awaiting');
    try {
      setTxState('loading');

      const walletAdapter = getWalletAdapter();
      let deployResult;

      if (walletAdapter) {
        // Real on-chain deploy
        deployResult = await deployProject({
          connection,
          walletAdapter,
          form: {
            supplyMode: formData.supplyMode,
            totalSupply: formData.supplyMode === 'fixed'
              ? parseInt(formData.hardCapSupply) || 1_000_000_000
              : parseInt(formData.initialAllocation) || 1_000_000_000,
            publicAllocationBps: Math.floor((100 - formData.creatorAlloc - formData.protocolFee) * 100),
            creatorBps: Math.floor(formData.creatorAlloc * 100),
            reserveBps: Math.floor(formData.treasuryAlloc * 100),
            sinkBps: Math.floor((98 - formData.creatorAlloc - formData.treasuryAlloc) * 100),
          },
        });
      } else {
        // Fallback mock
        const { mockDeployToken } = await import('../lib/curves');
        deployResult = await mockDeployToken(formData);
      }

      const newProject = {
        id: deployResult.mint,
        mint: deployResult.mint,
        name: formData.name,
        ticker: formData.ticker.toUpperCase(),
        description: formData.description,
        creator: walletState.short || 'anon',
        image: formData.imagePreview,
        supplyMode: formData.supplyMode,
        totalSupply: formData.supplyMode === 'fixed' ? formData.hardCapSupply : formData.initialAllocation,
        status: 'BETWEEN',
        price: formData.startPrice,
        change: 0,
        volume: 0,
        raised: '0 SOL',
        progress: 0,
        sparkline: Array(12).fill(0).map(() => formData.startPrice * (0.95 + Math.random()*0.1)),
      };
      setTxState('success');
      toast.success('Token launched on-chain!');
      setTimeout(() => onLaunch?.(newProject), 1500);
    } catch(e) {
      const userMsg = parseTransactionError(e);
      if (userMsg === null) {
        setTxState('idle');
        return;
      }
      if (userMsg === 'Insufficient balance') {
        toast.error('Insufficient balance');
        setTxState('idle');
        return;
      }
      setErrors({ form: userMsg || e.message || 'Failed to launch' });
      setTxState('error');
    }
  };

  const isProcessing = txState === 'awaiting' || txState === 'loading';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent:'center', padding: isMobile ? 0 : 16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease', overflow:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius: isMobile ? '20px 20px 0 0' : 12, width:'100%', maxWidth: isMobile ? '100%' : 500, padding: isMobile ? '24px 16px 32px' : '24px 20px', animation:'slideUp 0.18s ease', maxHeight: isMobile ? '92vh' : '90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Launch token</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>step {step} of 3</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1, padding:4 }}>✕</button>
        </div>

        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex:1, height:2, background:s<=step?'#8B5CF6':'var(--border)', borderRadius:1, transition:'background 0.2s' }}/>
          ))}
        </div>

        {step === 1 && (
          <div style={{ animation:'fadeUp 0.2s ease' }}>
            {[
              { name:'name', label:'Token name', placeholder:'e.g., MegaTusk' },
              { name:'ticker', label:'Ticker', placeholder:'TUSK' },
              { name:'description', label:'Description', placeholder:'What does your token do?', rows:3 },
            ].map(f => (
              <div key={f.name} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</label>
                {f.rows ? (
                  <textarea name={f.name} value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder} rows={f.rows}
                    style={{ width:'100%', background:'var(--panel-alt)', border:errors[f.name]?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:14, fontFamily:"'IBM Plex Mono',monospace", resize:'none', outline:'none', opacity:isProcessing?0.6:1, boxSizing:'border-box' }}
                    onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onBlur={e => e.currentTarget.style.borderColor=errors[f.name]?'#F43F5E':'var(--border)'}/>
                ) : (
                  <input type="text" name={f.name} value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder}
                    style={{ width:'100%', background:'var(--panel-alt)', border:errors[f.name]?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:14, fontFamily:"'IBM Plex Mono',monospace", outline:'none', opacity:isProcessing?0.6:1, boxSizing:'border-box', minHeight:44 }}
                    onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onBlur={e => e.currentTarget.style.borderColor=errors[f.name]?'#F43F5E':'var(--border)'}/>
                )}
                {errors[f.name] && <div style={{ fontSize:10, color:'#F43F5E', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>⚠ {errors[f.name]}</div>}
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ animation:'fadeUp 0.2s ease' }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Supply mode</label>
              {['elastic','fixed'].map(m => (
                <div key={m} onClick={() => handleChange({ target:{ name:'supplyMode', value:m } })} style={{ display:'flex', alignItems:'center', padding:'10px 12px', background:formData.supplyMode===m?'rgba(139,92,246,0.15)':'var(--panel-alt)', border:formData.supplyMode===m?'1px solid #8B5CF6':'1px solid var(--border)', borderRadius:6, cursor:'pointer', marginBottom:6, transition:'all 0.12s' }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', border:formData.supplyMode===m?'4px solid #8B5CF6':'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:10, flexShrink:0 }}>
                    {formData.supplyMode===m && <div style={{ width:6, height:6, borderRadius:'50%', background:'#8B5CF6' }}/>}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--text)' }}>{m.charAt(0).toUpperCase()+m.slice(1)}</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>{m==='elastic'?'Cycles can mint more':'Hard cap after final cycle'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Bonding curve</label>
              {['bonding','stepwise'].map(c => (
                <div key={c} onClick={() => handleChange({ target:{ name:'curveType', value:c } })} style={{ display:'flex', alignItems:'center', padding:'10px 12px', background:formData.curveType===c?'rgba(139,92,246,0.15)':'var(--panel-alt)', border:formData.curveType===c?'1px solid #8B5CF6':'1px solid var(--border)', borderRadius:6, cursor:'pointer', marginBottom:6, transition:'all 0.12s' }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', border:formData.curveType===c?'4px solid #8B5CF6':'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:10, flexShrink:0 }}>
                    {formData.curveType===c && <div style={{ width:6, height:6, borderRadius:'50%', background:'#8B5CF6' }}/>}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--text)' }}>{c.charAt(0).toUpperCase()+c.slice(1)}</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>{c==='bonding'?'Smooth exponential curve':'Stepped price jumps'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation:'fadeUp 0.2s ease' }}>
            {[
              { name:'initialAllocation', label:'Initial allocation', suffix:'tokens' },
              formData.supplyMode==='fixed' && { name:'hardCapSupply', label:'Hard cap supply', suffix:'tokens' },
              { name:'startPrice', label:'Starting price', suffix:'SOL', step:0.00001 },
              { name:'creatorAlloc', label:'Creator share', suffix:'%' },
              { name:'treasuryAlloc', label:'Treasury share', suffix:'%' },
            ].filter(Boolean).map(f => (
              <div key={f.name} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</label>
                <div style={{ position:'relative' }}>
                  <input type="number" name={f.name} value={formData[f.name]} onChange={handleChange} step={f.step||1}
                    style={{ width:'100%', background:'var(--panel-alt)', border:errors[f.name]?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px 9px', color:'var(--text)', fontSize:14, fontFamily:"'IBM Plex Mono',monospace", outline:'none', opacity:isProcessing?0.6:1, boxSizing:'border-box', minHeight:44 }}
                    onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onBlur={e => e.currentTarget.style.borderColor=errors[f.name]?'#F43F5E':'var(--border)'}/>
                  {f.suffix && <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)' }}>{f.suffix}</span>}
                </div>
                {errors[f.name] && <div style={{ fontSize:10, color:'#F43F5E', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>⚠ {errors[f.name]}</div>}
              </div>
            ))}
          </div>
        )}

        {errors.form && (
          <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, padding:'10px 12px', marginBottom:12, fontSize:11, color:'#F43F5E', fontFamily:"'IBM Plex Mono',monospace" }}>
            ⚠ {errors.form}
          </div>
        )}

        {txState === 'success' && (
          <div style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:6, padding:'12px', marginBottom:12, textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#10B981', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>✓ Token launched!</div>
          </div>
        )}

        {txState === 'scheduled' && (() => {
          const unlocked = countdown !== null && countdown <= 0;
          const hrs = countdown !== null ? Math.floor(countdown / 3600) : 0;
          const mins = Math.floor(((countdown || 0) % 3600) / 60);
          const secs = (countdown || 0) % 60;
          const fmt = (n) => String(n).padStart(2, '0');
          return (
            <div style={{ marginBottom:12 }}>
              <div style={{ background: unlocked ? 'rgba(16,185,129,0.08)' : 'rgba(139,92,246,0.07)', border: `1px solid ${unlocked ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.25)'}`, borderRadius:8, padding:'14px 16px', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:18 }}>{unlocked ? '🚀' : '⏰'}</span>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color: unlocked ? '#10B981' : '#A78BFA' }}>
                    {unlocked ? 'Ready to launch!' : 'Launch scheduled'}
                  </div>
                </div>
                {!unlocked ? (
                  <>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginBottom:10 }}>
                      Launches on {scheduleDate} at {scheduleTime}
                    </div>
                    {/* Countdown clock */}
                    <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:6 }}>
                      {[['HRS', hrs], ['MIN', mins], ['SEC', secs]].map(([label, val]) => (
                        <div key={label} style={{ textAlign:'center', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', minWidth:52 }}>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:18, color:'#A78BFA', lineHeight:1 }}>{fmt(val)}</div>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginTop:3, letterSpacing:'0.06em' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', textAlign:'center', lineHeight:1.6 }}>
                      Keep this window open or come back at launch time.<br/>LAUNCH unlocks automatically when the countdown hits zero.
                    </div>
                  </>
                ) : (
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#10B981', lineHeight:1.6 }}>
                    Your scheduled time has arrived. Hit LAUNCH below to deploy your token on-chain.
                  </div>
                )}
              </div>
              {/* Time-locked LAUNCH button */}
              <button
                onClick={unlocked ? handleLaunch : undefined}
                disabled={!unlocked || isProcessing}
                style={{ width:'100%', padding:'13px 0', borderRadius:7, border:'none', background: unlocked ? 'linear-gradient(135deg,#7C3AED,#8B5CF6)' : 'var(--border)', color: unlocked ? '#fff' : 'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14, cursor: unlocked ? 'pointer' : 'not-allowed', letterSpacing:'0.05em', minHeight:48, transition:'all 0.2s', position:'relative', overflow:'hidden' }}>
                {isProcessing ? 'LAUNCHING...' : unlocked ? '🚀 LAUNCH NOW' : `🔒 LOCKED — ${fmt(hrs)}:${fmt(mins)}:${fmt(secs)}`}
                {!unlocked && (
                  <div style={{ position:'absolute', bottom:0, left:0, height:2, background:'linear-gradient(90deg,#7C3AED,#8B5CF6)', transition:'width 1s linear', width: scheduledAt ? `${Math.min(100, (1 - countdown / Math.ceil((scheduledAt - (Date.now() - (countdown !== null ? 0 : 0))) / 1000)) * 100)}%` : '0%' }}/>
                )}
              </button>
              <button onClick={onClose} style={{ marginTop:8, width:'100%', padding:'9px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-dim)', cursor:'pointer' }}>
                CLOSE & COME BACK
              </button>
            </div>
          );
        })()}

        {draftSaved && (
          <div style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:6, padding:'10px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14 }}>✓</span>
            <span style={{ fontSize:12, color:'#10B981', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>Draft saved — find it in Creator Dashboard → Drafts</span>
          </div>
        )}

        {isProcessing && (
          <div style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'12px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid #252848', borderTopColor:'#8B5CF6', animation:'spin 0.7s linear infinite', flexShrink:0 }}/>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>Launching token on-chain...</div>
          </div>
        )}

        <div style={{ display:'flex', gap:8, marginTop:18 }}>
          {step > 1 && (
            <button onClick={() => setStep(step-1)} disabled={isProcessing}
              style={{ flex:1, padding:'11px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-dim)', cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1, minHeight:48 }}>
              BACK
            </button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} disabled={isProcessing}
              style={{ flex:1, padding:'11px 0', background:'#8B5CF6', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1, minHeight:48 }}>
              NEXT
            </button>
          ) : txState === 'scheduled' ? null : (
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>

              {/* Launch mode selector */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {[
                  { key:'now', icon:'🚀', label:'Launch now' },
                  { key:'schedule', icon:'⏰', label:'Schedule' },
                  { key:'draft', icon:'📝', label:'Save draft' },
                ].map(m => (
                  <button key={m.key} onClick={() => setLaunchMode(m.key)} disabled={isProcessing}
                    style={{ padding:'8px 6px', background:launchMode===m.key?'rgba(139,92,246,0.18)':'var(--panel-alt)', border:`1px solid ${launchMode===m.key?'#8B5CF6':'var(--border)'}`, borderRadius:6, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 0.12s' }}>
                    <span style={{ fontSize:14 }}>{m.icon}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:launchMode===m.key?'#22D3EE':'var(--text-muted)', fontWeight:600, letterSpacing:'0.03em' }}>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Schedule date/time picker */}
              {launchMode === 'schedule' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, animation:'fadeUp 0.15s ease' }}>
                  <div>
                    <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Date</label>
                    <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                      style={{ width:'100%', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                      onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                      onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Time</label>
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                      style={{ width:'100%', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                      onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                      onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                  </div>
                </div>
              )}

              {/* Action button */}
              {launchMode === 'now' && (
                <button onClick={handleLaunch} disabled={isProcessing}
                  style={{ width:'100%', padding:'12px 0', background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1, minHeight:48 }}>
                  🚀 LAUNCH NOW
                </button>
              )}
              {launchMode === 'schedule' && (
                <button onClick={handleSchedule} disabled={isProcessing||!scheduleDate||!scheduleTime}
                  style={{ width:'100%', padding:'12px 0', background:'rgba(139,92,246,0.2)', border:'1px solid rgba(139,92,246,0.4)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#A78BFA', cursor:(!scheduleDate||!scheduleTime||isProcessing)?'not-allowed':'pointer', opacity:(!scheduleDate||!scheduleTime)?0.5:1, minHeight:48 }}>
                  ⏰ SCHEDULE LAUNCH
                </button>
              )}
              {launchMode === 'draft' && (
                <button onClick={handleSaveDraft} disabled={isProcessing}
                  style={{ width:'100%', padding:'12px 0', background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-dim)', cursor:'pointer', minHeight:48 }}>
                  📝 SAVE AS DRAFT
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
