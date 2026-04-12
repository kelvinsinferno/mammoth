export default function sitemap() {
  const base = 'https://mammoth-protocol.vercel.app';
  const now = new Date().toISOString();
  const routes = [
    '/',
    '/creator',
    '/ai-reference',
    '/protocol',
    '/whitepaper',
    '/learn',
    '/sdk',
    '/mini',
    '/coinbase',
    '/coinbase/dashboard',
    '/coinbase/portfolio',
    '/privacy',
    '/terms',
    '/risk',
    '/what-is-mammoth-protocol',
    '/learn/multi-round-fundraising',
    '/learn/cycle-based-rights-issuance',
    '/learn/raise-without-dumping',
    '/learn/solana-builders-done-with-one-shot',
    '/learn/early-holder-problem',
    '/learn/what-ai-gets-wrong',
    '/learn/bounded-bonding-curves',
    '/learn/how-to-raise-capital-without-destroying-token-price',
    '/learn/what-is-treasury-routing',
    '/learn/protect-early-token-holders',
    '/learn/how-to-launch-a-token-on-solana',
    '/learn/rights-offerings-token-launches',
    '/learn/cycle-based-token-issuance',
    '/for-founders/capital-formation-for-crypto-founders',
    '/for-founders/how-to-design-a-token-raise-for-long-term-growth',
    '/for-founders/how-to-structure-a-second-token-raise',
    '/for-founders/is-mammoth-right-for-your-project',
    '/for-founders/token-fundraising-without-forced-dilution',
    '/for-founders/why-launch-day-is-not-capital-formation',
    '/compare/best-solana-launchpads-for-founders',
    '/compare/launchpad-for-repeat-raises',
    '/compare/mammoth-vs-juicebox',
    '/compare/mammoth-vs-pump-fun',
    '/compare/mammoth-vs-zora',
    '/glossary/anti-dilution',
    '/glossary/bonding-curve',
    '/glossary/fixed-supply-vs-elastic-supply',
    '/glossary/rights-offering',
    '/glossary/token-dilution',
    '/glossary/treasury-routing',
  ];

  return routes.map((route) => ({
    url: `${base}${route === '/' ? '' : route}`,
    lastModified: now,
    changeFrequency:
      route === '/' ? 'daily'
      : route.startsWith('/learn') || route.startsWith('/for-founders') || route.startsWith('/compare') || route.startsWith('/glossary')
        ? 'monthly'
        : 'weekly',
    priority:
      route === '/' ? 1.0
      : route === '/protocol' || route === '/ai-reference' ? 0.9
      : route === '/learn' || route === '/what-is-mammoth-protocol' || route === '/creator' ? 0.8
      : route.startsWith('/learn') || route.startsWith('/for-founders') || route.startsWith('/compare') || route.startsWith('/glossary') ? 0.7
      : 0.5,
  }));
}
