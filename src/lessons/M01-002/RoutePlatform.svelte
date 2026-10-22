<script lang="ts">
  import SimulationControls from '../../components/interactive/SimulationControls.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import { assessRoute, routePosition, routeTasks, type Vector } from './experiment.ts';
  let { a, b, sum, context }: { a: Vector; b: Vector; sum: Vector; context: string } = $props();
  let step = $state(0);
  let speed = $state(5);
  let taskIndex = $state(0);
  let run = $state(0);
  const task = $derived(routeTasks[taskIndex]);
  const feedback = $derived(assessRoute(a, b, task));
  const stage = $derived(step < 10 ? 0 : step < 20 ? 1 : 2);
  $effect(() => {
    void context;
    void taskIndex;
    step = 0;
  });
  const position = $derived(routePosition(a, b, step));
  const extent = $derived(
    Math.max(
      1,
      Math.abs(a.x),
      Math.abs(a.y),
      Math.abs(sum.x),
      Math.abs(sum.y),
      Math.abs(task.via.x),
      Math.abs(task.via.y),
      Math.abs(task.end.x),
      Math.abs(task.end.y),
    ) * 1.2,
  );
  const px = (x: number) => 200 + (x * 160) / extent;
  const py = (y: number) => 200 - (y * 160) / extent;
  const fmt = (n: number) => Number(n.toFixed(2));
</script>

