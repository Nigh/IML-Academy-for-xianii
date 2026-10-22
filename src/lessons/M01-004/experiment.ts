import { finite, vector, add, scale } from '../../lib/math/vector.ts';
import type { PlotSeries } from '../../components/charts/types.ts';
export const presets = [
  {
    id: 'linear',
    name: '场景一：经过原点',
    description: 'y=2x：任意线性组合仍在线上。',
    d: 0,
    a: 1,
    b: 1,
  },
  {
    id: 'affine',
    name: '场景二：平移直线',
    description: 'y=2x+1：两个成员相加落在线外，也不包含零向量。',
    d: 1,
    a: 1,
    b: 1,
  },
  {
    id: 'zero',
    name: '场景三：乘以零',
    description: '平移直线的成员乘零得到原点，原点不属于该集合。',
    d: 1,
    a: 0,
    b: 0,
  },
] as const;
export function experiment(d: number, a: number, b: number) {
  finite(d, a, b);
  if ([d, a, b].some((n) => Math.abs(n) > 2)) throw new RangeError('参数范围为 −2 至 2。');
  const u = vector(1, 2 + d),
    v = vector(-1, -2 + d),
    w = add(scale(u, a), scale(v, b));
  const defect = w.y - 2 * w.x - d;
  const series: PlotSeries[] = [
    {
      id: 'set',
      label: `集合 y=2x+${d}`,
      kind: 'line',
      role: 'secondary',
      points: [
        { x: -5, y: -10 + d },
        { x: 5, y: 10 + d },
      ],
    },
    { id: 'u', label: '成员 u', kind: 'scatter', role: 'primary', points: [u] },
    { id: 'v', label: '成员 v', kind: 'scatter', role: 'secondary', points: [v] },
    { id: 'w', label: '组合 w', kind: 'scatter', role: 'accent', points: [w] },
  ];
  return { u, v, w, defect, member: Math.abs(defect) <= 1e-12, subspace: d === 0, series };
}
