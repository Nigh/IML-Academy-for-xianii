<script lang="ts">
  import Plot2D from './Plot2D.svelte';
  import type { PlotSeries } from './types.ts';
  import type { Range } from '../../lib/math/coordinates.ts';
  let {
    points,
    discrete = false,
    cumulative = false,
    xRange,
    yRange,
    mean,
    empirical = [],
    highlight,
    description,
  }: {
    points: { x: number; y: number }[];
    discrete?: boolean;
    cumulative?: boolean;
    xRange: Range;
    yRange: Range;
    mean?: number;
    empirical?: { x: number; y: number }[];
    highlight?: Range;
    description: string;
  } = $props();
  const series = $derived<PlotSeries[]>([
    {
      id: 'theory',
      label: cumulative ? '理论 CDF' : discrete ? '理论 PMF' : '理论 PDF',
      kind: cumulative && discrete ? 'step' : discrete && !cumulative ? 'bar' : 'line',
      points,
      role: 'primary',
    },
    ...(empirical.length
      ? [
          {
            id: 'empirical',
            label: '经验分布',
            kind: 'bar' as const,
            points: empirical,
            role: 'secondary' as const,
          },
        ]
      : []),
  ]);
</script>

<Plot2D
  {series}
  {xRange}
  {yRange}
  xLabel="观测值 x"
  yLabel={cumulative ? '累计概率' : discrete ? '概率质量' : '概率密度'}
  {description}
  {highlight}
  references={mean === undefined ? [] : [{ axis: 'x', value: mean, label: '理论均值' }]}
/>
