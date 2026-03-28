'use client';
import { useState } from 'react';
import ProjectCard from '../components/ui/ProjectCard';
import ThemeToggle from '../components/ui/ThemeToggle';
import WalletButton from '../components/wallet/WalletButton';
import { getTokenPalette } from '../components/ui/TokenLogo';
import { SkeletonCardGrid } from '../components/ui/Skeleton';

export default function Homepage({ projects, onSelectProject, wallet, walletState, onOpenModal, onDisconnect, onLaunch, theme, onToggleTheme, loading, rpcError }) {
  const [tab, setTab] = useState('new');
  const [search, setSearch] = useState('');
  const TABS = [
    {key:'new',label:'New'},
    {key:'trending',label:'Trending ⚡'},
    {key:'raised',label:'Most Raised'},
    {key:'ending',label:'Ending Soon'},
    {key:'between',label:'Between Cycles'},
  ];
  const sorted = {
    new: [...projects].sort((a,b) => Number(b.id)-Number(a.id)),
    trending: [...projects].sort((a,b) => b.change-a.change),
    raised: [...projects].sort((a,b) => parseFloat(b.raised)-parseFloat(a.raised)),
    ending: [...projects].filter(p => p.status==='ACTIVE').sort((a,b) => b.progress-a.progress),
    between: [...projects].filter(p => p.status==='BETWEEN'||p.status==='CLOSED'||p.status==='ENDED'),
  };
  const filtered = (sorted[tab]||sorted.new).filter(p => !search||p.name.toLowerCase().includes(search.toLowerCase())||p.ticker.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight:'100vh', background:'var(--page-bg)', color:'var(--text)' }}>
      {/* Ticker bar */}
      <div style={{ background:theme==='light'?'linear-gradient(90deg,#7c3aed,#06b6d4,#10b981,#f59e0b,#ec4899,#8b5cf6)':'var(--bg-deep)', borderBottom:theme==='light'?'none':'1px solid rgba(139,92,246,0.25)', height:30, overflow:'hidden', position:'relative', boxShadow:theme==='light'?'0 3px 16px rgba(124,58,237,0.35)':'none', maxWidth:'100vw' }}>
        <div style={{ display:'flex', animation:'marquee 24s linear infinite', width:'max-content' }}>
          {[...projects,...projects].map((p,i) => { const pal=getTokenPalette(p.id); return (
            <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'0 20px', fontSize:11, fontFamily:"'IBM Plex Mono',monospace", whiteSpace:'nowrap', lineHeight:'30px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:theme==='light'?'rgba(255,255,255,0.9)':pal.accent, display:'inline-block', flexShrink:0, animation:'blink 2s ease-in-out infinite' }}/>
              <span style={{ color:theme==='light'?'#fff':pal.accent, fontWeight:700 }}>${p.ticker}</span>
              <span style={{ color:theme==='light'?'rgba(255,255,255,0.9)':'var(--text-secondary)', fontWeight:600 }}>{p.price.toFixed(5)}</span>
              <span style={{ color:theme==='light'?'#fff':p.change>=0?'#22D3EE':'#F43F5E', fontWeight:700 }}>{p.change>=0?'▲':'▼'}{Math.abs(p.change).toFixed(1)}%</span>
              <span style={{ color:theme==='light'?'rgba(255,255,255,0.3)':'rgba(139,92,246,0.3)', fontSize:8 }}>◆</span>
            </span>
          ); })}
        </div>
      </div>

      {/* Header */}
      <header style={{ background:'var(--header-bg)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--header-border)', position:'sticky', top:0, zIndex:50, boxShadow:'var(--header-shadow)' }}>
        <div className="header-inner" style={{ maxWidth:860, margin:'0 auto', padding:'0 16px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <img
              src="/mammoth-logo-dark.gif"
              alt="Mammoth"
              width={36}
              height={36}
              style={{ borderRadius: 8, objectFit: 'cover' }}
            />
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, letterSpacing:'-0.02em', background:'linear-gradient(90deg,#A78BFA,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Mammoth</span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <ThemeToggle theme={theme} onToggle={onToggleTheme}/>
            <a href="/creator" className="hdr-btn hdr-creator" style={{ background:'transparent', border:'1px solid rgba(139,92,246,0.3)', borderRadius:6, cursor:'pointer', fontWeight:600, transition:'all 0.13s', display:'flex', alignItems:'center', justifyContent:'center', minHeight:36, flexShrink:0, textDecoration:'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#8B5CF6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(139,92,246,0.3)'; }}>
              <span className="hdr-text" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, letterSpacing:'0.04em', padding:'6px 12px', color:'#A78BFA' }}>DASHBOARD</span>
              <span className="hdr-icon" style={{ fontSize:16, padding:'0 10px' }}>👤</span>
            </a>
            <button onClick={onLaunch} className="hdr-btn hdr-launch"
              style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(34,211,238,0.08))', border:'1px solid rgba(139,92,246,0.4)', color:'#A78BFA', borderRadius:6, cursor:'pointer', fontWeight:700, transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', minHeight:36, flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 16px rgba(139,92,246,0.4)'; e.currentTarget.style.color='#22D3EE'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.color='#A78BFA'; }}>
              <span className="hdr-text" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, letterSpacing:'0.04em', padding:'6px 14px' }}>LAUNCH</span>
              <span className="hdr-icon" style={{ fontSize:16, padding:'0 10px' }}>🚀</span>
            </button>
            <WalletButton walletState={walletState} onOpenModal={onOpenModal} onDisconnect={onDisconnect}/>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div style={{ background:'var(--stats-bg)', borderBottom:'1px solid var(--stats-border)' }}>
        <div className="stats-bar-inner" style={{ maxWidth:860, margin:'0 auto', padding:'12px 16px', display:'flex', gap:6, flexWrap:'wrap' }}>
          {[
            ['active cycles', projects.filter(p=>p.status==='ACTIVE').length,'#22D3EE','rgba(34,211,238,0.08)','rgba(34,211,238,0.22)'],
            ['projects', projects.length,'#8B5CF6','rgba(139,92,246,0.08)','rgba(139,92,246,0.22)'],
            ['24h volume','823K SOL','#F59E0B','rgba(245,158,11,0.08)','rgba(245,158,11,0.22)'],
            ['raised','1.84K SOL','#10B981','rgba(16,185,129,0.08)','rgba(16,185,129,0.22)'],
          ].map(([l,v,c,bg,bdr],i) => (
            <div key={i} className="stats-bar-item" style={{ flex:'1 1 calc(50% - 4px)', minWidth:0, textAlign:'center', background:bg, border:`1px solid ${bdr}`, borderRadius:8, padding:'9px 4px' }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:15, color:c, textShadow:`0 0 14px ${c}99`, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</div>
              <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'0.05em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <main className="main-content" style={{ maxWidth:860, margin:'0 auto', padding:'18px 16px 56px' }}>
        {/* Hero */}
        <div style={{ marginBottom:20, padding:'16px 18px', background:'var(--hero-bg)', border:'1px solid var(--hero-border)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, boxSizing:'border-box' }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:3 }}>
              For projects that aren't done yet —{' '}
              <span style={{ background:'linear-gradient(90deg,#8B5CF6,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>launch, grow, and keep going.</span>
            </div>
            <div style={{ fontSize:11, color:theme==='light'?'rgba(255,255,255,0.85)':'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>permissionless · cycle-based · no curation · no approvals</div>
          </div>
          <button onClick={onLaunch} style={{ background:theme==='light'?'#fff':'linear-gradient(135deg,#7C3AED,#8B5CF6)', color:theme==='light'?'#7c3aed':'#fff', border:'none', borderRadius:7, padding:'10px 20px', fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:12, cursor:'pointer', letterSpacing:'0.05em', whiteSpace:'nowrap', flexShrink:0, minHeight:44 }}>
            LAUNCH TOKEN →
          </button>
        </div>

        {/* How it works */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'var(--text)' }}>How it works</div>
            <a href="/learn" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#A78BFA', textDecoration:'none', letterSpacing:'0.04em' }}>full guide →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(190px,100%),1fr))', gap:8 }}>
            {[
              { icon:'🔄', color:'#22D3EE', title:'Cycle-Based Raises', desc:'Capital raised in discrete rounds. Fixed allocation, bounded price curve. No continuous emissions.' },
              { icon:'🛡️', color:'#A78BFA', title:'Rights Protection', desc:'Existing holders get first access at launch price before each new cycle opens to the public.' },
              { icon:'📊', color:'#FF9F1C', title:'Predictable Pricing', desc:'Step, Linear, or Exp-Lite curves. You always know what drives the next price change.' },
              { icon:'💰', color:'#10B981', title:'On-Chain Treasury', desc:'Proceeds split automatically at cycle close. Creator, reserve, and sink shares are set in stone.' },
            ].map((card,i) => (
              <a key={i} href="/learn" style={{ textDecoration:'none' }}>
                <div style={{ background:'var(--panel-alt)', border:`1px solid ${card.color}22`, borderRadius:8, padding:'12px 13px', cursor:'pointer', transition:'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=`${card.color}55`}
                  onMouseLeave={e => e.currentTarget.style.borderColor=`${card.color}22`}>
                  <div style={{ fontSize:18, marginBottom:6 }}>{card.icon}</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:card.color, marginBottom:4 }}>{card.title}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)', lineHeight:1.65 }}>{card.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Tabs bar */}
        <div style={{ background:'var(--panel-alt)', border:'1px solid #1a2438', borderRadius:7, padding:3, marginBottom:0 }}>
          {/* Top row: tabs + search inline (desktop) */}
          <div style={{ display:'flex', alignItems:'center', gap:0, minWidth:0 }}>
            <div style={{ display:'flex', gap:2, overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch', flex:1, minWidth:0 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className="tab"
                  style={{ background:tab===t.key?'#8B5CF6':'none', border:'none', cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500, letterSpacing:'0.04em', padding:'7px 13px', borderRadius:5, transition:'color 0.15s, background 0.12s', whiteSpace:'nowrap', flexShrink:0, color:tab===t.key?'var(--bg)':'var(--text-dim)', minHeight:44 }}>
                  {t.label}
                </button>
              ))}
            </div>
            {/* Divider + search — desktop only */}
            <div className="search-inline" style={{ display:'flex', alignItems:'center', gap:0, flexShrink:0 }}>
              <div style={{ width:1, height:24, background:'#1a2438', margin:'0 4px' }}/>
              <div style={{ position:'relative', width:180 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search..."
                  style={{ width:'100%', background:'transparent', border:'none', padding:'7px 10px 7px 28px', color:'var(--text)', fontSize:12, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:44 }}/>
                <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14, pointerEvents:'none' }}>⌕</span>
              </div>
            </div>
          </div>
          {/* Search — mobile only, inside the bar below tabs */}
          <div className="search-mobile" style={{ borderTop:'1px solid #1a2438', position:'relative', display:'none' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search tokens..."
              style={{ width:'100%', background:'transparent', border:'none', padding:'9px 12px 9px 34px', color:'var(--text)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:'none', boxSizing:'border-box', minHeight:44 }}/>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:15, pointerEvents:'none' }}>⌕</span>
          </div>
        </div>
        <div style={{ marginBottom:12 }}/>

        {/* RPC error banner */}
        {rpcError && (
          <div style={{ background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.22)', borderRadius:7, padding:'9px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#FB923C' }}>
            <span>⚠️</span>
            <span>{rpcError}</span>
          </div>
        )}

        {!loading && <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:12 }}>{filtered.length} project{filtered.length!==1?'s':''}</div>}

        {loading ? (
          <SkeletonCardGrid count={6} />
        ) : filtered.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(290px,100%),1fr))', gap:8 }}>
            {filtered.map((p,i) => (
              <div key={p.id} style={{ animation:'fadeUp 0.2s ease both', animationDelay:`${i*0.033}s` }}>
                <ProjectCard p={p} onClick={() => onSelectProject(p)} theme={theme}/>
              </div>
            ))}
          </div>
        ) : search ? (
          <div style={{ textAlign:'center', padding:'56px 0', color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>no tokens found</div>
        ) : (
          /* Empty state — no projects at all */
          <div style={{ textAlign:'center', padding:'64px 0', animation:'fadeUp 0.25s ease' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🦣</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:8 }}>
              No active cycles right now.
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'var(--text-muted)', marginBottom:24 }}>
              Be the first to launch.
            </div>
            <button onClick={onLaunch} style={{ background:'#FF9F1C', color:'#000', border:'none', borderRadius:7, padding:'11px 24px', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, cursor:'pointer', letterSpacing:'0.05em' }}>
              LAUNCH TOKEN →
            </button>
          </div>
        )}

        <div style={{ marginTop:44, paddingTop:20, borderTop:'1px solid #1a2438', textAlign:'center' }}>
          <div style={{ fontSize:11, color:'var(--bar-empty)', fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.9 }}>
            Mammoth Protocol · permissionless issuance · 2% fee on Mammoth-routed trades<br/>not a curator · not a guarantor · not financial advice
          </div>
        </div>
      </main>
    </div>
  );
}
