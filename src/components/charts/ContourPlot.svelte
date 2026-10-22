<script lang="ts">
  import Plot2D from './Plot2D.svelte';
  import type { PlotSeries } from './types.ts';
  import type { Range } from '../../lib/math/coordinates.ts';
  let {
    contours,
    path,
    current,
    gradient,
    xRange,
    yRange,
    description,
  }: {
    contours: PlotSeries[];
    path: { x: number; y: number }[];
    current: { x: number; y: number };
    gradient?: { x: number; y: number };
    xRange: Range;
    yRange: Range;
    description: string;
  } = $props();
  const series = $derived<PlotSeries[]>([
    ...contours,
    { id: 'trajectory', label: '优化轨迹', kind: 'line', points: path, role: 'accent' },
    { id: 'current', label: '当前参数', kind: 'scatter', points: [current], role: 'accent' },
    ...(gradient
      ? [
          {
            id: 'gradient',
            label: '负梯度方向（显示长度已缩放）',
            kind: 'line' as const,
            points: [current, { x: current.x - gradient.x, y: current.y - gradient.y }],
            role: 'secondary' as const,
          },
        ]
      : []),
  ]);
</script>

<Plot2D equal {series} {xRange} {yRange} xLabel="参数 x" yLabel="参数 y" {description} />
