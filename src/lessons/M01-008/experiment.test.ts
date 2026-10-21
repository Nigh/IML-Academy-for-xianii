import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('范数、单位换算与正尺度，绝对容差1e−12', () => {
  const a = experiment(3, 4, 1, 1, 1),
    b = experiment(3, 4, 1000, 1, 1);
  expect(a.l1).toBe(7);
  expect(a.l2).toBe(5);
  expect(b.l2).toBe(5);
  expect(b.rawL2).toBeCloseTo(Math.hypot(3000, 4), 12);
  expect(a.normalizedL2).toBe(b.normalizedL2);
  expect(experiment(-3, -4, 1, 3, 4).normalizedL2).toBeCloseTo(Math.SQRT2, 12);
  expect(experiment(0, 0, 1, 0.1, 10).l1).toBe(0);
});
it('非法边界拒绝', () => {
  for (const n of [NaN, Infinity, -Infinity, 5.1])
    expect(() => experiment(n, 0, 1, 1, 1)).toThrow();
  for (const n of [0, -1, NaN, Infinity, 10.1]) {
    expect(() => experiment(0, 0, 1, n, 1)).toThrow();
    expect(() => experiment(0, 0, 1, 1, n)).toThrow();
  }
  expect(() => experiment(0, 0, 2, 1, 1)).toThrow();
});
