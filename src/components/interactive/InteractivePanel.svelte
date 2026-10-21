<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    title,
    instructions,
    meaning,
    limitations,
    onreset,
    children,
    computationKind = 'analytic',
    seed,
    sampleCount,
  }: {
    computationKind?: 'analytic' | 'simulation' | 'precomputed';
    seed?: number;
    sampleCount?: number;
    title: string;
    instructions: string;
    meaning: string;
    limitations: string;
    onreset: () => void;
    children: Snippet;
  } = $props();
</script>

<div class="interactive-panel">
  <div class="panel-heading">
    <div>
      <span class="eyebrow"
        >交互实验 · {computationKind === 'analytic'
          ? '解析计算'
          : computationKind === 'simulation'
            ? '数值模拟 / 随机采样'
            : '预计算参考'}</span
      >
      <h3>{title}</h3>
    </div>
    <button class="btn btn-sm btn-ghost" onclick={onreset}>复位 ↺</button>
  </div>
  {#if seed !== undefined}<p>seed = {seed} · 样本数 = {sampleCount ?? 0}</p>{/if}
  <p class="muted">{instructions}</p>
  {@render children()}
  <p class="experiment-meaning">{meaning}</p>
  <p class="metadata">实验边界：{limitations}</p>
</div>
