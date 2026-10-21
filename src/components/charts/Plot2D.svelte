<script lang="ts">
  import { mapping, validRange, type Range } from '../../lib/math/coordinates.ts';
  import type { PlotSeries, ReferenceLine } from './types.ts';
  let {
    series,
    xRange,
    yRange,
    xLabel,
    yLabel,
    description,
    title = '',
    xUnit = '',
    yUnit = '',
    grid = true,
    references = [],
    highlight,
    onselect,
  }: {
    series: PlotSeries[];
    xRange: Range;
    yRange: Range;
    xLabel: string;
    yLabel: string;
    description: string;
    title?: string;
    xUnit?: string;
    yUnit?: string;
    grid?: boolean;
    references?: ReferenceLine[];
    highlight?: Range;
    onselect?: (seriesId: string, index: number) => void;
  } = $props();
  const uid = $props.id();
  const model = $derived.by(() => {
    try {
      validRange(xRange);
      validRange(yRange);
      if (highlight) {
        if (!highlight.every(Number.isFinite) || highlight[0] > highlight[1]) return null;
      }
      if (
        references.some((r) => !Number.isFinite(r.value)) ||
        new Set(series.map((s) => s.id)).size !== series.length
      )
        return null;
      if (
        series.some(
          (s) =>
            s.points.length > 2000 ||
            s.points.some(
              (p) =>
                !Number.isFinite(p.x) ||
                !Number.isFinite(p.y) ||
                (p.width !== undefined && (!Number.isFinite(p.width) || p.width <= 0)),
            ),
        )
      )
        return null;
      return mapping(xRange, yRange, 500, 280);
    } catch {
      return null;
    }
  });
  let detail = $state('');
  const fmt = (n: number) => Number(n.toPrecision(4)).toString();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal chart scrolling.) -->
