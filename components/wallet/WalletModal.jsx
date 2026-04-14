'use client';
import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';

// Detect mobile browser (not in a wallet's in-app browser)
function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Detect if we're already inside a wallet's in-app browser
function isInWalletBrowser() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Phantom|Solflare|Backpack|Coinbase/i.test(ua) ||
         !!window.phantom?.solana ||
         !!window.solflare;
}

// Build a Phantom deep link that opens the current site inside Phantom's in-app browser
function phantomDeepLink() {
  if (typeof window === 'undefined') return '#';
  const url = window.location.href;
  // Phantom universal link — opens app if installed, else App Store / Play Store
  return `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(window.location.origin)}`;
}

function solflareDeepLink() {
  if (typeof window === 'undefined') return '#';
  const url = window.location.href;
  return `https://solflare.com/ul/v1/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(window.location.origin)}`;
}

// Install / homepage URLs for wallets that aren't detected
const INSTALL_URLS = {
  'Phantom':         'https://phantom.app/download',
  'Solflare':        'https://solflare.com/download',
  'Backpack':        'https://backpack.app/download',
  'Coinbase Wallet': 'https://www.coinbase.com/wallet/downloads',
  'Ledger':          'https://www.ledger.com/ledger-live',
  'Glow':            'https://glow.app/download',
  'Trust':           'https://trustwallet.com/download',
  'Exodus':          'https://www.exodus.com/download',
  'MetaMask':        'https://metamask.io/download/',
};

export default function WalletModal({ onClose, onConnected }) {
  const { select, connect, connecting, connected, publicKey, wallet, wallets } = useWallet();
  const [phase, setPhase] = useState('select');
  const [chosen, setChosen] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  const mobile = useMemo(isMobile, []);
  const inWalletBrowser = useMemo(isInWalletBrowser, []);

  // Group wallets. Only Installed == actual extension present.
  // Loadable means the adapter is loaded but the wallet isn't installed
  // (calling connect() on Loadable Phantom redirects to phantom.com),
  // so on desktop we show it as "install". On mobile, Loadable + Phantom/Solflare
  // can open the app via universal link, so we still expose it as "Open app".
  const { installed, available } = useMemo(() => {
    const inst = [];
    const avail = [];
    for (const w of wallets || []) {
      const state = w.readyState;
      if (state === WalletReadyState.Installed) {
        inst.push(w);
      } else if (state === WalletReadyState.Loadable || state === WalletReadyState.NotDetected) {
        avail.push(w);
      }
    }
    return { installed: inst, available: avail };
  }, [wallets]);

  useEffect(() => {
    if (connected && publicKey) {
      const addr = publicKey.toBase58();
      const short = addr.slice(0, 4) + '...' + addr.slice(-4);
      onConnected({
        status: 'connected',
        address: addr,
        short,
        balance: 0,
        adapter: wallet?.adapter?.name || 'Unknown',
        error: null,
      });
      onClose();
    }
  }, [connected, publicKey, onConnected, onClose, wallet?.adapter?.name]);

  const handlePick = async (w) => {
    const name = w.adapter.name;
    setChosen({ label: name, icon: w.adapter.icon });

    // If not actually installed, don't call connect() — it redirects to the
    // wallet's marketing site instead of popping the extension.
    if (w.readyState !== WalletReadyState.Installed) {
      // Mobile: deep link into the wallet's in-app browser for wallets that
      // support universal links.
      if (mobile && !inWalletBrowser) {
        if (name === 'Phantom') { window.location.href = phantomDeepLink(); return; }
        if (name === 'Solflare') { window.location.href = solflareDeepLink(); return; }
      }
      // Desktop (or unsupported mobile deep link): open install page in new tab.
      const installUrl = INSTALL_URLS[name];
      if (installUrl) {
        window.open(installUrl, '_blank', 'noopener,noreferrer');
      } else {
        setErrMsg(`${name} extension not installed.`);
        setPhase('error');
      }
      return;
    }

    setPhase('connecting');
    try {
      select(name);
      await connect();
    } catch (err) {
      const msg = err?.message?.includes('not found') || err?.name === 'WalletNotReadyError'
        ? `${name} not installed. Install it from the browser extension store.`
        : (err?.message || 'Wallet rejected the connection.');
      setErrMsg(msg);
      setPhase('error');
    }
  };

  const renderWalletButton = (w, isInstalled) => {
    const name = w.adapter.name;
    const icon = w.adapter.icon;
    return (
      <button key={name} onClick={() => handlePick(w)}
        style={{ display:'flex', alignItems:'center', gap:12, background:'var(--panel-alt)', border:'1px solid #1d2540', borderRadius:8, padding:'13px 14px', cursor:'pointer', transition:'border-color 0.12s', width:'100%', textAlign:'left' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='#7C3AED'}
        onMouseLeave={e => e.currentTarget.style.borderColor='#1d2540'}>
        {icon
          ? <img src={icon} alt="" style={{ width:22, height:22, borderRadius:4 }}/>
          : <span style={{ fontSize:20, lineHeight:1 }}>👛</span>}
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, color:'var(--text)' }}>{name}</span>
        <span style={{ marginLeft:'auto', fontSize:10, color: isInstalled ? '#10B981' : 'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>
          {isInstalled ? 'DETECTED' : (mobile ? 'OPEN APP' : 'INSTALL')}
        </span>
      </button>
    );
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'var(--overlay)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)', animation:'fadeUp 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--panel)', border:'1px solid #252848', borderRadius:12, width:'100%', maxWidth:360, padding:'24px 20px', animation:'slideUp 0.18s ease', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)' }}>Connect wallet</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>
              Solana · no KYC · no accounts
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, lineHeight:1, padding:4 }}>✕</button>
        </div>

        {phase === 'select' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {installed.length > 0 && (
              <>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'0.08em', marginBottom:2 }}>
                  DETECTED
                </div>
                {installed.map(w => renderWalletButton(w, true))}
              </>
            )}

            {available.length > 0 && (
              <>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'0.08em', marginTop:installed.length ? 10 : 0, marginBottom:2 }}>
                  {mobile ? 'OPEN IN APP' : 'INSTALL'}
                </div>
                {available.map(w => renderWalletButton(w, false))}
              </>
            )}

            {installed.length === 0 && available.length === 0 && (
              <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", textAlign:'center', padding:'20px 0' }}>
                No Solana wallets detected. Install Phantom, Solflare, or Backpack to continue.
              </div>
            )}

            <div style={{ marginTop:8, fontSize:10, color:'var(--bar-empty)', fontFamily:"'IBM Plex Mono',monospace", textAlign:'center', lineHeight:1.7 }}>
              By connecting you agree Mammoth is a permissionless protocol.<br/>No endorsements. Not financial advice.
            </div>
          </div>
        )}

        {phase === 'connecting' && (
          <div style={{ textAlign:'center', padding:'24px 0', animation:'fadeUp 0.15s ease' }}>
            {chosen?.icon
              ? <img src={chosen.icon} alt="" style={{ width:40, height:40, borderRadius:8, marginBottom:16 }}/>
              : <div style={{ fontSize:32, marginBottom:16 }}>👛</div>}
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
