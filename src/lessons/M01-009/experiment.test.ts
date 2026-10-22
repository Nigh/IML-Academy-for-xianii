import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('解析投影、缩放、最小值与零方向', () => {
  expect(experiment(3, 2, 1, 0, 3).p).toEqual({ x: 3, y: 0 });
  expect(experiment(3, 2, 2, 0, 1.5).p).toEqual({ x: 3, y: 0 });
  const reversed = experiment(3, 2, -1, 0, -3);
  expect(reversed.p!.x).toBeCloseTo(3, 12);
  expect(reversed.p!.y).toBeCloseTo(0, 12);
  expect(reversed.coincides).toBe(true);
  expect(experiment(3, 2, 0, 0, 1).p).toBeNull();
  expect(experiment(0, 3, 1, 0, 1).p).toEqual({ x: 0, y: 0 });
  for (const t of [-5, 0, 1, 3, 5]) {
    const r = experiment(3, 2, 1, 0, t);
    expect(r.candidateDistance + 1e-12).toBeGreaterThanOrEqual(r.distance!);
  }
  expect(experiment(3, 2, 1e-308, 0, 0).coefficient).toBeNull();
});
it('拒绝非有限和越界参数', () => {
  for (const n of [NaN, Infinity, -Infinity, 5.1]) {
    expect(() => experiment(n, 0, 1, 0, 1)).toThrow();
    expect(() => experiment(0, n, 1, 0, 1)).toThrow();
  }
  expect(() => experiment(0, 0, 3.1, 0, 1)).toThrow();
  expect(() => experiment(0, 0, 0, NaN, 1)).toThrow();
  expect(() => experiment(0, 0, 1, 0, 6)).toThrow();
});
