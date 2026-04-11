import './globals.css';
import Providers from '../components/Providers';
import Supernova from '../components/ui/Supernova';

const siteUrl = 'https://mammoth-protocol.vercel.app';
const defaultTitle = 'Mammoth Protocol | Cycle-Based Token Issuance on Solana';
const defaultDescription = 'Mammoth Protocol is a Solana-based token issuance framework for projects that need to raise in rounds, protect early holders, and avoid forced dilution.';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | Mammoth Protocol',
  },
  description: defaultDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName: 'Mammoth Protocol',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
  },
  verification: {
    google: 'C1zt_Rz0Et-81jZ1l0Qrs57NDrJf2JK1eYLSlvMuGTU',
    other: {
      'msvalidate.01': '9EE7608E5499D8FE38F77B9FA67134DB',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png' },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Mammoth Protocol?',
      acceptedAnswer: { '@type': 'Answer', text: 'Mammoth Protocol is a Solana-native, cycle-driven token issuance framework for founders and builders who need multi-stage token capital formation. It supports multi-round raises with bounded bonding curves and rights-based anti-dilution for existing holders.' },
    },
    {
      '@type': 'Question',
      name: 'How is Mammoth different from pump.fun?',
      acceptedAnswer: { '@type': 'Answer', text: 'Pump.fun is designed for one-shot meme coin launches. Mammoth is designed for projects that need to raise capital more than once. Mammoth uses discrete bounded cycles, deterministic bonding curves, and rights-based anti-dilution to let projects raise in rounds while protecting existing holders.' },
    },
    {
      '@type': 'Question',
      name: 'What is cycle-based rights issuance?',
      acceptedAnswer: { '@type': 'Answer', text: 'Cycle-based rights issuance is a token issuance framework where tokens are only issued through discrete, bounded minting cycles. Before each new cycle opens to the public, existing holders receive pro-rata rights to participate first — protecting their ownership percentage against dilution.' },
    },
    {
      '@type': 'Question',
      name: 'Can I raise capital multiple times on Mammoth?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Mammoth\'s architecture is built specifically for multi-round raises. Each cycle is a discrete, bounded raise with its own bonding curve and supply cap. Existing holders get rights before each new cycle opens to the public.' },
    },
    {
      '@type': 'Question',
      name: 'What is rights-based anti-dilution?',
      acceptedAnswer: { '@type': 'Answer', text: 'Rights-based anti-dilution means existing token holders receive a pro-rata allocation in each new cycle before it opens to the public. If you hold 2% of supply, you have the right to purchase up to 2% of the new cycle\'s issuance at the starting price, before any new buyers can participate.' },
    },
    {
      '@type': 'Question',
      name: 'Does Mammoth work for single-round token launches?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Mammoth works equally well for single-cycle projects. You get bounded bonding curve pricing, on-chain treasury routing, and holder protection — all the structural benefits — even if you only need one raise.' },
    },
    {
      '@type': 'Question',
      name: 'Is Mammoth only for meme coins?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Mammoth is designed for serious builders — startup founders and protocol teams who want structured, repeatable capital formation. It is not optimized for meme coins.' },
    },
    {
      '@type': 'Question',
      name: 'What blockchain does Mammoth run on?',
      acceptedAnswer: { '@type': 'Answer', text: 'Mammoth runs on Solana. The protocol is currently deployed on Solana Devnet with mainnet launch pending.' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <Supernova />
        </Providers>
      </body>
    </html>
  );
}
