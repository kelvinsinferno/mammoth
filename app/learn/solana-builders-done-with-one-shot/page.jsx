import Link from 'next/link';

export const metadata = {
  title: 'Why Solana Builders Are Done With One-Shot Launches',
  description: "Mammoth is Solana's cycle-driven token issuance framework for serious builders — multi-round raises, anti-dilution rights, and on-chain treasury routing built for real project timelines.",
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

export default function SolanaBuildersPage() {
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
          <div style={styles.tag}>Mammoth Protocol — Solana Token Infrastructure</div>
          <h1 style={styles.h1}>Why Solana Builders Are Done With One-Shot Launches</h1>
          <p style={styles.meta}>Pump.fun alternatives · Multi-round raises · Serious builder infrastructure</p>

          <p style={styles.p}>Let&apos;s be honest about what the Solana launchpad landscape is right now.</p>
          <p style={styles.p}>It&apos;s mostly meme infrastructure. That&apos;s not a criticism — it&apos;s a description. Pump.fun and platforms like it do exactly what they&apos;re designed to do: let anyone spin up a token in under two minutes, bootstrap liquidity through a bonding curve, and let the market sort it out. The speed is the feature. The volatility is the feature. The lack of friction is the feature.</p>
          <p style={styles.p}>This is a legitimate market. The infrastructure works precisely as intended.</p>
          <p style={styles.p}>But here&apos;s where it breaks down: if your project has an actual roadmap, you&apos;re trying to use a flamethrower to light a candle.</p>

          <h2 style={styles.h2}>The Meme Economy Is Real — and It&apos;s Not Built for You</h2>
          <p style={styles.p}>Meme coins have one capital formation event because that&apos;s all they need. The value proposition is speculative and immediate. There&apos;s no phase two. There&apos;s no &quot;we hit our development milestone, time to raise the next tranche.&quot; The token launches, the curve runs, liquidity graduates, and whatever happens after is secondary to what happened in the first hour.</p>
          <p style={styles.p}>That model is internally coherent. It&apos;s just not a business model.</p>
          <p style={styles.p}>A protocol with an 18-month development roadmap isn&apos;t launching a meme. It needs capital at multiple points in that lifecycle — not just at the starting gun. It needs price mechanics that don&apos;t crater when new tokens enter circulation. It needs holders who understand what they&apos;re holding and why. It needs treasury visibility that builds confidence rather than speculation.</p>
          <p style={styles.p}>The difference isn&apos;t moral. It&apos;s structural. Meme launchpads are built for one thing. If you&apos;re building something else, you need something else.</p>

          <h2 style={styles.h2}>What One-Shot Launches Actually Cost Serious Projects</h2>
          <p style={styles.p}>When serious projects try to retrofit into one-shot mechanics, they run into the same walls:</p>
          <p style={styles.p}>Raise too little early, starve later. If you underprice your initial raise — which is likely when you have no track record — you end up with insufficient runway and no clean path back to the market. Going back with new supply on legacy tooling means you&apos;re diluting early holders without any structured protection.</p>
          <p style={styles.p}>Raise too much early, lose legitimacy. You&apos;ve overestimated demand, printed a treasury that looks like a cash grab, and handed speculators a reason to exit the moment the token hits secondary.</p>
          <p style={styles.p}>The second token problem is real. Some projects punt by issuing a new governance or utility token after their initial token gets traction. Now you&apos;ve split your community, confused your capital structure, and created a migration headache. It&apos;s a workaround, not a solution.</p>
          <p style={styles.p}>One-shot launches force founders into a single high-stakes capital decision made with the least amount of information they&apos;ll ever have about their own project.</p>

          <h2 style={styles.h2}>What Real Builder Infrastructure Looks Like</h2>
          <p style={styles.p}>If you&apos;re building something with a real timeline and real capital needs, token infrastructure has to do four things:</p>
          <p style={styles.p}>Let you raise more than once — cleanly. Subsequent capital events should be a feature of the design, not a hack around it. Multiple discrete raise windows across the life of the project, without off-chain negotiation.</p>
          <p style={styles.p}>Protect early holders when you do. When you open a new round, supply increases. Good infrastructure gives existing holders pro-rata access before any new round opens to the public — so the people who showed up first aren&apos;t the ones who get hurt when you grow.</p>
          <p style={styles.p}>Make price transparent and deterministic. Actual, auditable curve mechanics where anyone can calculate what the next token will cost before they buy. If holders can&apos;t predict how pricing works, they&apos;re not investing in your project — they&apos;re gambling on your behavior.</p>
          <p style={styles.p}>Route treasury funds verifiably. On-chain treasury routing enforced at the protocol level means no &quot;trust us&quot; moment. The allocation configured at cycle creation is the allocation that gets executed.</p>

          <h2 style={styles.h2}>Build in Public With Your Token</h2>
          <p style={styles.p}>Here&apos;s what changes when your token issuance is structured around discrete cycles instead of a single event: your raises become a public record of your progress.</p>
          <p style={styles.p}>Each cycle maps naturally to a build phase. Close cycle one, ship what you said you&apos;d ship, open cycle two. The on-chain record of your raises is a timeline of your commitments and your follow-through. Token holders aren&apos;t just watching price — they&apos;re watching delivery.</p>
          <p style={styles.p}>This inverts the normal dynamic. In a one-shot launch, the token is at its most valuable before anything has been built, and the founder spends the rest of the project&apos;s life justifying that initial price. In a cycle-based model, each successive raise is an opportunity to demonstrate that the previous one was worth it.</p>
          <p style={styles.p}>Cycle opens are announcements. Cycle closes are milestones. Your token timeline becomes your build timeline, publicly, on-chain. You&apos;re not issuing press releases — you&apos;re issuing tokens with verifiable history attached.</p>

          <h2 style={styles.h2}>How Mammoth Works</h2>
          <p style={styles.p}>Mammoth is a Solana-native token issuance framework built specifically for projects that raise capital more than once.</p>
          <p style={styles.p}>Tokens are issued through discrete, bounded minting cycles — never continuously emitted. Each cycle has its own bonding curve (Step, Linear, or Exp-Lite), chosen by the creator and enforced on-chain. Before any new cycle opens to the public, existing holders receive pro-rata rights to participate first. Your earliest supporters don&apos;t get punished for your next raise.</p>
          <p style={styles.p}>Supply modes are configurable. Fixed supply locks a hard cap at launch. Elastic supply allows the cap to be set later — and once set, the transition is irreversible. Treasury routing is configured by the creator at cycle creation and executed deterministically by the protocol.</p>
          <p style={styles.p}>One cycle or ten. Mammoth works either way. If you only need one raise, you still get better price mechanics, better holder protection, and verifiable treasury routing than anything built for a different purpose. If you need ten, each one connects to the last in a way that builds rather than disrupts.</p>

          <h2 style={styles.h2}>Start Where You Are</h2>
          <p style={styles.p}>You don&apos;t have to know your full raise schedule to start. You have to know what you&apos;re building and roughly what the next phase costs. Mammoth handles the rest structurally.</p>
          <p style={styles.p}>The meme economy isn&apos;t going anywhere. But if your project has a roadmap longer than a week, a treasury that needs to fund real work, and holders you actually want to keep — you need infrastructure built for what you&apos;re actually doing.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Solana-native cycle-driven token issuance for serious builders.</span>
            <Link href="/" style={styles.ctaBtn}>Start building on Mammoth →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
