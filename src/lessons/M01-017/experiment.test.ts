import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('坐标轴特征对、普通输入和负值', () => {
  for (const [a, l] of [
    [0, 2],
    [90, 3],
    [-90, 3],
    [180, 2],
  ]) {
    const r = experiment('diagonal', a);
    expect(r.eigenvalue).toBe(l);
    expect(r.residual).toBe(0);
  }
  const n = experiment('reflection', 0);
  expect(n.eigenvalue).toBe(-1);
  expect(n.av).toEqual({ x: -1, y: 0 });
  const g = experiment('diagonal', 45);
  expect(g.eigen).toBe(false);
  expect(g.rho).toBeCloseTo(2.5, 12);
  expect(g.residual).toBeCloseTo(0.5, 12);
});
it('旋转对所有采样角均无实特征方向；解析边界与非法输入', () => {
  for (let a = -180; a <= 180; a += 5) {
    const r = experiment('rotation', a);
    expect(r.eigenvalue).toBeNull();
    expect(r.residual).toBeCloseTo(1, 12);
    expect(r.v.x * r.av.x + r.v.y * r.av.y).toBeCloseTo(0, 12);
  }
  expect(() => experiment('bad', 0)).toThrow();
  for (const a of [NaN, Infinity, -Infinity, -181, 181])
    expect(() => experiment('diagonal', a)).toThrow();
});
