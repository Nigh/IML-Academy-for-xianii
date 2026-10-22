<script lang="ts">
  import PredictionLab from '../../components/lesson/PredictionLab.svelte';
  import { exploration } from './exploration.ts';
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
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let x = $state(3),
    y = $state(4),
    factor = $state(1),
    sx = $state(1),
    sy = $state(1);
  const result = $derived(experiment(x, y, factor, sx, sy));
  function select(id: string) {
    if (id === 'metres') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = 3;
      y = 4;
      sx = 1;
      sy = 1;
      factor = p.factor;
    }
  }
</script>

<TheorySection id="motivation" title="只改记录单位，最近邻的判断为什么会变？">
  <p>把第一分量从m改成mm，同时把该维尺度也换成mm，归一化距离会改变吗？</p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    已有点积和向量长度的知识。本课把长度推广为范数，并用差向量衡量两点距离；不同尺度如何改变比较结果是新增内容。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="同一位移，不同数值表示">
  <p>比较m与mm显示；再只增大第一尺度。判断两次操作中，哪次改变表示，哪次改变度量。</p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="物理长度与数值分数"
      instructions="默认差向量(3,4)m，尺度均1m。分量范围±5m，尺度0.1至10m。预设只改变第一特征的显示单位；非法输入保留有效结果。"
      meaning="几何始终按m绘制。实线Δ是直达位移，横向与竖向两段显示L1轴向路径；数值区同时报告合法物理范数、错误混合单位分数与归一化度量。"
      limitations="两维欧氏教学模型，无随机/训练。混合m/mm数值平方和只是错误示范，不具有物理长度单位；更一般的特征尺度需要任务知识。"
      onreset={() => select('metres')}
    >
      <PresetSelector
        {presets}
        value={x === 3 && y === 4 && sx === 1 && sy === 1
          ? factor === 1
            ? 'metres'
            : 'millimetres'
          : 'custom'}
        defaultId="metres"
        onchange={select}
      />
      <div class="parameters">
        <ParameterSlider
          label="第一物理分量"
          value={x}
          min={-5}
          max={5}
          step={0.1}
          unit="m"
          onchange={(v) => (x = v)}
        /><ParameterSlider
          label="第二物理分量"
          value={y}
          min={-5}
          max={5}
          step={0.1}
          unit="m"
          onchange={(v) => (y = v)}
        /><ParameterSlider
          label="第一特征尺度"
          value={sx}
          min={0.1}
          max={10}
          step={0.1}
          unit="m"
          onchange={(v) => (sx = v)}
        /><ParameterSlider
          label="第二特征尺度"
          value={sy}
          min={0.1}
          max={10}
          step={0.1}
          unit="m"
          onchange={(v) => (sy = v)}
        />
      </div>
      <VectorDiagram
        range={result.range}
        vectors={[
          { x, y, label: x || y ? 'Δ' : '', role: 'primary' },
          { x, y: 0, label: x ? '横段' : '', role: 'secondary' },
          { x: 0, y, origin: { x, y: 0 }, label: '', role: 'accent' },
        ]}
        description="等比例坐标x/y均为m，Δ为差向量，横段与竖段首尾相接。零分量不画假箭头；重合端点通过独立数值解释。"
      />
      <div aria-live="polite">
        <p data-testid="result">L1={result.l1.toFixed(3)} m；L2={result.l2.toFixed(3)} m</p>
        <p>
          显示分量：{result.shownX}
          {factor === 1 ? 'm' : 'mm'}，{y} m；直接数值平方和开根={result.rawL2.toFixed(
            3,
          )}（{factor === 1 ? '同单位，数值对应m' : '错误混合单位示范，无合法物理长度单位'}）
        </p>
        <p>
          按尺度归一化：L1={result.normalizedL1.toFixed(3)}；L2={result.normalizedL2.toFixed(
            3,
          )}（无量纲）
        </p>
      </div>
    </InteractivePanel>
  </PredictionLab></TheorySection
