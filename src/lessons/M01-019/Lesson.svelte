<script lang="ts">
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
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('diagonal'),
    tail = $state(1),
    k = $state(1),
    selected = $state('one');
  const r = $derived(experiment(mode, tail, k));
  const fmt = (n: number) => Number(n.toPrecision(5));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      tail = p.tail;
      k = p.k;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="只保存主要结构会丢什么"
  ><p>
    大型特征矩阵、图像和模型权重常含冗余结构。若只保存几个主要方向，存储和计算可能减少，但遗漏信息如何衡量？{metadata.title}用截断SVD给出明确答案。本课只用无量纲2×2合成矩阵演示误差，不宣称已经压缩真实模型或提升性能。
  </p></TheorySection
>
<TheorySection id="intuition" title="保留强方向，舍弃弱方向"
  ><p>
    SVD把矩阵拆成若干秩1项，每一项描述一个输入方向到输出方向的映射。按奇异值从大到小保留前k项，得到低秩近似（low-rank
    approximation）。diag(3,1)的第一项保留横轴伸缩3，却彻底删除纵轴伸缩1；被删的方向不能靠保留项自动恢复。
  </p>
  <p>
    换到混合坐标后，遗漏信息会分散到多个矩阵元素，但总的Frobenius误差不变。因此“把小元素设零”和“截断小奇异值”是两种不同操作。
  </p></TheorySection
>
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
<TheorySection id="experiment" title="逐项恢复矩阵">
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
  <p>
    场景一验证k=1误差1、保留能量90%。场景二增加到k=2，检查误差0；把k改为0，观察两方向全部删除。场景三检查混合坐标下四个遗漏元素共同贡献同样误差。场景四第二奇异值本来为0，一项即可无损，复位恢复一般情形。
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
