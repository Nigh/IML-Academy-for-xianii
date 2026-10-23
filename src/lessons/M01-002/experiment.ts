import { add, finite, norm, scale, subtract, type Vector2 } from '../../lib/math/vector.ts';
import { validRange, type Range } from '../../lib/math/coordinates.ts';

export const RUN_SECONDS = 1;

export function twoMoves(a: Vector2, b: Vector2) {
  const end = add(a, b);
  const pathLength = norm(a) + norm(b);
  finite(pathLength);
  return { end, displacementLength: norm(end), pathLength };
}

/** Constant velocity for one positive second; k changes velocity, never time. */
export function speedMotion(referenceVelocity: Vector2, k: number) {
  const velocity = scale(referenceVelocity, k);
  const displacement = scale(velocity, RUN_SECONDS);
  return { velocity, displacement, pathLength: norm(displacement) };
}

export function predictionDistance(prediction: Vector2, end: Vector2) {
  return norm(subtract(prediction, end));
}

/** Same range on both axes preserves metres, including extreme and zero inputs. */
export function sceneRange(points: readonly Vector2[], speed: boolean): Range {
  let low = speed ? -5 : -3;
  let high = speed ? 5 : 4;
  for (const point of points) {
    norm(point);
    low = Math.min(low, Math.floor(point.x - 1), Math.floor(point.y - 1));
    high = Math.max(high, Math.ceil(point.x + 1), Math.ceil(point.y + 1));
  }
  const range: Range = [low, high];
  validRange(range);
  return range;
}
