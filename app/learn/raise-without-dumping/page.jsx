import Link from 'next/link';

export const metadata = {
  title: 'How to Raise Capital Without Destroying Token Price',
  description: 'Raising capital with a token usually creates dilution pressure and trust problems. Learn how Mammoth uses cycle-based issuance and rights protection to support repeat fundraising.',
  alternates: { canonical: '/learn/how-to-raise-capital-without-destroying-token-price' },
  openGraph: {
    title: 'How to Raise Capital Without Destroying Token Price | Mammoth Protocol',
    description: 'Raising capital with a token usually creates dilution pressure and trust problems. Learn how Mammoth uses cycle-based issuance and rights protection to support repeat fundraising.',
    url: 'https://mammoth-protocol.vercel.app/learn/how-to-raise-capital-without-destroying-token-price',
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
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#F0F4FF', lineHeight: 1.25, marginBottom: 8, marginTop: 0 },
  meta: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b7a99', marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid #1d2540' },
  h2: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: '#22D3EE', marginTop: 36, marginBottom: 12, letterSpacing: '0.02em' },
  p: { fontSize: 15, color: '#b8c5e0', lineHeight: 1.85, marginBottom: 18, marginTop: 0 },
  highlight: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '16px 18px', marginBottom: 20 },
  highlightLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#A78BFA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  highlightText: { fontSize: 14, color: '#b8c5e0', lineHeight: 1.75 },
  cta: { marginTop: 48, paddingTop: 28, borderTop: '1px solid #1d2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  ctaText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#6b7a99' },
  ctaBtn: { background: '#FF9F1C', color: '#000', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 8, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' },
};

