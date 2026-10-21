<script lang="ts">
  import katex from 'katex';
  let {
    latex,
    description,
    inline = false,
  }: { latex: string; description: string; inline?: boolean } = $props();
  const result = $derived.by(() => {
    try {
      return {
        html: katex.renderToString(latex, {
          displayMode: !inline,
          throwOnError: true,
          trust: false,
          output: 'htmlAndMathml',
        }),
        error: '',
      };
    } catch {
      return { html: '', error: `公式暂时无法显示：${description}` };
    }
  });
</script>

<div class:formula-block={!inline}>
  {#if result.error}<p role="alert">{result.error}</p>
    <code>{latex}</code>
  {:else}<div class="formula-render">{@html result.html}</div>
    <p class="formula-description">{description}</p>{/if}
</div>
