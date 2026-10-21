import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('独立/相关与三向量上界，残差绝对容差1e−12', () => {
  expect(experiment(0, 1, false).isBasis).toBe(true);
  expect(experiment(2, 0, false).coefficients).toEqual([-2, 1]);
  expect(experiment(0, 0, false).rank).toBe(1);
  for (const x of [-2, 0, 0.3, 2])
    for (const y of [-2, 0, 0.7, 2]) {
      const r = experiment(x, y, true);
      expect(r.rank).toBe(2);
      expect(r.isBasis).toBe(false);
      expect(r.residual!).toBeLessThan(1e-12);
      expect(r.coefficients![1]).toBe(-1);
    }
  expect(experiment(1, 1e-12, false).rank).toBe(2);
});
it('拒绝非有限、越界与错误开关', () => {
  for (const n of [NaN, Infinity, -Infinity, 2.1, -2.1]) {
    expect(() => experiment(n, 0, false)).toThrow();
    expect(() => experiment(0, n, false)).toThrow();
  }
  expect(() => experiment(0, 1, 'yes' as unknown as boolean)).toThrow();
});