export default function RaiseWithoutDumpingPage() {
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
          <div style={styles.tag}>Mammoth Protocol — Token Pricing</div>
          <h1 style={styles.h1}>How to Raise Capital With a Token Without Dumping the Price</h1>
          <p style={styles.meta}>Bounded cycles · Deterministic pricing · Rights-first access</p>

          <h2 style={styles.h2}>The Moment Every Token Founder Dreads</h2>
          <p style={styles.p}>You need capital. The project is real. The team is working. You&apos;ve got traction, or at least a clear path to it — but the treasury is thin and the runway is shorter than it should be.</p>
          <p style={styles.p}>So you start thinking about going back to the market.</p>
          <p style={styles.p}>Then you check the chart. You remember what happened the last time a project you followed announced new supply. The price started sliding before the transaction was even confirmed. Holders who had been quiet for months suddenly appeared in Discord asking if it was a rug. The announcement that was supposed to be a milestone read like a red flag. Within 72 hours, the floor had moved down 30%.</p>
          <p style={styles.p}>That wasn&apos;t a bad project. That was a structural problem.</p>

          <h2 style={styles.h2}>Why New Token Supply Kills Price (It&apos;s Not Bad Luck — It&apos;s Mechanics)</h2>
          <p style={styles.p}>When a token project announces new supply on a standard platform, the secondary market reacts to what it knows — which is almost nothing.</p>
          <p style={styles.p}>No cap on how much will be minted. No price floor set in advance. No guarantee of who gets access first. The announcement contains a rough number, a vague timeline, and a treasury address. The rest is interpretation. And the market interprets aggressively.</p>
          <p style={styles.p}>Here&apos;s the chain of events every time:</p>
          <p style={styles.p}>1. Holders sell in anticipation. New tokens in circulation means their share shrinks. If there&apos;s no mechanism protecting them from dilution, the rational move is to sell now before others do.</p>
          <p style={styles.p}>2. Uncertainty amplifies the move. Nobody knows the ceiling. Is it a 10% supply increase? 40%? Will new tokens be sold at a discount? Without hard answers, participants assume the worst.</p>
          <p style={styles.p}>3. New buyers hesitate. The people you wanted to raise from are now watching price fall. They could buy at secondary prices below your raise price — or wait for the bottom.</p>
          <p style={styles.p}>4. The signal is all wrong. &quot;We&apos;re minting more tokens&quot; reads identically to &quot;we&apos;re out of money and diluting you to survive.&quot; The market has no mechanism to distinguish a healthy expansion raise from a desperation raise. So it prices in distress.</p>
          <p style={styles.p}>None of this is irrational. It&apos;s a correct response to a structure that provides no protection, no transparency, and no predictability. The problem isn&apos;t your community — it&apos;s the tool you&apos;re using.</p>

          <h2 style={styles.h2}>How Bounded Cycles Change the Equation</h2>
          <div style={styles.highlight}>
            <div style={styles.highlightLabel}>Core insight</div>
            <div style={styles.highlightText}>Supply shock is caused by uncertainty, not by supply itself. If your holders know exactly how many tokens can be minted, at what price, through what curve, and when the window closes — there is no shock. There is only an expected event.</div>
          </div>
          <p style={styles.p}>Mammoth issues tokens through discrete, bounded minting cycles. Each cycle has a defined supply cap, a bonding curve that determines price at every point, and a closing condition. Nothing mints outside a cycle. Nothing mints above a cycle&apos;s cap. When a cycle ends, it ends — the supply from that cycle is fixed, on-chain, and immutable.</p>
          <p style={styles.p}>Holders can see it coming. They know the ceiling. They can model their dilution at maximum mint and act accordingly — either by exercising their rights, or choosing to hold through a fully disclosed event.</p>
          <p style={styles.p}>Surprise is the enemy of price stability. Bounded cycles eliminate the surprise.</p>

          <h2 style={styles.h2}>The Three Mechanisms That Protect Price on Mammoth</h2>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>1. Bounded Cycles — Supply Shock Is Structurally Impossible</strong></p>
          <p style={styles.p}>Every cycle specifies its supply cap at creation, enforced on-chain. There is no mechanism for the issuer to mint above it. Holders know the worst-case dilution scenario before the cycle opens. That&apos;s a fundamentally different information environment than &quot;new tokens announced, amount TBD.&quot;</p>
          <p style={styles.p}>The cap also signals something important: the raise has a ceiling. It&apos;s not open-ended. Markets price bounded events differently than unbounded ones — because bounded events have a resolution point.</p>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>2. Bonding Curve Pricing — Price Is Deterministic, Not Set by Panic</strong></p>
          <p style={styles.p}>Mammoth cycles operate on a bonding curve — Step, Linear, or Exp-Lite — configured at cycle creation. The curve defines the exact price at every point in the mint. Early participants pay less; later participants pay more. The pricing is mechanical, visible, and auditable in advance.</p>
          <p style={styles.p}>New buyers aren&apos;t competing with secondary market collapse for price discovery. They&apos;re buying against a curve they can audit. The panic-driven repricing spiral doesn&apos;t happen because the price isn&apos;t set by sentiment.</p>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>3. Rights Window — Existing Holders Get First Access</strong></p>
          <p style={styles.p}>The rug signal new supply sends isn&apos;t just about dilution — it&apos;s about exclusion. Existing holders feel like insiders when the project is small and outsiders the moment new capital is needed. The people who took the earliest risk get no structural advantage when new supply enters.</p>
          <p style={styles.p}>Mammoth inverts this. Before each new cycle opens to the public, existing holders receive pro-rata rights to participate first. They can maintain their proportional position before new buyers enter.</p>
          <p style={styles.p}>Instead of watching new supply arrive and calculating how much they&apos;ve been cut, holders are offered a window to protect their position. The new cycle isn&apos;t something being done to them — it&apos;s something they&apos;re invited into first. Holders who trust the structure don&apos;t need to sell defensively.</p>

          <h2 style={styles.h2}>Before and After: The Same Raise, Two Very Different Outcomes</h2>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>Standard platform — Project announces new supply:</strong><br/>
          Announcement goes out. No supply cap specified. No curve published. Treasury address shared, routing unconfirmed. Secondary volume spikes within hours. Price falls 25% before the raise opens. New buyers delay, watching for the floor. The raise underperforms. Holders who stayed are down. Narrative shifts from &quot;growing project&quot; to &quot;diluted holders.&quot;</p>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>Mammoth — Project opens Cycle 2:</strong><br/>
          Cycle 2 published with defined supply cap, linear bonding curve, rights window for existing holders, and treasury routing locked at creation. Existing holders receive their pro-rata rights. Some exercise, some don&apos;t — but all were offered first access. The cap is visible. The curve is visible. Secondary market participants can price the worst-case dilution without uncertainty-driven panic. Raise closes when the cap hits or window ends. Price action follows the curve, not sentiment.</p>
          <p style={styles.p}>Same need. Completely different mechanics. Completely different outcome.</p>

          <h2 style={styles.h2}>The &ldquo;Second Token&rdquo; Trap &mdash; and How Cycle Issuance Ends It</h2>
          <p style={styles.p}>When founders hit the re-raise wall without a clean mechanism for issuing new supply, they often reach for the worst possible solution: launch a second token.</p>
          <p style={styles.p}>Token B gets framed as a &quot;utility token&quot; or &quot;governance token.&quot; What it actually is: a permanent fracture in your community&apos;s attention and capital, and a dilution event for Token A holders that comes with no rights, no curve, and no explanation that holds up to scrutiny.</p>
          <p style={styles.p}>Token B splits your community. Some holders stay with Token A, others migrate. The bridge between them is always messy. Token A loses narrative gravity because the team is now talking about two things. New buyers have to choose which token to believe in — and many choose neither.</p>
          <p style={styles.p}>The need for Token B doesn&apos;t come from ambition. It comes from structural limitations in Token A&apos;s issuance framework.</p>
          <p style={styles.p}>Cycle-based issuance eliminates that design flaw. One token. Multiple cycles. Each one bounded, rights-protected, and curve-priced. No second token needed.</p>

          <h2 style={styles.h2}>Build on a Framework That Protects the Cap Table</h2>
          <p style={styles.p}>There is no tokenomics strategy, no vesting schedule, and no community management approach that compensates for a fundamentally broken issuance structure. If your framework creates supply shock by design, you&apos;ll fight it every time you need capital.</p>
          <p style={styles.p}>Bounded cycles, deterministic pricing, and rights-first access aren&apos;t features layered on top of a standard token launch. They&apos;re the structure that makes additional raises viable in the first place.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Bounded cycles. Deterministic pricing. Rights-first access.</span>
            <Link href="/" style={styles.ctaBtn}>Start building on Mammoth →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
