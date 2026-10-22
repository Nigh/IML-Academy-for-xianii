import type { PlotSeries } from '../../components/charts/types.ts';
export const presets = [
  {
    id: 'one',
    name: '场景一：只保留一项',
    description: 'diag(3,1)，k=1，Frobenius误差1。',
    mode: 'diagonal',
    tail: 1,
    k: 1,
  },
  {
    id: 'full',
    name: '场景二：保留全部项',
    description: 'k=2恢复原矩阵，误差为0。',
    mode: 'diagonal',
    tail: 1,
    k: 2,
  },
  {
    id: 'dense',
    name: '场景三：混合坐标',
    description: '正交换轴后矩阵稠密，但尾奇异值仍决定误差。',
    mode: 'dense',
    tail: 1,
    k: 1,
  },
  {
    id: 'exact',
    name: '场景四：原矩阵秩1',
    description: '第二奇异值本来为0，k=1可无损重构。',
    mode: 'dense',
    tail: 0,
    k: 1,
  },
];
export function experiment(mode: string, tail: number, k: number) {
  if (
    !['diagonal', 'dense'].includes(mode) ||
    !Number.isFinite(tail) ||
    tail < 0 ||
    tail > 3 ||
    !Number.isInteger(k) ||
    k < 0 ||
    k > 2
  )
    throw new RangeError('模型无效；σ₂须在0–3内，k须为0、1或2。');
  const make = (a: number, b: number) =>
    mode === 'diagonal'
      ? [
          [a, 0],
          [0, b],
        ]
      : [
          [(a + b) / 2, (a - b) / 2],
          [(a - b) / 2, (a + b) / 2],
        ];
  const matrix = make(3, tail),
    first = make(3, 0),
    second = make(0, tail),
    approximation = make(k >= 1 ? 3 : 0, k >= 2 ? tail : 0);
  const residual = matrix.map((r, i) => r.map((n, j) => n - approximation[i][j]));
  const error = Math.hypot(...residual.flat()),
    expected = k === 0 ? Math.hypot(3, tail) : k === 1 ? tail : 0;
  const energy = 1 - error ** 2 / (9 + tail ** 2);
  const errors = [Math.hypot(3, tail), tail, 0];
  const series: PlotSeries[] = [
    {
      id: 'errors',
      label: '解析最优误差',
      kind: 'line',
      points: errors.map((y, x) => ({ x, y })),
      role: 'primary',
    },
    {
      id: 'selected',
      label: '当前保留项数',
      kind: 'scatter',
      points: [{ x: k, y: error }],
      role: 'accent',
    },
  ];
  return {
    matrix,
    first,
    second,
    approximation,
    residual,
    error,
    expected,
    energy,
    errors,
    series,
    rank: 1 + Number(tail > 0),
    retainedRank: Number(k > 0) + Number(k > 1 && tail > 0),
  };
}
