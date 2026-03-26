'use client';

export default function Spark({ data, up }) {
  const w = 72, h = 30;
  const min = Math.min(...data), rng = Math.max(...data) - min || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/rng)*(h-3)-1.5}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display:'block', flexShrink:0 }}>
      <polyline points={pts} fill="none" stroke={up ? '#22D3EE' : '#F43F5E'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}
