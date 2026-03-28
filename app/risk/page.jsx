'use client';
import LegalPage from '../../components/LegalPage';

const SECTIONS = [
  { title: 'Total Loss of Funds', body: `Participation in token launches or any activity on Mammoth Protocol may result in the total and permanent loss of all funds involved. Cryptocurrency and token markets are highly volatile. There is no guarantee that any token will retain any value. Do not invest more than you can afford to lose entirely.` },
  { title: 'Smart Contract Risk', body: `Mammoth Protocol operates through smart contracts deployed on Solana. Smart contracts may contain bugs, errors, or vulnerabilities not apparent even after review. Such vulnerabilities could be exploited, resulting in partial or total loss of funds. No audit constitutes a guarantee of security. Past security does not guarantee future security.` },
  { title: 'Blockchain Network Risk', body: `The Solana blockchain may experience network outages or downtime, transaction congestion or delays, protocol upgrades or hard forks, and validator failures. Any of these could affect your ability to transact, exercise rights, or access your tokens. The Company has no control over the Solana network.` },
  { title: 'Transaction Irreversibility', body: `All transactions on Solana are irreversible once confirmed. This includes token purchases, rights exercises, cycle activations, and treasury distributions. There is no mechanism to cancel, reverse, or recover a confirmed transaction. Verify all parameters carefully before signing.` },
  { title: 'Scheduled Launch Time-Lock Risk', body: `When a creator deploys a token with a scheduled launch time, that time is encoded immutably in the smart contract. The launch will occur at the specified time regardless of market conditions or creator intent. Neither the creator nor the Company can delay, cancel, or modify a scheduled launch once signed. Creators should consider timing carefully before committing.` },
  { title: 'Rights Window Expiry', body: `Rights-based anti-dilution windows are time-limited. If you fail to exercise your rights within the designated window, those rights expire permanently. The Company has no ability to restore expired rights. Monitor active cycles and rights windows carefully.` },
  { title: 'Token Value Risk', body: `Tokens on Mammoth Protocol have no intrinsic value guaranteed by any person, entity, or asset. They are not backed by any government or reserve. They may trade at any price including zero. Bonding curve projections displayed on the Platform are mathematical models, not guarantees or predictions of future price.` },
  { title: 'Liquidity Risk', body: `Tokens created on Mammoth Protocol may have limited or no secondary market liquidity. You may be unable to sell your tokens at any price, particularly between cycles or for newly launched tokens. The existence of a Jupiter deeplink does not guarantee liquidity or a market.` },
  { title: 'Regulatory Risk', body: `The regulatory environment for cryptocurrency is rapidly evolving. Regulatory action could classify tokens as securities or other regulated instruments, restrict your ability to hold or trade tokens, result in enforcement actions or asset freezes, or require the Platform to cease operations in certain jurisdictions.\n\nThe Company makes no representation as to the regulatory status of any token. You are responsible for your own regulatory compliance.` },
  { title: 'Creator Risk', body: `Tokens are created by independent third parties. The Company does not vet, endorse, or verify creators or their projects. The Company has no guarantee that creators will open future cycles, continue development, or fulfill stated goals. Creators may abandon projects or act in bad faith with no recourse against the Company.` },
  { title: 'Treasury Distribution Risk', body: `Treasury routing parameters are set by creators at cycle creation and are immutable. The Company has no control over creator treasury configurations. There is no escrow, lock-up, or vesting requirement on creator treasury distributions. Creators may receive their allocation immediately upon cycle close.` },
  { title: 'Cybersecurity Risk', body: `The Platform may be targeted by hackers, phishing attacks, or other malicious actors. You are responsible for securing your own wallet credentials and private keys. The Company will NEVER ask for your seed phrase or private keys. Treat any request for this information as a scam.` },
  { title: 'No Insurance', body: `Cryptocurrency assets are not covered by any government deposit insurance scheme such as FDIC or SIPC, nor by any private insurance provided by the Company.` },
  { title: 'Experimental Technology', body: `Mammoth Protocol is built on experimental technology. The Solana blockchain, SPL token standard, and Mammoth smart contracts are relatively new and may behave in unexpected ways. The Platform is currently operating on Solana Devnet (test network) and will transition to Mainnet. Behavior on Mainnet may differ.` },
  { title: 'Tax Risk', body: `Cryptocurrency transactions may be taxable events in your jurisdiction. Buying, selling, or receiving tokens may trigger capital gains, income, or other tax obligations. The Company does not provide tax advice. You are solely responsible for determining and meeting your own tax obligations.` },
];

export default function RiskPage() {
  return (
    <LegalPage
      title="Risk Disclosure"
      subtitle="Last Updated: March 28, 2026 · Draft — Subject to Attorney Review"
      icon="⚠️"
      warning="PLEASE READ THIS DISCLOSURE CAREFULLY. CRYPTOCURRENCY ACTIVITIES INVOLVE SIGNIFICANT RISK INCLUDING TOTAL LOSS OF FUNDS. BY USING THE PLATFORM YOU ACCEPT ALL RISKS DESCRIBED HEREIN."
      sections={SECTIONS}
    />
  );
}
