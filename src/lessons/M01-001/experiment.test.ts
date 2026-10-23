import { describe, it, expect } from 'vitest';
import { experiment } from './experiment.ts';
describe('被动坐标旋转（本课有界尺度的绝对容差 1e-12）', () => {
  it('位移 (3,4)m 的长度为 5m，轴旋转 90° 得到 (4,−3)m', () => {
    expect(experiment(3, 4, 0).components).toEqual({ x: 3, y: 4 });
    const r = experiment(3, 4, 90);
    expect(r.components.x).toBeCloseTo(4, 12);
    expect(r.components.y).toBeCloseTo(-3, 12);
    expect(r.length).toBe(5);
    expect(r.componentCorner.x).toBeCloseTo(0, 12);
    expect(r.componentCorner.y).toBeCloseTo(4, 12);
  });
  it('全角度边界、长度与重构不变量', () => {
    for (const degrees of [-180, -90, -13.5, 0, 45, 90, 180]) {
      const r = experiment(-5, 5, degrees);
      expect(Math.abs(Math.hypot(r.components.x, r.components.y) - r.length)).toBeLessThan(1e-12);
      expect(Math.abs(r.reconstructed.x + 5)).toBeLessThan(1e-12);
      expect(Math.abs(r.reconstructed.y - 5)).toBeLessThan(1e-12);
    }
  });
  it('零向量没有方向和分量辅助线长度', () => {
    const zero = experiment(0, 0, 90);
    expect(zero.direction).toBeNull();
    expect(zero.length).toBe(0);
    expect(zero.components).toEqual({ x: 0, y: 0 });
    expect(zero.componentCorner).toEqual({ x: 0, y: 0 });
  });
  it('同样长的位移可到达不同终点', () => {
    const east = experiment(3, 4, 0),
      west = experiment(-3, 4, 0);
    expect(east.length).toBe(5);
    expect(west.length).toBe(5);
    expect(east.original).toEqual({ x: 3, y: 4 });
    expect(west.original).toEqual({ x: -3, y: 4 });
    expect(east.direction).not.toBe(west.direction);
  });
  it('拒绝非有限、越界和缺失分量', () => {
    for (const value of [NaN, Infinity, -Infinity, 5.1, -5.1]) {
      expect(() => experiment(value, 0, 0)).toThrow(RangeError);
      expect(() => experiment(0, value, 0)).toThrow(RangeError);
    }
    for (const degrees of [NaN, Infinity, -181, 181])
      expect(() => experiment(0, 0, degrees)).toThrow(RangeError);
    expect(() => experiment(undefined as unknown as number, 0, 0)).toThrow(RangeError);
  });
});
