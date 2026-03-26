'use client';
import { useState } from 'react';
// lib/utils imports: add here when validation helpers are needed

export default function LaunchWizard({ onClose, onLaunch, walletState, theme }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', ticker: '', description: '', website: '', twitter: '', discord: '', image: null, imagePreview: null,
    supplyMode: 'elastic', initialAllocation: 1000000, hardCapSupply: 0, curveType: 'bonding', startPrice: 0.001,
    stepSize: 5000, stepIncrement: 0.00022, creatorAlloc: 10, treasuryAlloc: 15, protocolFee: 2,
  });
  const [errors, setErrors] = useState({});
  const [txState, setTxState] = useState('idle');

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

  const handleLaunch = async () => {
    if (!validate()) return;
    if (!walletState.status === 'connected') {
      setErrors({ form:'Connect wallet first' });
      return;
    }
    setTxState('awaiting');
    try {
      setTxState('loading');
      await new Promise(r => setTimeout(r, 2000));
      const newProject = {
        id: Math.floor(Math.random()*10000),
        name: formData.name,
        ticker: formData.ticker.toUpperCase(),
        description: formData.description,
        creator: walletState.short || 'anon',
        image: formData.imagePreview,
        supplyMode: formData.supplyMode,
        totalSupply: formData.supplyMode==='fixed'?formData.hardCapSupply:formData.initialAllocation,
        status: 'ACTIVE',
        price: formData.startPrice,
        change: 0,
        volume: 0,
        raised: '0 SOL',
        progress: 0,
        sparkline: Array(12).fill(0).map(() => formData.startPrice * (0.95 + Math.random()*0.1)),
      };
      setTxState('success');
      setTimeout(() => onLaunch?.(newProject), 1500);
    } catch(e) {
      setErrors({ form:e.message||'Failed to launch' });
      setTxState('error');
    }
  };

  const isProcessing = txState === 'awaiting' || txState === 'loading';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease', overflow:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:500, padding:'24px 20px', animation:'slideUp 0.18s ease', maxHeight:'90vh', overflowY:'auto' }}>
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
                    style={{ width:'100%', background:'var(--panel-alt)', border:errors[f.name]?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", resize:'none', outline:'none', opacity:isProcessing?0.6:1 }}
                    onFocus={e => e.currentTarget.style.borderColor='#8B5CF6'}
                    onBlur={e => e.currentTarget.style.borderColor=errors[f.name]?'#F43F5E':'var(--border)'}/>
                ) : (
                  <input type="text" name={f.name} value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder}
                    style={{ width:'100%', background:'var(--panel-alt)', border:errors[f.name]?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none', opacity:isProcessing?0.6:1 }}
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
                    style={{ width:'100%', background:'var(--panel-alt)', border:errors[f.name]?'1px solid #F43F5E':'1px solid var(--border)', borderRadius:6, padding:'9px 12px 9px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none', opacity:isProcessing?0.6:1 }}
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

        {isProcessing && (
          <div style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'12px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid #252848', borderTopColor:'#8B5CF6', animation:'spin 0.7s linear infinite', flexShrink:0 }}/>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#22D3EE', fontWeight:600 }}>Launching token on-chain...</div>
          </div>
        )}

        <div style={{ display:'flex', gap:8, marginTop:18 }}>
          {step > 1 && (
            <button onClick={() => setStep(step-1)} disabled={isProcessing}
              style={{ flex:1, padding:'11px 0', background:'transparent', border:'1px solid var(--border)', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'var(--text-dim)', cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1 }}>
              BACK
            </button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} disabled={isProcessing}
              style={{ flex:1, padding:'11px 0', background:'#8B5CF6', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1 }}>
              NEXT
            </button>
          ) : (
            <button onClick={handleLaunch} disabled={isProcessing}
              style={{ flex:1, padding:'11px 0', background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:'#fff', cursor:isProcessing?'not-allowed':'pointer', opacity:isProcessing?0.5:1 }}>
              LAUNCH
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
