import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('解析核方向、秩零度和同一输出解族', () => {
  const k = experiment('row', 0, 1);
  expect(k.x).toEqual({ x: 1, y: -1 });
  expect(k.output).toEqual([0]);
  expect(k.rank + k.nullity).toBe(2);
  for (const mode of ['row', 'dependent', 'identity'])
    for (const d of [-4, 0, 2, 4])
      for (const t of [-3, -0.25, 0, 3]) {
        const r = experiment(mode, d, t);
        expect(r.residual).toBeCloseTo(0, 12);
        expect(r.rank + r.nullity).toBe(2);
      }
  expect(experiment('row', 2, 1).x).toEqual({ x: 2, y: 0 });
  const full = experiment('identity', 2, 3);
  expect(full.nullity).toBe(0);
  expect(full.x).toEqual({ x: 2, y: 0 });
  expect(experiment('dependent', 0, 1).nullity).toBe(1);
});
it('拒绝非法模型和非有限/越界参数', () => {
  expect(() => experiment('other', 0, 0)).toThrow();
  for (const n of [NaN, Infinity, -Infinity, 4.01, -4.01])
    expect(() => experiment('row', n, 0)).toThrow();
  for (const n of [NaN, Infinity, -Infinity, 3.01, -3.01])
    expect(() => experiment('row', 0, n)).toThrow();
});
