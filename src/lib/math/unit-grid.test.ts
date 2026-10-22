import { expect, it } from 'vitest';
import { unitGrid, mapping } from './coordinates.ts';
it('单位格子独立于视域，密集整数网格有界抽稀', () => {
  expect(unitGrid([-2.5, 3.5], 320)).toEqual({ step: 1, values: [-2, -1, 0, 1, 2, 3] });
  for (const range of [
    [-10000, 10000],
    [-1e300, 1e300],
  ] as const) {
    const grid = unitGrid(range, 500);
    expect(Number.isInteger(grid.step)).toBe(true);
    expect(grid.values.length).toBeLessThanOrEqual(81);
    expect(grid.values.every(Number.isFinite)).toBe(true);
    expect(grid.values.every((n) => n >= range[0] && n <= range[1])).toBe(true);
  }
  expect(unitGrid([0.2, 0.8], 320).values).toEqual([]);
  expect(() => unitGrid([0, Infinity], 320)).toThrow();
  expect(() => unitGrid([0, 1], 0)).toThrow();
});
it('等比例映射及反向映射使用同一尺度', () => {
  const m = mapping([-5, 5], [-12, 12], 500, 280, true);
  const o = m.toScreen({ x: 0, y: 0 });
  expect(m.toScreen({ x: 1, y: 0 }).x - o.x).toBeCloseTo(o.y - m.toScreen({ x: 0, y: 1 }).y, 12);
  const back = m.toData(m.toScreen({x:3,y:-2}));
  expect(back.x).toBeCloseTo(3,12);
  expect(back.y).toBeCloseTo(-2,12);
});
