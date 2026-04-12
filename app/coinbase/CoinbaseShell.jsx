'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../lib/AppContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import WalletButton from '../../components/wallet/WalletButton';
import BrandMark from '../../components/BrandMark';

const TABS = [
  { path: '/coinbase',           icon: '🔍', label: 'Discover'  },
  { path: '/coinbase/portfolio', icon: '📊', label: 'Portfolio' },
  { path: '/coinbase/dashboard', icon: '⚡', label: 'Dashboard' },
];

export default function CoinbaseShell({ children, onOpenModal }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { walletState, setWalletState, theme, toggleTheme } = useApp();

  const isToken = pathname?.startsWith('/coinbase/token/');
  const activeTab = TABS.find(t => t.path === pathname)?.path || '/coinbase';

  return (
    <div style={{ minHeight:'100vh', background:'var(--page-bg)', color:'var(--text)', fontFamily:"'IBM Plex Mono',monospace", display:'flex', flexDirection:'column' }}>

      {/* Top bar */}
      <header style={{ background:'var(--header-bg)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--header-border)', position:'sticky', top:0, zIndex:50, boxShadow:'var(--header-shadow)', flexShrink:0 }}>
        <div style={{ maxWidth:600, margin:'0 auto', padding:'0 14px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {isToken && (
              <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:18, padding:'4px 6px 4px 0', display:'flex', alignItems:'center' }}>←</button>
            )}
            <BrandMark size={26} alt="Mammoth" rounded={5} />
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, background:'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {isToken ? 'Mammoth' : TABS.find(t=>t.path===pathname)?.label || 'Mammoth'}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme}/>
            <WalletButton
              walletState={walletState}
              onOpenModal={onOpenModal}
              onDisconnect={() => setWalletState({ status:'disconnected', address:null, short:null, balance:0, adapter:null, error:null })}
            />
          </div>
        </div>
      </header>

      {/* Page content */}
      <div style={{ flex:1, maxWidth:600, margin:'0 auto', width:'100%', paddingBottom:isToken?16:72 }}>
        {children}
      </div>

      {/* Bottom nav — hidden on token detail pages */}
      {!isToken && (
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'var(--header-bg)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--header-border)', zIndex:50, display:'flex', justifyContent:'center' }}>
          <div style={{ display:'flex', width:'100%', maxWidth:600 }}>
            {TABS.map(t => {
              const active = t.path === activeTab;
              return (
                <button key={t.path} onClick={() => router.push(t.path)}
                  style={{ flex:1, padding:'10px 0 12px', background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 0.12s' }}>
                  <span style={{ fontSize:18, lineHeight:1, filter: active ? 'none' : 'grayscale(1) opacity(0.5)' }}>{t.icon}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color: active ? '#A78BFA' : 'var(--text-muted)', letterSpacing:'0.05em', textTransform:'uppercase' }}>{t.label}</span>
                  {active && <div style={{ width:16, height:2, background:'#8B5CF6', borderRadius:1 }}/>}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
