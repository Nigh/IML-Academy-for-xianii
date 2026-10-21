<script lang="ts">
  import { onMount } from 'svelte';
  let {
    index,
    maxSteps,
    finished = false,
    speed,
    onstep,
    onreset,
    onspeedchange,
  }: {
    index: number;
    maxSteps: number;
    finished?: boolean;
    speed: number;
    onstep: () => void;
    onreset: () => void;
    onspeedchange: (speed: number) => void;
  } = $props();
  let playing = $state(false),
    reduced = $state(false);
  const ended = $derived(finished || index >= maxSteps);
  onMount(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = media.matches;
    const motion = () => {
      reduced = media.matches;
      if (reduced) playing = false;
    };
    const hidden = () => {
      if (document.hidden) playing = false;
    };
    media.addEventListener('change', motion);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      media.removeEventListener('change', motion);
      document.removeEventListener('visibilitychange', hidden);
    };
  });
  $effect(() => {
    if (ended || reduced) {
      playing = false;
      return;
    }
    if (!playing || !Number.isFinite(speed) || speed <= 0) return;
    const timer = setInterval(
      () => {
        if (!document.hidden) onstep();
        else playing = false;
      },
      1000 / Math.min(20, speed),
    );
    return () => clearInterval(timer);
  });
</script>

<div class="simulation-controls">
  <button class="btn btn-sm" disabled={ended || playing} onclick={onstep}>单步</button>
  <button class="btn btn-sm" disabled={ended || reduced} onclick={() => (playing = !playing)}
    >{playing && !ended ? '暂停' : '播放'}</button
  >
  <button
    class="btn btn-sm btn-outline"
    onclick={() => {
      playing = false;
      onreset();
    }}>重置迭代</button
  >
  <label
    >播放速度（步/秒）<select
      class="select select-sm"
      value={speed}
      onchange={(e) => onspeedchange(Number(e.currentTarget.value))}
      >{#each [1, 2, 5, 10] as s (s)}<option value={s}>{s}</option>{/each}</select
    ></label
  >
  <output aria-live="polite"
    >第 {index} / {maxSteps} 步 · {ended ? '已结束' : playing ? '播放中' : '已暂停'}</output
  >
  {#if reduced}<p>已遵循减少动态效果设置，请使用单步。</p>{/if}
</div>

<style>
  .simulation-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }
  label {
    display: grid;
    gap: 0.25rem;
  }
</style>
