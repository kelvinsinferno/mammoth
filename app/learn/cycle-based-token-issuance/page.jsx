import Link from 'next/link';
import FounderCtaBlock from '@/components/seo/FounderCtaBlock';

export const metadata = {
  title: 'Cycle-Based Token Issuance Explained',
  description: 'Cycle-based token issuance lets projects raise capital in discrete rounds instead of continuous emissions. Learn how Mammoth uses cycles to support repeat fundraising on Solana.',
  alternates: { canonical: '/learn/cycle-based-token-issuance' },
  openGraph: {
    title: 'Cycle-Based Token Issuance Explained | Mammoth Protocol',
    description: 'Cycle-based token issuance lets projects raise capital in discrete rounds instead of continuous emissions. Learn how Mammoth uses cycles to support repeat fundraising on Solana.',
    url: 'https://mammoth-protocol.vercel.app/learn/cycle-based-token-issuance',
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
  highlight: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '16px 18px', marginBottom: 20 },
  highlightLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#A78BFA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  highlightText: { fontSize: 14, color: '#b8c5e0', lineHeight: 1.75 },
  cta: { marginTop: 48, paddingTop: 28, borderTop: '1px solid #1d2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  ctaText: { fontSize: 14, color: '#6b7a99' },
  ctaBtn: { background: '#FF9F1C', color: '#000', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' },
};

export default function CycleBasedTokenIssuancePage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}><div style={styles.headerInner}><Link href="/learn" style={styles.backLink}>← Back to Learn</Link><Link href="/" style={styles.logoLink}>Mammoth Protocol</Link></div></header>
      <div style={styles.container}>
        <article style={styles.panel}>
          <div style={styles.tag}>Mammoth Protocol — Category</div>
          <h1 style={styles.h1}>What Is Cycle-Based Token Issuance?</h1>
          <p style={styles.meta}>Round-based fundraising · Bounded issuance · Repeatable capital formation</p>

          <p style={styles.p}>Cycle-based token issuance is a framework where new tokens are issued through discrete, bounded rounds instead of continuous emissions or one-off launch logic.</p>
          <p style={styles.p}>That matters because real projects often need more than one chance to raise capital. If the token model only works for one launch, the founder is boxed in the moment more runway is needed.</p>

          <h2 style={styles.h2}>Why One-Shot Models Break Down</h2>
          <p style={styles.p}>Most launch systems are optimized for a single event. They are good at distribution, attention, and launch-day momentum. They are much worse at supporting continuity once the project needs another round.</p>
          <p style={styles.p}>That creates a bad choice for founders: either never raise again, or raise again inside a structure that punishes existing holders and damages trust.</p>

          <div style={styles.highlight}>
            <div style={styles.highlightLabel}>Why cycles matter</div>
            <div style={styles.highlightText}>Cycle-based issuance makes repeat fundraising part of the structure from the beginning. Future raises are expected, bounded, and legible instead of improvised and destructive.</div>
          </div>

          <h2 style={styles.h2}>How It Works in Mammoth</h2>
          <p style={styles.p}>In Mammoth, each cycle is its own issuance event. A cycle has a defined supply allocation, a defined pricing curve, and a defined treasury outcome. Once the cycle closes, it closes. Later, a project can open another cycle under explicit rules instead of relying on a system that only makes sense once.</p>
          <p style={styles.p}>This lets a project raise again while keeping the raise legible to both holders and new buyers.</p>

          <h2 style={styles.h2}>Why Founders Should Care</h2>
          <p style={styles.p}>Cycle-based issuance gives a project room to keep building. It treats token fundraising like capital formation, not a single performance. That means better continuity, better planning, and a stronger foundation for future rounds.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Understand how holder protection fits into future cycles.</span>
            <Link href="/learn/rights-offerings-token-launches" style={styles.ctaBtn}>Read rights offerings →</Link>
          </div>

          <FounderCtaBlock />
        </article>
      </div>
    </div>
  );
}
