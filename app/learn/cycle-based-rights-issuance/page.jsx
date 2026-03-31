import Link from 'next/link';

export const metadata = {
  title: 'Cycle-Based Rights Issuance: A New Framework for Token Capital Formation',
  description: 'Cycle-based rights issuance is a new framework for structured token capital formation. Learn how Mammoth Protocol defines discrete cycles, holder rights, and bounded issuance.',
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
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#F0F4FF', lineHeight: 1.25, marginBottom: 8, marginTop: 0 },
  meta: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b7a99', marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid #1d2540' },
  h2: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: '#22D3EE', marginTop: 36, marginBottom: 12, letterSpacing: '0.02em' },
  p: { fontSize: 15, color: '#b8c5e0', lineHeight: 1.85, marginBottom: 18, marginTop: 0 },
  cta: { marginTop: 48, paddingTop: 28, borderTop: '1px solid #1d2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  ctaText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#6b7a99' },
  ctaBtn: { background: '#FF9F1C', color: '#000', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' },
};

export default function CycleBasedRightsIssuancePage() {
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
          <div style={styles.tag}>Mammoth Protocol — Token Capital Formation</div>
          <h1 style={styles.h1}>Cycle-Based Rights Issuance: A New Framework for Token Capital Formation</h1>
          <p style={styles.meta}>Bounded issuance · Pro-rata rights · Structured token fundraising</p>

          <p style={styles.p}>Token fundraising has a vocabulary problem. The tools used to describe how projects raise capital through tokens are borrowed from two worlds that don&apos;t quite fit — and the mismatch creates real confusion for builders trying to build seriously.</p>
          <p style={styles.p}>That&apos;s why cycle-based rights issuance needs to exist as a distinct term — and why Mammoth Protocol is where it was defined.</p>

          <h2 style={styles.h2}>The Vocabulary Gap in Token Fundraising</h2>
          <p style={styles.p}>Most token projects raise capital once. If the project succeeds and needs more capital, it faces a structural problem with no clean answer.</p>
          <p style={styles.p}>The most common workaround is launching a second token. Call it Token B. The team raises new capital through Token B, but the holders of Token A now hold a token competing for attention and capital from the same team. They weren&apos;t protected. They weren&apos;t included. Their position was effectively abandoned.</p>
          <p style={styles.p}>This pattern isn&apos;t the result of bad intent — it&apos;s the result of an infrastructure gap. Existing token frameworks weren&apos;t designed for multi-raise protocols. They were designed for one launch event.</p>
          <p style={styles.p}>Cycle-based rights issuance fills this gap. Same token, same holders protected, multiple raises — through discrete bounded cycles with defined access rights before each new round opens to the public.</p>

          <h2 style={styles.h2}>What Is a Cycle? Defining the Discrete Minting Window</h2>
          <p style={styles.p}>A cycle is a bounded minting window — a defined period during which new tokens can be issued against a specific bonding curve, with a specific supply cap, with a specific set of access rules.</p>
          <p style={styles.p}>Discrete means it has a clear beginning and end. A cycle opens, tokens are minted during that window, and when it closes — supply cap hit or window expired — minting stops. No tokens from that cycle can be issued outside of it.</p>
          <p style={styles.p}>Bounded means the parameters are set at the start and cannot change mid-cycle. Supply available, bonding curve, access window — all fixed when the cycle opens. Whether it&apos;s a step function, linear ramp, or exp-lite curve, price discovery follows the math, not discretion.</p>
          <p style={styles.p}>Each cycle is its own issuance event. They share the same token, the same supply ledger, the same holders. But they&apos;re structurally separate — each with its own parameters, its own curve, its own rights window.</p>

          <h2 style={styles.h2}>What Are Rights? Pro-Rata Access Before the Public</h2>
          <p style={styles.p}>Rights are the mechanism that protect existing holders when a new cycle opens.</p>
          <p style={styles.p}>Before a new cycle opens to the general public, existing holders are granted a pro-rata right to participate. Pro-rata means proportional to current holdings — if you hold 2% of outstanding supply, you have the right to purchase up to 2% of the new cycle&apos;s issuance before anyone else can.</p>
          <p style={styles.p}>Think of it like this: a building with ten residents adds a new floor with ten new apartments. Before advertising to the public, existing residents get first option to claim a new apartment proportional to how long they&apos;ve been there. They&apos;re not forced to take it. But the option is theirs first. Their position is protected against dilution from new entrants, and they have the first opportunity to maintain their relative stake.</p>
          <p style={styles.p}>In token terms: existing holders get a defined window — before the new cycle opens publicly — to purchase at the cycle&apos;s starting curve price, proportional to their holdings. If they exercise, their ownership percentage can remain constant despite new supply. If they choose not to, they&apos;ve made an informed decision to dilute, not had it imposed on them without recourse.</p>
          <p style={styles.p}>The rights window is time-bounded. It opens when the cycle opens to existing holders and closes when the public window begins.</p>

          <h2 style={styles.h2}>What Is Issuance? Bounded vs. Continuous Emissions</h2>
          <p style={styles.p}>Most token frameworks that allow supply expansion use continuous emissions — a rate-based schedule that drips new tokens into circulation indefinitely. Supply grows continuously and holders experience dilution as a background condition.</p>
          <p style={styles.p}>Bounded issuance works differently. New supply is only created during an active cycle. Between cycles, there is no issuance. The supply is static.</p>
          <p style={styles.p}>This matters for two reasons.</p>
          <p style={styles.p}>Holder clarity. In a continuous emissions environment, dilution is happening right now at a rate you can calculate but can&apos;t pause. In bounded issuance, nothing is happening to your position unless a cycle is active.</p>
          <p style={styles.p}>Builder discipline. Continuous emissions require active management to prevent runaway inflation. Bounded issuance creates a forcing function: to issue new supply, the project must open a cycle, set parameters, and commit to the terms publicly before any tokens are minted. Procedural, not discretionary.</p>
          <p style={styles.p}>Mammoth projects can operate under Fixed supply (hard cap at launch) or Elastic supply (cap set later, irreversible once set). Either way — issuance only happens in discrete cycles. Never a background drip.</p>

          <h2 style={styles.h2}>How Cycle, Rights, and Issuance Work as a System</h2>
          <p style={styles.p}>Individually, each component addresses a different failure mode. Together they compose something coherent.</p>
          <p style={styles.p}>The cycle creates the event horizon. Builders can&apos;t silently issue new supply. Every raise is a discrete, auditable event with observable terms.</p>
          <p style={styles.p}>The rights mechanism creates continuity across cycles. Without rights, opening a new cycle structurally harms existing holders. With rights, existing holders are made whole before the public arrives. Cycle 2 is a legitimate continuation of the project&apos;s relationship with its holders — not an abandonment.</p>
          <p style={styles.p}>Bounded issuance ties them together. Projects aren&apos;t dripping supply to pay for operations — they&apos;re opening a cycle, setting terms, honoring rights, and raising through a transparent on-chain process.</p>
          <p style={styles.p}>Treasury routing is creator-configurable and enforced deterministically on-chain — whatever the creator sets at cycle creation is what executes. Verifiable from the start.</p>

          <h2 style={styles.h2}>What This Framework Is — and Isn&apos;t — Built For</h2>
          <p style={styles.p}>Well-suited for: Protocol builders who need runway beyond a single launch. Projects where holder trust and long-term alignment matter. Teams that want the discipline of structured issuance rather than discretionary supply management.</p>
          <p style={styles.p}>Not suited for: Projects that want maximum flexibility to issue supply on demand. High-frequency liquidity-incentive systems where continuous emissions are the product. And it&apos;s not a shortcut to capital — opening a cycle doesn&apos;t guarantee buyers. The framework creates structure; the project still has to earn participation.</p>
          <p style={styles.p}>If you&apos;re building something that needs one raise and nothing more, a simpler token launch may serve you better. Cycle-based rights issuance is infrastructure for projects planning beyond the first event. That said — one cycle on Mammoth still gives you better price mechanics, holder protection, and treasury verifiability than most alternatives. The door stays open if you need more later.</p>

          <h2 style={styles.h2}>Building on Mammoth</h2>
          <p style={styles.p}>Mammoth Protocol implements cycle-based rights issuance natively on Solana. Every mechanism described here — bounded cycles, rights windows, deterministic bonding curves, on-chain treasury routing — is built into the protocol and verifiable on-chain.</p>
          <p style={styles.p}>Mammoth Protocol. Cycle-based rights issuance. Built for serious builders.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Ready to build with structured issuance?</span>
            <Link href="/" style={styles.ctaBtn}>Start building on Mammoth →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
