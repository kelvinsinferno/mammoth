import Link from 'next/link';

export const metadata = {
  title: 'Multi-Round Token Fundraising: Why One Shot Isn\'t Enough',
  description: 'Most token launches are one-shot events. Learn why multi-round token fundraising requires cycle-based issuance — and how to raise again without dumping price.',
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#080c14',
    color: '#F0F4FF',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  header: {
    background: 'rgba(8,12,20,0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #1d2540',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '0 16px',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backLink: {
    color: '#8B5CF6',
    textDecoration: 'none',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  logoLink: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    background: 'linear-gradient(90deg, #A78BFA, #22D3EE)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '48px 16px 80px',
  },
  panel: {
    background: '#0f1420',
    border: '1px solid #1d2540',
    borderRadius: 12,
    padding: '36px 36px',
  },
  tag: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 12,
  },
  h1: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 28,
    color: '#F0F4FF',
    lineHeight: 1.25,
    marginBottom: 8,
    marginTop: 0,
  },
  meta: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: '#6b7a99',
    marginBottom: 32,
    paddingBottom: 28,
    borderBottom: '1px solid #1d2540',
  },
  h2: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 17,
    color: '#22D3EE',
    marginTop: 36,
    marginBottom: 12,
    letterSpacing: '0.02em',
  },
  p: {
    fontSize: 15,
    color: '#b8c5e0',
    lineHeight: 1.85,
    marginBottom: 18,
    marginTop: 0,
  },
  cta: {
    marginTop: 48,
    paddingTop: 28,
    borderTop: '1px solid #1d2540',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  ctaText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
    color: '#6b7a99',
  },
  ctaBtn: {
    background: '#FF9F1C',
    color: '#000',
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    fontSize: 13,
    padding: '11px 22px',
    borderRadius: 8,
    textDecoration: 'none',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
};

