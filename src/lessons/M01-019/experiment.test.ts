import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('截断解析误差、满秩恢复、能量与项重构', () => {
  expect(experiment('diagonal', 1, 1).error).toBe(1);
  expect(experiment('diagonal', 1, 2).error).toBe(0);
  expect(experiment('diagonal', 1, 1).energy).toBe(0.9);
  for (const mode of ['diagonal', 'dense'])
    for (const tail of [0, 1, 3]) {
      let previous = Infinity;
      for (let k = 0; k <= 2; k++) {
        const r = experiment(mode, tail, k);
        expect(r.error).toBeCloseTo(r.expected, 12);
        expect(r.error).toBeLessThanOrEqual(previous);
        previous = r.error;
        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 2; j++)
            expect(r.first[i][j] + r.second[i][j]).toBeCloseTo(r.matrix[i][j], 12);
      }
    }
  expect(experiment('dense', 0, 1).error).toBe(0);
});
it('拒绝非整数、非有限和越界', () => {
  expect(() => experiment('bad', 1, 1)).toThrow();
  for (const n of [NaN, Infinity, -1, 3.1]) expect(() => experiment('dense', n, 1)).toThrow();
  for (const n of [NaN, Infinity, -1, 0.5, 3]) expect(() => experiment('dense', 1, n)).toThrow();
});
