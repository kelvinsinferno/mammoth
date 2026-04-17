import { genSparkline } from './data';

// ─── Off-chain project metadata overrides ────────────────────────────────────
// The on-chain program stores tokenomics only. Editable off-chain fields
// (name, description, links, image, reveal date) are persisted per-mint in
// localStorage so edits survive page reloads and on-chain reloads.
const META_KEY = 'mammoth_project_meta';
const META_FIELDS = [
  'name', 'ticker', 'description', 'image', 'imagePreview',
  'website', 'twitter', 'telegram', 'discord', 'github', 'farcaster', 'youtube', 'docs',
  'goPublicAt', 'status',
];

export function loadProjectMeta(mint) {
  if (typeof window === 'undefined' || !mint) return null;
  try {
    const all = JSON.parse(localStorage.getItem(META_KEY) || '{}');
    return all[mint] || null;
  } catch { return null; }
}

export function saveProjectMeta(mint, meta) {
  if (typeof window === 'undefined' || !mint) return;
  try {
    const all = JSON.parse(localStorage.getItem(META_KEY) || '{}');
    const current = all[mint] || {};
    const picked = {};
    for (const k of META_FIELDS) {
      if (meta[k] !== undefined) picked[k] = meta[k];
    }
    all[mint] = { ...current, ...picked };
    localStorage.setItem(META_KEY, JSON.stringify(all));
  } catch {}
}

export function applyProjectMeta(project) {
  if (!project) return project;
  const override = loadProjectMeta(project.mint || project.id);
  return override ? { ...project, ...override } : project;
}

export function fmtSOL(n)    { return n.toFixed(3) + ' SOL'; }
export function fmtTokens(n) { return n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1_000 ? (n/1_000).toFixed(0)+'K' : n.toLocaleString(); }
export function fmtTime(ts)  {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

export function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 4) + '...' + addr.slice(-4);
}

export function mockAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function deriveProjectCard(proj) {
  const cd = proj.cycleData;
  const hasCycle = cd && cd.status === 'ACTIVE';
  const sold = cd ? cd.sold : 0;
  const alloc = cd ? cd.allocation : 1;
  const progress = Math.round(sold / alloc * 100);
  const totalRaisedSOL = (proj.cycleHistory || []).reduce((a, c) => a + (parseFloat(c.raised) || 0), 0);
  return {
    ...proj,
    status: hasCycle ? 'ACTIVE' : 'BETWEEN',
    progress,
    price: cd ? cd.currentPrice : proj.price,
    raised: totalRaisedSOL.toFixed(0) + ' SOL',
    cycle: proj.cycleHistory ? proj.cycleHistory.length : 0,
    sparkline: proj.sparkline || genSparkline(hasCycle ? 'up' : 'down'),
  };
}

export function buildNewProject(form, deployResult, walletShort) {
  const total = form.totalSupply || 1_000_000_000;
  const publicAlloc = Math.floor(total * form.publicPct / 100);
  const treasuryAlloc = Math.floor(total * (100 - 2 - form.publicPct) / 100);
  const id = String(Date.now());
  const genChart = () => {
    const pts = [], now = Date.now();
    let v = 0.00100;
    for (let i = 24; i >= 0; i--) {
      v = Math.max(0.00050, Math.min(0.00300, v + (Math.random() - 0.5) * 0.0001));
      pts.push({ t: now - i * 3_600_000, p: v });
    }
    return pts;
  };
  return {
    id, name: form.name, ticker: form.ticker, description: form.description,
    supplyMode: form.supplyMode === 'elastic' ? 'Elastic' : 'Fixed',
    totalSupply: total, publicAlloc, treasuryAlloc,
    hardCap: form.supplyMode === 'fixed',
    creator: walletShort || 'You',
    createdAt: new Date().toISOString().slice(0, 10),
    price: 0.00100, change: 0, volume: 0,
    status: 'BETWEEN', progress: 0, cycle: 0, raised: '0 SOL',
    sparkline: genSparkline('up'),
    cycleData: null, cycleHistory: [],
    chartData: genChart(),
    _mine: true,
    mint: deployResult.mint,
    image: form.image || null,
  };
}

export function applyProjectCycles(proj, cycles) {
  const open = cycles.find(c => c.status === 'open');
  const history = cycles
    .filter(c => c.status === 'completed' || c.status === 'terminated')
    .map(c => ({
      id: c.id, allocation: c.allocation, sold: c.sold,
      status: c.status === 'completed' ? 'COMPLETED' : 'TERMINATED',
      raised: c.raised.toFixed(2) + ' SOL',
      priceRange: `${c.startPrice.toFixed(4)}–${(c.startPrice + Math.ceil(c.sold / c.stepSize) * c.stepInc).toFixed(4)}`,
    }));

  const cycleData = open ? {
    id: open.id, status: 'ACTIVE',
    allocation: open.allocation, sold: open.sold,
    curveType: open.curve === 'step' ? 'Step' : open.curve === 'linear' ? 'Linear' : 'Exp-Lite',
    currentPrice: open.startPrice + Math.floor(open.sold / open.stepSize) * open.stepInc,
    nextStepIn: open.stepSize - (open.sold % open.stepSize),
    nextStepPrice: open.startPrice + (Math.floor(open.sold / open.stepSize) + 1) * open.stepInc,
    stepSize: open.stepSize, stepIncrement: open.stepInc,
    userRights: Math.floor(open.allocation * 0.05), userRightsUsed: 0,
    treasuryRouting: { creator: 70, reserve: 20, sink: 10 },
  } : (proj.cycleData ? { ...proj.cycleData, status: 'ENDED' } : null);

  const price = open
    ? open.startPrice + Math.floor(open.sold / open.stepSize) * open.stepInc
    : proj.price;

  const totalRaised = cycles.filter(c => c.status !== 'draft').reduce((a, c) => a + c.raised, 0);

  return {
    ...proj, cycleData,
    cycleHistory: [...history, ...(open ? [{
      id: open.id, allocation: open.allocation, sold: open.sold,
      status: 'ACTIVE', raised: open.raised.toFixed(2) + ' SOL',
      priceRange: `${open.startPrice.toFixed(4)}–now`,
    }] : [])],
    price,
    status: open ? 'ACTIVE' : 'BETWEEN',
    progress: open ? Math.round(open.sold / open.allocation * 100) : 100,
    cycle: cycles.filter(c => c.status !== 'draft').length,
    raised: totalRaised.toFixed(0) + ' SOL',
    chartData: [...proj.chartData, { t: Date.now(), p: price }].slice(-200),
  };
}
