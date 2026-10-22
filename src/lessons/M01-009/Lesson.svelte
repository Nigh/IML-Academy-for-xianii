<script lang="ts">
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
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
  let x = $state(3),
    y = $state(2),
    ux = $state(1),
    uy = $state(0),
    t = $state(1);
  const result = $derived(experiment(x, y, ux, uy, t));
  let selected = $state('axis');
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = p.x;
      y = p.y;
      ux = p.ux;
      uy = p.uy;
      t = 1;
      selected = id;
    }
  }
  function change(name: string, n: number) {
    if (name === 'x') x = n;
    else if (name === 'y') y = n;
    else if (name === 'ux') ux = n;
    else if (name === 'uy') uy = n;
    else t = n;
    selected = 'custom';
  }
</script>

<TheorySection id="learning-path" title="接上已有知识">
  <p>
    已有点积和勾股定理。本课的“L2范数”就是欧氏长度，即各分量平方和开根；不要求先学习所有范数，也不使用求导作为必要步骤。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>
<TheorySection id="motivation" title="只能沿一个方向解释观测"
  ><p>
    一组传感器观测或特征向量只能由某个方向的强度解释时，哪个强度最合适？{metadata.title}寻找这个方向张成直线上的最近向量。所有分量和系数均无量纲，本课使用解析计算而非训练。
  </p></TheorySection
