'use client';

export default function AccountDropdown({ walletState, onDisconnect, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:150 }}>
      <div onClick={e => e.stopPropagation()} style={{ position:'absolute', top:58, right:16, background:'var(--panel)', border:'1px solid #252848', borderRadius:10, width:240, padding:'16px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)', animation:'fadeUp 0.15s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:14, borderBottom:'1px solid #1d2540' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7C3AED,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:14 }}>◉</span>
          </div>
          <div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:'var(--text)', fontWeight:600 }}>{walletState.short}</div>
            <div style={{ fontSize:10, color:'var(--text-dim)', fontFamily:"'IBM Plex Mono',monospace", marginTop:1 }}>{walletState.adapter}</div>
          </div>
        </div>
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:7, padding:'10px 12px', marginBottom:14 }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>balance</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:16, color:'var(--text)' }}>
            {walletState.balance?.toFixed(3)} <span style={{ fontSize:11, color:'var(--text-dim)', fontWeight:400 }}>SOL</span>
          </div>
        </div>
        {[
          { label:'Copy address', action: () => { navigator.clipboard?.writeText(walletState.address || ''); onClose(); } },
          { label:'View on explorer', action: onClose },
        ].map(({ label, action }, i) => (
          <button key={i} onClick={action}
            style={{ width:'100%', display:'block', background:'none', border:'none', textAlign:'left', padding:'9px 4px', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-dim)', cursor:'pointer', borderBottom:'1px solid #1a2438', transition:'color 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.color='#22D3EE'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-dim)'}>
            {label}
          </button>
        ))}
        <button onClick={() => { onDisconnect(); onClose(); }}
          style={{ width:'100%', marginTop:12, padding:'9px 0', background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#F43F5E', cursor:'pointer', fontWeight:600, letterSpacing:'0.04em' }}>
          DISCONNECT
        </button>
      </div>
    </div>
  );
}
