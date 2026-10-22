<script lang="ts">
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

<TheorySection id="motivation" title="一层模型如何同时计算多个输出"
  ><p>
    线性层需要把多个输入特征按不同权重组合成多个输出。{metadata.title}把这些内积组织成一个规则，便于同时描述形状和计算。本课矩阵元素全部无量纲，最多3行3列，结果为真实解析计算，不进行训练。
  </p></TheorySection
>
<TheorySection id="intuition" title="一格是一次行列匹配"
  ><p>
    左矩阵的一行提供一组系数，右矩阵的一列提供一组被组合的数；沿相同位置相乘后相加，填进对应结果格子。左列数必须等于右行数，才能逐项配对。每个结果位置都使用完整内维度，不是同位置两个元素相乘。
  </p></TheorySection
>
<TheorySection id="mathematics" title="内维度收缩，外维度保留"
  ><FormulaBlock
    latex={String.raw`A\in\mathbb R^{m\times n},\ B\in\mathbb R^{n\times p},\quad C=AB\in\mathbb R^{m\times p},\quad C_{ij}=\sum_{k=1}^{n} A_{ik}B_{kj}`}
    description="m,n,p为正整数维度；i索引结果行、j索引结果列，k为共同求和轴。本课元素无量纲；一般元素有单位时，乘积项单位必须一致才能相加。"
  />
  <p>
    把右矩阵每一列看作一个输入列向量，乘法表示对所有列应用同一线性映射。复合映射对列向量从右向左作用；结合律允许改变分组，但交换顺序通常改变含义，甚至使运算没有定义。
  </p></TheorySection
>
<TheorySection id="experiment" title="编辑矩阵并逐格检查"
  ><InteractivePanel
    title="每一个乘积从哪里来"
    instructions="默认2×3乘3×2。矩阵单元格可键盘编辑，有限值范围±1e6；非法输入不传播。结果行/列索引从0开始，数学公式从1开始。预设切换和复位同时重置索引。"
    meaning="A中高亮当前行，B中高亮当前列，AB高亮当前结果。下方列出实际逐项乘积及相加结果；另显示BA，比较形状与顺序。"
    limitations="最多3×3的有界解析模型，无性能基准或训练。小数使用双精度浮点；形状兼容也不保证特征顺序或单位语义兼容。"
    onreset={() => select('rectangular')}
  >
    <PresetSelector {presets} value={selected} defaultId="rectangular" onchange={select} />
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
  <p>
    场景一检查首格的三个乘积7、18、33，和为58，再逐格切换。场景二比较AB首行(2,1)与BA首行(2,2)，说明先剪切再缩放和相反顺序不同。编辑任意权重，观察所有受影响格子一起更新；最后复位。
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
