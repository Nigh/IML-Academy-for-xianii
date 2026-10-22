import { it, expect } from 'vitest';
import { experiment } from './experiment.ts';
it('欠定最小范数与超定非零残差解析答案', () => {
  const u = experiment('under', 2, 0, 1);
  expect(u.star).toEqual([1, 1]);
  expect(u.candidate).toEqual([2, 0]);
  expect(u.residual).toBe(0);
  expect(u.starNorm).toBeCloseTo(Math.sqrt(2), 12);
  expect(u.candidateNorm).toBe(2);
  const o = experiment('over', 1, 3, 1);
  expect(o.star).toEqual([2]);
  expect(o.fitted).toEqual([2, 2]);
  expect(o.residual).toBeCloseTo(Math.sqrt(2), 12);
  expect(o.candidateResidual).toBeGreaterThan(o.residual);
  expect(experiment('over', 2, 2, 0).residual).toBe(0);
  for (const b of [-4, 0, 4])
    for (const t of [-3, 0, 3]) {
      const r = experiment('under', b, 0, t);
      expect(r.candidateResidual).toBeCloseTo(0, 12);
      expect(r.candidateNorm ** 2 - r.starNorm ** 2).toBeCloseTo(2 * t * t, 12);
    }
});
it('固定伪逆满足四个定义条件，边界及非法输入', () => {
  const transpose = (a: number[][]) => a[0].map((_, i) => a.map((r) => r[i]));
  const mul = (a: number[][], b: number[][]) =>
    a.map((r) => b[0].map((_, j) => r.reduce((s, n, k) => s + n * b[k][j], 0)));
  for (const m of ['under', 'over']) {
    const r = experiment(m, -4, 4, 3),
      a = r.matrix,
      p = r.pinverse;
    expect(mul(mul(a, p), a)).toEqual(a);
    expect(mul(mul(p, a), p)).toEqual(p);
    expect(mul(a, p)).toEqual(transpose(mul(a, p)));
    expect(mul(p, a)).toEqual(transpose(mul(p, a)));
  }
  expect(() => experiment('bad', 0, 0, 0)).toThrow();
  for (const n of [NaN, Infinity, -Infinity, 4.1, -4.1]) {
    expect(() => experiment('under', n, 0, 0)).toThrow();
    expect(() => experiment('under', 0, n, 0)).toThrow();
  }
  for (const n of [NaN, Infinity, 3.1, -3.1]) expect(() => experiment('over', 0, 0, n)).toThrow();
});
