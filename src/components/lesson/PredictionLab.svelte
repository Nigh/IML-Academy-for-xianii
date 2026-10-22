<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    prompt,
    options,
    hints,
    explanation,
    context,
    resetVersion = 0,
    children,
  }: {
    prompt: string;
    options: readonly { text: string; correct: boolean; observation: string }[];
    hints: readonly string[];
    explanation: string;
    context: string;
    resetVersion?: number;
    children: Snippet;
  } = $props();
  const uid = $props.id();
  let choice = $state<number | null>(null);
  let exploring = $state(false);
  let checkedContext = $state<string | null>(null);
  let hint = $state(0);
  let showExplanation = $state(false);
  const checked = $derived(checkedContext === context);
  $effect(() => {
    void resetVersion;
    choice = null;
    checkedContext = null;
    hint = 0;
    showExplanation = false;
  });
  function choose(index: number) {
    choice = index;
    checkedContext = null;
    showExplanation = false;
  }
</script>

<div class="prediction" data-testid="prediction-lab">
  <fieldset>
    <legend>{prompt}</legend>
    {#each options as option, index (index)}
      <label>
        <input type="radio" name={uid} checked={choice === index} onchange={() => choose(index)} />
        <span>{option.text}</span>
      </label>
    {/each}
  </fieldset>
  <div class="actions">
    <button class="btn btn-outline" onclick={() => (exploring = true)}
      >{choice === null ? '直接探索' : '用实验检验预测'}</button
    >
    {#if !exploring}<span>可以先想一想，也可以直接操作。</span>{/if}
  </div>
  <div hidden={!exploring}>
    {@render children()}
    <div class="actions">
      <button
        class="btn btn-outline"
        disabled={choice === null}
        onclick={() => {
          checkedContext = context;
          showExplanation = false;
        }}>对照我的预测</button
      >
      <button class="btn btn-ghost" disabled={hint >= hints.length} onclick={() => (hint += 1)}
        >给一点提示</button
      >
      <button
        class="btn btn-ghost"
        onclick={() => (showExplanation = !showExplanation)}
        aria-expanded={showExplanation}>查看推理</button
      >
    </div>
    <div aria-live="polite">
      {#if checked && choice !== null}
        <p class:correct={options[choice].correct}>
          {options[choice].correct ? '这个预测与数学关系一致。' : '再检查一个对照。'}
          {options[choice].observation}
        </p>
      {:else if checkedContext !== null}<p>参数已改变，请重新对照当前实验；上次反馈已清除。</p>{/if}
      {#each hints.slice(0, hint) as text (text)}<p>{text}</p>{/each}
      {#if showExplanation}<p>{explanation}</p>{/if}
    </div>
  </div>
</div>

<style>
  .prediction {
    min-width: 0;
  }
  fieldset {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    padding: 1rem;
    min-width: 0;
  }
  legend {
    font-weight: 600;
    padding: 0 0.25rem;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 44px;
    padding: 0.5rem;
    cursor: pointer;
  }
  input {
    flex-shrink: 0;
    accent-color: var(--color-primary);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  .actions span {
    font-size: var(--font-size-sm);
  }
  button {
    min-height: 44px;
    white-space: normal;
    height: auto;
  }
  p,
  span,
  legend {
    overflow-wrap: anywhere;
  }
  .prediction :global(.btn) {
    max-width: 100%;
    height: auto;
    min-height: 44px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .prediction :global(select) {
    max-width: 100%;
  }
  .correct {
    color: var(--color-success);
  }
</style>
