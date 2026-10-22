<script lang="ts">
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import { actuate } from './experiment.ts';
  let {
    matrix,
    threshold,
    command1,
    command2,
    oncommand,
  }: {
    matrix: number[][];
    threshold: number;
    command1: number;
    command2: number;
    oncommand: (a: number, b: number) => void;
  } = $props();
  const result = $derived(actuate(matrix, command1, command2));
  const point = (x: number, y: number) => `${180 + x * 18},${150 - y * 18}`;
</script>

<section class="workbench" data-testid="object-workbench" aria-label="双执行器定位台">
  <h3>两路执行器能把平台送到哪里？</h3>
  <p>
    每路指令都沿矩阵对应列移动平台；输入与位移均为无量纲模型单位。先单独推动一路，再组合两路，观察能否离开同一条直线。
  </p>
  <ParameterSlider
    label="执行器一指令"
    value={command1}
    min={-1}
    max={1}
    step={0.25}
    onchange={(n) => oncommand(n, command2)}
  />
  <ParameterSlider
    label="执行器二指令"
    value={command2}
    min={-1}
    max={1}
    step={0.25}
    onchange={(n) => oncommand(command1, n)}
  />
  <div class="actions">
    <button class="btn" onclick={() => oncommand(1, 0)}>只推动执行器一</button><button
      class="btn"
      onclick={() => oncommand(0, 1)}>只推动执行器二</button
    ><button class="btn" onclick={() => oncommand(1, -0.5)}>试着相互抵消</button>
  </div>
  <svg
    viewBox="0 0 360 300"
    role="img"
    aria-label="定位台可达区域边界与当前平台，所有位置由同一矩阵计算"
  >
    <rect x="20" y="20" width="320" height="260" class="floor" />
    <polygon points={result.corners.map((p) => point(p.x, p.y)).join(' ')} class="alternative" />
    <path d={`M180,150L${point(result.position.x, result.position.y)}`} class="path" />
    <rect
      data-testid="actuator-platform"
      x={180 + result.position.x * 18 - 8}
      y={150 - result.position.y * 18 - 8}
      width="16"
      height="16"
      class="object"
    />
    <circle cx="180" cy="150" r="4" class="fixed" />
    <text x="28" y="46">虚线：可达区域边界</text>
    <text x="28" y="260">固定比例：1 模型单位 = 18 逻辑像素</text>
  </svg>
  <p data-testid="object-reading" aria-live="polite">
    平台位置 ({result.position.x.toExponential(2)}, {result.position.y.toExponential(2)})；判定阈值 {threshold.toExponential(
      2,
    )}。
  </p>
  <p>
    阈值只改变数值秩判断，不改变平台的解析位置。很小的非零方向可能无法用像素分辨，读数保留它；这不是有噪声的硬件实测。
  </p>
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
