import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('对角、秩1、旋转与反射的解析构造', () => {
  const d = experiment(3, 1, 0, 0, false);
  expect(d.matrix).toEqual([
    [3, 0],
    [0, 1],
  ]);
  expect(d.rank).toBe(2);
  expect(experiment(3, 0, 30, 45, false).rank).toBe(1);
  expect(experiment(0, 0, 0, 0, false).rank).toBe(0);
  const ref = experiment(3, 1, 0, 0, true);
  expect(ref.matrix[0][0]).toBe(-3);
  expect(ref.matrix[1][1]).toBe(1);
  for (const [s1, s2, u, v, f] of [
    [3, 0, 30, 45, false],
    [4, 2, -180, 90, true],
    [1, 1, 90, 0, false],
  ] as const) {
    const r = experiment(s1, s2, u, v, f);
    const a = r.matrix;
    const trace = a.flat().reduce((s, n) => s + n * n, 0),
      det = a[0][0] * a[1][1] - a[0][1] * a[1][0];
    expect(trace).toBeCloseTo(s1 * s1 + s2 * s2, 12);
    expect(Math.abs(det)).toBeCloseTo(s1 * s2, 12);
    const p = r.probe[0],
      out = r.probe[3];
    expect(out.x).toBeCloseTo(a[0][0] * p.x + a[0][1] * p.y, 12);
    expect(out.y).toBeCloseTo(a[1][0] * p.x + a[1][1] * p.y, 12);
  }
});
it('拒绝负奇异值、无序、非有限和越界', () => {
  for (const args of [
    [-1, 0, 0, 0, false],
    [1, 2, 0, 0, false],
    [5, 1, 0, 0, false],
    [1, -1, 0, 0, false],
    [1, 0, 181, 0, false],
    [1, 0, 0, -181, false],
    [NaN, 0, 0, 0, false],
    [1, 0, Infinity, 0, false],
  ] as const)
    expect(() => experiment(args[0], args[1], args[2], args[3], args[4])).toThrow();
});

it('带缺口印章与SVD矩阵同源，压平保持真实退化', () => {
  for (const reflect of [false, true]) {
    const r = experiment(3, 1, 30, 45, reflect);
    for (let i = 0; i < r.stamp[0].length; i++) {
      const p = r.stamp[0][i],
        q = r.stamp[3][i];
      expect(q.x).toBeCloseTo(r.matrix[0][0] * p.x + r.matrix[0][1] * p.y, 12);
      expect(q.y).toBeCloseTo(r.matrix[1][0] * p.x + r.matrix[1][1] * p.y, 12);
    }
  }
  expect(experiment(3, 0, 0, 0, false).stamp[3].every((p) => p.y === 0)).toBe(true);
  expect(experiment(0, 0, 0, 0, false).stamp[3].every((p) => p.x === 0 && p.y === 0)).toBe(true);
});
