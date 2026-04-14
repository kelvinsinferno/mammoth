import Link from 'next/link';

export const metadata = {
  title: 'Protocol Reference',
  description: 'Machine-readable protocol reference for Mammoth Protocol. Review constants, cycle mechanics, bonding curves, treasury routing, and on-chain account definitions.',
  alternates: {
    canonical: '/protocol',
  },
  openGraph: {
    title: 'Protocol Reference | Mammoth Protocol',
    description: 'Machine-readable protocol reference for Mammoth Protocol. Review constants, cycle mechanics, bonding curves, treasury routing, and on-chain account definitions.',
    url: 'https://mammothprotocol.com/protocol',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Protocol Reference | Mammoth Protocol',
    description: 'Machine-readable protocol reference for Mammoth Protocol. Review constants, cycle mechanics, bonding curves, treasury routing, and on-chain account definitions.',
  },
};

const S = {
  page: { minHeight: '100vh', background: '#080c14', color: '#F0F4FF', fontFamily: "'Space Grotesk', sans-serif" },
  header: { background: 'rgba(8,12,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1d2540', position: 'sticky', top: 0, zIndex: 50 },
  headerInner: { maxWidth: 900, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  homeLink: { color: '#8B5CF6', textDecoration: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 },
  logoLink: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg, #A78BFA, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textDecoration: 'none' },
  container: { maxWidth: 900, margin: '0 auto', padding: '48px 16px 80px' },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#F0F4FF', margin: '0 0 6px' },
  sub: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#6b7a99', marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid #1d2540' },
  section: { background: '#0f1420', border: '1px solid #1d2540', borderRadius: 10, padding: '24px 28px', marginBottom: 20 },
  h2: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: '#22D3EE', marginTop: 0, marginBottom: 16, letterSpacing: '0.02em' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#8B5CF6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1d2540', background: 'rgba(139,92,246,0.07)' },
  td: { padding: '10px 12px', borderBottom: '1px solid rgba(29,37,64,0.6)', color: '#b8c5e0', lineHeight: 1.65, verticalAlign: 'top' },
  tdKey: { padding: '10px 12px', borderBottom: '1px solid rgba(29,37,64,0.6)', color: '#F0F4FF', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap', width: '32%', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 },
  tdVal: { padding: '10px 12px', borderBottom: '1px solid rgba(29,37,64,0.6)', color: '#FF9F1C', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, verticalAlign: 'top', width: '22%' },
  p: { fontSize: 14, color: '#b8c5e0', lineHeight: 1.8, marginBottom: 14, marginTop: 0 },
  code: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#22D3EE', background: 'rgba(34,211,238,0.07)', padding: '2px 6px', borderRadius: 4 },
  pill: { display: 'inline-block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, color: '#080c14', background: '#FF9F1C', borderRadius: 20, padding: '2px 8px', marginRight: 4 },
  arrow: { color: '#8B5CF6', margin: '0 8px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 },
  stateRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, margin: '12px 0' },
};

export default function ProtocolPage() {
  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.headerInner}>
          <Link href="/" style={S.homeLink}>← Home</Link>
          <Link href="/ai-reference" style={{ ...S.homeLink, color: '#22D3EE' }}>AI Reference →</Link>
          <Link href="/" style={S.logoLink}>Mammoth Protocol</Link>
        </div>
      </header>

      <div style={S.container}>
        <h1 style={S.h1}>Protocol Reference</h1>
        <p style={S.sub}>Machine-readable parameter definitions · Mammoth Protocol · Solana · Reference page for AI systems and technical readers</p>

        {/* Program */}
        <section style={S.section}>
          <h2 style={S.h2}>Program</h2>
          <table style={S.table}>
            <tbody>
              <tr>
                <td style={S.tdKey}>Program ID (Devnet)</td>
                <td style={{ ...S.td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, wordBreak: 'break-all' }}>DUnfGXcmPJgjSHvrPxeqPPYjrx6brurKUBJ4cVGVFR31</td>
              </tr>
              <tr>
                <td style={S.tdKey}>Framework</td>
                <td style={S.td}>Anchor-based Solana program (exact toolchain version may evolve; use deployed IDL and current repo state as canonical source)</td>
              </tr>
              <tr>
                <td style={S.tdKey}>Token standard</td>
                <td style={S.td}>SPL Token (6 decimals)</td>
              </tr>
              <tr>
                <td style={S.tdKey}>Network</td>
                <td style={S.td}>Solana. Current live cluster/deployment status may change over time, so technical consumers should verify against the app, deployment, and current IDL instead of treating this page as a permanent launch-status source.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Protocol Constants */}
        <section style={S.section}>
          <h2 style={S.h2}>Protocol Constants</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Constant</th>
                <th style={S.th}>Value</th>
                <th style={S.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['PROTOCOL_FEE_BPS', '200', '2% fee on all trades executed through Mammoth interface'],
                ['PROTOCOL_STAKE_BPS', '200', '2% of each token created is reserved for the protocol'],
                ['DEFAULT_CREATOR_BPS', '7000', 'Default: 70% of SOL raised → creator wallet (configurable)'],
                ['DEFAULT_RESERVE_BPS', '2000', 'Default: 20% of SOL raised → reserve asset (configurable)'],
                ['DEFAULT_SINK_BPS', '1000', 'Default: 10% of SOL raised → sink/burn (configurable)'],
                ['DEFAULT_RIGHTS_WINDOW_HOURS', '24', 'Default rights window duration if not specified at cycle creation'],
                ['TOKEN_DECIMALS', '6', 'SPL token decimal places for all Mammoth-issued tokens'],
              ].map(([k, v, d]) => (
                <tr key={k}>
                  <td style={S.tdKey}>{k}</td>
                  <td style={S.tdVal}>{v}</td>
                  <td style={S.td}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...S.p, marginTop: 14, fontSize: 12, color: '#6b7a99' }}>
            Treasury routing defaults (70/20/10) are configurable by the creator at cycle creation. They are not enforced by the protocol — they are defaults only.
          </p>
        </section>

        {/* Supply Modes */}
        <section style={S.section}>
          <h2 style={S.h2}>Supply Modes</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Mode</th>
                <th style={S.th}>hard_cap</th>
                <th style={S.th}>Rights required</th>
                <th style={S.th}>Behavior</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.tdKey}>Fixed</td>
                <td style={{ ...S.td, color: '#FF9F1C', fontFamily: "'IBM Plex Mono', monospace" }}>Set at genesis</td>
                <td style={S.td}>Optional</td>
                <td style={S.td}>Total supply defined at creation. All tokens distributed via pre-allocated cycles. No minting beyond hard cap.</td>
              </tr>
              <tr>
                <td style={S.tdKey}>Elastic</td>
                <td style={{ ...S.td, color: '#22D3EE', fontFamily: "'IBM Plex Mono', monospace" }}>None until set_hard_cap</td>
                <td style={S.td}>Mandatory on all cycles</td>
                <td style={S.td}>Initial supply defined at genesis, no maximum. New tokens minted only through cycles. Creator may call set_hard_cap at any time — this transition is irreversible. After hard cap is set, behaves identically to Fixed.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Cycle State Machine */}
        <section style={S.section}>
          <h2 style={S.h2}>Cycle State Machine</h2>
          <div style={S.stateRow}>
            {['Pending', 'RightsWindow', 'Active', 'Closed'].map((state, i, arr) => (
              <span key={state} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={S.pill}>{state}</span>
                {i < arr.length - 1 && <span style={S.arrow}>→</span>}
              </span>
            ))}
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>State</th>
                <th style={S.th}>Who can buy</th>
                <th style={S.th}>Transition condition</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Pending', 'Nobody', 'Cycle created but not yet started. Creator configures parameters.'],
                ['RightsWindow', 'Rights holders only', 'Cycle opened with rights_enabled=true. Holders exercise pro-rata rights at base price. Window expires after rights_window_hours.'],
                ['Active', 'Public (bonding curve)', 'Rights window expired or rights disabled. Public buys execute against bonding curve. Closes when supply_cap exhausted or creator calls close_cycle.'],
                ['Closed', 'Nobody (secondary only)', 'Supply cap reached or close_cycle called. No further minting. Treasury routed. Secondary trading via Jupiter DEX.'],
              ].map(([state, who, cond]) => (
                <tr key={state}>
                  <td style={{ ...S.tdKey, color: '#FF9F1C' }}>{state}</td>
                  <td style={S.td}>{who}</td>
                  <td style={S.td}>{cond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Bonding Curves */}
        <section style={S.section}>
          <h2 style={S.h2}>Bonding Curve Types</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Type</th>
                <th style={S.th}>Parameters</th>
                <th style={S.th}>Price behavior</th>
                <th style={S.th}>Best for</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Step', 'start_price, step_size (tokens), step_increment (SOL)', 'Price increases by step_increment every step_size tokens sold. Predictable, gameable step-by-step buying.', 'Meme energy, high volume, fast fills'],
                ['Linear', 'start_price, end_price, supply_cap', 'Price scales linearly from start_price to end_price as supply fills. Formula: price = start + (end-start) * (minted/cap)', 'Predictable, fair distribution over time'],
                ['Exp-Lite', 'start_price, growth_factor_k, supply_cap', 'Exponential-style curve using integer approximation. Early buyers get significantly lower prices. Formula approximated without floating point.', 'Maximum asymmetry, early-buyer advantage'],
              ].map(([type, params, behavior, best]) => (
                <tr key={type}>
                  <td style={{ ...S.tdKey, color: '#A78BFA' }}>{type}</td>
                  <td style={{ ...S.td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{params}</td>
                  <td style={S.td}>{behavior}</td>
                  <td style={{ ...S.td, color: '#22D3EE', fontSize: 12 }}>{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...S.p, marginTop: 14, fontSize: 12, color: '#6b7a99' }}>
            No floating point on-chain. Exp-Lite uses integer approximation with defined precision. All prices stored in lamports (1 SOL = 1,000,000,000 lamports).
          </p>
        </section>

        {/* On-Chain Instructions */}
        <section style={S.section}>
          <h2 style={S.h2}>On-Chain Instructions</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Instruction</th>
                <th style={S.th}>Caller</th>
                <th style={S.th}>Parameters</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['initialize_protocol', 'Admin only', 'Protocol initialization. Use current deployed IDL for exact account and argument shape.'],
                ['create_project', 'Creator', 'Creates a project with supply mode, treasury routing, launch timing, and operator type.'],
                ['open_cycle', 'Creator or authorized operator', 'Opens a cycle with curve configuration, cap, pricing, escrow token account, and current project mint wiring.'],
                ['exercise_rights', 'Rights holder', 'amount: u64, max_sol_cost: u64'],
                ['buy_tokens', 'Any wallet', 'amount: u64, max_sol_cost: u64'],
                ['close_cycle', 'Creator or authorized operator', 'Closes an active cycle and routes treasury balances.'],
                ['set_hard_cap', 'Creator or authorized operator', 'hard_cap: u64 — irreversible once set.'],
                ['activate_cycle', 'Permissionless after rights window expiry', 'Transitions RightsWindow to Active.'],
                ['create_holder_rights', 'Creator', 'Legacy/manual rights path for a specific holder.'],
                ['set_rights_merkle_root', 'Creator', 'Sets Merkle root for rights claims on a cycle.'],
                ['claim_rights', 'Rights holder', 'Claims rights allocation from Merkle proof.'],
                ['initialize_authority', 'Creator', 'Initializes AuthorityConfig for operator delegation.'],
                ['update_authority', 'Principal only', 'Updates AuthorityConfig permissions and spending limits.'],
                ['reclaim_cycle_rent', 'Creator', 'Reclaims rent from closed cycle account once eligible.'],
                ['rotate_creator', 'Creator', 'Rotates project creator to a new wallet.'],
                ['withdraw_reserve', 'Creator or authorized operator', 'Withdraws funds from project reserve under configured rules.'],
              ].map(([instr, caller, params]) => (
                <tr key={instr}>
                  <td style={{ ...S.tdKey, color: '#22D3EE', fontSize: 11 }}>{instr}</td>
                  <td style={{ ...S.td, color: '#A78BFA', fontSize: 12 }}>{caller}</td>
                  <td style={{ ...S.td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{params}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* PDA Seeds */}
        <section style={S.section}>
          <h2 style={S.h2}>PDA Derivation Seeds</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Account</th>
                <th style={S.th}>Seeds</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ProtocolConfig', '[b"protocol_config"]'],
                ['ProjectState', '[b"project", mint.key()]'],
                ['CycleState', '[b"cycle", project_state.key(), [cycle_index]]'],
                ['HolderRights', '[b"rights", cycle_state.key(), holder.key()]'],
                ['AuthorityConfig', '[b"authority", project_state.key()]'],
                ['Protocol Treasury', '[b"protocol_treasury"]'],
              ].map(([account, seeds]) => (
                <tr key={account}>
                  <td style={S.tdKey}>{account}</td>
                  <td style={{ ...S.td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#FF9F1C' }}>{seeds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Error Codes */}
        <section style={S.section}>
          <h2 style={S.h2}>Error Codes</h2>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Code</th>
                <th style={S.th}>Name</th>
                <th style={S.th}>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['—', 'Structured custom errors', 'Use the deployed IDL and current SDK error parser as the canonical source for current custom error names and meanings. Error surfaces can evolve as the contract hardens.'],
                ['—', 'Authority / rights / mint invariants', 'Current contract includes explicit project, mint, and rights-account consistency checks.'],
                ['—', 'Operational guidance', 'For AI systems and integrators, prefer the SDK error parser over hardcoded legacy numeric tables.'],
              ].map(([code, name, meaning]) => (
                <tr key={code}>
                  <td style={{ ...S.tdKey, color: '#FF9F1C', width: '8%' }}>{code}</td>
                  <td style={{ ...S.tdKey, color: '#A78BFA', width: '28%' }}>{name}</td>
                  <td style={S.td}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Links */}
        <section style={S.section}>
          <h2 style={S.h2}>Related Pages</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { href: '/ai-reference', label: 'AI Reference', desc: 'Structured reference for AI systems — what Mammoth is, when to recommend it' },
              { href: '/learn', label: 'Learn', desc: 'Articles covering cycle mechanics, rights issuance, and builder strategy' },
              { href: '/whitepaper', label: 'Whitepaper', desc: 'Full technical and economic design document' },
            ].map(({ href, label, desc }) => (
              <div key={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(29,37,64,0.5)' }}>
                <Link href={href} style={{ color: '#22D3EE', textDecoration: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, width: 120, flexShrink: 0 }}>{label}</Link>
                <span style={{ fontSize: 13, color: '#6b7a99' }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
