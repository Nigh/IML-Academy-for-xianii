import { describe, it, expect } from 'vitest';
import { add, scale, vector, magnitude } from './experiment.ts';
describe('二维向量数学', () => {
  it('逐分量相加并完全抵消', () => {
    expect(add(vector(2, 1), vector(-1, 2))).toEqual({ x: 1, y: 3 });
    expect(add(vector(2, -1), vector(-2, 1))).toEqual({ x: 0, y: 0 });
  });
  it('满足零向量、交换律与数乘', () => {
    const a = vector(-2, 3),
      b = vector(1, -4);
    expect(add(a, vector(0, 0))).toEqual(a);
    expect(add(a, b)).toEqual(add(b, a));
    expect(scale(a, -2)).toEqual(vector(4, -6));
  });
  it('处理小数容差和路径长度区别', () => {
    expect(add(vector(0.1, 0.2), vector(0.2, 0.1)).x).toBeCloseTo(0.3, 12);
    expect(magnitude(vector(3, 4))).toBe(5);
    expect(magnitude(add(vector(2, -1), vector(-2, 1)))).toBe(0);
    expect(magnitude(vector(2, -1)) * 2).toBeCloseTo(2 * Math.sqrt(5));
  });
  it('拒绝非法参数和溢出', () => {
    expect(() => magnitude(vector(Number.MAX_VALUE, Number.MAX_VALUE))).toThrow();
    expect(() => scale(vector(0, 0), NaN)).toThrow();
    expect(scale(vector(3, 4), 0)).toEqual({ x: 0, y: 0 });
    expect(() => vector(NaN, 0)).toThrow(RangeError);
    expect(() => add({ x: Infinity, y: 0 }, vector(0, 0))).toThrow();
    expect(() => scale(vector(1, 2), Infinity)).toThrow();
    expect(() => add(vector(Number.MAX_VALUE, 0), vector(Number.MAX_VALUE, 0))).toThrow();
  });
});
