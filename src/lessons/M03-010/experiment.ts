import { descend, type Objective } from '../../lib/simulations/gradient.ts';
import { finite } from '../../lib/math/vector.ts';
import type { PlotSeries } from '../../components/charts/types.ts';
export type Mode = 'quadratic' | 'origin' | 'two' | 'nonconvex';
export function objective(mode: Mode, a = 1, b = 10): Objective {
  finite(a, b);
  if (a <= 0 || b <= 0) throw new RangeError('曲率必须为正');
  if (mode === 'two')
    return {
      value: ([x, y]) => a * x * x + b * y * y,
      gradient: ([x, y]) => [2 * a * x, 2 * b * y],
    };
  if (mode === 'nonconvex')
    return { value: ([x]) => (x * x - 1) ** 2, gradient: ([x]) => [4 * x * (x * x - 1)] };
  const center = mode === 'origin' ? 0 : 2,
    offset = mode === 'origin' ? 0 : 1;
  return { value: ([x]) => (x - center) ** 2 + offset, gradient: ([x]) => [2 * (x - center)] };
}
export function experiment(
  mode: Mode,
  x: number,
  y: number,
  eta: number,
  steps: number,
  a: number,
  b: number,
) {
  return descend(objective(mode, a, b), mode === 'two' ? [x, y] : [x], eta, steps);
}
export function contours(a: number, b: number): PlotSeries[] {
  finite(a, b);
  if (a <= 0 || b <= 0) throw new RangeError('曲率必须为正');
  return [1, 4, 16, 64].map((level, i) => ({
    id: `contour-${level}`,
    label: `f = ${level}`,
    kind: 'line',
    role: i % 2 ? 'secondary' : 'primary',
    points: Array.from({ length: 101 }, (_, j) => {
      const t = (2 * Math.PI * j) / 100;
      return { x: Math.sqrt(level / a) * Math.cos(t), y: Math.sqrt(level / b) * Math.sin(t) };
    }),
  }));
}
export function curve(mode: Mode) {
  const f = objective(mode);
  return Array.from({ length: 201 }, (_, i) => {
    const x = -5 + i * 0.05;
    return { x, y: f.value([x]) };
  });
}
export const presets = [
  { id: 'slow', name: '慢速收敛', description: 'η=0.05，每步误差乘 0.9。', eta: 0.05 },
  { id: 'fast', name: '快速收敛', description: 'η=0.5，一步到达最小点。', eta: 0.5 },
  { id: 'oscillation', name: '等幅振荡', description: 'η=1，非最优初值在两点之间往返。', eta: 1 },
  { id: 'divergence', name: '发散', description: 'η=1.1，误差幅值每步乘 1.2。', eta: 1.1 },
];
export const statusText = {
  running: '迭代中',
  stationary: '驻点：需另行判断是否为极小值',
  oscillating: '检测到两点振荡',
  diverged: '数值幅度超过安全上限：发散',
  invalid: '非有限数值：已停止',
  'max-steps': '达到最大迭代步数',
};
