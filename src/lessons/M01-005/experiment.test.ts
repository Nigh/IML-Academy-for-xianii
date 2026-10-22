import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('解析场景和最小距离，绝对容差1e−12', () => {
  const p = experiment('plane', 3, -2);
  expect(p.w).toEqual({ x: 3, y: -2 });
  expect(p.error).toBe(0);
  expect(p.distance).toBe(0);
  for (const a of [-3, 0, 1, 3])
    for (const b of [-3, 0, 2, 3]) {
      const r = experiment('line', a, b);
      expect(r.w.x).toBe(r.w.y);
      expect(r.distance).toBeCloseTo(Math.SQRT1_2, 12);
      expect(r.error + 1e-12).toBeGreaterThanOrEqual(r.distance);
    }
  expect(experiment('line', -2, 1).w).toEqual({ x: 0, y: 0 });
});
it('有界图域包含输出并拒绝非法输入', () => {
  const r = experiment('line', 3, 3);
  expect(r.extent).toBeGreaterThan(9);
  expect(() => experiment('bad', 0, 0)).toThrow();
  for (const n of [NaN, Infinity, -Infinity, 3.1, -3.1]) {
    expect(() => experiment('line', n, 0)).toThrow();
    expect(() => experiment('plane', 0, n)).toThrow();
  }
});
