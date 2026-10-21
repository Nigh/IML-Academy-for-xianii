export interface Vector2 {
  x: number;
  y: number;
}
export function finite(...values: number[]) {
  if (!values.every(Number.isFinite)) throw new RangeError('数值必须有限');
}
export function vector(x: number, y: number): Vector2 {
  finite(x, y);
  return { x, y };
}
export function add(a: Vector2, b: Vector2) {
  return vector(a.x + b.x, a.y + b.y);
}
export function subtract(a: Vector2, b: Vector2) {
  return vector(a.x - b.x, a.y - b.y);
}
export function scale(a: Vector2, k: number) {
  finite(k);
  return vector(a.x * k, a.y * k);
}
export function dot(a: Vector2, b: Vector2) {
  finite(a.x, a.y, b.x, b.y);
  const n = a.x * b.x + a.y * b.y;
  finite(n);
  return n;
}
export function norm(a: Vector2) {
  finite(a.x, a.y);
  const length = Math.hypot(a.x, a.y);
  finite(length);
  return length;
}
export function normalize(a: Vector2): Vector2 | null {
  const n = norm(a);
  return n === 0 ? null : vector(a.x / n, a.y / n);
}
export function angle(a: Vector2, b: Vector2): number | null {
  const u = normalize(a),
    v = normalize(b);
  return u && v ? Math.acos(Math.max(-1, Math.min(1, dot(u, v)))) : null;
}
export function project(a: Vector2, b: Vector2): Vector2 | null {
  const u = normalize(b);
  return u ? scale(u, dot(a, u)) : null;
}
