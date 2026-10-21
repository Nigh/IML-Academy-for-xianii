<script lang="ts">
  import NumericInput from '../interactive/NumericInput.svelte';
  let {
    values,
    rowLabels = [],
    columnLabels = [],
    readonly = true,
    highlight = [],
    oncellchange,
  }: {
    values: number[][];
    rowLabels?: string[];
    columnLabels?: string[];
    readonly?: boolean;
    highlight?: readonly [number, number][];
    oncellchange?: (row: number, column: number, value: number) => void;
  } = $props();
  const valid = $derived(
    values.length > 0 &&
      values.length <= 100 &&
      values[0].length > 0 &&
      values[0].length <= 100 &&
      values.every((r) => r.length === values[0].length && r.every(Number.isFinite)),
  );
</script>

{#if !valid}<p role="status">矩阵须为非空矩形，元素必须有限，最多 100 × 100。</p>{:else}<div
    class="matrix"
  >
    <table>
      <caption>矩阵 · {values.length} × {values[0].length}</caption><thead
        ><tr
          ><th scope="col">行 / 列</th>{#each values[0].map((_, j) => j) as j (j)}<th scope="col"
              >{columnLabels[j] ?? j + 1}</th
            >{/each}</tr
        ></thead
      ><tbody
        >{#each values as row, i (i)}<tr
            ><th scope="row">{rowLabels[i] ?? i + 1}</th>{#each row as n, j (j)}<td
                class:highlight={highlight.some(([r, c]) => r === i && c === j)}
                >{#if readonly || !oncellchange}{n}{:else}<NumericInput
                    label={`第 ${i + 1} 行，第 ${j + 1} 列`}
                    value={n}
                    min={-1e6}
                    max={1e6}
                    step={0.01}
                    onchange={(v) => oncellchange?.(i, j, v)}
                  />{/if}</td
              >{/each}</tr
          >{/each}</tbody
      >
    </table>
  </div>{/if}

<style>
  .matrix {
    overflow: auto;
  }
  td,
  th {
    padding: 0.5rem;
    border: 1px solid var(--color-base-300);
  }
  .highlight {
    background: var(--color-base-200);
    font-weight: 700;
    text-decoration: underline;
  }
  caption {
    text-align: left;
  }
</style>
