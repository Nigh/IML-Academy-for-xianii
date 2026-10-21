<script lang="ts">
  let { items }: { items: readonly { title: string; source: string; url: string }[] } = $props();
  const safe = (url: string) => {
    try {
      return ['https:', 'http:'].includes(new URL(url).protocol);
    } catch {
      return false;
    }
  };
</script>

<ul>
  {#each items as item (item.url)}<li>
      {#if safe(item.url)}<a href={item.url} rel="noreferrer">{item.title} · {item.source}</a
        >{:else}{item.title} · 地址无效{/if}
    </li>{/each}
</ul>
