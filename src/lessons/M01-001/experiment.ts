import { finite, norm, vector } from '../../lib/math/vector.ts';

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
    componentCorner: vector(c * components.x, s * components.x),
    direction: length === 0 ? null : (Math.atan2(y, x) * 180) / Math.PI,
    reconstructed: vector(c * components.x - s * components.y, s * components.x + c * components.y),
  };
}
