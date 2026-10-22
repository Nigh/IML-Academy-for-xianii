import { it, expect } from 'vitest';
import { experiment, combineCommands } from './experiment.ts';
it('独立/相关与三向量上界，残差绝对容差1e−12', () => {
  expect(experiment(0, 1, false).isBasis).toBe(true);
  expect(experiment(2, 0, false).coefficients).toEqual([-2, 1]);
  expect(experiment(0, 0, false).rank).toBe(1);
  for (const x of [-2, 0, 0.3, 2])
    for (const y of [-2, 0, 0.7, 2]) {
      const r = experiment(x, y, true);
      expect(r.rank).toBe(2);
      expect(r.isBasis).toBe(false);
      expect(r.residual!).toBeLessThan(1e-12);
      expect(r.coefficients![1]).toBe(-1);
    }
  expect(experiment(1, 1e-12, false).rank).toBe(2);
});
it('拒绝非有限、越界与错误开关', () => {
  for (const n of [NaN, Infinity, -Infinity, 2.1, -2.1]) {
    expect(() => experiment(n, 0, false)).toThrow();
    expect(() => experiment(0, n, false)).toThrow();
  }
  expect(() => experiment(0, 1, 'yes' as unknown as boolean)).toThrow();
});

it('驱动命令保留中间路线并识别非平凡返回，拒绝越界和非有限值', () => {
  const r = combineCommands(
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    [-2, 1],
  );
  expect(r.path).toEqual([
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 0, y: 0 },
  ]);
  expect(r.nontrivial).toBe(true);
  expect(r.returned).toBe(true);
  expect(combineCommands([{ x: 1, y: 0 }], [0]).nontrivial).toBe(false);
  expect(combineCommands([{ x: 1, y: 0 }], [1]).returned).toBe(false);
  for (const c of [NaN, Infinity, 3.1])
    expect(() => combineCommands([{ x: 1, y: 0 }], [c])).toThrow(RangeError);
  expect(() => combineCommands([{ x: 1, y: 0 }], [])).toThrow(RangeError);
});

it('独立基的微小非零指令不是抵消', () => {
  const r = combineCommands(
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    [1e-13, 0],
  );
  expect(r.nontrivial).toBe(true);
  expect(r.returned).toBe(false);
  expect(r.endpoint.x).toBe(1e-13);
});
