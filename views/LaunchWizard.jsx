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
  // If data already carries an id (i.e. we're editing an existing draft),
  // update it in place instead of creating a duplicate.
  if (data.id != null) {
    const idx = drafts.findIndex(d => d.id === data.id);
    const updated = { ...(idx >= 0 ? drafts[idx] : {}), ...data, savedAt: new Date().toISOString() };
    if (idx >= 0) drafts[idx] = updated;
    else drafts.unshift(updated);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 20)));
    return updated;
  }
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
    name: '', ticker: '', description: '', website: '', twitter: '', telegram: '', discord: '', github: '', farcaster: '', youtube: '', docs: '', image: null, imagePreview: null,
    supplyMode: 'elastic', initialAllocation: 1000000, hardCapSupply: 0, curveType: 'linear', startPrice: 0.001,
    stepSize: 5000, stepIncrement: 0.00022, endPrice: 0.01, expMultiplier: 10,
    creatorAlloc: 70, treasuryAlloc: 20, burnAlloc: 8, protocolFee: 2,
    visibility: 'public', goPublicDate: '', goPublicTime: '',
    // Pre-fill from draft if provided — restore every user-editable field
    ...(initialData ? {
      name: initialData.name ?? '',
      ticker: initialData.ticker ?? '',
      description: initialData.description ?? '',
      supplyMode: initialData.supplyMode ?? 'elastic',
      initialAllocation: initialData.initialAllocation ?? 1000000,
      hardCapSupply: initialData.hardCapSupply ?? 0,
      curveType: initialData.curveType ?? 'linear',
      startPrice: initialData.startPrice ?? 0.001,
      creatorAlloc: initialData.creatorAlloc ?? 70,
      treasuryAlloc: initialData.treasuryAlloc ?? 20,
      burnAlloc: initialData.burnAlloc ?? 8,
      protocolFee: initialData.protocolFee ?? 2,
      visibility: initialData.visibility ?? 'public',
      goPublicDate: initialData.goPublicDate ?? '',
      goPublicTime: initialData.goPublicTime ?? '',
    } : {}),
  }));
  const [errors, setErrors] = useState({});
  const [txState, setTxState] = useState('idle');
  // Id of the draft currently being edited (if any). Reusing it on save
  // keeps subsequent saves as updates instead of creating duplicates.
  const [draftId, setDraftId] = useState(initialData?.id ?? null);
  const [launchMode, setLaunchMode] = useState(initialData?.launchMode || 'now'); // 'now' | 'draft' | 'schedule'
  const [scheduleDate, setScheduleDate] = useState(initialData?.scheduleDate || '');
  const [scheduleTime, setScheduleTime] = useState(initialData?.scheduleTime || '');
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
      // Already signed & locked — jump to the countdown view.
      setLaunchMode('schedule');
      setTxState('scheduled');
      const d = new Date(initialData.scheduledFor);
      setScheduleDate(d.toISOString().split('T')[0]);
      setScheduleTime(d.toTimeString().slice(0, 5));
      setStep(3);
    }
    // Otherwise resume at step 1 regardless of launchMode, so the user
    // can review all fields before signing.
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
    const missing = [];
    if (!formData.name?.trim()) { errs.name = 'Required'; missing.push('token name'); }
    else if (formData.name.length > 32) errs.name = 'Max 32 chars';
    if (!formData.ticker?.trim()) { errs.ticker = 'Required'; missing.push('ticker'); }
    else if (!/^[A-Z0-9]{1,6}$/.test(formData.ticker.toUpperCase())) errs.ticker = '1–6 alphanumeric';
    if (!formData.description?.trim()) { errs.description = 'Required'; missing.push('description'); }
    else if (formData.description.length < 20) errs.description = 'Min 20 chars';
    if (!formData.supplyMode) { errs.supplyMode = 'Pick supply mode'; missing.push('supply mode'); }
    if (!formData.curveType) { errs.curveType = 'Pick a curve'; missing.push('curve type'); }
    if (formData.supplyMode === 'fixed' && (!formData.hardCapSupply || formData.hardCapSupply <= 0)) {
      errs.hardCapSupply = 'Required for fixed mode'; missing.push('hard cap supply');
    }
    if (formData.startPrice <= 0) { errs.startPrice = 'Must be > 0'; missing.push('start price'); }
    if (formData.initialAllocation <= 0) { errs.initialAllocation = 'Must be > 0'; missing.push('initial allocation'); }
    const totalAlloc = Number(formData.creatorAlloc) + Number(formData.treasuryAlloc) + Number(formData.burnAlloc) + 2;
    if (totalAlloc > 100) errs.creatorAlloc = `Allocations total ${totalAlloc}% — must be ≤ 100%`;
    if (missing.length) {
      errs.form = missing.length === 1
        ? `Missing: ${missing[0]}`
        : `Missing: ${missing.slice(0, -1).join(', ')} and ${missing.slice(-1)}`;
    } else if (Object.keys(errs).length) {
      errs.form = 'Fix the highlighted fields';
    }
    setErrors(errs);
    return missing.length === 0 && Object.keys(errs).filter(k => k !== 'form').length === 0;
  };

  // Next advances unconditionally — validation only fires when the user
  // actually tries to Launch or Sign & Lock.
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSaveDraft = () => {
    if (!formData.name?.trim()) { setErrors({ form: 'Add a token name before saving' }); return; }
    const saved = saveDraft({ id: draftId ?? undefined, ...formData, launchMode, scheduleDate, scheduleTime });
    if (!draftId) setDraftId(saved.id);
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
      saveDraft({ id: draftId ?? undefined, ...formData, launchMode, scheduleDate, scheduleTime, scheduledFor: launchAt.toISOString(), mint: deployResult.mint, deployed: true });
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

      const goPublicAt = formData.visibility === 'scheduled' && formData.goPublicDate
        ? new Date(`${formData.goPublicDate}T${formData.goPublicTime || '00:00'}`).toISOString()
        : null;
      const newProject = {
        id: deployResult.mint,
        mint: deployResult.mint,
        name: formData.name,
        ticker: formData.ticker.toUpperCase(),
        description: formData.description,
        website: formData.website, twitter: formData.twitter, telegram: formData.telegram,
        discord: formData.discord, github: formData.github, farcaster: formData.farcaster,
        youtube: formData.youtube, docs: formData.docs,
        creator: walletState.short || 'anon',
        image: formData.imagePreview,
        supplyMode: formData.supplyMode,
        totalSupply: formData.supplyMode === 'fixed' ? formData.hardCapSupply : formData.initialAllocation,
        status: goPublicAt && new Date(goPublicAt) > new Date() ? 'COMING_SOON' : 'BETWEEN',
        goPublicAt,
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

            {/* Token image */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Token image <span style={{ fontWeight:400, color:'var(--text-muted)' }}>— optional</span></label>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {/* Preview */}
                <div style={{ width:56, height:56, borderRadius:10, background:'var(--panel-alt)', border:'1px solid var(--border)', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {formData.imagePreview
                    ? <img src={formData.imagePreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <span style={{ fontSize:22 }}>🦣</span>
                  }
                </div>
                {/* Upload area */}
                <label style={{ flex:1, cursor:'pointer' }}>
                  <div style={{ border:'1px dashed var(--border)', borderRadius:7, padding:'10px 14px', textAlign:'center', transition:'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#A78BFA', fontWeight:600, marginBottom:3 }}>
                      {formData.imagePreview ? '↑ Replace image' : '↑ Upload image or GIF'}
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>PNG, JPG, GIF · Max 5MB</div>
                  </div>
                  <input type="file" accept="image/*,image/gif" onChange={handleImageUpload} style={{ display:'none' }}/>
                </label>
                {/* Clear button */}
                {formData.imagePreview && (
                  <button onClick={() => setFormData(prev => ({ ...prev, image:null, imagePreview:null }))}
                    style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16, padding:4, flexShrink:0 }}>✕</button>
                )}
              </div>
            </div>

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
              {(() => {
                const icons = {
                  website: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93V18c0-.552-.448-1-1-1H8c-1.105 0-2-.895-2-2v-1c0-1.105.895-2 2-2h1c.552 0 1-.448 1-1v-1c0-.552.448-1 1-1h.5c.276 0 .5-.224.5-.5V8c0-.276-.224-.5-.5-.5H10c-.552 0-1-.448-1-1V4.07A8.003 8.003 0 0 1 12 4c1.48 0 2.86.402 4.05 1.1L14 7c-.552 0-1 .448-1 1v1c0 .552.448 1 1 1h2c.552 0 1 .448 1 1v1c0 .552-.448 1-1 1h-1c-.552 0-1 .448-1 1v3.93A8.003 8.003 0 0 1 11 19.93z"/></svg>,
                  twitter: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                  telegram: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
                  discord: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.036.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
                  github: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
                  farcaster: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24.24H5.76A5.76 5.76 0 0 0 0 6v12a5.76 5.76 0 0 0 5.76 5.76h12.48A5.76 5.76 0 0 0 24 18V6A5.76 5.76 0 0 0 18.24.24zm.816 17.166v.504h-2.208v-6.814l-2.256 5.23h-1.171l-2.25-5.23v6.814H8.96v-.504l.023-8.772H11.2l2.52 5.833 2.52-5.833h2.17l.024 8.35-.023.422z"/></svg>,
                  youtube: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
                  docs: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>,
                };
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {[
                      { name:'website',   placeholder:'https://yourproject.xyz' },
                      { name:'twitter',   placeholder:'https://x.com/yourproject' },
                      { name:'telegram',  placeholder:'https://t.me/yourproject' },
                      { name:'discord',   placeholder:'https://discord.gg/yourproject' },
                      { name:'github',    placeholder:'https://github.com/yourproject' },
                      { name:'farcaster', placeholder:'https://warpcast.com/yourproject' },
                      { name:'youtube',   placeholder:'https://youtube.com/@yourproject' },
                      { name:'docs',      placeholder:'https://docs.yourproject.xyz' },
                    ].map(f => (
                      <div key={f.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', flexShrink:0 }}>{icons[f.name]}</span>
                        <input type="url" name={f.name} value={formData[f.name] || ''} onChange={handleChange} placeholder={f.placeholder}
                          style={{ flex:1, background:'var(--panel)', border:'1px solid var(--border)', borderRadius:5, padding:'7px 10px', color:'var(--text)', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
                          onFocus={e => { e.currentTarget.style.borderColor='#8B5CF6'; e.currentTarget.previousSibling.style.color='#8B5CF6'; }}
                          onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.previousSibling.style.color='var(--text-muted)'; }}/>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
            {formData.supplyMode === 'fixed' && (
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Hard cap supply</label>
                <div style={{ position:'relative' }}>
                  <input type="number" name="hardCapSupply" value={formData.hardCapSupply} onChange={handleChange} step={1}
                    style={{ width:'100%', background:'var(--panel-alt)', border:errors.hardCapSupply?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 52px 9px 12px', color:'var(--text)', fontSize:14, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:44 }}
                    onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onBlur={e => e.currentTarget.style.borderColor=errors.hardCapSupply?'#F43F5E':'var(--border)'}/>
                  <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-dim)' }}>tokens</span>
                </div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>Total tokens that can ever exist.</div>
              </div>
            )}

            {/* ── Schedule Launch (single unified toggle) ── */}
            <div style={{ background:'var(--panel-alt)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px' }}>
              <button type="button"
                onClick={() => {
                  const turningOn = launchMode !== 'schedule';
                  setLaunchMode(turningOn ? 'schedule' : 'now');
                  handleChange({ target:{ name:'visibility', value: turningOn ? 'scheduled' : 'public' } });
                }}
                style={{ width:'100%', padding:'11px 14px', background:launchMode==='schedule'?'rgba(139,92,246,0.12)':'var(--panel)', border:`1px solid ${launchMode==='schedule'?'#8B5CF6':'var(--border)'}`, borderRadius:7, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, color:launchMode==='schedule'?'#A78BFA':'var(--text)', letterSpacing:'0.04em', transition:'all 0.12s' }}>
                <span style={{ fontSize:14 }}>⏰</span>
                <span>{launchMode==='schedule' ? 'SCHEDULE LAUNCH (ON)' : 'SCHEDULE LAUNCH'}</span>
              </button>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', lineHeight:1.6, textAlign:'center', marginTop:6 }}>
                {launchMode==='schedule'
                  ? 'Signs & locks the token now; launch and reveal happen automatically at your chosen times.'
                  : 'Off = launches immediately on sign. Toggle to set launch + reveal times.'}
              </div>

              {launchMode === 'schedule' && (
                <div style={{ animation:'fadeUp 0.15s ease', marginTop:12 }}>
                  {/* Launch date/time */}
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#A78BFA', fontWeight:700, marginBottom:6, letterSpacing:'0.05em' }}>LAUNCH TIME</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                    <div>
                      <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Launch date</label>
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        onClick={e => e.currentTarget.showPicker?.()}
                        style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', cursor:'pointer', colorScheme: theme === 'light' ? 'light' : 'dark' }}
                        onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                        onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Launch time</label>
                      <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                        onClick={e => e.currentTarget.showPicker?.()}
                        style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', cursor:'pointer', colorScheme: theme === 'light' ? 'light' : 'dark' }}
                        onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                        onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                    </div>
                  </div>

                  {/* Reveal date/time */}
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#A78BFA', fontWeight:700, marginBottom:6, letterSpacing:'0.05em' }}>REVEAL TIME</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', marginBottom:6 }}>
                    When your project becomes visible in "Coming Soon".
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div>
                      <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Reveal date</label>
                      <input type="date" name="goPublicDate" value={formData.goPublicDate} onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        onClick={e => e.currentTarget.showPicker?.()}
                        style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', cursor:'pointer', colorScheme: theme === 'light' ? 'light' : 'dark' }}
                        onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                        onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-dim)', marginBottom:4 }}>Reveal time</label>
                      <input type="time" name="goPublicTime" value={formData.goPublicTime} onChange={handleChange}
                        onClick={e => e.currentTarget.showPicker?.()}
                        style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', cursor:'pointer', colorScheme: theme === 'light' ? 'light' : 'dark' }}
                        onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                        onBlur={e => e.currentTarget.style.borderColor='var(--border)'}/>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              {launchMode === 'schedule' ? (
                <>
                  {/* Schedule mode: all three buttons at bottom */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => setStep(2)} disabled={isProcessing}
                      style={{ padding:'11px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:12, color:'var(--text-dim)', cursor:'pointer', flexShrink:0 }}>
                      ← Back
                    </button>
                    <button onClick={handleSaveDraft} disabled={isProcessing}
                      style={{ padding:'11px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:12, color:'var(--text-dim)', cursor:'pointer', flexShrink:0 }}>
                      💾 Save draft
                    </button>
                    <button onClick={handleSchedule} disabled={isProcessing || !scheduleDate || !scheduleTime}
                      style={{ flex:1, padding:'11px 0', background:(!scheduleDate||!scheduleTime)?'var(--border)':'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:(!scheduleDate||!scheduleTime)?'var(--text-muted)':'#fff', cursor:(!scheduleDate||!scheduleTime||isProcessing)?'not-allowed':'pointer', opacity:isProcessing?0.5:1, minHeight:46 }}>
                      {isProcessing ? 'SIGNING...' : '⏰ SIGN & LOCK LAUNCH'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Normal mode: Launch Now primary + Save draft secondary */}
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
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleSaveDraft}
                      style={{ flex:1, padding:'9px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:11, color:'var(--text-dim)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                      💾 Save draft
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
