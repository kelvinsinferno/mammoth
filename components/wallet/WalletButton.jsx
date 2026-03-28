'use client';
import { useState } from 'react';
import AccountDropdown from './AccountDropdown';
import { useWindowWidth } from '../../lib/useWindowWidth';

export default function WalletButton({ walletState, onOpenModal, onDisconnect }) {
  const [dropOpen, setDropOpen] = useState(false);
  const connected = walletState.status === 'connected';
  const width = useWindowWidth();
  const iconMode = width < 768;

  return (
    <>
      <button
        onClick={() => connected ? setDropOpen(d => !d) : onOpenModal()}
        title={connected ? walletState.short : 'Connect wallet'}
        style={{
          background: connected ? 'rgba(34,211,238,0.08)' : 'linear-gradient(135deg,#7C3AED,#8B5CF6)',
          color: connected ? '#22D3EE' : '#fff',
          border: connected ? '1px solid rgba(34,211,238,0.3)' : 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.13s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          minHeight: 36,
          padding: iconMode ? '0 10px' : '6px 12px',
          gap: iconMode ? 0 : 6,
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 11,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        {iconMode ? (
          // Icon mode: wallet SVG (disconnected) or green dot (connected)
          connected ? (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22D3EE', display: 'inline-block', animation: 'blink 2s ease-in-out infinite' }} />
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 3H5a2 2 0 0 0-2 2v2"/>
              <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          )
        ) : (
          // Full text mode
          <>
            {connected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', display: 'inline-block', flexShrink: 0, animation: 'blink 2s ease-in-out infinite' }} />}
            {connected ? walletState.short : 'CONNECT'}
            {connected && <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>}
          </>
        )}
      </button>

      {dropOpen && connected && (
        <AccountDropdown walletState={walletState} onDisconnect={onDisconnect} onClose={() => setDropOpen(false)} />
      )}
    </>
  );
}
