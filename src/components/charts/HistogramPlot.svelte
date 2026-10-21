<script lang="ts">
  import Plot2D from './Plot2D.svelte';
  import { histogram } from '../../lib/math/probability.ts';
  import type { PlotSeries } from './types.ts';
  let {
    samples,
    bins = 20,
    mode = 'density',
    theory = [],
  }: {
    samples: number[];
    bins?: number;
    mode?: 'count' | 'frequency' | 'density';
    theory?: { x: number; y: number }[];
  } = $props();
  const data = $derived.by(() => {
    try {
      return histogram(samples, bins);
    } catch {
      return [];
    }
  });
  const series = $derived<PlotSeries[]>([
    {
      id: 'histogram',
      label: `采样直方图 · ${mode}`,
      kind: 'bar',
      points: data.map((b) => ({ x: b.x, y: b[mode], width: b.hi - b.lo })),
      role: 'secondary',
    },
    ...(theory.length
      ? [
          {
            id: 'theory',
            label: '理论参考（相同纵轴单位）',
            kind: 'line' as const,
            points: theory,
            role: 'primary' as const,
          },
        ]
      : []),
  ]);
</script>

<Plot2D
  {series}
  xRange={data.length ? [data[0].lo, data[data.length - 1].hi] : [0, 1]}
  yRange={[0, Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.y))) * 1.1]}
  xLabel="观测值 x"
  yLabel={mode === 'count' ? '计数' : mode === 'frequency' ? '相对频率' : '概率密度'}
  description="每个 bin 的计数总和等于样本量；密度乘 bin 宽度后才是相对频率。"
/>
