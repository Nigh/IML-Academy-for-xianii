<script lang="ts">
  import type { Snippet } from 'svelte';
  import FormulaBlock from '../math/FormulaBlock.svelte';
  let { term, notation, children }: { term: string; notation?: string; children: Snippet } =
    $props();
</script>

<section>
  <h3>{term}</h3>
  {#if notation}<FormulaBlock latex={notation} description={term} />{/if}{@render children()}
</section>
