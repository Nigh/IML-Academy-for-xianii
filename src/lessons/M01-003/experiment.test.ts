import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('任务场景元素数与地址：整数运算精确断言', () => {
  expect(experiment([2, 3, 4]).count).toBe(24);
  expect(experiment([3, 2, 4]).count).toBe(24);
  expect(experiment([2, 3, 4]).coordinates).toEqual([0, 2, 0]);
  expect(experiment([3, 2, 4]).coordinates).toEqual([1, 0, 0]);
  expect(experiment([8, 100, 1]).count).toBe(800);
  expect(experiment([8, 100, 3]).count).toBe(2400);
  expect(experiment([8, 100, 3]).bytes).toBe(9600);
  expect(experiment([8, 100, 3], 7, 99).values).toEqual([[2397, 2398, 2399]]);
  expect(experiment([1, 1, 1]).values).toEqual([[0]]);
});
it('拒绝错误形状、非整数、非有限与越界切片', () => {
  for (const s of [
    [],
    [2, 3],
    [2, 3, 4, 5],
    [0, 1, 1],
    [9, 1, 1],
    [1, 101, 1],
    [1, 1, 9],
    [1, 1, NaN],
    [Infinity, 1, 1],
    [1, 2.5, 1],
  ])
    expect(() => experiment(s)).toThrow(RangeError);
  for (const [b, t] of [
    [-1, 0],
    [2, 0],
    [0, 3],
    [0, NaN],
    [0.5, 0],
  ])
    expect(() => experiment([2, 3, 4], b, t)).toThrow(RangeError);
});
