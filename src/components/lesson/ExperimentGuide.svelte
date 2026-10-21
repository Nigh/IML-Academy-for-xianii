<script lang="ts">
  let { steps }: { steps: readonly string[] } = $props();
</script>

<ol>
  {#each steps as step (step)}<li>{step}</li>{/each}
</ol>
