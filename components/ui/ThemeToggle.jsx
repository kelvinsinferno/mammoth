'use client';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button onClick={onToggle} className="theme-toggle" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ display:'flex', alignItems:'center', gap:7, background:isDark?'rgba(139,92,246,0.15)':'linear-gradient(135deg,#7c3aed,#06b6d4,#f59e0b)', border:isDark?'1px solid rgba(139,92,246,0.4)':'none', borderRadius:20, padding:'5px 12px 5px 6px', cursor:'pointer', transition:'all 0.2s', flexShrink:0, boxShadow:isDark?'none':'0 0 16px rgba(124,58,237,0.5),0 0 32px rgba(6,182,212,0.3)', minHeight:36 }}>
      <div style={{ width:36, height:20, borderRadius:10, position:'relative', flexShrink:0, background:isDark?'#0f1228':'rgba(255,255,255,0.3)', border:isDark?'1px solid rgba(139,92,246,0.5)':'1px solid rgba(255,255,255,0.5)' }}>
        <div style={{ position:'absolute', top:3, left:isDark?3:18, width:14, height:14, borderRadius:'50%', background:isDark?'#8B5CF6':'#fff', transition:'left 0.22s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:isDark?'0 0 8px rgba(139,92,246,0.9)':'0 0 10px rgba(255,255,255,0.9),0 2px 6px rgba(0,0,0,0.2)', fontSize:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
      <span className="theme-label" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.05em', color:isDark?'#8B5CF6':'#fff', textShadow:isDark?'none':'0 1px 4px rgba(0,0,0,0.3)' }}>
        {isDark ? 'DARK' : 'NEON'}
      </span>
    </button>
  );
}