<figure class="plot" tabindex="0" aria-label={title || description}>
  {#if title}<figcaption>{title}</figcaption>{/if}
  {#if !model}<p role="status">图表数据无效或超过每序列 2000 点，请检查坐标范围和有限数值。</p>
  {:else if !series.some((s) => s.points.length)}<p role="status">暂无数据。</p>
  {:else}
    <svg viewBox="0 0 620 370" role="img" aria-labelledby={`${uid}-title`}>
      <title id={`${uid}-title`}>{description}</title>
      <defs><clipPath id={`${uid}-clip`}><rect width="500" height="280" /></clipPath></defs>
      <g transform="translate(75 25)">
        {#each Array.from({ length: 6 }, (_, i) => i) as i (i)}
          {@const x = xRange[0] + ((xRange[1] - xRange[0]) * i) / 5}{@const y =
            yRange[0] + ((yRange[1] - yRange[0]) * i) / 5}
          {#if grid}<path
              d={`M${i * 100},0V280 M0,${280 - i * 56}H500`}
              class="grid-line"
              fill="none"
            />{/if}
          <text x={i * 100} y="302" text-anchor="middle">{fmt(x)}</text><text
            x="-10"
            y={284 - i * 56}
            text-anchor="end">{fmt(y)}</text
          >
        {/each}
        <path d="M0,0V280H500" class="axis-line" fill="none" />
        <g clip-path={`url(#${uid}-clip)`}>
          {#if highlight}<rect
              x={model.toScreen({ x: highlight[0], y: 0 }).x}
              y="0"
              width={Math.max(
                0,
                model.toScreen({ x: highlight[1], y: 0 }).x -
                  model.toScreen({ x: highlight[0], y: 0 }).x,
              )}
              height="280"
              fill="var(--color-accent)"
              opacity="0.12"
            />{/if}
          {#each references as r (r)}{@const p = model.toScreen({ x: r.value, y: r.value })}<line
              x1={r.axis === 'x' ? p.x : 0}
              x2={r.axis === 'x' ? p.x : 500}
              y1={r.axis === 'y' ? p.y : 0}
              y2={r.axis === 'y' ? p.y : 280}
              stroke="currentColor"
              stroke-dasharray="3 5"><title>{r.label}: {r.value}</title></line
            >{/each}
          {#each series as s, si (s.id)}
            {#if s.kind === 'line' || s.kind === 'step'}
              <path
                data-series={s.id}
                d={s.points
                  .map((p, i) => {
                    const q = model!.toScreen(p);
                    return i === 0
                      ? `M${q.x},${q.y}`
                      : s.kind === 'step'
                        ? `H${q.x}V${q.y}`
                        : `L${q.x},${q.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={`var(--color-${s.role})`}
                stroke-width="2.5"
                stroke-dasharray={si % 2 ? '7 4' : undefined}
              />
            {/if}
            {#if s.kind === 'scatter'}{#each s.points as p (p)}{@const q = model.toScreen(p)}<circle
                  cx={q.x}
                  cy={q.y}
                  r="5"
                  fill={`var(--color-${s.role})`}
                  opacity={s.role === 'secondary' ? 0.55 : 1}
                  ><title>{s.label}: {p.x}, {p.y}</title></circle
                >{/each}{/if}
            {#if s.kind === 'bar'}
              {#each s.points as p (p)}{@const q = model.toScreen(p)}{@const zero = model.toScreen({
                  x: p.x,
                  y: 0,
                })}<rect
                  x={q.x - (p.width ? (p.width * 500) / (xRange[1] - xRange[0]) : 6) / 2}
                  y={Math.min(q.y, zero.y)}
                  width={p.width ? (p.width * 500) / (xRange[1] - xRange[0]) : 6}
                  height={Math.abs(q.y - zero.y)}
                  fill={`var(--color-${s.role})`}
                  opacity={s.role === 'secondary' ? 0.55 : 1}
                  ><title>{s.label}: {p.x}, {p.y}</title></rect
                >{/each}
            {/if}
          {/each}
        </g>
        <text x="250" y="333" text-anchor="middle">{xLabel}{xUnit ? ` (${xUnit})` : ''}</text>
        <text transform="translate(-58 140) rotate(-90)" text-anchor="middle"
          >{yLabel}{yUnit ? ` (${yUnit})` : ''}</text
        >
      </g>
    </svg>
    <div class="legend">
      {#each series as s, i (s.id)}<span
          ><span style={`color:var(--color-${s.role})`}>{i % 2 ? '┄' : '━'}</span> {s.label}</span
        >{/each}{#each references as r (r)}<span>{r.label} = {fmt(r.value)}</span>{/each}
    </div>
    <label
      >查看数据序列<select
        class="select"
        onchange={(e) => {
          const s = series[Number(e.currentTarget.value)];
          detail = s?.points[0]
            ? `${s.label}: x=${fmt(s.points[0].x)}, y=${fmt(s.points[0].y)}`
            : '';
        }}
        ><option value="">选择序列</option>{#each series as s, i (s.id)}<option value={i}
            >{s.label}</option
          >{/each}</select
      ></label
    >
    {#each series as s (s.id)}
      <details>
        <summary>{s.label} · 数值与键盘查看（{s.points.length} 点）</summary>
        <input
          type="range"
          min="0"
          max={Math.max(0, s.points.length - 1)}
          value="0"
          aria-label={`${s.label} 数据点`}
          oninput={(e) => {
            const i = e.currentTarget.valueAsNumber,
              p = s.points[i];
            if (p) {
              detail = `${s.label}: x=${fmt(p.x)}, y=${fmt(p.y)}`;
              onselect?.(s.id, i);
            }
          }}
        />
        <p>{s.points[0] ? `首点 (${fmt(s.points[0].x)}, ${fmt(s.points[0].y)})` : '无数据'}</p>
      </details>
    {/each}
    <output aria-live="polite">{detail}</output>
  {/if}
  <p>{description}</p>
</figure>

<style>
  .plot {
    margin: 1rem 0;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
  }
  .plot svg {
    width: 100%;
    min-width: 480px;
    height: auto;
    display: block;
    color: var(--color-base-content);
  }
  text {
    fill: currentColor;
    font-size: 14px;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: var(--font-size-sm);
  }
  select {
    max-width: 100%;
  }
  summary {
    cursor: pointer;
  }
  output {
    display: block;
    min-height: 1.5em;
  }
  figcaption {
    font-weight: 600;
  }
</style>
