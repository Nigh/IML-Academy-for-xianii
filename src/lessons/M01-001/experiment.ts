import { finite, norm, vector, type Vector2 } from '../../lib/math/vector.ts';

export const presets = [
  {
    id: 'displacement',
    name: '场景一：温度与位移',
    description: '25°C 不需要方向；(3,4)m 还需要坐标轴。',
    x: 3,
    y: 4,
    degrees: 0,
  },
  {
    id: 'rotated',
    name: '场景二：坐标轴旋转 90°',
    description: '保持物理位移不动，新坐标变为 (4,−3)m，长度仍为 5m。',
    x: 3,
    y: 4,
    degrees: 90,
  },
  {
    id: 'zero',
    name: '场景三：零位移',
    description: '分量和长度为零，方向没有定义。',
    x: 0,
    y: 0,
    degrees: 90,
  },
] as const;

export function experiment(x: number, y: number, degrees: number) {
  finite(x, y, degrees);
  if (Math.abs(x) > 5 || Math.abs(y) > 5 || Math.abs(degrees) > 180)
    throw new RangeError('位移分量需在 −5 至 5m，坐标轴角度需在 −180 至 180°。');
  const radians = (degrees * Math.PI) / 180;
  const c = Math.cos(radians),
    s = Math.sin(radians);
  const original = vector(x, y);
  const components = vector(c * x + s * y, -s * x + c * y);
  const length = norm(original);
  return {
    original,
    components,
    length,
    basisX: vector(c, s),
    basisY: vector(-s, c),
    direction: length === 0 ? null : (Math.atan2(y, x) * 180) / Math.PI,
    reconstructed: vector(c * components.x - s * components.y, s * components.x + c * components.y),
  };
}

export function formatVector(v: Vector2) {
  const f = (n: number) => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(3);
  return `(${f(v.x)}, ${f(v.y)}) m`;
}
