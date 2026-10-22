<script lang="ts">
  import { mapping, unitGrid } from '../../lib/math/coordinates.ts';
  export interface DisplayVector {
    x: number;
    y: number;
    label: string;
    role: 'primary' | 'secondary' | 'accent';
    origin?: { x: number; y: number };
    draggable?: boolean;
  }
  let {
    vectors,
    range = 10,
    description,
    onchange,
    projection,
    showAngle = false,
    grid = true,
    axisRotation = 0,
  }: {
    vectors: DisplayVector[];
    range?: number;
    description: string;
    onchange?: (index: number, x: number, y: number) => void;
    projection?: { from: { x: number; y: number }; to: { x: number; y: number } };
    showAngle?: boolean;
    grid?: boolean;
    axisRotation?: number;
  } = $props();
  const uid = $props.id();
  let svg = $state<SVGSVGElement>();
  let dragging = $state<number | null>(null);
  const valid = $derived(
    Number.isFinite(axisRotation) &&
      Number.isFinite(range) &&
      range > 0 &&
      range <= 100 &&
      vectors.every((v) => [v.x, v.y, v.origin?.x ?? 0, v.origin?.y ?? 0].every(Number.isFinite)),
  );
  const map = $derived(
    mapping(
      [-Math.max(1, Math.min(100, range || 10)), Math.max(1, Math.min(100, range || 10))],
      [-Math.max(1, Math.min(100, range || 10)), Math.max(1, Math.min(100, range || 10))],
      320,
      320,
      true,
    ),
  );
  const px = (x: number) => 50 + map.toScreen({ x, y: 0 }).x,
    py = (y: number) => 30 + map.toScreen({ x: 0, y }).y;
  const gridExtent = $derived(axisRotation % 90 === 0 ? range : range * Math.SQRT2);
  const ticks = $derived(
    unitGrid(
      [-Math.max(1, Math.min(142, gridExtent || 10)), Math.max(1, Math.min(142, gridExtent || 10))],
      320,
    ),
  );
  function move(e: PointerEvent) {
    if (dragging === null) return;
    const matrix = svg?.getScreenCTM();
    if (!matrix) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    const q = map.toData({ x: p.x - 50, y: p.y - 30 }),
      v = vectors[dragging];
    onchange?.(
      dragging,
      Math.max(-range, Math.min(range, Math.round((q.x - (v.origin?.x ?? 0)) * 10) / 10)),
      Math.max(-range, Math.min(range, Math.round((q.y - (v.origin?.y ?? 0)) * 10) / 10)),
    );
  }
</script>

