import {
  density,
  cdf,
  moments,
  sample,
  statistics,
  histogram,
  validate,
  type Distribution,
} from '../../lib/math/probability.ts';
export { type Distribution };
export function diceCDF(x: number) {
  if (!Number.isFinite(x)) throw new RangeError('阈值必须有限');
  return Math.max(0, Math.min(6, Math.floor(x))) / 6;
}
export function distributionExperiment(d: Distribution, count: number, seed: number) {
  validate(d);
  const samples = sample(d, count, seed),
    stats = statistics(samples),
    theory = moments(d);
  const discrete = d.kind === 'bernoulli' || d.kind === 'binomial';
  const range: [number, number] =
    d.kind === 'normal'
      ? [-15, 15]
      : d.kind === 'uniform'
        ? [d.a - 0.2 * (d.b - d.a), d.b + 0.2 * (d.b - d.a)]
        : [-1, (d.kind === 'binomial' ? d.n : 1) + 1];
  const xs = discrete
    ? Array.from({ length: (d.kind === 'binomial' ? d.n : 1) + 3 }, (_, i) => i - 1)
    : Array.from({ length: 601 }, (_, i) => range[0] + ((range[1] - range[0]) * i) / 600);
  const mass =
      d.kind === 'uniform'
        ? [
            { x: range[0], y: 0 },
            { x: d.a, y: 0 },
            { x: d.a, y: 1 / (d.b - d.a) },
            { x: d.b, y: 1 / (d.b - d.a) },
            { x: d.b, y: 0 },
            { x: range[1], y: 0 },
          ]
        : xs.map((x) => ({ x, y: density(d, x) })),
    cumulative = xs.map((x) => ({ x, y: cdf(d, x) }));
  const empirical = discrete
    ? xs.map((x) => ({ x, y: samples.filter((s) => s === x).length / count }))
    : histogram(samples, 20).map((b) => ({ x: b.x, y: b.density, width: b.hi - b.lo }));
  return { samples, stats, theory, discrete, range, mass, cumulative, empirical };
}
export const presets = [
  {
    id: 'normal',
    name: '正态基准',
    description: '保持 seed 不变，比较位置和尺度。',
    d: { kind: 'normal', mu: 0, sigma: 1 } as Distribution,
    count: 100,
  },
  {
    id: 'mean',
    name: '均值平移',
    description: 'μ 从 0 改为 2，曲线平移，方差不变。',
    d: { kind: 'normal', mu: 2, sigma: 1 } as Distribution,
    count: 100,
  },
  {
    id: 'scale',
    name: '标准差加倍',
    description: 'σ 从 1 改为 2，曲线变宽，峰值减半。',
    d: { kind: 'normal', mu: 0, sigma: 2 } as Distribution,
    count: 100,
  },
  {
    id: 'binomial',
    name: '二项计数',
    description: 'n=10，比较 p=0.2 与手动改为 0.8 后的镜像。',
    d: { kind: 'binomial', n: 10, p: 0.2 } as Distribution,
    count: 100,
  },
  {
    id: 'large',
    name: '增加样本量',
    description: '正态基准的样本数增加至 2000；统计稳定性通常改善，但不保证每次单调接近理论值。',
    d: { kind: 'normal', mu: 0, sigma: 1 } as Distribution,
    count: 2000,
  },
  {
    id: 'bernoulli',
    name: '少量二元试验',
    description: '20 次试验的经验比例经常偏离 p=0.5。更换 seed 观察波动。',
    d: { kind: 'bernoulli', p: 0.5 } as Distribution,
    count: 20,
  },
];
