import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('任务场景、还原与勾股恒等式，绝对误差1e−12', () => {
  expect(experiment(3, 2, 0).r).toEqual({ x: 0, y: 2 });
  expect(experiment(3, 2, 0).originalSquared).toBe(13);
  expect(experiment(3, 2, 45).parallelSquared).toBeCloseTo(12.5, 12);
  for (const angle of [-180, -90, 0, 45, 90, 180])
    for (const [x, y] of [
      [3, 2],
      [-5, 5],
      [0, 0],
    ]) {
      const r = experiment(x, y, angle);
      expect(Math.abs(r.cross)).toBeLessThan(1e-12);
      expect(Math.abs(r.energyError)).toBeLessThan(1e-12);
      expect(r.p.x + r.r.x).toBeCloseTo(x, 12);
      expect(r.p.y + r.r.y).toBeCloseTo(y, 12);
    }
});
it('非法数值与边界拒绝', () => {
  for (const n of [NaN, Infinity, -Infinity, 5.1]) {
    expect(() => experiment(n, 0, 0)).toThrow();
    expect(() => experiment(0, n, 0)).toThrow();
  }
  for (const n of [NaN, Infinity, 181, -181]) expect(() => experiment(0, 0, n)).toThrow();
});
