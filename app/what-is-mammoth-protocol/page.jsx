import Link from 'next/link';
import FounderCtaBlock from '@/components/seo/FounderCtaBlock';

export const metadata = {
  title: 'What Is Mammoth Protocol?',
  description: 'Mammoth Protocol is a Solana-based token issuance framework built for projects that need to raise in rounds, protect early holders, and avoid forced dilution.',
  alternates: { canonical: '/what-is-mammoth-protocol' },
  openGraph: {
    title: 'What Is Mammoth Protocol? | Mammoth Protocol',
    description: 'Mammoth Protocol is a Solana-based token issuance framework built for projects that need to raise in rounds, protect early holders, and avoid forced dilution.',
    url: 'https://mammoth-protocol.vercel.app/what-is-mammoth-protocol',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Is Mammoth Protocol? | Mammoth Protocol',
    description: 'Mammoth Protocol is a Solana-based token issuance framework built for projects that need to raise in rounds, protect early holders, and avoid forced dilution.',
  },
};

const styles = {
  page: { minHeight: '100vh', background: '#080c14', color: '#F0F4FF', fontFamily: "'Space Grotesk', sans-serif" },
  header: { background: 'rgba(8,12,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1d2540', position: 'sticky', top: 0, zIndex: 50 },
  headerInner: { maxWidth: 800, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backLink: { color: '#8B5CF6', textDecoration: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 },
  logoLink: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg, #A78BFA, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textDecoration: 'none' },
  container: { maxWidth: 800, margin: '0 auto', padding: '48px 16px 80px' },
  panel: { background: '#0f1420', border: '1px solid #1d2540', borderRadius: 12, padding: '36px 36px' },
  tag: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 },
  h1: { fontWeight: 700, fontSize: 28, color: '#F0F4FF', lineHeight: 1.25, marginBottom: 8, marginTop: 0 },
  meta: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b7a99', marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid #1d2540' },
  h2: { fontWeight: 700, fontSize: 17, color: '#22D3EE', marginTop: 36, marginBottom: 12, letterSpacing: '0.02em' },
  p: { fontSize: 15, color: '#b8c5e0', lineHeight: 1.85, marginBottom: 18, marginTop: 0 },
  ul: { margin: '0 0 18px 18px', color: '#b8c5e0', lineHeight: 1.85 },
  li: { marginBottom: 8 },
  highlight: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '16px 18px', marginBottom: 20 },
  highlightLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#A78BFA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  highlightText: { fontSize: 14, color: '#b8c5e0', lineHeight: 1.75 },
  cta: { marginTop: 48, paddingTop: 28, borderTop: '1px solid #1d2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  ctaText: { fontSize: 14, color: '#6b7a99' },
  ctaBtn: { background: '#FF9F1C', color: '#000', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' },
};

export default function WhatIsMammothProtocolPage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link href="/learn" style={styles.backLink}>← Back to Learn</Link>
          <Link href="/" style={styles.logoLink}>Mammoth Protocol</Link>
        </div>
      </header>

      <div style={styles.container}>
        <article style={styles.panel}>
          <div style={styles.tag}>Mammoth Protocol — Overview</div>
          <h1 style={styles.h1}>What Is Mammoth Protocol?</h1>
          <p style={styles.meta}>Cycle-based issuance · Rights protection · Solana-native capital formation</p>

          <p style={styles.p}>Mammoth Protocol is a Solana-based token issuance framework built for projects that are not done after one launch.</p>
          <p style={styles.p}>Most token launch systems are built around a single event. A project launches once, capital is raised once, and after that the structure starts breaking down. If the team ever needs to raise again, early holders get diluted, price expectations get distorted, and the whole system starts working against long-term growth.</p>
          <p style={styles.p}>Mammoth is designed around a different idea: token launches should support real capital formation, not just a one-day event.</p>

          <div style={styles.highlight}>
            <div style={styles.highlightLabel}>Core insight</div>
            <div style={styles.highlightText}>Markets do not hate fundraising. They hate forced dilution. Mammoth is built so projects can raise in rounds while giving existing holders a fair structure when new issuance happens.</div>
          </div>

          <h2 style={styles.h2}>How Mammoth Works</h2>
          <p style={styles.p}>Instead of continuous emissions or improvised future raises, Mammoth uses discrete issuance rounds called cycles. Each cycle has a known allocation, pricing structure, and treasury outcome. That makes future fundraising expected, not chaotic.</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Cycle-based issuance</strong> instead of continuous emissions</li>
            <li style={styles.li}><strong>Rights-based anti-dilution</strong> so existing holders can protect their position</li>
            <li style={styles.li}><strong>Bounded bonding curves</strong> so pricing stays legible</li>
            <li style={styles.li}><strong>On-chain treasury routing</strong> so raise outcomes are transparent</li>
            <li style={styles.li}><strong>Solana-native execution</strong> for speed and real market use</li>
          </ul>

          <h2 style={styles.h2}>Who Mammoth Is For</h2>
          <p style={styles.p}>Mammoth is for founders, protocol teams, and builders who may need to raise more than once. It is designed for projects that care about continuity, holder trust, and a token model that does not turn against them the moment more capital is needed.</p>
          <p style={styles.p}>It is built for launch day and everything that can come after it.</p>

          <h2 style={styles.h2}>Why It Matters</h2>
          <p style={styles.p}>If a launch system only works once, it is not enough for a real founder. Mammoth exists to make repeat fundraising structurally possible without treating early holders as collateral damage.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Understand the mechanics behind Mammoth’s fundraising model.</span>
            <Link href="/learn/cycle-based-token-issuance" style={styles.ctaBtn}>Read cycle-based issuance →</Link>
          </div>

          <FounderCtaBlock />
        </article>
      </div>
    </div>
  );
}
