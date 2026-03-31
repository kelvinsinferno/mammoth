import Link from 'next/link';

export const metadata = {
  title: 'The Early Holder Problem: Why Most Token Launches Punish the People Who Believed First',
  description: "Early token holders get diluted when projects raise again — not from bad intent, but broken infrastructure. Learn how Mammoth's rights mechanics change that structurally.",
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

export default function EarlyHolderProblemPage() {
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
          <div style={styles.tag}>Mammoth Protocol — Holder Protection</div>
          <h1 style={styles.h1}>The Early Holder Problem: Why Most Token Launches Punish the People Who Believed First</h1>
          <p style={styles.meta}>Rights-based anti-dilution · Informed dilution vs imposed dilution · Structural protection</p>

          <h2 style={styles.h2}>The Announcement That Wrecks Your Position</h2>
          <p style={styles.p}>You bought early. You believed in the project before there was much to believe in — before the product was live, before the community had scale, before anyone outside a small Discord server had heard of it. You took real risk.</p>
          <p style={styles.p}>Then one morning you open the app and there&apos;s a pinned announcement in the general channel. &quot;Exciting news — we&apos;re launching our next funding round. This is a huge milestone for the project.&quot; There&apos;s a celebratory GIF. The mods are hyped.</p>
          <p style={styles.p}>You read it twice. Then you check your portfolio.</p>
          <p style={styles.p}>Your position is already down. Not because the project failed — because it&apos;s raising more capital. New tokens entering circulation. New buyers getting in at a price that reflects current traction, not early risk. The supply expanded, and the market is repricing what your stake is worth.</p>
          <p style={styles.p}>You scroll back through the announcement looking for the part where it explains what happens to existing holders. There isn&apos;t one. Or there&apos;s a sentence — &quot;we&apos;ll always prioritize our early community&quot; — that means absolutely nothing in practical terms. There&apos;s no mechanism. There&apos;s no window. There&apos;s no allocation waiting for you. The raise is happening to you, not with you.</p>
          <p style={styles.p}>This is the early holder problem. And it happens constantly, across every layer of the token market.</p>

          <h2 style={styles.h2}>Why This Keeps Happening (It&apos;s Not the Team)</h2>
          <p style={styles.p}>Most founders raising capital through tokens genuinely want to treat their early holders well. The problem isn&apos;t intent — it&apos;s infrastructure.</p>
          <p style={styles.p}>The tooling most projects build on has no native concept of holder protection across multiple raises. There&apos;s no primitive for &quot;before this new supply enters circulation, existing holders get first access.&quot; The protocol doesn&apos;t know your wallet held tokens from the beginning. It doesn&apos;t route any allocation to you. It just mints.</p>
          <p style={styles.p}>When the infrastructure doesn&apos;t support a mechanic, that mechanic doesn&apos;t happen — no matter how good the intentions. You can&apos;t promise something the system isn&apos;t designed to enforce.</p>
          <p style={styles.p}>Most token issuance frameworks treat every raise as a standalone event. Cycle one and cycle two are unrelated from the protocol&apos;s perspective. No ledger of who participated before. No automatic pro-rata calculation. No rights allocation triggered by existing holdings. The second raise starts fresh, open to anyone with capital, with zero obligation to the people who showed up first.</p>
          <p style={styles.p}>That&apos;s a tooling problem.</p>

          <h2 style={styles.h2}>Promises Aren&apos;t Mechanics</h2>
          <p style={styles.p}>Structural anti-dilution is the difference between a team saying they&apos;ll protect you and a protocol that enforces protection automatically.</p>
          <p style={styles.p}>You&apos;ve seen the first version: &quot;We&apos;re committed to our early community.&quot; &quot;We&apos;ll always honor the people who believed first.&quot;</p>
          <p style={styles.p}>None of that is enforceable. It&apos;s a social commitment backed by nothing except the team&apos;s continued goodwill — which is worth something until circumstances change, until new investors apply pressure, until the team rotates.</p>
          <p style={styles.p}>Structural anti-dilution is different. The protocol itself — before a new minting cycle opens to the public — calculates your proportional holdings, assigns you a rights allocation, opens a defined window for you to exercise, and only then allows the public raise to proceed. No team decision required. No announcement that may or may not include you.</p>
          <p style={styles.p}>Not whether a team says the right things. Whether the framework they&apos;re building on can enforce what they&apos;re promising.</p>

          <h2 style={styles.h2}>How Mammoth&apos;s Rights Window Works — From Your Seat</h2>
          <p style={styles.p}>You participate in Cycle 1. You hold tokens. The project builds. At some point the team opens Cycle 2.</p>
          <p style={styles.p}>Before Cycle 2 opens to the public, the protocol identifies your Cycle 1 holdings and calculates a pro-rata rights allocation. A defined window opens — you can exercise at the cycle&apos;s starting price, before anyone else gets access.</p>
          <p style={styles.p}>You now have a choice. Exercise your rights, maintain your proportional ownership, participate in Cycle 2 at the curve&apos;s starting price. Or choose not to — maybe the project has evolved in a direction you&apos;re less confident in. That&apos;s a decision you&apos;re making with full information, in a defined window, on your own terms.</p>
          <p style={styles.p}>If your position dilutes because you chose not to exercise, that&apos;s informed dilution. You had the option. You passed. That is categorically different from dilution that happens to you while you&apos;re asleep, with no window, no allocation, no recourse.</p>

          <h2 style={styles.h2}>Informed Dilution vs. Imposed Dilution</h2>
          <div style={styles.highlight}>
            <div style={styles.highlightLabel}>Key distinction</div>
            <div style={styles.highlightText}>These are not the same thing. Imposed dilution happens to you. Informed dilution is a choice you make with full information, in a defined window, on your own terms.</div>
          </div>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>Imposed dilution:</strong> New supply enters circulation. You weren&apos;t asked. No early access. No window to maintain your share. It happened, and now you&apos;re holding a smaller percentage at a price the market is recalibrating in real time. No agency.</p>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>Informed dilution:</strong> The protocol surfaces a choice. You know a new cycle is opening. You know your allocation. You know the terms. You have a window. You decide. If you let your proportional share decrease, that&apos;s a portfolio decision — not something done to you.</p>
          <p style={styles.p}>The outcome can be identical — your percentage might decrease in both cases. But the experience, the agency, and the relationship between holder and project are entirely different. One is extraction. The other is participation.</p>
          <p style={styles.p}>The anger from early holders who&apos;ve been burned isn&apos;t just about the financial loss. It&apos;s about the feeling of having been acted upon — of taking real risk and then having your position restructured by people who didn&apos;t consult you and didn&apos;t have to.</p>

          <h2 style={styles.h2}>The Second Token Problem</h2>
          <p style={styles.p}>There&apos;s a version of this that&apos;s even harder to recover from.</p>
          <p style={styles.p}>You hold Token A. The team builds, grows, pivots. Then — sometimes with warning, sometimes not — they announce Token B. New token, new mechanics, new raise. Token A holders get a courtesy announcement and maybe a migration path. Structurally, they have nothing. No rights in the new token&apos;s issuance. No allocation. No window. Token A holders who took early risk on the project have zero claim on Token B&apos;s upside unless the team voluntarily decides to give them something.</p>
          <p style={styles.p}>Projects built inside the Mammoth framework have a different default. The rights mechanic is embedded in how subsequent cycles work. When a team raises again inside the same framework, holder protection is automatic. A team would have to actively work around the framework to impose dilution. Most teams won&apos;t.</p>
          <p style={styles.p}>Default matters. Systems shape behavior.</p>

          <h2 style={styles.h2}>What This Means for Founders and Holders Both</h2>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>If you&apos;re a founder:</strong> Your earliest holders are your most important signal. They showed up before the evidence. The way you treat them when you go back to raise more capital is one of the clearest things you can show the market about who you are. Building on a framework with mechanical rights protection isn&apos;t just the ethical choice — it&apos;s the strategic one. Holders who trust that subsequent raises won&apos;t crater their position hold longer, advocate harder, and stay in your corner.</p>
          <p style={styles.p}><strong style={{color:'#F0F4FF'}}>If you&apos;re a holder:</strong> Ask what happens when they raise again. Ask whether the framework supports rights-based mechanics or whether you&apos;re relying on a team promise. The answer tells you a lot about how the relationship will go when the team has new investors to answer to and you&apos;re no longer the person with the most leverage.</p>
          <p style={styles.p}>Projects built on Mammoth answer that question structurally. The rights window exists. The allocation runs before the public cycle opens. You have a choice. That&apos;s what mechanical protection looks like.</p>

          <div style={styles.cta}>
            <span style={styles.ctaText}>Cycle-based rights issuance. Structural anti-dilution by default.</span>
            <Link href="/" style={styles.ctaBtn}>Start building on Mammoth →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
