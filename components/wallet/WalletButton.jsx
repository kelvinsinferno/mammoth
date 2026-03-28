'use client';
import { useState } from 'react';
import AccountDropdown from './AccountDropdown';

export default function WalletButton({ walletState, onOpenModal, onDisconnect }) {
  const [dropOpen, setDropOpen] = useState(false);
  const connected = walletState.status === 'connected';

  return (
    <>
      <button onClick={() => connected ? setDropOpen(d => !d) : onOpenModal()} className="wallet-btn-inner"
        style={{
          background: connected ? 'rgba(34,211,238,0.08)' : 'linear-gradient(135deg,#7C3AED,#8B5CF6)',
          color: connected ? '#22D3EE' : '#fff',
          border: connected ? '1px solid rgba(34,211,238,0.3)' : 'none',
          borderRadius: 6,
          padding: '6px 12px',
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 11,
          cursor: 'pointer',
          fontWeight: 600,
          letterSpacing: '0.04em',
          transition: 'all 0.13s',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
          maxWidth: '140px',
          overflow: 'hidden',
          minHeight: 36,
          flexShrink: 0,
        }}>
        {connected && (
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#22D3EE', display:'inline-block', flexShrink:0, animation:'blink 2s ease-in-out infinite' }}/>
        )}
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {connected ? walletState.short : 'CONNECT'}
        </span>
        {connected && <span style={{ fontSize:9, opacity:0.6, flexShrink:0 }}>▾</span>}
      </button>
      {dropOpen && connected && (
        <AccountDropdown walletState={walletState} onDisconnect={onDisconnect} onClose={() => setDropOpen(false)}/>
      )}
    </>
  );
}
