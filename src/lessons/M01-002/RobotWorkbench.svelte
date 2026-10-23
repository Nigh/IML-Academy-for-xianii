<script lang="ts">
  import { onMount } from 'svelte';
  import IntegerStepper from './IntegerStepper.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import { mapping, unitGrid } from '../../lib/math/coordinates.ts';
  import { vector, norm, type Vector2 } from '../../lib/math/vector.ts';
  import {
    twoMoves,
    speedMotion,
    predictionDistance,
    sceneRange,
    RUN_SECONDS,
  } from './experiment.ts';

  type Stage = 'addition' | 'return' | 'speed';
  const stages = [
    { id: 'addition' as const, label: '两段移动' },
    { id: 'return' as const, label: '原路返回' },
    { id: 'speed' as const, label: '改变速度' },
  ];
  const uid = $props.id();
  let stage = $state<Stage>('addition');
  let ax = $state(2),
    ay = $state(1),
    bx = $state(-1),
    by = $state(2),
    k = $state(1);
  let step = $state(0);
  let running = $state(false);
  let movement = $state<'segments' | 'sum'>('segments');
  let compared = $state(false);
  let frame = 0;
  let exploring = $state(false);
  let showSum = $state(true);
  let parallelogram = $state(false);
  let prediction = $state<Vector2 | null>(null);
  let guessX = $state(0),
    guessY = $state(0);
  let explanation = $state(false);
  let hint = $state(0);
  const speed = $derived(stage === 'speed');
  const motion = $derived(speedMotion(vector(ax, ay), k));
  const a = $derived(speed ? motion.displacement : vector(ax, ay));
  const b = $derived(vector(bx, by));
  const route = $derived(twoMoves(a, speed ? vector(0, 0) : b));
  const end = $derived(route.end);
  const steps = $derived(speed ? 1 : 2);
  const complete = $derived(step === steps);
  const revealed = $derived(exploring || complete);
  const firstVisible = $derived(step >= 1);
  let position = $state({ x: 0, y: 0 });
  const cancelled = $derived(!speed && norm(a) > 0 && norm(end) === 0);
  const range = $derived(
    sceneRange([a, ...(speed ? [] : [b]), end, ...(prediction ? [prediction] : [])], speed),
  );
  const coordinates = $derived(mapping(range, range, 336, 336, true));
  const grid = $derived(unitGrid(range, 336));
  const px = (point: Vector2) => coordinates.toScreen(point).x + 58;
  const py = (point: Vector2) => coordinates.toScreen(point).y + 18;
  const origin = vector(0, 0);
  const fmt = (value: number) => String(Number(value.toFixed(2)));
  const pair = (point: Vector2) => `(${fmt(point.x)}, ${fmt(point.y)})`;
  const error = $derived(prediction && complete ? predictionDistance(prediction, end) : null);

  function stopMovement() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    running = false;
  }
  function rewind() {
    stopMovement();
    step = 0;
    movement = 'segments';
    compared = false;
    position.x = 0;
    position.y = 0;
    explanation = false;
  }
  function finishMovement() {
    stopMovement();
    const target = movement === 'sum' || step > 0 ? end : a;
    position.x = target.x;
    position.y = target.y;
    if (movement === 'sum') compared = true;
    else step += 1;
  }
  onMount(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduceMotion = () => {
      if (preference?.matches && running) finishMovement();
    };
    const visibility = () => {
      if (document.hidden && running) {
        stopMovement();
        const start = movement === 'sum' || step === 0 ? origin : a;
        position.x = start.x;
        position.y = start.y;
      }
    };
    preference?.addEventListener('change', reduceMotion);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      stopMovement();
      preference?.removeEventListener('change', reduceMotion);
      document.removeEventListener('visibilitychange', visibility);
    };
  });

  function changed() {
    if (step > 0) exploring = true;
    rewind();
    explanation = false;
    hint = 0;
  }
  function reset(next: Stage = stage) {
    rewind();
    stage = next;
    ax = 2;
    ay = next === 'return' ? -1 : 1;
    bx = next === 'return' ? -2 : -1;
    by = next === 'return' ? 1 : 2;
    k = 1;
    exploring = next !== 'addition';
    prediction = null;
    guessX = 0;
    guessY = 0;
    explanation = false;
    hint = 0;
    showSum = true;
    parallelogram = false;
  }
  function markPrediction() {
    prediction = vector(guessX, guessY);
  }
  function pickPrediction(event: MouseEvent) {
    if (revealed || step > 0 || running) return;
    if (event.detail === 0) {
      markPrediction();
      return;
    }
    const svg = (event.currentTarget as HTMLButtonElement).parentElement?.querySelector('svg');
    if (!svg) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const screen = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    if (screen.x < 58 || screen.x > 394 || screen.y < 18 || screen.y > 354) return;
    const data = coordinates.toData(vector(screen.x - 58, screen.y - 18));
    if (Math.abs(data.x) > 10 || Math.abs(data.y) > 10) return;
    guessX = Math.round(data.x);
    guessY = Math.round(data.y);
    markPrediction();
  }
  function execute() {
    if (running || complete || document.hidden) return;
    animateMovement();
  }
  function compare() {
    if (running || !complete || speed || document.hidden) return;
    movement = 'sum';
    compared = false;
    showSum = true;
    position.x = 0;
    position.y = 0;
    animateMovement();
  }
  function animateMovement() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finishMovement();
      return;
    }
    running = true;
    const startX = position.x,
      startY = position.y;
    const target = movement === 'sum' || step > 0 ? end : a;
    const dx = target.x - startX,
      dy = target.y - startY;
    const started = performance.now();
    const advance = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - started) / 1000));
      position.x = startX + dx * progress;
      position.y = startY + dy * progress;
      if (progress === 1) finishMovement();
      else frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
  }
  function swap() {
    [ax, ay, bx, by] = [bx, by, ax, ay];
    changed();
    exploring = false;
    prediction = null;
    guessX = 0;
    guessY = 0;
    parallelogram = false;
    showSum = true;
  }
