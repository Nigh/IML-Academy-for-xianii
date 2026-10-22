<script lang="ts">
  import { mapping, unitGrid, validRange, type Range } from '../../lib/math/coordinates.ts';
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
    equal = false,
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
    equal?: boolean;
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
      return mapping(xRange, yRange, 500, 280, equal);
    } catch {
      return null;
    }
  });
  const visibleX = $derived<Range>(
    model ? [model.toData({ x: 0, y: 0 }).x, model.toData({ x: 500, y: 0 }).x] : xRange,
  );
  const visibleY = $derived<Range>(
    model ? [model.toData({ x: 0, y: 280 }).y, model.toData({ x: 0, y: 0 }).y] : yRange,
  );
  const xGrid = $derived(model ? unitGrid(visibleX, 500) : null);
  const yGrid = $derived(model ? unitGrid(visibleY, 280) : null);
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
        {#if model}
          {@const low = model.toScreen({ x: visibleX[0], y: visibleY[0] })}
          {@const high = model.toScreen({ x: visibleX[1], y: visibleY[1] })}
          {#each xGrid?.values ?? [] as x (x)}
            {@const q = model.toScreen({ x, y: 0 })}
            {#if grid}<path
                data-grid-x={x}
                d={`M${q.x},${high.y}V${low.y}`}
                class="grid-line"
                fill="none"
              />{/if}
            <text x={q.x} y="302" text-anchor="middle">{fmt(x)}</text>
          {/each}
          {#each yGrid?.values ?? [] as y (y)}
            {@const q = model.toScreen({ x: 0, y })}
            {#if grid}<path
                data-grid-y={y}
                d={`M${low.x},${q.y}H${high.x}`}
                class="grid-line"
                fill="none"
              />{/if}
            <text x="-10" y={q.y + 4} text-anchor="end">{fmt(y)}</text>
          {/each}
          {#if !xGrid?.values.length || visibleX[1] - visibleX[0] < 1}
            <text x={low.x} y="302" text-anchor="middle">{fmt(visibleX[0])}</text>
            <text x={high.x} y="302" text-anchor="middle">{fmt(visibleX[1])}</text>
          {/if}
          {#if !yGrid?.values.length || visibleY[1] - visibleY[0] < 1}
            <text x="-10" y={low.y + 4} text-anchor="end">{fmt(visibleY[0])}</text>
            <text x="-10" y={high.y + 4} text-anchor="end">{fmt(visibleY[1])}</text>
          {/if}
          {@const origin = model.toScreen({
            x: Math.max(visibleX[0], Math.min(visibleX[1], 0)),
            y: Math.max(visibleY[0], Math.min(visibleY[1], 0)),
          })}
          <path
            d={`M${low.x},${origin.y}H${high.x} M${origin.x},${high.y}V${low.y}`}
            class="axis-line"
            fill="none"
          />
          <g clip-path={`url(#${uid}-clip)`}>
            {#if highlight}<rect
                x={model.toScreen({ x: highlight[0], y: 0 }).x}
                y={high.y}
                width={Math.max(
                  0,
                  model.toScreen({ x: highlight[1], y: 0 }).x -
                    model.toScreen({ x: highlight[0], y: 0 }).x,
                )}
                height={low.y - high.y}
                fill="var(--color-accent)"
                opacity="0.12"
              />{/if}
            {#each references as r (r)}{@const p = model.toScreen({ x: r.value, y: r.value })}<line
                x1={r.axis === 'x' ? p.x : low.x}
                x2={r.axis === 'x' ? p.x : high.x}
                y1={r.axis === 'y' ? p.y : high.y}
                y2={r.axis === 'y' ? p.y : low.y}
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
              {#if s.kind === 'scatter'}{#each s.points as p (p)}{@const q =
                    model.toScreen(p)}<circle
                    cx={q.x}
                    cy={q.y}
                    r="5"
                    fill={`var(--color-${s.role})`}
                    opacity={s.role === 'secondary' ? 0.55 : 1}
                    ><title>{s.label}: {p.x}, {p.y}</title></circle
                  >{/each}{/if}
              {#if s.kind === 'bar'}
                {#each s.points as p (p)}{@const q = model.toScreen(p)}{@const zero =
                    model.toScreen({
                      x: p.x,
                      y: 0,
                    })}<rect
                    x={q.x -
                      (p.width ? Math.abs(model.toScreen({ x: p.x + p.width, y: 0 }).x - q.x) : 6) /
                        2}
                    y={Math.min(q.y, zero.y)}
                    width={p.width
                      ? Math.abs(model.toScreen({ x: p.x + p.width, y: 0 }).x - q.x)
                      : 6}
                    height={Math.abs(q.y - zero.y)}
                    fill={`var(--color-${s.role})`}
                    opacity={s.role === 'secondary' ? 0.55 : 1}
                    ><title>{s.label}: {p.x}, {p.y}</title></rect
                  >{/each}
              {/if}
            {/each}
          </g>
        {/if}
        <text x="250" y="333" text-anchor="middle">{xLabel}{xUnit ? ` (${xUnit})` : ''}</text>
        <text transform="translate(-58 140) rotate(-90)" text-anchor="middle"
          >{yLabel}{yUnit ? ` (${yUnit})` : ''}</text
        >
      </g>
    </svg>
    {#if grid}<p class="grid-caption">
        单位网格 = 1；{xGrid?.step === 1 && yGrid?.step === 1
          ? '逐单位绘制'
          : `密集网格已省略，显示间隔 x=${xGrid?.step}、y=${yGrid?.step}`}。{equal
          ? '横纵单位等长。'
          : '各轴按自身单位缩放。'}
      </p>{/if}
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
    min-width: 540px;
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
