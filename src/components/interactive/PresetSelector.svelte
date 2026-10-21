<script lang="ts">
  let {
    presets,
    value,
    defaultId,
    onchange,
  }: {
    presets: readonly { id: string; name: string; description: string }[];
    value: string;
    defaultId: string;
    onchange: (id: string) => void;
  } = $props();
</script>

<fieldset>
  <legend>实验预设</legend>
  <div class="presets">
    {#each presets as p (p)}<button
        class="btn btn-sm btn-outline"
        aria-pressed={value === p.id}
        onclick={() => onchange(p.id)}>{p.name}</button
      >{/each}<button class="btn btn-sm btn-ghost" onclick={() => onchange(defaultId)}
      >恢复默认预设</button
    >
  </div>
  <p>{presets.find((p) => p.id === value)?.description ?? '自定义参数'}</p>
</fieldset>

<style>
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  fieldset {
    min-width: 0;
    border: 0;
    padding: 0;
  }
  legend {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
</style>
