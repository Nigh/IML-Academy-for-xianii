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
  let x = $state(3),
    y = $state(2),
    degrees = $state(0);
  const result = $derived(experiment(x, y, degrees));
  const selected = $derived(
    presets.find((p) => p.x === x && p.y === y && p.degrees === degrees)?.id ?? 'custom',
  );
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = p.x;
      y = p.y;
      degrees = p.degrees;
    }
  }
  const fmt = (n: number) => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(3);
</script>

<TheorySection id="motivation" title="观测中哪些部分能被模型解释"
  ><p>
    标定模型只包含一个已知响应方向时，可以解释观测的多少部分？{metadata.title}把观测拆成沿模型方向的拟合分量和剩余残差。它是理解最小二乘几何的基础，而不只是作图技巧。本课使用无量纲的二维确定性向量，不进行真实训练。
  </p></TheorySection
>
<TheorySection id="intuition" title="沿线分量与垂直剩余"
  ><p>
    先找到参考直线上离观测最近的投影，再从投影终点走到观测终点，这一步就是残差。若残差还含有参考方向分量，就能继续沿线移动投影来缩短距离，原来的点便不是最优点。因此最小二乘残差必须与参考方向正交。
  </p>
  <p>
    改变参考方向会重新分配可解释部分和残差，但二者相加仍还原同一观测。平方范数也守恒；这里的平方范数只是数学量，不能未经物理模型就称为实际能量。
  </p></TheorySection
>
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
<TheorySection id="experiment" title="旋转参考方向再分解"
  ><InteractivePanel
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
  <p>
    场景一得到残差(0,2)，验证13=9+4。场景二转到45°，观测不动，验证13=12.5+0.5。连续改变方向角，检查方向内积接近零；场景三观测已在参考直线上，残差为零。最后复位恢复场景一。
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