export default function MultiRoundFundraisingPage() {
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
          <div style={styles.tag}>Mammoth Protocol — Token Fundraising</div>
          <h1 style={styles.h1}>Multi-Round Token Fundraising: Why One Shot Isn&apos;t Enough</h1>
          <p style={styles.meta}>Cycle-based issuance · Anti-dilution rights · Multi-stage capital formation</p>

          <h2 style={styles.h2}>The Problem Nobody Talks About After the Launch</h2>
          <p style={styles.p}>You launched your token. Maybe it went well — initial excitement, liquidity, early believers in. Maybe it didn&apos;t go as well as you hoped. Either way, you&apos;re six months in, you&apos;ve shipped real product, your team has grown, and now you need to raise again.</p>
          <p style={styles.p}>And you realize: you can&apos;t.</p>
          <p style={styles.p}>Not easily, anyway. The mechanics of how you launched the first time have painted you into a corner. Your options are roughly:</p>
          <p style={styles.p}>1. Mint new supply — which dilutes existing holders, tanks price confidence, and signals to the market that your token is an ATM for the founders.<br/>2. Sell from treasury — which creates the same price pressure, just slower.<br/>3. Don&apos;t raise — bootstrap forever, slow the build, fall behind.<br/>4. Go back to VCs — off-chain capital, messy dynamics, bifurcated fundraising structure.</p>
          <p style={styles.p}>This is the re-raise dilemma. And it&apos;s not talked about nearly enough, because most of the conversation in crypto is about getting the launch right — not about what happens when you need to come back.</p>
          <p style={styles.p}>Traditional startups figured this out a long time ago. You raise a seed round from early believers at one price point. You build. You hit milestones. You open a new round at a higher valuation, and your early investors are protected because their position is established before the new round changes the structure. The mechanics allow for repeated fundraising without destroying the early investors&apos; position.</p>
          <p style={styles.p}>Tokens, as they&apos;re typically launched, don&apos;t work that way. That&apos;s not an opinion — it&apos;s an architectural problem.</p>

          <h2 style={styles.h2}>Why Most Token Launches Are Structurally One-Shot</h2>
          <p style={styles.p}>The dominant models for token launches all share a design assumption: you raise once, you distribute, and then it&apos;s a market.</p>
          <p style={styles.p}>Pump.fun is the most visible version of this. You launch on a bonding curve, price moves with buys and sells, and when you hit a threshold the liquidity migrates to a DEX. Done. That&apos;s fine for a meme coin. It&apos;s a terrible model for a project that needs to raise multiple times across multiple milestones.</p>
          <p style={styles.p}>IDO launchpads are more structured, but the core problem is the same: you raise once, tokens go out, price is set by the market from that moment forward. Any new supply you introduce is a sell event. Any announcement of future token sales creates anticipatory selling. The market structure actively punishes the act of going back to raise more.</p>
          <p style={styles.p}>The pattern is consistent: existing platforms were built for one moment in time, not for the full arc of a startup&apos;s capital needs.</p>

          <h2 style={styles.h2}>What &ldquo;Raise in Rounds&rdquo; Actually Requires</h2>
          <p style={styles.p}>When you strip out everything and look at the functional mechanics of how companies raise in rounds, it comes down to a few things:</p>
          <p style={styles.p}>Price is bounded per round. You don&apos;t raise at a price that floats freely. You set terms, raise at that price, close the round.</p>
          <p style={styles.p}>Early participants have a protected position before new capital comes in. People who took real risk in early rounds get first look at the next round before it opens to new participants.</p>
          <p style={styles.p}>Each round is discrete. You can point to it, close it, and build from it. There&apos;s a before and after.</p>
          <p style={styles.p}>You can come back. The architecture assumes you&apos;ll raise again. It&apos;s not an exception to the model — it&apos;s built into the model.</p>
          <p style={styles.p}>None of this requires any particular legal instrument. These are mechanics. And there&apos;s no reason these mechanics can&apos;t exist in a token issuance framework — if the framework was actually designed for them.</p>

          <h2 style={styles.h2}>Cycle-Based Issuance: The Structural Fix</h2>
          <p style={styles.p}>The core premise is simple: tokens should only be issued through discrete, bounded minting cycles — never through continuous emissions. Each cycle has a defined price curve, a defined supply allocation, and a hard close. When a cycle ends, it ends. No more tokens issued from that cycle. Ever.</p>
          <p style={styles.p}>The price within each cycle is determined by a bonding curve — Step, Linear, or Exp-Lite. The key word is bounded. The price is set by the curve mechanics, not by secondary market speculation. Early buyers in a cycle get in at a lower point on the curve. Later buyers pay more. The curve is transparent and deterministic before the cycle opens.</p>
          <p style={styles.p}>When you&apos;re ready to raise again, you open a new cycle. New supply. New price curve. But here&apos;s the critical piece: existing holders from previous cycles get pro-rata rights before the new cycle opens to the public.</p>
          <p style={styles.p}>That&apos;s the rights-based anti-dilution mechanism. Your Cycle 1 holders don&apos;t get blindsided by new supply. They get first access to maintain their proportional position if they choose to. Only after the rights window closes does the new cycle open to new participants.</p>
          <p style={styles.p}>Raise in rounds. Protect early holders. Come back for more. Not as a tagline — as a system.</p>

          <h2 style={styles.h2}>What This Looks Like in Practice</h2>
          <p style={styles.p}>A team building an on-chain protocol launches Cycle 1. Linear bonding curve, 1M token allocation, price starts at $0.05 and scales to $0.20 as supply fills. Early believers come in at the low end. The cycle fills over three weeks. ~$125K raised. Cycle closes. No more Cycle 1 tokens, ever.</p>
          <p style={styles.p}>Six months pass. The team ships the core protocol, has early users, wants to raise again for the next phase.</p>
          <p style={styles.p}>They open Cycle 2. New allocation: 2M tokens. New curve starting where Cycle 1 ended. Before the cycle opens publicly, every Cycle 1 holder gets a rights window — 72 hours, pro-rata allocation at current curve pricing. Some exercise. Some don&apos;t. After 72 hours, remaining allocation opens to new participants.</p>
          <p style={styles.p}>Cycle 1 holders aren&apos;t blindsided. New investors come in at a price reflecting real progress. The team raises again without dumping on their existing market. Treasury routes deterministically on-chain — no discretion, no ambiguity.</p>
          <p style={styles.p}>When they need a third raise, the architecture still works. Cycle 3 holders get rights before Cycle 4. The model compounds.</p>

          <h2 style={styles.h2}>Why This Matters for Builders, Not Just Tokenomics</h2>
          <p style={styles.p}>Credibility across rounds. When Cycle 1 holders see a Cycle 2 with rights protection, they know you&apos;re not farming them. Their network becomes your next round&apos;s audience. Word-of-mouth from protected early holders is qualitatively different from word-of-mouth from people who feel dumped on.</p>
          <p style={styles.p}>Milestone-indexed fundraising. Each cycle maps to a real build phase. You close Cycle 1 when you raise enough for phase one. You open Cycle 2 when you&apos;ve hit the milestones that justify a new raise.</p>
          <p style={styles.p}>Price signal integrity. With bounded cycles, the market isn&apos;t always pricing in &quot;when does the team sell more?&quot; It has a clean answer: the team raises through a new cycle with a defined curve, announced before it happens. Holders can model it.</p>
          <p style={styles.p}>Treasury clarity. Deterministic treasury routing built into the protocol means no trust questions about where proceeds go. It&apos;s on-chain, pre-defined, transparent.</p>

          <h2 style={styles.h2}>Build Something That Can Come Back for More</h2>
          <p style={styles.p}>If you&apos;re planning a token launch, the question isn&apos;t just &quot;how do I launch well?&quot; It&apos;s &quot;how do I build a fundraising structure I can use across the full arc of this project?&quot;</p>
          <p style={styles.p}>One-shot launches were the default because nothing better existed. That&apos;s changed.</p>
          <p style={styles.p}>Mammoth is the protocol built for this — Solana-native, cycle-driven token issuance for founders who need to raise in rounds, protect their early believers, and come back for more without burning what they built.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Ready to raise in rounds?</span>
            <Link href="/" style={styles.ctaBtn}>Start building on Mammoth →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
