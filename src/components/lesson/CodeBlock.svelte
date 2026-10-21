<script lang="ts">
  let { code, language, filename }: { code: string; language: string; filename?: string } =
    $props();
  let feedback = $state('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      feedback = '已复制';
    } catch {
      feedback = '无法复制，请手动选择代码';
    }
  }
</script>

<figure>
  <figcaption>{filename ?? language}</figcaption>
  <pre><code>{code}</code></pre>
  <button class="btn btn-sm" onclick={copy}>复制代码</button>
  <p role="status">{feedback}</p>
</figure>

<style>
  figure {
    max-width: 100%;
    margin: 1rem 0;
  }
  pre {
    overflow: auto;
    padding: 1rem;
    background: var(--color-base-200);
    font-size: var(--font-size-sm);
  }
</style>
