import { expect, it } from 'vitest';
import { vector } from '../../lib/math/vector.ts';
import { twoMoves, speedMotion, sceneRange, predictionDistance } from './experiment.ts';

it('连续移动逐分量合成，路程保留往返与直角路径', () => {
  const normal = twoMoves(vector(2, 1), vector(-1, 2));
  expect(normal.end).toEqual(vector(1, 3));
  expect(normal.pathLength).toBeCloseTo(2 * Math.sqrt(5), 12);
  expect(normal.displacementLength).toBeCloseTo(Math.sqrt(10), 12);
  const back = twoMoves(vector(2, -1), vector(-2, 1));
  expect(back.end).toEqual(vector(0, 0));
  expect(back.pathLength).toBeCloseTo(2 * Math.sqrt(5), 12);
  expect(back.displacementLength).toBe(0);
  expect(twoMoves(vector(2, 0), vector(0, 1))).toMatchObject({
    pathLength: 3,
    displacementLength: Math.sqrt(5),
  });
  expect(twoMoves(vector(0.1, 0.2), vector(0.2, 0.1)).end.x).toBeCloseTo(0.3, 12);
});

it('固定正的一秒，速度倍率同时缩放两个速度分量与位移', () => {
  for (const [k, x, y, length] of [
    [2, 4, 2, 2 * Math.sqrt(5)],
    [-1, -2, -1, Math.sqrt(5)],
    [0, 0, 0, 0],
    [-2, -4, -2, 2 * Math.sqrt(5)],
  ]) {
    const result = speedMotion(vector(2, 1), k);
    expect(result.velocity.x).toBe(x);
    expect(result.velocity.y).toBe(y);
    expect(result.displacement.x).toBe(x);
    expect(result.displacement.y).toBe(y);
    expect(result.pathLength).toBeCloseTo(length, 12);
  }
  const stationary = speedMotion(vector(0, 0), -2);
  expect(stationary.pathLength).toBe(0);
  expect(stationary.displacement.x === 0 && stationary.displacement.y === 0).toBe(true);
});

it('预测距离按真实数值计算，视域保留端点与等比例边界', () => {
  expect(predictionDistance(vector(1, 3), vector(1, 3))).toBe(0);
  expect(predictionDistance(vector(4, 7), vector(1, 3))).toBe(5);
  expect(sceneRange([vector(2, 1), vector(1, 3)], false)).toEqual([-3, 4]);
  expect(sceneRange([vector(0, 0)], true)).toEqual([-5, 5]);
  expect(sceneRange([vector(-15, 15), vector(20, -20)], true)).toEqual([-21, 21]);
});

it('拒绝非有限数与溢出，不让错误结果进入图形', () => {
  expect(() => twoMoves({ x: Infinity, y: 0 }, vector(0, 0))).toThrow(RangeError);
  expect(() => twoMoves(vector(Number.MAX_VALUE, 0), vector(Number.MAX_VALUE, 0))).toThrow(
    RangeError,
  );
  expect(() => twoMoves(vector(Number.MAX_VALUE, 0), vector(-Number.MAX_VALUE, 0))).toThrow(
    RangeError,
  );
  expect(() => speedMotion(vector(2, 1), NaN)).toThrow(RangeError);
  expect(() => speedMotion({ x: NaN, y: 1 }, 0)).toThrow(RangeError);
  expect(() => sceneRange([{ x: Infinity, y: 0 }], false)).toThrow(RangeError);
  expect(() => predictionDistance({ x: NaN, y: 0 }, vector(0, 0))).toThrow(RangeError);
});
