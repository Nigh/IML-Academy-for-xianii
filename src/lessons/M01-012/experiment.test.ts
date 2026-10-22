import { it, expect } from 'vitest';
import { experiment, transform, presets } from './experiment.ts';
it('缩放、剪切、原点与线性性', () => {
  expect(transform(presets[0].matrix, { x: 1, y: 1 })).toEqual({ x: 2, y: 1 });
  expect(experiment(presets[1].matrix).transformedSquare).toEqual([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 1 },
    { x: 1, y: 1 },
  ]);
  for (const p of presets) {
    expect(experiment(p.matrix).origin).toEqual({ x: 0, y: 0 });
    const u = transform(p.matrix, { x: 1, y: -2 }),
      v = transform(p.matrix, { x: -0.5, y: 1 });
    const sum = transform(p.matrix, { x: 0.5, y: -1 });
    expect(sum.x).toBeCloseTo(u.x + v.x, 12);
    expect(sum.y).toBeCloseTo(u.y + v.y, 12);
  }
  expect(experiment(presets[2].matrix).columns[1]).toEqual({ x: 0, y: 0 });
});
it('拒绝错误矩阵、非有限值、越界与溢出', () => {
  for (const a of [
    [],
    [[1]],
    [
      [1, 2],
      [3, 4],
    ],
    [
      [NaN, 0],
      [0, 1],
    ],
    [
      [Infinity, 0],
      [0, 1],
    ],
  ])
    expect(() => experiment(a)).toThrow();
  expect(() =>
    transform(
      [
        [2, 0],
        [0, 1],
      ],
      { x: Infinity, y: 0 },
    ),
  ).toThrow();
  expect(() =>
    transform(
      [
        [2, 0],
        [0, 1],
      ],
      { x: Number.MAX_VALUE, y: 0 },
    ),
  ).toThrow();
});
