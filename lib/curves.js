export function computeStepCurve({ solIn, sold, allocation, startPrice, stepSize, stepIncrement, feeBps = 200 }) {
  const fee = solIn * (feeBps / 10000);
  let budget = solIn - fee;
  let tokensSold = sold;
  let tokensOut = 0;
  const steps = [];

  while (budget > 0 && tokensSold < allocation) {
    const stepIndex = Math.floor(tokensSold / stepSize);
    const priceNow = startPrice + stepIndex * stepIncrement;
    const tokensThisStep = Math.min(stepSize - (tokensSold % stepSize), allocation - tokensSold);
    const costForStep = tokensThisStep * priceNow;

    if (budget >= costForStep) {
      budget -= costForStep;
      tokensSold += tokensThisStep;
      tokensOut += tokensThisStep;
      steps.push({ price: priceNow, tokens: tokensThisStep });
    } else {
      const partial = Math.floor(budget / priceNow);
      tokensOut += partial;
      tokensSold += partial;
      budget -= partial * priceNow;
      steps.push({ price: priceNow, tokens: partial });
      break;
    }
  }

  const stepsCrossed = new Set(steps.map(s => s.price)).size - 1;
  const effectivePrice = tokensOut > 0 ? (solIn - fee) / tokensOut : startPrice;
  const newPrice = startPrice + Math.floor(tokensSold / stepSize) * stepIncrement;
  const nextStepIn = stepSize - (tokensSold % stepSize);
  const remainingAfter = allocation - tokensSold;

  return { tokensOut, fee, effectivePrice, newPrice, nextStepIn, stepsCrossed, remainingAfter, soldAfter: tokensSold };
}

export async function mockExecuteBuy({ solIn, tokensOut, ticker }) {
  await new Promise(r => setTimeout(r, 900));
  await new Promise(r => setTimeout(r, 700));
  if (Math.random() < 0.15) throw new Error('Transaction rejected by network');
  const sig = Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 6)).join('');
  return { signature: sig, solIn, tokensOut, ticker, ts: Date.now() };
}

export async function mockDeployToken(form) {
  await new Promise(r => setTimeout(r, 900));
  await new Promise(r => setTimeout(r, 600));
  if (Math.random() < 0.12) throw new Error('Rejected');
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const mint = Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return { ...form, mint, createdAt: new Date().toISOString() };
}
