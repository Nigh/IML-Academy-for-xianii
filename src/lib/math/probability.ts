import { finite } from './vector.ts';
export type Distribution =
  | { kind: 'bernoulli'; p: number }
  | { kind: 'binomial'; n: number; p: number }
  | { kind: 'uniform'; a: number; b: number }
  | { kind: 'normal'; mu: number; sigma: number };
export function validate(d: Distribution) {
  if (d.kind === 'normal') {
    finite(d.mu, d.sigma);
    if (d.sigma <= 0) throw new RangeError('σ 必须大于 0');
  } else if (d.kind === 'uniform') {
    finite(d.a, d.b);
    if (d.a >= d.b || !Number.isFinite(d.b - d.a)) throw new RangeError('需要 a < b');
  } else {
    finite(d.p);
    if (d.p < 0 || d.p > 1) throw new RangeError('p 需在 [0,1]');
    if (d.kind === 'binomial' && (!Number.isInteger(d.n) || d.n < 0 || d.n > 1000))
      throw new RangeError('n 需为 0–1000 的整数');
  }
}
export function seeded(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295)
    throw new RangeError('seed 需为 uint32');
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function binomialPMF(k: number, n: number, p: number) {
  validate({ kind: 'binomial', n, p });
  finite(k);
  if (!Number.isInteger(k) || k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  let log = 0;
  for (let i = 1; i <= k; i++) log += Math.log((n - i + 1) / i);
  return Math.exp(log + k * Math.log(p) + (n - k) * Math.log1p(-p));
}
// Abramowitz–Stegun 7.1.26 erf approximation; CDF absolute error < 8e-8.
export function normalCDF(x: number, mu = 0, sigma = 1) {
  validate({ kind: 'normal', mu, sigma });
  finite(x);
  const z = (x - mu) / sigma / Math.SQRT2,
    t = 1 / (1 + 0.3275911 * Math.abs(z));
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  return (1 + (z < 0 ? -erf : erf)) / 2;
}
export function density(d: Distribution, x: number) {
  validate(d);
  finite(x);
  switch (d.kind) {
    case 'normal':
      return Math.exp(-0.5 * ((x - d.mu) / d.sigma) ** 2) / (d.sigma * Math.sqrt(2 * Math.PI));
    case 'uniform':
      return x >= d.a && x <= d.b ? 1 / (d.b - d.a) : 0;
    case 'bernoulli':
      return x === 0 ? 1 - d.p : x === 1 ? d.p : 0;
    case 'binomial':
      return binomialPMF(x, d.n, d.p);
  }
}
export function cdf(d: Distribution, x: number) {
  validate(d);
  finite(x);
  switch (d.kind) {
    case 'normal':
      return normalCDF(x, d.mu, d.sigma);
    case 'uniform':
      return Math.max(0, Math.min(1, (x - d.a) / (d.b - d.a)));
    case 'bernoulli':
      return x < 0 ? 0 : x < 1 ? 1 - d.p : 1;
    case 'binomial': {
      let s = 0;
      for (let k = 0; k <= Math.min(d.n, Math.floor(x)); k++) s += binomialPMF(k, d.n, d.p);
      return Math.min(1, s);
    }
  }
}
export function moments(d: Distribution) {
  validate(d);
  switch (d.kind) {
    case 'normal':
      return { mean: d.mu, variance: d.sigma ** 2 };
    case 'uniform':
      return { mean: (d.a + d.b) / 2, variance: (d.b - d.a) ** 2 / 12 };
    case 'bernoulli':
      return { mean: d.p, variance: d.p * (1 - d.p) };
    case 'binomial':
      return { mean: d.n * d.p, variance: d.n * d.p * (1 - d.p) };
  }
}
export function sample(d: Distribution, count: number, seed: number) {
  validate(d);
  if (!Number.isInteger(count) || count < 1 || count > 10000)
    throw new RangeError('样本数需为 1–10000');
  const rng = seeded(seed);
  return Array.from({ length: count }, () => {
    switch (d.kind) {
      case 'uniform':
        return d.a + (d.b - d.a) * rng();
      case 'normal':
        return d.mu + d.sigma * Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
      case 'bernoulli':
        return Number(rng() < d.p);
      case 'binomial': {
        let n = 0;
        for (let i = 0; i < d.n; i++) n += Number(rng() < d.p);
        return n;
      }
    }
  });
}
export function statistics(xs: number[]) {
  if (!xs.length) return { mean: null, populationVariance: null, sampleVariance: null };
  finite(...xs);
  let mean = 0,
    m2 = 0;
  xs.forEach((x, i) => {
    const delta = x - mean;
    mean += delta / (i + 1);
    m2 += delta * (x - mean);
  });
  return {
    mean,
    populationVariance: m2 / xs.length,
    sampleVariance: xs.length > 1 ? m2 / (xs.length - 1) : null,
  };
}
export function histogram(xs: number[], bins = 20) {
  if (!Number.isInteger(bins) || bins < 1 || bins > 200 || xs.length > 10000)
    throw new RangeError('bin 数 1–200，样本不超过 10000');
  finite(...xs);
  if (!xs.length) return [];
  let lo = Math.min(...xs),
    hi = Math.max(...xs);
  if (lo === hi) {
    lo -= 0.5;
    hi += 0.5;
  }
  const width = (hi - lo) / bins;
  const counts = Array<number>(bins).fill(0);
  for (const x of xs) counts[Math.min(bins - 1, Math.floor((x - lo) / width))]++;
  return counts.map((count, i) => ({
    x: lo + (i + 0.5) * width,
    lo: lo + i * width,
    hi: lo + (i + 1) * width,
    count,
    frequency: count / xs.length,
    density: count / xs.length / width,
  }));
}
