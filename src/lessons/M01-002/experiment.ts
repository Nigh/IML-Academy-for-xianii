export interface Vector {
  x: number;
  y: number;
}
export function vector(x: number, y: number): Vector {
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError('向量分量必须是有限数值');
  return { x, y };
}
export function add(a: Vector, b: Vector): Vector {
  vector(a.x, a.y);
  vector(b.x, b.y);
  return vector(a.x + b.x, a.y + b.y);
}
export function scale(a: Vector, k: number): Vector {
  vector(a.x, a.y);
  if (!Number.isFinite(k)) throw new RangeError('数乘系数必须有限');
  return vector(a.x * k, a.y * k);
}
export function magnitude(a: Vector) {
  vector(a.x, a.y);
  return Math.hypot(a.x, a.y);
}
