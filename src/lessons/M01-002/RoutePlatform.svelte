<script lang="ts">
  import type { Vector } from './experiment.ts';
  let { a, b, sum, context }: { a: Vector; b: Vector; sum: Vector; context: string } = $props();
  let stage = $state(0);
  $effect(() => {
    void context;
    stage = 0;
  });
  const position = $derived(stage === 0 ? { x: 0, y: 0 } : stage === 1 ? a : sum);
  // Fixed 25 m half-width covers all allowed commands; scale never changes between trials.
  const px = (x: number) => 200 + x * 7;
  const py = (y: number) => 200 - y * 7;
  const fmt = (n: number) => Number(n.toFixed(2));
</script>

<section class="platform" aria-label="移动平台任务台">
  <h3>先执行路线，再看合位移</h3>
  <p>
    俯视理想移动平台：右为东，上为北；指令以米计。正值向东或北，负值向西或南。忽略障碍、加速和转向时间。
  </p>
  <svg
    viewBox="0 0 400 400"
    role="img"
    aria-label={`平台在(${fmt(position.x)},${fmt(position.y)})米；固定比例，10米标尺。`}
  >
    <rect x="10" y="10" width="380" height="380" rx="12" class="floor" />
    <text x="24" y="35">北 ↑</text><text x="330" y="375">东 →</text>
    <path d="M 25 365 h 70 m -70 -5 v 10 m 70 -10 v 10" class="ruler" />
    <text x="25" y="350">10 m</text>
    <circle cx="200" cy="200" r="6" class="start" />
    <text x="210" y="220">起点</text>
    {#if stage >= 1}
      <path d={`M 200 200 L ${px(a.x)} ${py(a.y)}`} class="first" />
    {/if}
    {#if stage >= 2}
      <path d={`M ${px(a.x)} ${py(a.y)} L ${px(sum.x)} ${py(sum.y)}`} class="second" />
    {/if}
    <g transform={`translate(${px(position.x)},${py(position.y)})`}>
      <rect x="-11" y="-10" width="22" height="20" rx="4" class="robot" />
      <path d="M -7 -14 h 14 M -7 14 h 14" class="ruler" />
    </g>
  </svg>
  <div class="actions">
    <button class="btn btn-outline" disabled={stage !== 0} onclick={() => (stage = 1)}
      >执行第一段</button
    >
    <button class="btn btn-outline" disabled={stage !== 1} onclick={() => (stage = 2)}
      >执行第二段</button
    >
    <button class="btn btn-ghost" onclick={() => (stage = 0)}>重新执行路线</button>
  </div>
  <p aria-live="polite" data-testid="platform-position">
    {stage === 0 ? '等待指令' : stage === 1 ? '第一段已完成' : '两段已完成'}：平台位置 ({fmt(
      position.x,
    )}, {fmt(position.y)}) 米。
  </p>
  <p>
    实线路线是第一段，虚线路线是第二段。下方向量图预览完整计划；改变指令会把平台送回起点，需重新执行。
  </p>
  <p>
    当前计划：第一段 ({fmt(a.x)}, {fmt(a.y)}) 米，第二段 ({fmt(b.x)}, {fmt(b.y)})
    米。图中平台位置只由下方同一组位移计算。
  </p>
</section>

<style>
  .platform {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    padding: 1rem;
  }
  svg {
    display: block;
    width: 100%;
    max-width: 32rem;
    margin: auto;
  }
  .floor {
    fill: var(--color-base-200);
    stroke: var(--color-base-content);
  }
  text {
    fill: var(--color-base-content);
    font-size: 16px;
  }
  .ruler,
  .start {
    stroke: var(--color-base-content);
    fill: var(--color-base-content);
    stroke-width: 2;
  }
  .first {
    stroke: var(--color-primary);
    stroke-width: 4;
    fill: none;
  }
  .second {
    stroke: var(--color-secondary);
    stroke-width: 4;
    stroke-dasharray: 7 5;
    fill: none;
  }
  .robot {
    fill: var(--color-accent);
    stroke: var(--color-base-content);
    stroke-width: 2;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  button {
    min-height: 44px;
    height: auto;
    white-space: normal;
  }
</style>
