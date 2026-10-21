export const presets = [
  {
    id: 'dependent',
    name: '场景一：两列成倍数',
    description: '[[1,2],[2,4]]只有一个独立输出方向，秩1。',
    mode: 'dependent',
    epsilon: 1,
    tolerance: 1e-6,
  },
  {
    id: 'identity',
    name: '场景二：单位矩阵',
    description: '两个奇异值均为1，精确秩与数值秩均为2。',
    mode: 'diagonal',
    epsilon: 1,
    tolerance: 1e-6,
  },
  {
    id: 'small',
    name: '场景二对照：微小奇异值',
    description: '第二奇异值1e−8非零，但小于相对阈值1e−6；精确秩2，数值秩1。',
    mode: 'diagonal',
    epsilon: 1e-8,
    tolerance: 1e-6,
  },
  {
    id: 'zero',
    name: '场景三：精确消去一维',
    description: '第二奇异值恰为0，精确秩也降到1。',
    mode: 'diagonal',
    epsilon: 0,
    tolerance: 1e-6,
  },
];
export function experiment(mode: string, epsilon: number, tolerance: number) {
  if (
    !['dependent', 'diagonal'].includes(mode) ||
    !Number.isFinite(epsilon) ||
    epsilon < 0 ||
    epsilon > 1 ||
    !Number.isFinite(tolerance) ||
    tolerance < 1e-12 ||
    tolerance > 0.5
  )
    throw new RangeError('ε在0至1，相对阈值τ在1e−12至0.5。');
  const matrix =
    mode === 'dependent'
      ? [
          [1, 2],
          [2, 4],
        ]
      : [
          [1, 0],
          [0, epsilon],
        ];
  const singular = mode === 'dependent' ? [5, 0] : [1, epsilon],
    threshold = tolerance * singular[0];
  return {
    matrix,
    singular,
    threshold,
    exactRank: mode === 'dependent' || epsilon === 0 ? 1 : 2,
    numericalRank: singular.filter((s) => s > threshold).length,
    columns: [
      { x: matrix[0][0], y: matrix[1][0] },
      { x: matrix[0][1], y: matrix[1][1] },
    ],
    hiddenSecond: mode === 'diagonal' && epsilon < 1e-6,
    range: mode === 'dependent' ? 5 : 1.25,
  };
}
