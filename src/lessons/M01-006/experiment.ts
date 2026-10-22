import { finite, vector, add, scale, norm } from '../../lib/math/vector.ts';
export const presets = [
  {
    id: 'basis',
    name: '场景一：独立二向量',
    description: '(1,0),(0,1) 是 R² 的一组基。',
    x: 0,
    y: 1,
    third: false,
  },
  {
    id: 'dependent',
    name: '场景一对照：共线二向量',
    description: '(1,0),(2,0) 有非平凡零组合。',
    x: 2,
    y: 0,
    third: false,
  },
  {
    id: 'three',
    name: '场景二：加入第三个向量',
    description: '三个平面向量必相关，秩仍最多2。',
    x: 0,
    y: 1,
    third: true,
  },
] as const;
export function experiment(x: number, y: number, third: boolean) {
  finite(x, y);
  if (Math.abs(x) > 2 || Math.abs(y) > 2 || typeof third !== 'boolean')
    throw new RangeError('分量范围−2至2，第三向量开关必须是布尔值。');
  const u = vector(1, 0),
    v = vector(x, y),
    w = vector(1, 1);
  const vectors = third ? [u, v, w] : [u, v];
  const coefficients = third ? [x - y, -1, y] : y === 0 ? [-x, 1] : null;
  const zero = coefficients
    ? vectors.reduce((sum, p, i) => add(sum, scale(p, coefficients[i])), vector(0, 0))
    : null;
  return {
    vectors,
    coefficients,
    zero,
    residual: zero ? norm(zero) : null,
    rank: third || y !== 0 ? 2 : 1,
    isBasis: !third && y !== 0,
    range: 1.35 * Math.max(1, Math.abs(x), Math.abs(y)),
  };
}

/** A bounded command sequence, evaluated in the same order as the displayed route. */
export function combineCommands(
  vectors: readonly { x: number; y: number }[],
  coefficients: readonly number[],
) {
  if (vectors.length < 1 || vectors.length > 3 || vectors.length !== coefficients.length)
    throw new RangeError('指令数量必须与一至三路驱动一致。');
  let endpoint = vector(0, 0);
  const path = [endpoint];
  for (let i = 0; i < vectors.length; i++) {
    finite(vectors[i].x, vectors[i].y, coefficients[i]);
    if (Math.abs(coefficients[i]) > 3) throw new RangeError('指令份数范围为−3至3。');
    endpoint = add(endpoint, scale(vectors[i], coefficients[i]));
    path.push(endpoint);
  }
  return {
    endpoint,
    path,
    nontrivial: coefficients.some((c) => c !== 0),
    returned: endpoint.x === 0 && endpoint.y === 0,
  };
}
