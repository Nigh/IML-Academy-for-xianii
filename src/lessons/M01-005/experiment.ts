import { finite, vector, scale, add, subtract, norm, project } from '../../lib/math/vector.ts';
import type { PlotSeries } from '../../components/charts/types.ts';
export const presets = [
  {
    id: 'plane',
    name: '场景一：两个独立方向',
    description: '标准基用系数3、−2精确生成目标 (3,−2)。',
    a: 3,
    b: -2,
  },
  {
    id: 'line',
    name: '场景二：两个共线方向',
    description: '(1,1) 和 (2,2) 只能生成直线上的点，不能生成 (1,0)。',
    a: 1,
    b: 0,
  },
] as const;
export function experiment(mode: string, a: number, b: number) {
  finite(a, b);
  if (!['plane', 'line'].includes(mode) || Math.abs(a) > 3 || Math.abs(b) > 3)
    throw new RangeError('模式无效或系数不在 −3 至3。');
  const u = mode === 'plane' ? vector(1, 0) : vector(1, 1),
    v = mode === 'plane' ? vector(0, 1) : vector(2, 2),
    target = mode === 'plane' ? vector(3, -2) : vector(1, 0);
  const first = scale(u, a),
    second = scale(v, b),
    w = add(first, second),
    error = norm(subtract(target, w));
  const nearest = mode === 'plane' ? target : project(target, u)!;
  const lattice = Array.from({ length: 25 }, (_, i) =>
    add(scale(u, Math.floor(i / 5) - 2), scale(v, (i % 5) - 2)),
  );
  const extent =
    Math.max(
      1,
      ...lattice.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)]),
      Math.abs(w.x),
      Math.abs(w.y),
      norm(target),
    ) + 1;
  const series: PlotSeries[] = [
    {
      id: 'lattice',
      label: '25组整数系数的组合',
      kind: 'scatter',
      role: 'secondary',
      points: lattice,
    },
    { id: 'target', label: '固定目标', kind: 'scatter', role: 'primary', points: [target] },
    { id: 'current', label: '当前组合', kind: 'scatter', role: 'accent', points: [w] },
  ];
  return {
    u,
    v,
    target,
    first,
    second,
    w,
    error,
    nearest,
    distance: norm(subtract(target, nearest)),
    extent,
    series,
    dimension: mode === 'plane' ? 2 : 1,
  };
}
