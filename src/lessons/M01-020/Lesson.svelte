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
  import Plot2D from '../../components/charts/Plot2D.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, candidate, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let extra = $state(false),
    delta = $state(0),
    selected = $state('three');
  let candidateIntercept = $state(1);
  let candidateSlope = $state(1);
  const trial = $derived(candidate(extra, delta, candidateIntercept, candidateSlope));
  const r = $derived(experiment(extra, delta));
  const fmt = (n: number) => Number(n.toPrecision(5));
  function select(id: string) {
    if (id === 'three') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      candidateIntercept = 1;
      candidateSlope = 1;
      extra = p.extra;
      delta = p.delta;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="三点不共线，怎样判断一条拟合线已经无法整体改善？">
  <p>
    一组标定读数无法同时落在同一条直线上。调仪表零点和增益时，怎样比较整组误差？一张样本卡更准，是否意味着整组也更准？
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    已有伪逆、列空间和正交残差。本课将它们用于一组具体观测，建立逐点误差、平方和与最优预测之间的联系。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="三点残差与离群点影响">
  <p>比较三点、普通第四点和离群点。尝试调整自己的直线让平方和更低，再用列内积检查是否还可改进。</p>
  <PredictionLab
    {...exploration}
    context={JSON.stringify([r, candidateIntercept, candidateSlope])}
    {resetVersion}
  >
    <InteractivePanel
      title="投影条件不要求每点零残差"
      instructions="先操作标定台的零点、增益按钮，比较每张样本卡。默认三点。勾选增加第四观测(t=2,b=3+δ)，δ默认0，范围−8至8，步长0.5，无量纲；非法数值保留有效值，可键盘编辑。预设离群点δ=6。复位恢复三点。"
      meaning="圆点为观测，实线为我的候选，虚线为解析最优。表格显示候选的逐点残差和平方贡献；展开对照查看最优参数及Aᵀr。"
      limitations="确定性小样本解析计算，无随机性。仅最小化训练样本未加权平方和，不保证鲁棒、因果或泛化。视域随数据自适应，跨场景比较应看轴刻度与系数。"
      onreset={() => select('three')}
    >
      <PresetSelector {presets} value={selected} defaultId="three" onchange={select} />
      <label
        ><input
          type="checkbox"
          checked={extra}
          onchange={(e) => {
            extra = e.currentTarget.checked;
            selected = 'custom';
          }}
        /> 增加第四观测</label
      >
      {#if extra}<ParameterSlider
          label="第四观测偏移 δ"
          value={delta}
          min={-8}
          max={8}
          step={0.5}
          onchange={(n) => {
            delta = n;
            selected = 'custom';
          }}
        />{/if}
      <section class="object-workbench" data-testid="object-workbench" aria-label="测量标定工作台">
        <h3>调零点和增益，让一组标定读数整体接近记录</h3>
        <p>
          合成标定记录：输入 t 和响应 b 均已归一化。零点对应截距 c，增益对应斜率
          a；下方每张卡是一次测量，不是真实硬件数据。
        </p>
        <div class="object-actions">
          <button
            class="btn"
            disabled={candidateIntercept >= 8}
            onclick={() => (candidateIntercept = Math.min(8, candidateIntercept + 0.5))}
            >零点提高半单位</button
          >
          <button
            class="btn"
            disabled={candidateIntercept <= -8}
            onclick={() => (candidateIntercept = Math.max(-8, candidateIntercept - 0.5))}
            >零点降低半单位</button
          >
          <button
            class="btn"
            disabled={candidateSlope >= 8}
            onclick={() => (candidateSlope = Math.min(8, candidateSlope + 0.5))}
            >增益提高半单位</button
          >
          <button
            class="btn"
            disabled={candidateSlope <= -8}
            onclick={() => (candidateSlope = Math.max(-8, candidateSlope - 0.5))}
            >增益降低半单位</button
          >
        </div>
        <div class="object-cards" data-testid="sample-readings" aria-live="polite">
          {#each r.points as point, i (i)}<output class="object-card"
              >样本 {i + 1}：输入 {point[0]}；记录 {point[1]}；仪表预测 {fmt(
                trial.predicted[i],
              )}；误差 {fmt(trial.residual[i])}；平方贡献 {fmt(trial.residual[i] ** 2)}</output
            >{/each}
        </div>
        <p>
          只调零点时，每张卡的预测同增同减；调增益时，负输入和正输入如何变化？先预测，再操作。比较总平方误差，不要求每张卡各自达到零误差。
        </p>
      </section>
      <p>
        先调整自己的直线，尝试降低总平方误差。观察改进一个点时，其他点怎样变化；需要对照时再查看解析最优值。
      </p>
      <ParameterSlider
        label="我的截距 c"
        value={candidateIntercept}
        min={-8}
        max={8}
        step={0.05}
        onchange={(n) => (candidateIntercept = n)}
      />
      <ParameterSlider
        label="我的斜率 a"
        value={candidateSlope}
        min={-8}
        max={8}
        step={0.05}
        onchange={(n) => (candidateSlope = n)}
      />
      <p data-testid="candidate-loss" aria-live="polite">
        我的平方和SSE={fmt(trial.sse)}；两列内积=({trial.normal.map(fmt).join(',')})
      </p>
      <Plot2D
        series={[trial.series, r.series[1], r.series[0]]}
        xRange={[-1.5, 2.5]}
        yRange={trial.yRange}
        xLabel="观测输入 t"
        yLabel="响应 b"
        xUnit="无量纲"
        yUnit="无量纲"
        description="观测散点与两条拟合线；圆点是数据，解析最优为虚线，我的候选为实线。此图不等同于Rⁿ观测空间。"
      />
      <details>
        <summary>对照解析最优直线</summary>
        <div aria-live="polite" data-testid="result">
          <p>
            观测数={r.points.length}；斜率a={fmt(r.slope)}；截距c={fmt(
              r.intercept,
            )}；平方和SSE={fmt(r.sse)}。
          </p>
          <p>
            Aᵀr=({r.normal.map((n) => n.toExponential(3)).join(',')})；原三点系数a={fmt(
              r.baseline.slope,
            )}、c={fmt(r.baseline.intercept)}。
          </p>
        </div>
      </details>
      <MatrixView
        values={r.points.map((p, i) => [
          p[0],
          p[1],
          fmt(trial.predicted[i]),
          fmt(trial.residual[i]),
          fmt(trial.residual[i] ** 2),
        ])}
        columnLabels={['t', 'b', '我的预测', 'r=预测−b', 'r²']}
      />
      <details>
        <summary>查看设计矩阵A</summary><MatrixView
          values={r.matrix}
          columnLabels={['常数列', '输入列']}
        />
      </details>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="观测空间中的正交投影">
  <p>
    每个输入位置t对应一个观测响应。候选直线给出预测，预测减观测就是该点残差。本课用这个符号约定；它与前面“观测减投影”的写法相差负号，但平方和与正交条件不变。
  </p>
  <p>
    最小二乘把所有残差平方后相加，选总和最小的参数。一处改善可能要让另一处变差，它并不是让每个点都单独达到自己的最小误差。
  </p>
  <FormulaBlock
    latex={String.raw`\widehat b_i=c+at_i,\qquad L(c,a)=\sum_{i=1}^{n}(c+at_i-b_i)^2`}
    description="t_i为输入、b_i为观测、带帽的b为预测，a为斜率、c为截距，i编号观测，n为观测数。本课全部无量纲。"
  />
  <p>
    设计矩阵把每个观测的常数1和输入t排成一行，参数列按截距、斜率排列。每一列分别描述调一个参数时，全体预测会怎样一起变化。因此列空间位于观测空间：3个观测需要3个坐标，不能把实验中的二维数据散点图当成这个空间。
  </p>
  <p>
    最优预测是观测在列空间上的投影，正交残差无法再沿任一模型列缩短。实验中的Aᵀr给出每列与残差的点积。梯度是各参数单独变化时的变化率组成的向量，凸表示平方目标不会藏着更低的局部谷底；两者用于补充说明，核心结论可直接由已有的投影和展开平方验证。
  </p>
  <KnowledgeCheck
    prompt="迁移：如果所有输入t相同，仍能唯一拟合截距和斜率吗？解释列空间与参数之间的区别。"
  >
    {#snippet answer()}<p>
        不能唯一识别两参数：常数列与输入列相关，只有c+a
        t这个组合可被确定。最优预测可唯一，参数却可不唯一；原斜率公式分母为0。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="最优性条件与线性拟合">
  <FormulaBlock
    latex={String.raw`L(x)=\|Ax-b\|_2^2,\quad r=Ax-b,\quad A^\mathsf Tr=0`}
    description="A为n×p实设计矩阵，b为n维观测，x为p维参数；r为n维残差。n是观测数，p是参数数，所有量无量纲。最优残差与每个模型列的内积为0；本课n=3或4，p=2，不除以n，也不含1/2。"
  />
  <FormulaBlock
    latex={String.raw`\widehat b_i=c+a t_i,\quad A_i=[1\ \ t_i],\quad x=(c,a)^\top,\quad a=\frac{\sum_i(t_i-\bar t)(b_i-\bar b)}{\sum_i(t_i-\bar t)^2},\ c=\bar b-a\bar t`}
    description="t_i为第i个输入，b_i为对应响应，c为截距、a为斜率，横线表示样本算术平均。该解析式要求输入不全相同，分母正；网页对过小分母拒绝计算，不用零替代未定义斜率。"
  />
  <p>
    将平方和分别对c、a求导，可得Σr_i=0与Σt_i
    r_i=0，解出上式。对输入(−1,0,1)、响应(0,1,3)，斜率3/2、截距4/3，残差为(−1/6,1/3,−1/6)，平方和1/6，两项正交检查都为0。
  </p>
  <FormulaBlock
    latex={String.raw`\operatorname{rank}(A)=p\ \Longrightarrow\ x^\star=(A^\mathsf TA)^{-1}A^\mathsf Tb`}
    description="满列秩时参数解唯一。若不满列秩，最优预测仍唯一，但参数可不唯一；伪逆给最小范数解。大型或病态问题通常采用QR/SVD等更稳定的分解，不必显式形成法方程的逆。"
  />
</TheorySection>

<TheorySection id="pitfalls" title="整体最优不等于逐点最优"
  ><CommonMistakes
    items={[
      {
        mistake: '最小二乘会令每个观测误差分别最小。',
        correction: '它最小化总平方和，参数在各点之间折中；三点不共线时无法逐点都零误差。',
      },
      {
        mistake: '残差与模型列正交说明残差为0。',
        correction: '列空间外可有非零正交分量；Aᵀr≈0只是最优性条件，不是完美拟合。',
      },
      {
        mistake: '平方损失会自动忽略离群点。',
        correction: '大残差的平方贡献更大，常会强烈牵动参数；鲁棒损失或异常处理是额外选择。',
      },
    ]}
  />
  <p>
    这里的几何正交是有限样本内积关系，不是残差与真实信号统计独立的证明。观测有不同噪声方差或量纲时，应考虑加权与尺度处理。
  </p></TheorySection
>
<TheorySection id="summary" title="把残差与模型方向分开"
  ><LessonSummary
    points={[
      '最小二乘寻找b在设计矩阵列空间中的正交投影。',
      '最优残差满足Aᵀr=0，但每个分量未必为0。',
      '满列秩保证参数唯一，降秩需结合伪逆与零空间。',
      '平方损失放大离群点影响，拟合好坏不等于泛化或鲁棒性。',
    ]}
    related={['M01-010', 'M01-015', 'M01-016', 'M01-018']}
  /></TheorySection
>

<style>
  .object-workbench {
    border: 1px solid var(--color-base-300);
    border-radius: 0.75rem;
    padding: 1rem;
    margin-block: 1rem;
    background: var(--color-base-100);
  }
  .object-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 0.75rem;
  }
  .object-actions button {
    min-height: 44px;
    white-space: normal;
  }
  .object-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
    gap: 0.75rem;
  }
  .object-card {
    border: 1px solid var(--color-base-300);
    padding: 0.75rem;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .object-workbench output {
    display: block;
    font-variant-numeric: tabular-nums;
  }

  p {
    overflow-wrap: anywhere;
  }
</style>
