<script lang="ts">
  let {
    x,
    output,
    t,
    hasKernel,
    onbalance,
  }: {
    x: { x: number; y: number };
    output: number[];
    t: number;
    hasKernel: boolean;
    onbalance: (t: number) => void;
  } = $props();
</script>

<section class="workbench" data-testid="object-workbench" aria-label="两路带符号信号混合台">
  <h3>改变两路输入，仪表能看见吗？</h3>
  <p>
    输入可正可负，表示有方向的理想信号。平衡键给第一路增加、第二路减少相同量；目标读数保持固定。单位矩阵模式分别读取两路，没有可隐藏的非零变化。
  </p>
  <div class="actions">
    <button
      class="btn"
      disabled={!hasKernel || t >= 3}
      onclick={() => onbalance(Math.min(3, t + 0.5))}>第一路加半格，第二路减半格</button
    ><button
      class="btn"
      disabled={!hasKernel || t <= -3}
      onclick={() => onbalance(Math.max(-3, t - 0.5))}>第一路减半格，第二路加半格</button
    >
  </div>
  <svg
    viewBox="0 0 360 230"
    role="img"
    aria-label={`输入信号${x.x.toFixed(2)}和${x.y.toFixed(2)}，仪表输出${output.join(',')}`}
  >
    <rect x="15" y="15" width="140" height="75" rx="8" class="floor" /><text x="25" y="40"
      >第一路输入</text
    ><text data-testid="channel-one" x="25" y="70">{x.x.toFixed(2)}</text>
    <rect x="15" y="125" width="140" height="75" rx="8" class="floor" /><text x="25" y="150"
      >第二路输入</text
    ><text x="25" y="180">{x.y.toFixed(2)}</text>
    <path d="M155,52H190V110H215 M155,162H190V110" class="path" />
    <rect x="215" y="55" width="130" height="115" rx="8" class="object" /><text x="225" y="85"
      >输出仪表</text
    ><text x="225" y="115">{output.map((n) => Number(n.toFixed(2))).join(' / ')}</text>
    <text x="20" y="222">所有信号无量纲；读数为解析计算</text>
  </svg>
  <p data-testid="object-reading" aria-live="polite">
    输入 ({x.x.toFixed(3)}, {x.y.toFixed(3)})；输出 {output
      .map((n) => n.toFixed(3))
      .join('，')}。{hasKernel
      ? '输入改变但读数不变，变化方向属于零空间。'
      : '每路分别可见，零空间只有零向量；平衡键不可用。'}
  </p>
  <p>把目标从 0 改成 2，再按平衡键。读数为 0 的输入集合与读数为 2 的输入集合是同一个集合吗？</p>
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
  .object {
    fill: var(--color-accent);
    stroke: var(--color-base-content);
    stroke-width: 2;
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
