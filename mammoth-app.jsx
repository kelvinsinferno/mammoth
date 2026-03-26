import { useState, useEffect, useRef } from "react";

// ─── SHARED MOCK DATA ─────────────────────────────────────────────────────────
const genSparkline = (trend = "up", n = 24) => {
  const d = [];
  let v = 40 + Math.random() * 20;
  for (let i = 0; i < n; i++) {
    v = Math.max(4, Math.min(96, v + (Math.random() - (trend === "up" ? 0.37 : 0.63)) * 11));
    d.push(v);
  }
  return d;
};

const PROJECTS = [
  { id:"1", name:"MegaTusk", ticker:"TUSK", image:"https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", price:0.00234, change:182.4, volume:84200, status:"ACTIVE", progress:78, sparkline:genSparkline("up"), cycle:2, raised:"240 SOL",
    description:"MegaTusk is a repeat-raise infrastructure layer built on Mammoth Protocol. Each cycle funds a specific milestone — no vague promises, no surprise dilution.",
    supplyMode:"Fixed", totalSupply:1_000_000_000, publicAlloc:600_000_000, treasuryAlloc:400_000_000,
    cycleData:{ id:2, status:"ACTIVE", allocation:100_000, sold:78_000, curveType:"Step", currentPrice:0.00234, nextStepIn:3_200, nextStepPrice:0.00256, stepSize:5_000, stepIncrement:0.00022, userRights:5_400, userRightsUsed:0, treasuryRouting:{creator:70,reserve:20,sink:10} },
    cycleHistory:[{id:1,allocation:100_000,sold:100_000,status:"COMPLETED",raised:"240 SOL",priceRange:"0.0018–0.0032"},{id:2,allocation:100_000,sold:78_000,status:"ACTIVE",raised:"182 SOL",priceRange:"0.0018–now"}],
    creator:"7xKm...4fQ", createdAt:"2025-03-01", hardCap:true,
    chartData: (() => { const pts=[]; let v=0.0018; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.0010,Math.min(0.0045,v+(Math.random()-0.44)*0.00015));pts.push({t:now-i*3_600_000,p:v})} pts[pts.length-1].p=0.00234; return pts; })(),
  },
  { id:"2", name:"WoollyDAO", ticker:"WOOL", image:"https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif", price:0.00089, change:47.1, volume:31500, status:"ACTIVE", progress:31, sparkline:genSparkline("up"), cycle:1, raised:"62 SOL",
    description:"WoollyDAO is decentralized woolly mammoth preservation infrastructure. The DAO funds conservation research through discrete minting cycles.",
    supplyMode:"Elastic", totalSupply:500_000_000, publicAlloc:300_000_000, treasuryAlloc:200_000_000,
    cycleData:{ id:1, status:"ACTIVE", allocation:80_000, sold:24_800, curveType:"Linear", currentPrice:0.00089, nextStepIn:null, nextStepPrice:null, stepSize:8_000, stepIncrement:0.00008, userRights:2_100, userRightsUsed:0, treasuryRouting:{creator:60,reserve:30,sink:10} },
    cycleHistory:[{id:1,allocation:80_000,sold:24_800,status:"ACTIVE",raised:"62 SOL",priceRange:"0.0007–now"}],
    creator:"AbC...9xZ", createdAt:"2025-03-08", hardCap:false,
    chartData: (() => { const pts=[]; let v=0.0007; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.0004,Math.min(0.0015,v+(Math.random()-0.43)*0.00008));pts.push({t:now-i*3_600_000,p:v})} pts[pts.length-1].p=0.00089; return pts; })(),
  },
  { id:"3", name:"Glacial Finance", ticker:"GLAC", image:"https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif", price:0.01204, change:-12.3, volume:198000, status:"BETWEEN", progress:100, sparkline:genSparkline("down"), cycle:3, raised:"512 SOL",
    description:"Glacial Finance is a slow-money, fast-gains protocol. Three completed cycles with disciplined allocation sizing and long gaps between raises.",
    supplyMode:"Fixed", totalSupply:2_000_000_000, publicAlloc:1_200_000_000, treasuryAlloc:800_000_000,
    cycleData:{ id:3, status:"ENDED", allocation:200_000, sold:200_000, curveType:"Step", currentPrice:0.01204, nextStepIn:null, nextStepPrice:null, stepSize:10_000, stepIncrement:0.00040, userRights:0, userRightsUsed:0, treasuryRouting:{creator:75,reserve:15,sink:10} },
    cycleHistory:[{id:1,allocation:200_000,sold:200_000,status:"COMPLETED",raised:"120 SOL",priceRange:"0.006–0.009"},{id:2,allocation:200_000,sold:180_000,status:"TERMINATED",raised:"190 SOL",priceRange:"0.008–0.011"},{id:3,allocation:200_000,sold:200_000,status:"COMPLETED",raised:"512 SOL",priceRange:"0.010–0.013"}],
    creator:"DeF...7mN", createdAt:"2025-01-15", hardCap:true,
    chartData: (() => { const pts=[]; let v=0.006; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.004,Math.min(0.018,v+(Math.random()-0.47)*0.0004));pts.push({t:now-i*3_600_000,p:v})} pts[pts.length-1].p=0.01204; return pts; })(),
  },
  { id:"4", name:"IceAge Protocol", ticker:"ICE", image:"https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif", price:0.00042, change:311.9, volume:9800, status:"ACTIVE", progress:12, sparkline:genSparkline("up"), cycle:1, raised:"14 SOL",
    description:"IceAge Protocol is a primitive capital formation layer. First cycle, early asymmetry, high risk. The market decides everything.",
    supplyMode:"Fixed", totalSupply:1_000_000_000, publicAlloc:600_000_000, treasuryAlloc:400_000_000,
    cycleData:{ id:1, status:"ACTIVE", allocation:50_000, sold:6_000, curveType:"Exp-Lite", currentPrice:0.00042, nextStepIn:null, nextStepPrice:0.00058, stepSize:5_000, stepIncrement:0.00016, userRights:800, userRightsUsed:0, treasuryRouting:{creator:70,reserve:20,sink:10} },
    cycleHistory:[{id:1,allocation:50_000,sold:6_000,status:"ACTIVE",raised:"14 SOL",priceRange:"0.0003–now"}],
    creator:"GhI...2kP", createdAt:"2025-03-14", hardCap:false,
    chartData: (() => { const pts=[]; let v=0.0003; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.0001,Math.min(0.0008,v+(Math.random()-0.41)*0.00004));pts.push({t:now-i*3_600_000,p:v})} pts[pts.length-1].p=0.00042; return pts; })(),
  },
  { id:"5", name:"Permafrost", ticker:"PRFR", price:0.00399, change:63.2, volume:41800, status:"ACTIVE", progress:55, sparkline:genSparkline("up"), cycle:2, raised:"176 SOL",
    description:"Cold storage for hot narratives. Permafrost uses long gaps between cycles to build credibility and reduce dilution anxiety.",
    supplyMode:"Fixed", totalSupply:800_000_000, publicAlloc:480_000_000, treasuryAlloc:320_000_000,
    cycleData:{ id:2, status:"ACTIVE", allocation:120_000, sold:66_000, curveType:"Step", currentPrice:0.00399, nextStepIn:4_000, nextStepPrice:0.00421, stepSize:6_000, stepIncrement:0.00022, userRights:3_200, userRightsUsed:0, treasuryRouting:{creator:65,reserve:25,sink:10} },
    cycleHistory:[{id:1,allocation:100_000,sold:100_000,status:"COMPLETED",raised:"176 SOL",priceRange:"0.002–0.004"},{id:2,allocation:120_000,sold:66_000,status:"ACTIVE",raised:"176 SOL",priceRange:"0.003–now"}],
    creator:"JkL...5vR", createdAt:"2025-02-10", hardCap:true,
    chartData: (() => { const pts=[]; let v=0.002; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.001,Math.min(0.007,v+(Math.random()-0.43)*0.00015));pts.push({t:now-i*3_600_000,p:v})} pts[pts.length-1].p=0.00399; return pts; })(),
  },
  { id:"6", name:"HerdProtocol", ticker:"HERD", price:0.00003, change:892.1, volume:3100, status:"ACTIVE", progress:6, sparkline:genSparkline("up"), cycle:1, raised:"2 SOL",
    description:"Move together or get left behind. HerdProtocol is a brand new Cycle 1 with extreme early asymmetry and no prior credibility. Pure speculation.",
    supplyMode:"Elastic", totalSupply:500_000_000, publicAlloc:250_000_000, treasuryAlloc:250_000_000,
    cycleData:{ id:1, status:"ACTIVE", allocation:25_000, sold:1_500, curveType:"Step", currentPrice:0.00003, nextStepIn:3_500, nextStepPrice:0.000052, stepSize:2_500, stepIncrement:0.000022, userRights:400, userRightsUsed:0, treasuryRouting:{creator:70,reserve:20,sink:10} },
    cycleHistory:[{id:1,allocation:25_000,sold:1_500,status:"ACTIVE",raised:"2 SOL",priceRange:"0.00002–now"}],
    creator:"MnO...8wS", createdAt:"2025-03-16", hardCap:false,
    chartData: (() => { const pts=[]; let v=0.00002; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.00001,Math.min(0.00006,v+(Math.random()-0.42)*0.000002));pts.push({t:now-i*3_600_000,p:v})} pts[pts.length-1].p=0.00003; return pts; })(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN IDENTITY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const TOKEN_PALETTES = [
  { bg:"#1a0628", lightBg:"#fdf4ff", accent:"#C026D3", accent2:"#9333EA", glow:"rgba(192,38,211,0.5)",  lightGlow:"rgba(192,38,211,0.2)"  }, // fuchsia
  { bg:"#061a10", lightBg:"#f0fdf4", accent:"#22C55E", accent2:"#16A34A", glow:"rgba(34,197,94,0.45)",  lightGlow:"rgba(34,197,94,0.15)"   }, // green
  { bg:"#031520", lightBg:"#ecfeff", accent:"#06B6D4", accent2:"#0891B2", glow:"rgba(6,182,212,0.45)",  lightGlow:"rgba(6,182,212,0.15)"   }, // cyan
  { bg:"#200608", lightBg:"#fff1f2", accent:"#F43F5E", accent2:"#E11D48", glow:"rgba(244,63,94,0.5)",   lightGlow:"rgba(244,63,94,0.15)"   }, // rose
  { bg:"#1f1200", lightBg:"#fffbeb", accent:"#F59E0B", accent2:"#D97706", glow:"rgba(245,158,11,0.5)",  lightGlow:"rgba(245,158,11,0.15)"  }, // amber
  { bg:"#06060f", lightBg:"#eef2ff", accent:"#818CF8", accent2:"#6366F1", glow:"rgba(129,140,248,0.5)", lightGlow:"rgba(99,102,241,0.15)"  }, // indigo
  { bg:"#1a0610", lightBg:"#fdf2f8", accent:"#F472B6", accent2:"#EC4899", glow:"rgba(244,114,182,0.45)",lightGlow:"rgba(236,72,153,0.15)"  }, // pink
  { bg:"#001510", lightBg:"#f0fdfa", accent:"#2DD4BF", accent2:"#0D9488", glow:"rgba(45,212,191,0.45)", lightGlow:"rgba(45,212,191,0.15)"  }, // teal
];

function getTokenPalette(id) {
  const n = typeof id === "string" ? id.charCodeAt(0) * 7 + (id.charCodeAt(1)||3) : parseInt(id)||0;
  return TOKEN_PALETTES[Math.abs(n) % TOKEN_PALETTES.length];
}

// Token logo — renders GIF/image if available, falls back to generated SVG mark
// image prop: URL string (GIF, PNG, WEBP, etc.) or null
function TokenLogo({ id, size = 44, image = null }) {
  const pal = getTokenPalette(id);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // If we have a valid image URL and it hasn't errored, render it
  if (image && !imgError) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 11, overflow: "hidden",
        position: "relative", flexShrink: 0,
        border: `1.5px solid ${pal.accent}55`,
        background: pal.bg,
      }}>
        {/* Skeleton while loading */}
        {!imgLoaded && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 10,
            background: `linear-gradient(135deg,${pal.bg},${pal.accent}22)`,
            animation: "shimmer 1.5s ease infinite",
          }}/>
        )}
        <img
          src={image}
          alt=""
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        />
        {/* Accent border overlay */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 10,
          border: `1.5px solid ${pal.accent}44`,
          pointerEvents: "none",
        }}/>
      </div>
    );
  }

  // SVG fallback
  const n = typeof id === "string" ? parseInt(id) : id;
  const idx = Math.abs(n || 0) % 8;
  const s = size;

  const shapes = [
    // 0 — mammoth
    <svg key={0} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <ellipse cx="22" cy="28" rx="11" ry="8.5" fill={pal.accent} opacity="0.9"/>
      <ellipse cx="22" cy="25" rx="8.5" ry="7.5" fill={pal.accent}/>
      <path d="M13.5 22.5 Q10.5 17 11.5 13.5 Q13 18.5 15.5 19.5" fill={pal.accent2}/>
      <path d="M30.5 22.5 Q33.5 17 32.5 13.5 Q31 18.5 28.5 19.5" fill={pal.accent2}/>
      <ellipse cx="22" cy="23" rx="3.5" ry="3" fill="#fff" opacity="0.18"/>
      <circle cx="19.5" cy="22" r="1.8" fill={pal.bg} opacity="0.5"/>
      <circle cx="24.5" cy="22" r="1.8" fill={pal.bg} opacity="0.5"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    // 1 — galaxy
    <svg key={1} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <circle cx="22" cy="22" r="13" fill="none" stroke={pal.accent} strokeWidth="1" opacity="0.3"/>
      <circle cx="22" cy="22" r="8.5" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.5"/>
      <circle cx="22" cy="22" r="4.5" fill={pal.accent} opacity="0.9"/>
      <circle cx="22" cy="9" r="2.5" fill={pal.accent}/>
      <circle cx="35" cy="22" r="2" fill={pal.accent2}/>
      <circle cx="22" cy="35" r="2" fill={pal.accent} opacity="0.7"/>
      <circle cx="9" cy="22" r="1.5" fill={pal.accent2} opacity="0.8"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.35"/>
    </svg>,
    // 2 — crystal
    <svg key={2} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <polygon points="22,7 37,18 31,37 13,37 7,18" fill={pal.accent} opacity="0.8"/>
      <polygon points="22,7 37,18 22,23" fill={pal.accent2} opacity="0.7"/>
      <polygon points="22,7 7,18 22,23" fill={pal.accent} opacity="0.45"/>
      <polygon points="7,18 13,37 22,23" fill={pal.accent2} opacity="0.55"/>
      <polygon points="37,18 31,37 22,23" fill={pal.accent} opacity="0.35"/>
      <line x1="22" y1="7" x2="22" y2="23" stroke="#fff" strokeWidth="0.5" opacity="0.35"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    // 3 — lightning
    <svg key={3} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <polygon points="27,7 15,24 23,24 17,38 31,21 22,21" fill={pal.accent}/>
      <polygon points="27,7 15,24 23,24 17,38 31,21 22,21" fill="#fff" opacity="0.12"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    // 4 — snowflake
    <svg key={4} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      {[0,60,120,180,240,300].map(a => (
        <line key={a} x1="22" y1="22"
          x2={22+13*Math.cos(a*Math.PI/180).toFixed(4)}
          y2={22+13*Math.sin(a*Math.PI/180).toFixed(4)}
          stroke={pal.accent} strokeWidth="2" strokeLinecap="round"/>
      ))}
      {[0,60,120,180,240,300].map(a => (
        <circle key={a}
          cx={22+13*Math.cos(a*Math.PI/180).toFixed(4)}
          cy={22+13*Math.sin(a*Math.PI/180).toFixed(4)}
          r="3" fill={pal.accent2}/>
      ))}
      <circle cx="22" cy="22" r="4.5" fill={pal.accent}/>
      <circle cx="22" cy="22" r="2" fill="#fff" opacity="0.4"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    // 5 — shield
    <svg key={5} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <path d="M22 7 L36 13.5 L36 24 Q36 34.5 22 39 Q8 34.5 8 24 L8 13.5 Z" fill={pal.accent} opacity="0.85"/>
      <path d="M22 13 L31 17 L31 24 Q31 30.5 22 34 Q13 30.5 13 24 L13 17 Z" fill={pal.accent2} opacity="0.7"/>
      <path d="M17 23.5 L21 27.5 L28.5 19" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    // 6 — atom
    <svg key={6} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.7"/>
      <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke={pal.accent2} strokeWidth="1.5" opacity="0.7" transform="rotate(60 22 22)"/>
      <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.7" transform="rotate(120 22 22)"/>
      <circle cx="22" cy="22" r="4.5" fill={pal.accent}/>
      <circle cx="22" cy="22" r="2" fill="#fff" opacity="0.35"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.35"/>
    </svg>,
    // 7 — tusks/horns
    <svg key={7} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <path d="M11 38 Q9 20 18 11 Q22 7 22 16 Q22 25 28 31 Q33 35 31 39 Q24 37 22 30 Q20 37 11 38Z" fill={pal.accent}/>
      <path d="M33 38 Q35 20 26 11 Q22 7 22 16 Q22 25 16 31 Q11 35 13 39 Q20 37 22 30 Q24 37 33 38Z" fill={pal.accent2} opacity="0.8"/>
      <circle cx="22" cy="18" r="3" fill="#fff" opacity="0.25"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
  ];
  return shapes[idx];
}

