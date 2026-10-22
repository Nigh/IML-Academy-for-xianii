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
  import NumericInput from '../../components/interactive/NumericInput.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import Plot2D from '../../components/charts/Plot2D.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('diagonal'),
    tail = $state(1),
    k = $state(1),
    selected = $state('one');
  const r = $derived(experiment(mode, tail, k));
  const fmt = (n: number) => Number(n.toPrecision(5));
  function select(id: string) {
    if (id === 'one') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      tail = p.tail;
      k = p.k;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="只保留一个方向时，删掉的信息能否从其他方向补回来？">
  <p>diag(3,1)只保留第一奇异项，剩余矩阵的Frobenius误差是多少？</p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前课已经知道SVD的三个因子和奇异方向。本课只新增“保留部分方向”的近似方法，以及如何汇总全部元素的重构误差。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="逐项恢复矩阵">
  <p>先逐项恢复，再改变尾项大小；换到混合坐标时，检查误差是否仍由同样的尾部奇异值决定。</p>
  <PredictionLab {...exploration} context={JSON.stringify(r)} {resetVersion}>
    <InteractivePanel
      title="误差来自哪一项"
      instructions="第一奇异值固定3；第二奇异值默认1、范围0–3，步长0.25；保留项数k默认1，仅取0、1、2，可用键盘数值框。非法值保留有效结果。选择对角或固定45°混合坐标场景。"
      meaning="图画解析最优误差随k的变化，圆点标当前选择；连线仅辅助阅读，k只取整数。下方逐项列出A、A_k、遗漏矩阵和两个秩1项，数值为直接解析计算，显示5有效位。"
      limitations="二维固定奇异向量模型，非通用矩阵压缩程序。小模型不节省实际存储；Frobenius最优不保证语义、感知质量或下游准确率最优。"
      onreset={() => select('one')}
    >
      <PresetSelector {presets} value={selected} defaultId="one" onchange={select} />
      <ParameterSlider
        label="第二奇异值 σ₂"
        value={tail}
        min={0}
        max={3}
        step={0.25}
        onchange={(n) => {
          tail = n;
          selected = 'custom';
        }}
      />
      <NumericInput
        integer
        label="保留项数 k"
        value={k}
        min={0}
        max={2}
        step={1}
        onchange={(n) => {
          k = n;
          selected = 'custom';
        }}
      />
      <Plot2D
        series={r.series}
        xRange={[-0.1, 2.1]}
        yRange={[-0.2, 4.6]}
        xLabel="保留项数 k（整数）"
        yLabel="Frobenius误差"
        yUnit="无量纲"
        description="误差随保留项数增加而不增，当前圆点来自实际重构矩阵；k=2时完整恢复。"
      />
      <div aria-live="polite" data-testid="result">
        <p>
          原矩阵秩={r.rank}；当前近似秩={r.retainedRank}；Frobenius误差={fmt(
            r.error,
          )}；解析尾项误差={fmt(r.expected)}；保留能量={fmt(100 * r.energy)}%。
        </p>
        <p>原矩阵A：</p>
        <MatrixView values={r.matrix.map((row) => row.map(fmt))} />
        <p>重构A_k：</p>
        <MatrixView values={r.approximation.map((row) => row.map(fmt))} />
        <p>遗漏A−A_k：</p>
        <MatrixView values={r.residual.map((row) => row.map(fmt))} />
      </div>
      <details>
        <summary>查看两个秩1项</summary>
        <p>第一项σ₁u₁v₁ᵀ：</p>
        <MatrixView values={r.first.map((row) => row.map(fmt))} />
        <p>第二项σ₂u₂v₂ᵀ：</p>
        <MatrixView values={r.second.map((row) => row.map(fmt))} />
      </details>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="保留强方向，舍弃弱方向">
  <p>
    一个奇异方向对应一份简单变换：只读取输入在该方向的分量，乘伸缩倍数，再沿对应输出方向输出。把全部这些变换相加就还原原矩阵；每份只有一个输出方向，称为秩1项。
  </p>
  <p>
    公式中的外积把一列向量与另一列向量的转置相乘，得到矩阵：每个元素是两向量对应位置的乘积。它和产生一个标量的内积不同。截断SVD只保留最大的前k份，k越小，丢弃的方向越多。
  </p>
  <FormulaBlock
    latex={String.raw`A=\begin{pmatrix}3&0\\0&1\end{pmatrix},\quad A_1=\begin{pmatrix}3&0\\0&0\end{pmatrix},\quad A-A_1=\begin{pmatrix}0&0\\0&1\end{pmatrix}`}
    description="A1表示只保留一项的近似；全部元素无量纲。纵向信息被删除，不能靠横向那份自动补回。"
  />
  <p>
    Frobenius范数把矩阵所有元素当作一个长列表，逐个平方、求和、开根。因此上例误差为1；全部丢弃时为平方根10，全部保留时为0。这是重构误差，不是某个下游任务的预测误差。
  </p>
  <p>
    奇异值平方和常被称为“能量”；本课是数学量，不宣称实际物理能量。截断法在这个未加权误差下最优，不保证保留任务所需的小方向。下面2×2例子的因子反而可能比原矩阵占更多数值，只演示近似原理，不冒充压缩收益。
  </p>
  <KnowledgeCheck
    prompt="迁移：保留90%能量能保证分类准确率至少90%吗？给出一个小方向仍重要的可能情形。"
  >
    {#snippet answer()}<p>
        不能。若类别差异恰在被删的小方向，即使其能量很小，删除也会丢掉判别信息。Frobenius最优没有给出下游任务保证。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="截断SVD与最优误差">
  <FormulaBlock
    latex={String.raw`A_k=\sum_{i=1}^{k}\sigma_i u_i v_i^\mathsf T,\qquad \operatorname{rank}(A_k)\le k`}
    description="A为m×n实矩阵，u_i∈R^m、v_i∈R^n为单位正交奇异向量，σ_i按非增顺序排列且非负。外积u_i v_iᵀ为m×n矩阵。k是0至p=min(m,n)的整数，k=0时空和定义为零矩阵。所有量无量纲，本课m=n=2。"
  />
  <FormulaBlock
    latex={String.raw`\|A-A_k\|_F=\sqrt{\sum_{i>k}\sigma_i^2}=\min_{\operatorname{rank}(B)\le k}\|A-B\|_F`}
    description="Frobenius范数为全部矩阵元素平方和的平方根；B为与A同形状的候选矩阵。Eckart–Young–Mirsky定理说明截断SVD是未加权Frobenius误差下的最优秩至多k近似；重复奇异值时最优解可能不唯一。不是任意任务损失下最优。"
  />
  <p>
    不同奇异项在Frobenius内积下正交，每个项的平方范数是σ_i²，因此删去项的误差能量相加。对σ=(3,1)，k=0、1、2的误差依次为√10、1、0。正交换轴保持Frobenius范数，所以混合坐标场景仍有相同误差。
  </p>
  <FormulaBlock
    latex={String.raw`\text{保留能量比例}=\frac{\sum_{i\le k}\sigma_i^2}{\sum_i\sigma_i^2},\qquad \text{因子存储量约为 }k(m+n+1)`}
    description="能量比例要求A非零；本课第一奇异值固定3，分母始终非零。存储量按U_k、k个奇异值和V_k的稠密标量数计，不计元数据；原矩阵需mn个标量。仅当k(m+n+1)<mn时才有该朴素存储优势。"
  />
  <p>
    本课2×2秩1因子需5个标量，反而多于原矩阵4个，故只演示原理。实际大矩阵在k远小于维度时才可能节省；把A_k重新存成完整稠密矩阵也不会自动省存储。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="能量保留不等于细节无损"
  ><CommonMistakes
    items={[
      {
        mistake: '低秩近似能无损保留所有细节。',
        correction: '若被删奇异值非零，就有不可恢复的矩阵误差。只有k不少于原矩阵秩才精确重构。',
      },
      {
        mistake: '保留90%能量就保证下游准确率90%。',
        correction:
          '能量是平方奇异值比例，既不是样本正确率，也不衡量关键语义；小能量方向仍可能承载重要任务信息。',
      },
      {
        mistake: '低秩矩阵在任何尺寸都更省存储。',
        correction: '因子也有开销；本课2×2秩1的朴素因子需要5个数，比原4个更多。',
      },
    ]}
  />
  <p>
    在噪声较强时，删去尾方向可能有利，但“尾部全是噪声”需要额外数据假设和验证，不由SVD定理保证。
  </p></TheorySection
>
<TheorySection id="summary" title="明确压缩目标和误差"
  ><LessonSummary
    points={[
      '截断SVD保留最大的k个奇异项，得到秩至多k的近似。',
      'Frobenius误差由被舍弃奇异值的平方和决定。',
      '保留到原秩可以精确恢复，否则通常有损。',
      '存储收益与任务质量需要另行评估，不能用能量比例替代。',
    ]}
    related={['M01-013', 'M01-018', 'M01-020']}
  /></TheorySection
>

<style>
  p {
    overflow-wrap: anywhere;
  }
</style>
