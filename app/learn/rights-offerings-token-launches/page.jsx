import Link from 'next/link';

export const metadata = {
  title: 'Rights Offerings for Token Launches',
  description: 'Rights offerings for token launches give existing holders first access before a new round opens to the public. Learn how Mammoth uses rights-based anti-dilution on Solana.',
  alternates: { canonical: '/learn/rights-offerings-token-launches' },
  openGraph: {
    title: 'Rights Offerings for Token Launches | Mammoth Protocol',
    description: 'Rights offerings for token launches give existing holders first access before a new round opens to the public. Learn how Mammoth uses rights-based anti-dilution on Solana.',
    url: 'https://mammoth-protocol.vercel.app/learn/rights-offerings-token-launches',
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

export default function RightsOfferingsPage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}><div style={styles.headerInner}><Link href="/learn" style={styles.backLink}>← Back to Learn</Link><Link href="/" style={styles.logoLink}>Mammoth Protocol</Link></div></header>
      <div style={styles.container}>
        <article style={styles.panel}>
          <div style={styles.tag}>Mammoth Protocol — Holder Protection</div>
          <h1 style={styles.h1}>Rights Offerings for Token Launches</h1>
          <p style={styles.meta}>Rights-based anti-dilution · Holder-first access · Repeat fundraising</p>

          <p style={styles.p}>A rights offering for token launches is a mechanism that gives existing holders the opportunity to participate before a new issuance round opens to the public.</p>
          <p style={styles.p}>That matters because most token systems treat future fundraising as something that happens to holders, not something they get a fair chance to respond to.</p>

          <h2 style={styles.h2}>The Problem Rights Offerings Solve</h2>
          <p style={styles.p}>When a project raises again through a standard launch structure, early holders often have only one real option: absorb dilution and hope the market is forgiving. That destroys trust over time.</p>
          <p style={styles.p}>Rights offerings create a better relationship between holders and future rounds. They let current holders protect their position before public participation begins.</p>

          <div style={styles.highlight}>
            <div style={styles.highlightLabel}>The key idea</div>
            <div style={styles.highlightText}>Rights-based anti-dilution does not eliminate new supply. It gives existing holders a fair structural way to defend their ownership before a new round opens to the public.</div>
          </div>

          <h2 style={styles.h2}>How Mammoth Uses Rights Offerings</h2>
          <p style={styles.p}>Before a new cycle opens, Mammoth can allocate pro-rata participation rights to existing holders. That means the people who already supported the project do not get pushed aside the moment more capital is needed.</p>
          <p style={styles.p}>This is central to how Mammoth handles repeat fundraising without making every future round feel like extraction.</p>

          <h2 style={styles.h2}>Why Founders Should Care</h2>
          <p style={styles.p}>Founders need a way to keep growing without sending a signal that early supporters are disposable. Rights offerings help preserve that trust by giving holders a fairer structure when new issuance happens.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>See how Mammoth compares to one-shot launch systems.</span>
            <Link href="/compare/mammoth-vs-pump-fun" style={styles.ctaBtn}>Read Mammoth vs pump.fun →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
