import { it, expect } from 'vitest';
import { fit, experiment } from './experiment.ts';
it('三点解析解与正交条件、离群影响', () => {
  const r = experiment(false, 0);
  expect(r.slope).toBe(1.5);
  expect(r.intercept).toBeCloseTo(4 / 3, 12);
  expect(r.sse).toBeCloseTo(1 / 6, 12);
  r.normal.forEach((n) => expect(n).toBeCloseTo(0, 12));
  const plain = experiment(true, 0),
    outlier = experiment(true, 6);
  expect(plain.slope).toBeCloseTo(1.1, 12);
  expect(outlier.slope).toBeCloseTo(2.9, 12);
  expect(outlier.sse).toBeGreaterThan(plain.sse);
  for (const d of [-8, 0, 6, 8])
    experiment(true, d).normal.forEach((n) => expect(n).toBeCloseTo(0, 11));
  const exact = fit([
    [0, 1],
    [1, 3],
    [2, 5],
  ]);
  expect(exact.slope).toBe(2);
  expect(exact.sse).toBe(0);
});
it('形状、非有限、退化与边界校验', () => {
  for (const p of [
    [],
    [[0, 1]],
    [
      [0, 1, 2],
      [1, 2],
    ],
    [
      [0, NaN],
      [1, 2],
    ],
    [
      [0, 1],
      [Infinity, 2],
    ],
    [
      [21, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [0, 2],
    ],
  ])
    expect(() => fit(p)).toThrow();
  for (const d of [NaN, Infinity, -8.1, 8.1]) expect(() => experiment(true, d)).toThrow();
});
