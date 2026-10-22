export const presets = [
  {
    id: 'x',
    name: '场景一：横轴特征方向',
    description: 'diag(2,3)把e₁放大2倍。',
    mode: 'diagonal',
    angle: 0,
  },
  {
    id: 'y',
    name: '场景一对照：纵轴特征方向',
    description: 'diag(2,3)把e₂放大3倍。',
    mode: 'diagonal',
    angle: 90,
  },
  {
    id: 'rotation',
    name: '场景二：旋转90°',
    description: '所有非零输入均被转到垂直方向，没有实特征向量。',
    mode: 'rotation',
    angle: 45,
  },
  {
    id: 'negative',
    name: '场景三：负特征值',
    description: 'diag(−1,2)在横轴上反向，仍是特征方向。',
    mode: 'reflection',
    angle: 0,
  },
];
export function experiment(mode: string, angle: number) {
  if (
    !['diagonal', 'rotation', 'reflection'].includes(mode) ||
    !Number.isFinite(angle) ||
    Math.abs(angle) > 180
  )
    throw new RangeError('模型无效；角度必须有限且在±180°内。');
  const matrix =
    mode === 'diagonal'
      ? [
          [2, 0],
          [0, 3],
        ]
      : mode === 'rotation'
        ? [
            [0, -1],
            [1, 0],
          ]
        : [
            [-1, 0],
            [0, 2],
          ];
  const a = (angle * Math.PI) / 180;
  const v =
    angle % 90 === 0
      ? [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 0, y: -1 },
        ][(((angle / 90) % 4) + 4) % 4]
      : { x: Math.cos(a), y: Math.sin(a) };
  const av = {
    x: matrix[0][0] * v.x + matrix[0][1] * v.y,
    y: matrix[1][0] * v.x + matrix[1][1] * v.y,
  };
  const rho = (v.x * av.x + v.y * av.y) / (v.x * v.x + v.y * v.y),
    parallel = { x: rho * v.x, y: rho * v.y };
  const residual = Math.hypot(av.x - parallel.x, av.y - parallel.y);
  const eigen = mode !== 'rotation' && angle % 90 === 0;
  return {
    matrix,
    v,
    av,
    rho,
    parallel,
    residual,
    eigen,
    eigenvalue: eigen ? rho : null,
    range: 1.4 * Math.max(1, Math.abs(av.x), Math.abs(av.y)),
  };
}
