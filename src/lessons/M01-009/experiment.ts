import {
  finite,
  vector,
  norm,
  dot,
  normalize,
  project,
  scale,
  subtract,
} from '../../lib/math/vector.ts';
export const presets = [
  {
    id: 'axis',
    name: '场景一：投影到x轴',
    description: '(3,2)在(1,0)方向上的投影是(3,0)。',
    x: 3,
    y: 2,
    ux: 1,
    uy: 0,
  },
  {
    id: 'scaled',
    name: '场景二：方向放大两倍',
    description: '方向变为(2,0)，投影仍为(3,0)，最优系数变为1.5。',
    x: 3,
    y: 2,
    ux: 2,
    uy: 0,
  },
  {
    id: 'orthogonal',
    name: '场景三：正交零投影',
    description: '原向量与方向正交，投影落在原点。',
    x: 0,
    y: 3,
    ux: 1,
    uy: 0,
  },
  {
    id: 'zero',
    name: '场景四：零方向',
    description: '方向为零时投影未定义，不用零向量代替结果。',
    x: 3,
    y: 2,
    ux: 0,
    uy: 0,
  },
] as const;
export function experiment(x: number, y: number, ux: number, uy: number, t: number) {
  finite(x, y, ux, uy, t);
  if ([x, y, t].some((n) => Math.abs(n) > 5) || [ux, uy].some((n) => Math.abs(n) > 3))
    throw new RangeError('观测/候选系数±5，方向分量±3。');
  const v = vector(x, y),
    u = vector(ux, uy),
    p = project(v, u),
    unit = normalize(u),
    candidate = scale(u, t);
  const coefficient = unit ? dot(v, unit) / norm(u) : null;
  return {
    v,
    u,
    p,
    candidate,
    coincides: p !== null && norm(subtract(candidate, p)) < 1e-12,
    coefficient: coefficient !== null && Number.isFinite(coefficient) ? coefficient : null,
    distance: p ? norm(subtract(v, p)) : null,
    candidateDistance: norm(subtract(v, candidate)),
    range:
      1.4 *
      Math.max(
        1,
        Math.abs(x),
        Math.abs(y),
        Math.abs(ux),
        Math.abs(uy),
        Math.abs(candidate.x),
        Math.abs(candidate.y),
        Math.abs(p?.x ?? 0),
        Math.abs(p?.y ?? 0),
      ),
  };
}
