import { it, expect } from 'vitest';
import { distributionExperiment, diceCDF, presets } from './experiment.ts';
it('骰子 CDF 与四类分布实验数据真实复现', () => {
  expect(diceCDF(3)).toBe(0.5);
  expect(diceCDF(3.9)).toBe(0.5);
  expect(diceCDF(0)).toBe(0);
  expect(diceCDF(7)).toBe(1);
  expect(() => diceCDF(NaN)).toThrow();
  for (const p of presets) {
    const r = distributionExperiment(p.d, p.count, 42);
    expect(r.samples).toHaveLength(p.count);
    expect(r.samples).toEqual(distributionExperiment(p.d, p.count, 42).samples);
    expect(r.cumulative.every((v, i, a) => i === 0 || v.y >= a[i - 1].y)).toBe(true);
  }
  const a = distributionExperiment({ kind: 'normal', mu: 0, sigma: 1 }, 20, 42),
    b = distributionExperiment({ kind: 'normal', mu: 2, sigma: 1 }, 20, 42);
  expect(b.samples[0] - a.samples[0]).toBeCloseTo(2, 12);
  expect(() => distributionExperiment({ kind: 'normal', mu: 0, sigma: -1 }, 10, 42)).toThrow();
});
