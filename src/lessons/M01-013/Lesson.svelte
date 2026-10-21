<script lang="ts">
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
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('dependent'),
    epsilon = $state(1),
    tolerance = $state(1e-6),
    selected = $state('dependent');
  const result = $derived(experiment(mode, epsilon, tolerance));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      epsilon = p.epsilon;
      tolerance = p.tolerance;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="输出还能保留几个方向"
  ><p>
    两个特征列看似提供两份输入，但若始终成比例，就只提供一个独立变化方向。{metadata.title}从线性映射的输出空间判断信息是否被压缩。本课用两个已知解析奇异值的矩阵族，不运行通用SVD或真实训练，全部量无量纲。
  </p></TheorySection
>
<TheorySection id="intuition" title="列空间决定可达输出"
  ><p>
    矩阵输出是各列的线性组合。列若独立，可以控制多个输出方向；列若成倍数，只能沿同一直线变化。精确秩（rank）就是列空间维数。图中两列端点分开并不代表独立，关键是方向是否冗余。
  </p>
  <p>
    把单位矩阵第二个对角元素不断缩小，只要它仍非零，数学上仍保留二维；但很小的方向可能被浮点误差或测量噪声淹没。数值秩（numerical
    rank）要声明可分辨阈值，不能仅凭屏幕上是否看得见判断。
  </p></TheorySection
>
<TheorySection id="mathematics" title="精确秩与阈值下的数值秩"
  ><FormulaBlock
    latex={String.raw`\operatorname{rank}(A)=\dim\operatorname{col}(A),\qquad r_\tau=\#\{i:\sigma_i>\tau\sigma_{\max}\}`}
    description="A为2×2实矩阵；col(A)为列空间，dim为维数；σ_i为非负奇异值，σ_max为最大奇异值，τ为正的无量纲相对阈值。本课约定严格大于阈值才计入数值秩；不是所有软件的统一默认规则。"
  /><FormulaBlock
    latex={String.raw`A_\varepsilon=\operatorname{diag}(1,\varepsilon),\quad\sigma=(1,\varepsilon),\quad0\le\varepsilon\le1`}
    description="ε为第二方向的无量纲缩放；ε非零时精确秩2，为零时精确秩1。另一预设矩阵是向量(1,2)与自身外积，其非零奇异值等于1²+2²=5。"
  />
  <p>
    奇异值刻画输入单位方向经映射后的主轴伸缩，后续SVD课会展开。这里利用已知矩阵结构直接得到奇异值，再按明确阈值计数，没有把有限精度判定冒充精确符号计算。
  </p></TheorySection
>
<TheorySection id="experiment" title="逐步缩小一个方向"
  ><InteractivePanel
    title="相同矩阵，不同判定尺度"
    instructions="默认倍数列矩阵。选择对角矩阵预设后可调ε（0–1，默认1）；相对阈值τ默认1e−6，范围1e−12至0.5。数值框支持科学记数法，非法值保留有效结果。"
    meaning="矩阵与列方向图显示实际变换，数值区分别报告精确秩、阈值和数值秩。ε低于1e−6时不画难以分辨的第二列箭头，矩阵与科学记数法保留真实非零值。"
    limitations="只对这两个结构化矩阵族给出解析秩，非通用秩求解器。数值秩依赖阈值；省略不可分辨箭头不代表其为零，精确数据以矩阵和数值区为准。"
    onreset={() => select('dependent')}
  >
    <PresetSelector {presets} value={selected} defaultId="dependent" onchange={select} />
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
  <p>
    先确认倍数列矩阵的秩为1。切到单位矩阵，再把ε设为1e−8，保持阈值1e−6，比较精确秩2与数值秩1。将阈值降为1e−10，数值秩恢复2；最后把ε设为0，精确秩也变为1。复位恢复首场景。
  </p></TheorySection
>
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
