<script lang="ts">
  let { items }: { items: readonly { mistake: string; correction: string }[] } = $props();
</script>

<dl>
  {#each items as item (item.mistake)}<dt><strong>{item.mistake}</strong></dt>
    <dd>{item.correction}</dd>{/each}
</dl>