// ── Theme toggle button ───────────────────────────────────────────────────────
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button onClick={onToggle} title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display:"flex", alignItems:"center", gap:7,
        background: isDark ? "rgba(139,92,246,0.15)" : "linear-gradient(135deg,#7c3aed,#06b6d4,#f59e0b)",
        border: isDark ? "1px solid rgba(139,92,246,0.4)" : "none",
        borderRadius:20, padding:"5px 12px 5px 6px",
        cursor:"pointer", transition:"all 0.2s", flexShrink:0,
        boxShadow: isDark ? "none" : "0 0 16px rgba(124,58,237,0.5),0 0 32px rgba(6,182,212,0.3)",
      }}>
      <div style={{
        width:36, height:20, borderRadius:10, position:"relative", flexShrink:0,
        background: isDark ? "#0f1228" : "rgba(255,255,255,0.3)",
        border: isDark ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.5)",
      }}>
        <div style={{
          position:"absolute", top:3,
          left: isDark ? 3 : 18,
          width:14, height:14, borderRadius:"50%",
          background: isDark ? "#8B5CF6" : "#fff",
          transition:"left 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: isDark ? "0 0 8px rgba(139,92,246,0.9)" : "0 0 10px rgba(255,255,255,0.9),0 2px 6px rgba(0,0,0,0.2)",
          fontSize:8, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {isDark ? "🌙" : "☀️"}
        </div>
      </div>
      <span style={{
        fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700,
        letterSpacing:"0.05em",
        color: isDark ? "#8B5CF6" : "#fff",
        textShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.3)",
      }}>
        {isDark ? "DARK" : "NEON"}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════════════════════════════════════════════

function Spark({ data, up }) {
  const w = 72, h = 30;
  const min = Math.min(...data), rng = Math.max(...data) - min || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/rng)*(h-3)-1.5}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block",flexShrink:0}}>
      <polyline points={pts} fill="none" stroke={up?"#22D3EE":"#F43F5E"} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function ProjectCard({ p, onClick, theme = "dark" }) {
  const isLight = theme === "light";
  const up = p.change >= 0;
  const [hov, setHov] = useState(false);
  const nearFull = p.status === "ACTIVE" && p.progress >= 75;
  const pal = getTokenPalette(p.id);
  const isActive = p.status === "ACTIVE";

  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background: hov ? "var(--card-hover)" : "var(--card-bg)",
        border: `1px solid ${hov ? pal.accent+"77" : pal.accent+"28"}`,
        borderRadius: 12,
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.18s",
        position: "relative",
        overflow: "hidden",
        boxShadow: hov ? `0 0 32px ${pal.glow}, 0 0 60px ${pal.glow.replace("0.5","0.12").replace("0.45","0.12").replace("0.35","0.1")}, 0 4px 24px rgba(0,0,0,0.5)` : `0 2px 16px rgba(0,0,0,0.4)`,
      }}>

      {/* Background glow blob */}
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:pal.glow.replace("0.5","0.07").replace("0.45","0.07").replace("0.35","0.07"),pointerEvents:"none",filter:"blur(20px)"}}/>

      {/* Top row: logo + name + status */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* Token logo */}
          <div style={{flexShrink:0,filter:hov?`drop-shadow(0 0 8px ${pal.accent}99)`:"none",transition:"filter 0.18s"}}>
            <TokenLogo id={p.id} size={40} image={p.image || null}/>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"var(--text)",letterSpacing:"-0.01em"}}>{p.name}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:"0.08em",color:pal.accent,background:pal.accent+"18",border:`1px solid ${pal.accent}44`,borderRadius:3,padding:"1px 6px",fontWeight:700}}>
                ${p.ticker}
              </span>
            </div>
            <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace"}}>Cycle #{p.cycle} · {p.raised} raised</span>
          </div>
        </div>

        {/* Status badge */}
        <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,letterSpacing:"0.06em",fontFamily:"'IBM Plex Mono',monospace",padding:"3px 9px",borderRadius:4,
          background: isActive ? pal.accent+"20" : "rgba(55,60,90,0.15)",
          color: isActive ? pal.accent : "var(--text-muted)",
          border: `1px solid ${isActive ? pal.accent+"55" : "rgba(55,60,90,0.35)"}`,
          flexShrink:0,
        }}>
          <span style={{width:5,height:5,borderRadius:"50%",background:isActive?pal.accent:"var(--text-muted)",display:"inline-block",animation:isActive?"blink 2s ease-in-out infinite":"none",boxShadow:isActive?`0 0 8px ${pal.accent}, 0 0 16px ${pal.accent}55`:"none"}}/>
          {isActive?"OPEN":"BETWEEN"}
        </span>
      </div>

      {/* Price row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:16,color:pal.accent,letterSpacing:"-0.02em",textShadow:hov?`0 0 12px ${pal.accent}88`:"none",transition:"text-shadow 0.18s"}}>
            {p.price.toFixed(5)}
            <span style={{fontSize:10,color:"var(--text-muted)",fontWeight:400,marginLeft:4}}>SOL</span>
          </div>
          <div style={{marginTop:3,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,color:up?"#22D3EE":"#F43F5E",textShadow:up?"0 0 8px rgba(34,211,238,0.6)":"0 0 8px rgba(244,63,94,0.6)"}}>
              {up?"▲":"▼"} {Math.abs(p.change).toFixed(1)}%
            </span>
            <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace"}}>{p.volume>=1000?`${(p.volume/1000).toFixed(1)}K`:p.volume} vol</span>
          </div>
        </div>
        {/* Sparkline with token color */}
        <div>
          <svg width={72} height={30} viewBox="0 0 72 30" style={{display:"block",flexShrink:0}}>
            <polyline
              points={p.sparkline.map((v,i)=>{const mn=Math.min(...p.sparkline),rng=Math.max(...p.sparkline)-mn||1;return`${(i/(p.sparkline.length-1))*72},${30-((v-mn)/rng)*27-1.5}`;}).join(" ")}
              fill="none" stroke={pal.accent} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace"}}>cycle fill</span>
          <span style={{fontSize:10,color:pal.accent,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{p.progress}%</span>
        </div>
        <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
          <div style={{
            height:"100%", width:`${p.progress}%`,
            background: isActive ? `linear-gradient(90deg,${pal.accent2},${pal.accent})` : "var(--bar-empty)",
            borderRadius:2, transition:"width 0.4s ease",
            boxShadow: isActive ? `0 0 12px ${pal.accent}cc, 0 0 24px ${pal.accent}44` : "none",
          }}/>
        </div>
        {nearFull && (
          <div style={{marginTop:5,fontSize:10,color:"#F59E0B",fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,textShadow:"0 0 8px rgba(245,158,11,0.7)"}}>
            ⚡ {100-p.progress}% remaining — filling fast
          </div>
        )}
      </div>
    </div>
  );
}

