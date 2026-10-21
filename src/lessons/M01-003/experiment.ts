export const presets = [
  {
    id: 'original',
    name: '场景一：(2,3,4)',
    description: '2 批、3 时刻、4 通道，24 个元素。',
    shape: [2, 3, 4],
  },
  {
    id: 'reinterpreted',
    name: '场景一对照：(3,2,4)',
    description: '仍是 24 个元素，但批次和时间语义不同；这不是自动转置。',
    shape: [3, 2, 4],
  },
  {
    id: 'single',
    name: '场景二：单通道',
    description: '8 批、100 时刻、1 通道，共 800 个元素。',
    shape: [8, 100, 1],
  },
  {
    id: 'triple',
    name: '场景二对照：三通道',
    description: '通道增至 3，共 2400 个元素。',
    shape: [8, 100, 3],
  },
] as const;
export function experiment(shape: readonly number[], batch = 0, start = 0) {
  if (
    shape.length !== 3 ||
    shape.some((n, i) => !Number.isInteger(n) || n < 1 || n > [8, 100, 8][i])
  )
    throw new RangeError('形状必须是三个正整数：B≤8、T≤100、C≤8。');
  const [B, T, C] = shape;
  if (
    !Number.isInteger(batch) ||
    batch < 0 ||
    batch >= B ||
    !Number.isInteger(start) ||
    start < 0 ||
    start >= T
  )
    throw new RangeError('切片索引越界。');
  const rows = Math.min(8, T - start);
  const values = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: C }, (_, c) => (batch * T + start + r) * C + c),
  );
  const offset = Math.min(8, B * T * C - 1);
  return {
    count: B * T * C,
    bytes: B * T * C * 4,
    values,
    rows,
    offset,
    coordinates: [Math.floor(offset / (T * C)), Math.floor(offset / C) % T, offset % C],
  };
}