{#if !valid}<p role="status">向量或坐标范围无效。</p>{:else}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal diagram scrolling.) -->
  <div class="vector-frame" tabindex="0" role="region" aria-label="向量图，可横向滚动">
    <svg
      bind:this={svg}
      class="vector-diagram"
      viewBox="0 0 420 390"
      role="img"
      aria-labelledby={`${uid}-title`}
      onpointermove={move}
      onpointerup={() => (dragging = null)}
      onpointercancel={() => (dragging = null)}
    >
      <title id={`${uid}-title`}>{description}；拖拽端点或使用同步数值输入。</title>
      <defs
        ><clipPath id={`${uid}-grid-clip`}><rect x="50" y="30" width="320" height="320" /></clipPath
        >{#each ['primary', 'secondary', 'accent'] as role (role)}<marker
            id={`${uid}-${role}`}
            markerWidth="7"
            markerHeight="7"
            refX="5"
            refY="3"
            orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={`var(--color-${role})`} /></marker
          >{/each}</defs
      >
      <g clip-path={`url(#${uid}-grid-clip)`}>
        <g
          data-coordinate-system
          transform={`translate(210 190) rotate(${-axisRotation}) translate(-210 -190)`}
        >
          {#each ticks.values as n (n)}
            {#if grid && n !== 0}<path
                data-grid-unit={n}
                d={`M${px(n)},${py(-gridExtent)}V${py(gridExtent)} M${px(-gridExtent)},${py(n)}H${px(gridExtent)}`}
                class="grid-line"
                fill="none"
              />{/if}
          {/each}
          <path
            d={`M${px(-gridExtent)},${py(0)}H${px(gridExtent)} M${px(0)},${py(-gridExtent)}V${py(gridExtent)}`}
            class="axis-line"
            fill="none"
          />
          {#each ticks.values.filter((n) => n !== 0 && Math.abs(n) < range * 0.8) as n (n)}
            <text
              x={px(n)}
              y={py(0) + 18}
              text-anchor="middle"
              transform={`rotate(${axisRotation} ${px(n)} ${py(0) + 18})`}>{n}</text
            >
            <text
              x={px(0) - 12}
              y={py(n)}
              text-anchor="end"
              transform={`rotate(${axisRotation} ${px(0) - 12} ${py(n)})`}>{n}</text
            >
          {/each}
          <text
            x={px(range * 0.88)}
            y={py(0) - 10}
            transform={`rotate(${axisRotation} ${px(range * 0.88)} ${py(0) - 10})`}
            >{axisRotation ? 'x′' : 'x'}</text
          >
          <text
            x={px(0) + 10}
            y={py(range * 0.88)}
            transform={`rotate(${axisRotation} ${px(0) + 10} ${py(range * 0.88)})`}
            >{axisRotation ? 'y′' : 'y'}</text
          >
        </g>
      </g>
      <text x="216" y="208">0</text>
      <text x="50" y="375"
        >单位网格 = 1 · 等比例{ticks.step > 1 ? ` · 每 ${ticks.step} 单位显示一线` : ''}</text
      >
      {#if projection}<line
          x1={px(projection.from.x)}
          y1={py(projection.from.y)}
          x2={px(projection.to.x)}
          y2={py(projection.to.y)}
          stroke="currentColor"
          stroke-dasharray="3 5"
        />{/if}
      {#if showAngle && vectors.length >= 2}
        {@const a = Math.atan2(vectors[0].y, vectors[0].x)}{@const b = Math.atan2(
          vectors[1].y,
          vectors[1].x,
        )}{@const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a))}
        {#if Math.hypot(vectors[0].x, vectors[0].y) > 0 && Math.hypot(vectors[1].x, vectors[1].y) > 0}<path
            d={`M${px(0) + 26 * Math.cos(a)},${py(0) - 26 * Math.sin(a)} A26,26 0 0,${delta > 0 ? 0 : 1} ${px(0) + 26 * Math.cos(b)},${py(0) - 26 * Math.sin(b)}`}
            fill="none"
            stroke="currentColor"
          />{/if}
      {/if}
      {#each vectors as v, i (i)}
        {@const ox = v.origin?.x ?? 0}{@const oy = v.origin?.y ?? 0}
        <line
          data-vector={i}
          x1={px(ox)}
          y1={py(oy)}
          x2={px(ox + v.x)}
          y2={py(oy + v.y)}
          stroke={`var(--color-${v.role})`}
          stroke-width="2.5"
          stroke-dasharray={v.role === 'secondary' ? '7 3' : undefined}
          marker-end={v.x || v.y ? `url(#${uid}-${v.role})` : undefined}
        />
        <text x={px(ox + v.x) + 8} y={py(oy + v.y) - 8} fill={`var(--color-${v.role})`}
          >{v.label}</text
        >
        {#if v.draggable && onchange}<circle
            data-testid={`vector-end-${i}`}
            cx={px(ox + v.x)}
            cy={py(oy + v.y)}
            r="12"
            fill={`var(--color-${v.role})`}
            fill-opacity="0.25"
            stroke={`var(--color-${v.role})`}
            role="presentation"
            onpointerdown={(e) => {
              dragging = i;
              svg?.setPointerCapture(e.pointerId);
              e.preventDefault();
            }}
          />{/if}
      {/each}
    </svg>
  </div>{/if}

<style>
  .vector-frame {
    min-width: 0;
    contain: inline-size;
    width: 100%;
    max-width: 100%;
    overflow: auto;
  }
  svg {
    min-width: 360px;
    max-width: 100%;
    height: auto;
  }
  text {
    fill: currentColor;
    font-size: 14px;
  }
  circle {
    touch-action: none;
    cursor: grab;
  }
</style>