>
<TheorySection id="intuition" title="垂足是最近点">
  <p>
    投影（projection）回答一个受限问题：只允许沿给定非零方向的整条直线选择结果，哪一个最接近观测向量？这不是任意截断分量。把观测向直线作垂线，垂足对应的向量就是正交投影；正交在这里就是垂直。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf v=(3,2)^\mathsf T,\quad\mathbf u=(1,0)^\mathsf T,\quad\mathbf p=(3,0)^\mathsf T,\quad d(\alpha)^2=(3-\alpha)^2+4`}
    description="u为参考方向，候选为αu=(α,0)，p为最近点；距离的平方由勾股定理计算，各量无量纲。"
  />
  <p>
    最后一项4固定，前一项是平方，最小只能是0，所以系数为3。这已经用高中配方解释了最小值，无需求导。一般方向也可这样做：用点积展开平方，把关于系数的二次式配方。
  </p>
  <FormulaBlock
    latex={String.raw`\|\mathbf v-\alpha\mathbf u\|_2^2=(\mathbf u\cdot\mathbf u)\left(\alpha-\frac{\mathbf v\cdot\mathbf u}{\mathbf u\cdot\mathbf u}\right)^2+\|\mathbf v\|_2^2-\frac{(\mathbf v\cdot\mathbf u)^2}{\mathbf u\cdot\mathbf u}`}
    description="u非零，故平方项的系数严格为正；后两项不随α变化。α为实数，范数下标2仅表示欧氏长度。"
  />
  <p>
    投影系数是一个数，投影向量是把方向乘该系数后得到的箭头；有符号长度还要考虑方向本身是否为单位长度。将方向放大2倍，系数缩为一半，投影位置不动。方向为零时没有一条参考直线，本课将结果标为未定义。
  </p>
  <KnowledgeCheck prompt="把参考方向放大2倍，最近点是否移动？"
    >{#snippet answer()}<p>
        不移动。同一整条直线没变，系数减半，系数乘方向所得投影不变。
      </p>{/snippet}</KnowledgeCheck
  >
</TheorySection>
<TheorySection id="mathematics" title="最小距离导出投影"
  ><FormulaBlock
    latex={String.raw`\min_{\alpha\in\mathbb R}\|\mathbf v-\alpha\mathbf u\|_2^2,\quad \alpha_*={\mathbf v^\mathsf T\mathbf u\over\mathbf u^\mathsf T\mathbf u},\quad\mathbf p=\alpha_*\mathbf u,\quad\mathbf u\ne\mathbf0`}
    description="v为2×1观测列向量，u为2×1非零参考方向，α为实系数，p为投影向量；本课均无量纲。最小化对整条直线而非射线进行。"
  />
  <p>
    用上面的配方，把平方项取到0便得到最优系数；二次项系数是方向的平方长度，严格为正，因此最小值位置唯一。代入投影后，观测减投影得到的残差与方向正交。实现先归一化方向再计算，避免不必要的平方溢出或下溢。
  </p></TheorySection
>
<TheorySection id="experiment" title="方向尺度与投影位置"
  ><p>
    先预测再操作：把参考方向放大2倍，最近点是否移动？先说明你的理由，再用下面的预设和参数验证；比较图形与数值，最后复位重做一次。
  </p>
  <InteractivePanel
    title="候选点与解析最近点"
    instructions="观测默认(3,2)，方向默认(1,0)，候选系数t默认1。观测与t范围±5，方向分量±3，均无量纲；非法输入保留有效值。"
    meaning="v为观测，p为投影，c=t u为当前候选；辅助虚线从v连接p。下方分别报告当前误差与不受滑块范围限制的最小距离。"
    limitations="二维欧氏内积；零方向未定义。视域随端点等比例调整。极小方向可能使最优标量超出浮点范围，仍报告可表示的几何投影；有限t范围不保证覆盖最优系数。"
    onreset={() => select('axis')}
  >
    <PresetSelector {presets} value={selected} defaultId="axis" onchange={select} />
    <div class="parameters">
      {#each [{ name: 'x', label: '观测 x', value: x, max: 5 }, { name: 'y', label: '观测 y', value: y, max: 5 }, { name: 'ux', label: '方向 x', value: ux, max: 3 }, { name: 'uy', label: '方向 y', value: uy, max: 3 }, { name: 't', label: '候选系数 t', value: t, max: 5 }] as input (input.name)}<ParameterSlider
          label={input.label}
          value={input.value}
          min={-input.max}
          max={input.max}
          step={0.1}
          onchange={(n) => change(input.name, n)}
        />{/each}
    </div>
    <VectorDiagram
      range={result.range}
      vectors={[
        { ...result.v, label: x || y ? 'v' : '', role: 'primary' },
        {
          ...result.candidate,
          label: !result.coincides && (result.candidate.x || result.candidate.y) ? 'c' : '',
          role: 'secondary',
        },
        ...(result.p
          ? [{ ...result.p, label: result.p.x || result.p.y ? 'p' : '', role: 'accent' as const }]
          : []),
      ]}
      projection={result.p ? { from: result.v, to: result.p } : undefined}
      description="横纵轴为无量纲等比例坐标，实线v为观测，虚线c为候选点，p为解析投影；重合点在数值区区分。"
    />
    <div aria-live="polite">
      <p>
        方向 u=({ux},{uy})；候选 c=({result.candidate.x.toFixed(3)},{result.candidate.y.toFixed(3)})
      </p>
      <p data-testid="result">
        投影：{result.p
          ? `(${result.p.x.toFixed(3)},${result.p.y.toFixed(3)})`
          : '未定义：方向为零'}
      </p>
      <p>
        最优系数：{result.p
          ? result.coefficient === null
            ? '超出浮点表示范围'
            : result.coefficient.toFixed(3)
          : '未定义'}；最小距离：{result.distance?.toFixed(3) ??
          '未定义'}；候选距离：{result.candidateDistance.toFixed(3)}
      </p>
    </div>
  </InteractivePanel>
  <p>
    场景一调t到3，候选命中投影且距离为2。场景二把方向放大两倍，投影仍为(3,0)，只需t=1.5。场景三投影为零但方向合法；场景四没有合法方向，投影和最优系数未定义。复位恢复默认。
  </p></TheorySection
>
<TheorySection id="pitfalls" title="系数不是投影向量"
  ><CommonMistakes
    items={[
      {
        mistake: '投影公式允许方向向量为零。',
        correction: '零方向没有对应直线，分母为零；它不同于非零方向上的零投影。',
      },
      {
        mistake: '放大方向就会放大投影。',
        correction: '非零倍数不改变直线，系数会反向补偿长度变化。',
      },
      {
        mistake: '投影就是把负系数丢掉。',
        correction: '直线投影允许负系数；截断会改成射线约束，最近点可能不同。',
      },
    ]}
  />
  <p>
    线性回归沿一个特征列拟合目标时就是这个问题；目标中无法沿该方向解释的部分保留为残差。正交性是几何性质，不能自动推断残差是独立随机噪声。
  </p></TheorySection
>
<TheorySection id="summary" title="最近分量与条件"
  ><LessonSummary
    points={[
      '投影是非零方向张成直线上的欧氏最近点。',
      '最优系数乘方向才得到投影向量，二者不可混淆。',
      '参考方向任意非零缩放不改变几何投影。',
      '零投影是合法结果，零参考方向则未定义。',
    ]}
    related={['M01-007', 'M01-010', 'M01-020']}
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
