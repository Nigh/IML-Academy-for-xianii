<script lang="ts">
  import { transform } from './experiment.ts';
  let { a, onchange }: { a: number[][]; onchange: (a: number[][]) => void } = $props();
  const outline = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 0.65 },
    { x: 0.65, y: 1 },
    { x: 0, y: 1 },
  ];
  const factor = $derived(
    110 /
      Math.max(
        2,
        ...outline.map((p) => transform(a, p)).flatMap((p) => [Math.abs(p.x), Math.abs(p.y)]),
      ),
  );
  const before = $derived(
    outline.map((p) => `${180 + p.x * factor},${155 - p.y * factor}`).join(' '),
  );
  const after = $derived(
    outline
      .map((p) => transform(a, p))
      .map((p) => `${180 + p.x * factor},${155 - p.y * factor}`)
      .join(' '),
  );
  const marker = $derived(transform(a, { x: 0.25, y: 0.75 }));
</script>

<section class="workbench" data-testid="object-workbench" aria-label="平面印章变形工作台">
  <h3>让缺角印章变形</h3>
  <p>
    缺角和内部圆点让方向变化可见。固定左下角，改变横向宽度或向右推上边；所有点使用同一个线性矩阵，不模拟材料弹性。
  </p>
  <div class="actions">
    <button
      class="btn"
      onclick={() =>
        onchange([
          [1, 0],
          [0, 1],
        ])}>恢复原形</button
    >
    <button
      class="btn"
      onclick={() =>
        onchange([
          [2, 0],
          [0, 1],
        ])}>印章横向拉宽两倍</button
    >
    <button
      class="btn"
      onclick={() =>
        onchange([
          [1, 1],
          [0, 1],
        ])}>把印章上边向右推</button
    >
    <button
      class="btn"
      onclick={() =>
        onchange([
          [1, 0],
          [0, 0],
        ])}>把印章压扁</button
    >
    <button
      class="btn"
      onclick={() =>
        onchange([
          [0, -1],
          [1, 0],
        ])}>印章逆时针转 90°</button
    >
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal diagram scrolling.) -->
  <div class="scene" tabindex="0" role="region" aria-label="对象示意图，可横向滚动">
    <svg
      viewBox="0 0 360 310"
      role="img"
      aria-label="虚线为原印章，实线为当前印章；缺角和圆点由同一矩阵变换"
    >
      <rect x="20" y="20" width="320" height="270" class="floor" />
      <polygon points={before} class="alternative" /><polygon
        data-testid="stamp-outline"
        points={after}
        class="path"
      />
      <circle cx={180 + marker.x * factor} cy={155 - marker.y * factor} r="6" class="object" />
      <rect x="176" y="151" width="8" height="8" class="fixed" />
      <text x="30" y="48">方块固定角；圆点随印章变形</text>
      <text x="30" y="275">等比例自动取景；跨状态按数值比较</text>
    </svg>
  </div>
  <p data-testid="object-reading" aria-live="polite">
    印章内部标记：({marker.x.toFixed(3)}, {marker.y.toFixed(3)})。下方网格、两列和角点与印章共用 A。
  </p>
  <p>压扁后缺角信息可能丢失。要整体搬动印章，需另加平移项；这里的普通 2×2 矩阵不包含平移。</p>
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
