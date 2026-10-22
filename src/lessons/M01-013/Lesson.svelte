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
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let command1 = $state(1),
    command2 = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('dependent'),
    epsilon = $state(1),
    tolerance = $state(1e-6),
    selected = $state('dependent');
  const result = $derived(experiment(mode, epsilon, tolerance));
  function select(id: string) {
    if (id === 'dependent') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      command1 = 1;
      command2 = 0;
      mode = p.mode;
      epsilon = p.epsilon;
      tolerance = p.tolerance;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="两路执行器就能到达任意方向吗？">
  <p>
    定位台有两路执行器，但它们可能沿同一方向推动。分别推动再相互抵消，观察平台能否离开直线，再讨论独立输出方向的数量。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前置课程已建立基、维数与矩阵变换。本课把“独立方向有几个”应用到矩阵的全部可能输出，并首次命名列空间和秩。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="推动执行器，测试可达方向">
  <p>比较倍数列与单位矩阵，再固定微小ε只调τ。说明精确秩和数值秩各依赖什么。</p>
  <PredictionLab
    {...exploration}
    context={JSON.stringify([result, command1, command2])}
    {resetVersion}
  >
    <InteractivePanel
      title="相同矩阵，不同判定尺度"
      instructions="先分别推动两路执行器，再试抵消；切换单位矩阵与微弱方向，比较可达区域和秩。指令±1；ε为0–1，相对阈值τ为1e−12至0.5，数值框支持科学记数法。"
      meaning="矩阵与列方向图显示实际变换，数值区分别报告精确秩、阈值和数值秩。ε低于1e−6时不画难以分辨的第二列箭头，矩阵与科学记数法保留真实非零值。"
      limitations="只对这两个结构化矩阵族给出解析秩，非通用秩求解器。数值秩依赖阈值；省略不可分辨箭头不代表其为零，精确数据以矩阵和数值区为准。"
      onreset={() => select('dependent')}
    >
      <PresetSelector {presets} value={selected} defaultId="dependent" onchange={select} />
      <ObjectWorkbench
        matrix={result.matrix}
        threshold={result.threshold}
        {command1}
        {command2}
        oncommand={(a, b) => {
          command1 = a;
          command2 = b;
        }}
      />
      <div class="parameters">
        <NumericInput
          label="第二奇异值 ε（仅对角族）"
          value={epsilon}
          min={0}
          max={1}
          step={1e-8}
          onchange={(n) => {
            epsilon = n;
            mode = 'diagonal';
            selected = 'custom';
          }}
        /><NumericInput
          label="相对阈值 τ"
          value={tolerance}
          min={1e-12}
          max={0.5}
          step={1e-6}
          onchange={(n) => {
            tolerance = n;
            selected = 'custom';
          }}
        />
      </div>
      <MatrixView values={result.matrix} columnLabels={['第一列', '第二列']} /><VectorDiagram
        range={result.range}
        vectors={result.columns.flatMap((v, i) =>
          i === 1 && result.hiddenSecond
            ? []
            : [
                {
                  ...v,
                  label: `列${i + 1}`,
                  role: i === 0 ? ('primary' as const) : ('secondary' as const),
                },
              ],
        )}
        description="等比例无量纲坐标，第一列实线、第二列虚线；微小第二列的真实值保留在矩阵和数值区，不能据屏幕判断精确秩。"
      />
      <div aria-live="polite">
        <p>
          奇异值：{result.singular
            .map((n) => n.toExponential(2))
            .join('，')}；绝对判定阈值：{result.threshold.toExponential(2)}
        </p>
        <p data-testid="result">精确秩={result.exactRank}；数值秩={result.numericalRank}</p>
        {#if result.hiddenSecond}<p>
            第二方向小于图中可读尺度，未画箭头；其奇异值为{epsilon.toExponential(2)}，{epsilon === 0
              ? '恰好为零'
              : '非零，精确秩仍为2'}。
          </p>{/if}
      </div>
    </InteractivePanel>
  </PredictionLab></TheorySection
>
<TheorySection id="intuition" title="列空间决定可达输出">
  <p>
    列空间（column
    space）是矩阵各列张成的集合，也就是全部可能输出。秩（rank）是这个集合的维数：问“输出能独立沿几个方向变化”，而不是数表有几行几列。
  </p>
  <FormulaBlock
    latex={String.raw`A=\begin{pmatrix}1&2\\2&4\end{pmatrix},\quad A\begin{pmatrix}a\\b\end{pmatrix}=(a+2b)\begin{pmatrix}1\\2\end{pmatrix}`}
    description="A为2×2无量纲矩阵，a、b为任意实输入；所有输出都在一个非零方向的直线上，因此秩为1。"
  />
  <p>
    零矩阵只输出原点，秩为0；二维单位矩阵能输出任意点，秩为2。两列端点不同不代表独立，若一列只是另一列的倍数，仍只有一个方向。
  </p>
  <p>
    数值秩是在有限精度下回答“多小的方向可以忽略”。对沿横轴保留1倍、沿纵轴缩放ε倍的矩阵，只要ε非零，数学上仍是二维；设相对阈值为百万分之一时，亿分之一的纵向伸缩就会被忽略。矩阵没变，改变的是可分辨标准。
  </p>
  <p>
    实验中的“奇异值”可先理解为选定主方向的长度伸缩倍数；本课矩阵结构已知，直接使用这些已知倍数计数。一般矩阵如何找主方向留到SVD课，下面的补充公式不作为理解精确秩的前提。
  </p>
  <KnowledgeCheck prompt="迁移：把diag(1,10⁻⁸)整体放大100倍，相对阈值不变，数值秩会变吗？为什么？">
    {#snippet answer()}<p>
        在同一相对规则下不变：每个奇异值和最大奇异值都放大100倍，与τ倍最大值的比较不变。固定绝对阈值可能给出不同判断。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="精确秩与阈值下的数值秩">
  <FormulaBlock
    latex={String.raw`\operatorname{rank}(A)=\dim\operatorname{col}(A)`}
    description="col(A)为矩阵各列的张成空间，dim表示维数；秩是无量纲整数。"
  />
  <details>
    <summary>补充：用已知伸缩倍数计算数值秩</summary><FormulaBlock
      latex={String.raw`\operatorname{rank}(A)=\dim\operatorname{col}(A),\qquad r_\tau=\#\{i:\sigma_i>\tau\sigma_{\max}\}`}
      description="A为2×2实矩阵；col(A)为列空间，dim为维数；σ_i为非负奇异值，σ_max为最大奇异值，τ为正的无量纲相对阈值。本课约定严格大于阈值才计入数值秩；不是所有软件的统一默认规则。"
    /><FormulaBlock
      latex={String.raw`A_\varepsilon=\operatorname{diag}(1,\varepsilon),\quad\sigma=(1,\varepsilon),\quad0\le\varepsilon\le1`}
      description="ε为第二方向的无量纲缩放；ε非零时精确秩2，为零时精确秩1。另一预设矩阵是向量(1,2)与自身外积，其非零奇异值等于1²+2²=5。"
    />
    <p>
      奇异值刻画输入单位方向经映射后的主轴伸缩，后续SVD课会展开。这里利用已知矩阵结构直接得到奇异值，再按明确阈值计数，没有把有限精度判定冒充精确符号计算。
    </p>
  </details>
</TheorySection>

<TheorySection id="pitfalls" title="图形和容差的边界"
  ><CommonMistakes
    items={[
      {
        mistake: '数值软件中的秩与容差无关。',
        correction:
          '小奇异值是否被保留取决于阈值、矩阵尺度与实现约定，应报告规则而非只给整数结论。',
      },
      { mistake: '矩阵有两列，所以秩为2。', correction: '列数只是上界；倍数列只张成一个方向。' },
      {
        mistake: '屏幕上压成一条线就证明精确秩为1。',
        correction: '极小但非零的方向可能无法用像素分辨。结合真实数值、测量精度和阈值判断。',
      },
    ]}
  />
  <p>
    实际特征矩阵常受噪声影响而精确满秩，但有效信息集中在少数方向。数值秩是建模尺度下的诊断，不是对未知真实信号维度的无条件证明。
  </p></TheorySection
>
<TheorySection id="summary" title="秩回答独立方向数量"
  ><LessonSummary
    points={[
      '精确秩是列空间维数，衡量独立输出方向数量。',
      '成比例列不会增加秩，形状只提供上界。',
      '数值秩必须同时说明阈值与尺度约定。',
      '小于显示或噪声分辨率不等于数学上恰好为零。',
    ]}
    related={['M01-006', 'M01-012', 'M01-018']}
  /></TheorySection
>

<style>
  .parameters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin: 1rem 0;
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
