'use client';
import { useState, useEffect, useRef } from 'react';
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
    name: '', ticker: '', description: '', website: '', twitter: '', telegram: '', discord: '', github: '', farcaster: '', docs: '', image: null, imagePreview: null,
    supplyMode: 'elastic', initialAllocation: 1000000, hardCapSupply: 0, curveType: 'linear', startPrice: 0.001,
    stepSize: 5000, stepIncrement: 0.00022, endPrice: 0.01, expMultiplier: 10,
    creatorAlloc: 70, treasuryAlloc: 20, burnAlloc: 8, protocolFee: 2,
    // Pre-fill from draft if provided
    ...(initialData ? {
      name: initialData.name || '',
      ticker: initialData.ticker || '',
      description: initialData.description || '',
      supplyMode: initialData.supplyMode || 'elastic',
      initialAllocation: initialData.initialAllocation || 1000000,
      hardCapSupply: initialData.hardCapSupply || 0,
      curveType: initialData.curveType || 'linear',
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
  const [showScheduleWarning, setShowScheduleWarning] = useState(false);
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
    const totalAlloc = Number(formData.creatorAlloc) + Number(formData.treasuryAlloc) + Number(formData.burnAlloc) + 2;
    if (totalAlloc > 100) errs.creatorAlloc = `Allocations total ${totalAlloc}% — must be ≤ 100%`;
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
    // Show irreversibility warning before proceeding
    setShowScheduleWarning(true);
  };

  const handleScheduleConfirm = async () => {
    setShowScheduleWarning(false);
    if (!validate()) return;
    const launchAt = new Date(`${scheduleDate}T${scheduleTime}`);
    // Deploy the token on-chain NOW with the launch_at timestamp baked in
    // The contract will reject open_cycle until that time arrives
    setTxState('awaiting');
    try {
      setTxState('loading');
      const walletAdapter = getWalletAdapter?.();
      const launchAtUnix = Math.floor(launchAt.getTime() / 1000);
      let deployResult;
      if (walletAdapter) {
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
            launchAt: launchAtUnix,
          },
        });
      } else {
        deployResult = { mint: 'SCHEDULED_' + Date.now(), mock: true };
      }
      saveDraft({ ...formData, scheduledFor: launchAt.toISOString(), mint: deployResult.mint, deployed: true });
      setScheduledAt(launchAt);
      setTxState('scheduled');
    } catch(e) {
      const userMsg = parseTransactionError ? parseTransactionError(e) : null;
      if (userMsg === null) { setTxState('idle'); return; }
      setErrors({ form: userMsg || e?.message || 'Failed to schedule launch' });
      setTxState('error');
    }
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

  // Ticker collision lookup
  const [tickerMatches, setTickerMatches] = useState([]);
  const [tickerLookupState, setTickerLookupState] = useState('idle'); // idle | loading | done
  const tickerDebounce = useRef(null);

  useEffect(() => {
    const raw = (formData.ticker || '').trim().toUpperCase();
    if (!raw || raw.length < 1) { setTickerMatches([]); setTickerLookupState('idle'); return; }
    clearTimeout(tickerDebounce.current);
    setTickerLookupState('loading');
    tickerDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(raw)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const pairs = Array.isArray(data.pairs) ? data.pairs : [];
        // Filter: Solana only, exact symbol match on base token
        const solanaPairs = pairs.filter(p => p.chainId === 'solana' && (p.baseToken?.symbol || '').toUpperCase() === raw);
        // Dedupe by token address, keep highest volume entry
        const seen = new Map();
        for (const p of solanaPairs) {
          const addr = p.baseToken.address;
          const vol = p.volume?.h24 || 0;
          if (!seen.has(addr) || vol > (seen.get(addr).volume?.h24 || 0)) seen.set(addr, p);
        }
        const unique = [...seen.values()].sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0)).slice(0, 4);
        // Map to display shape
        const matches = unique.map(p => ({
          address: p.baseToken.address,
          name: p.baseToken.name,
          symbol: p.baseToken.symbol,
          logoURI: p.info?.imageUrl || null,
          website: p.info?.websites?.[0]?.url || null,
          daily_volume: p.volume?.h24 || 0,
          mcap: p.marketCap || null,
          dexUrl: p.url || null,
        }));
        setTickerMatches(matches);
        setTickerLookupState('done');
      } catch {
        setTickerLookupState('done');
        setTickerMatches([]);
      }
    }, 500);
    return () => clearTimeout(tickerDebounce.current);
  }, [formData.ticker]);

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

            {/* Token name */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Token name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., MegaTusk" maxLength={32}
                style={{ width:'100%', background:'var(--panel-alt)', border:errors.name?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:14, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:44 }}
                onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor=errors.name?'#F43F5E':'var(--border)'}/>
              {errors.name && <div style={{ fontSize:10, color:'#F43F5E', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>⚠ {errors.name}</div>}
            </div>

            {/* Ticker + collision lookup */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Ticker</label>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>1–10 chars · Solana max</span>
              </div>
              <input type="text" name="ticker" value={formData.ticker} onChange={e => handleChange({ target:{ name:'ticker', value:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'') } })} placeholder="TUSK" maxLength={10}
                style={{ width:'100%', background:'var(--panel-alt)', border:errors.ticker?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:14, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:44, letterSpacing:'0.08em' }}
                onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor=errors.ticker?'#F43F5E':'var(--border)'}/>
              {errors.ticker && <div style={{ fontSize:10, color:'#F43F5E', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>⚠ {errors.ticker}</div>}

              {/* Collision lookup results */}
              {formData.ticker && tickerLookupState === 'loading' && (
                <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', border:'2px solid #252848', borderTopColor:'#8B5CF6', animation:'spin 0.7s linear infinite', flexShrink:0 }}/>
                  Checking existing tokens...
                </div>
              )}
              {tickerLookupState === 'done' && tickerMatches.length === 0 && formData.ticker && (
                <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#10B981' }}>
                  ✓ No existing tokens found with this ticker
                </div>
              )}
              {tickerLookupState === 'done' && tickerMatches.length > 0 && (
                <div style={{ marginTop:8, background:'rgba(248,113,113,0.05)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, overflow:'hidden', animation:'fadeUp 0.15s ease' }}>
                  <div style={{ padding:'7px 10px', borderBottom:'1px solid rgba(248,113,113,0.15)', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:11 }}>⚠️</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#F87171' }}>
                      {tickerMatches.length} existing token{tickerMatches.length > 1 ? 's' : ''} use this ticker — yours will be distinct by contract address
                    </span>
                  </div>
                  {tickerMatches.map((t, i) => (
                    <div key={t.address || i} style={{ padding:'8px 10px', borderBottom: i < tickerMatches.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display:'flex', alignItems:'center', gap:10 }}>
                      {t.logoURI && <img src={t.logoURI} alt="" width={20} height={20} style={{ borderRadius:'50%', flexShrink:0, objectFit:'cover' }} onError={e => e.currentTarget.style.display='none'}/>}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--text)' }}>{t.name || t.symbol}</span>
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#F87171', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:3, padding:'1px 5px' }}>{t.symbol}</span>
                        </div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {t.address}
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
                        {t.daily_volume > 0 && (
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>
                            ${Number(t.daily_volume).toLocaleString(undefined,{maximumFractionDigits:0})} 24h vol
                          </span>
                        )}
                        {t.mcap > 0 && (
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>
                            ${Number(t.mcap).toLocaleString(undefined,{maximumFractionDigits:0})} mcap
                          </span>
                        )}
                        <div style={{ display:'flex', gap:6 }}>
                          {t.website && (
                            <a href={t.website} target="_blank" rel="noopener noreferrer"
                              style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#22D3EE', textDecoration:'none' }}>
                              site ↗
                            </a>
                          )}
                          {t.dexUrl && (
                            <a href={t.dexUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#A78BFA', textDecoration:'none' }}>
                              dex ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What does your token do?" rows={3}
                style={{ width:'100%', background:'var(--panel-alt)', border:errors.description?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:14, fontFamily:"'IBM Plex Mono',monospace", resize:'none', outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor=errors.description?'#F43F5E':'var(--border)'}/>
              {errors.description && <div style={{ fontSize:10, color:'#F43F5E', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>⚠ {errors.description}</div>}
            </div>

            {/* Links */}
            <div style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px' }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-dim)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Links <span style={{ fontWeight:400, color:'var(--text-muted)' }}>— all optional</span></div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { name:'website',  icon:'🌐', placeholder:'https://yourproject.xyz' },
                  { name:'twitter',  icon:'𝕏',  placeholder:'https://x.com/yourproject' },
                  { name:'telegram', icon:'✈️', placeholder:'https://t.me/yourproject' },
                  { name:'discord',  icon:'💬', placeholder:'https://discord.gg/yourproject' },
                  { name:'github',   icon:'⌥',  placeholder:'https://github.com/yourproject' },
                  { name:'farcaster',icon:'🟣', placeholder:'https://warpcast.com/yourproject' },
                  { name:'docs',     icon:'📄', placeholder:'https://docs.yourproject.xyz' },
                ].map(f => (
                  <div key={f.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14, width:20, textAlign:'center', flexShrink:0 }}>{f.icon}</span>
                    <input type="url" name={f.name} value={formData[f.name] || ''} onChange={handleChange} placeholder={f.placeholder}
                      style={{ flex:1, background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 10px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                      onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                      onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {step === 2 && (
          <div style={{ animation:'fadeUp 0.2s ease' }}>

            {/* ── Section 1: Cycle Setup ── */}
            <div style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:9, padding:'14px', marginBottom:14 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-dim)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>Cycle Setup</div>

              {/* Supply mode */}
              <div style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Supply mode</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {['elastic','fixed'].map(m => (
                    <div key={m} onClick={() => handleChange({ target:{ name:'supplyMode', value:m } })} style={{ display:'flex', alignItems:'center', padding:'9px 11px', background:formData.supplyMode===m?'rgba(139,92,246,0.15)':'var(--panel)', border:formData.supplyMode===m?'1px solid #8B5CF6':'1px solid var(--border)', borderRadius:6, cursor:'pointer', transition:'all 0.12s', gap:8 }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', border:formData.supplyMode===m?'4px solid #8B5CF6':'2px solid var(--border)', flexShrink:0 }}/>
                      <div>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color: formData.supplyMode===m ? '#A78BFA' : 'var(--text)' }}>{m.charAt(0).toUpperCase()+m.slice(1)}</div>
                        <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>{m==='elastic'?'Cycles can mint more':'One-time hard cap'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cycle allocation */}
              <div style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Cycle allocation</label>
                <div style={{ position:'relative' }}>
                  <input type="number" name="initialAllocation" value={formData.initialAllocation} onChange={handleChange} step={1000} min={1}
                    style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 52px 8px 10px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                    onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                  <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>tokens</span>
                </div>
              </div>

              {/* Treasury routing */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Treasury routing</label>
                  {(() => {
                    const used = Number(formData.creatorAlloc) + Number(formData.treasuryAlloc) + Number(formData.burnAlloc) + 2;
                    const over = used > 100;
                    return <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color: over ? '#F43F5E' : used === 100 ? '#10B981' : 'var(--text-muted)' }}>{used}% {over ? '⚠ over' : used === 100 ? '✓' : 'used'}</span>;
                  })()}
                </div>
                {/* Progress bar */}
                {(() => {
                  const c = Number(formData.creatorAlloc);
                  const r = Number(formData.treasuryAlloc);
                  const b = Number(formData.burnAlloc);
                  const p = 2;
                  const total = c + r + b + p;
                  const over = total > 100;
                  return (
                    <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden', marginBottom:10, display:'flex' }}>
                      {[
                        { pct: c, color: '#A78BFA' },
                        { pct: r, color: '#22D3EE' },
                        { pct: b, color: '#F43F5E' },
                        { pct: p, color: 'rgba(255,255,255,0.2)' },
                      ].map((seg, i) => (
                        <div key={i} style={{ width:`${Math.min(seg.pct, Math.max(0, 100 - [c,r,b,p].slice(0,i).reduce((a,x)=>a+x,0)))}%`, background: over ? '#F43F5E' : seg.color, transition:'width 0.2s' }}/>
                      ))}
                    </div>
                  );
                })()}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                  {[
                    { name:'creatorAlloc', label:'Public Offer', color:'#A78BFA' },
                    { name:'treasuryAlloc', label:'Reserve', color:'#22D3EE' },
                    { name:'burnAlloc', label:'Burn', color:'#F43F5E' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:f.color, marginBottom:3, fontWeight:700, textTransform:'uppercase' }}>{f.label}</label>
                      <div style={{ position:'relative' }}>
                        <input type="number" name={f.name} value={formData[f.name]} onChange={handleChange} step={1} min={0} max={98}
                          style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 22px 7px 8px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                          onFocus={e => e.currentTarget.style.borderColor=f.color}
                          onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                        <span style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', lineHeight:1.6 }}>
                  Protocol takes 2% · Remaining {Math.max(0, 98 - Number(formData.creatorAlloc) - Number(formData.treasuryAlloc) - Number(formData.burnAlloc))}% unallocated
                </div>
              </div>
            </div>

            {/* ── Section 2: Bonding Curve ── */}
            <div style={{ marginBottom:4 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-dim)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Bonding Curve</div>

              {[
                { key:'linear', label:'Linear', color:'#A78BFA', desc:'Price rises smoothly with every token sold. Predictable, no surprises.' },
                { key:'step',   label:'Step',   color:'#22D3EE', desc:'Price jumps at fixed intervals. Creates urgency — buyers see the next price cliff.' },
                { key:'exp',    label:'Exp-Lite', color:'#FF9F1C', desc:'Slow start, accelerating finish. Maximum asymmetry for early buyers.' },
              ].map(c => (
                <div key={c.key}>
                  <div onClick={() => handleChange({ target:{ name:'curveType', value:c.key } })}
                    style={{ display:'flex', alignItems:'center', padding:'10px 12px', background:formData.curveType===c.key?'rgba(139,92,246,0.12)':'var(--panel-alt)', border:formData.curveType===c.key?`1px solid ${c.color}`:'1px solid var(--border)', borderRadius:6, cursor:'pointer', marginBottom: formData.curveType===c.key ? 0 : 6, transition:'all 0.12s', borderBottomLeftRadius: formData.curveType===c.key ? 0 : 6, borderBottomRightRadius: formData.curveType===c.key ? 0 : 6 }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', border:formData.curveType===c.key?`4px solid ${c.color}`:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:10, flexShrink:0 }}>
                      {formData.curveType===c.key && <div style={{ width:6, height:6, borderRadius:'50%', background:c.color }}/>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color: formData.curveType===c.key ? c.color : 'var(--text)' }}>{c.label}</span>
                      </div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>{c.desc}</div>
                    </div>
                  </div>
                  {/* Inline params panel — expands when selected */}
                  {formData.curveType === c.key && (
                    <div style={{ background:'var(--panel-alt)', border:`1px solid ${c.color}`, borderTop:'none', borderBottomLeftRadius:6, borderBottomRightRadius:6, padding:'12px 12px 14px', marginBottom:6, animation:'fadeUp 0.15s ease' }}>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:c.color, fontWeight:700, letterSpacing:'0.06em', marginBottom:10, textTransform:'uppercase' }}>Configure {c.label}</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        {/* Start price — always shown */}
                        <div>
                          <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Start price (SOL)</label>
                          <input type="number" name="startPrice" value={formData.startPrice} onChange={handleChange} step={0.00001} min={0.000001}
                            style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                            onFocus={e => e.currentTarget.style.borderColor=c.color}
                            onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                        </div>
                        {/* Linear: end price */}
                        {c.key === 'linear' && (
                          <div>
                            <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>End price (SOL)</label>
                            <input type="number" name="endPrice" value={formData.endPrice} onChange={handleChange} step={0.00001} min={0.000001}
                              style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                              onFocus={e => e.currentTarget.style.borderColor=c.color}
                              onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                          </div>
                        )}
                        {/* Exp-Lite: growth multiplier */}
                        {c.key === 'exp' && (
                          <div>
                            <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Growth multiplier (×)</label>
                            <input type="number" name="expMultiplier" value={formData.expMultiplier} onChange={handleChange} step={1} min={2} max={1000}
                              style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                              onFocus={e => e.currentTarget.style.borderColor=c.color}
                              onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                          </div>
                        )}
                        {/* Step-specific: step size */}
                        {c.key === 'step' && (
                          <div>
                            <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Tokens per step</label>
                            <input type="number" name="stepSize" value={formData.stepSize} onChange={handleChange} step={100} min={100}
                              style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                              onFocus={e => e.currentTarget.style.borderColor=c.color}
                              onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                          </div>
                        )}
                        {/* Step-specific: price increment */}
                        {c.key === 'step' && (
                          <div>
                            <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Price jump per step (SOL)</label>
                            <input type="number" name="stepIncrement" value={formData.stepIncrement} onChange={handleChange} step={0.00001} min={0.000001}
                              style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                              onFocus={e => e.currentTarget.style.borderColor=c.color}
                              onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                          </div>
                        )}
                      </div>
                      {/* Hint text */}
                      <div style={{ marginTop:10, fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', lineHeight:1.7 }}>
                        {c.key === 'linear' && `Price rises evenly from ${formData.startPrice} SOL to ${formData.endPrice} SOL across the full cycle.`}
                        {c.key === 'step' && `Price holds at ${formData.startPrice} SOL for every ${Number(formData.stepSize).toLocaleString()} tokens, then jumps +${formData.stepIncrement} SOL. Buyers race to beat the next step.`}
                        {c.key === 'exp' && `Price starts at ${formData.startPrice} SOL and ends at ${(formData.startPrice * formData.expMultiplier).toFixed(5)} SOL (${formData.expMultiplier}× growth). First buyers get the deepest discount.`}
                      </div>

                      {/* ── Raise Calculator ── */}
                      {(() => {
                        const alloc = Number(formData.initialAllocation) || 0;
                        const sp = Number(formData.startPrice) || 0;
                        const ep = Number(formData.endPrice) || sp;
                        const ss = Number(formData.stepSize) || 5000;
                        const si = Number(formData.stepIncrement) || 0;
                        const mult = Number(formData.expMultiplier) || 10;
                        const creatorPct = Number(formData.creatorAlloc) / 100;
                        const treasuryPct = Number(formData.treasuryAlloc) / 100;
                        const burnPct = Number(formData.burnAlloc) / 100;
                        const protocolPct = 0.02;
                        const total = creatorPct + treasuryPct + burnPct + protocolPct;
                        const overBudget = total > 1.0001;

                        let totalRaise = 0;
                        let finalPrice = sp;
                        let avgPrice = sp;

                        if (c.key === 'linear') {
                          // Area under line: (sp + ep) / 2 * alloc
                          totalRaise = alloc > 0 ? ((sp + ep) / 2) * alloc : 0;
                          finalPrice = ep;
                          avgPrice = (sp + ep) / 2;
                        } else if (c.key === 'step') {
                          // Step through each interval exactly
                          let remaining = alloc;
                          let sold = 0;
                          let raise = 0;
                          while (remaining > 0) {
                            const stepIdx = Math.floor(sold / ss);
                            const price = sp + stepIdx * si;
                            const tokensThisStep = Math.min(ss - (sold % ss), remaining);
                            raise += tokensThisStep * price;
                            sold += tokensThisStep;
                            remaining -= tokensThisStep;
                          }
                          totalRaise = raise;
                          const finalStepIdx = Math.floor((alloc - 1) / ss);
                          finalPrice = sp + finalStepIdx * si;
                          avgPrice = alloc > 0 ? raise / alloc : sp;
                        } else if (c.key === 'exp') {
                          // Exp-lite: price(t) = sp * mult^(t/alloc), integral = sp * alloc * (mult - 1) / ln(mult)
                          if (mult <= 1 || alloc <= 0) {
                            totalRaise = sp * alloc;
                            finalPrice = sp;
                            avgPrice = sp;
                          } else {
                            const lnMult = Math.log(mult);
                            totalRaise = sp * alloc * (mult - 1) / lnMult;
                            finalPrice = sp * mult;
                            avgPrice = alloc > 0 ? totalRaise / alloc : sp;
                          }
                        }

                        if (alloc === 0 || sp === 0) return (
                          <div style={{ marginTop:12, background:'rgba(255,159,28,0.06)', border:'1px solid rgba(255,159,28,0.15)', borderRadius:6, padding:'10px 12px', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>
                            Set a start price above to see raise projection.
                          </div>
                        );

                        const fmt = (n) => n >= 1 ? n.toFixed(2) : n.toPrecision(3);
                        const fmtSOL = (n) => `${fmt(n)} SOL`;
                        const rows = [
                          { label: 'Total raise (full sell)', value: fmtSOL(totalRaise), accent: '#FF9F1C' },
                          { label: 'Final price at sell-out', value: fmtSOL(finalPrice), accent: c.color },
                          { label: 'Avg price paid', value: fmtSOL(avgPrice), accent: 'var(--text)' },
                          { label: `→ Public Offer (${(creatorPct*100).toFixed(0)}%)`, value: fmtSOL(totalRaise * creatorPct), accent: '#A78BFA' },
                          { label: `→ Reserve (${(treasuryPct*100).toFixed(0)}%)`, value: fmtSOL(totalRaise * treasuryPct), accent: '#22D3EE' },
                          { label: `→ Burn (${(burnPct*100).toFixed(0)}%)`, value: fmtSOL(totalRaise * burnPct), accent: '#F43F5E' },
                          { label: '→ Protocol (2%)', value: fmtSOL(totalRaise * protocolPct), accent: 'var(--text-muted)' },
                        ];

                        return (
                          <div style={{ marginTop:12, background:'rgba(255,159,28,0.05)', border:'1px solid rgba(255,159,28,0.2)', borderRadius:7, overflow:'hidden' }}>
                            <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,159,28,0.15)', display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:11 }}>📊</span>
                              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#FF9F1C', letterSpacing:'0.05em', textTransform:'uppercase' }}>Raise projection — {Number(alloc).toLocaleString()} tokens</span>
                            </div>
                            <div style={{ padding:'8px 12px' }}>
                              {rows.map((r, i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', borderBottom: i === 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', marginBottom: i === 2 ? 4 : 0 }}>
                                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>{r.label}</span>
                                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:r.accent }}>{r.value}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ padding:'6px 12px', borderTop:'1px solid rgba(255,159,28,0.1)', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color: overBudget ? '#F43F5E' : 'var(--text-muted)', lineHeight:1.6 }}>
                              {overBudget
                                ? `⚠ Allocations exceed 100% (${(total*100).toFixed(0)}%) — adjust in step 3.`
                                : `Allocation used: ${(total*100).toFixed(0)}% · Projection assumes 100% of cycle sold.`}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation:'fadeUp 0.2s ease' }}>
            {[
              formData.supplyMode==='fixed' && { name:'hardCapSupply', label:'Hard cap supply', suffix:'tokens', hint:'Total tokens that can ever exist.' },
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
                {f.hint && !errors[f.name] && <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>{f.hint}</div>}
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

        {/* Irreversibility warning modal — shown before scheduling */}
        {showScheduleWarning && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid rgba(248,113,113,0.4)', borderRadius:14, padding:'24px 20px', width:'100%', maxWidth:360, animation:'fadeUp 0.18s ease' }}>
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div style={{ fontSize:36, marginBottom:10 }}>⚠️</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:'#F43F5E', marginBottom:6 }}>This cannot be undone.</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)', lineHeight:1.75 }}>
                  You are about to sign a transaction that deploys your token on-chain with a scheduled launch time of:
                </div>
              </div>
              <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'12px 14px', marginBottom:16, textAlign:'center' }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:15, color:'#F43F5E' }}>
                  {scheduleDate} at {scheduleTime}
                </div>
              </div>
              <div style={{ background:'rgba(255,159,28,0.07)', border:'1px solid rgba(255,159,28,0.2)', borderRadius:8, padding:'12px 14px', marginBottom:20 }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#FF9F1C', lineHeight:1.75 }}>
                  Once signed, <strong>the contract is set in stone.</strong> Your token will launch at this time whether you want it to or not. You cannot change the date, cancel the transaction, or delay it. There is no override.
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <button onClick={handleScheduleConfirm}
                  style={{ width:'100%', padding:'13px 0', background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.4)', borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#F43F5E', cursor:'pointer', letterSpacing:'0.04em' }}>
                  I UNDERSTAND — SIGN & LOCK THE LAUNCH
                </button>
                <button onClick={() => setShowScheduleWarning(false)}
                  style={{ width:'100%', padding:'11px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-dim)', cursor:'pointer' }}>
                  GO BACK
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Step navigation */}
        <div style={{ marginTop:18, display:'flex', flexDirection:'column', gap:8 }}>

          {/* Steps 1 & 2: back + next */}
          {step < 3 && (
            <div style={{ display:'flex', gap:8 }}>
              {step > 1 && (
                <button onClick={() => setStep(step-1)} disabled={isProcessing}
                  style={{ padding:'11px 16px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:12, color:'var(--text-dim)', cursor:'pointer', opacity:isProcessing?0.5:1, flexShrink:0 }}>
                  ← Back
                </button>
              )}
              <button onClick={handleNext} disabled={isProcessing}
                style={{ flex:1, padding:'11px 0', background:'#8B5CF6', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor:'pointer', opacity:isProcessing?0.5:1, minHeight:46 }}>
                NEXT →
              </button>
            </div>
          )}

          {/* Step 3: launch options (not shown when already scheduled) */}
          {step === 3 && txState !== 'scheduled' && (
            <>
              {/* Primary actions row */}
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setStep(2)} disabled={isProcessing}
                  style={{ padding:'11px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:12, color:'var(--text-dim)', cursor:'pointer', flexShrink:0 }}>
                  ← Back
                </button>
                <button onClick={handleLaunch} disabled={isProcessing}
                  style={{ flex:1, padding:'11px 0', background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1, minHeight:46 }}>
                  {isProcessing ? 'LAUNCHING...' : '🚀 LAUNCH NOW'}
                </button>
              </div>

              {/* Secondary actions row */}
              <div style={{ display:'flex', gap:8 }}>
                {/* Save draft */}
                <button onClick={handleSaveDraft}
                  style={{ flex:1, padding:'9px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:11, color:'var(--text-dim)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  💾 Save draft
                </button>
                {/* Schedule toggle */}
                <button onClick={() => setLaunchMode(launchMode === 'schedule' ? 'now' : 'schedule')}
                  style={{ flex:1, padding:'9px 0', background:launchMode==='schedule'?'rgba(139,92,246,0.12)':'transparent', border:`1px solid ${launchMode==='schedule'?'rgba(139,92,246,0.4)':'var(--border)'}`, borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:11, color:launchMode==='schedule'?'#A78BFA':'var(--text-dim)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  ⏰ Schedule
                </button>
              </div>

              {/* Schedule date/time picker — shown when schedule is active */}
              {launchMode === 'schedule' && (
                <div style={{ animation:'fadeUp 0.15s ease', background:'var(--panel-alt)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#A78BFA', fontWeight:600, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>⏰ Set launch time</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                    <div>
                      <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Date</label>
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                        onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                        onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Time</label>
                      <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                        style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                        onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                        onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleSaveDraft}
                      style={{ flex:1, padding:'9px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:11, color:'var(--text-dim)', cursor:'pointer' }}>
                      💾 Save draft
                    </button>
                    <button onClick={handleSchedule} disabled={!scheduleDate || !scheduleTime}
                      style={{ flex:2, padding:'9px 0', background:(!scheduleDate||!scheduleTime)?'var(--border)':'rgba(139,92,246,0.18)', border:`1px solid ${(!scheduleDate||!scheduleTime)?'var(--border)':'rgba(139,92,246,0.4)'}`, borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:(!scheduleDate||!scheduleTime)?'var(--text-muted)':'#A78BFA', cursor:(!scheduleDate||!scheduleTime)?'not-allowed':'pointer' }}>
                      ⏰ SIGN & LOCK LAUNCH
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
