export const metadata = {
  title: 'Mini App',
  description: 'Mammoth Protocol Mini App for token pages shared across Telegram, Farcaster, and X. Mobile-friendly token discovery and buying flows.',
  alternates: {
    canonical: '/mini',
  },
  openGraph: {
    title: 'Mini App | Mammoth Protocol',
    description: 'Mammoth Protocol Mini App for token pages shared across Telegram, Farcaster, and X. Mobile-friendly token discovery and buying flows.',
    url: 'https://mammothprotocol.com/mini',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mini App | Mammoth Protocol',
    description: 'Mammoth Protocol Mini App for token pages shared across Telegram, Farcaster, and X. Mobile-friendly token discovery and buying flows.',
  },
};

export default function MiniLayout({ children }) {
  return children;
}
