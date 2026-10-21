import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('解析缺陷与子空间条件，绝对误差1e−12', () => {
  for (const a of [-2, -0.3, 0, 1, 2])
    for (const b of [-2, 0, 0.7, 2]) {
      expect(experiment(0, a, b).defect).toBeCloseTo(0, 12);
      expect(experiment(0, a, b).subspace).toBe(true);
      expect(experiment(1, a, b).defect).toBeCloseTo(a + b - 1, 12);
    }
  const extreme = experiment(0, 2, -2);
  expect(extreme.w).toEqual({ x: 4, y: 8 });
  expect(extreme.series[0].points).toEqual([
    { x: -5, y: -10 },
    { x: 5, y: 10 },
  ]);
  expect(extreme.member).toBe(true);
  expect(experiment(1, 1, 1).member).toBe(false);
  expect(experiment(1, 0, 0).w).toEqual({ x: 0, y: 0 });
  expect(experiment(1, 0, 0).subspace).toBe(false);
  expect(experiment(1, 0.2, 0.8).member).toBe(true);
});
it('拒绝非有限和越界参数', () => {
  for (const n of [NaN, Infinity, -Infinity, 2.1, -2.1]) {
    expect(() => experiment(n, 0, 0)).toThrow();
    expect(() => experiment(0, n, 0)).toThrow();
    expect(() => experiment(0, 0, n)).toThrow();
  }
});
