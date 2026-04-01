'use client';
import { useState } from 'react';

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(6px)' },
  modal: { background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:520, padding:'24px 20px', maxHeight:'90vh', overflowY:'auto', animation:'slideUp 0.18s ease' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 },
  titleBlock: {},
  title: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:2 },
  sub: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' },
  closeBtn: { background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, flexShrink:0 },
  infoBox: { background:'rgba(34,211,238,0.05)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:20 },
  infoText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#22D3EE', lineHeight:1.8 },
  warnBox: { background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:8, padding:'10px 14px', marginBottom:20 },
  warnText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#F59E0B', lineHeight:1.75 },
  label: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6, display:'block' },
  input: { width:'100%', background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'10px 12px', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', outline:'none', boxSizing:'border-box', marginBottom:16 },
  section: { background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:9, padding:'16px 16px', marginBottom:16 },
  sectionTitle: { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'#A78BFA', marginBottom:12, marginTop:0 },
  permRow: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:12 },
  permInfo: { flex:1 },
  permName: { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:2 },
  permDesc: { fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)', lineHeight:1.65 },
  toggle: (on) => ({ width:36, height:20, borderRadius:10, background: on ? '#8B5CF6' : '#1d2540', border:`1px solid ${on ? '#A78BFA' : '#2d3560'}`, position:'relative', cursor:'pointer', transition:'all 0.18s', flexShrink:0 }),
  toggleDot: (on) => ({ position:'absolute', top:2, left: on ? 18 : 2, width:14, height:14, borderRadius:'50%', background: on ? '#fff' : '#4a5070', transition:'all 0.18s' }),
  dangerToggle: (on) => ({ width:36, height:20, borderRadius:10, background: on ? '#EF4444' : '#1d2540', border:`1px solid ${on ? '#F87171' : '#2d3560'}`, position:'relative', cursor:'pointer', transition:'all 0.18s', flexShrink:0 }),
  spendRow: { marginBottom:16 },
  spendInput: { width:'100%', background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'10px 12px', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text)', outline:'none', boxSizing:'border-box' },
  btnRow: { display:'flex', gap:8, marginTop:4 },
  cancelBtn: { flex:1, background:'transparent', border:'1px solid #1d2540', borderRadius:8, padding:'11px', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color:'var(--text-muted)', cursor:'pointer' },
  saveBtn: { flex:1, background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', borderRadius:8, padding:'11px', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, color:'#fff', border:'none', cursor:'pointer' },
  savedBox: { background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:8, padding:'12px 14px', textAlign:'center', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#10B981' },
};

function Toggle({ on, onChange, danger }) {
  return (
    <div onClick={() => onChange(!on)} style={danger ? S.dangerToggle(on) : S.toggle(on)}>
      <div style={S.toggleDot(on)} />
    </div>
  );
}

export default function ConfigureAgentModal({ project, onClose }) {
  const [operatorAddress, setOperatorAddress] = useState('');
  const [canOpenCycle, setCanOpenCycle] = useState(true);
  const [canCloseCycle, setCanCloseCycle] = useState(false);
  const [canSetHardCap, setCanSetHardCap] = useState(false);
  const [canRouteTreasury, setCanRouteTreasury] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState('0');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!operatorAddress || operatorAddress.length < 32) {
      setError('Enter a valid Solana wallet address for the operator.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      // TODO: wire to initializeAuthority / updateAuthority Anchor instruction (TASK-AI-004 Anchor rebuild)
      // For now: save config to localStorage so the UI reflects the intent
      const config = {
        projectMint: project.mint || project.id,
        operator: operatorAddress,
        canOpenCycle,
        canCloseCycle,
        canSetHardCap,
        canRouteTreasury,
        spendingLimitLamports: Math.round(parseFloat(spendingLimit || '0') * 1e9),
        savedAt: Date.now(),
      };
      const existing = JSON.parse(localStorage.getItem('mammoth_authority_configs') || '{}');
      existing[project.mint || project.id] = config;
      localStorage.setItem('mammoth_authority_configs', JSON.stringify(existing));

      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 2000);
    } catch (e) {
      setError('Failed to save configuration. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const perms = [
    {
      key: 'canOpenCycle',
      label: 'can_open_cycle',
      desc: 'Operator can call open_cycle autonomously — start new raises without your approval each time.',
      value: canOpenCycle,
      set: setCanOpenCycle,
      danger: false,
    },
    {
      key: 'canCloseCycle',
      label: 'can_close_cycle',
      desc: 'Operator can close active cycles autonomously — e.g. when a fill threshold is met.',
      value: canCloseCycle,
      set: setCanCloseCycle,
      danger: false,
    },
    {
      key: 'canRouteTreasury',
      label: 'can_route_treasury',
      desc: 'Operator can configure treasury routing split when opening a cycle.',
      value: canRouteTreasury,
      set: setCanRouteTreasury,
      danger: false,
    },
    {
      key: 'canSetHardCap',
      label: 'can_set_hard_cap',
      desc: 'Operator can permanently set the hard cap. IRREVERSIBLE — grant only if you\'re certain.',
      value: canSetHardCap,
      set: setCanSetHardCap,
      danger: true,
    },
  ];

  return (
    <div onClick={onClose} style={S.overlay}>
      <div onClick={e => e.stopPropagation()} style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.titleBlock}>
            <div style={S.title}>Configure Agent Access</div>
            <div style={S.sub}>{project.name} · ${project.ticker}</div>
          </div>
          <button onClick={onClose} style={S.closeBtn}>✕</button>
        </div>

        {/* Info */}
        <div style={S.infoBox}>
          <div style={S.infoText}>
            Delegate specific operations to an AI agent or operator wallet. The agent will only be able to call the instructions you explicitly allow — nothing more. You remain the principal and can update or revoke this at any time.
          </div>
        </div>

        {/* Operator address */}
        <label style={S.label}>Operator Wallet Address</label>
        <input
          style={S.input}
          placeholder="Solana wallet address (base58)"
          value={operatorAddress}
          onChange={e => setOperatorAddress(e.target.value)}
        />

        {/* Permissions */}
        <div style={S.section}>
          <p style={S.sectionTitle}>Permissions</p>
          {perms.map(p => (
            <div key={p.key} style={S.permRow}>
              <div style={S.permInfo}>
                <div style={S.permName}>{p.label}</div>
                <div style={S.permDesc}>{p.desc}</div>
              </div>
              <Toggle on={p.value} onChange={p.set} danger={p.danger} />
            </div>
          ))}
        </div>

        {/* Spending limit */}
        <div style={S.section}>
          <p style={S.sectionTitle}>Spending Limit</p>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', lineHeight:1.75, marginBottom:10 }}>
            Maximum SOL the operator can raise per cycle before the instruction is blocked. Set to 0 for no limit.
          </div>
          <label style={S.label}>Max SOL per cycle (0 = unlimited)</label>
          <input
            style={S.spendInput}
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            value={spendingLimit}
            onChange={e => setSpendingLimit(e.target.value)}
          />
        </div>

        {/* Hard cap warning */}
        {canSetHardCap && (
          <div style={S.warnBox}>
            <div style={S.warnText}>
              ⚠️ You have enabled <strong>can_set_hard_cap</strong>. This allows the operator to permanently fix your token supply. This action is irreversible on-chain. Only enable this if you explicitly want the agent to have this authority.
            </div>
          </div>
        )}

        {error && (
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#EF4444', marginBottom:12 }}>{error}</div>
        )}

        {saved ? (
          <div style={S.savedBox}>✓ Agent access configured · Changes will be enforced on-chain after next Anchor deploy</div>
        ) : (
          <div style={S.btnRow}>
            <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