<section class="platform" aria-label="移动平台任务台" data-testid="object-workbench">
  <h3>让绘图平台经过指定点，再到终点</h3>
  <p>
    俯视理想 XY 绘图平台：笔头沿两段直线移动，留下轨迹。右为东，上为北，单位为米。
    这是放大示意的解析教学模型，不运行 GRBL，也不模拟切削、加速或真实机床精度。
  </p>
  <label class="task-field"
    >目标任务<select class="select select-bordered" bind:value={taskIndex}>
      {#each routeTasks as item, i (item.id)}<option value={i}>{item.name}</option>{/each}
    </select></label
  >
  <p>
    从 O=(0,0) 出发，第一段末端须到 P=({task.via.x},{task.via.y}) m， 第二段末端须到 Q=({task.end
      .x},{task.end.y}) m。用下方指令和 k 调整计划；任务切换只换目标，不代填答案。
  </p>
  <p>
    先预测：当前计划会经过 P、到达 Q 吗？再单步或播放核对；每段分成 10
    个等位移步，播放速度只影响演示，不代表实际进给速度。
  </p>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal diagram scrolling.) -->
  <div class="scene" tabindex="0" role="region" aria-label="平台路线图，可横向滚动">
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={`平台在(${fmt(position.x)},${fmt(position.y)})米；横纵等比例，视域半宽${fmt(extent)}米。`}
    >
      <rect x="10" y="10" width="380" height="380" rx="12" class="floor" />
      <text x="24" y="35">北 ↑</text><text x="330" y="375">东 →</text>
      <path
        d={`M 25 365 h ${160 / extent} m ${-160 / extent} -5 v 10 m ${160 / extent} -10 v 10`}
        class="ruler"
      />
      <text x="25" y="350">1 m</text>
      <circle cx="200" cy="200" r="6" class="start" />
      <text x="224" y="224">起点</text>
      <path
        d={`M 200 200 L ${px(task.via.x)} ${py(task.via.y)} L ${px(task.end.x)} ${py(task.end.y)}`}
        class="target"
      />
      <circle cx={px(task.via.x)} cy={py(task.via.y)} r="14" class="target-point" />
      <rect
        x={px(task.end.x) - 16}
        y={py(task.end.y) - 16}
        width="32"
        height="32"
        class="target-point"
      />
      {#if step > 0}
        <path
          d={`M 200 200 L ${px(step <= 10 ? position.x : a.x)} ${py(step <= 10 ? position.y : a.y)}`}
          class="first"
        />
      {/if}
      {#if step > 10}
        <path d={`M ${px(a.x)} ${py(a.y)} L ${px(position.x)} ${py(position.y)}`} class="second" />
      {/if}
      <g transform={`translate(${px(position.x)},${py(position.y)})`}>
        <rect x="-11" y="-10" width="22" height="20" rx="4" class="robot" />
        <path d="M -7 -14 h 14 M -7 14 h 14" class="ruler" />
      </g>
    </svg>
  </div>
  <p>
    图例：点划线为目标路线，圆环为 P，方框为 Q；粗实线为已走第一段，粗虚线为已走第二段。返回任务中 Q
    与起点重合。
  </p>
  {#key JSON.stringify([context, taskIndex, run])}
    <SimulationControls
      index={step}
      maxSteps={20}
      {speed}
      onstep={() => (step = Math.min(20, step + 1))}
      onreset={() => (step = 0)}
      onspeedchange={(value) => (speed = value)}
    />
  {/key}
  <div class="actions">
    <button
      class="btn btn-outline"
      disabled={step >= 10}
      onclick={() => {
        step = 10;
        run += 1;
      }}>执行第一段</button
    >
    <button
      class="btn btn-outline"
      disabled={step < 10 || step >= 20}
      onclick={() => {
        step = 20;
        run += 1;
      }}>执行第二段</button
    >
    <button
      class="btn btn-ghost"
      onclick={() => {
        step = 0;
        run += 1;
      }}>重新执行路线</button
    >
  </div>
  <p>“执行第一段／第二段”直接完成该段；观察沿线过程请使用单步或播放。</p>
  <p aria-live="polite" data-testid="platform-position">
    {step === 0
      ? '等待指令'
      : stage === 0
        ? '第一段执行中'
        : stage === 1
          ? '第一段已完成，第二段待完成'
          : '两段已完成'}：平台位置 ({fmt(position.x)}, {fmt(position.y)}) 米。
  </p>
  {#if step === 20}
    <div class="task-feedback" aria-live="polite" data-testid="route-feedback">
      <p>
        第一段末端距 P：{feedback.viaError.toFixed(3)} m；终点距 Q：{feedback.endError.toFixed(3)} m。
        判定容差 0.00000001 m，仅吸收浮点误差；读数四舍五入为零不代表通过。
      </p>
      {#if feedback.viaReached && feedback.endReached}
        <p>目标路线完成：两段末端都匹配。再交换两段指令，预测终点和经过的路线是否都不变。</p>
      {:else if feedback.endReached}
        <p>
          终点正确，路线未完成：第一段末端没有到 P。总位移相同不保证路径相同；先调整第一段，再补足到
          Q 的第二段。
        </p>
      {:else if feedback.viaReached}
        <p>
          已到 P，终点仍有偏差：第二段是从 P 出发的位移，不是 Q 的位置坐标。分别比较 P 到 Q
          的东西、南北变化，再试一次。
        </p>
      {:else}
        <p>
          两处都有偏差：先让第一段到 P。k 同时乘第一段的两个分量；负 k 还会反向。然后从 P
          计算第二段，修改后重新执行。
        </p>
      {/if}
    </div>
  {/if}
  <details>
    <summary>需要提示：怎样确定两段指令？</summary>
    <p>
      先看第一段末端与 P 的差异，再看 P 到 Q 每个方向要改变多少。固定 a 时，k
      会同时改变两个分量，不能只拉长横向。
    </p>
    <details>
      <summary>查看解题方法</summary>
      <p>
        起点为零。先用 k=1 求一组指令；反向放大任务可固定 a=(2,1)m，尝试负
        k。交换两段后，合位移保持不变，但第一段末端通常改变。
      </p>
      <FormulaBlock
        latex={String.raw`k\mathbf a=\mathbf p,\qquad \mathbf b=\mathbf q-\mathbf p`}
        description="p、q 是目标 P、Q 相对起点的 2×1 位置向量；a、b 是两段 2×1 位移向量，分量均为 m。k 为无量纲实数；同一固定坐标系、起点为零。"
      />
    </details>
  </details>
  <p>
    实线路线是第一段，虚线路线是第二段。下方向量图预览完整计划；改变指令会把平台送回起点，需重新执行。
  </p>
  <p>
    地图按计划自动取景，横纵单位等长；当前视域半宽 {fmt(extent)} m。跨场景比较路程请读取米数，不比较屏幕长度。
  </p>
  <p>
    当前计划：第一段 ({fmt(a.x)}, {fmt(a.y)}) 米，第二段 ({fmt(b.x)}, {fmt(b.y)}) 米。
  </p>
</section>

<style>
  .scene {
    overflow-x: auto;
  }
  .task-field {
    display: grid;
    gap: 0.5rem;
  }
  .platform :global(.simulation-controls button),
  .platform :global(.simulation-controls select) {
    min-height: 44px;
  }
  .target {
    fill: none;
    stroke: var(--color-base-content);
    stroke-width: 2;
    stroke-dasharray: 10 4 2 4;
  }
  .target-point {
    fill: none;
    stroke: var(--color-base-content);
    stroke-width: 2;
  }
  .task-feedback {
    border-left: 3px solid var(--color-base-content);
    padding-left: 1rem;
  }
  .scene svg {
    min-width: 320px;
  }
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