</script>

<section class="robot-workbench" aria-label="机器人移动实验" data-testid="robot-workbench">
  <div class="workbench-heading">
    <div class="stages" role="group" aria-label="探索场景">
      {#each stages as item (item.id)}
        <button class="stage-button" aria-pressed={stage === item.id} onclick={() => reset(item.id)}
          >{item.label}</button
        >
      {/each}
    </div>
    <button class="reset-button" onclick={() => reset()}>复位实验</button>
  </div>
  <p class="task-prompt">
    {#if speed}固定运行 {RUN_SECONDS} 秒，改变速度倍率，比较方向与走过的距离。
    {:else if stage === 'return'}让第二段沿原路返回，比较走过的路程与总位移。
    {:else if !revealed && step === 0}两段指令都在右侧。先预测终点，再执行；也可以直接探索。
    {:else}修改指令后重新执行；每段走完后，地图上才会留下对应的位移箭头。{/if}
  </p>
  <div class="workbench-main">
    <div class="map-column">
      <div class="map-caption">
        <span
          >{running
            ? movement === 'sum'
              ? '沿合向量移动中 · 用时 1 秒'
              : `第 ${step + 1} 段移动中 · 用时 1 秒`
            : compared
              ? '合向量移动已完成 · 终点重合'
              : movement === 'sum'
                ? '合向量演示已停止，可重新执行'
                : step === 0
                  ? '等待指令'
                  : complete
                    ? speed
                      ? '移动已完成'
                      : '两段移动已完成'
                    : '第一段已完成'}</span
        >
        <span>东为 x 正向，北为 y 正向 · 米</span>
      </div>
      <div class="map-surface">
        <svg
          viewBox="0 0 452 392"
          role="img"
          aria-label={`机器人地图，当前位置 ${pair(position)} 米，横纵等比例；坐标范围 ${range[0]} 至 ${range[1]} 米。`}
        >
          <defs>
            <marker
              id={`${uid}-move`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"><path d="M1 1L9 5L1 9" class="move-head" /></marker
            >
            <marker
              id={`${uid}-sum`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"><path d="M1 1L9 5L1 9" class="sum-head" /></marker
            >
          </defs>
          {#each grid.values as n (n)}
            <line
              class="grid-line"
              x1={px(vector(n, range[0]))}
              y1="18"
              x2={px(vector(n, range[0]))}
              y2="354"
            />
            <line class="grid-line" x1="58" y1={py(vector(0, n))} x2="394" y2={py(vector(0, n))} />
            <text class="tick" x={px(vector(n, 0))} y="375" text-anchor="middle">{n}</text>
            <text class="tick" x="47" y={py(vector(0, n)) + 5} text-anchor="end">{n}</text>
          {/each}
          <line class="axis-line" x1="58" y1={py(origin)} x2="394" y2={py(origin)} />
          <line class="axis-line" x1={px(origin)} y1="18" x2={px(origin)} y2="354" />
          <text class="axis-title" x="420" y={Math.min(342, py(origin) + 20)}>x</text>
          <text class="axis-title" x={px(origin) + 12} y="14">y</text>
          {#if complete && parallelogram && !speed}
            <path
              data-testid="parallelogram"
              class="construction"
              d={`M${px(origin)} ${py(origin)}L${px(b)} ${py(b)}L${px(end)} ${py(end)}`}
            />
          {/if}
          {#if firstVisible && norm(a) > 0}
            <line
              data-testid="first-route"
              class="move-line"
              x1={px(origin)}
              y1={py(origin)}
              x2={px(a)}
              y2={py(a)}
              marker-end={`url(#${uid}-move)`}
            />
          {/if}
          {#if step >= 2 && !speed && norm(b) > 0}
            <line
              data-testid="second-route"
              class="move-line"
              x1={px(a)}
              y1={py(a)}
              x2={px(end)}
              y2={py(end)}
              marker-end={`url(#${uid}-move)`}
            />
          {/if}
          {#if complete && showSum && norm(end) > 0}
            <line
              data-testid="sum-route"
              class="sum-line"
              x1={px(origin)}
              y1={py(origin)}
              x2={px(end)}
              y2={py(end)}
              marker-end={`url(#${uid}-sum)`}
            />
            <text x={(px(origin) + px(end)) / 2 + 12} y={(py(origin) + py(end)) / 2 - 12}
              >合向量</text
            >
          {/if}
          <circle cx={px(origin)} cy={py(origin)} r="5" class="start-point" />
          <text x={px(origin) - 12} y={py(origin) + 24} text-anchor="end">起点</text>
          {#if firstVisible && !speed && norm(a) > 0}
            <circle cx={px(a)} cy={py(a)} r="5" class="endpoint" />
            <text x={px(a) + 12} y={py(a) + 24}>1</text>
          {/if}
          {#if complete && norm(end) > 0}
            <rect x={px(end) - 6} y={py(end) - 6} width="12" height="12" class="endpoint" />
            <text
              x={px(end) + (end.x > (range[0] + range[1]) / 2 ? -15 : 15)}
              y={py(end) - 15}
              text-anchor={end.x > (range[0] + range[1]) / 2 ? 'end' : 'start'}
              >{speed ? '终点' : '共同终点'}</text
            >
          {/if}
          {#if prediction}
            <path
              class="prediction-point"
              d={`M${px(prediction) - 7} ${py(prediction)}h14M${px(prediction)} ${py(prediction) - 7}v14`}
            />
            <text
              class="prediction-label"
              x={px(prediction) + (prediction.x > (range[0] + range[1]) / 2 ? -11 : 11)}
              y={py(prediction) + (prediction.y < range[0] + 2 ? -14 : 22)}
              text-anchor={prediction.x > (range[0] + range[1]) / 2 ? 'end' : 'start'}
              >我的预测</text
            >
          {/if}
          <g
            transform={`translate(${px(position)},${py(position)})`}
            data-testid="robot-position"
            role="img"
            aria-label={`机器人位置 ${pair(position)} 米`}
          >
            <rect x="-10" y="-11" width="20" height="22" rx="5" class="robot" />
            <path class="robot-wheels" d="M-14 -7v14M14 -7v14" />
            <circle cx="-3" cy="-3" r="1.5" class="robot-eye" /><circle
              cx="3"
              cy="-3"
              r="1.5"
              class="robot-eye"
            />
          </g>
        </svg>
        {#if !revealed && step === 0 && !running}
          <button
            class="prediction-surface"
            aria-label="在地图上标记预测，键盘也可用下方坐标输入和标记预测按钮"
            onclick={pickPrediction}
          ></button>
        {/if}
      </div>
      <div class="map-options">
        <label
          ><input type="checkbox" bind:checked={showSum} disabled={!complete} /> 显示总位移（虚线）</label
        >
        {#if !speed}<label
            ><input type="checkbox" bind:checked={parallelogram} disabled={!complete} /> 平行四边形辅助线</label
          >{/if}
      </div>
    </div>
    <div class="commands" data-testid="movement-controls">
      {#if speed}
        <h3>参考速度</h3>
        <div class="component-inputs">
          <IntegerStepper
            label="参考东西速度"
            value={ax}
            unit="m/s"
            onchange={(v) => {
              ax = v;
              changed();
            }}
          />
          <IntegerStepper
            label="参考南北速度"
            value={ay}
            unit="m/s"
            onchange={(v) => {
              ay = v;
              changed();
            }}
          />
        </div>
        <ParameterSlider
          label="速度倍率 k"
          value={k}
          min={-3}
          max={3}
          step={0.1}
          unit="无量纲"
          onchange={(v) => {
            k = v;
            changed();
          }}
        />
        <div class="speed-presets" role="group" aria-label="速度示例">
          {#each [2, -1, 0, -2] as value (value)}<button
              aria-pressed={k === value}
              onclick={() => {
                k = value;
                changed();
              }}
              >{value === 2
                ? '两倍速'
                : value === -1
                  ? '反向'
                  : value === 0
                    ? '静止'
                    : '反向两倍速'}</button
            >{/each}
        </div>
        <p class="fixed-time">运行时间：<strong>{RUN_SECONDS} 秒</strong>（固定）</p>
        <p class="velocity-reading" data-testid="velocity-reading">
          实际速度：{pair(motion.velocity)} m/s
        </p>
      {:else}
        <h3>第一段 a</h3>
        <div class="component-inputs">
          <IntegerStepper
            label="第一段东西位移"
            value={ax}
            unit="m"
            onchange={(v) => {
              ax = v;
              changed();
            }}
          />
          <IntegerStepper
            label="第一段南北位移"
            value={ay}
            unit="m"
            onchange={(v) => {
              ay = v;
              changed();
            }}
          />
        </div>
        <h3>第二段 b</h3>
        <div class="component-inputs">
          <IntegerStepper
            label="第二段东西位移"
            value={bx}
            unit="m"
            onchange={(v) => {
              bx = v;
              changed();
            }}
          />
          <IntegerStepper
            label="第二段南北位移"
            value={by}
            unit="m"
            onchange={(v) => {
              by = v;
              changed();
            }}
          />
        </div>
        <button class="swap-button" onclick={swap}>交换两段指令</button>
      {/if}
      <div class="execution-controls">
        {#if complete && !speed}
          <button class="btn btn-primary btn-sm" disabled={running} onclick={compare}
            >{running ? '移动中…' : '沿合向量走一次'}</button
          >
        {:else}
          <button class="btn btn-primary btn-sm" disabled={complete || running} onclick={execute}
            >{running
              ? '移动中…'
              : complete
                ? '移动已完成'
                : speed
                  ? '执行 1 秒'
                  : '执行下一段'}</button
          >
        {/if}
        <button class="btn btn-ghost btn-sm" onclick={rewind}>回到起点</button>
        {#if !exploring && !complete}<button
            class="btn btn-ghost btn-sm"
            disabled={running}
            onclick={() => {
              exploring = true;
              explanation = false;
            }}>直接探索</button
          >{/if}
      </div>
      <p class="input-note">
        {speed ? '正倍率同向，负倍率反向；时间不变。' : '正数向东或向北，负数向西或向南。'}
      </p>
      <p class="range-note">
        {speed
          ? '参考速度分量为 −5 至 5 的整数 m/s；k 范围 −3 至 3，步长 0.1。'
          : '每段位移分量为 −5 至 5 的整数米，每次加减 1 米；每段执行 1 秒。'}
      </p>
    </div>
  </div>
  <div class="workbench-result" aria-live="polite" data-testid="movement-result">
    {#if revealed}
      <span><strong>{complete ? '执行终点' : '计划终点'}：{pair(end)} m</strong></span>
      <span
        >总位移长度约 {fmt(route.displacementLength)} m · {speed ? '路程' : '两段路程'}约 {fmt(
          route.pathLength,
        )} m{#if complete && !speed}
          · 直达路程约 {fmt(route.displacementLength)} m{/if}</span
      >
      {#if norm(end) === 0}<span>位移为零，方向未定义{cancelled ? '；终点与起点重合' : ''}。</span
        >{/if}
    {:else}<span
        >当前位置：{pair(position)} m · {running
          ? '正在匀速移动。'
          : step === 0
            ? '还没有执行移动。'
            : '先执行第二段，再比较预测。'}</span
      >{/if}
    {#if complete && !speed}
      <span class="comparison-note" data-testid="comparison-feedback">
        {#if running && movement === 'sum'}
          机器人从起点沿虚线移动，方框保留两段移动的终点。
        {:else if compared}
          两次都到达 {pair(end)} m。先走 a 再走 b，与走一次合向量 a+b，终点相同。
          {#if norm(end) === 0}合向量为零，所以这一次机器人停在起点。{/if}
        {:else}
          两段已走完。点击“沿合向量走一次”，比较两次到达的终点。
        {/if}
        这里只比较终点；路线、路程和用时可以不同。
      </span>
    {/if}
  </div>
  {#if error !== null}
    <p class="prediction-feedback" data-testid="prediction-feedback" aria-live="polite">
      {error < 1e-8
        ? '预测与终点一致。'
        : `预测距实际终点 ${fmt(error)} m。分别核对东西、南北两个分量。`}
    </p>
  {/if}
</section>

{#if !revealed && step === 0 && !running}
  <div class="prediction-entry" aria-label="终点预测">
    <p>点击地图，预测位置会吸附到整数点；也可用加减按钮设置坐标。此步可跳过。</p>
    <IntegerStepper
      label="预测 x"
      value={guessX}
      limit={10}
      unit="m"
      onchange={(v) => {
        guessX = v;
      }}
    />
    <IntegerStepper
      label="预测 y"
      value={guessY}
      limit={10}
      unit="m"
      onchange={(v) => {
        guessY = v;
      }}
    />
    <button class="btn btn-outline btn-sm" onclick={markPrediction}>标记预测</button>
  </div>
{/if}

<div class="workbench-explanation">
  <button
    class="btn btn-outline btn-sm"
    disabled={!revealed}
    aria-expanded={explanation}
    onclick={() => {
      explanation = !explanation;
    }}>查看计算</button
  >
  <button
    class="btn btn-ghost btn-sm"
    disabled={hint >= 3}
    onclick={() => {
      hint += 1;
    }}>给一点提示</button
  >
  {#if hint > 0}<p>先分别看东西与南北方向；每段指令都从机器人当时的位置出发。</p>{/if}
  {#if hint > 1}<p>
      {speed
        ? '运行时间固定为 1 秒。倍率同时乘参考速度的两个分量，负数使运动反向。'
        : '把两段的东西分量相加，再把南北分量相加。返回起点需要两个分量分别抵消。'}
    </p>{/if}
  {#if hint > 2}<p>
      {speed
        ? '位移等于速度乘时间。倍率的绝对值决定路程的倍数，正负决定运动方向。'
        : '首尾相接后，从最初起点到最后终点的箭头就是总位移。沿路线走过的两段长度相加才是路程。'}
    </p>{/if}
  {#if explanation && revealed}
    {#if speed}
      <FormulaBlock
        latex={String.raw`\Delta\mathbf r=(k\mathbf v_0)T=${k}\begin{bmatrix}${ax}\\${ay}\end{bmatrix}\times 1\approx\begin{bmatrix}${fmt(end.x)}\\${fmt(end.y)}\end{bmatrix}\,\mathrm m`}
        description="参考速度 v₀ 的分量单位米/秒；T 固定为 1 秒；k 无量纲。结果最多显示两位小数。假设匀速平移，忽略启停加速度。"
      />
    {:else}
      <FormulaBlock
        latex={String.raw`\mathbf a+\mathbf b=\begin{bmatrix}${ax}\\${ay}\end{bmatrix}+\begin{bmatrix}${bx}\\${by}\end{bmatrix}\approx\begin{bmatrix}${fmt(end.x)}\\${fmt(end.y)}\end{bmatrix}\,\mathrm m`}
        description="a、b 为同一坐标系中的二维列向量，各分量单位米；东西和南北分量分别相加。结果最多显示两位小数。"
      />
      {#if cancelled}<p>
          两段沿同一条线往返，路程仍为 {fmt(route.pathLength)} 米，总位移为零。两段箭头按真实位置重合，没有人为错开。
        </p>{/if}
    {/if}
  {/if}
  <p class="model-note">
    解析教学模型：同一地面坐标系中的直线平移，不模拟转身、避障和启停过程。{speed
      ? '速度倍率改变物理指令；执行按钮不代表屏幕播放速度。'
      : ''}坐标范围 {range[0]} 至 {range[1]} 米；自由输入可能改变刻度，比较长度请读取米数。读数最多显示两位小数，显示为
    0 不代表精确为零。
  </p>
</div>

<style>
  .robot-workbench {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    padding: 1rem 1.25rem;
    background: var(--color-base-100);
    scroll-margin-top: 1rem;
  }
  .workbench-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .stages {
    display: flex;
    gap: 0.25rem;
  }
  .stage-button,
  .reset-button,
  .swap-button,
  .speed-presets button {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-field);
    background: var(--color-base-100);
    padding: 0.4rem 0.65rem;
    font-size: var(--font-size-sm);
    color: var(--color-base-content);
  }
  .stage-button[aria-pressed='true'],
  .speed-presets button[aria-pressed='true'] {
    background: var(--color-base-content);
    color: var(--color-base-100);
    border-color: var(--color-base-content);
  }
  button:hover:not(:disabled) {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .task-prompt {
    margin: 0.65rem 0 0.75rem;
    font-size: var(--font-size-sm);
  }
  .workbench-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 21rem;
    gap: 1.25rem;
  }
  .map-column {
    min-width: 0;
  }
  .map-caption {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.35rem;
    font-size: var(--font-size-sm);
  }
  svg {
    display: block;
    width: 100%;
    height: 310px;
    overflow: visible;
  }
  .map-surface {
    position: relative;
  }
  .prediction-surface {
    position: absolute;
    inset: 0;
    border: 0;
    background: transparent;
    cursor: crosshair;
  }
  svg text {
    fill: var(--color-base-content);
    font: 18px var(--font-sans);
  }
  svg .tick {
    font-size: 16px;
    fill: var(--color-text-muted);
  }
  .grid-line {
    stroke: var(--color-base-300);
    stroke-width: 1;
  }
  .axis-line {
    stroke: var(--color-base-content);
    stroke-width: 1;
    opacity: 0.45;
  }
  .move-line {
    stroke: var(--color-primary);
    stroke-width: 4;
  }
  .move-head {
    fill: none;
    stroke: var(--color-primary);
    stroke-width: 1.5;
  }
  .sum-line {
    stroke: var(--color-base-content);
    stroke-width: 1.7;
    stroke-dasharray: 7 5;
  }
  .sum-head {
    fill: none;
    stroke: var(--color-base-content);
    stroke-width: 1.5;
  }
  .construction {
    fill: none;
    stroke: var(--color-base-content);
    stroke-width: 1.5;
    stroke-dasharray: 2 5;
  }
  .start-point {
    fill: var(--color-base-content);
  }
  .endpoint {
    stroke: var(--color-base-content);
    fill: var(--color-base-100);
    stroke-width: 2;
  }
  .prediction-point {
    fill: none;
    stroke: var(--color-base-content);
    stroke-width: 2;
  }
  .prediction-label {
    paint-order: stroke;
    stroke: var(--color-base-100);
    stroke-width: 4px;
    stroke-linejoin: round;
  }
  .robot {
    fill: var(--color-accent);
    stroke: var(--color-base-content);
    stroke-width: 1.5;
  }
  .robot-wheels {
    stroke: var(--color-base-content);
    stroke-width: 3;
  }
  .robot-eye {
    fill: var(--color-base-content);
  }
  .map-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    font-size: var(--font-size-sm);
  }
  .map-options label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .commands {
    padding-left: 1rem;
    border-left: 1px solid var(--color-base-300);
  }
  .commands h3 {
    font-size: var(--font-size-base);
    margin: 0 0 0.25rem;
  }
  .commands h3:not(:first-child) {
    margin-top: 0.65rem;
  }
  .component-inputs {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.65rem;
  }
  .commands :global(.field) {
    gap: 0.15rem;
  }
  .commands :global(.field label) {
    font-size: var(--font-size-sm);
  }
  .commands :global(.numeric-input) {
    width: 100%;
    min-width: 0;
    height: 2.25rem;
    min-height: 2.25rem;
    padding: 0.35rem 0.55rem;
  }
  .commands :global(.field small) {
    font-size: var(--font-size-xs);
    line-height: 1.35;
  }
  .commands :global(.field small:not(.field-error)) {
    display: none;
  }
  .range-note {
    margin-top: 0.35rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }
  .commands :global(.parameter-control) {
    margin-top: 0.65rem;
  }
  .commands :global(.range) {
    margin-top: 0.2rem;
    height: 0.9rem;
  }
  .speed-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.5rem;
  }
  .speed-presets button {
    padding: 0.25rem 0.4rem;
  }
  .swap-button {
    margin-top: 0.65rem;
  }
  .fixed-time,
  .velocity-reading {
    font-size: var(--font-size-sm);
    margin: 0.45rem 0 0;
  }
  .execution-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.7rem;
  }
  .input-note {
    font-size: var(--font-size-sm);
    margin-top: 0.4rem;
    color: var(--color-text-muted);
  }
  .workbench-result {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.35rem 1rem;
    border-top: 1px solid var(--color-base-300);
    margin-top: 0.75rem;
    padding-top: 0.65rem;
    font-size: var(--font-size-sm);
    font-variant-numeric: tabular-nums;
  }
  .comparison-note {
    flex-basis: 100%;
  }
  .prediction-feedback {
    margin-top: 0.5rem;
    font-size: var(--font-size-sm);
  }
  .prediction-entry {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: end;
    margin-top: 0.75rem;
  }
  .prediction-entry > p {
    flex-basis: 100%;
    font-size: var(--font-size-sm);
  }
  .prediction-entry :global(.field) {
    width: 10rem;
  }
  .workbench-explanation {
    margin-top: 0.75rem;
  }
  .workbench-explanation > p {
    margin-top: 0.75rem;
  }
  .model-note {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
</style>
