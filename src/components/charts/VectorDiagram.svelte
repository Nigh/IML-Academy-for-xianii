<script lang="ts">
  export interface DisplayVector {
    x: number;
    y: number;
    label: string;
    role: 'primary' | 'secondary' | 'accent';
    origin?: { x: number; y: number };
  }
  let {
    vectors,
    range = 10,
    description,
  }: { vectors: DisplayVector[]; range?: number; description: string } = $props();
  const uid = $props.id();
  const px = (x: number) => 210 + x * 16;
  const py = (y: number) => 195 - y * 16;
</script>

<svg class="vector-diagram" viewBox="0 0 420 390" role="img" aria-labelledby={`${uid}-title`}>
  <title id={`${uid}-title`}>{description}</title>
  <defs>
    {#each ['primary', 'secondary', 'accent'] as role (role)}
      <marker id={`${uid}-${role}`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"
        ><path d="M0,0 L6,3 L0,6 Z" fill={`var(--color-${role})`} /></marker
      >
    {/each}
  </defs>
  {#each Array.from({ length: range * 2 + 1 }, (_, i) => i - range) as n (n)}
    <line
      x1={px(n)}
      y1={py(-range)}
      x2={px(n)}
      y2={py(range)}
      class={n === 0 ? 'axis-line' : 'grid-line'}
    />
    <line
      x1={px(-range)}
      y1={py(n)}
      x2={px(range)}
      y2={py(n)}
      class={n === 0 ? 'axis-line' : 'grid-line'}
    />
  {/each}
  <text x="383" y="211" class="axis-label">x</text><text x="220" y="29" class="axis-label">y</text>
  <text x="216" y="211" class="axis-label">0</text>
  {#each vectors as v, i (i)}
    {@const ox = v.origin?.x ?? 0}{@const oy = v.origin?.y ?? 0}
    <line
      x1={px(ox)}
      y1={py(oy)}
      x2={px(ox + v.x)}
      y2={py(oy + v.y)}
      stroke={`var(--color-${v.role})`}
      stroke-width={i === vectors.length - 1 ? 3.5 : 2.5}
      stroke-dasharray={v.role === 'secondary' ? '7 3' : undefined}
      marker-end={v.x || v.y ? `url(#${uid}-${v.role})` : undefined}
    />
    <text
      x={px(ox + v.x) + 8}
      y={py(oy + v.y) - 8 - i * 2}
      fill={`var(--color-${v.role})`}
      class="vector-label">{v.label}</text
    >
  {/each}
</svg>
