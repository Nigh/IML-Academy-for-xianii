<script lang="ts">
  let {
    x,
    y,
    l1,
    l2,
    onmove,
  }: { x: number; y: number; l1: number; l2: number; onmove: (x: number, y: number) => void } =
    $props();
  const px = (n: number) => 180 + n * 25;
  const py = (n: number) => 170 - n * 25;
</script>

<section class="workbench" data-testid="object-workbench" aria-label="配送路线规划台">
  <h3>把包裹送到哪里？</h3>
  <p>
    仓库固定在路口中心。移动收货点，比较只能沿街行驶的车与可直达的理想路线；忽略建筑阻挡和转弯成本。
  </p>
  <div class="actions">
    <button class="btn" disabled={x >= 5} onclick={() => onmove(Math.min(5, x + 1), y)}
      >收货点向东 1 m</button
    >
    <button class="btn" disabled={x <= -5} onclick={() => onmove(Math.max(-5, x - 1), y)}
      >收货点向西 1 m</button
    >
    <button class="btn" disabled={y >= 5} onclick={() => onmove(x, Math.min(5, y + 1))}
      >收货点向北 1 m</button
    >
    <button class="btn" disabled={y <= -5} onclick={() => onmove(x, Math.max(-5, y - 1))}
      >收货点向南 1 m</button
    >
  </div>
  <svg
    viewBox="0 0 360 340"
    role="img"
    aria-label={`收货点东西${x}米、南北${y}米，沿街${l1.toFixed(2)}米，直达${l2.toFixed(2)}米`}
  >
    <rect x="35" y="25" width="290" height="290" class="floor" />
    {#each [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5] as n (n)}<path
        d={`M${px(n)},45V295 M55,${py(n)}H305`}
        class="alternative"
        opacity="0.25"
      />{/each}
    <path d={`M180,170H${px(x)}V${py(y)}`} class="path" />
    <path d={`M180,170L${px(x)},${py(y)}`} class="alternative" />
    <rect x="172" y="162" width="16" height="16" class="fixed" />
    <circle data-testid="delivery-target" cx={px(x)} cy={py(y)} r="9" class="object" />
    <text x="45" y="22">北 ↑ · 每街区 1 m · 东 →</text>
    <text x="45" y="335">方块：仓库；圆点：收货点</text>
  </svg>
  <p data-testid="object-reading" aria-live="polite">
    收货点 ({x}, {y}) m；沿街 {l1.toFixed(3)} m；直达 {l2.toFixed(3)} m。实线路线对应 L1，虚线直达对应
    L2。
  </p>
  <p>换记录单位不会搬动包裹。先试 (0,4)，再试 (3,4)：两条路线何时一样长？</p>
</section>

<style>
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
