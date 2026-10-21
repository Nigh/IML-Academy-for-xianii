import { it, expect } from 'vitest';
import { vector, add, subtract, scale, dot, norm, normalize, angle, project } from './vector.ts';
import { mapping, transformRange, canvasSize } from './coordinates.ts';
import {
  density,
  cdf,
  normalCDF,
  binomialPMF,
  seeded,
  sample,
  statistics,
  histogram,
  type Distribution,
} from './probability.ts';
it('向量解析值、交换律、正交、零向量和极小非零方向', () => {
  const a = vector(2, 3),
    b = vector(1, 0);
  expect(add(a, b)).toEqual({ x: 3, y: 3 });
  expect(subtract(a, b)).toEqual({ x: 1, y: 3 });
  expect(scale(b, 2)).toEqual({ x: 2, y: 0 });
  expect(dot(a, b)).toBe(dot(b, a));
  expect(dot(b, { x: 0, y: 1 })).toBe(0);
  expect(norm(a)).toBeCloseTo(Math.sqrt(13), 12);
  expect(project(a, b)).toEqual({ x: 2, y: 0 });
  expect(angle(b, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2, 12);
  expect(normalize(vector(1e-300, 0))).toEqual(b);
  expect(angle(a, vector(0, 0))).toBeNull();
  expect(project(a, vector(0, 0))).toBeNull();
  expect(() => vector(NaN, 0)).toThrow();
  expect(() => norm(vector(Number.MAX_VALUE, Number.MAX_VALUE))).toThrow();
  expect(() => dot({ x: Infinity, y: 0 }, b)).toThrow();
});
it('坐标正反变换、等比例、平移缩放和 DPR', () => {
  const m = mapping([-2, 2], [-1, 1], 400, 400, true);
  expect(m.toScreen({ x: 0, y: 0 })).toEqual({ x: 200, y: 200 });
  const p = { x: 1.2, y: -0.4 },
    q = m.toData(m.toScreen(p));
  expect(q.x).toBeCloseTo(p.x, 12);
  expect(q.y).toBeCloseTo(p.y, 12);
  expect(m.toScreen({ x: 1, y: 1 })).toEqual({ x: 300, y: 100 });
  expect(transformRange([-2, 2], 2, 1)).toEqual([0, 2]);
  expect(canvasSize(200, 100, 2)).toEqual({ width: 400, height: 200, scale: 2 });
  expect(() => mapping([1, 1], [0, 1], 100, 100)).toThrow();
  expect(() => transformRange([0, 1], 0)).toThrow();
  expect(() => canvasSize(1, 1, 0)).toThrow();
});
it('PMF 总和、端点、PDF 积分与 CDF 单调', () => {
  for (const p of [0, 0.2, 0.5, 1]) {
    expect(
      Array.from({ length: 11 }, (_, k) => binomialPMF(k, 10, p)).reduce((a, b) => a + b, 0),
    ).toBeCloseTo(1, 12);
  }
  expect(binomialPMF(0, 0, 0)).toBe(1);
  expect(binomialPMF(-1, 2, 0.5)).toBe(0);
  const ds: Distribution[] = [
    { kind: 'normal', mu: 0, sigma: 1 },
    { kind: 'uniform', a: -2, b: 2 },
    { kind: 'bernoulli', p: 0.3 },
    { kind: 'binomial', n: 10, p: 0.3 },
  ];
  expect(density(ds[0], 0)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 12);
  for (const d of ds) {
    let last = 0;
    for (let i = -100; i <= 200; i++) {
      const current = cdf(d, i / 10);
      expect(current).toBeGreaterThanOrEqual(last - 1e-12);
      last = current;
    }
  }
  let integral = 0;
  for (let i = 0; i < 16000; i++) integral += density(ds[0], -8 + (i + 0.5) * 0.001) * 0.001;
  expect(integral).toBeCloseTo(1, 10);
  let uniformIntegral = 0;
  for (let i = 0; i < 4000; i++) uniformIntegral += density(ds[1], -2 + (i + 0.5) * 0.001) * 0.001;
  expect(uniformIntegral).toBeCloseTo(1, 10);
});
it('Normal CDF 近似误差小于 8e-8（标准参考值）', () => {
  for (const [x, target] of [
    [0, 0.5],
    [0.5, 0.6914624612740131],
    [1, 0.8413447460685429],
    [2, 0.9772498680518208],
    [3, 0.9986501019683699],
    [-1, 0.15865525393145707],
  ])
    expect(Math.abs(normalCDF(x) - target)).toBeLessThan(8e-8);
});
it('采样复现、边界、统计量和直方图归一化', () => {
  const d: Distribution = { kind: 'normal', mu: 2, sigma: 3 };
  expect(sample(d, 20, 42)).toEqual(sample(d, 20, 42));
  expect(sample(d, 20, 43)).not.toEqual(sample(d, 20, 42));
  const s = statistics([1, 2, 3]);
  expect(s).toEqual({ mean: 2, populationVariance: 2 / 3, sampleVariance: 1 });
  expect(statistics([]).mean).toBeNull();
  expect(statistics([1]).sampleVariance).toBeNull();
  const h = histogram([1, 1, 2, 3], 3);
  expect(h.reduce((s, b) => s + b.count, 0)).toBe(4);
  expect(h.reduce((s, b) => s + b.density * (b.hi - b.lo), 0)).toBeCloseTo(1, 12);
  expect(histogram([2, 2], 1)[0].count).toBe(2);
  expect(histogram([])).toEqual([]);
  const rng = seeded(0);
  expect(Array.from({ length: 100 }, rng).every((v) => v >= 0 && v < 1)).toBe(true);
  expect(sample({ kind: 'bernoulli', p: 0 }, 5, 42)).toEqual([0, 0, 0, 0, 0]);
  expect(sample({ kind: 'binomial', n: 3, p: 1 }, 2, 42)).toEqual([3, 3]);
  expect(sample({ kind: 'uniform', a: 2, b: 3 }, 20, 42).every((x) => x >= 2 && x < 3)).toBe(true);
  for (const invalid of [
    { kind: 'normal', mu: 0, sigma: 0 },
    { kind: 'uniform', a: 1, b: 1 },
    { kind: 'bernoulli', p: -1 },
    { kind: 'binomial', n: 1.5, p: 0.5 },
  ] as Distribution[])
    expect(() => sample(invalid, 10, 42)).toThrow();
  expect(() => sample(d, 10001, 42)).toThrow();
  expect(() => seeded(-1)).toThrow();
  expect(() => histogram([NaN])).toThrow();
});
