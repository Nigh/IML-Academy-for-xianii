import { finite } from '../math/vector.ts';
export interface Objective {
  value: (x: readonly number[]) => number;
  gradient: (x: readonly number[]) => number[];
}
export interface DescentPoint {
  x: number[];
  loss: number;
  gradient: number[];
}
export type DescentStatus =
  'running' | 'stationary' | 'oscillating' | 'diverged' | 'invalid' | 'max-steps';
export function descend(
  objective: Objective,
  initial: number[],
  eta: number,
  maxSteps: number,
  tolerance = 1e-8,
) {
  finite(...initial, eta, tolerance);
  if (
    ![1, 2].includes(initial.length) ||
    eta <= 0 ||
    tolerance <= 0 ||
    !Number.isInteger(maxSteps) ||
    maxSteps < 1 ||
    maxSteps > 1000
  )
    throw new RangeError('初值维度 1/2，学习率为正，步数 1–1000');
  const history: DescentPoint[] = [];
  let status: DescentStatus = 'running';
  let x = [...initial];
  for (let t = 0; t <= maxSteps; t++) {
    const loss = objective.value(x),
      gradient = objective.gradient(x);
    if (
      !Number.isFinite(loss) ||
      gradient.length !== x.length ||
      !gradient.every(Number.isFinite) ||
      !x.every(Number.isFinite)
    ) {
      status = 'invalid';
      break;
    }
    history.push({ x: [...x], loss, gradient });
    if (Math.hypot(...gradient) <= tolerance) {
      status = 'stationary';
      break;
    }
    if (Math.hypot(...x) > 1e6 || Math.abs(loss) > 1e12) {
      status = 'diverged';
      break;
    }
    if (
      t >= 2 &&
      Math.hypot(...x.map((v, i) => v - history[t - 2].x[i])) <= tolerance &&
      Math.hypot(...x.map((v, i) => v - history[t - 1].x[i])) > 10 * tolerance
    ) {
      status = 'oscillating';
      break;
    }
    if (t === maxSteps) {
      status = 'max-steps';
      break;
    }
    x = x.map((v, i) => v - eta * gradient[i]);
  }
  return { history, status };
}
