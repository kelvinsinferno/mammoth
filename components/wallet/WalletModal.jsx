'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const SUPPORTED_WALLETS = [
  { id: 'Phantom',  label: 'Phantom',  icon: '👻' },
  { id: 'Solflare', label: 'Solflare', icon: '☀️' },
];

export default function WalletModal({ onClose, onConnected }) {
  const { select, connect, disconnect, connecting, connected, publicKey, wallet, wallets } = useWallet();
  const [phase, setPhase] = useState('select');
  const [chosen, setChosen] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  // When wallet connects successfully, notify parent
  useEffect(() => {
    if (connected && publicKey) {
      const addr = publicKey.toBase58();
      const short = addr.slice(0, 4) + '...' + addr.slice(-4);
      onConnected({
        status: 'connected',
        address: addr,
        short,
        balance: 0, // fetched separately in MammothApp
        adapter: wallet?.adapter?.name || 'Unknown',
        error: null,
      });
      onClose();
    }
  }, [connected, publicKey]);

  const handlePick = async (w) => {
    setChosen(w);
    setPhase('connecting');
    try {
      select(w.id);
      await connect();
    } catch (err) {
      // If wallet not installed, show helpful error
      const msg = err?.message?.includes('not found') || err?.name === 'WalletNotReadyError'
        ? `${w.label} not installed. Install it from the browser extension store.`
        : (err?.message || 'Wallet rejected the connection.');
      setErrMsg(msg);
      setPhase('error');
    }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:360, padding:'24px 20px', animation:'slideUp 0.18s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Connect wallet</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>Solana · no KYC · no accounts</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1, padding:4 }}>✕</button>
        </div>

        {phase === 'select' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {SUPPORTED_WALLETS.map(w => (
              <button key={w.id} onClick={() => handlePick(w)}
                style={{ display:'flex', alignItems:'center', gap:12, background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:8, padding:'13px 14px', cursor:'pointer', transition:'border-color 0.12s', width:'100%', textAlign:'left' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#7C3AED'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                <span style={{ fontSize:20, lineHeight:1 }}>{w.icon}</span>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, color:'var(--text)' }}>{w.label}</span>
                <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>→</span>
              </button>
            ))}
            <div style={{ marginTop:8, fontSize:10, color:'var(--bar-empty)', fontFamily:"'IBM Plex Mono',monospace", textAlign:'center', lineHeight:1.7 }}>
              By connecting you agree Mammoth is a permissionless protocol.<br/>No endorsements. Not financial advice.
            </div>
          </div>
        )}

        {phase === 'connecting' && (
          <div style={{ textAlign:'center', padding:'24px 0', animation:'fadeUp 0.15s ease' }}>
            <div style={{ fontSize:32, marginBottom:16 }}>{chosen?.icon}</div>
            <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #252848', borderTopColor:'#8B5CF6', animation:'spin 0.7s linear infinite', margin:'0 auto 16px' }}/>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, color:'var(--text)', marginBottom:6 }}>Connecting to {chosen?.label}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>Approve in your wallet</div>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ animation:'fadeUp 0.15s ease' }}>
            <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'14px', marginBottom:16, textAlign:'center' }}>
              <div style={{ fontSize:13, color:'#F43F5E', fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, marginBottom:4 }}>Connection failed</div>
              <div style={{ fontSize:11, color:'rgba(248,113,113,0.7)', fontFamily:"'IBM Plex Mono',monospace" }}>{errMsg}</div>
            </div>
            <button onClick={() => setPhase('select')}
              style={{ width:'100%', padding:'11px 0', background:'#8B5CF6', color:'#fff', border:'none', borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, cursor:'pointer', letterSpacing:'0.04em' }}>
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
