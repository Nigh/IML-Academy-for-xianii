export const presets = [
  {
    id: 'rectangular',
    name: '场景一：2×3 乘 3×2',
    description: '内维度3相同，结果2×2，每格是三个乘积之和。',
    a: [
      [1, 2, 3],
      [4, 5, 6],
    ],
    b: [
      [7, 8],
      [9, 10],
      [11, 12],
    ],
  },
  {
    id: 'order',
    name: '场景二：剪切与缩放',
    description: '两者均为2×2，AB与BA形状相同但数值不同。',
    a: [
      [1, 1],
      [0, 1],
    ],
    b: [
      [2, 0],
      [0, 1],
    ],
  },
];
function validate(a: readonly (readonly number[])[]) {
  if (
    !a.length ||
    a.length > 3 ||
    !a[0].length ||
    a[0].length > 3 ||
    a.some(
      (r) => r.length !== a[0].length || r.some((n) => !Number.isFinite(n) || Math.abs(n) > 1e6),
    )
  )
    throw new RangeError('矩阵须为1至3行列的非空矩形，有限元素范围±1e6。');
}
export function multiply(a: readonly (readonly number[])[], b: readonly (readonly number[])[]) {
  validate(a);
  validate(b);
  if (a[0].length !== b.length) throw new RangeError('左列数必须等于右行数。');
  return a.map((row) => b[0].map((_, j) => row.reduce((s, n, k) => s + n * b[k][j], 0)));
}
export function experiment(a: number[][], b: number[][], i: number, j: number) {
  const product = multiply(a, b);
  if (
    !Number.isInteger(i) ||
    !Number.isInteger(j) ||
    i < 0 ||
    j < 0 ||
    i >= product.length ||
    j >= product[0].length
  )
    throw new RangeError('结果单元格越界。');
  const reverse = b[0].length === a.length ? multiply(b, a) : null;
  return {
    product,
    reverse,
    terms: a[i].map((n, k) => n * b[k][j]),
    row: [...a[i]],
    column: b.map((r) => r[j]),
  };
}
