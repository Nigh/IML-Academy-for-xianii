<script lang="ts">
  import type { Snippet } from 'svelte';
  let { prompt, answer }: { prompt: string; answer: Snippet } = $props();
</script>

<details><summary>{prompt}</summary>{@render answer()}</details>
