<script lang="ts">
  import type { Vector2 } from '../../lib/math/vector.ts';
  let {
    v,
    u,
    candidate,
    p,
    t,
    distance,
    onmove,
  }: {
    v: Vector2;
    u: Vector2;
    candidate: Vector2;
    p: Vector2 | null;
    t: number;
    distance: number;
    onmove: (t: number) => void;
  } = $props();
  const extent = $derived(
    1.3 *
      Math.max(
        1,
        Math.abs(v.x),
        Math.abs(v.y),
        Math.abs(candidate.x),
        Math.abs(candidate.y),
        Math.abs(p?.x ?? 0),
        Math.abs(p?.y ?? 0),
      ),
  );
  const point = (q: Vector2) => `${180 + (q.x / extent) * 120},${160 - (q.y / extent) * 120}`;
  const rail = $derived.by(() => {
    const n = Math.max(Math.abs(u.x), Math.abs(u.y));
    return n ? { x: (u.x / n) * extent, y: (u.y / n) * extent } : null;
  });
</script>

<section class="workbench" data-testid="object-workbench" aria-label="直轨小车最近距离实验台">
  <h3>沿轨道移动小车，接近固定目标</h3>
  <p>
    圆形目标不能动，小车只能沿直轨往返。一步指令使小车移动
    u，坐标与距离均用无量纲模型单位。先找到距离最小的位置，再核对垂足。
  </p>
  <div class="actions">
    <button class="btn" disabled={t < -4.5} onclick={() => onmove(Math.max(-5, t - 0.5))}
      >小车后退半步</button
    ><button class="btn" disabled={t > 4.5} onclick={() => onmove(Math.min(5, t + 0.5))}
      >小车前进半步</button
    >
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal diagram scrolling.) -->
  <div class="scene" tabindex="0" role="region" aria-label="对象示意图，可横向滚动">
    <svg
      viewBox="0 0 360 320"
      role="img"
      aria-label={`小车到目标距离${distance.toFixed(3)}；指令系数${t}`}
    >
      <rect x="20" y="20" width="320" height="280" class="floor" />
      {#if rail}<path
          d={`M${point({ x: -rail.x, y: -rail.y })}L${point(rail)}`}
          class="path"
        />{/if}
      <path d={`M${point(v)}L${point(candidate)}`} class="alternative" />
      {#if p}<path d={`M${point(v)}L${point(p)}`} class="path" opacity="0.5" />{/if}
      <circle cx={180 + (v.x / extent) * 120} cy={160 - (v.y / extent) * 120} r="9" class="fixed" />
      <rect
        data-testid="rail-carriage"
        x={180 + (candidate.x / extent) * 120 - 10}
        y={160 - (candidate.y / extent) * 120 - 7}
        width="20"
        height="14"
        class="object"
      />
      <text x="30" y="45">圆点：固定目标；方车：当前位置</text>
      <text x="30" y="285">虚线：当前距离；细实线：最短距离</text>
    </svg>
  </div>
  <p data-testid="object-reading" aria-live="polite">
    小车位置 ({candidate.x.toFixed(3)}, {candidate.y.toFixed(3)})；到目标 {distance.toFixed(
      3,
    )}。{rail
      ? '轨道方向固定，移动小车再比较读数。'
      : '方向为零，控制失效，不能定义参考直线的投影。'}
  </p>
  <p>切换“方向放大两倍”后，同样一步走得更远。轨道改变了吗？图随范围等比例缩放，请比较读数。</p>
</section>

<style>
  .scene {
    overflow-x: auto;
  }
  .scene svg {
    min-width: 320px;
  }
  .workbench {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    padding: 1rem;
    margin-block: 1rem;
    min-width: 0;
  }
  svg {
    display: block;
    width: 100%;
    max-width: 32rem;
    margin: auto;
    overflow: visible;
  }
  text {
    fill: var(--color-base-content);
    font-size: 16px;
  }
  .floor {
    fill: var(--color-base-200);
    stroke: var(--color-base-content);
  }
  .path {
    fill: none;
    stroke: var(--color-primary);
    stroke-width: 3;
  }
  .alternative {
    fill: none;
    stroke: var(--color-secondary);
    stroke-width: 3;
    stroke-dasharray: 7 5;
  }
  .object {
    fill: var(--color-accent);
    stroke: var(--color-base-content);
    stroke-width: 2;
  }
  .fixed {
    fill: var(--color-base-content);
    stroke: var(--color-base-content);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 0.75rem;
  }
  button {
    min-height: 44px;
    height: auto;
    white-space: normal;
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
