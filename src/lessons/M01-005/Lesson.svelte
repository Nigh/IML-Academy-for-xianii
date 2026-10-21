<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import Plot2D from '../../components/charts/Plot2D.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('plane'),
    a = $state(3),
    b = $state(-2);
  const result = $derived(experiment(mode, a, b));
  const selected = $derived(
    presets.find((p) => p.id === mode && p.a === a && p.b === b)?.id ?? 'custom',
  );
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.id;
      a = p.a;
      b = p.b;
    }
  }
</script>

<TheorySection id="motivation" title="模型能合成哪些目标">
  <p>
    线性模型把固定特征方向按权重相加。即使不断调权重，如果这些方向都沿同一条线，也不可能命中线外的目标。{metadata.title}把“调参没调好”和“模型根本表达不了”区分开来。
  </p>
  <p>
    本课使用无量纲二维特征。给定两个方向与一个固定目标，只改变两个实数系数，实时计算合成向量；不进行训练，不使用随机或预计算结果。
  </p>
</TheorySection>
<TheorySection id="intuition" title="固定方向，改变系数">
  <p>
    把第一方向的贡献与第二方向的贡献相加，得到一次线性组合（linear
    combination）。让所有系数取遍实数，得到的所有向量构成张成空间（span）。系数可以为负，也不要求和为一。
  </p>
  <p>
    两个互不共线的平面方向可以独立控制两个分量。若第二方向只是第一方向的两倍，两个权重最终只控制一个合成强度，仍只有一条可达直线。图中的25个点来自明确的整数系数网格，用来显示可达结构；不是整个张成集合。
  </p>
</TheorySection>
<TheorySection id="mathematics" title="从一次组合到整个张成空间">
  <FormulaBlock
    latex={String.raw`\mathbf w=\sum_{i=1}^{m}a_i\mathbf u_i,\quad\operatorname{span}\{\mathbf u_1,\ldots,\mathbf u_m\}=\left\{\sum_{i=1}^{m}a_i\mathbf u_i:a_i\in\mathbb R\right\}`}
    description="m 是方向向量个数（正整数）；u_i 与 w 是2×1实列向量，a_i 为实系数；本课均无量纲。span 是集合，w 是其中一个元素；系数不受UI范围限制。"
  />
  <FormulaBlock
    latex={String.raw`a\begin{pmatrix}1\\0\end{pmatrix}+b\begin{pmatrix}0\\1\end{pmatrix}=\begin{pmatrix}a\\b\end{pmatrix},\qquad a\begin{pmatrix}1\\1\end{pmatrix}+b\begin{pmatrix}2\\2\end{pmatrix}=\begin{pmatrix}a+2b\\a+2b\end{pmatrix}`}
    description="a、b 是两个无量纲实系数。左式取 a=3、b=−2 命中目标；右式的两个分量始终相等，因此不可能生成 (1,0)。"
  />
  <p>
    张成空间必含零向量，也对线性组合封闭：两个组合相加或缩放，只是把它们的系数相加或缩放。这连接了前一课的子空间判据。能张成平面不等于任何受限系数范围都能到达整个平面，数学定义和控件预算要区分。
  </p>
</TheorySection>
<TheorySection id="experiment" title="尝试命中目标">
  <InteractivePanel
    title="组合与不可消除的距离"
    instructions="场景一默认 a=3、b=−2；场景二默认 a=1、b=0。两个系数范围均−3至3、无量纲，非法输入不会进入模型。先预测再切换场景，尝试把当前组合移到目标。"
    meaning="散点由25组固定整数系数实时生成；目标和当前组合另列图例。下方显示两份中间贡献、组合、当前误差及目标到完整span的最小距离。"
    limitations="有限网格不等于连续span。图域按场景和当前参数调整，比较距离请读取数值；最近点仅对本课标准平面或直线解析计算。"
    onreset={() => select('plane')}
  >
    <PresetSelector {presets} value={selected} defaultId="plane" onchange={select} />
    <div class="parameters">
      <ParameterSlider
        label="第一方向系数 a"
        value={a}
        min={-3}
        max={3}
        step={0.1}
        onchange={(n) => (a = n)}
      /><ParameterSlider
        label="第二方向系数 b"
        value={b}
        min={-3}
        max={3}
        step={0.1}
        onchange={(n) => (b = n)}
      />
    </div>
    <Plot2D
      series={result.series}
      xRange={[-result.extent, result.extent]}
      yRange={[-result.extent, result.extent]}
      xLabel="第一特征"
      yLabel="第二特征"
      xUnit="无量纲"
      yUnit="无量纲"
      description="25组系数网格：两个独立方向铺开平面，共线方向的点重合在一条直线上。目标与组合可能重合，数值区域如实报告。"
    />
    <div aria-live="polite">
      <p>
        u=({result.u.x},{result.u.y})；v=({result.v.x},{result.v.y})；目标=({result.target
          .x},{result.target.y})
      </p>
      <p>
        贡献 a u=({result.first.x.toFixed(2)},{result.first.y.toFixed(2)})，b v=({result.second.x.toFixed(
          2,
        )},{result.second.y.toFixed(2)})
      </p>
      <p data-testid="result">
        组合=({result.w.x.toFixed(2)},{result.w.y.toFixed(2)})；当前误差={result.error.toFixed(
          4,
        )}；张成维数={result.dimension}
      </p>
      <p>
        目标在span中的最近点=({result.nearest.x.toFixed(2)},{result.nearest.y.toFixed(
          2,
        )})；最小距离={result.distance.toFixed(4)}
      </p>
    </div>
  </InteractivePanel>
  <p>
    场景一先打乱权重再恢复3和−2，确认误差可为零。场景二无论如何调系数，组合的两个分量相等，无法命中
    (1,0)；最近点 (0.5,0.5) 与最小距离约0.7071提示了不可消除的表达误差。令
    a=−2b，可以让两个非零贡献完全抵消；复位恢复独立方向场景。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="更多向量不一定增加方向">
  <CommonMistakes
    items={[
      {
        mistake: '增加向量数量必然增加张成维数。',
        correction:
          '(2,2) 是 (1,1) 的倍数，加入后没有新方向。只有不在已有span内的向量才扩展表达能力。',
      },
      {
        mistake: '调参总能消除拟合误差。',
        correction:
          '当目标不在模型张成空间时，再调系数也不可能精确命中。本课共线场景的最小距离严格为正。',
      },
      {
        mistake: '图中没有的点就不在span中。',
        correction: '图只显示25组整数系数；span定义允许任意实数，还包含网格之间和视域外的点。',
      },
    ]}
  />
  <p>
    设计矩阵中重复或倍数关系的特征列不会增加模型的线性表达方向，反而可能令权重表示不唯一。下一课用非平凡零组合准确描述这种冗余；这里的表达误差也不等于数据分布上的泛化误差。
  </p>
</TheorySection>
<TheorySection id="summary" title="张成描述表达能力">
  <LessonSummary
    points={[
      '线性组合是一次加权求和，span收集所有实系数的组合。',
      '新增向量只有带来已有span外的方向才增加维数。',
      '目标不在span中时，权重调节不能消除表达误差。',
      '有限系数网格只是可视化样本，不是整个张成空间。',
    ]}
    related={['M01-004', 'M01-006', 'M01-020']}
  />
</TheorySection>

<style>
  .parameters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
