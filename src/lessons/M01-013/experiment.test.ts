import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('结构化精确秩、阈值与边界', () => {
  expect(experiment('dependent', 1, 1e-6).singular).toEqual([5, 0]);
  expect(experiment('dependent', 1, 1e-6).exactRank).toBe(1);
  expect(experiment('diagonal', 1, 1e-6).numericalRank).toBe(2);
  const r = experiment('diagonal', 1e-8, 1e-6);
  expect(r.exactRank).toBe(2);
  expect(r.numericalRank).toBe(1);
  expect(experiment('diagonal', 1e-8, 1e-10).numericalRank).toBe(2);
  expect(experiment('diagonal', 1e-6, 1e-6).numericalRank).toBe(1);
  expect(experiment('diagonal', 0, 1e-6).exactRank).toBe(1);
});
it('拒绝不合法模型与数值', () => {
  expect(() => experiment('bad', 1, 1e-6)).toThrow();
  for (const e of [NaN, Infinity, -1, 1.1]) expect(() => experiment('diagonal', e, 1e-6)).toThrow();
  for (const t of [NaN, Infinity, 0, -1, 0.6]) expect(() => experiment('diagonal', 1, t)).toThrow();
});
