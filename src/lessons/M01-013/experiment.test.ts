import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('结构化精确秩、阈值与边界', () => {
  expect(experiment('dependent', 1, 1e-6).singular).toEqual([5, 0]);
  expect(experiment('dependent', 1, 1e-6).exactRank).toBe(1);
  expect(experiment('diagonal', 1, 1e-6).numericalRank).toBe(2);
  const r = experiment('diagonal', 1e-8, 1e-6);
  expect(r.exactRank).toBe(2);
  expect(r.numericalRank).toBe(1);
  expect(experiment('diagonal', 1e-8, 1e-10).numericalRank).toBe(2);
  expect(experiment('diagonal', 1e-6, 1e-6).numericalRank).toBe(1);
  expect(experiment('diagonal', 0, 1e-6).exactRank).toBe(1);
});
it('拒绝不合法模型与数值', () => {
  expect(() => experiment('bad', 1, 1e-6)).toThrow();
  for (const e of [NaN, Infinity, -1, 1.1]) expect(() => experiment('diagonal', e, 1e-6)).toThrow();
  for (const t of [NaN, Infinity, 0, -1, 0.6]) expect(() => experiment('diagonal', 1, t)).toThrow();
});

it('执行器解析输出、可达角点与非法指令', async () => {
  const { actuate } = await import('./experiment.ts');
  expect(
    actuate(
      [
        [1, 2],
        [2, 4],
      ],
      1,
      -0.5,
    ).position,
  ).toEqual({ x: 0, y: 0 });
  expect(
    actuate(
      [
        [1, 0],
        [0, 1],
      ],
      0,
      1,
    ).position,
  ).toEqual({ x: 0, y: 1 });
  expect(
    actuate(
      [
        [1, 0],
        [0, 1],
      ],
      0,
      0,
    ).corners,
  ).toEqual([
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
  ]);
  expect(
    actuate(
      [
        [1, 0],
        [0, 1e-8],
      ],
      0,
      1,
    ).position.y,
  ).toBe(1e-8);
  for (const command of [NaN, Infinity, 1.01])
    expect(() =>
      actuate(
        [
          [1, 0],
          [0, 1],
        ],
        command,
        0,
      ),
    ).toThrow(RangeError);
  expect(() => actuate([[1]], 0, 0)).toThrow(RangeError);
});
