import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
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
