'use client';
import Image from 'next/image';
import { useState } from 'react';

export const TOKEN_PALETTES = [
  { bg:"#1a0628", lightBg:"#fdf4ff", accent:"#C026D3", accent2:"#9333EA", glow:"rgba(192,38,211,0.5)",  lightGlow:"rgba(192,38,211,0.2)"  },
  { bg:"#061a10", lightBg:"#f0fdf4", accent:"#22C55E", accent2:"#16A34A", glow:"rgba(34,197,94,0.45)",  lightGlow:"rgba(34,197,94,0.15)"   },
  { bg:"#031520", lightBg:"#ecfeff", accent:"#06B6D4", accent2:"#0891B2", glow:"rgba(6,182,212,0.45)",  lightGlow:"rgba(6,182,212,0.15)"   },
  { bg:"#200608", lightBg:"#fff1f2", accent:"#F43F5E", accent2:"#E11D48", glow:"rgba(244,63,94,0.5)",   lightGlow:"rgba(244,63,94,0.15)"   },
  { bg:"#1f1200", lightBg:"#fffbeb", accent:"#F59E0B", accent2:"#D97706", glow:"rgba(245,158,11,0.5)",  lightGlow:"rgba(245,158,11,0.15)"  },
  { bg:"#06060f", lightBg:"#eef2ff", accent:"#818CF8", accent2:"#6366F1", glow:"rgba(129,140,248,0.5)", lightGlow:"rgba(99,102,241,0.15)"  },
  { bg:"#1a0610", lightBg:"#fdf2f8", accent:"#F472B6", accent2:"#EC4899", glow:"rgba(244,114,182,0.45)",lightGlow:"rgba(236,72,153,0.15)"  },
  { bg:"#001510", lightBg:"#f0fdfa", accent:"#2DD4BF", accent2:"#0D9488", glow:"rgba(45,212,191,0.45)", lightGlow:"rgba(45,212,191,0.15)"  },
];

export function getTokenPalette(id) {
  const n = typeof id === 'string' ? id.charCodeAt(0) * 7 + (id.charCodeAt(1) || 3) : parseInt(id) || 0;
  return TOKEN_PALETTES[Math.abs(n) % TOKEN_PALETTES.length];
}

export default function TokenLogo({ id, size = 44, image = null }) {
  const pal = getTokenPalette(id);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (image && !imgError) {
    return (
      <div style={{ width:size, height:size, borderRadius:11, overflow:'hidden', position:'relative', flexShrink:0, border:`1.5px solid ${pal.accent}55`, background:pal.bg }}>
        {!imgLoaded && (
          <div style={{ position:'absolute', inset:0, borderRadius:10, background:`linear-gradient(135deg,${pal.bg},${pal.accent}22)`, animation:'shimmer 1.5s ease infinite' }}/>
        )}
        <Image src={image} alt="" fill unoptimized onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)}
          style={{ objectFit:'cover', display:'block', opacity:imgLoaded?1:0, transition:'opacity 0.2s' }}/>
        <div style={{ position:'absolute', inset:0, borderRadius:10, border:`1.5px solid ${pal.accent}44`, pointerEvents:'none' }}/>
      </div>
    );
  }

  const n = typeof id === 'string' ? parseInt(id) : id;
  const idx = Math.abs(n || 0) % 8;
  const s = size;

  const shapes = [
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
    <svg key={2} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <polygon points="22,7 37,18 31,37 13,37 7,18" fill={pal.accent} opacity="0.8"/>
      <polygon points="22,7 37,18 22,23" fill={pal.accent2} opacity="0.7"/>
      <polygon points="22,7 7,18 22,23" fill={pal.accent} opacity="0.45"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    <svg key={3} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <polygon points="27,7 15,24 23,24 17,38 31,21 22,21" fill={pal.accent}/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    <svg key={4} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      {[0,60,120,180,240,300].map(a => (
        <line key={a} x1="22" y1="22" x2={22+13*Math.cos(a*Math.PI/180)} y2={22+13*Math.sin(a*Math.PI/180)} stroke={pal.accent} strokeWidth="2" strokeLinecap="round"/>
      ))}
      {[0,60,120,180,240,300].map(a => (
        <circle key={a} cx={22+13*Math.cos(a*Math.PI/180)} cy={22+13*Math.sin(a*Math.PI/180)} r="3" fill={pal.accent2}/>
      ))}
      <circle cx="22" cy="22" r="4.5" fill={pal.accent}/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    <svg key={5} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <path d="M22 7 L36 13.5 L36 24 Q36 34.5 22 39 Q8 34.5 8 24 L8 13.5 Z" fill={pal.accent} opacity="0.85"/>
      <path d="M17 23.5 L21 27.5 L28.5 19" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
    <svg key={6} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.7"/>
      <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke={pal.accent2} strokeWidth="1.5" opacity="0.7" transform="rotate(60 22 22)"/>
      <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.7" transform="rotate(120 22 22)"/>
      <circle cx="22" cy="22" r="4.5" fill={pal.accent}/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.35"/>
    </svg>,
    <svg key={7} width={s} height={s} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="11" fill={pal.bg}/>
      <path d="M11 38 Q9 20 18 11 Q22 7 22 16 Q22 25 28 31 Q33 35 31 39 Q24 37 22 30 Q20 37 11 38Z" fill={pal.accent}/>
      <path d="M33 38 Q35 20 26 11 Q22 7 22 16 Q22 25 16 31 Q11 35 13 39 Q20 37 22 30 Q24 37 33 38Z" fill={pal.accent2} opacity="0.8"/>
      <rect width="44" height="44" rx="11" fill="none" stroke={pal.accent} strokeWidth="1.5" opacity="0.4"/>
    </svg>,
  ];

  return shapes[idx];
}
