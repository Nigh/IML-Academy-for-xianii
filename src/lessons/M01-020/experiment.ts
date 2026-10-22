import type { PlotSeries } from '../../components/charts/types.ts';
export const presets = [
  {
    id: 'three',
    name: '场景一：三点直线拟合',
    description: '非零残差，但Aᵀr近零。',
    extra: false,
    delta: 0,
  },
  {
    id: 'four',
    name: '场景二对照：加入普通点',
    description: '增加(t,b)=(2,3)，比较系数与平方损失。',
    extra: true,
    delta: 0,
  },
  {
    id: 'outlier',
    name: '场景二：加入离群点',
    description: '第四点提高到9，平方损失牵动整条拟合线。',
    extra: true,
    delta: 6,
  },
];
export function fit(points: readonly (readonly number[])[]) {
  if (
    points.length < 2 ||
    points.length > 20 ||
    points.some((p) => p.length !== 2 || p.some((n) => !Number.isFinite(n) || Math.abs(n) > 20))
  )
    throw new RangeError('须2–20个(t,b)点，分量有限且在±20。');
  const count = points.length,
    meanT = points.reduce((s, p) => s + p[0], 0) / count,
    meanY = points.reduce((s, p) => s + p[1], 0) / count;
  const denominator = points.reduce((s, p) => s + (p[0] - meanT) ** 2, 0);
  if (denominator < 1e-12) throw new RangeError('输入坐标变化太小，无法在本模型中稳定确定斜率。');
  const slope = points.reduce((s, p) => s + (p[0] - meanT) * (p[1] - meanY), 0) / denominator,
    intercept = meanY - slope * meanT;
  const predicted = points.map((p) => intercept + slope * p[0]),
    residual = predicted.map((n, i) => n - points[i][1]);
  const normal = [
    residual.reduce((s, n) => s + n, 0),
    residual.reduce((s, n, i) => s + n * points[i][0], 0),
  ];
  return {
    slope,
    intercept,
    predicted,
    residual,
    normal,
    sse: residual.reduce((s, n) => s + n * n, 0),
    matrix: points.map((p) => [1, p[0]]),
  };
}
export function candidate(extra: boolean, delta: number, intercept: number, slope: number) {
  if (![intercept, slope].every((n) => Number.isFinite(n) && Math.abs(n) <= 8))
    throw new RangeError('候选截距和斜率必须有限且在±8。');
  const optimal = experiment(extra, delta);
  const predicted = optimal.points.map(([t]) => intercept + slope * t);
  const residual = predicted.map((value, i) => value - optimal.points[i][1]);
  const series: PlotSeries = {
    id: 'candidate',
    label: '我的候选直线（实线）',
    kind: 'line',
    role: 'accent',
    points: [-1.5, 2.5].map((x) => ({ x, y: intercept + slope * x })),
  };
  const values = [...optimal.yRange, ...series.points.map((p) => p.y)];
  return {
    predicted,
    residual,
    sse: residual.reduce((sum, value) => sum + value * value, 0),
    normal: [
      residual.reduce((sum, value) => sum + value, 0),
      residual.reduce((sum, value, i) => sum + value * optimal.points[i][0], 0),
    ],
    series,
    yRange: [Math.min(...values) - 0.5, Math.max(...values) + 0.5] as [number, number],
  };
}

export function experiment(extra: boolean, delta: number) {
  if (typeof extra !== 'boolean' || !Number.isFinite(delta) || Math.abs(delta) > 8)
    throw new RangeError('开关须布尔值，离群偏移须有限且在±8。');
  const points = [
    [-1, 0],
    [0, 1],
    [1, 3],
  ];
  const baseline = fit(points);
  if (extra) points.push([2, 3 + delta]);
  const result = fit(points);
  const line = (a: number, c: number) => [-1.5, 2.5].map((x) => ({ x, y: a * x + c }));
  const series: PlotSeries[] = [
    {
      id: 'observations',
      label: '观测（圆点）',
      kind: 'scatter',
      points: points.map((p) => ({ x: p[0], y: p[1] })),
      role: 'accent',
    },
    {
      id: 'fit',
      label: '当前最小二乘（虚线）',
      kind: 'line',
      points: line(result.slope, result.intercept),
      role: 'primary',
    },
    {
      id: 'baseline',
      label: '原三点拟合（实线）',
      kind: 'line',
      points: line(baseline.slope, baseline.intercept),
      role: 'secondary',
    },
  ];
  const all = series.flatMap((s) => s.points.map((p) => p.y)),
    low = Math.min(...all),
    high = Math.max(...all),
    pad = 0.15 * Math.max(2, high - low);
  return {
    ...result,
    points,
    baseline,
    series,
    yRange: [low - pad, high + pad] as [number, number],
  };
}
