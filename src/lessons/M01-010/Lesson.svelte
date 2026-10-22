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
  let x = $state(3),
    y = $state(2),
    degrees = $state(0);
  const result = $derived(experiment(x, y, degrees));
  const selected = $derived(
    presets.find((p) => p.x === x && p.y === y && p.degrees === degrees)?.id ?? 'custom',
  );
  function select(id: string) {
    if (id === 'axis') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = p.x;
      y = p.y;
      degrees = p.degrees;
    }
  }
  const fmt = (n: number) => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(3);
</script>

<TheorySection id="motivation" title="模型解释了一部分观测，剩余部分还藏着同方向的贡献吗？">
  <p>把(3,2)正交投影到横轴后，投影和残差的长度平方如何合计？</p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前课已经求出直线上的最近点，也区分了投影向量与系数。本课用向量相减得到剩余部分，并解释为什么这个剩余部分必与参考方向垂直。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="旋转参考方向再分解">
  <p>固定观测转参考方向；再让观测恰好落在参考线上。每次同时检查重构、方向内积和平方范数账本。</p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="同一观测的平方范数账本"
      instructions="默认观测(3,2)，分量范围±5、无量纲，方向角默认0°、范围±180°。非法输入保留有效值；方向始终由单位圆构造为非零向量。"
      meaning="v是观测，p是投影，从p出发的虚线是残差r；残差端点与v重合，因此残差名称放在表格中。显示内积残差与平方范数恒等式的数值误差。"
      limitations="二维欧氏正交投影，不推断残差的随机分布或独立性。视域按端点等比例调整；小于显示精度的值四舍五入，检验量另用科学记数法。"
      onreset={() => select('axis')}
    >
      <PresetSelector {presets} value={selected} defaultId="axis" onchange={select} />
      <div class="parameters">
        <ParameterSlider
          label="观测 x"
          value={x}
          min={-5}
          max={5}
          step={0.1}
          onchange={(n) => (x = n)}
        /><ParameterSlider
          label="观测 y"
          value={y}
          min={-5}
          max={5}
          step={0.1}
          onchange={(n) => (y = n)}
        /><ParameterSlider
          label="参考方向角"
          value={degrees}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onchange={(n) => (degrees = n)}
        />
      </div>
      <VectorDiagram
        range={result.range}
        vectors={[
          { ...result.v, label: x || y ? 'v' : '', role: 'primary' },
          {
            ...result.p,
            label: result.projectionZero || result.residualZero ? '' : 'p',
            role: 'accent',
          },
          { ...result.r, origin: result.p, label: '', role: 'secondary' },
        ]}
        description="横纵轴均无量纲且等比例。v为原观测，p为投影，虚线r从p连到v，形成直角三角形；零分量如实重合。"
      />
      <MatrixView
        values={[
          [x, result.p.x, result.r.x],
          [y, result.p.y, result.r.y],
        ].map((row) => row.map((n) => Number(fmt(n))))}
        rowLabels={['x', 'y']}
        columnLabels={['观测 v', '投影 p', '残差 r']}
      />
      <div aria-live="polite">
        <p data-testid="result">
          平方范数：{fmt(result.originalSquared)} = {fmt(result.parallelSquared)} + {fmt(
            result.residualSquared,
          )}
        </p>
        <p>
          残差 r=({fmt(result.r.x)},{fmt(result.r.y)})；方向内积 uᵀr={result.cross.toExponential(
            2,
          )}；恒等式误差={result.energyError.toExponential(2)}
        </p>
      </div>
    </InteractivePanel>
  </PredictionLab></TheorySection
>
<TheorySection id="intuition" title="沿线分量与垂直剩余">
  <p>
    本课的参考子空间就是那条允许结果沿其变化的过原点直线。残差（residual）是“观测减去模型能解释的部分”。先求投影，再相减；不是任选一段箭头都可以叫投影残差。例如将观测(3,2)投影到横轴，模型解释(3,0)，剩余(0,2)。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf v=\mathbf p+\mathbf r,\quad (3,2)^\mathsf T=(3,0)^\mathsf T+(0,2)^\mathsf T,\quad 3^2+2^2=9+4`}
    description="v为观测，p为投影，r为残差，各分量无量纲。长度的平方相加来自两份分量垂直。"
  />
  <p>
    为什么剩余一定垂直？如果它仍有一份沿参考方向的贡献，就可以把那份挪到投影里，让残差更短，这与投影已经是最近点矛盾。因此正交是最近点的结果，而不是画图时强行规定的装饰。
  </p>
  <p>
    平方范数在这里是长度的平方；只有物理模型说明比例关系和单位后，才能解释成能量。把任意向量分成两份时，平方展开还含两份向量的内积交叉项，只有正交时该项为0。概率独立属于后续统计知识，不能从几何垂直直接推出。
  </p>
  <KnowledgeCheck prompt="迁移：若两份向量为(1,0)和(1,1)，平方范数还能直接相加吗？算出缺的项。">
    {#snippet answer()}<p>
        和为(2,1)，平方范数5；两项平方范数和为3，缺少交叉项2×1=2。相加能还原不等于正交分解。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="正交性消去交叉项"
  ><FormulaBlock
    latex={String.raw`\mathbf p=\operatorname{proj}_{\mathbf u}(\mathbf v),\quad \mathbf r=\mathbf v-\mathbf p,\quad \mathbf u^\mathsf T\mathbf r=0,\quad\mathbf v=\mathbf p+\mathbf r`}
    description="v为2×1观测，u为2×1非零方向，p为投影，r为残差。本课所有分量无量纲；u由角度构造为单位向量，因此不会变成零方向。"
  /><FormulaBlock
    latex={String.raw`\|\mathbf v\|_2^2=\|\mathbf p\|_2^2+2\mathbf p^\mathsf T\mathbf r+\|\mathbf r\|_2^2=\|\mathbf p\|_2^2+\|\mathbf r\|_2^2`}
    description="p沿u，故与r正交，中间的内积交叉项为零；该平方范数相加关系只对正交分解成立。θ为参考方向角，公式按弧度使用，界面按度输入。"
  />
  <p>
    一般拆成两向量仍能相加还原原向量，却未必正交，也未必满足平方范数相加。正交分解相对于选定子空间唯一，不能把任意拆分都叫投影残差。
  </p></TheorySection
>

<TheorySection id="pitfalls" title="残差不是任意剩余"
  ><CommonMistakes
    items={[
      {
        mistake: '分解后的残差可以与投影方向任意相关。',
        correction: '正交投影的残差与方向内积为零；否则仍能沿方向缩短误差，原结果不可能是最近点。',
      },
      {
        mistake: '两个分量长度相加等于原长度。',
        correction: '相加的是平方范数；非零正交分量的长度和大于斜边长度。',
      },
      {
        mistake: '正交就证明残差为独立噪声。',
        correction:
          '几何内积为零不能证明概率独立，缺失特征、非线性关系和模型错误都可能留在残差中。',
      },
    ]}
  />
  <p>
    在回归中检查残差是否仍沿设计矩阵的列方向变化，可用于验证最小二乘解；诊断系统性误差则还需要看残差与未建模因素的关系。
  </p></TheorySection
>
<TheorySection id="summary" title="解释部分加正交残差"
  ><LessonSummary
    points={[
      '观测等于投影与残差之和，残差与参考方向正交。',
      '正交性消去交叉项，使平方范数能够相加。',
      '更换参考子空间会改变解释部分，但不改变原观测。',
      '残差正交不是噪声独立或模型正确的证明。',
    ]}
    related={['M01-009', 'M01-016', 'M01-020']}
  /></TheorySection
>

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
