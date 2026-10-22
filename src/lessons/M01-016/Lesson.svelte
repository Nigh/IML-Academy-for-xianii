<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import MatrixView from '../../components/math/MatrixView.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('under'),
    b1 = $state(2),
    b2 = $state(0),
    t = $state(1),
    selected = $state('under');
  const r = $derived(experiment(mode, b1, b2, t));
  const fmt = (n: number) =>
    n !== 0 && Math.abs(n) < 1e-4 ? n.toExponential(3) : Number(n.toFixed(4));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      b1 = p.b1;
      b2 = p.b2;
      t = p.t;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="观测太少或互相矛盾时"
  ><p>
    标定可能只有一个总和读数却想恢复两个参数，也可能两个观测要求同一参数取不同值。普通逆矩阵无法处理这些非方阵问题。{metadata.title}给出统一的线性代数答案：最小范数最小二乘解。本课用无量纲合成小模型解析计算，不运行训练或通用数值分解。
  </p></TheorySection
>
<TheorySection id="intuition" title="先最小残差，再最小范数"
  ><p>
    先找使输出最接近目标的输入；如果这样的输入仍不唯一，再选欧氏范数最小者。欠定方程x₁+x₂=2的解是一条直线，离原点最近的是(1,1)。超定方程x=1与x=3互相矛盾，只能选x=2，让两个残差的平方和最小。
  </p>
  <p>
    在输出空间中，最优拟合是把b正交投影到列空间；在输入空间中，最小范数解不带任何多余的核分量。前者解释残差，后者解释如何在多个解中选择，不能混为同一个空间的距离。
  </p></TheorySection
>
<TheorySection id="mathematics" title="Moore–Penrose伪逆">
  <FormulaBlock
    latex={String.raw`x^\star=A^+b,\quad x^\star=\underset{x\in\arg\min_z\|Az-b\|_2}{\arg\min}\ \|x\|_2`}
    description="A为m×n实矩阵，b为m维目标，x、z为n维输入，A⁺为n×m的Moore–Penrose伪逆，全部无量纲。内层先使残差的欧氏范数最小，外层再选参数范数最小者；对任意有限实矩阵存在唯一这样的x⋆。不是把残差与参数范数相加的正则化目标。"
  />
  <FormulaBlock
    latex={String.raw`A=[1\ \ 1],\quad A^+=\tfrac12[1\ \ 1]^\top,\quad x=(b/2+t,b/2-t)^\top,\quad\|x\|_2^2=b^2/2+2t^2`}
    description="此处m=1、n=2，b为标量，t为任意实自由系数。所有这些x都精确拟合；范数在t=0时最小。网页显示t的有限区间，不限制数学解族。"
  />
  <FormulaBlock
    latex={String.raw`A=[1\ \ 1]^\top,\quad A^+=\tfrac12[1\ \ 1],\quad x^\star=\frac{b_1+b_2}2,\quad\min_x\|Ax-b\|_2^2=\frac{(b_1-b_2)^2}2`}
    description="此处m=2、n=1，b₁、b₂是目标的两个分量。对平方和(x−b₁)²+(x−b₂)²配方或求导得到均值；只有两目标相等才零残差。"
  />
  <p>
    一般伪逆满足AA⁺A=A、A⁺AA⁺=A⁺，且AA⁺与A⁺A均对称。这四个条件唯一确定Moore–Penrose伪逆；AA⁺是列空间的正交投影。可逆方阵的伪逆等于普通逆；一般矩阵可借助后续SVD构造，不能无条件使用含(AᵀA)⁻¹的公式。
  </p>
