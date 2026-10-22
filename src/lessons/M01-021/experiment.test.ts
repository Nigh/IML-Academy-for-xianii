import { it, expect } from 'vitest';
import { parseShape, broadcastShape, experiment } from './experiment.ts';
it('三维通道与外和解析形状、来源及真实加法', () => {
  const r = experiment([2, 3, 4], [4], 10);
  expect(r.shape).toEqual([2, 3, 4]);
  expect(r.rows).toHaveLength(24);
  expect(r.rows[23]).toMatchObject({ index: [1, 2, 3], av: 23, bv: 13, value: 36 });
  expect(r.rows[4].right.index).toEqual([0]);
  const o = experiment([3, 1], [1, 4], 10);
  expect(o.shape).toEqual([3, 4]);
  expect(o.rows[11]).toMatchObject({ av: 2, bv: 13, value: 15 });
  expect(() => broadcastShape([3], [4])).toThrow('不兼容');
  expect(parseShape(' 2, 3,4 ')).toEqual([2, 3, 4]);
  expect(experiment([4, 4, 4], [1], -10).rows).toHaveLength(64);
  expect(experiment([1], [1], 0).rows[0].value).toBe(0);
});
it('拒绝非法形状、语法和非有限值', () => {
  for (const s of ['', '2,,3', '(2,3)', '0', '-1', '1.5', '5', '1,2,3,4', 'NaN', 'Infinity'])
    expect(() => parseShape(s)).toThrow();
  for (const s of [[], [0], [NaN], [Infinity], [1.5], [1, 1, 1, 1]])
    expect(() => broadcastShape(s, [1])).toThrow();
  for (const n of [NaN, Infinity, -10.1, 10.1]) expect(() => experiment([2], [1], n)).toThrow();
});
