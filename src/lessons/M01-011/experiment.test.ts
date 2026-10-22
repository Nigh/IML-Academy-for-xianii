import { it, expect } from 'vitest';
import { multiply, experiment, presets } from './experiment.ts';
it('矩形乘法、顺序与逐项结果', () => {
  expect(multiply(presets[0].a, presets[0].b)).toEqual([
    [58, 64],
    [139, 154],
  ]);
  expect(multiply(presets[1].a, presets[1].b)).toEqual([
    [2, 1],
    [0, 1],
  ]);
  expect(multiply(presets[1].b, presets[1].a)).toEqual([
    [2, 2],
    [0, 1],
  ]);
  expect(experiment(presets[0].a, presets[0].b, 0, 0).terms).toEqual([7, 18, 33]);
  expect(multiply([[0.1, 0.2]], [[1], [1]])[0][0]).toBeCloseTo(0.3, 12);
  expect(multiply([[1e6]], [[1e6]])).toEqual([[1e12]]);
});
it('拒绝空、非矩形、不兼容、非有限与非法索引', () => {
  for (const a of [[], [[]], [[1], [2, 3]], [[NaN]], [[Infinity]], [[1e7]]])
    expect(() => multiply(a, [[1]])).toThrow();
  expect(() => multiply([[1, 2]], [[1, 2]])).toThrow();
  expect(() => experiment([[1]], [[1]], 1, 0)).toThrow();
  expect(() => experiment([[1]], [[1]], 0, 0.5)).toThrow();
});
