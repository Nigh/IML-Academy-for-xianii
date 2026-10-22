import { describe, it, expect } from 'vitest';
import {
  add,
  scale,
  vector,
  magnitude,
  routePosition,
  assessRoute,
  routeTasks,
} from './experiment.ts';
it('两段直线按解析位置推进，检查路径而不仅是终点', () => {
  const a = vector(2, 1),
    b = vector(1, 2);
  expect(routePosition(a, b, 0)).toEqual(vector(0, 0));
  expect(routePosition(a, b, 5)).toEqual(vector(1, 0.5));
  expect(routePosition(a, b, 10)).toEqual(a);
  expect(routePosition(a, b, 15)).toEqual(vector(2.5, 2));
  expect(routePosition(a, b, 20)).toEqual(vector(3, 3));
  expect(assessRoute(a, b, routeTasks[0])).toMatchObject({ viaReached: true, endReached: true });
  expect(assessRoute(b, a, routeTasks[0])).toMatchObject({ viaReached: false, endReached: true });
  expect(assessRoute(a, vector(-1, 2), routeTasks[0])).toMatchObject({
    viaReached: true,
    endReached: false,
  });
  expect(assessRoute(vector(2, -1), vector(-2, 1), routeTasks[1])).toMatchObject({
    viaReached: true,
    endReached: true,
  });
  expect(assessRoute(scale(a, -2), vector(-1, 2), routeTasks[2])).toMatchObject({
    viaReached: true,
    endReached: true,
  });
  expect(routePosition(vector(0, 0), vector(0, 0), 15)).toEqual(vector(0, 0));
  expect(assessRoute(vector(2 + 1e-10, 1), b, routeTasks[0]).viaReached).toBe(true);
  expect(assessRoute(vector(2 + 1e-6, 1), b, routeTasks[0]).viaReached).toBe(false);
  for (const step of [-1, 21, 0.5, NaN, Infinity])
    expect(() => routePosition(a, b, step)).toThrow(RangeError);
  expect(() => routePosition(a, { x: NaN, y: 0 }, 0)).toThrow();
  expect(() => assessRoute(a, b, { via: { x: Infinity, y: 0 }, end: a })).toThrow();
});
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
