<script lang="ts">
  import FormulaBlock from '../math/FormulaBlock.svelte';
  let {
    steps,
    index,
    onchange,
  }: {
    steps: readonly { title: string; explanation: string; latex?: string; snapshot?: string }[];
    index: number;
    onchange: (index: number) => void;
  } = $props();
  const current = $derived(steps[index]);
</script>

{#if current}<section aria-label="算法步骤">
    <h3>{index + 1}. {current.title}</h3>
    <p>{current.explanation}</p>
    {#if current.latex}<FormulaBlock
        latex={current.latex}
        description={current.snapshot ?? current.explanation}
      />{:else if current.snapshot}<p>{current.snapshot}</p>{/if}<button
      class="btn btn-sm"
      disabled={index <= 0}
      onclick={() => onchange(index - 1)}>上一步</button
    >
    <button
      class="btn btn-sm"
      disabled={index >= steps.length - 1}
      onclick={() => onchange(index + 1)}>下一步</button
    >
  </section>{/if}
