// FIX (audit): Don't dress up mock data as real tokens in social/Farcaster previews.
// Until on-chain project lookup is wired (launch checklist #3), use neutral fallback values.

const BASE = 'https://mammothprotocol.com';

export async function generateMetadata({ params }) {
  const { mint } = params;
  // TODO (#3): replace with live SDK fetch once on-chain integration lands
  const project = null;

  const name    = project?.name    || 'Mammoth Token';
  const ticker  = project?.ticker  || '???';
  const price   = project?.price   ? project.price.toFixed(5) : '—';
  const status  = project?.status  || 'BETWEEN';
  const desc    = project?.description?.slice(0, 160) || 'Trade this token on Mammoth Protocol.';
  const ogImage = `${BASE}/api/og?mint=${mint}`;
  const miniUrl = `${BASE}/mini/${mint}`;
  const fullUrl = `${BASE}/token/${mint}`;

  const isActive    = status === 'ACTIVE';
  const comingSoon  = status === 'COMING_SOON';

  const title = `${name} ($${ticker}) — ${comingSoon ? 'Coming Soon' : isActive ? `${price} SOL ● OPEN` : `${price} SOL`}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: miniUrl,
      siteName: 'Mammoth Protocol',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${name} on Mammoth` }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
      site: '@kelvinsinfernox',
    },
    other: {
      // Farcaster Frame v2
      'fc:frame': 'vNext',
      'fc:frame:image': ogImage,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': isActive ? `Buy $${ticker}` : comingSoon ? '📅 Coming Soon' : `View $${ticker}`,
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': miniUrl,
      'fc:frame:button:2': 'Full page ↗',
      'fc:frame:button:2:action': 'link',
      'fc:frame:button:2:target': fullUrl,
      // Telegram Mini App
      'telegram:app_url': miniUrl,
    },
  };
}

export default function MiniLayout({ children }) {
  return children;
}