function Homepage({ projects, onSelectProject, wallet, walletState, onOpenModal, onDisconnect, onLaunch, theme, onToggleTheme }) {
  const [tab, setTab] = useState("new");
  const [search, setSearch] = useState("");
  const TABS = [{key:"new",label:"New"},{key:"trending",label:"Trending ⚡"},{key:"raised",label:"Most Raised"},{key:"ending",label:"Ending Soon"}];
  const sorted = {
    new: [...projects].sort((a,b)=>Number(b.id)-Number(a.id)),
    trending: [...projects].sort((a,b)=>b.change-a.change),
    raised: [...projects].sort((a,b)=>parseFloat(b.raised)-parseFloat(a.raised)),
    ending: [...projects].filter(p=>p.status==="ACTIVE").sort((a,b)=>b.progress-a.progress),
  };
  const filtered = (sorted[tab]||sorted.new).filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase())||p.ticker.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{minHeight:"100vh",background:"var(--page-bg)",color:"var(--text)"}}>
      <div style={{
        background: theme==="light" ? "linear-gradient(90deg,#7c3aed,#06b6d4,#10b981,#f59e0b,#ec4899,#8b5cf6)" : "var(--bg-deep)",
        borderBottom: theme==="light" ? "none" : "1px solid rgba(139,92,246,0.25)",
        height:30, overflow:"hidden", position:"relative",
        boxShadow: theme==="light" ? "0 3px 16px rgba(124,58,237,0.35)" : "none",
      }}>
        {theme==="dark" && <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(124,58,237,0.2),transparent 30%,rgba(34,211,238,0.1) 60%,transparent 80%,rgba(245,158,11,0.15))",pointerEvents:"none"}}/>}
        <div style={{display:"flex",animation:"marquee 24s linear infinite",width:"max-content"}}>
          {[...projects,...projects].map((p,i)=>{const pal=getTokenPalette(p.id);return(
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"0 20px",fontSize:11,fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap",lineHeight:"30px"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:theme==="light"?"rgba(255,255,255,0.9)":pal.accent,display:"inline-block",boxShadow:theme==="light"?"0 0 8px rgba(255,255,255,0.8)":`0 0 7px ${pal.accent}`,flexShrink:0,animation:"blink 2s ease-in-out infinite"}}/>
              <span style={{color:theme==="light"?"#fff":pal.accent,fontWeight:700,textShadow:theme==="light"?"0 1px 4px rgba(0,0,0,0.25)":"none"}}>${p.ticker}</span>
              <span style={{color:theme==="light"?"rgba(255,255,255,0.9)":"var(--text-secondary)",fontWeight:600}}>{p.price.toFixed(5)}</span>
              <span style={{color:theme==="light"?"#fff":p.change>=0?"#22D3EE":"#F43F5E",fontWeight:700}}>{p.change>=0?"▲":"▼"}{Math.abs(p.change).toFixed(1)}%</span>
              <span style={{color:theme==="light"?"rgba(255,255,255,0.3)":"rgba(139,92,246,0.3)",fontSize:8}}>◆</span>
            </span>
          );})}
        </div>
      </div>
      <header style={{background:"var(--header-bg)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--header-border)",position:"sticky",top:0,zIndex:50,boxShadow:"var(--header-shadow)"}}>
        <div style={{maxWidth:860,margin:"0 auto",padding:"0 16px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",inset:-4,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)",pointerEvents:"none"}}/>
              <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="10" fill={theme==="light"?"#7c3aed":"rgba(124,58,237,0.15)"} stroke={theme==="light"?"#6d28d9":"rgba(139,92,246,0.4)"} strokeWidth="1"/>
                <ellipse cx="22" cy="28" rx="12" ry="9" fill="#7C3AED" opacity="0.9"/>
                <ellipse cx="22" cy="25" rx="9" ry="8" fill="#8B5CF6"/>
                <path d="M13.5 22.5 Q10.5 17 11.5 13.5 Q13 18.5 15.5 19.5" fill="#22D3EE"/>
                <path d="M30.5 22.5 Q33.5 17 32.5 13.5 Q31 18.5 28.5 19.5" fill="#22D3EE"/>
                <ellipse cx="22" cy="23" rx="3.5" ry="3" fill="#fff" opacity="0.2"/>
                <circle cx="19.5" cy="22" r="1.8" fill={theme==="light"?"#5b21b6":"var(--bg)"} opacity="0.5"/>
                <circle cx="24.5" cy="22" r="1.8" fill={theme==="light"?"#5b21b6":"var(--bg)"} opacity="0.5"/>
              </svg>
            </div>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:17,letterSpacing:"-0.02em",background:"linear-gradient(90deg,#A78BFA,#22D3EE)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Mammoth</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <ThemeToggle theme={theme} onToggle={onToggleTheme}/>
            <button onClick={onLaunch} style={{background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(34,211,238,0.08))",border:"1px solid rgba(139,92,246,0.4)",color:"#A78BFA",borderRadius:6,padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,cursor:"pointer",fontWeight:700,letterSpacing:"0.04em",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 16px rgba(139,92,246,0.4)";e.currentTarget.style.borderColor="#8B5CF6";e.currentTarget.style.color="#22D3EE"}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";e.currentTarget.style.color="#A78BFA"}}>LAUNCH</button>
            <WalletButton walletState={walletState} onOpenModal={onOpenModal} onDisconnect={onDisconnect}/>
          </div>
        </div>
      </header>
      <div style={{background:"var(--stats-bg)",borderBottom:"1px solid var(--stats-border)"}}>
        <div style={{maxWidth:860,margin:"0 auto",padding:"12px 16px",display:"flex",gap:8}}>
          {[
            ["active cycles",projects.filter(p=>p.status==="ACTIVE").length,"#22D3EE","rgba(34,211,238,0.08)","rgba(34,211,238,0.22)"],
            ["projects",projects.length,"#8B5CF6","rgba(139,92,246,0.08)","rgba(139,92,246,0.22)"],
            ["24h volume","823K SOL","#F59E0B","rgba(245,158,11,0.08)","rgba(245,158,11,0.22)"],
            ["raised","1.84K SOL","#10B981","rgba(16,185,129,0.08)","rgba(16,185,129,0.22)"],
          ].map(([l,v,c,bg,bdr],i)=>(
            <div key={i} style={{flex:1,textAlign:"center",background:bg,border:`1px solid ${bdr}`,borderRadius:8,padding:"9px 4px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:15,color:c,textShadow:`0 0 14px ${c}99`,marginBottom:2}}>{v}</div>
              <div style={{fontSize:9,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.05em"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <main style={{maxWidth:860,margin:"0 auto",padding:"18px 16px 56px"}}>
        {/* Hero tagline */}
        <div style={{marginBottom:20,padding:"16px 18px",background:"var(--hero-bg)",border:"1px solid var(--hero-border)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,boxShadow:theme==="light"?"0 4px 24px rgba(124,58,237,0.15)":"none"}}>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:3}}>
              The fastest way to{" "}
              <span style={{background:"linear-gradient(90deg,#8B5CF6,#22D3EE)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>launch and buy into a token</span>
            </div>
            <div style={{fontSize:11,color:theme==="light"?"rgba(255,255,255,0.85)":"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace"}}>permissionless · cycle-based · no curation · no approvals</div>
          </div>
          <button onClick={onLaunch} style={{background:theme==="light"?"#fff":"linear-gradient(135deg,#7C3AED,#8B5CF6)",color:theme==="light"?"#7c3aed":"#fff",border:"none",borderRadius:7,padding:"10px 20px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:12,cursor:"pointer",letterSpacing:"0.05em",boxShadow:theme==="light"?"0 4px 16px rgba(0,0,0,0.15)":"0 0 20px rgba(139,92,246,0.4)",whiteSpace:"nowrap",flexShrink:0}}>
            LAUNCH TOKEN →
          </button>
        </div>
        <div style={{display:"flex",gap:2,overflowX:"auto",scrollbarWidth:"none",background:"var(--panel-alt)",border:"1px solid #1a2438",borderRadius:7,padding:3,marginBottom:12}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:500,letterSpacing:"0.04em",padding:"7px 13px",borderRadius:5,transition:"all 0.12s",whiteSpace:"nowrap",flexShrink:0,color:tab===t.key?"var(--bg)":"var(--text-dim)",background:tab===t.key?"#8B5CF6":"transparent"}}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{position:"relative",marginBottom:16}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="search tokens..."
            style={{width:"100%",background:"var(--panel-alt)",border:"1px solid #1a2438",borderRadius:6,padding:"9px 12px 9px 36px",color:"var(--text)",fontSize:13,fontFamily:"'IBM Plex Mono',monospace",outline:"none"}}
            onFocus={e=>e.currentTarget.style.borderColor="#7C3AED"}
            onBlur={e=>e.currentTarget.style.borderColor="var(--border-sub)"}/>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)",fontSize:15,pointerEvents:"none"}}>⌕</span>
        </div>
        <div style={{fontSize:11,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:12}}>{filtered.length} project{filtered.length!==1?"s":""}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:8}}>
          {filtered.map((p,i)=>(
            <div key={p.id} style={{animation:"fadeUp 0.2s ease both",animationDelay:`${i*0.033}s`}}>
              <ProjectCard p={p} onClick={()=>onSelectProject(p)} theme={theme}/>
            </div>
          ))}
        </div>
        {filtered.length===0&&<div style={{textAlign:"center",padding:"56px 0",color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",fontSize:12}}>no tokens found</div>}
        <div style={{marginTop:44,paddingTop:20,borderTop:"1px solid #1a2438",textAlign:"center"}}>
          <div style={{fontSize:11,color:"var(--bar-empty)",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.9}}>
            Mammoth Protocol · permissionless issuance · 2% fee on Mammoth-routed trades<br/>not a curator · not a guarantor · not financial advice
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT DETAIL
// ═══════════════════════════════════════════════════════════════════════════════

function PriceChart({ data, cycleStart }) {
  const { useRef, useState: useS } = window.React || { useRef: () => ({current:null}), useState: (v) => [v,()=>{}] };
  const svgRef = useRef(null);
  const [hover, setHover] = useS(null);
  const W=800,H=180,PAD={t:8,r:8,b:24,l:52};
  const cw=W-PAD.l-PAD.r, ch=H-PAD.t-PAD.b;
  const prices=data.map(d=>d.p), minP=Math.min(...prices), maxP=Math.max(...prices), rng=maxP-minP||0.001;
  const toX=i=>PAD.l+(i/(data.length-1))*cw;
  const toY=p=>PAD.t+(1-(p-minP)/rng)*ch;
  const linePts=data.map((d,i)=>`${toX(i)},${toY(d.p)}`).join(" ");
  const areaPts=`${PAD.l},${PAD.t+ch} `+data.map((d,i)=>`${toX(i)},${toY(d.p)}`).join(" ")+` ${PAD.l+cw},${PAD.t+ch}`;
  const gridPrices=[minP,minP+rng*0.33,minP+rng*0.66,maxP];
  const handleMove=(e)=>{
    const rect=svgRef.current?.getBoundingClientRect();
    if(!rect)return;
    const clientX=e.touches?e.touches[0].clientX:e.clientX;
    const relX=(clientX-rect.left)/rect.width*W;
    const idx=Math.round(((relX-PAD.l)/cw)*(data.length-1));
    if(idx>=0&&idx<data.length)setHover({idx,x:toX(idx),y:toY(data[idx].p),p:data[idx].p,t:data[idx].t});
  };
  return (
    <div style={{position:"relative",width:"100%",userSelect:"none"}}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block",overflow:"visible"}}
        onMouseMove={handleMove} onTouchMove={handleMove} onMouseLeave={()=>setHover(null)} onTouchEnd={()=>setHover(null)}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity="0.15"/><stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/></linearGradient>
          <clipPath id="cc"><rect x={PAD.l} y={PAD.t} width={cw} height={ch}/></clipPath>
        </defs>
        {gridPrices.map((p,i)=>(
          <g key={i}>
            <line x1={PAD.l} y1={toY(p)} x2={PAD.l+cw} y2={toY(p)} stroke="var(--border)" strokeWidth="1"/>
            <text x={PAD.l-4} y={toY(p)+4} textAnchor="end" fill="var(--text-muted)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">{p.toFixed(4)}</text>
          </g>
        ))}
        {cycleStart&&<g>
          <line x1={toX(cycleStart)} y1={PAD.t} x2={toX(cycleStart)} y2={PAD.t+ch} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
          <text x={toX(cycleStart)+4} y={PAD.t+12} fill="var(--text-dim)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">Cycle 2</text>
        </g>}
        <polygon points={areaPts} fill="url(#ag)" clipPath="url(#cc)"/>
        <polyline points={linePts} fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" clipPath="url(#cc)"/>
        {hover&&<g>
          <line x1={hover.x} y1={PAD.t} x2={hover.x} y2={PAD.t+ch} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
          <circle cx={hover.x} cy={hover.y} r="4" fill="#8B5CF6"/>
          <circle cx={hover.x} cy={hover.y} r="7" fill="#8B5CF6" opacity="0.2"/>
        </g>}
        {[0,0.25,0.5,0.75,1].map((f,i)=>{const idx=Math.round(f*(data.length-1));const d=new Date(data[idx].t);return(<text key={i} x={toX(idx)} y={H-6} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">{(d.getMonth()+1)}/{d.getDate()}</text>);})}
      </svg>
      {hover&&<div style={{position:"absolute",top:8,left:`clamp(8px,${(hover.x/W*100).toFixed(1)}%,calc(100% - 120px))`,background:"var(--panel)",border:"1px solid #252848",borderRadius:6,padding:"5px 10px",pointerEvents:"none"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text)",fontWeight:600}}>{hover.p.toFixed(6)} SOL</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--text-dim)"}}>{new Date(hover.t).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
      </div>}
    </div>
  );
}

// ─── STEP CURVE ENGINE ────────────────────────────────────────────────────────
// Simulates the Mammoth step bonding curve.
// Given SOL input, walks the curve step-by-step and returns tokens out,
// effective price, step crossings, and remaining allocation after purchase.
//
// State machine for BuyPanel:
//   IDLE → AWAITING_CONFIRM → LOADING → SUCCESS | ERROR
//   SUCCESS/ERROR → IDLE (via reset)

function computeStepCurve({ solIn, sold, allocation, startPrice, stepSize, stepIncrement, feeBps = 200 }) {
  const fee = solIn * (feeBps / 10000);
  let budget = solIn - fee;
  let tokensSold = sold;
  let tokensOut = 0;
  const steps = [];

  while (budget > 0 && tokensSold < allocation) {
    const stepIndex = Math.floor(tokensSold / stepSize);
    const priceNow = startPrice + stepIndex * stepIncrement;
    const tokensThisStep = Math.min(stepSize - (tokensSold % stepSize), allocation - tokensSold);
    const costForStep = tokensThisStep * priceNow;

    if (budget >= costForStep) {
      budget -= costForStep;
      tokensSold += tokensThisStep;
      tokensOut += tokensThisStep;
      steps.push({ price: priceNow, tokens: tokensThisStep });
    } else {
      const partial = Math.floor(budget / priceNow);
      tokensOut += partial;
      tokensSold += partial;
      budget -= partial * priceNow;
      steps.push({ price: priceNow, tokens: partial });
      break;
    }
  }

  const stepsCrossed = new Set(steps.map(s => s.price)).size - 1;
  const effectivePrice = tokensOut > 0 ? (solIn - fee) / tokensOut : startPrice;
  const newPrice = startPrice + Math.floor(tokensSold / stepSize) * stepIncrement;
  const nextStepIn = stepSize - (tokensSold % stepSize);
  const remainingAfter = allocation - tokensSold;

  return { tokensOut, fee, effectivePrice, newPrice, nextStepIn, stepsCrossed, remainingAfter, soldAfter: tokensSold };
}

// Mock async transaction — simulates wallet pop-up + chain confirmation
// Randomly fails ~15% of the time to exercise error state
async function mockExecuteBuy({ solIn, tokensOut, ticker }) {
  await new Promise(r => setTimeout(r, 900));   // wallet signing delay
  await new Promise(r => setTimeout(r, 700));   // chain confirmation delay
  if (Math.random() < 0.15) throw new Error("Transaction rejected by network");
  const sig = Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 6)).join("");
  return { signature: sig, solIn, tokensOut, ticker, ts: Date.now() };
}

function BuyPanel({ cycle, price, ticker, walletConnected, onConnect, onPurchaseComplete }) {
  // ── State machine ──────────────────────────────────────────────────────────
  // txState: "idle" | "awaiting" | "loading" | "success" | "error"
  const [txState, setTxState] = useState("idle");
  const [sol, setSol] = useState("");
  const [receipt, setReceipt] = useState(null);   // filled on success
  const [errMsg, setErrMsg] = useState("");        // filled on error
  const [slippage, setSlippage] = useState(1);
  const [showSlippage, setShowSlippage] = useState(false);

  const PRESETS = [0.1, 0.5, 1, 5];
  const solNum = parseFloat(sol) || 0;

  // ── Price computation ──────────────────────────────────────────────────────
  const quote = solNum > 0 ? computeStepCurve({
    solIn: solNum,
    sold: cycle.sold,
    allocation: cycle.allocation,
    startPrice: cycle.currentPrice,
    stepSize: cycle.stepSize || 5000,
    stepIncrement: cycle.stepIncrement || 0.00022,
    feeBps: 200,
  }) : null;

  const tokensOut = quote?.tokensOut ?? 0;
  const exceedsRights = walletConnected && cycle.userRights > 0 && tokensOut > (cycle.userRights - (cycle.userRightsUsed || 0));
  const exceedsAllocation = quote ? quote.remainingAfter < 0 : false;
  const slippageOk = quote ? ((quote.effectivePrice - cycle.currentPrice) / cycle.currentPrice * 100) <= slippage : true;
  const hasError = exceedsRights || exceedsAllocation || (!slippageOk && solNum > 0);

  // ── Validation message ─────────────────────────────────────────────────────
  const validationMsg = exceedsRights
    ? `Exceeds your rights allocation (${(cycle.userRights || 0).toLocaleString()} tokens)`
    : exceedsAllocation
    ? "Amount exceeds remaining cycle allocation"
    : !slippageOk && solNum > 0
    ? `Price impact ${((quote.effectivePrice - cycle.currentPrice) / cycle.currentPrice * 100).toFixed(2)}% exceeds slippage tolerance ${slippage}%`
    : null;

  // ── Button label + disabled state ──────────────────────────────────────────
  const canSubmit = walletConnected && solNum > 0 && !hasError && txState === "idle";
  const btnLabel = {
    idle: walletConnected ? (solNum > 0 ? "CONFIRM PURCHASE" : "ENTER AMOUNT") : "CONNECT WALLET",
    awaiting: "AWAITING WALLET...",
    loading: "CONFIRMING ON-CHAIN...",
    success: "DONE",
    error: "TRY AGAIN",
  }[txState];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBuy = async () => {
    if (!walletConnected) { onConnect(); return; }
    if (!canSubmit && txState !== "error") return;

    setTxState("awaiting");
    setErrMsg("");
    try {
      setTxState("loading");
      const result = await mockExecuteBuy({ solIn: solNum, tokensOut, ticker });
      setReceipt(result);
      setTxState("success");
      onPurchaseComplete?.(result, quote);
    } catch (e) {
      setErrMsg(e.message);
      setTxState("error");
    }
  };

  const handleReset = () => {
    setTxState("idle");
    setSol("");
    setReceipt(null);
    setErrMsg("");
  };

  // ── Closed cycle fallback ──────────────────────────────────────────────────
  if (cycle.status !== "ACTIVE") return (
    <div style={{background:"var(--panel)",border:"1px solid #1d2540",borderRadius:10,padding:"20px 18px"}}>
      <div style={{textAlign:"center",color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,marginBottom:16}}>Cycle ended — trade on secondary</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button style={{background:"#8B5CF6",color:"#fff",border:"none",borderRadius:6,padding:"12px 0",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,cursor:"pointer"}}>BUY</button>
        <button style={{background:"transparent",color:"#F43F5E",border:"1px solid rgba(248,113,113,0.5)",borderRadius:6,padding:"12px 0",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,cursor:"pointer"}}>SELL</button>
      </div>
      <div style={{marginTop:10,fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",textAlign:"center"}}>2% fee on Mammoth-routed trades · aggregator-routed</div>
    </div>
  );

  // ── SUCCESS state ──────────────────────────────────────────────────────────
  if (txState === "success" && receipt) return (
    <div style={{background:"var(--panel)",border:"1px solid rgba(139,92,246,0.35)",borderRadius:10,padding:"24px 18px",animation:"fadeUp 0.25s ease"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:22}}>✓</div>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:4}}>Purchase confirmed</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-dim)"}}>Transaction landed on-chain</div>
      </div>

      <div style={{background:"var(--panel-alt)",border:"1px solid #1d2540",borderRadius:8,padding:"14px",marginBottom:16}}>
        {[
          ["Tokens received", `${receipt.tokensOut.toLocaleString()} ${ticker}`, "#10B981"],
          ["SOL spent", `${receipt.solIn.toFixed(4)} SOL`, "var(--text)"],
          ["Mammoth fee", `${(receipt.solIn * 0.02).toFixed(4)} SOL`, "var(--text-dim)"],
          ["Effective price", `${quote?.effectivePrice.toFixed(6)} SOL`, "var(--text-dim)"],
          ["Signature", receipt.signature.slice(0,8)+"...", "var(--text-muted)"],
        ].map(([l,v,c],i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<arr.length-1?"1px solid #1a2438":"none"}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-muted)"}}>{l}</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:c,fontWeight:600}}>{v}</span>
          </div>
        ))}
      </div>

      {quote?.stepsCrossed > 0 && (
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:6,padding:"9px 12px",marginBottom:14,fontSize:11,color:"#F59E0B",fontFamily:"'IBM Plex Mono',monospace"}}>
          ⚡ Your purchase crossed {quote.stepsCrossed} price step{quote.stepsCrossed>1?"s":""}. New price: {quote.newPrice.toFixed(5)} SOL
        </div>
      )}

      <button onClick={handleReset}
        style={{width:"100%",padding:"11px 0",borderRadius:7,border:"1px solid #252848",background:"transparent",color:"var(--text-dim)",fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:13,cursor:"pointer",letterSpacing:"0.04em"}}>
        BUY MORE
      </button>
    </div>
  );

  // ── IDLE / AWAITING / LOADING / ERROR states ───────────────────────────────
  const isProcessing = txState === "awaiting" || txState === "loading";

  return (
    <div style={{background:"var(--panel)",border:`1px solid ${txState==="error"?"rgba(248,113,113,0.3)":"var(--border)"}`,borderRadius:10,padding:"18px 16px",transition:"border-color 0.2s"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"var(--text)"}}>Buy ${ticker}</span>
        <button onClick={()=>setShowSlippage(s=>!s)}
          style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-dim)",display:"flex",alignItems:"center",gap:4}}>
          ⚙ {slippage}% slip
        </button>
      </div>

      {/* Slippage selector */}
      {showSlippage && (
        <div style={{background:"var(--panel-alt)",border:"1px solid #1d2540",borderRadius:7,padding:"10px 12px",marginBottom:12,animation:"fadeUp 0.15s ease"}}>
          <div style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:8}}>slippage tolerance</div>
          <div style={{display:"flex",gap:6}}>
            {[0.5,1,2,5].map(v=>(
              <button key={v} onClick={()=>{setSlippage(v);setShowSlippage(false);}}
                style={{flex:1,padding:"6px 0",background:slippage===v?"rgba(139,92,246,0.18)":"var(--panel)",border:`1px solid ${slippage===v?"#7C3AED":"var(--border)"}`,borderRadius:4,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:slippage===v?"#22D3EE":"var(--text-dim)",cursor:"pointer"}}>
                {v}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preset amounts */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
        {PRESETS.map(v=>(
          <button key={v} onClick={()=>!isProcessing&&setSol(String(v))}
            style={{background:sol===String(v)?"rgba(139,92,246,0.18)":"var(--panel-alt)",border:`1px solid ${sol===String(v)?"#7C3AED":"var(--border)"}`,borderRadius:5,padding:"7px 0",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:sol===String(v)?"#22D3EE":"var(--text-dim)",cursor:isProcessing?"not-allowed":"pointer",transition:"all 0.12s",opacity:isProcessing?0.5:1}}>
            {v} SOL
          </button>
        ))}
      </div>

      {/* SOL input */}
      <div style={{position:"relative",marginBottom:12}}>
        <input type="number" value={sol} onChange={e=>!isProcessing&&setSol(e.target.value)}
          placeholder="0.00" disabled={isProcessing}
          style={{width:"100%",background:"var(--panel-alt)",border:`1px solid ${hasError?"#F43F5E":txState==="error"?"rgba(248,113,113,0.4)":"var(--border)"}`,borderRadius:6,padding:"12px 52px 12px 14px",color:"var(--text)",fontSize:16,fontFamily:"'IBM Plex Mono',monospace",outline:"none",transition:"border-color 0.15s",opacity:isProcessing?0.6:1}}
          onFocus={e=>!isProcessing&&(e.currentTarget.style.borderColor=hasError?"#F43F5E":"#7C3AED")}
          onBlur={e=>e.currentTarget.style.borderColor=hasError?"#F43F5E":"var(--border)"}/>
        <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text-dim)",fontWeight:600}}>SOL</span>
      </div>

      {/* Quote breakdown */}
      {quote && solNum > 0 && (
        <div style={{background:"var(--panel-alt)",border:"1px solid #1d2540",borderRadius:7,padding:"11px 13px",marginBottom:12,animation:"fadeUp 0.15s ease"}}>
          {[
            ["You receive", `~${tokensOut.toLocaleString()} ${ticker}`, "var(--text)"],
            ["Mammoth fee (2%)", `${quote.fee.toFixed(4)} SOL`, "var(--text-dim)"],
            ["Effective price", `${quote.effectivePrice.toFixed(6)} SOL`, "var(--text-dim)"],
            ["Price impact", `+${((quote.effectivePrice - cycle.currentPrice) / cycle.currentPrice * 100).toFixed(2)}%`, ((quote.effectivePrice - cycle.currentPrice) / cycle.currentPrice * 100) > slippage ? "#F43F5E" : "var(--text-dim)"],
            walletConnected && cycle.userRights > 0 && ["Rights used", `${Math.min(tokensOut, cycle.userRights).toLocaleString()} / ${cycle.userRights.toLocaleString()}`, exceedsRights ? "#F43F5E" : "#6366F1"],
            quote.stepsCrossed > 0 && ["Steps crossed", `${quote.stepsCrossed} step${quote.stepsCrossed>1?"s":""}`, "#F59E0B"],
          ].filter(Boolean).map(([l,v,c],i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:i<arr.length-1?"1px solid #1a2438":"none"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-muted)"}}>{l}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:c,fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Validation error */}
      {validationMsg && (
        <div style={{background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:6,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#F43F5E",fontFamily:"'IBM Plex Mono',monospace",animation:"fadeUp 0.15s ease"}}>
          ⚠ {validationMsg}
        </div>
      )}

      {/* Network error */}
      {txState === "error" && errMsg && (
        <div style={{background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:6,padding:"10px 12px",marginBottom:12,animation:"fadeUp 0.15s ease"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#F43F5E",fontWeight:600,marginBottom:3}}>Transaction failed</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"rgba(248,113,113,0.7)"}}>{errMsg}</div>
        </div>
      )}

      {/* Loading state */}
      {isProcessing && (
        <div style={{background:"var(--panel-alt)",border:"1px solid #1d2540",borderRadius:7,padding:"12px",marginBottom:12,display:"flex",alignItems:"center",gap:10,animation:"fadeUp 0.15s ease"}}>
          <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid #252848",borderTopColor:"#8B5CF6",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#22D3EE",fontWeight:600}}>
              {txState==="awaiting"?"Waiting for wallet signature...":"Confirming on-chain..."}
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--text-muted)",marginTop:2}}>
              {txState==="awaiting"?"Approve in your wallet":"This takes a few seconds"}
            </div>
          </div>
        </div>
      )}

      {/* CTA button */}
      <button onClick={txState==="error"?handleReset:handleBuy}
        disabled={isProcessing || (txState==="idle" && (!walletConnected?false:!canSubmit))}
        style={{
          width:"100%", padding:"13px 0", borderRadius:7, border:"none",
          background: txState==="error"?"rgba(248,113,113,0.12)" : isProcessing?"#2d1f7a" : (!walletConnected||solNum>0)&&!hasError?"#8B5CF6":"var(--border)",
          color: txState==="error"?"#F43F5E" : isProcessing?"var(--text-dim)" : (!walletConnected||solNum>0)&&!hasError?"#fff":"var(--text-muted)",
          fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14,
          cursor: isProcessing?"not-allowed":"pointer",
          letterSpacing:"0.05em", transition:"all 0.15s",
          border: txState==="error"?"1px solid rgba(248,113,113,0.3)":"none",
        }}>
        {btnLabel}
      </button>

      <div style={{marginTop:10,fontSize:10,color:"#1a2240",fontFamily:"'IBM Plex Mono',monospace",textAlign:"center"}}>
        {slippage}% slippage · 2% Mammoth fee · no custody
      </div>
    </div>
  );
}

function CyclePanelDetail({ cycle }) {
  const pct = Math.round((cycle.sold/cycle.allocation)*100);
  return(
    <div style={{background:"var(--panel)",border:"1px solid #1d2540",borderRadius:10,padding:"16px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"var(--text)"}}>Cycle #{cycle.id}</span>
        {cycle.status==="ACTIVE"
          ?<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:600,letterSpacing:"0.06em",fontFamily:"'IBM Plex Mono',monospace",padding:"3px 9px",borderRadius:4,background:"rgba(139,92,246,0.13)",color:"#22D3EE",border:"1px solid rgba(139,92,246,0.28)"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#8B5CF6",display:"inline-block",animation:"blink 2s ease-in-out infinite"}}/>OPEN</span>
          :<span style={{fontSize:10,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",color:"var(--text-muted)"}}>ENDED</span>
        }
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-muted)"}}>{cycle.sold.toLocaleString()} / {cycle.allocation.toLocaleString()} sold</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#22D3EE",fontWeight:600}}>{pct}%</span>
        </div>
        <div style={{height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:cycle.status==="ACTIVE"?"linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)":"var(--bar-empty)",borderRadius:3}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:cycle.nextStepIn?12:0}}>
        {[["Curve",cycle.curveType+" 🔥"],["Current price",`${cycle.currentPrice.toFixed(5)} SOL`,"#22D3EE"],["Remaining",`${(cycle.allocation-cycle.sold).toLocaleString()}`],cycle.nextStepPrice&&["Next step",`${cycle.nextStepPrice.toFixed(5)} SOL`]].filter(Boolean).map(([l,v],i)=>(
          <div key={i} style={{background:"var(--panel-alt)",border:"1px solid #1a2438",borderRadius:6,padding:"9px 11px"}}>
            <div style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{l}</div>
            <div style={{fontSize:12,color:"var(--text)",fontFamily:"'IBM Plex Mono',monospace",fontWeight:600}}>{v}</div>
          </div>
        ))}
      </div>
      {cycle.nextStepIn&&cycle.status==="ACTIVE"&&(
        <div style={{background:"rgba(255,159,28,0.07)",border:"1px solid rgba(255,159,28,0.18)",borderRadius:6,padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:2}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#d97706"}}>⚡ next price jump in</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#F59E0B",fontWeight:700}}>{cycle.nextStepIn.toLocaleString()} tokens</span>
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ project: p, onBack, wallet, walletState, onOpenModal, onDisconnect, onConnect, onPurchase, onManageCycles, theme, onToggleTheme }) {
  const [tab, setTab] = useState("About");
  const up = p.change >= 0;
  const TABS = ["About","Tokenomics","Cycles","Treasury"];

  return(
    <div style={{minHeight:"100vh",background:"var(--page-bg)",color:"var(--text)"}}>
      <header style={{background:"var(--header-bg)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--header-border)",position:"sticky",top:0,zIndex:50,boxShadow:"var(--header-shadow)"}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 16px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={onBack} style={{background:"none",border:"none",color:"var(--text-dim)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"4px 6px 4px 0"}}>←</button>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,color:"var(--text)"}}>{p.name}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--text-dim)",background:"var(--badge-bg)",border:"1px solid #252848",borderRadius:3,padding:"2px 7px"}}>${p.ticker}</span>
              {p.status==="ACTIVE"&&<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",padding:"2px 8px",borderRadius:4,background:"rgba(139,92,246,0.13)",color:"#22D3EE",border:"1px solid rgba(139,92,246,0.28)"}}>
                <span style={{width:4,height:4,borderRadius:"50%",background:"#8B5CF6",display:"inline-block",animation:"blink 2s ease-in-out infinite"}}/>OPEN</span>}
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme}/>
          <WalletButton walletState={walletState} onOpenModal={onOpenModal} onDisconnect={onDisconnect}/>
        </div>
      </header>

      <div style={{maxWidth:960,margin:"0 auto",padding:"0 16px 64px"}}>
        {/* Above fold grid */}
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 310px",gap:16,alignItems:"start",paddingTop:20}} className="detail-grid">

          {/* LEFT */}
          <div>
            {/* Price + logo */}
            <div style={{marginBottom:16,display:"flex",alignItems:"flex-start",gap:14}}>
              {/* Logo — larger on detail page */}
              <div style={{flexShrink:0,filter:`drop-shadow(0 0 12px ${getTokenPalette(p.id).accent}88)`}}>
                <TokenLogo id={p.id} size={56} image={p.image || null}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:28,color:"#22D3EE",letterSpacing:"-0.03em",textShadow:"0 0 20px rgba(34,211,238,0.6)"}}>{p.price.toFixed(5)}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,color:"var(--text-dim)"}}>SOL</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:up?"#22D3EE":"#F43F5E"}}>{up?"▲":"▼"} {Math.abs(p.change).toFixed(1)}% (24h)</span>
                </div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-muted)"}}>{p.volume.toLocaleString()} vol · creator: {p.creator}</div>
              </div>
            </div>

            {/* Chart */}
            <div style={{background:"var(--panel)",border:"1px solid #1d2540",borderRadius:10,padding:"12px 8px 8px",marginBottom:12}}>
              <PriceChart data={p.chartData} cycleStart={Math.floor(p.chartData.length*0.62)}/>
            </div>

            {/* Cycle panel — desktop only */}
            <div className="desktop-only"><CyclePanelDetail cycle={p.cycleData}/></div>
          </div>

          {/* RIGHT: sticky buy panel */}
          <div style={{position:"sticky",top:68}}>
            <div className="mobile-only" style={{marginBottom:12}}><CyclePanelDetail cycle={p.cycleData}/></div>
            <BuyPanel cycle={p.cycleData} price={p.price} ticker={p.ticker} walletConnected={wallet} onConnect={onConnect} onPurchaseComplete={(r, q) => onPurchase?.(r, q)}/>
            {p._mine && onManageCycles && (
              <button onClick={onManageCycles} style={{ marginTop:8, width:"100%", padding:"9px 0", background:"transparent", border:"1px solid #252848", borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--text-dim)", cursor:"pointer", fontWeight:500, letterSpacing:"0.04em", transition:"all 0.13s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#8B5CF6";e.currentTarget.style.color="#22D3EE"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--badge-border)";e.currentTarget.style.color="var(--text-dim)"}}>
                MANAGE CYCLES →
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{marginTop:32,animation:"fadeUp 0.3s ease 0.1s both"}}>
          <div style={{display:"flex",gap:0,borderBottom:"1px solid #1d2540",marginBottom:20,overflowX:"auto",scrollbarWidth:"none"}}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{background:"none",border:"none",cursor:"pointer",padding:"10px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:500,letterSpacing:"0.04em",color:tab===t?"#22D3EE":"var(--text-muted)",borderBottom:`2px solid ${tab===t?"#8B5CF6":"transparent"}`,transition:"all 0.13s",whiteSpace:"nowrap",flexShrink:0}}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {tab==="About"&&(
            <div>
              <p style={{fontSize:14,color:"var(--text-secondary)",lineHeight:1.75,fontFamily:"'Space Grotesk',sans-serif",marginBottom:20}}>{p.description}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Creator",p.creator],["Launched",p.createdAt],["Supply mode",p.supplyMode],["Hard cap",p.hardCap?"Yes — final":"No"]].map(([k,v],i)=>(
                  <div key={i} style={{background:"var(--panel-alt)",border:"1px solid #1a2438",borderRadius:6,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{k}</div>
                    <div style={{fontSize:12,color:"var(--text-secondary)",fontFamily:"'IBM Plex Mono',monospace",wordBreak:"break-all"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="Tokenomics"&&(
            <div>
              <div style={{marginBottom:20}}>
                {[{label:"Public (cycles)",val:p.publicAlloc,color:"#22D3EE"},{label:"Treasury",val:p.treasuryAlloc,color:"#6D28D9"},{label:"Protocol (2%)",val:p.totalSupply*0.02,color:"var(--text-muted)"}].map((b,i)=>(
                  <div key={i} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text-secondary)"}}>{b.label}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text)",fontWeight:600}}>{(b.val/1_000_000).toFixed(0)}M · {((b.val/p.totalSupply)*100).toFixed(1)}%</span>
                    </div>
                    <div style={{height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(b.val/p.totalSupply)*100}%`,background:b.color,borderRadius:3}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Total supply",`${(p.totalSupply/1_000_000_000).toFixed(1)}B`],["Supply mode",p.supplyMode],["Rights policy","Non-transferable"],["Snapshot","At cycle open"]].map(([k,v],i)=>(
                  <div key={i} style={{background:"var(--panel-alt)",border:"1px solid #1a2438",borderRadius:6,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>{k}</div>
                    <div style={{fontSize:12,color:"var(--text-secondary)",fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="Cycles"&&(
            <div>
              {p.cycleHistory.map(c=>(
                <div key={c.id} style={{background:"var(--panel-alt)",border:"1px solid #1a2438",borderRadius:8,padding:"13px 14px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,color:"var(--text)"}}>Cycle #{c.id}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600,color:c.status==="COMPLETED"?"#22D3EE":c.status==="ACTIVE"?"#8B5CF6":"var(--text-muted)"}}>{c.status}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[["Allocation",`${(c.allocation/1000).toFixed(0)}K`],["Raised",c.raised],["Price range",c.priceRange]].map(([k,v],i)=>(
                      <div key={i}>
                        <div style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:3}}>{k}</div>
                        <div style={{fontSize:12,color:"var(--text-secondary)",fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==="Treasury"&&(
            <div>
              <div style={{marginBottom:16,fontSize:13,color:"var(--text-dim)",fontFamily:"'IBM Plex Mono',monospace"}}>Proceeds routing — on-chain, deterministic</div>
              {[["Creator treasury",p.cycleData.treasuryRouting.creator+"%","#10B981"],["Reserve (SOL)",p.cycleData.treasuryRouting.reserve+"%","var(--text-dim)"],["Sink / burn",p.cycleData.treasuryRouting.sink+"%","var(--text-muted)"],["Protocol fee","2% (fixed)","#6D28D9"]].map(([k,v,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #1a2438"}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text-secondary)"}}>{k}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:c,fontWeight:700}}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAUNCH WIZARD
// ═══════════════════════════════════════════════════════════════════════════════

// Form state shape:
// {
//   name:        string   — token full name
//   ticker:      string   — 2–6 char symbol
//   description: string   — markdown-safe description
//   supplyMode:  "fixed" | "elastic"
//   totalSupply: number   — only for fixed (default 1B)
//   publicPct:   number   — % of supply for public cycles (0–100)
//   treasuryPct: number   — remainder after public + protocol (auto)
// }
//
// Submission state: "idle" | "loading" | "success" | "error"

const TOTAL_SUPPLY_DEFAULT = 1_000_000_000;
const PROTOCOL_PCT = 2; // fixed — non-negotiable

const STEPS = [
  { id: 1, label: "Token info" },
  { id: 2, label: "Supply" },
  { id: 3, label: "Allocation" },
  { id: 4, label: "Review" },
];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{
                width:28, height:28, borderRadius:"50%",
                background: done ? "#10B981" : active ? "rgba(99,102,241,0.15)" : "var(--panel-alt)",
                border: `1.5px solid ${done || active ? "#8B5CF6" : "var(--border)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace",
                color: done ? "#fff" : active ? "#6366F1" : "var(--text-muted)",
                transition:"all 0.2s", flexShrink:0,
              }}>
                {done ? "✓" : s.id}
              </div>
              <span style={{ fontSize:10, fontFamily:"'IBM Plex Mono',monospace", color: active ? "#22D3EE" : done ? "var(--text-dim)" : "var(--text-muted)", whiteSpace:"nowrap", letterSpacing:"0.03em" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex:1, height:1, background: done ? "#10B981" : "var(--border)", margin:"0 8px", marginBottom:22, transition:"background 0.3s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Shared field components ───────────────────────────────────────────────────
function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:7 }}>
        <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:"0.05em", fontWeight:600 }}>
          {label}
        </label>
        {hint && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)" }}>{hint}</span>}
      </div>
      {children}
      {error && <div style={{ marginTop:5, fontSize:11, color:"#F43F5E", fontFamily:"'IBM Plex Mono',monospace" }}>↑ {error}</div>}
    </div>
  );
}

const inputStyle = (err) => ({
  width:"100%", background:"var(--panel-alt)", border:`1px solid ${err ? "#F43F5E" : "var(--border)"}`,
  borderRadius:6, padding:"11px 14px", color:"var(--text)", fontSize:14,
  fontFamily:"'IBM Plex Mono',monospace", outline:"none", transition:"border-color 0.13s",
});

// ── Image / GIF upload component ────────────────────────────────────────────
// Accepts image files including GIFs. Converts to data URL for storage.
// In production: upload to IPFS/Arweave, store the content hash/URL.
function ImageUpload({ value, onChange, onClear }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null); // FIX: was useState(null) — a ref, not state

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["image/gif","image/png","image/webp","image/jpeg"];
    if (!allowed.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max
    const objectUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result, objectUrl);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  if (value) {
    return (
      <div style={{ position:"relative", display:"inline-block" }}>
        <img src={value} alt="token" style={{
          width:80, height:80, borderRadius:12, objectFit:"cover",
          border:"1.5px solid rgba(139,92,246,0.5)",
          display:"block",
        }}/>
        <button onClick={onClear} style={{
          position:"absolute", top:-6, right:-6,
          width:20, height:20, borderRadius:"50%",
          background:"#F43F5E", border:"none",
          color:"#fff", fontSize:12, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          lineHeight:1, fontWeight:700,
        }}>×</button>
        <div style={{ marginTop:6, fontSize:10, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace" }}>
          GIF/image set ✓
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e)=>{e.preventDefault();setDragging(true);}}
      onDragLeave={()=>setDragging(false)}
      onDrop={handleDrop}
      onClick={()=>inputRef.current?.click()} // FIX: use ref, not getElementById
      style={{
        border: `1.5px dashed ${dragging ? "#8B5CF6" : "rgba(139,92,246,0.3)"}`,
        borderRadius:8, padding:"20px 16px", textAlign:"center",
        cursor:"pointer", transition:"all 0.15s",
        background: dragging ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.03)",
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="#8B5CF6";e.currentTarget.style.background="rgba(139,92,246,0.06)";}}
      onMouseLeave={e=>{if(!dragging){e.currentTarget.style.borderColor="rgba(139,92,246,0.3)";e.currentTarget.style.background="rgba(139,92,246,0.03)";}}}
    >
      <input
        ref={inputRef} // FIX: attach ref, removed brittle id="token-img-input"
        type="file"
        accept="image/gif,image/png,image/webp,image/jpeg"
        style={{display:"none"}}
        onChange={e => handleFile(e.target.files[0])}
      />
      <div style={{ fontSize:24, marginBottom:8 }}>🖼</div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--text-dim)", marginBottom:4 }}>
        Drop a GIF, PNG or WEBP here
      </div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)" }}>
        or click to browse · max 5MB
      </div>
    </div>
  );
}

// ── Step 1: Token info ────────────────────────────────────────────────────────
function StepInfo({ form, onChange, errors }) {
  return (
    <div style={{ animation:"fadeUp 0.2s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:"var(--text)", marginBottom:6 }}>Token info</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--text-muted)" }}>Name your token. You can't change these after deploy.</div>
      </div>

      <Field label="TOKEN NAME" error={errors.name}>
        <input
          value={form.name} onChange={e => onChange("name", e.target.value)}
          placeholder="e.g. MegaTusk"
          style={inputStyle(errors.name)}
          onFocus={e => e.target.style.borderColor = "#7C3AED"}
          onBlur={e => e.target.style.borderColor = errors.name ? "#F43F5E" : "var(--border)"}
          maxLength={32}
        />
      </Field>

      <Field label="TICKER" hint={`${form.ticker.length}/6`} error={errors.ticker}>
        <input
          value={form.ticker} onChange={e => onChange("ticker", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))}
          placeholder="e.g. TUSK"
          style={{ ...inputStyle(errors.ticker), textTransform:"uppercase", letterSpacing:"0.1em" }}
          onFocus={e => e.target.style.borderColor = "#7C3AED"}
          onBlur={e => e.target.style.borderColor = errors.ticker ? "#F43F5E" : "var(--border)"}
          maxLength={6}
        />
      </Field>

      <Field label="DESCRIPTION" hint={`${form.description.length}/280`} error={errors.description}>
        <textarea
          value={form.description} onChange={e => onChange("description", e.target.value)}
          placeholder="What is this token for? What does this project do?"
          rows={4} maxLength={280}
          style={{ ...inputStyle(errors.description), resize:"vertical", lineHeight:1.6, fontFamily:"'Space Grotesk',sans-serif", fontSize:13 }}
          onFocus={e => e.target.style.borderColor = "#7C3AED"}
          onBlur={e => e.target.style.borderColor = errors.description ? "#F43F5E" : "var(--border)"}
        />
      </Field>

      <Field label="TOKEN IMAGE" hint="GIF · PNG · WEBP · optional">
        <ImageUpload
          value={form.imagePreview}
          onChange={(dataUrl, objectUrl) => {
            onChange("image", dataUrl);
            onChange("imagePreview", objectUrl);
          }}
          onClear={() => { onChange("image", null); onChange("imagePreview", null); }}
        />
      </Field>
    </div>
  );
}

// ── Step 2: Supply mode ───────────────────────────────────────────────────────
function StepSupply({ form, onChange }) {
  const modes = [
    {
      id: "fixed",
      label: "Fixed Supply",
      badge: "RECOMMENDED",
      badgeColor: "#8B5CF6",
      desc: "Total supply defined at launch. All tokens issued through cycles. No inflation ever.",
      pros: ["Simple and credible", "Instant scarcity narrative", "No rights required"],
      warn: null,
    },
    {
      id: "elastic",
      label: "Elastic Supply",
      badge: "ADVANCED",
      badgeColor: "#F59E0B",
      desc: "No max supply set at launch. Mint only through cycles. Can convert to fixed later — irreversibly.",
      pros: ["Test demand before committing", "Flexible across cycles", "Hard cap always available"],
      warn: "Rights-based issuance is mandatory. All future cycles require holder snapshots.",
    },
  ];

  return (
    <div style={{ animation:"fadeUp 0.2s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:"var(--text)", marginBottom:6 }}>Supply model</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--text-muted)" }}>This cannot be changed after deploy. Fixed is right for most projects.</div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {modes.map(m => {
          const sel = form.supplyMode === m.id;
          return (
            <div key={m.id} onClick={() => onChange("supplyMode", m.id)}
              style={{
                background: sel ? "rgba(139,92,246,0.08)" : "var(--panel-alt)",
                border: `1.5px solid ${sel ? "#8B5CF6" : "var(--border)"}`,
                borderRadius:10, padding:"18px 18px", cursor:"pointer",
                transition:"all 0.15s", position:"relative",
              }}
              onMouseEnter={e => { if(!sel) e.currentTarget.style.borderColor="#3d2a6a"; }}
              onMouseLeave={e => { if(!sel) e.currentTarget.style.borderColor="var(--border)"; }}
            >
              {/* Radio + labels */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${sel ? "#8B5CF6" : "var(--badge-border)"}`, background: sel ? "#8B5CF6" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                  {sel && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>}
                </div>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:"var(--text)" }}>{m.label}</span>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", fontFamily:"'IBM Plex Mono',monospace", color:m.badgeColor, background:`${m.badgeColor}18`, border:`1px solid ${m.badgeColor}30`, borderRadius:3, padding:"2px 7px" }}>
                  {m.badge}
                </span>
              </div>

              <p style={{ fontSize:13, color:"var(--text-secondary)", fontFamily:"'Space Grotesk',sans-serif", lineHeight:1.6, marginBottom:12 }}>{m.desc}</p>

              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom: m.warn ? 12 : 0 }}>
                {m.pros.map((p, i) => (
                  <span key={i} style={{ fontSize:10, fontFamily:"'IBM Plex Mono',monospace", color:"var(--text-dim)", background:"var(--panel)", border:"1px solid #252848", borderRadius:3, padding:"3px 8px" }}>✓ {p}</span>
                ))}
              </div>

              {m.warn && (
                <div style={{ background:"rgba(255,159,28,0.07)", border:"1px solid rgba(255,159,28,0.2)", borderRadius:6, padding:"9px 12px", fontSize:11, color:"#d97706", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.6 }}>
                  ⚠ {m.warn}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {form.supplyMode === "fixed" && (
        <div style={{ marginTop:20, animation:"fadeUp 0.15s ease" }}>
          <Field label="TOTAL SUPPLY" hint="tokens">
            <div style={{ display:"flex", gap:8 }}>
              <input
                type="number" value={form.totalSupply}
                onChange={e => onChange("totalSupply", Math.max(1, parseInt(e.target.value)||0))}
                style={{ ...inputStyle(false), flex:1 }}
                onFocus={e => e.target.style.borderColor="#7C3AED"}
                onBlur={e => e.target.style.borderColor="var(--border)"}
              />
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {[100_000_000, 1_000_000_000, 10_000_000_000].map(v => (
                  <button key={v} onClick={() => onChange("totalSupply", v)}
                    style={{ background: form.totalSupply===v ? "rgba(139,92,246,0.18)" : "var(--panel-alt)", border:`1px solid ${form.totalSupply===v?"#7C3AED":"var(--border)"}`, borderRadius:4, padding:"4px 10px", fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: form.totalSupply===v ? "#22D3EE" : "var(--text-dim)", cursor:"pointer", whiteSpace:"nowrap" }}>
                    {v >= 1_000_000_000 ? `${v/1_000_000_000}B` : `${v/1_000_000}M`}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop:6, fontSize:10, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace" }}>
              = {(form.totalSupply).toLocaleString()} tokens
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Allocation ────────────────────────────────────────────────────────
function StepAllocation({ form, onChange }) {
  const treasuryPct = 100 - PROTOCOL_PCT - form.publicPct;
  const total = form.totalSupply || TOTAL_SUPPLY_DEFAULT;
  const publicTokens  = Math.floor(total * form.publicPct  / 100);
  const treasuryTokens = Math.floor(total * treasuryPct / 100);
  const protocolTokens = Math.floor(total * PROTOCOL_PCT / 100);
  const valid = treasuryPct >= 0 && form.publicPct > 0;

  const segments = [
    { label:"Public", pct:form.publicPct, color:"#8B5CF6", tokens:publicTokens },
    { label:"Treasury", pct:treasuryPct, color:"#6D28D9", tokens:treasuryTokens },
    { label:"Protocol", pct:PROTOCOL_PCT, color:"var(--badge-border)", tokens:protocolTokens },
  ];

  return (
    <div style={{ animation:"fadeUp 0.2s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:"var(--text)", marginBottom:6 }}>Allocation</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--text-muted)" }}>Split your supply between public cycles and your treasury. Protocol takes 2% — fixed.</div>
      </div>

      {/* Visual bar */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", height:14, borderRadius:4, overflow:"hidden", gap:1 }}>
          {segments.map((s, i) => (
            <div key={i} style={{ width:`${Math.max(s.pct, 0)}%`, background:s.color, transition:"width 0.25s ease", minWidth:s.pct>0?2:0 }}/>
          ))}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:10, flexWrap:"wrap" }}>
          {segments.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }}/>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-dim)" }}>{s.label} {Math.max(s.pct,0).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Public slider */}
      <Field label="PUBLIC ALLOCATION" hint={`${form.publicPct}% — for cycles`}>
        <input
          type="range" min={5} max={98 - PROTOCOL_PCT} value={form.publicPct}
          onChange={e => onChange("publicPct", Number(e.target.value))}
          style={{ width:"100%", accentColor:"#8B5CF6", height:4, cursor:"pointer" }}
        />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)" }}>5%</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)" }}>98%</span>
        </div>
      </Field>

      {/* Breakdown cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:4 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ background:"var(--panel-alt)", border:`1px solid ${i===2?"var(--border)":"var(--border)"}`, borderRadius:7, padding:"10px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:s.color }}/>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)" }}>{s.label}</span>
              {i === 2 && <span style={{ fontSize:9, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace" }}>FIXED</span>}
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"var(--text)", fontWeight:600, marginBottom:2 }}>
              {Math.max(s.pct, 0).toFixed(1)}%
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-dim)" }}>
              {s.tokens >= 1_000_000_000 ? `${(s.tokens/1_000_000_000).toFixed(2)}B`
               : s.tokens >= 1_000_000 ? `${(s.tokens/1_000_000).toFixed(1)}M`
               : s.tokens.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {!valid && (
        <div style={{ marginTop:14, background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:6, padding:"9px 12px", fontSize:11, color:"#F43F5E", fontFamily:"'IBM Plex Mono',monospace" }}>
          ⚠ Public allocation must be at least 5%
        </div>
      )}

      {form.supplyMode === "elastic" && (
        <div style={{ marginTop:14, background:"rgba(255,159,28,0.07)", border:"1px solid rgba(255,159,28,0.2)", borderRadius:6, padding:"9px 12px", fontSize:11, color:"#d97706", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.6 }}>
          ⚡ Elastic mode: percentages apply per cycle mint, not to a fixed total. Treasury % is creator-controlled.
        </div>
      )}
    </div>
  );
}

// ── Step 4: Review ────────────────────────────────────────────────────────────
function StepReview({ form, onSubmit, submitState, createdToken }) {
  const treasuryPct = 100 - PROTOCOL_PCT - form.publicPct;
  const total = form.totalSupply || TOTAL_SUPPLY_DEFAULT;

  const fmtSupply = (n) => n >= 1_000_000_000 ? `${(n/1_000_000_000).toFixed(2)}B` : n >= 1_000_000 ? `${(n/1_000_000).toFixed(0)}M` : n.toLocaleString();

  if (submitState === "success" && createdToken) {
    return (
      <div style={{ animation:"fadeUp 0.25s ease", textAlign:"center" }}>
        <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:26 }}>✓</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:"var(--text)", marginBottom:8 }}>
          ${createdToken.ticker} deployed
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--text-dim)", marginBottom:28 }}>
          Token created · ready for your first cycle
        </div>

        <div style={{ background:"var(--panel-alt)", border:"1px solid #1d2540", borderRadius:10, padding:"16px", marginBottom:20, textAlign:"left" }}>
          {[
            ["Token", createdToken.name],
            ["Ticker", "$" + createdToken.ticker],
            ["Supply", fmtSupply(createdToken.totalSupply || total)],
            ["Mode", createdToken.supplyMode],
            ["Mint address", createdToken.mint],
          ].map(([k,v], i, arr) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom: i < arr.length-1 ? "1px solid #1a2438" : "none" }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>{k}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-secondary)", fontWeight:600, wordBreak:"break-all", textAlign:"right", maxWidth:"55%" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <button onClick={() => window.__mammothLaunchCycle?.()}
            style={{ padding:"12px 0", background:"#8B5CF6", color:"#fff", border:"none", borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:"0.04em" }}>
            CREATE CYCLE →
          </button>
          <button onClick={() => window.__mammothGoHome?.()}
            style={{ padding:"12px 0", background:"transparent", color:"var(--text-dim)", border:"1px solid #252848", borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            GO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation:"fadeUp 0.2s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:"var(--text)", marginBottom:6 }}>Review & deploy</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"var(--text-muted)" }}>Parameters are immutable once deployed. Check everything.</div>
      </div>

      {/* Summary card */}
      <div style={{ background:"var(--panel-alt)", border:"1px solid #1d2540", borderRadius:10, padding:"16px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          {(form.imagePreview || form.image) && (
            <img src={form.imagePreview || form.image} alt="" style={{width:52,height:52,borderRadius:10,objectFit:"cover",border:"1.5px solid rgba(139,92,246,0.4)",flexShrink:0}}/>
          )}
          {!form.imagePreview && !form.image && (
            <div style={{width:52,height:52,borderRadius:10,background:"rgba(139,92,246,0.08)",border:"1px dashed rgba(139,92,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🦣</div>
          )}
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:18,color:"var(--text)"}}>{form.name || "Token name"}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-muted)"}}>${form.ticker || "TICK"} · {form.supplyMode}</div>
          </div>
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)", letterSpacing:"0.06em", marginBottom:12 }}>TOKEN</div>
        {[
          ["Name", form.name || "—"],
          ["Ticker", form.ticker ? "$" + form.ticker : "—"],
          ["Description", form.description.slice(0,60) + (form.description.length > 60 ? "…" : "") || "—"],
        ].map(([k,v],i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #1a2438" }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>{k}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-secondary)", fontWeight:600, maxWidth:"60%", textAlign:"right", wordBreak:"break-all" }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ background:"var(--panel-alt)", border:"1px solid #1d2540", borderRadius:10, padding:"16px", marginBottom:16 }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)", letterSpacing:"0.06em", marginBottom:12 }}>SUPPLY & ALLOCATION</div>
        {[
          ["Mode", form.supplyMode === "fixed" ? "Fixed" : "Elastic"],
          form.supplyMode === "fixed" && ["Total supply", fmtSupply(total)],
          ["Public (cycles)", form.publicPct + "%  →  " + fmtSupply(Math.floor(total * form.publicPct / 100))],
          ["Treasury", treasuryPct.toFixed(1) + "%  →  " + fmtSupply(Math.floor(total * treasuryPct / 100))],
          ["Protocol", PROTOCOL_PCT + "%  →  " + fmtSupply(Math.floor(total * PROTOCOL_PCT / 100))],
        ].filter(Boolean).map(([k,v],i,arr) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom: i < arr.length-1 ? "1px solid #1a2438" : "none" }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>{k}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-secondary)", fontWeight:600, textAlign:"right" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Immutability warning */}
      <div style={{ background:"rgba(255,159,28,0.06)", border:"1px solid rgba(255,159,28,0.18)", borderRadius:7, padding:"11px 13px", marginBottom:20, fontSize:11, color:"#d97706", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.7 }}>
        ⚠ Supply mode, total supply, and allocation percentages are permanently locked after deployment.
        The mint address will be derived on-chain.
      </div>

      {submitState === "error" && (
        <div style={{ background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:7, padding:"11px 13px", marginBottom:16, fontSize:11, color:"#F43F5E", fontFamily:"'IBM Plex Mono',monospace", animation:"fadeUp 0.15s ease" }}>
          Transaction failed — wallet rejected or network error. Try again.
        </div>
      )}

      <button onClick={onSubmit} disabled={submitState === "loading"}
        style={{
          width:"100%", padding:"14px 0", borderRadius:8, border:"none",
          background: submitState === "loading" ? "#2d1f7a" : "#8B5CF6",
          color: submitState === "loading" ? "var(--text-dim)" : "#fff",
          fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:15,
          cursor: submitState === "loading" ? "not-allowed" : "pointer",
          letterSpacing:"0.05em", transition:"all 0.15s",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        }}>
        {submitState === "loading" && (
          <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid #3a2a7a", borderTopColor:"#22D3EE", animation:"spin 0.7s linear infinite", flexShrink:0 }}/>
        )}
        {submitState === "loading" ? "DEPLOYING TOKEN..." : submitState === "error" ? "TRY AGAIN" : "DEPLOY TOKEN"}
      </button>

      <div style={{ marginTop:10, fontSize:10, color:"#1a2240", fontFamily:"'IBM Plex Mono',monospace", textAlign:"center" }}>
        Mammoth takes 2% of supply · no other fees at deploy
      </div>
    </div>
  );
}

// ── Mock deploy ───────────────────────────────────────────────────────────────
async function mockDeployToken(form) {
  await new Promise(r => setTimeout(r, 900));   // tx simulation
  await new Promise(r => setTimeout(r, 600));   // confirmation
  if (Math.random() < 0.12) throw new Error("Rejected");
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const mint = Array.from({length:44}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
  return { ...form, mint, createdAt: new Date().toISOString() };
}

// ── Wizard root ───────────────────────────────────────────────────────────────
function LaunchWizard({ onBack, onHome, onProjectCreated, onCreateCycle, walletState, onOpenModal, theme, onToggleTheme }) {
  const isConnected = walletState.status === "connected";

  // Form state
  const [form, setForm] = useState({
    name: "",
    ticker: "",
    description: "",
    image: null,          // URL string — GIF, PNG, WEBP etc.
    imagePreview: null,   // local object URL for preview before upload
    supplyMode: "fixed",
    totalSupply: TOTAL_SUPPLY_DEFAULT,
    publicPct: 60,
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState("idle"); // idle | loading | success | error
  const [createdToken, setCreatedToken] = useState(null);

  const onChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  // ── Validation per step ──────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = "Required";
      else if (form.name.length < 2) e.name = "Too short";
      if (!form.ticker.trim()) e.ticker = "Required";
      else if (form.ticker.length < 2) e.ticker = "Min 2 characters";
      if (!form.description.trim()) e.description = "Required";
      else if (form.description.length < 20) e.description = "Add more detail (min 20 chars)";
    }
    return e;
  };

  const handleNext = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 1) { onBack(); return; }
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!isConnected) { onOpenModal(); return; }
    setSubmitState("loading");
    try {
      const token = await mockDeployToken(form);
      setCreatedToken(token);
      setSubmitState("success");
      // Notify global state — project appears on homepage immediately
      onProjectCreated?.(form, token);
    } catch {
      setSubmitState("error");
    }
  };

  // Wire success actions
  window.__mammothGoHome = onHome;
  window.__mammothLaunchCycle = onCreateCycle;

  const treasuryPct = 100 - PROTOCOL_PCT - form.publicPct;
  const allocationValid = treasuryPct >= 0 && form.publicPct > 0;

  const canAdvance = {
    1: true, // validated on click
    2: true,
    3: allocationValid,
    4: true,
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <header style={{ background:"var(--header-bg)", backdropFilter:"blur(16px)", borderBottom:"1px solid #1a2438", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:640, margin:"0 auto", padding:"0 16px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={handleBack} style={{ background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer", fontSize:18, padding:"4px 6px 4px 0" }}>←</button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="12" rx="7" ry="5.5" fill="#6D28D9" opacity="0.9"/><ellipse cx="10" cy="10.5" rx="5.5" ry="4.5" fill="#7C3AED"/><path d="M4.5 9.5 Q3 7 3.5 5 Q4.5 7.5 6 8.5" fill="#22D3EE"/><path d="M15.5 9.5 Q17 7 16.5 5 Q15.5 7.5 14 8.5" fill="#22D3EE"/><ellipse cx="10" cy="9.5" rx="2.2" ry="1.8" fill="#C4B5FD"/></svg>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:"var(--text)" }}>Launch token</span>
            </div>
          </div>
          <WalletButton walletState={walletState} onOpenModal={onOpenModal} onDisconnect={() => {}} />
        </div>
      </header>

      <main style={{ maxWidth:560, margin:"0 auto", padding:"32px 16px 64px" }}>
        <StepBar current={step} />

        {step === 1 && <StepInfo form={form} onChange={onChange} errors={errors} />}
        {step === 2 && <StepSupply form={form} onChange={onChange} />}
        {step === 3 && <StepAllocation form={form} onChange={onChange} />}
        {step === 4 && (
          <StepReview
            form={form}
            onSubmit={handleSubmit}
            submitState={submitState}
            createdToken={createdToken}
          />
        )}

        {/* Nav buttons — hide on success */}
        {!(step === 4 && submitState === "success") && (
          <div style={{ display:"flex", gap:10, marginTop:28 }}>
            <button onClick={handleBack}
              style={{ flex:1, padding:"12px 0", background:"transparent", border:"1px solid #1d2540", borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"var(--text-dim)", cursor:"pointer", fontWeight:500 }}>
              {step === 1 ? "CANCEL" : "← BACK"}
            </button>
            {step < 4 && (
              <button onClick={handleNext} disabled={!canAdvance[step]}
                style={{ flex:2, padding:"12px 0", background: canAdvance[step] ? "#8B5CF6" : "var(--border)", color: canAdvance[step] ? "#fff" : "var(--text-muted)", border:"none", borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, cursor: canAdvance[step] ? "pointer" : "not-allowed", letterSpacing:"0.04em", transition:"all 0.15s" }}>
                CONTINUE →
              </button>
            )}
          </div>
        )}

        {/* Wallet gate on step 4 if not connected */}
        {step === 4 && submitState === "idle" && !isConnected && (
          <div style={{ marginTop:14, textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-dim)" }}>
            Connect your wallet to deploy
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CYCLE MANAGEMENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// Cycle state model:
// {
//   id:          number
//   status:      "draft" | "open" | "completed" | "terminated"
//   allocation:  number   — tokens allocated to this cycle
//   sold:        number   — tokens sold so far
//   curve:       "step" | "linear" | "exp"
//   startPrice:  number   — SOL per token at cycle open
//   stepSize:    number   — tokens per price step (step curve only)
//   stepInc:     number   — SOL increment per step (step curve only)
//   raised:      number   — SOL collected
//   openedAt:    number | null   — timestamp
//   closedAt:    number | null   — timestamp
// }
//
// UI flow:
//   No cycle / all closed → "Create cycle" CTA
//   Draft exists          → "Review & open" CTA  
//   Open cycle            → live status + "End early" danger action
//   Completed / terminated → history row, create next cycle

const CURVE_OPTIONS = [
  { id:"step",   label:"Step",   badge:"🔥 DEFAULT", desc:"Price jumps at fixed intervals. Meme-native urgency." },
  { id:"linear", label:"Linear", badge:"SMOOTH",     desc:"Price rises continuously. Predictable and neutral." },
  { id:"exp",    label:"Exp-Lite", badge:"STEEP",    desc:"Slow start, fast acceleration. Strong early asymmetry." },
];

const SUPPLY_REMAINING = 500_000_000; // mock remaining public allocation
const TOKEN_TICKER     = "TUSK";
const TOKEN_NAME       = "MegaTusk";

function fmtSOL(n)   { return n.toFixed(3) + " SOL"; }
function fmtTokens(n){ return n >= 1_000_000 ? (n/1_000_000).toFixed(1)+"M" : n >= 1_000 ? (n/1_000).toFixed(0)+"K" : n.toLocaleString(); }
function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
}

// ── Cycle status badge ────────────────────────────────────────────────────────
function CycleBadge({ status }) {
  const cfg = {
    draft:      { color:"var(--text-dim)", bg:"rgba(112,85,168,0.1)",  border:"rgba(112,85,168,0.25)",  label:"DRAFT"      },
    open:       { color:"#22D3EE", bg:"rgba(139,92,246,0.13)", border:"rgba(139,92,246,0.28)",  label:"OPEN",  pulse:true },
    completed:  { color:"#10B981", bg:"rgba(16,185,129,0.1)",   border:"rgba(16,185,129,0.25)",  label:"COMPLETED"  },
    terminated: { color:"#F43F5E", bg:"rgba(248,113,113,0.08)",border:"rgba(248,113,113,0.2)",  label:"TERMINATED" },
  }[status] || {};
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600, letterSpacing:"0.06em", fontFamily:"'IBM Plex Mono',monospace", padding:"3px 9px", borderRadius:4, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      {cfg.pulse && <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color, display:"inline-block", animation:"blink 2s ease-in-out infinite" }}/>}
      {cfg.label}
    </span>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function CycleProgress({ sold, allocation, status }) {
  const pct = allocation > 0 ? Math.min(100, Math.round(sold/allocation*100)) : 0;
  const active = status === "open";
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>{fmtTokens(sold)} / {fmtTokens(allocation)} sold</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#22D3EE", fontWeight:600 }}>{pct}%</span>
      </div>
      <div style={{ height:5, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background: active ? "linear-gradient(90deg,#7C3AED,#8B5CF6,#22D3EE)" : "var(--bar-empty)", borderRadius:3, transition:"width 0.4s" }}/>
      </div>
    </div>
  );
}

// ── Active cycle panel ────────────────────────────────────────────────────────
function ActiveCyclePanel({ cycle, onEndEarly }) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const pct = Math.round(cycle.sold/cycle.allocation*100);
  const currentStep  = Math.floor(cycle.sold / cycle.stepSize);
  const currentPrice = cycle.startPrice + currentStep * cycle.stepInc;
  const nextStepIn   = cycle.stepSize - (cycle.sold % cycle.stepSize);
  const nextPrice    = currentPrice + cycle.stepInc;

  const handleEnd = async () => {
    setEnding(true);
    await new Promise(r => setTimeout(r, 1000));
    onEndEarly();
  };

  return (
    <div style={{ background:"var(--panel)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:10, padding:"20px", marginBottom:16, position:"relative", overflow:"hidden" }}>
      {/* Left accent */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"linear-gradient(180deg,#7C3AED,#22D3EE)", borderRadius:"10px 0 0 10px" }}/>

      <div style={{ paddingLeft:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"var(--text)" }}>Cycle #{cycle.id}</span>
              <CycleBadge status="open"/>
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>
              Opened {fmtTime(cycle.openedAt)} · {cycle.curve} curve
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:16, color:"var(--text)" }}>{fmtSOL(cycle.raised)}</div>
            <div style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace" }}>raised</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom:16 }}>
          <CycleProgress sold={cycle.sold} allocation={cycle.allocation} status="open"/>
        </div>

        {/* Stats grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
          {[
            ["Current price", `${currentPrice.toFixed(5)} SOL`],
            ["Next step in",  cycle.curve==="step" ? `${nextStepIn.toLocaleString()} tokens` : "—"],
            ["Next price",    cycle.curve==="step" ? `${nextPrice.toFixed(5)} SOL` : "—"],
          ].map(([l,v],i) => (
            <div key={i} style={{ background:"var(--panel-alt)", border:"1px solid #1a2438", borderRadius:6, padding:"9px 10px" }}>
              <div style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:12, color:"var(--text)", fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Step urgency */}
        {cycle.curve === "step" && (
          <div style={{ background:"rgba(255,159,28,0.07)", border:"1px solid rgba(255,159,28,0.18)", borderRadius:6, padding:"9px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#d97706" }}>⚡ next price jump in</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"#F59E0B", fontWeight:700 }}>{nextStepIn.toLocaleString()} tokens</span>
          </div>
        )}

        {/* End cycle */}
        {!confirmEnd ? (
          <button onClick={() => setConfirmEnd(true)}
            style={{ background:"transparent", border:"1px solid rgba(248,113,113,0.3)", color:"#F43F5E", borderRadius:6, padding:"9px 16px", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:"0.04em", transition:"all 0.13s", width:"100%" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.07)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
            END CYCLE EARLY
          </button>
        ) : (
          <div style={{ background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:8, padding:"14px", animation:"fadeUp 0.15s ease" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#F43F5E", fontWeight:600, marginBottom:6 }}>End cycle early?</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"rgba(248,113,113,0.7)", marginBottom:14, lineHeight:1.6 }}>
              Unsold tokens ({fmtTokens(cycle.allocation - cycle.sold)}) will be locked until reallocated to a future cycle. This cannot be undone.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <button onClick={() => setConfirmEnd(false)}
                style={{ padding:"9px 0", background:"transparent", border:"1px solid #252848", borderRadius:6, color:"var(--text-dim)", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, cursor:"pointer" }}>
                CANCEL
              </button>
              <button onClick={handleEnd} disabled={ending}
                style={{ padding:"9px 0", background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.35)", borderRadius:6, color:"#F43F5E", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, cursor:ending?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                {ending && <div style={{ width:12, height:12, borderRadius:"50%", border:"2px solid rgba(248,113,113,0.3)", borderTopColor:"#F43F5E", animation:"spin 0.7s linear infinite" }}/>}
                {ending ? "ENDING..." : "CONFIRM END"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Past cycle row ────────────────────────────────────────────────────────────
function PastCycleRow({ cycle }) {
  const pct = Math.round(cycle.sold/cycle.allocation*100);
  return (
    <div style={{ background:"var(--panel-alt)", border:"1px solid #1a2438", borderRadius:8, padding:"14px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:13, color:"var(--text)" }}>Cycle #{cycle.id}</span>
          <CycleBadge status={cycle.status}/>
          <span style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace" }}>{cycle.curve}</span>
        </div>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"var(--text-dim)", fontWeight:600 }}>{fmtSOL(cycle.raised)}</span>
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:10 }}>
        <div style={{ height:3, flex:1, background:"var(--border)", borderRadius:2, overflow:"hidden", marginTop:4 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"var(--bar-empty)", borderRadius:2 }}/>
        </div>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)", flexShrink:0 }}>{pct}% filled</span>
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        {[["Allocation",fmtTokens(cycle.allocation)],["Sold",fmtTokens(cycle.sold)],["Opened",fmtTime(cycle.openedAt)],["Closed",fmtTime(cycle.closedAt)]].map(([l,v],i)=>(
          <div key={i}>
            <div style={{ fontSize:9, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace", marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:11, color:"var(--text-secondary)", fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Create cycle form ─────────────────────────────────────────────────────────
function CreateCycleForm({ remainingSupply, nextId, onSave, onCancel }) {
  const [allocation, setAllocation] = useState(Math.min(100_000, remainingSupply));
  const [curve, setCurve] = useState("step");
  const [startPrice, setStartPrice] = useState(0.00100);
  const [stepSize, setStepSize] = useState(5_000);
  const [stepInc, setStepInc] = useState(0.00022);
  const [saving, setSaving] = useState(false);

  const maxAlloc = Math.min(remainingSupply, 500_000);
  const allocPct = remainingSupply > 0 ? (allocation/remainingSupply*100).toFixed(1) : 0;

  const estimatedRaise = (() => {
    if (curve !== "step") return allocation * startPrice;
    let total = 0, remaining = allocation, tokensSold = 0;
    while (remaining > 0) {
      const stepIdx = Math.floor(tokensSold / stepSize);
      const price = startPrice + stepIdx * stepInc;
      const tokensThisStep = Math.min(stepSize, remaining);
      total += tokensThisStep * price;
      tokensSold += tokensThisStep;
      remaining -= tokensThisStep;
    }
    return total;
  })();

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onSave({ allocation, curve, startPrice, stepSize, stepInc });
  };

  return (
    <div style={{ background:"var(--panel)", border:"1px solid #1d2540", borderRadius:10, padding:"20px", marginBottom:16, animation:"fadeUp 0.2s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"var(--text)", marginBottom:3 }}>New cycle — #{nextId}</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>{fmtTokens(remainingSupply)} tokens available</div>
        </div>
        <button onClick={onCancel} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:18, padding:4 }}>✕</button>
      </div>

      {/* Allocation */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
          <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:"0.05em", fontWeight:600 }}>ALLOCATION</label>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>{allocPct}% of remaining</span>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <input type="number" value={allocation} onChange={e=>setAllocation(Math.min(maxAlloc,Math.max(1000,parseInt(e.target.value)||0)))}
            style={{ flex:1, background:"var(--panel-alt)", border:"1px solid #1d2540", borderRadius:6, padding:"10px 14px", color:"var(--text)", fontSize:14, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }}
            onFocus={e=>e.target.style.borderColor="#7C3AED"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
          <div style={{ display:"flex", gap:4 }}>
            {[25_000,50_000,100_000,200_000].filter(v=>v<=maxAlloc).map(v=>(
              <button key={v} onClick={()=>setAllocation(v)}
                style={{ background:allocation===v?"rgba(139,92,246,0.18)":"var(--panel-alt)", border:`1px solid ${allocation===v?"#7C3AED":"var(--border)"}`, borderRadius:4, padding:"0 9px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:allocation===v?"#22D3EE":"var(--text-dim)", cursor:"pointer", whiteSpace:"nowrap" }}>
                {fmtTokens(v)}
              </button>
            ))}
          </div>
        </div>
        <input type="range" min={1000} max={maxAlloc} step={1000} value={allocation} onChange={e=>setAllocation(Number(e.target.value))}
          style={{ width:"100%", accentColor:"#8B5CF6", cursor:"pointer" }}/>
      </div>

      {/* Curve */}
      <div style={{ marginBottom:20 }}>
        <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:"0.05em", fontWeight:600, display:"block", marginBottom:9 }}>PRICING CURVE</label>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {CURVE_OPTIONS.map(c => (
            <div key={c.id} onClick={()=>setCurve(c.id)}
              style={{ display:"flex", alignItems:"center", gap:12, background:curve===c.id?"rgba(139,92,246,0.08)":"var(--panel-alt)", border:`1px solid ${curve===c.id?"#8B5CF6":"var(--border)"}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"all 0.13s" }}>
              <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${curve===c.id?"#8B5CF6":"var(--badge-border)"}`, background:curve===c.id?"#8B5CF6":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {curve===c.id && <div style={{ width:5, height:5, borderRadius:"50%", background:"#fff" }}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:13, color:"var(--text)" }}>{c.label}</span>
                  <span style={{ fontSize:9, fontFamily:"'IBM Plex Mono',monospace", color:curve===c.id?"#22D3EE":"var(--text-muted)", background:curve===c.id?"rgba(139,92,246,0.15)":"var(--border-sub)", padding:"2px 7px", borderRadius:3 }}>{c.badge}</span>
                </div>
                <div style={{ fontSize:11, color:"var(--text-dim)", fontFamily:"'IBM Plex Mono',monospace" }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start price */}
      <div style={{ marginBottom:curve==="step"?16:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
          <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:"0.05em", fontWeight:600 }}>START PRICE</label>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>SOL per token</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input type="number" value={startPrice} step={0.00001}
            onChange={e=>setStartPrice(Math.max(0.000001,parseFloat(e.target.value)||0))}
            style={{ flex:1, background:"var(--panel-alt)", border:"1px solid #1d2540", borderRadius:6, padding:"10px 14px", color:"var(--text)", fontSize:14, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }}
            onFocus={e=>e.target.style.borderColor="#7C3AED"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
          <div style={{ display:"flex", gap:4 }}>
            {[0.00050,0.00100,0.00200,0.00500].map(v=>(
              <button key={v} onClick={()=>setStartPrice(v)}
                style={{ background:startPrice===v?"rgba(139,92,246,0.18)":"var(--panel-alt)", border:`1px solid ${startPrice===v?"#7C3AED":"var(--border)"}`, borderRadius:4, padding:"0 8px", fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:startPrice===v?"#22D3EE":"var(--text-dim)", cursor:"pointer", whiteSpace:"nowrap" }}>
                {v.toFixed(4)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step config — only shown for step curve */}
      {curve === "step" && (
        <div style={{ background:"var(--panel-alt)", border:"1px solid #1a2438", borderRadius:8, padding:"14px", marginBottom:20, animation:"fadeUp 0.15s ease" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)", letterSpacing:"0.06em", marginBottom:12 }}>STEP CURVE CONFIG</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-dim)", display:"block", marginBottom:6 }}>Tokens per step</label>
              <input type="number" value={stepSize} step={1000} onChange={e=>setStepSize(Math.max(1000,parseInt(e.target.value)||5000))}
                style={{ width:"100%", background:"var(--panel)", border:"1px solid #1d2540", borderRadius:5, padding:"8px 10px", color:"var(--text)", fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }}
                onFocus={e=>e.target.style.borderColor="#7C3AED"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
            <div>
              <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-dim)", display:"block", marginBottom:6 }}>Price per step (SOL)</label>
              <input type="number" value={stepInc} step={0.00001} onChange={e=>setStepInc(Math.max(0.000001,parseFloat(e.target.value)||0))}
                style={{ width:"100%", background:"var(--panel)", border:"1px solid #1d2540", borderRadius:5, padding:"8px 10px", color:"var(--text)", fontSize:13, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }}
                onFocus={e=>e.target.style.borderColor="#7C3AED"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
          </div>
          <div style={{ marginTop:10, fontSize:10, color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace" }}>
            {Math.ceil(allocation/stepSize)} steps · price goes from {startPrice.toFixed(5)} → {(startPrice + Math.ceil(allocation/stepSize)*stepInc).toFixed(5)} SOL
          </div>
        </div>
      )}

      {/* Estimate */}
      <div style={{ background:"rgba(34,211,238,0.06)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:7, padding:"11px 13px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#22D3EE" }}>Max raise if fully sold</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, color:"#22D3EE", fontWeight:700 }}>{fmtSOL(estimatedRaise)}</span>
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ width:"100%", padding:"13px 0", background:saving?"#2d1f7a":"#8B5CF6", color:saving?"var(--text-dim)":"#fff", border:"none", borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14, cursor:saving?"not-allowed":"pointer", letterSpacing:"0.05em", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        {saving && <div style={{ width:14,height:14,borderRadius:"50%",border:"2px solid #3a2a7a",borderTopColor:"#22D3EE",animation:"spin 0.7s linear infinite" }}/>}
        {saving ? "SAVING DRAFT..." : "SAVE AS DRAFT"}
      </button>
    </div>
  );
}

// ── Open cycle confirmation modal ─────────────────────────────────────────────
function OpenCycleModal({ cycle, onConfirm, onCancel }) {
  const [opening, setOpening] = useState(false);
  const handle = async () => {
    setOpening(true);
    await new Promise(r => setTimeout(r,1100));
    onConfirm();
  };
  return (
    <div onClick={onCancel} style={{ position:"fixed",inset:0,background:"var(--overlay)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)",animation:"fadeUp 0.15s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"var(--panel)",border:"1px solid #252848",borderRadius:12,width:"100%",maxWidth:380,padding:"24px 22px",animation:"slideUp 0.18s ease" }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:17,color:"var(--text)",marginBottom:6 }}>Open Cycle #{cycle.id}?</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text-dim)",marginBottom:20,lineHeight:1.7 }}>
          Opening this cycle will:
        </div>
        {["Lock all parameters permanently","Take a holder rights snapshot","Make the cycle public and tradeable","Enable purchases immediately"].map((t,i)=>(
          <div key={i} style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:10 }}>
            <span style={{ color:"#22D3EE",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,flexShrink:0,marginTop:1 }}>→</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text-secondary)",lineHeight:1.5 }}>{t}</span>
          </div>
        ))}
        <div style={{ background:"rgba(255,159,28,0.07)",border:"1px solid rgba(255,159,28,0.18)",borderRadius:6,padding:"10px 12px",marginBottom:20,fontSize:11,color:"#d97706",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.6 }}>
          ⚠ Parameters are immutable once the cycle opens.
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
          <button onClick={onCancel} style={{ padding:"11px 0",background:"transparent",border:"1px solid #252848",borderRadius:7,color:"var(--text-dim)",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,cursor:"pointer",fontWeight:500 }}>CANCEL</button>
          <button onClick={handle} disabled={opening}
            style={{ padding:"11px 0",background:opening?"#2d1f7a":"#8B5CF6",color:opening?"var(--text-dim)":"#fff",border:"none",borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,cursor:opening?"not-allowed":"pointer",letterSpacing:"0.04em",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
            {opening&&<div style={{ width:13,height:13,borderRadius:"50%",border:"2px solid #3a2a7a",borderTopColor:"#22D3EE",animation:"spin 0.7s linear infinite" }}/>}
            {opening?"OPENING...":"OPEN CYCLE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Token summary bar ─────────────────────────────────────────────────────────
function TokenSummaryBar({ cycles }) {
  const totalMinted   = cycles.filter(c=>c.status!=="draft").reduce((a,c)=>a+c.sold,0);
  const totalRaised   = cycles.filter(c=>c.status!=="draft").reduce((a,c)=>a+c.raised,0);
  const totalAlloc    = 600_000_000; // mock public allocation
  const pctMinted     = Math.round(totalMinted/totalAlloc*100);

  return (
    <div style={{ background:"var(--panel-alt)",border:"1px solid #1a2438",borderRadius:10,padding:"16px",marginBottom:20 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:2 }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,color:"var(--text)" }}>{TOKEN_NAME}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--text-dim)",background:"var(--badge-bg)",border:"1px solid #252848",borderRadius:3,padding:"1px 7px" }}>${TOKEN_TICKER}</span>
          </div>
          <div style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace" }}>Creator dashboard</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:15,color:"var(--text)" }}>{fmtSOL(totalRaised)}</div>
          <div style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace" }}>total raised</div>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12 }}>
        {[
          ["Cycles run", cycles.filter(c=>c.status!=="draft").length],
          ["Tokens minted", fmtTokens(totalMinted)],
          ["Remaining", fmtTokens(totalAlloc - totalMinted)],
          ["% issued", pctMinted+"%"],
        ].map(([l,v],i)=>(
          <div key={i} style={{ background:"var(--panel)",border:"1px solid #1d2540",borderRadius:6,padding:"8px 10px" }}>
            <div style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:13,color:"var(--text)",fontFamily:"'IBM Plex Mono',monospace",fontWeight:600 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ height:4,background:"var(--border)",borderRadius:2,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${pctMinted}%`,background:"linear-gradient(90deg,#6D28D9,#8B5CF6)",borderRadius:2,transition:"width 0.4s" }}/>
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",marginTop:5 }}>
        <span style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace" }}>0%</span>
        <span style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace" }}>{pctMinted}% of public allocation issued</span>
        <span style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace" }}>100%</span>
      </div>
    </div>
  );
}

// ── Cycle dashboard root ──────────────────────────────────────────────────────
function CycleDashboard({ project, onBack, onCyclesChanged, walletState, onOpenModal, theme, onToggleTheme }) {
  const projectId = project?.id || null;
  const ticker    = project?.ticker || TOKEN_TICKER;
  const projName  = project?.name   || TOKEN_NAME;

  // Seed local cycle list from the project's existing cycle history when available
  const seedCycles = () => {
    if (!project || !project.cycleHistory || project.cycleHistory.length === 0) {
      return [{ id:1, status:"completed", allocation:100_000, sold:100_000, curve:"step", startPrice:0.00180, stepSize:5_000, stepInc:0.00022, raised:240, openedAt:Date.now()-14*86400_000, closedAt:Date.now()-7*86400_000 }];
    }
    return project.cycleHistory.map((h, i) => ({
      id: h.id || i + 1,
      status: h.status === "ACTIVE" ? "open" : h.status === "COMPLETED" ? "completed" : "terminated",
      allocation: h.allocation || 100_000,
      sold: h.sold || h.allocation || 100_000,
      curve: project.cycleData?.curveType?.toLowerCase() || "step",
      startPrice: project.cycleData?.currentPrice || 0.00180,
      stepSize: project.cycleData?.stepSize || 5_000,
      stepInc: project.cycleData?.stepIncrement || 0.00022,
      raised: parseFloat(h.raised) || 0,
      openedAt: Date.now() - (project.cycleHistory.length - i + 1) * 7 * 86400_000,
      closedAt: h.status !== "ACTIVE" ? Date.now() - i * 7 * 86400_000 : null,
    }));
  };

  const [cycles, setCycles] = useState(seedCycles);
  const [showCreate, setShowCreate] = useState(false);
  const [openingCycle, setOpeningCycle] = useState(null);

  // Notify parent whenever cycles change so global project state stays in sync
  const notify = (updatedCycles) => {
    if (projectId && onCyclesChanged) onCyclesChanged(projectId, updatedCycles);
  };

  const handleSaveDraft = (config) => {
    const updated = [...cycles, { id: cycles.length + 1, status:"draft", sold:0, raised:0, openedAt:null, closedAt:null, ...config }];
    setCycles(updated);
    notify(updated);
    setShowCreate(false);
  };

  const handleOpenCycle = (cycle) => setOpeningCycle(cycle);

  const handleConfirmOpen = () => {
    const updated = cycles.map(c => c.id === openingCycle.id ? { ...c, status:"open", openedAt:Date.now() } : c);
    setCycles(updated);
    notify(updated);
    setOpeningCycle(null);
  };

  const handleEndEarly = () => {
    const updated = cycles.map(c => c.status === "open" ? { ...c, status:"terminated", closedAt:Date.now() } : c);
    setCycles(updated);
    notify(updated);
  };

  const activeCycle = cycles.find(c => c.status === "open");
  const draftCycle  = cycles.find(c => c.status === "draft");
  const pastCycles  = cycles.filter(c => c.status === "completed" || c.status === "terminated").sort((a,b)=>b.id-a.id);
  const nextId      = cycles.length + 1;
  const remaining   = (project?.publicAlloc || SUPPLY_REMAINING) - cycles.filter(c=>c.status!=="draft").reduce((a,c)=>a+c.sold,0);

  // Simulate live sales ticking in open cycle
  useEffect(() => {
    const iv = setInterval(() => {
      setCycles(cs => {
        const updated = cs.map(c => {
          if (c.status !== "open") return c;
          const newSold = Math.min(c.allocation, c.sold + Math.floor(Math.random()*120));
          const step    = Math.floor(newSold / c.stepSize);
          const price   = c.startPrice + step * c.stepInc;
          const addedRaised = (newSold - c.sold) * price;
          if (newSold >= c.allocation) return { ...c, sold:c.allocation, raised:c.raised+addedRaised, status:"completed", closedAt:Date.now() };
          return { ...c, sold:newSold, raised:c.raised+addedRaised };
        });
        if (projectId && onCyclesChanged) onCyclesChanged(projectId, updated);
        return updated;
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <header style={{ background:"var(--header-bg)", backdropFilter:"blur(16px)", borderBottom:"1px solid #1a2438", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:700, margin:"0 auto", padding:"0 16px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--text-dim)", cursor:"pointer", fontSize:18, padding:"4px 6px 4px 0" }}>←</button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="12" rx="7" ry="5.5" fill="#6D28D9" opacity="0.9"/><ellipse cx="10" cy="10.5" rx="5.5" ry="4.5" fill="#7C3AED"/><path d="M4.5 9.5 Q3 7 3.5 5 Q4.5 7.5 6 8.5" fill="#22D3EE"/><path d="M15.5 9.5 Q17 7 16.5 5 Q15.5 7.5 14 8.5" fill="#22D3EE"/><ellipse cx="10" cy="9.5" rx="2.2" ry="1.8" fill="#C4B5FD"/></svg>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:"var(--text)" }}>Cycle manager{projName ? ` — ${projName}` : ""}</span>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme}/>
          <WalletButton walletState={walletState} onOpenModal={onOpenModal} onDisconnect={()=>{}}/>
        </div>
      </header>

      <main style={{ maxWidth:700, margin:"0 auto", padding:"24px 16px 64px" }}>

        {/* Token overview */}
        <TokenSummaryBar cycles={cycles}/>

        {/* Active cycle */}
        {activeCycle && (
          <div style={{ marginBottom:4 }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)", letterSpacing:"0.08em", marginBottom:10 }}>ACTIVE CYCLE</div>
            <ActiveCyclePanel cycle={activeCycle} onEndEarly={handleEndEarly}/>
          </div>
        )}

        {/* Draft cycle ready to open */}
        {draftCycle && !activeCycle && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)", letterSpacing:"0.08em", marginBottom:10 }}>DRAFT</div>
            <div style={{ background:"var(--panel)", border:"1px solid #252848", borderRadius:10, padding:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:"var(--text)" }}>Cycle #{draftCycle.id}</span>
                    <CycleBadge status="draft"/>
                  </div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"var(--text-muted)" }}>
                    {fmtTokens(draftCycle.allocation)} tokens · {draftCycle.curve} curve · starts at {draftCycle.startPrice.toFixed(5)} SOL
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <button onClick={()=>setCycles(cs=>cs.filter(c=>c.id!==draftCycle.id))}
                  style={{ padding:"10px 0", background:"transparent", border:"1px solid #1d2540", borderRadius:7, color:"var(--text-dim)", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, cursor:"pointer" }}>
                  DELETE DRAFT
                </button>
                <button onClick={()=>handleOpenCycle(draftCycle)}
                  style={{ padding:"10px 0", background:"#8B5CF6", color:"#fff", border:"none", borderRadius:7, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"0.04em" }}>
                  OPEN CYCLE →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create new cycle CTA — shown when no draft, no active cycle */}
        {!draftCycle && !activeCycle && (
          <div style={{ marginBottom:20 }}>
            {showCreate ? (
              <CreateCycleForm
                remainingSupply={remaining}
                nextId={nextId}
                onSave={handleSaveDraft}
                onCancel={()=>setShowCreate(false)}
              />
            ) : (
              <button onClick={()=>setShowCreate(true)}
                style={{ width:"100%", padding:"16px 0", background:"rgba(139,92,246,0.08)", border:"1.5px dashed rgba(139,92,246,0.35)", borderRadius:10, color:"#8B5CF6", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700, fontSize:14, cursor:"pointer", letterSpacing:"0.04em", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,92,246,0.12)";e.currentTarget.style.borderColor="rgba(139,92,246,0.5)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(139,92,246,0.08)";e.currentTarget.style.borderColor="rgba(139,92,246,0.35)";}}>
                + CREATE NEW CYCLE
              </button>
            )}
          </div>
        )}

        {/* Past cycles */}
        {pastCycles.length > 0 && (
          <div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"var(--text-muted)", letterSpacing:"0.08em", marginBottom:10 }}>PAST CYCLES — {pastCycles.length}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {pastCycles.map(c => <PastCycleRow key={c.id} cycle={c}/>)}
            </div>
          </div>
        )}

        {/* No history at all */}
        {pastCycles.length === 0 && !activeCycle && !draftCycle && !showCreate && (
          <div style={{ textAlign:"center", padding:"32px 0", color:"var(--text-muted)", fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>
            No cycles yet. Create your first cycle above.
          </div>
        )}
      </main>

      {openingCycle && (
        <OpenCycleModal cycle={openingCycle} onConfirm={handleConfirmOpen} onCancel={()=>setOpeningCycle(null)}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WALLET SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// Wallet state shape — ready for real adapter integration:
// {
//   status:  "disconnected" | "connecting" | "connected" | "error"
//   address: string | null          // full address
//   short:   string | null          // "7xKm...4fQ"
//   balance: number | null          // SOL balance
//   adapter: string | null          // "Phantom" | "Backpack" | "Solflare" etc.
//   error:   string | null
// }

const MOCK_WALLETS = [
  { id:"phantom",   label:"Phantom",   icon:"👻" },
  { id:"backpack",  label:"Backpack",  icon:"🎒" },
  { id:"solflare",  label:"Solflare",  icon:"☀️" },
  { id:"ledger",    label:"Ledger",    icon:"🔒" },
];

function shortAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

function mockAddress() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({length: 44}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Wallet Modal ──────────────────────────────────────────────────────────────
function WalletModal({ onClose, onConnected }) {
  const [phase, setPhase] = useState("select"); // "select" | "connecting" | "error"
  const [chosen, setChosen] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const handlePick = async (w) => {
    setChosen(w);
    setPhase("connecting");
    // Simulate wallet handshake: 1.2s, 10% chance of error
    await new Promise(r => setTimeout(r, 1200));
    if (Math.random() < 0.10) {
      setErrMsg("Wallet not found or rejected connection.");
      setPhase("error");
      return;
    }
    const address = mockAddress();
    onConnected({ status:"connected", address, short:shortAddr(address), balance:+(Math.random()*12+0.5).toFixed(3), adapter:w.label, error:null });
    onClose();
  };

  // Overlay click-to-close
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"var(--overlay)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)",animation:"fadeUp 0.15s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--panel)",border:"1px solid #252848",borderRadius:12,width:"100%",maxWidth:360,padding:"24px 20px",animation:"slideUp 0.18s ease"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,color:"var(--text)"}}>Connect wallet</div>
            <div style={{fontSize:11,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginTop:2}}>Solana · no KYC · no accounts</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:18,lineHeight:1,padding:4}}>✕</button>
        </div>

        {/* Select phase */}
        {phase === "select" && (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {MOCK_WALLETS.map(w => (
              <button key={w.id} onClick={() => handlePick(w)}
                style={{display:"flex",alignItems:"center",gap:12,background:"var(--panel-alt)",border:"1px solid #1d2540",borderRadius:8,padding:"13px 14px",cursor:"pointer",transition:"border-color 0.12s",width:"100%",textAlign:"left"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#7C3AED"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <span style={{fontSize:20,lineHeight:1}}>{w.icon}</span>
                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:14,color:"var(--text)"}}>{w.label}</span>
                <span style={{marginLeft:"auto",fontSize:11,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace"}}>→</span>
              </button>
            ))}
            <div style={{marginTop:8,fontSize:10,color:"var(--bar-empty)",fontFamily:"'IBM Plex Mono',monospace",textAlign:"center",lineHeight:1.7}}>
              By connecting you agree Mammoth is a permissionless protocol.<br/>No endorsements. Not financial advice.
            </div>
          </div>
        )}

        {/* Connecting phase */}
        {phase === "connecting" && (
          <div style={{textAlign:"center",padding:"24px 0",animation:"fadeUp 0.15s ease"}}>
            <div style={{fontSize:32,marginBottom:16}}>{chosen?.icon}</div>
            <div style={{width:28,height:28,borderRadius:"50%",border:"2px solid #252848",borderTopColor:"#8B5CF6",animation:"spin 0.7s linear infinite",margin:"0 auto 16px"}}/>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:14,color:"var(--text)",marginBottom:6}}>Connecting to {chosen?.label}</div>
            <div style={{fontSize:11,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace"}}>Approve in your wallet</div>
          </div>
        )}

        {/* Error phase */}
        {phase === "error" && (
          <div style={{animation:"fadeUp 0.15s ease"}}>
            <div style={{background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:8,padding:"14px",marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#F43F5E",fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,marginBottom:4}}>Connection failed</div>
              <div style={{fontSize:11,color:"rgba(248,113,113,0.7)",fontFamily:"'IBM Plex Mono',monospace"}}>{errMsg}</div>
            </div>
            <button onClick={() => setPhase("select")}
              style={{width:"100%",padding:"11px 0",background:"#8B5CF6",color:"#fff",border:"none",borderRadius:7,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:"0.04em"}}>
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Connected account dropdown ────────────────────────────────────────────────
function AccountDropdown({ walletState, onDisconnect, onClose }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:150}} >
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:58,right:16,background:"var(--panel)",border:"1px solid #252848",borderRadius:10,width:240,padding:"16px",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"fadeUp 0.15s ease"}}>

        {/* Address + adapter */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:14,borderBottom:"1px solid #1d2540"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#22D3EE)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:14}}>◉</span>
          </div>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text)",fontWeight:600}}>{walletState.short}</div>
            <div style={{fontSize:10,color:"var(--text-dim)",fontFamily:"'IBM Plex Mono',monospace",marginTop:1}}>{walletState.adapter}</div>
          </div>
        </div>

        {/* Balance */}
        <div style={{background:"var(--panel-alt)",border:"1px solid #1d2540",borderRadius:7,padding:"10px 12px",marginBottom:14}}>
          <div style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:4}}>balance</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:16,color:"var(--text)"}}>
            {walletState.balance?.toFixed(3)} <span style={{fontSize:11,color:"var(--text-dim)",fontWeight:400}}>SOL</span>
          </div>
        </div>

        {/* Actions */}
        {[
          { label:"Copy address", action: () => { navigator.clipboard?.writeText(walletState.address||""); onClose(); } },
          { label:"View on explorer", action: onClose },
        ].map(({label, action}, i) => (
          <button key={i} onClick={action}
            style={{width:"100%",display:"block",background:"none",border:"none",textAlign:"left",padding:"9px 4px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text-dim)",cursor:"pointer",borderBottom:"1px solid #1a2438",transition:"color 0.12s"}}
            onMouseEnter={e=>e.currentTarget.style.color="#22D3EE"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--text-dim)"}>
            {label}
          </button>
        ))}

        <button onClick={() => { onDisconnect(); onClose(); }}
          style={{width:"100%",marginTop:12,padding:"9px 0",background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:6,fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#F43F5E",cursor:"pointer",fontWeight:600,letterSpacing:"0.04em"}}>
          DISCONNECT
        </button>
      </div>
    </div>
  );
}

// ── Shared wallet button (used in every header) ───────────────────────────────
function WalletButton({ walletState, onOpenModal, onDisconnect }) {
  const [dropOpen, setDropOpen] = useState(false);
  const connected = walletState.status === "connected";

  return (
    <>
      <button
        onClick={() => connected ? setDropOpen(d => !d) : onOpenModal()}
        style={{
          background: connected ? "rgba(34,211,238,0.08)" : "linear-gradient(135deg,#7C3AED,#8B5CF6)",
          color: connected ? "#22D3EE" : "#fff",
          border: connected ? "1px solid rgba(34,211,238,0.3)" : "none",
          borderRadius:6, padding:"6px 13px",
          fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
          cursor:"pointer", fontWeight:600, letterSpacing:"0.04em",
          transition:"all 0.13s", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
        }}>
        {connected && <span style={{width:6,height:6,borderRadius:"50%",background:"#22D3EE",display:"inline-block",animation:"blink 2s ease-in-out infinite"}}/>}
        {connected ? walletState.short : "CONNECT"}
        {connected && <span style={{fontSize:9,opacity:0.6}}>▾</span>}
      </button>

      {dropOpen && connected && (
        <AccountDropdown walletState={walletState} onDisconnect={onDisconnect} onClose={() => setDropOpen(false)} />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// Derive a project-list card from a raw project record + its live cycle data
function deriveProjectCard(proj) {
  const cd = proj.cycleData;
  const hasCycle = cd && cd.status === "ACTIVE";
  const sold = cd ? cd.sold : 0;
  const alloc = cd ? cd.allocation : 1;
  const progress = Math.round(sold / alloc * 100);
  const totalRaisedSOL = (proj.cycleHistory || []).reduce((a, c) => a + (parseFloat(c.raised) || 0), 0);
  return {
    ...proj,
    status: hasCycle ? "ACTIVE" : "BETWEEN",
    progress,
    price: cd ? cd.currentPrice : proj.price,
    raised: totalRaisedSOL.toFixed(0) + " SOL",
    cycle: proj.cycleHistory ? proj.cycleHistory.length : 0,
    sparkline: proj.sparkline || genSparkline(hasCycle ? "up" : "down"),
  };
}

// Build a fresh project object from the launch wizard form + deploy result
function buildNewProject(form, deployResult, walletShort) {
  const total = form.totalSupply || 1_000_000_000;
  const publicAlloc = Math.floor(total * form.publicPct / 100);
  const treasuryAlloc = Math.floor(total * (100 - 2 - form.publicPct) / 100);
  const id = String(Date.now());
  const genChart = () => {
    const pts = [], now = Date.now();
    let v = 0.00100;
    for (let i = 24; i >= 0; i--) {
      v = Math.max(0.00050, Math.min(0.00300, v + (Math.random() - 0.5) * 0.0001));
      pts.push({ t: now - i * 3_600_000, p: v });
    }
    return pts;
  };
  return {
    id,
    name: form.name,
    ticker: form.ticker,
    description: form.description,
    supplyMode: form.supplyMode === "elastic" ? "Elastic" : "Fixed",
    totalSupply: total,
    publicAlloc,
    treasuryAlloc,
    hardCap: form.supplyMode === "fixed",
    creator: walletShort || "You",
    createdAt: new Date().toISOString().slice(0, 10),
    price: 0.00100,
    change: 0,
    volume: 0,
    status: "BETWEEN",
    progress: 0,
    cycle: 0,
    raised: "0 SOL",
    sparkline: genSparkline("up"),
    cycleData: null,
    cycleHistory: [],
    chartData: genChart(),
    _mine: true,        // flag: created by current session
    mint: deployResult.mint,
    image: form.image || null,  // GIF/PNG data URL or null
  };
}

// Merge a cycle dashboard's cycle list back onto a project
function applyProjectCycles(proj, cycles) {
  const open = cycles.find(c => c.status === "open");
  const history = cycles
    .filter(c => c.status === "completed" || c.status === "terminated")
    .map(c => ({
      id: c.id,
      allocation: c.allocation,
      sold: c.sold,
      status: c.status === "completed" ? "COMPLETED" : "TERMINATED",
      raised: c.raised.toFixed(2) + " SOL",
      priceRange: `${c.startPrice.toFixed(4)}–${(c.startPrice + Math.ceil(c.sold / c.stepSize) * c.stepInc).toFixed(4)}`,
    }));

  const cycleData = open ? {
    id: open.id,
    status: "ACTIVE",
    allocation: open.allocation,
    sold: open.sold,
    curveType: open.curve === "step" ? "Step" : open.curve === "linear" ? "Linear" : "Exp-Lite",
    currentPrice: open.startPrice + Math.floor(open.sold / open.stepSize) * open.stepInc,
    nextStepIn: open.stepSize - (open.sold % open.stepSize),
    nextStepPrice: open.startPrice + (Math.floor(open.sold / open.stepSize) + 1) * open.stepInc,
    stepSize: open.stepSize,
    stepIncrement: open.stepInc,
    userRights: Math.floor(open.allocation * 0.05),
    userRightsUsed: 0,
    treasuryRouting: { creator: 70, reserve: 20, sink: 10 },
  } : (proj.cycleData ? { ...proj.cycleData, status: "ENDED" } : null);

  const price = open
    ? open.startPrice + Math.floor(open.sold / open.stepSize) * open.stepInc
    : proj.price;

  const totalRaised = cycles
    .filter(c => c.status !== "draft")
    .reduce((a, c) => a + c.raised, 0);

  return {
    ...proj,
    cycleData,
    cycleHistory: [...history, ...(open ? [{
      id: open.id,
      allocation: open.allocation,
      sold: open.sold,
      status: "ACTIVE",
      raised: open.raised.toFixed(2) + " SOL",
      priceRange: `${open.startPrice.toFixed(4)}–now`,
    }] : [])],
    price,
    status: open ? "ACTIVE" : "BETWEEN",
    progress: open ? Math.round(open.sold / open.allocation * 100) : 100,
    cycle: cycles.filter(c => c.status !== "draft").length,
    raised: totalRaised.toFixed(0) + " SOL",
    // append new chart point when price changes
    chartData: [
      ...proj.chartData,
      { t: Date.now(), p: price },
    ].slice(-200),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — ROUTER + GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════════
export default function MammothApp() {
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState("dark");

  // Apply theme to document root for CSS variable switching
  const toggleTheme = () => {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };
  // Set initial theme on mount
  useEffect(() => { document.documentElement.setAttribute("data-theme", "dark"); }, []);

  // ── Global project list (source of truth) ──────────────────────────────────
  const [projects, setProjects] = useState(PROJECTS);

  // Which project the cycle dashboard is managing (id string)
  const [managedProjectId, setManagedProjectId] = useState(null);

  // Which project is open in detail view
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const managedProject  = projects.find(p => p.id === managedProjectId) || null;

  // ── Wallet ─────────────────────────────────────────────────────────────────
  const [walletState, setWalletState] = useState({
    status: "disconnected", address: null, short: null,
    balance: null, adapter: null, error: null,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const handleConnected   = (w) => setWalletState(w);
  const handleDisconnect  = () => setWalletState({ status:"disconnected", address:null, short:null, balance:null, adapter:null, error:null });
  const handleOpenModal   = () => setModalOpen(true);
  const isConnected = walletState.status === "connected";

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goHome   = () => setPage("home");
  const goLaunch = () => { if (!isConnected) { setModalOpen(true); return; } setPage("launch"); };
  const goCycles = (projectId) => {
    if (!isConnected) { setModalOpen(true); return; }
    setManagedProjectId(projectId || null);
    setPage("cycles");
  };
  const goDetail = (p) => { setSelectedProjectId(p.id); setPage("detail"); };
  const goBack   = () => {
    setPage("home");
    setSelectedProjectId(null);
  };

  // ── Project mutations ──────────────────────────────────────────────────────

  // Called by LaunchWizard on successful deploy
  const handleProjectCreated = (form, deployResult) => {
    const newProj = buildNewProject(form, deployResult, walletState.short);
    setProjects(ps => [newProj, ...ps]);
    setManagedProjectId(newProj.id);
  };

  // Called by BuyPanel on confirmed purchase — updates sold, price, raised, chart
  const handlePurchase = (projectId, receipt, quote) => {
    setProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p;
      const cd = p.cycleData;
      if (!cd || cd.status !== "ACTIVE") return p;
      const newSold  = cd.sold + receipt.tokensOut;
      const newPrice = quote.effectivePrice;
      const newProg  = Math.min(100, Math.round(newSold / cd.allocation * 100));
      const nextStepIn   = cd.stepSize - (newSold % cd.stepSize);
      const nextStepIdx  = Math.floor(newSold / cd.stepSize);
      const nextStepPrice = cd.currentPrice + cd.stepIncrement;
      // Update cycle history raised figure for the active cycle
      const updatedHistory = p.cycleHistory.map(h =>
        h.id === cd.id ? { ...h, sold: newSold, raised: (parseFloat(h.raised) + receipt.solIn).toFixed(2) + " SOL" } : h
      );
      // Append chart point
      const newChart = [...p.chartData, { t: Date.now(), p: newPrice }].slice(-200);
      return {
        ...p,
        price: newPrice,
        change: +((newPrice - p.chartData[0].p) / p.chartData[0].p * 100).toFixed(1),
        volume: p.volume + Math.round(receipt.solIn * 1000),
        progress: newProg,
        sparkline: [...(p.sparkline || []).slice(-18), Math.min(95, Math.max(5, newProg))],
        chartData: newChart,
        cycleHistory: updatedHistory,
        cycleData: {
          ...cd,
          sold: newSold,
          currentPrice: newPrice,
          nextStepIn,
          nextStepPrice,
          status: newSold >= cd.allocation ? "ENDED" : "ACTIVE",
        },
      };
    }));
  };

  // Called by CycleDashboard whenever its cycle list changes
  const handleCyclesChanged = (projectId, cycles) => {
    setProjects(ps => ps.map(p =>
      p.id === projectId ? applyProjectCycles(p, cycles) : p
    ));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}

        :root,[data-theme="dark"]{
          --bg:#080c14; --bg-deep:#060810; --panel:#0f1420; --panel-alt:#0c1020;
          --panel-hover:#141830; --panel-input:#0c1020; --input-bg:#0c1020;
          --badge-bg:#161a30; --badge-border:#252848;
          --border:#1d2540; --border-sub:#1a2438; --bar-empty:#1e2848;
          --text:#F0F4FF; --text-secondary:#b8c0d8; --text-muted:#4a5680; --text-dim:#7060b0;
          --header-bg:rgba(6,8,16,0.97); --card-bg:#0f1228; --card-hover:#141830;
          --modal-bg:#0f1420; --overlay:rgba(0,0,0,0.72);
          --ticker-bg:#060810; --ticker-border:rgba(139,92,246,0.25);
          --stats-bg:linear-gradient(135deg,rgba(124,58,237,0.07),rgba(34,211,238,0.04),rgba(245,158,11,0.03));
          --stats-border:rgba(139,92,246,0.18);
          --hero-bg:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(34,211,238,0.05));
          --hero-border:rgba(139,92,246,0.2);
          --page-bg:linear-gradient(160deg,#080c18,#060a14,#08060f);
          --header-border:rgba(139,92,246,0.2);
          --header-shadow:0 1px 0 0 rgba(139,92,246,0.2),0 4px 16px rgba(0,0,0,0.4);
          --card-border-default:rgba(139,92,246,0.13);
          --scrollbar:#1d2540;
          --glow-enabled:1;
        }

        [data-theme="light"]{
          --bg:#ffffff;
          --bg-deep:#f0f0ff;
          --panel:#ffffff;
          --panel-alt:#fafafa;
          --panel-hover:#f5f0ff;
          --panel-input:#f8f8ff;
          --input-bg:#f8f8ff;
          --badge-bg:#f3e8ff;
          --badge-border:#a855f7;
          --border:#e5e0ff;
          --border-sub:#ede8ff;
          --bar-empty:#e8e0ff;
          --text:#0a0010;
          --text-secondary:#1a0040;
          --text-muted:#5500cc;
          --text-dim:#8833ff;
          --header-bg:rgba(255,255,255,0.97);
          --card-bg:#ffffff;
          --card-hover:#faf5ff;
          --modal-bg:#ffffff;
          --overlay:rgba(10,0,30,0.6);
          --ticker-bg:#7c3aed;
          --ticker-border:transparent;
          --stats-bg:linear-gradient(135deg,#f3e8ff,#e0f2fe,#fef3c7,#fce7f3);
          --stats-border:transparent;
          --hero-bg:linear-gradient(135deg,#7c3aed 0%,#06b6d4 35%,#f59e0b 65%,#ec4899 100%);
          --hero-border:transparent;
          --page-bg:linear-gradient(145deg,#ffffff 0%,#faf5ff 40%,#f0f9ff 70%,#fffbf0 100%);
          --header-border:transparent;
          --header-shadow:0 3px 0 0 #7c3aed,0 4px 20px rgba(124,58,237,0.15);
          --card-border-default:#e5e0ff;
          --scrollbar:#a855f7;
          --glow-enabled:1;
        }
        [data-theme="light"] .tab:hover{color:#7c3aed!important}
        @keyframes rainbow-shift{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}

        html,body{background:var(--bg);transition:background 0.25s,color 0.25s}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:var(--scrollbar)}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes pulse-glow{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.02)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .card-in{animation:fadeUp 0.2s ease both}
        .tab:hover{color:#8B5CF6!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input::placeholder{color:var(--text-muted)}
        input:focus{outline:none}
        textarea{color:var(--text)}
        select{background:var(--input-bg);color:var(--text);border:1px solid var(--border)}
        .detail-grid{grid-template-columns:minmax(0,1fr) 310px}
        .mobile-only{display:none}
        .desktop-only{display:block}
        @media(max-width:680px){
          .detail-grid{grid-template-columns:1fr!important}
          .mobile-only{display:block!important}
          .desktop-only{display:none!important}
        }
      `}</style>

      {page === "home" && (
        <Homepage
          projects={projects}
          onSelectProject={goDetail}
          wallet={isConnected}
          walletState={walletState}
          onOpenModal={handleOpenModal}
          onDisconnect={handleDisconnect}
          onLaunch={goLaunch}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {page === "launch" && (
        <LaunchWizard
          onBack={goHome}
          onHome={goHome}
          onProjectCreated={handleProjectCreated}
          onCreateCycle={(id) => goCycles(id)}
          walletState={walletState}
          onOpenModal={handleOpenModal}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {page === "cycles" && (
        <CycleDashboard
          project={managedProject}
          onBack={goHome}
          onCyclesChanged={handleCyclesChanged}
          walletState={walletState}
          onOpenModal={handleOpenModal}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {page === "detail" && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onBack={goBack}
          wallet={isConnected}
          walletState={walletState}
          onOpenModal={handleOpenModal}
          onDisconnect={handleDisconnect}
          onConnect={handleOpenModal}
          onPurchase={(receipt, quote) => handlePurchase(selectedProject.id, receipt, quote)}
          onManageCycles={() => goCycles(selectedProject.id)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {modalOpen && (
        <WalletModal
          onClose={() => setModalOpen(false)}
          onConnected={handleConnected}
        />
      )}
    </>
  );
}
