'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CoinbaseShell from './CoinbaseShell';
import ProjectCard from '../../components/ui/ProjectCard';
import { SkeletonCardGrid } from '../../components/ui/Skeleton';
import WalletModal from '../../components/wallet/WalletModal';
import { useApp } from '../../lib/AppContext';
import { getAllPositions } from '../../views/ProjectDetail';

const TABS = [
  { key:'new',      label:'New' },
  { key:'trending', label:'Trending ⚡' },
  { key:'raised',   label:'Most Raised' },
  { key:'ending',   label:'Ending Soon' },
  { key:'coming',   label:'Coming Soon' },
];

export default function CoinbaseDiscover() {
  const router = useRouter();
  const { projects, walletState, setWalletState, projectsLoading, theme } = useApp();
  const [tab, setTab] = useState('new');
  const [search, setSearch] = useState('');
  const [showWallet, setShowWallet] = useState(false);
  const [backedNewCycles, setBackedNewCycles] = useState([]);

  const now = Date.now();
  const liveProjects = projects.map(p =>
    p.goPublicAt && new Date(p.goPublicAt) <= new Date() ? { ...p, status: p.status==='COMING_SOON'?'BETWEEN':p.status } : p
  );
  const comingSoon   = liveProjects.filter(p => p.status==='COMING_SOON');
  const publicProjects = liveProjects.filter(p => p.status!=='COMING_SOON');

  useEffect(() => {
    if (!walletState.address) return;
    try {
      const positions = getAllPositions();
      const alerts = [];
      for (const pos of positions) {
        const lp = projects.find(p => String(p.mint||p.id)===String(pos.mintAddress));
        if (!lp) continue;
        const cur = lp.cycle||lp.cycleData?.id||1;
        if (cur > (pos.lastBuy?.cycleId||0)) alerts.push({ project:lp, pos, cycleOpen:lp.status==='ACTIVE', currentCycle:cur });
      }
      setBackedNewCycles(alerts);
    } catch {}
  }, [walletState.address, projects]);

  const sorted = {
    new:      [...publicProjects].sort((a,b)=>Number(b.id)-Number(a.id)),
    trending: [...publicProjects].sort((a,b)=>b.change-a.change),
    raised:   [...publicProjects].sort((a,b)=>parseFloat(b.raised)-parseFloat(a.raised)),
    ending:   [...publicProjects].filter(p=>p.status==='ACTIVE').sort((a,b)=>b.progress-a.progress),
    coming:   comingSoon,
  };
  const filtered = (sorted[tab]||sorted.new).filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.ticker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CoinbaseShell onOpenModal={() => setShowWallet(true)}>
      <div style={{ padding:'12px 14px' }}>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:12 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tokens..."
            style={{ width:'100%', background:'var(--panel)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px 10px 36px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box' }}
            onFocus={e=>e.currentTarget.style.borderColor='#8B5CF6'}
            onBlur={e=>e.currentTarget.style.borderColor='var(--border)'}/>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14 }}>🔍</span>
          {search && <button onClick={()=>setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:14 }}>✕</button>}
        </div>

        {/* New cycle alerts */}
        {backedNewCycles.length > 0 && (
          <div style={{ marginBottom:12, background:'rgba(255,159,28,0.05)', border:'1px solid rgba(255,159,28,0.22)', borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,159,28,0.15)', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12 }}>🔔</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#FF9F1C', letterSpacing:'0.06em', textTransform:'uppercase' }}>New cycles from projects you&apos;ve backed</span>
            </div>
            {backedNewCycles.map(({ project:p, cycleOpen, currentCycle, pos }, i) => (
              <div key={p.id} onClick={() => router.push(`/coinbase/token/${p.mint||p.id}`)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', cursor:'pointer', borderBottom: i<backedNewCycles.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'var(--text)', marginBottom:1 }}>{p.name} <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)' }}>${p.ticker}</span></div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>Cycle {pos.lastBuy?.cycleId||1} → now on cycle {currentCycle}</div>
                </div>
                {cycleOpen
                  ? <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#22D3EE', background:'rgba(34,211,238,0.1)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:3, padding:'2px 7px', flexShrink:0 }}>● OPEN</span>
                  : <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:'#FF9F1C', background:'rgba(255,159,28,0.1)', border:'1px solid rgba(255,159,28,0.25)', borderRadius:3, padding:'2px 7px', flexShrink:0 }}>COMING</span>
                }
                <span style={{ color:'var(--text-muted)', fontSize:12 }}>→</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display:'flex', gap:0, overflowX:'auto', scrollbarWidth:'none', marginBottom:12, borderBottom:'1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:'8px 14px', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:500, color:tab===t.key?'#22D3EE':'var(--text-muted)', borderBottom:`2px solid ${tab===t.key?'#8B5CF6':'transparent'}`, transition:'all 0.12s', whiteSpace:'nowrap', flexShrink:0, minHeight:40 }}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:12 }}>
          {[
            ['Active', projects.filter(p=>p.status==='ACTIVE').length, '#22D3EE'],
            ['Projects', projects.length, '#8B5CF6'],
            ['Coming', comingSoon.length, '#A78BFA'],
            ['Raised', '1.84K SOL', '#FF9F1C'],
          ].map(([l,v,c])=>(
            <div key={l} style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:7, padding:'7px 6px', textAlign:'center' }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, color:c }}>{v}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:'var(--text-muted)', marginTop:1, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Feed */}
        {projectsLoading ? (
          <SkeletonCardGrid count={4}/>
        ) : filtered.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => router.push(`/coinbase/token/${p.mint||p.id}`)} style={{ cursor:'pointer' }}>
                {p.status === 'COMING_SOON' ? (
                  <div style={{ background:'var(--panel)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:10, padding:'14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:3 }}>{p.name}</div>
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-dim)', background:'var(--badge-bg)', border:'1px solid #252848', borderRadius:3, padding:'1px 6px' }}>${p.ticker}</span>
                      </div>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:'#A78BFA', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:3, padding:'2px 8px', flexShrink:0 }}>COMING SOON</span>
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', marginBottom:8, lineHeight:1.6 }}>{p.description?.slice(0,80)}{p.description?.length>80?'...':''}</div>
                    <div style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:6, padding:'7px 11px', display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'var(--text-muted)' }}>Goes public</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:'#A78BFA' }}>
                        {new Date(p.goPublicAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                      </span>
                    </div>
                  </div>
                ) : (
                  <ProjectCard p={p} onClick={() => router.push(`/coinbase/token/${p.mint||p.id}`)} theme={theme}/>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'40px 0', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>
            {tab==='coming' ? 'No upcoming projects scheduled.' : 'No tokens found.'}
          </div>
        )}
      </div>

      {showWallet && <WalletModal onClose={()=>setShowWallet(false)} onConnected={s=>{setWalletState(s);setShowWallet(false);}}/>}
    </CoinbaseShell>
  );
}
