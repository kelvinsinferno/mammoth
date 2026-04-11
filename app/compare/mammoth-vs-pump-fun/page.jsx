import Link from 'next/link';

export const metadata = {
  title: 'Mammoth vs pump.fun',
  description: 'Mammoth and pump.fun solve different problems. pump.fun is built for one-shot meme launches. Mammoth is built for projects that need repeat fundraising and early-holder protection.',
  alternates: { canonical: '/compare/mammoth-vs-pump-fun' },
  openGraph: {
    title: 'Mammoth vs pump.fun | Mammoth Protocol',
    description: 'Mammoth and pump.fun solve different problems. pump.fun is built for one-shot meme launches. Mammoth is built for projects that need repeat fundraising and early-holder protection.',
    url: 'https://mammoth-protocol.vercel.app/compare/mammoth-vs-pump-fun',
  },
};

const styles = {
  page: { minHeight: '100vh', background: '#080c14', color: '#F0F4FF', fontFamily: "'Space Grotesk', sans-serif" },
  header: { background: 'rgba(8,12,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1d2540', position: 'sticky', top: 0, zIndex: 50 },
  headerInner: { maxWidth: 800, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backLink: { color: '#8B5CF6', textDecoration: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 },
  logoLink: { fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg, #A78BFA, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textDecoration: 'none' },
  container: { maxWidth: 800, margin: '0 auto', padding: '48px 16px 80px' },
  panel: { background: '#0f1420', border: '1px solid #1d2540', borderRadius: 12, padding: '36px 36px' },
  tag: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 },
  h1: { fontWeight: 700, fontSize: 28, lineHeight: 1.25, marginBottom: 8, marginTop: 0 },
  meta: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b7a99', marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid #1d2540' },
  h2: { fontWeight: 700, fontSize: 17, color: '#22D3EE', marginTop: 36, marginBottom: 12 },
  p: { fontSize: 15, color: '#b8c5e0', lineHeight: 1.85, marginBottom: 18, marginTop: 0 },
  cta: { marginTop: 48, paddingTop: 28, borderTop: '1px solid #1d2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  ctaText: { fontSize: 14, color: '#6b7a99' },
  ctaBtn: { background: '#FF9F1C', color: '#000', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' },
};

export default function MammothVsPumpFunPage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}><div style={styles.headerInner}><Link href="/learn" style={styles.backLink}>← Back to Learn</Link><Link href="/" style={styles.logoLink}>Mammoth Protocol</Link></div></header>
      <div style={styles.container}>
        <article style={styles.panel}>
          <div style={styles.tag}>Mammoth Protocol — Comparison</div>
          <h1 style={styles.h1}>Mammoth vs pump.fun</h1>
          <p style={styles.meta}>One-shot launchpad vs repeatable capital formation</p>

          <p style={styles.p}>Mammoth and pump.fun are not trying to solve the same problem.</p>
          <p style={styles.p}>pump.fun is optimized for one-shot meme launches. Mammoth is built for projects that may need to raise capital more than once.</p>

          <h2 style={styles.h2}>What pump.fun Is Good At</h2>
          <p style={styles.p}>pump.fun is good at speed, accessibility, and launch-day energy. It works well when the launch itself is the main event.</p>

          <h2 style={styles.h2}>What Mammoth Is Built For</h2>
          <p style={styles.p}>Mammoth is designed for founders who are not done after launch day. It is built around cycle-based issuance, rights-based anti-dilution, bounded pricing, and repeatable capital formation.</p>

          <h2 style={styles.h2}>The Real Difference</h2>
          <p style={styles.p}><strong style={{ color: '#F0F4FF' }}>pump.fun is built for a launch event.</strong></p>
          <p style={styles.p}><strong style={{ color: '#F0F4FF' }}>Mammoth is built for a capital lifecycle.</strong></p>
          <p style={styles.p}>If a founder expects to keep building, keep fundraising, and keep maintaining holder trust, Mammoth is structurally better suited to that job.</p>

          <h2 style={styles.h2}>Who Should Choose Which</h2>
          <p style={styles.p}>pump.fun makes more sense when the goal is speed and launch-day meme energy.</p>
          <p style={styles.p}>Mammoth makes more sense when the goal is serious fundraising continuity, early-holder protection, and a structure that can survive more than one round.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Understand the founder problem Mammoth is built to solve.</span>
            <Link href="/learn/how-to-raise-capital-without-destroying-token-price" style={styles.ctaBtn}>Read the founder guide →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
