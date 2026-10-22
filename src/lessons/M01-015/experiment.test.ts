import { it, expect } from 'vitest';
import { commandOutput, experiment } from './experiment.ts';
it('单位/剪切逆与奇异相容性解析答案', () => {
  const i = experiment('identity', 2, -1, 0);
  expect(i.solution).toEqual([2, -1]);
  expect(i.inverse).toEqual([
    [1, 0],
    [0, 1],
  ]);
  const s = experiment('shear', 2, 1, 0);
  expect(s.solution).toEqual([1, 1]);
  expect(s.inverse).toEqual([
    [1, -1],
    [0, 1],
  ]);
  expect(experiment('dependent', 2, 3, 0).status).toBe('none');
  expect(experiment('dependent', 2, 3, 0).solution).toBeNull();
  for (const t of [-3, 0, 3]) {
    const r = experiment('dependent', 2, 4, t);
    expect(r.status).toBe('infinite');
    expect(r.output).toEqual([2, 4]);
    expect(r.residual).toBeCloseTo(0, 12);
    expect(r.inverse).toBeNull();
  }
  expect(experiment('dependent', 0, 0, 0).status).toBe('infinite');
});
it('边界、消元与非法参数', () => {
  for (const m of ['identity', 'shear'])
    for (const b of [-4, 4]) {
      const r = experiment(m, b, -b, 3);
      expect(r.residual).toBeCloseTo(0, 12);
      expect(r.extent).toBeGreaterThanOrEqual(Math.max(...r.solution!.map(Math.abs)));
    }
  expect(() => experiment('bad', 0, 0, 0)).toThrow();
  for (const n of [NaN, Infinity, -Infinity, 4.1, -4.1]) {
    expect(() => experiment('identity', n, 0, 0)).toThrow();
    expect(() => experiment('identity', 0, n, 0)).toThrow();
  }
  for (const n of [NaN, Infinity, 3.1, -3.1])
    expect(() => experiment('identity', 0, 0, n)).toThrow();
});

it('控制器读数服从相同矩阵，重复表不会独立变化', () => {
  expect(commandOutput('identity', 2, 1)).toEqual([2, 1]);
  expect(commandOutput('shear', 2, 1)).toEqual([3, 1]);
  expect(commandOutput('dependent', 2, -1)).toEqual([1, 2]);
  expect(() => commandOutput('identity', Infinity, 0)).toThrow(RangeError);
  expect(() => commandOutput('identity', 9, 0)).toThrow(RangeError);
  expect(() => commandOutput('unknown', 0, 0)).toThrow(RangeError);
});

it('扩大视域仍将无界约束延伸到绘图边界', () => {
  const r = experiment('identity', 2, 1, 0, 10.4);
  expect(r.extent).toBe(10.4);
  expect(r.series[0].points).toEqual([
    { x: 2, y: -10.4 },
    { x: 2, y: 10.4 },
  ]);
  expect(() => experiment('identity', 2, 1, 0, NaN)).toThrow();
  expect(() => experiment('identity', 2, 1, 0, -1)).toThrow();
});
