'use client';
import LegalPage from '../../components/LegalPage';

const SECTIONS = [
  { title: 'Information We Do Not Collect', body: `Mammoth Protocol is designed to minimize data collection. We do not collect your name, email address, or other personally identifiable information unless voluntarily provided. We never have access to your private keys, seed phrases, or wallet credentials. We do not collect payment card or bank account information, and we do not perform KYC at this time.` },
  { title: 'Information Collected Automatically', body: `When you access the Platform, the following may be collected automatically:\n\n• Wallet Address: Your public blockchain address when you connect to the Platform. This is a public identifier visible on the blockchain.\n\n• On-Chain Activity: Any transactions you conduct are permanently recorded on the Solana blockchain and are publicly visible. The Company does not control this and cannot delete it.\n\n• Usage Data: Standard web server logs including IP address, browser type, pages visited, and timestamps. Used to maintain and improve the Platform, not sold to third parties.\n\n• Browser Storage: We use localStorage to store preferences such as theme settings and draft token configurations. This data stays on your device and is not transmitted to our servers.` },
  { title: 'How We Use Information', body: `We use information to operate and maintain the Platform, monitor for security threats or abuse, improve Platform functionality and user experience, and comply with applicable legal obligations.\n\nWe do not sell, rent, or trade your information to third parties for marketing or advertising purposes.` },
  { title: 'Blockchain Data', body: `All transactions on the Solana blockchain are permanently public. This includes token purchases, wallet balances, and all on-chain activity. The Company has no ability to modify or delete blockchain records. Before transacting, consider that your wallet address and activity will be permanently publicly visible.` },
  { title: 'Third-Party Services', body: `The Platform integrates with third-party services including Solana RPC providers, Jupiter Protocol for secondary market navigation, Vercel for hosting, and Groq for AI chat functionality when enabled. Each operates under its own privacy policy. The Company is not responsible for third-party privacy practices.` },
  { title: 'Data Retention', body: `Usage logs are retained for up to 90 days for security and operational purposes. Browser-stored preferences remain on your device until you clear browser data. On-chain data is permanent and beyond our control.` },
  { title: "Children's Privacy", body: `The Platform is not directed at individuals under the age of 18. We do not knowingly collect information from anyone under 18.` },
  { title: 'Security', body: `We implement reasonable technical and organizational measures to protect information we handle. However, no system is completely secure. We cannot guarantee the absolute security of data transmitted to the Platform.` },
  { title: 'Changes to This Policy', body: `We may update this Privacy Policy from time to time. Changes will be posted on the Platform with a revised "Last Updated" date. Continued use of the Platform after changes constitutes your acceptance.` },
  { title: 'Contact', body: `For privacy-related inquiries:\nKelvinsinferno Studio LLC\nprivacy@mammoth-protocol.io` },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="Last Updated: March 28, 2026 · Draft — Subject to Attorney Review"
      icon="🔒"
      sections={SECTIONS}
    />
  );
}
