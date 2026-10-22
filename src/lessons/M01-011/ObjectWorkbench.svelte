<script lang="ts">
  let {
    a,
    b,
    product,
    i,
    j,
    onselect,
    onquantity,
  }: {
    a: number[][];
    b: number[][];
    product: number[][];
    i: number;
    j: number;
    onselect: (i: number, j: number) => void;
    onquantity: (k: number, n: number) => void;
  } = $props();
  const recipe = $derived(a[0].length === 3);
</script>

<section class="workbench" data-testid="object-workbench" aria-label="订单资源汇总工作台">
  <h3>{recipe ? '给一批订单补货' : '比较两步变换的顺序'}</h3>
  {#if recipe}
    <p>
      两批订单各有三种产品。A 是产品数量，B 每行是该产品的两种资源需求（资源单位/件）；AB
      是各批资源总量。编辑为负数或小数后按带符号数量的数学模型解释，不再当成实物订单。
    </p>
    <div class="actions">
      {#each a.keys() as row (row)}<button
          class="btn"
          aria-pressed={i === row}
          onclick={() => onselect(row, j)}>查看第 {row + 1} 批订单</button
        >{/each}{#each b[0].keys() as col (col)}<button
          class="btn"
          aria-pressed={j === col}
          onclick={() => onselect(i, col)}>核算资源 {col + 1}</button
        >{/each}
    </div>
    {#each a[i] as quantity, k (k)}
      <div class="actions">
        <span>产品 {k + 1}：{quantity} 件 × {b[k][j]} 资源/件 = {quantity * b[k][j]}</span><button
          class="btn"
          disabled={quantity >= 1e6}
          onclick={() => onquantity(k, Math.min(1e6, quantity + 1))}>产品 {k + 1} 加一件</button
        >
      </div>
    {/each}
    <p data-testid="object-reading" aria-live="polite">
      第 {i + 1} 批资源 {j + 1} 总量：{product[i][
        j
      ]}。改变一件产品后，总量增加该产品对应的单位需求。
    </p>
    <p>试着只改变资源 2 的需求，预测资源 1 的合计是否会变。相同产品轴必须按同一顺序匹配。</p>
  {:else}
    <p>
      此预设是无量纲剪切与缩放，不能解释为订单。两种操作都合法，但交换顺序会改变结果；用下方 AB、BA
      逐格核对。右侧矩阵先作用。
    </p>
    <p data-testid="object-reading">订单对象仅用于 2×3 乘 3×2 的预设；这里保留数学操作。</p>
  {/if}
</section>

<style>
  .workbench {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    padding: 1rem;
    margin-block: 1rem;
    min-width: 0;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 0.75rem;
  }
  button {
    min-height: 44px;
    height: auto;
    white-space: normal;
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
