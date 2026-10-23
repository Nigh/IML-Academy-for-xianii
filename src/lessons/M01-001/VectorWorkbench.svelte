<script lang="ts">
  import { onMount } from 'svelte';
  import IntegerStepper from '../../components/interactive/IntegerStepper.svelte';
  import { experiment } from './experiment.ts';

  let stage = $state<'displacement' | 'frame'>('displacement');
  let x = $state(3),
    y = $state(4),
    degrees = $state(0);
  let complete = $state(false),
    running = $state(false);
  let position = $state({ x: 0, y: 0 });
  let showDistance = $state(false),
    showComponents = $state(false);
  let prediction = $state<'same' | 'changed' | null>(null);
  let observed = $state(false);
  let frame = 0;
  const uid = $props.id();
  const result = $derived(experiment(x, y, degrees));
  const extent = $derived(Math.max(6, Math.ceil(result.length) + 1));
  const scale = $derived(180 / extent);
  const ticks = $derived(Array.from({ length: 2 * extent + 1 }, (_, i) => i - extent));
  const axes = $derived(
    degrees === 0
      ? 'x 轴向东，y 轴向北'
      : degrees === 90
        ? 'x′ 轴向北，y′ 轴向西'
        : degrees === 180
          ? 'x′ 轴向西，y′ 轴向南'
          : 'x′ 轴向南，y′ 轴向东',
  );
  const fmt = (value: number) => String(Number(value.toFixed(2)));
  const pair = (point: { x: number; y: number }) => `(${fmt(point.x)}, ${fmt(point.y)})`;

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    running = false;
  }
  function rewind() {
    stop();
    complete = false;
    position.x = 0;
    position.y = 0;
    prediction = null;
    observed = false;
  }
  function setDisplacement(nextX: number, nextY: number) {
    rewind();
    x = nextX;
    y = nextY;
  }
  function reset() {
    setDisplacement(3, 4);
    showDistance = false;
    showComponents = false;
    stage = 'displacement';
    degrees = 0;
  }
  function chooseStage(next: 'displacement' | 'frame') {
    if (running) rewind();
    stage = next;
    degrees = 0;
    prediction = null;
    observed = false;
    showDistance = false;
    showComponents = false;
  }
  function finish() {
    stop();
    position.x = x;
    position.y = y;
    complete = true;
  }
  function execute() {
    if (running || complete || document.hidden) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    running = true;
    const started = performance.now();
    const move = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - started) / 1000));
      position.x = x * progress;
      position.y = y * progress;
      if (progress === 1) finish();
      else frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
  }
  function rotateAxes() {
    if (!complete || running) return;
    degrees = degrees === 180 ? -90 : degrees + 90;
    observed = true;
    showComponents = true;
  }
  onMount(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = () => {
      if (preference?.matches && running) finish();
    };
    const visibility = () => {
      if (document.hidden && running) rewind();
    };
    preference?.addEventListener('change', reduce);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      stop();
      preference?.removeEventListener('change', reduce);
      document.removeEventListener('visibilitychange', visibility);
    };
  });
</script>

