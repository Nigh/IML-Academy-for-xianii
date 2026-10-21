import { norm, dot, angle, project, finite, type Vector2 } from '../../lib/math/vector.ts';
export const presets = [
  {
    id: 'arbitrary',
    name: '任意夹角',
    description: '先预测点积的符号，再拖动 a，观察投影长度。',
    a: { x: 3, y: 1 },
    b: { x: 1, y: 3 },
  },
  {
    id: 'parallel',
    name: '平行',
    description: '同向时夹角为零；改变长度会改变点积。',
    a: { x: 2, y: 0 },
    b: { x: 4, y: 0 },
  },
  {
    id: 'opposite',
    name: '反向',
    description: '两个方向相反的向量点积为负。',
    a: { x: 1, y: 1 },
    b: { x: -1, y: -1 },
  },
  {
    id: 'orthogonal',
    name: '正交',
    description: '非零正交向量的点积与投影均为零。',
    a: { x: 1, y: 0 },
    b: { x: 0, y: 1 },
  },
  {
    id: 'zero',
    name: '零向量',
    description: '零向量没有方向，不能作为投影的目标方向。',
    a: { x: 3, y: 1 },
    b: { x: 0, y: 0 },
  },
];
export function measure(a: Vector2, b: Vector2) {
  const radians = angle(a, b);
  return {
    aNorm: norm(a),
    bNorm: norm(b),
    dot: dot(a, b),
    angle: radians === null ? null : (radians * 180) / Math.PI,
    projection: project(a, b),
  };
}

export function limitComponents(v: Vector2): Vector2 {
  finite(v.x, v.y);
  return { x: Math.max(-5, Math.min(5, v.x)), y: Math.max(-5, Math.min(5, v.y)) };
}
