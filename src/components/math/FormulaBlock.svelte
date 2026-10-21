<script lang="ts">
  import katex from 'katex';
  let {
    latex,
    description,
    inline = false,
    number,
    variables = [],
  }: {
    latex: string;
    description: string;
    inline?: boolean;
    number?: string;
    variables?: readonly { symbol: string; meaning: string }[];
  } = $props();
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

{#if inline}
  <span class="inline-formula" title={description}>
    {#if result.error}<span role="alert">{result.error}</span><code>{latex}</code>
    {:else}{@html result.html}{#if number}<span> ({number})</span>{/if}<span class="sr-only"
        >{description}</span
      >{/if}
  </span>
{:else}
  <div class="formula-block">
    {#if result.error}<p role="alert">{result.error}</p>
      <code>{latex}</code>
    {:else}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal formula scrolling.) -->
      <div class="formula-render" tabindex="0" role="region" aria-label={description}>
        {@html result.html}
      </div>
      {#if number}<span>({number})</span>{/if}
      {#if variables.length}<dl>
          {#each variables as v (v.symbol)}<dt>{v.symbol}</dt>
            <dd>{v.meaning}</dd>{/each}
        </dl>{/if}
      <p class="formula-description">{description}</p>{/if}
  </div>
{/if}
