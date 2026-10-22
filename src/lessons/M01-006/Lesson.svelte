<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let x = $state(0),
    y = $state(1),
    third = $state(false);
  const result = $derived(experiment(x, y, third));
  const selected = $derived(
    presets.find((p) => p.x === x && p.y === y && p.third === third)?.id ?? 'custom',
  );
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = p.x;
      y = p.y;
      third = p.third;
    }
  }
</script>

<TheorySection id="motivation" title="冗余特征为何让权重不唯一"
  ><p>
    两个传感器通道若始终互为倍数，线性模型就可以把一份权重转移到另一通道而保持输出不变。{metadata.title}解释这种冗余，并回答：怎样挑选足够表达空间、又没有多余方向的一组向量？本课为无量纲二维解析模型。
  </p></TheorySection
>
<TheorySection id="intuition" title="能抵消的贡献揭示冗余"
  ><p>
    若若干非零权重的贡献能够完全抵消，就能把其中一项移到另一边，用其余向量表示它。这样的向量组线性相关（linearly
    dependent）。如果只有全部权重为零才会抵消，就称线性独立（independent）。独立且张成指定空间的一组向量叫基（basis）。
  </p>
  <p>
    两根独立平面方向决定两个坐标；第三根方向可以由前两根生成，因而引入冗余。这里的秩是张成空间的维数，不能混同于张量的轴数。
  </p></TheorySection
>
<TheorySection id="mathematics" title="相关、独立与基">
  <FormulaBlock
    latex={String.raw`\sum_{i=1}^{m}a_i\mathbf u_i=\mathbf0,\qquad \exists i:a_i\ne0`}
    description="相关性的判据：m为向量个数，u_i为2×1实列向量，a_i为实系数；存在不全为零的系数满足等式。本课所有量无量纲。若等式仅有全零系数解则独立。"
  />
  <FormulaBlock
    latex={String.raw`u=(1,0)^\mathsf T,\ v=(v_x,v_y)^\mathsf T:\quad au+bv=(a+bv_x,bv_y)^\mathsf T`}
    description="a、b 为两个系数，v_x、v_y 为可调分量。v_y非零时，零组合迫使b=0再迫使a=0；v_y=0时，系数(−v_x,1)给出非平凡零组合。"
  />
  <p>
    本课固定第一向量，所以可直接按第二分量是否为零精确判别；一般浮点矩阵需要明确数值秩容差。基必须相对于空间说明：一个非零向量可作为其所在直线的基，但不足以作为整个平面的基。二维基恰好两个向量。
  </p>
</TheorySection>
<TheorySection id="experiment" title="寻找非平凡零组合">
  <InteractivePanel
    title="从两个方向到三个方向"
    instructions="第二向量默认(0,1)，分量范围−2至2，无量纲。第一向量固定(1,0)，可加入第三向量(1,1)。非法输入保留有效值；复位恢复两个标准基。"
    meaning="箭头由当前分量绘制，给出秩、是否为R²的基；若相关，展示实际非平凡系数及其零组合残差。视域按分量等比例调整，比较长度请读坐标。"
    limitations="只对固定第一/第三向量的结构化小模型解析判别；极接近共线的向量在测量噪声下可能难区分，不代表一般数值秩算法。自定义重合箭头的身份由下方坐标读取。"
    onreset={() => select('basis')}
  >
    <PresetSelector {presets} value={selected} defaultId="basis" onchange={select} />
    <ParameterSlider
      label="第二向量 x 分量"
      value={x}
      min={-2}
      max={2}
      step={0.1}
      onchange={(v) => (x = v)}
    /><ParameterSlider
      label="第二向量 y 分量"
      value={y}
      min={-2}
      max={2}
      step={0.1}
      onchange={(v) => (y = v)}
    />
    <label>加入第三向量 <input type="checkbox" bind:checked={third} /></label>
    <VectorDiagram
      range={result.range}
      vectors={result.vectors.map((v, i) => ({
        ...v,
        label: v.x === 0 && v.y === 0 ? '' : ['u', 'v', 'w'][i],
        role: (['primary', 'secondary', 'accent'] as const)[i],
      }))}
      description="u为实线，v为虚线，第三向量w另有名称；横纵轴均为无量纲等比例坐标。"
    />
    <div aria-live="polite">
      <p>u=(1,0)，v=({x},{y}){third ? '，w=(1,1)' : ''}</p>
      <p data-testid="result">
        向量数={result.vectors.length}；秩={result.rank}；{result.isBasis
          ? '是 R² 的基'
          : '不是 R² 的基'}
      </p>
      <p>
        {result.coefficients
          ? `非平凡零组合系数：(${result.coefficients.join(',')})；残差长度=${result.residual!.toExponential(2)}`
          : '只有全零系数才能产生零向量。'}
      </p>
    </div>
  </InteractivePanel>
  <p>
    先比较两个标准基与共线方向，验证后者系数(−2,1)完全抵消。再加入第三向量，验证系数(−1,−1,1)的贡献之和为零，秩仍为2。把第二向量置零，观察含零向量的组必相关；复位后恢复独立组。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="数量与维数的区别"
  ><CommonMistakes
    items={[
      {
        mistake: '基的向量数可以超过空间维数。',
        correction: '有限维空间的基既独立又张成，其元素个数等于维数；三根平面向量必相关。',
      },
      {
        mistake: '全零系数能抵消，说明向量组相关。',
        correction: '任何向量组都有平凡零组合；相关必须找到不全为零的系数。',
      },
      {
        mistake: '非正交就不能成为基。',
        correction: '正交不是必要条件；例如(1,0),(1,1)同样独立并张成平面，只是坐标计算需要解方程。',
      },
    ]}
  />
  <p>
    在特征选择中去掉精确冗余列可恢复参数可辨识性，但不等于自动改善泛化。近似冗余则还涉及噪声尺度与条件数，需要结合后续的矩阵秩和SVD分析。
  </p></TheorySection
>
<TheorySection id="summary" title="用最少方向完整表示"
  ><LessonSummary
    points={[
      '相关意味着存在不全为零的系数产生零组合。',
      '独立排除冗余，张成保证覆盖，二者同时成立才构成指定空间的基。',
      '二维空间最多两个独立方向，加入第三向量必相关。',
      '基不必正交；近似相关与数值容差需要单独分析。',
    ]}
    related={['M01-005', 'M01-013', 'M01-018']}
  /></TheorySection
>
