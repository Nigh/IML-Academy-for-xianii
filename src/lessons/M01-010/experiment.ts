import { finite, vector, project, subtract, dot, norm } from '../../lib/math/vector.ts';
export const presets = [
  {
    id: 'axis',
    name: '场景一：沿x轴分解',
    description: '(3,2)分为(3,0)+(0,2)，平方范数为9+4=13。',
    x: 3,
    y: 2,
    degrees: 0,
  },
  {
    id: 'oblique',
    name: '场景二：转到45°方向',
    description: '投影(2.5,2.5)，残差(0.5,−0.5)，平方范数仍为12.5+0.5=13。',
    x: 3,
    y: 2,
    degrees: 45,
  },
  {
    id: 'parallel',
    name: '场景三：没有残差',
    description: '观测已在参考直线上，残差为零。',
    x: 3,
    y: 0,
    degrees: 0,
  },
] as const;
export function experiment(x: number, y: number, degrees: number) {
  finite(x, y, degrees);
  if (Math.abs(x) > 5 || Math.abs(y) > 5 || Math.abs(degrees) > 180)
    throw new RangeError('分量±5，角度±180°。');
  const angle = (degrees * Math.PI) / 180,
    u = vector(Math.cos(angle), Math.sin(angle)),
    v = vector(x, y),
    p = project(v, u)!,
    r = subtract(v, p);
  const originalSquared = dot(v, v),
    parallelSquared = dot(p, p),
    residualSquared = dot(r, r);
  return {
    v,
    u,
    p,
    r,
    originalSquared,
    parallelSquared,
    residualSquared,
    cross: dot(u, r),
    energyError: originalSquared - parallelSquared - residualSquared,
    range:
      1.4 *
      Math.max(
        1,
        Math.abs(x),
        Math.abs(y),
        Math.abs(p.x),
        Math.abs(p.y),
        Math.abs(r.x),
        Math.abs(r.y),
      ),
    projectionZero: norm(p) < 1e-12,
    residualZero: norm(r) < 1e-12,
  };
}
