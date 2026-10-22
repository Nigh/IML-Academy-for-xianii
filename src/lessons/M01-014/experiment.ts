export const presets = [
  {
    id: 'kernel',
    name: '场景一：被消去的方向',
    description: '[1,1]把(1,−1)映射为0。',
    mode: 'row',
    d: 0,
    t: 1,
  },
  {
    id: 'full',
    name: '场景二：满列秩',
    description: '单位矩阵的零空间只有零向量。',
    mode: 'identity',
    d: 0,
    t: 0,
  },
  {
    id: 'dependent',
    name: '场景二对照：降秩',
    description: '两行成倍数，零空间维度恢复为1。',
    mode: 'dependent',
    d: 0,
    t: 1,
  },
  {
    id: 'family',
    name: '场景三：同一输出的一族输入',
    description: '沿零空间方向移动，输出一直为2。',
    mode: 'row',
    d: 2,
    t: 1,
  },
];
export function experiment(mode: string, d: number, t: number) {
  if (
    !['row', 'identity', 'dependent'].includes(mode) ||
    !Number.isFinite(d) ||
    Math.abs(d) > 4 ||
    !Number.isFinite(t) ||
    Math.abs(t) > 3
  )
    throw new RangeError('矩阵类型无效，d须在±4、t须在±3内且有限。');
  const matrix =
    mode === 'row'
      ? [[1, 1]]
      : mode === 'identity'
        ? [
            [1, 0],
            [0, 1],
          ]
        : [
            [1, 1],
            [2, 2],
          ];
  const rank = mode === 'identity' ? 2 : 1;
  const direction = mode === 'identity' ? { x: 0, y: 0 } : { x: 1, y: -1 };
  const particular = mode === 'identity' ? { x: d, y: 0 } : { x: d / 2, y: d / 2 };
  const x = { x: particular.x + t * direction.x, y: particular.y + t * direction.y };
  const output = matrix.map((r) => r[0] * x.x + r[1] * x.y);
  const rhs = mode === 'row' ? [d] : mode === 'identity' ? [d, 0] : [d, 2 * d];
  const residual = Math.hypot(...output.map((n, i) => n - rhs[i]));
  const extent =
    1.4 * Math.max(1, Math.abs(x.x), Math.abs(x.y), Math.abs(particular.x), Math.abs(particular.y));
  return {
    matrix,
    rank,
    nullity: 2 - rank,
    direction,
    particular,
    x,
    output,
    rhs,
    residual,
    range: extent,
  };
}
