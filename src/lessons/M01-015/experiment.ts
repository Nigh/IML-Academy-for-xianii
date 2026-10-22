import type { PlotSeries } from '../../components/charts/types.ts';
export const presets = [
  {
    id: 'identity',
    name: '场景一：单位矩阵',
    description: '唯一解直接等于b。',
    mode: 'identity',
    b1: 2,
    b2: 1,
    t: 0,
  },
  {
    id: 'infinite',
    name: '场景二：重复约束',
    description: 'b=(2,4)，两式是同一条直线，无穷多解。',
    mode: 'dependent',
    b1: 2,
    b2: 4,
    t: 0,
  },
  {
    id: 'none',
    name: '场景二对照：矛盾约束',
    description: 'b=(2,3)，两条平行线不相交。',
    mode: 'dependent',
    b1: 2,
    b2: 3,
    t: 0,
  },
  {
    id: 'shear',
    name: '场景三：可逆剪切',
    description: '先消去第二分量的贡献，得到唯一解。',
    mode: 'shear',
    b1: 2,
    b2: 1,
    t: 0,
  },
];
export function experiment(mode: string, b1: number, b2: number, t: number) {
  if (
    !['identity', 'dependent', 'shear'].includes(mode) ||
    ![b1, b2, t].every(Number.isFinite) ||
    Math.abs(b1) > 4 ||
    Math.abs(b2) > 4 ||
    Math.abs(t) > 3
  )
    throw new RangeError('矩阵类型无效；b分量须在±4、t须在±3内且有限。');
  const matrix =
    mode === 'identity'
      ? [
          [1, 0],
          [0, 1],
        ]
      : mode === 'shear'
        ? [
            [1, 1],
            [0, 1],
          ]
        : [
            [1, 1],
            [2, 2],
          ];
  const inverse =
    mode === 'identity'
      ? [
          [1, 0],
          [0, 1],
        ]
      : mode === 'shear'
        ? [
            [1, -1],
            [0, 1],
          ]
        : null;
  const consistency = b2 - 2 * b1;
  const status = mode !== 'dependent' ? 'unique' : consistency === 0 ? 'infinite' : 'none';
  const solution =
    status === 'none'
      ? null
      : mode === 'identity'
        ? [b1, b2]
        : mode === 'shear'
          ? [b1 - b2, b2]
          : [b1 / 2 + t, b1 / 2 - t];
  const output = solution ? matrix.map((r) => r[0] * solution[0] + r[1] * solution[1]) : null;
  const residual = output ? Math.hypot(output[0] - b1, output[1] - b2) : null;
  const extent = 1.3 * Math.max(2, Math.abs(b1), Math.abs(b2), ...(solution ?? []).map(Math.abs));
  const line = (sum: number) => [
    { x: -extent, y: sum + extent },
    { x: extent, y: sum - extent },
  ];
  const first =
    mode === 'identity'
      ? [
          { x: b1, y: -extent },
          { x: b1, y: extent },
        ]
      : line(b1);
  const second =
    mode === 'dependent'
      ? line(b2 / 2)
      : [
          { x: -extent, y: b2 },
          { x: extent, y: b2 },
        ];
  const series: PlotSeries[] = [
    { id: 'first', label: '约束1（实线）', kind: 'line', points: first, role: 'primary' },
    { id: 'second', label: '约束2（虚线）', kind: 'line', points: second, role: 'secondary' },
    {
      id: 'solution',
      label: '当前解（圆点）',
      kind: 'scatter',
      points: solution ? [{ x: solution[0], y: solution[1] }] : [],
      role: 'accent',
    },
  ];
  return {
    matrix,
    inverse,
    status,
    solution,
    output,
    residual,
    consistency,
    series,
    extent,
    determinant: inverse ? 1 : 0,
  };
}

export function commandOutput(mode: string, first: number, second: number) {
  if (![first, second].every((n) => Number.isFinite(n) && Math.abs(n) <= 8))
    throw new RangeError('控制指令须有限且在±8内。');
  const { matrix } = experiment(mode, 0, 0, 0);
  return matrix.map((row) => row[0] * first + row[1] * second);
}
