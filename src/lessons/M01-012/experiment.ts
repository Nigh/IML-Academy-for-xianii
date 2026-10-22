import type { Vector2 } from '../../lib/math/vector.ts';
export const presets = [
  {
    id: 'stretch',
    name: '场景一：横向拉伸',
    description: 'diag(2,1)把横向间距放大两倍，纵向不变。',
    matrix: [
      [2, 0],
      [0, 1],
    ],
  },
  {
    id: 'shear',
    name: '场景二：剪切方格',
    description: '[[1,1],[0,1]]把单位正方形变成平行四边形。',
    matrix: [
      [1, 1],
      [0, 1],
    ],
  },
  {
    id: 'collapse',
    name: '场景三：压成直线',
    description: 'diag(1,0)消去所有y分量；原点仍固定。',
    matrix: [
      [1, 0],
      [0, 0],
    ],
  },
];
export function transform(a: readonly (readonly number[])[], p: Vector2): Vector2 {
  if (
    a.length !== 2 ||
    a.some((r) => r.length !== 2 || r.some((n) => !Number.isFinite(n) || Math.abs(n) > 2)) ||
    ![p.x, p.y].every(Number.isFinite)
  )
    throw new RangeError('矩阵必须2×2，有限元素±2；点必须有限。');
  const x = a[0][0] * p.x + a[0][1] * p.y,
    y = a[1][0] * p.x + a[1][1] * p.y;
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError('输出溢出。');
  return { x, y };
}
export function experiment(a: number[][]) {
  transform(a, { x: 0, y: 0 });
  const before: Vector2[][] = [];
  for (const n of [-1, -0.5, 0, 0.5, 1]) {
    before.push(
      [
        { x: n, y: -1 },
        { x: n, y: 1 },
      ],
      [
        { x: -1, y: n },
        { x: 1, y: n },
      ],
    );
  }
  const after = before.map((line) => line.map((p) => transform(a, p)));
  const square = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];
  return {
    before,
    after,
    square,
    transformedSquare: square.map((p) => transform(a, p)),
    columns: [transform(a, { x: 1, y: 0 }), transform(a, { x: 0, y: 1 })],
    origin: transform(a, { x: 0, y: 0 }),
    extent: 1.35 * Math.max(1, ...after.flat().flatMap((p) => [Math.abs(p.x), Math.abs(p.y)])),
  };
}