<section class="vector-workbench" aria-label="机器人位移与坐标实验" data-testid="intro-workbench">
  <div class="workbench-heading">
    <div class="stages" role="group" aria-label="观察任务">
      <button aria-pressed={stage === 'displacement'} onclick={() => chooseStage('displacement')}
        >描述位移</button
      >
      <button aria-pressed={stage === 'frame'} onclick={() => chooseStage('frame')}>换坐标轴</button
      >
    </div>
    <button onclick={reset}>复位实验</button>
  </div>
  <p class="task-prompt">
    {stage === 'displacement'
      ? '给机器人设置一个终点，再比较位移的方向和直线距离。'
      : '先让机器人到达终点，再转动读数坐标轴；留意什么改变、什么保持不变。'}
  </p>
  <div class="workbench-main">
    <div class="map-column">
      <div class="map-caption">
        <span
          >{running
            ? '移动中 · 匀速运行 1 秒'
            : complete
              ? '移动已完成'
              : '机器人在起点，等待执行'}</span
        ><span>起点 (0,0) · 右为东，上为北 · 米</span>
      </div>
      <svg
        viewBox="0 0 480 400"
        role="img"
        aria-label={`机器人地图，按东、北记录的当前位置 ${pair(position)} 米；${axes}，横纵等比例，范围负 ${extent} 至 ${extent} 米。`}
      >
        <defs>
          <marker
            id={`${uid}-move`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"><path d="M1 1L9 5L1 9" class="move-head" /></marker
          >
          <marker
            id={`${uid}-axis`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"><path d="M1 1L9 5L1 9" class="axis-head" /></marker
          >
        </defs>
        <g transform={`translate(240 200) rotate(${-degrees})`} data-testid="intro-axes">
          {#each ticks as tick (tick)}
            <line class="grid-line" x1={tick * scale} y1="-180" x2={tick * scale} y2="180" />
            <line class="grid-line" x1="-180" y1={-tick * scale} x2="180" y2={-tick * scale} />
            {#if tick !== 0}
              <text
                class="tick"
                x={tick * scale}
                y="18"
                text-anchor="middle"
                transform={`rotate(${degrees},${tick * scale},18)`}>{tick}</text
              >
              <text
                class="tick"
                x="-12"
                y={-tick * scale + 5}
                text-anchor="end"
                transform={`rotate(${degrees},-12,${-tick * scale + 5})`}>{tick}</text
              >
            {/if}
          {/each}
          <line
            class="axis-line"
            x1="-180"
            y1="0"
            x2="180"
            y2="0"
            marker-end={`url(#${uid}-axis)`}
          />
          <line
            class="axis-line"
            x1="0"
            y1="180"
            x2="0"
            y2="-180"
            marker-end={`url(#${uid}-axis)`}
          />
          <text x="166" y="-12" transform={`rotate(${degrees},166,-12)`}
            >{degrees === 0 ? 'x' : 'x′'}</text
          >
          <text x="12" y="-166" transform={`rotate(${degrees},12,-166)`}
            >{degrees === 0 ? 'y' : 'y′'}</text
          >
        </g>
        {#if complete && showDistance && result.length > 0}
          <circle
            class="distance-circle"
            data-testid="same-distance-circle"
            cx="240"
            cy="200"
            r={result.length * scale}
          />
        {/if}
        {#if complete && showComponents && result.length > 0}
          <path
            class="component-guide"
            data-testid="component-guide"
            d={`M240 200L${240 + result.componentCorner.x * scale} ${200 - result.componentCorner.y * scale}L${240 + x * scale} ${200 - y * scale}`}
          />
        {/if}
        <circle class="start-point" cx="240" cy="200" r="5" />
        {#if complete && result.length > 0}
          <line
            class="move-line"
            data-testid="intro-vector"
            x1="240"
            y1="200"
            x2={240 + x * scale}
            y2={200 - y * scale}
            marker-end={`url(#${uid}-move)`}
          />
          <text
            x={240 + x * scale + (x >= 0 ? 14 : -14)}
            y={200 - y * scale - 15}
            text-anchor={x >= 0 ? 'start' : 'end'}>终点</text
          >
        {/if}
        <g
          transform={`translate(${240 + position.x * scale},${200 - position.y * scale})`}
          data-testid="intro-robot"
          role="img"
          aria-label={`机器人位置 ${pair(position)} 米`}
        >
          <rect class="robot" x="-10" y="-11" width="20" height="22" rx="5" />
          <path class="wheels" d="M-14 -7v14M14 -7v14" />
          <circle class="eye" cx="-3" cy="-3" r="1.5" /><circle
            class="eye"
            cx="3"
            cy="-3"
            r="1.5"
          />
        </g>
      </svg>
      <div class="map-options">
        <label
          ><input
            type="checkbox"
            bind:checked={showDistance}
            disabled={!complete}
          />显示相同距离的位置（点线圆）</label
        >
        <label
          ><input
            type="checkbox"
            bind:checked={showComponents}
            disabled={!complete}
          />显示分量辅助线（虚线）</label
        >
      </div>
    </div>
    <div class="commands" data-testid="intro-controls">
      <h3>给出东西、南北两个分量</h3>
      <div class="component-inputs">
        <IntegerStepper label="东西位移" value={x} onchange={(v) => setDisplacement(v, y)} />
        <IntegerStepper label="南北位移" value={y} onchange={(v) => setDisplacement(x, v)} />
      </div>
      <div class="presets" role="group" aria-label="位移例子">
        <button onclick={() => setDisplacement(3, 4)}>东北方向</button>
        <button onclick={() => setDisplacement(-3, 4)}>西北方向</button>
        <button onclick={() => setDisplacement(0, 0)}>零位移</button>
      </div>
      <div class="execution-controls">
        <button class="btn btn-primary btn-sm" disabled={complete || running} onclick={execute}
          >{running ? '移动中…' : complete ? '移动已完成' : '执行移动（1 秒）'}</button
        >
        <button class="btn btn-ghost btn-sm" onclick={rewind}>回到起点</button>
      </div>
      {#if stage === 'frame'}
        <div class="frame-controls">
          <h3>只改变读数坐标轴</h3>
          <p>{axes} · 转角 {degrees}°</p>
          {#if !observed}
            <p>转轴后，直线距离会变吗？可先预测再转。</p>
            <div class="predictions" role="group" aria-label="长度预测">
              <button aria-pressed={prediction === 'same'} onclick={() => (prediction = 'same')}
                >长度不变</button
              >
              <button
                aria-pressed={prediction === 'changed'}
                onclick={() => (prediction = 'changed')}>长度改变</button
              >
            </div>
          {/if}
          <div class="axis-buttons">
            <button
              class="btn btn-outline btn-sm"
              disabled={!complete || running}
              onclick={rotateAxes}>坐标轴逆时针转 90°</button
            >
            <button
              class="btn btn-ghost btn-sm"
              disabled={degrees === 0}
              onclick={() => {
                degrees = 0;
                prediction = null;
                observed = false;
              }}>坐标轴回正</button
            >
          </div>
        </div>
      {/if}
      <dl class="scalar-readings">
        <div>
          <dt>温度记录（固定例子）</dt>
          <dd>25°C</dd>
        </div>
        <div>
          <dt>{complete ? '直线距离（标量）' : '计划直线距离'}</dt>
          <dd data-testid="intro-length">{fmt(result.length)} m</dd>
        </div>
      </dl>
      <p class="range-note">
        位移分量为 −5 至 5 的整数米；每次加减 1 米。坐标轴转动不改变地图上的位置。
      </p>
    </div>
  </div>
  <div class="workbench-result" data-testid="intro-result" aria-live="polite">
    <span>地图位置（东，北）：{pair(position)} m</span>
    <span data-testid="intro-components"
      >{complete ? '已完成位移' : '指令位移'}的分量（{degrees === 0 ? 'x，y' : 'x′，y′'}）：{pair(
        result.components,
      )} m</span
    >
    <span
      >{result.direction === null
        ? '零位移：方向未定义。'
        : complete
          ? '实线箭头表示从起点到终点的位移。'
          : '执行完成后显示位移箭头。'}</span
    >
    {#if stage === 'frame' && observed}
      <span class="feedback" data-testid="axis-feedback"
        >{prediction === 'changed'
          ? '长度没有改变。'
          : prediction === 'same'
            ? '预测正确。'
            : ''}只转了坐标轴，机器人没有移动；分量为 {pair(result.components)} m，直线距离仍为 {fmt(
          result.length,
        )} m。</span
      >
    {/if}
  </div>
</section>
<p class="model-note">
  解析计算：同原点、互相垂直、每单位同为 1
  米的二维坐标；机器人仅作直线平移，忽略朝向、障碍与启停。图中范围为 −{extent} 至 {extent} 米，两轴等比例；{extent >
  6
    ? '为显示完整的等距离圆，当前刻度范围已扩大；比较距离请读米数。'
    : '默认每格 1 米。'}虚线只是分量辅助线，机器人沿直线移动。读数最多两位小数，舍入不改变零向量的判定。
</p>

<style>
  .vector-workbench {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    padding: 1rem;
    scroll-margin-top: 1rem;
  }
  .workbench-heading,
  .stages,
  .presets,
  .predictions,
  .axis-buttons,
  .execution-controls,
  .map-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
  }
  .workbench-heading {
    justify-content: space-between;
  }
  .workbench-heading button,
  .presets button,
  .predictions button {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-field);
    padding: 0.4rem 0.65rem;
    color: var(--color-base-content);
    background: transparent;
    font-size: var(--font-size-sm);
    min-height: 2.25rem;
  }
  button[aria-pressed='true'] {
    background: var(--color-base-content);
    color: var(--color-base-100);
  }
  button:hover:not(:disabled) {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .task-prompt {
    font-size: var(--font-size-sm);
    margin: 0.65rem 0 0.75rem;
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
    height: 330px;
    overflow: visible;
  }
  svg text {
    fill: var(--color-base-content);
    font: 18px var(--font-sans);
  }
  .tick {
    fill: var(--color-text-muted);
    font-size: 16px;
  }
  .grid-line {
    stroke: var(--color-base-300);
    stroke-width: 1;
  }
  .axis-line {
    stroke: var(--color-text-muted);
    stroke-width: 1.5;
  }
  .axis-head {
    stroke: var(--color-text-muted);
    stroke-width: 1.5;
    fill: none;
  }
  .move-line,
  .move-head {
    stroke: var(--color-primary);
    stroke-width: 3;
    fill: none;
  }
  .distance-circle {
    fill: none;
    stroke: var(--color-text-muted);
    stroke-width: 2;
    stroke-dasharray: 2 5;
  }
  .component-guide {
    fill: none;
    stroke: var(--color-base-content);
    stroke-width: 2;
    stroke-dasharray: 7 5;
  }
  .start-point {
    fill: var(--color-base-content);
  }
  .robot {
    fill: var(--color-accent);
    stroke: var(--color-base-content);
    stroke-width: 2;
  }
  .wheels {
    stroke: var(--color-base-content);
    stroke-width: 3;
  }
  .eye {
    fill: var(--color-base-100);
  }
  .map-options {
    margin-top: 0.4rem;
    gap: 0.5rem 1rem;
    font-size: var(--font-size-sm);
  }
  .map-options label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .commands {
    border-left: 1px solid var(--color-base-300);
    padding-left: 1rem;
  }
  .commands h3 {
    margin: 0 0 0.25rem;
    font-size: var(--font-size-base);
  }
  .component-inputs {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.65rem;
  }
  .presets,
  .execution-controls {
    margin-top: 0.6rem;
  }
  .frame-controls {
    margin-top: 0.75rem;
  }
  .frame-controls p {
    font-size: var(--font-size-sm);
    margin: 0.3rem 0;
  }
  .axis-buttons {
    margin-top: 0.4rem;
  }
  .scalar-readings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  .scalar-readings dt {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
  .scalar-readings dd {
    margin: 0;
    font-size: var(--font-size-base);
    font-variant-numeric: tabular-nums;
  }
  .range-note {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    line-height: 1.4;
    margin-top: 0.5rem;
  }
  .workbench-result {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.35rem 1rem;
    margin-top: 0.75rem;
    padding-top: 0.65rem;
    border-top: 1px solid var(--color-base-300);
    font-size: var(--font-size-sm);
    font-variant-numeric: tabular-nums;
  }
  .feedback {
    flex-basis: 100%;
  }
  .model-note {
    margin-top: 0.65rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
</style>
