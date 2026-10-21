<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    title,
    instructions,
    meaning,
    limitations,
    onreset,
    children,
  }: {
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
      <span class="eyebrow">交互实验 · 解析计算</span>
      <h3>{title}</h3>
    </div>
    <button class="btn btn-sm btn-ghost" onclick={onreset}>复位 ↺</button>
  </div>
  <p class="muted">{instructions}</p>
  {@render children()}
  <p class="experiment-meaning">{meaning}</p>
  <p class="metadata">实验边界：{limitations}</p>
</div>
