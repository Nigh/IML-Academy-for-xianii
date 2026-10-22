<script lang="ts">
  import PredictionLab from '../../components/lesson/PredictionLab.svelte';
  import { exploration } from './exploration.ts';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
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
  let resetVersion = $state(0);
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
    if (id === 'under') resetVersion += 1;
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

<TheorySection id="motivation" title="同样拟合得好的多个解，应该怎样选一个？">
  <p>x₁+x₂=2的解很多。只在精确拟合的解中，哪个长度最小？</p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前置课程已解释普通逆矩阵和正交投影。本课处理没有普通逆的情形，并明确区分“输出误差最小”和“输入长度最小”两次选择。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="比较伪逆与候选解">
  <p>欠定模式只改核偏移，比较同输出的输入长度；超定模式改变候选偏移，比较无法消掉的观测矛盾。</p>
  <PredictionLab {...exploration} context={JSON.stringify(r)} {resetVersion}>
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
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="先最小残差，再最小范数">
  <p>
    欠定（underdetermined）表示未知分量比独立约束多，可能有很多解；超定（overdetermined）表示方程比未知分量多，含噪或矛盾观测可能没有精确解。伪逆用统一规则选择一个输入，但不会凭空消除观测矛盾。
  </p>
  <p>
    第一步比较输出：使预测与目标之差的平方和最小，这叫最小二乘。第二步仅在第一步同样最优的解中比较输入：选长度最小者。因此它有严格先后顺序，不是把两种大小混成一个分数。
  </p>
  <FormulaBlock
    latex={String.raw`x_1+x_2=2:\quad (x_1,x_2)=(1+t,1-t),\quad x_1^2+x_2^2=2+2t^2`}
    description="所有候选都精确拟合目标；t为实数，平方项非负，所以t=0的输入(1,1)最短，各量无量纲。"
  /><FormulaBlock
    latex={String.raw`(x-1)^2+(x-3)^2=2(x-2)^2+2`}
    description="两个目标分别要求同一参数为1和3；配方说明x=2时平方误差最小，但最小值2仍不为0。"
  />
  <p>
    Moore–Penrose伪逆记为A⁺，是把目标送到上述唯一选中解的矩阵；可逆时它等于普通逆。公式中的min表示最小数值，arg
    min表示取得这个最小值的输入或输入集合；星号只是最优解的标记。理解这两个配方例子后，再读下面的嵌套公式；一般构造方法留到SVD课。
  </p>
  <KnowledgeCheck
    prompt="迁移：若两个参数使用不同单位，仍能直接把数值平方相加决定“最短”吗？说明需要什么约定。"
  >
    {#snippet answer()}<p>
        需要先约定参数单位、尺度或加权范数。欧氏最小范数依赖表示，换单位可能改变选中的解，伪逆没有自动决定物理重要性。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
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
