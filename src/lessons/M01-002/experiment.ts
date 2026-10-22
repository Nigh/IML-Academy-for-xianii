export {
  vector,
  add,
  scale,
  norm as magnitude,
  type Vector2 as Vector,
} from '../../lib/math/vector.ts';

import { add, scale, subtract, norm, vector, type Vector2 } from '../../lib/math/vector.ts';

export const routeTasks = [
  { id: 'turn', name: '转向到站', via: vector(2, 1), end: vector(3, 3) },
  { id: 'return', name: '出发再返回', via: vector(2, -1), end: vector(0, 0) },
  { id: 'reverse', name: '反向放大', via: vector(-4, -2), end: vector(-5, 0) },
] as const;

export function routePosition(a: Vector2, b: Vector2, step: number): Vector2 {
  if (!Number.isInteger(step) || step < 0 || step > 20)
    throw new RangeError('步号须为 0–20 的整数');
  // Validate both commands even before the second segment starts.
  const end = add(a, b);
  if (step === 20) return end;
  return step <= 10 ? scale(a, step / 10) : add(a, scale(b, (step - 10) / 10));
}

export function assessRoute(a: Vector2, b: Vector2, task: { via: Vector2; end: Vector2 }) {
  const viaError = norm(subtract(a, task.via));
  const endError = norm(subtract(add(a, b), task.end));
  // Fixed metre-scale teaching tasks: 1e-8 m absorbs arithmetic roundoff, not machining error.
  return { viaError, endError, viaReached: viaError <= 1e-8, endReached: endError <= 1e-8 };
}
