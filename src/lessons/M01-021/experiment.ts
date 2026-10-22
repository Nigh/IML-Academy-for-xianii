export const presets = [
  {
    id: 'channels',
    name: '场景一：逐通道偏置',
    description: '(2,3,4)+(4,)→(2,3,4)。',
    a: '2,3,4',
    b: '4',
  },
  { id: 'outer', name: '场景二：行列扩展', description: '(3,1)+(1,4)→(3,4)。', a: '3,1', b: '1,4' },
  {
    id: 'invalid',
    name: '场景二对照：尾轴不兼容',
    description: '(3,)+(4,)无法广播。',
    a: '3',
    b: '4',
  },
  {
    id: 'semantic',
    name: '场景三：形状对但语义待定',
    description: '(2,3,3)+(3,)合法，但只对最后一轴相加。',
    a: '2,3,3',
    b: '3',
  },
];
function validate(s: readonly number[]) {
  if (s.length < 1 || s.length > 3 || s.some((n) => !Number.isInteger(n) || n < 1 || n > 4))
    throw new RangeError('形状须1–3轴，每轴整数1–4；不含空轴和标量。');
}
export function parseShape(text: string) {
  if (!/^\s*\d+\s*(,\s*\d+\s*){0,2}$/.test(text))
    throw new RangeError('用逗号分隔1–3个整数，例如2,3,4。');
  const s = text.split(',').map(Number);
  validate(s);
  return s;
}
export function broadcastShape(a: readonly number[], b: readonly number[]) {
  validate(a);
  validate(b);
  const n = Math.max(a.length, b.length),
    left = [...Array(n - a.length).fill(1), ...a] as number[],
    right = [...Array(n - b.length).fill(1), ...b] as number[];
  const shape = left.map((x, i) => {
    const y = right[i];
    if (x !== y && x !== 1 && y !== 1)
      throw new RangeError(`尾部对齐后第${i + 1}轴不兼容：${x}与${y}既不相等也没有1。`);
    return Math.max(x, y);
  });
  return { shape, left, right };
}
const product = (s: readonly number[]) => s.reduce((n, d) => n * d, 1);
function coordinates(flat: number, shape: readonly number[]) {
  return shape.map((_, i) => Math.floor(flat / product(shape.slice(i + 1))) % shape[i]);
}
function source(index: readonly number[], shape: readonly number[]) {
  const own = index.slice(index.length - shape.length).map((n, i) => (shape[i] === 1 ? 0 : n));
  return { index: own, flat: own.reduce((n, d, i) => n + d * product(shape.slice(i + 1)), 0) };
}
export function experiment(a: readonly number[], b: readonly number[], offset: number) {
  if (!Number.isFinite(offset) || Math.abs(offset) > 10)
    throw new RangeError('偏置起点须有限且在±10。');
  const alignment = broadcastShape(a, b);
  const rows = Array.from({ length: product(alignment.shape) }, (_, flat) => {
    const index = coordinates(flat, alignment.shape),
      left = source(index, a),
      right = source(index, b);
    const av = left.flat,
      bv = offset + right.flat;
    return { flat, index, left, right, av, bv, value: av + bv };
  });
  return { ...alignment, rows };
}