>
<TheorySection id="intuition" title="直达与沿轴移动">
  <p>
    范数（norm）是对“大小”的一种约定，记号是把向量夹在双竖线中，下标区分不同规则。L2就是熟悉的勾股长度；L1把每个分量的绝对值相加。它们描述不同的任务限制，不是同一个长度的两种写法。
  </p>
  <FormulaBlock
    latex={String.raw`\|(3,4)^\mathsf T\|_2=5,\qquad\|(3,4)^\mathsf T\|_1=7,\qquad\mathbf b-\mathbf a=(3,4)^\mathsf T`}
    description="例中a=(1,1)m，b=(4,5)m；差向量和两个范数都带m单位。L1可解释为只能沿坐标轴走的最短路程。"
  />
  <p>
    距离要先相减再求范数：相减把“从哪里出发”消掉，只保留两点的相对位移。合法范数非负，只有零向量大小为0；放大向量会同比放大大小，绕道也不会比直接连接更短。这些条件分别叫正定性、绝对齐次性和三角不等式。
  </p>
  <p>
    尺度是比较前的单位尺。如果某特征除以它自己的正尺度，就变成无量纲数；尺度越大，该特征同样的变化在距离中越不显著。改米为毫米时，分量和尺度必须同时乘1000。只改分量会让数值变大，却没有新增物理差异。
  </p>
  <KnowledgeCheck
    prompt="迁移：有人用L2的平方替代范数，声称仍满足三角不等式。用数轴上的0、1、2检查这个说法。"
  >
    {#snippet answer()}<p>
        平方距离d(0,2)=4，大于d(0,1)+d(1,2)=2，三角不等式失败。平方距离常用于优化，但不能称为同一个范数。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="从范数定义距离"
  ><FormulaBlock
    latex={String.raw`\|\mathbf z\|_1=\sum_i|z_i|,\quad\|\mathbf z\|_2=\sqrt{\sum_i z_i^2},\quad d_p(\mathbf a,\mathbf b)=\|\mathbf a-\mathbf b\|_p`}
    description="a、b是同坐标、同量纲的n×1实向量，z为其差；本课n=2、各分量单位m，所得范数/距离单位m。p取1或2。范数非负、仅零向量取零、满足绝对齐次性和三角不等式。"
  /><FormulaBlock
    latex={String.raw`\widetilde z_i=z_i/s_i,\quad s_i>0,\qquad d=\sqrt{\sum_i(z_i/s_i)^2}`}
    description="s_i与对应差分量z_i单位相同，是任务指定的正特征尺度；归一化分量及距离均无量纲。本实验两尺度均以m输入，显示单位换为mm时分量与尺度同时乘1000。"
  />
  <p>
    正尺度使这成为缩放坐标中的合法距离。标准化尺度若由数据估计，应只用训练数据拟合，避免验证信息泄露；本课尺度由学习者明确指定，没有估计过程。
  </p></TheorySection
>

<TheorySection id="pitfalls" title="度量包含尺度选择"
  ><CommonMistakes
    items={[
      {
        mistake: '不同单位的特征可以直接等权计算距离。',
        correction:
          '相加的平方项必须先统一单位或按同量纲尺度转为无量纲，否则单位换算就会改变隐含权重。',
      },
      {
        mistake: '平方L2与L2范数可以互换。',
        correction:
          '(3,4)的平方和为25，范数是5；平方距离不满足范数的齐次性，也一般不满足三角不等式。',
      },
      {
        mistake: '归一化会自动决定特征重要性。',
        correction:
          '尺度是建模假设，需要领域知识或仅用训练数据估计；无量纲不意味着所有维度应等权。',
      },
    ]}
  />
  <p>
    工程中先记录每列单位、预处理尺度与度量，再比较近邻或标定误差。否则换一套记录单位就可能改变模型的判断。
  </p></TheorySection
>
<TheorySection id="summary" title="先定义单位再比较距离"
  ><LessonSummary
    points={[
      'L1相加绝对分量，L2取平方和开根，距离作用于差向量。',
      '度量需要明确坐标、单位与特征尺度。',
      '单位换算不改变物理量，但错误混合数值会改变评分。',
      '正尺度归一化产生无量纲度量，尺度选择仍是任务假设。',
    ]}
    related={['M01-007', 'M01-009', 'M05-001']}
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
