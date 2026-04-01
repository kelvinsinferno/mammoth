export default function sitemap() {
  const base = 'https://mammoth-protocol.vercel.app';
  const now = new Date().toISOString();

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/launch`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/creator`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/ai-reference`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/protocol`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/whitepaper`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/learn/multi-round-fundraising`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/learn/cycle-based-rights-issuance`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/learn/raise-without-dumping`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/learn/solana-builders-done-with-one-shot`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/learn/early-holder-problem`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/learn/what-ai-gets-wrong`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sdk`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/risk`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
