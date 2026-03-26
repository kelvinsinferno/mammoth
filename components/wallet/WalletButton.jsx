'use client';
import { useState } from 'react';
import AccountDropdown from './AccountDropdown';

export default function WalletButton({ walletState, onOpenModal, onDisconnect }) {
  const [dropOpen, setDropOpen] = useState(false);
  const connected = walletState.status === 'connected';

  return (
    <>
      <button onClick={() => connected ? setDropOpen(d => !d) : onOpenModal()}
        style={{ background:connected?'rgba(34,211,238,0.08)':'linear-gradient(135deg,#7C3AED,#8B5CF6)', color:connected?'#22D3EE':'#fff', border:connected?'1px solid rgba(34,211,238,0.3)':'none', borderRadius:6, padding:'6px 13px', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, cursor:'pointer', fontWeight:600, letterSpacing:'0.04em', transition:'all 0.13s', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
        {connected && <span style={{ width:6, height:6, borderRadius:'50%', background:'#22D3EE', display:'inline-block', animation:'blink 2s ease-in-out infinite' }}/>}
        {connected ? walletState.short : 'CONNECT'}
        {connected && <span style={{ fontSize:9, opacity:0.6 }}>▾</span>}
      </button>
      {dropOpen && connected && (
        <AccountDropdown walletState={walletState} onDisconnect={onDisconnect} onClose={() => setDropOpen(false)}/>
      )}
    </>
  );
}