</TheorySection>
<TheorySection id="experiment" title="比较伪逆与候选解">
  <InteractivePanel
    title="哪一种误差还可以降低"
    instructions="选择欠定或超定预设。b₁默认2、b₂默认0，范围±4；t默认1，范围±3，步长0.25，均无量纲。欠定模式只用b₁，b₂仅超定模式显示。非法数值保留有效结果；键盘可编辑。"
    meaning="欠定模式画输入空间：实线最小范数解，虚线当前精确解，点线核位移。超定模式画输出空间：实线目标b，虚线最优拟合Ax⋆，点线连接残差。重合和零向量保持真实位置，数值在下方。"
    limitations="两个固定非方阵的解析模型，不是通用伪逆计算器。t在欠定模式增加核分量，在超定模式把标量解偏离均值；对照两种不同后果。自适应等比例视域不可跨图比较像素长度。"
    onreset={() => select('under')}
  >
    <PresetSelector {presets} value={selected} defaultId="under" onchange={select} />
    <ParameterSlider
      label="目标 b₁"
      value={b1}
      min={-4}
      max={4}
      step={0.25}
      onchange={(n) => {
        b1 = n;
        selected = 'custom';
      }}
    />
    {#if mode === 'over'}<ParameterSlider
        label="目标 b₂"
        value={b2}
        min={-4}
        max={4}
        step={0.25}
        onchange={(n) => {
          b2 = n;
          selected = 'custom';
        }}
      />{/if}
    <ParameterSlider
      label="候选偏移 t"
      value={t}
      min={-3}
      max={3}
      step={0.25}
      onchange={(n) => {
        t = n;
        selected = 'custom';
      }}
    />
    <p>A：</p>
    <MatrixView values={r.matrix} />
    <p>A⁺：</p>
    <MatrixView values={r.pinverse} />
    <VectorDiagram
      range={r.extent}
      vectors={[
        { ...r.target, label: '', role: 'primary' },
        { ...r.displayed, label: '', role: 'secondary' },
      ]}
      projection={{ from: r.target, to: r.displayed }}
      description={mode === 'under'
        ? '输入平面x₁/x₂，无量纲；实线最小范数解、虚线当前解、点线核位移。'
        : '输出平面第一/第二观测，无量纲；实线目标b、虚线最优拟合、点线残差。'}
    />
    <div aria-live="polite" data-testid="result">
      <p>
        {mode === 'under' ? '图中：实线x⋆，虚线候选x。' : '图中：实线b，虚线Ax⋆。'} b=({r.rhs
          .map(fmt)
          .join(',')})。
      </p>
      <p>
        伪逆解=({r.star.map(fmt).join(',')})；拟合=({r.fitted.map(fmt).join(',')})；最小残差={fmt(
          r.residual,
        )}；解范数={fmt(r.starNorm)}。
      </p>
      <p>
        候选解=({r.candidate.map(fmt).join(',')})；候选输出=({r.current
          .map(fmt)
          .join(',')})；候选残差={fmt(r.candidateResidual)}；候选范数={fmt(r.candidateNorm)}。
      </p>
    </div>
  </InteractivePanel>
  <p>
    场景一保持b=2改变t，两个解都精确拟合，但t=0才最小范数。场景二保持b=(1,3)，将t调到0，候选残差降到√2却不能降到0。再令两个目标相等，观察最优输出与目标重合。复位恢复欠定对照。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="伪逆不会制造不存在的精确解"
  ><CommonMistakes
    items={[
      {
        mistake: '伪逆总能令Ax精确等于b。',
        correction: '只有b属于列空间时可以；目标(1,3)不在(1,1)张成的直线上，最优残差仍为√2。',
      },
      {
        mistake: '最小范数意味着不管拟合都选零向量。',
        correction: '范数只在最小二乘解集合中比较；[1,1]x=2的零向量拟合更差，不在该集合中。',
      },
      {
        mistake: '伪逆会自动解决噪声放大。',
        correction:
          '很小的非零奇异值在求逆时可能放大噪声。截断或正则化是额外建模选择，不是本课固定伪逆公式自动提供的。',
      },
    ]}
  />
  <p>
    “最小范数”依赖所选欧氏坐标与尺度；换单位或对参数做加权，会改变哪种解最短。实际校准应先明确单位和权重，再解释优化目标。
  </p></TheorySection
>
<TheorySection id="summary" title="一个有条件解释的统一解"
  ><LessonSummary
    points={[
      '伪逆对任意实矩阵给出最小范数最小二乘解。',
      '先最小残差，再在最优解集合中最小化参数范数。',
      '输出投影与输入核方向分别解释两层选择。',
      '非零残差和噪声敏感性仍需明确报告。',
    ]}
    related={['M01-010', 'M01-014', 'M01-015', 'M01-018', 'M01-020']}
  /></TheorySection
>

<style>
  p {
    overflow-wrap: anywhere;
  }
</style>
