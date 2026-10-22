<script lang="ts">
  import ObjectWorkbench from './ObjectWorkbench.svelte';
  import PredictionLab from '../../components/lesson/PredictionLab.svelte';
  import { exploration } from './exploration.ts';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import MatrixView from '../../components/math/MatrixView.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import NumericInput from '../../components/interactive/NumericInput.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let a = $state([
      [1, 2, 3],
      [4, 5, 6],
    ]),
    b = $state([
      [7, 8],
      [9, 10],
      [11, 12],
    ]),
    i = $state(0),
    j = $state(0),
    selected = $state('rectangular');
  const result = $derived(experiment(a, b, i, j));
  function select(id: string) {
    if (id === 'rectangular') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      a = p.a.map((r) => [...r]);
      b = p.b.map((r) => [...r]);
      i = 0;
      j = 0;
      selected = id;
    }
  }
  function edit(which: 'a' | 'b', r: number, c: number, value: number) {
    const old = which === 'a' ? a : b;
    const next = old.map((row, k) => row.map((n, l) => (k === r && l === c ? value : n)));
    if (which === 'a') a = next;
    else b = next;
    selected = 'custom';
  }
</script>

<TheorySection id="motivation" title="两批订单要准备多少资源？">
  <p>
    每批订单包含三种产品，每种产品消耗两种资源。给一种产品加一件，观察哪批、哪种资源的总量改变，再把逐项汇总写成矩阵乘法。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    只需前置课程的分量、数乘与相加。这里从头介绍矩阵的行列和乘法，不默认你已经读过编号更早的张量或内积课程。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="加一件产品，核算整批资源">
  <p>逐格查看乘积来源，再编辑一个权重；比较剪切与缩放的AB、BA，找出顺序改变后哪项贡献不同。</p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="每一个乘积从哪里来"
      instructions="先选择批次和资源，给产品加一件并观察汇总；再核对高亮矩阵行列。默认2×3乘3×2，单元格有限值±1e6，非法输入不传播。顺序预设改用无量纲线性变换解释。"
      meaning="A中高亮当前行，B中高亮当前列，AB高亮当前结果。下方列出实际逐项乘积及相加结果；另显示BA，比较形状与顺序。"
      limitations="最多3×3的有界解析模型，无性能基准或训练。小数使用双精度浮点；形状兼容也不保证特征顺序或单位语义兼容。"
      onreset={() => select('rectangular')}
    >
      <PresetSelector {presets} value={selected} defaultId="rectangular" onchange={select} />
      <ObjectWorkbench
        {a}
        {b}
        product={result.product}
        {i}
        {j}
        onselect={(row, col) => {
          i = row;
          j = col;
        }}
        onquantity={(k, n) => edit('a', i, k, n)}
      />
      <h3>A · {a.length}×{a[0].length}</h3>
      <MatrixView
        values={a}
        readonly={false}
        highlight={a[0].map((_, k) => [i, k] as const)}
        oncellchange={(r, c, v) => edit('a', r, c, v)}
      />
      <h3>B · {b.length}×{b[0].length}</h3>
      <MatrixView
        values={b}
        readonly={false}
        highlight={b.map((_, k) => [k, j] as const)}
        oncellchange={(r, c, v) => edit('b', r, c, v)}
      />
      <div class="parameters">
        <NumericInput
          label="结果行索引 i"
          value={i}
          min={0}
          max={a.length - 1}
          integer
          onchange={(v) => (i = v)}
        /><NumericInput
          label="结果列索引 j"
          value={j}
          min={0}
          max={b[0].length - 1}
          integer
          onchange={(v) => (j = v)}
        />
      </div>
      <h3>AB · {result.product.length}×{result.product[0].length}</h3>
      <MatrixView values={result.product} highlight={[[i, j]]} />
      <FormulaBlock
        latex={`(AB)_{${i + 1},${j + 1}}=\\sum_{k=1}^{${a[0].length}}A_{${i + 1},k}B_{k,${j + 1}}`}
        description="高亮行和列的逐项乘积沿共同轴求和。"
      />
      <div aria-live="polite">
        <p>行值：{result.row.join('，')}；列值：{result.column.join('，')}</p>
        <p data-testid="result">逐项乘积：{result.terms.join('，')}；和：{result.product[i][j]}</p>
      </div>
      {#if result.reverse}<h3>BA · {result.reverse.length}×{result.reverse[0].length}</h3>
        <MatrixView values={result.reverse} />{:else}<p>BA不满足内维度兼容，未定义。</p>{/if}
    </InteractivePanel>
  </PredictionLab></TheorySection
>
<TheorySection id="intuition" title="一格是一次行列匹配">
  <p>
    矩阵（matrix）是一张有行、有列的数表。横向是一行，纵向是一列；形状“2×3”表示2行3列，不是一个数乘法结果。某个元素的下标依次是行号、列号。下面公式从1编号，操作面板从0编号。
  </p>
  <p>
    例如用三个特征分别乘三个权重再相加，得到一个输出。如果还想用另一套权重得到另一个输出，就把两套权重放成两行；每一列对应同一输入特征。这是矩阵为何适合记录多个输出的原因。
  </p>
  <FormulaBlock
    latex={String.raw`\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}\begin{pmatrix}7\\9\\11\end{pmatrix}=\begin{pmatrix}1\times7+2\times9+3\times11\\4\times7+5\times9+6\times11\end{pmatrix}=\begin{pmatrix}58\\139\end{pmatrix}`}
    description="左矩阵2×3，输入3×1，输出2×1；本课数值无量纲。一行有3个权重，必须配3个输入。"
  />
  <p>
    右边放多列输入时，对每一列重复同样计算，结果也逐列排列。每个格子都取左矩阵的一整行、右矩阵的一整列，同位置相乘再求和；这个运算也叫行列内积，但不需要先学几何内积课。
  </p>
  <p>
    内维度是左列数与右行数，它们必须相同才能配对；外维度是左行数与右列数，保留为结果形状。求和符号Σ表示把下标遍历到的各项加起来。转置T表示交换行和列；复合映射表示把一次输出继续送进下一次计算，矩阵写法按从右到左的顺序作用。
  </p>
  <KnowledgeCheck
    prompt="迁移：批次样本按行放置，X形状为B×n，列向量约定的权重W为m×n。如何得到B×m输出？"
  >
    {#snippet answer()}<p>
        计算XWᵀ，内维度n配对，每行样本与每行权重求和。不能直接照抄Wx的列向量式而忽略样本轴。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="内维度收缩，外维度保留"
  ><FormulaBlock
    latex={String.raw`A\in\mathbb R^{m\times n},\ B\in\mathbb R^{n\times p},\quad C=AB\in\mathbb R^{m\times p},\quad C_{ij}=\sum_{k=1}^{n} A_{ik}B_{kj}`}
    description="m,n,p为正整数维度；i索引结果行、j索引结果列，k为共同求和轴。本课元素无量纲；一般元素有单位时，乘积项单位必须一致才能相加。"
  />
  <p>
    把右矩阵每一列看作一个输入列向量，乘法表示对所有列应用同一线性映射。复合映射对列向量从右向左作用；结合律允许改变分组，但交换顺序通常改变含义，甚至使运算没有定义。
  </p></TheorySection
>

<TheorySection id="pitfalls" title="顺序和形状不能省略"
  ><CommonMistakes
    items={[
      {
        mistake: '矩阵乘法就是逐元素乘法。',
        correction: '矩阵乘法沿内维度求和，逐元素乘法则不进行该求和；形状规则与输出含义不同。',
      },
      {
        mistake: 'AB总等于BA。',
        correction:
          '剪切与非均匀缩放会互相改变作用方向；即使两种乘法都合法且形状相同，结果仍不同。',
      },
      {
        mistake: '只要形状相同就能正确组合业务数据。',
        correction: '特征轴顺序、样本约定与单位必须匹配；形状检查无法发现通道被交换等语义错误。',
      },
    ]}
  />
  <p>
    写线性层时，若输入是n×1列向量，权重应为m×n得到m个输出。若用行存放批次样本，需要明确转置约定，不能机械照搬列向量公式。
  </p></TheorySection
>
<TheorySection id="summary" title="用形状读懂矩阵乘法"
  ><LessonSummary
    points={[
      '矩阵乘法保留左行数和右列数，共同内维度用于求和。',
      '每个结果格是对应行列的内积。',
      '复合映射从右向左作用，结合律不等于交换律。',
      '形状兼容是必要条件，还需核对轴语义与单位。',
    ]}
    related={['M01-002', 'M01-012', 'M01-021']}
  /></TheorySection
>

<style>
  .parameters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin: 1rem 0;
  }
  h3 {
    margin: 1rem 0;
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
