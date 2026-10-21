<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import NumericInput from '../../components/interactive/NumericInput.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import DistributionPlot from '../../components/charts/DistributionPlot.svelte';
  import HistogramPlot from '../../components/charts/HistogramPlot.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { distributionExperiment, presets, diceCDF, type Distribution } from './experiment.ts';
  import { cdf } from '../../lib/math/probability.ts';
  let { metadata }: LessonBodyProps = $props();
  let d = $state<Distribution>({ kind: 'normal', mu: 0, sigma: 1 }),
    count = $state(100),
    seed = $state(42),
    preset = $state('normal'),
    cumulative = $state(false),
    showSamples = $state(true),
    showTheory = $state(true),
    threshold = $state(0),
    dice = $state(3);
  const result = $derived(distributionExperiment(d, count, seed));
  const probability = $derived(cdf(d, threshold));
  const fmt = (n: number | null) => (n === null ? '未定义' : n.toFixed(4));
  function select(id: string) {
    const p = presets.find((p) => p.id === id)!;
    d = { ...p.d };
    count = p.count;
    preset = id;
    seed = 42;
  }
  function reset() {
    select('normal');
    cumulative = false;
    showSamples = true;
    showTheory = true;
    threshold = 0;
    dice = 3;
  }
  function kind(value: string) {
    preset = 'custom';
    d =
      value === 'normal'
        ? { kind: 'normal', mu: 0, sigma: 1 }
        : value === 'uniform'
          ? { kind: 'uniform', a: 0, b: 1 }
          : value === 'binomial'
            ? { kind: 'binomial', n: 10, p: 0.5 }
            : { kind: 'bernoulli', p: 0.5 };
  }
</script>

<TheorySection id="motivation" title="噪声落在阈值以内的概率"
  ><p>
    同一传感器重复采样，每次读数不同。仅给一次观测值，无法回答“读数不超过阈值的概率是多少”。{metadata.title}把一次试验、数值映射和累计概率联系起来。以下分布都是教学模型，不是假装测得的设备噪声。
  </p></TheorySection
>
<TheorySection id="intuition" title="随机变量是规则，样本是一次结果"
  ><p>
    抛骰子的结果属于样本空间，随机变量 X 把结果映射为点数；x=3
    是某次读数或比较阈值。公平骰子小于等于 3 的结果有 3 个，共 6 个等可能结果。
  </p>
  <NumericInput
    label="骰子累计阈值 x"
    value={dice}
    min={0}
    max={7}
    step={0.1}
    onchange={(v) => (dice = v)}
  />
  <p aria-live="polite">
    公平骰子 F({dice}) = {diceCDF(dice).toFixed(4)}；F(3) =
    0.5000。跨过整数点时累计概率跳跃，整数之间保持不变。
  </p></TheorySection
>
<TheorySection id="mathematics" title="质量、密度与累计概率">
  <FormulaBlock
    latex={String.raw`F_X(x)=P(X\le x),\qquad p_X(k)=P(X=k),\qquad P(a<X\le b)=F_X(b)-F_X(a)`}
    description="X 是实值随机变量，x、a、b、k 为无量纲数值，a<b；F 和 p 无量纲。PMF 仅用于离散分布。CDF 单调不减且右连续。"
  />
  <FormulaBlock
    latex={String.raw`F_X(x)=\int_{-\infty}^x f_X(u)\,du,\quad P(X=x)=0\ \text{(连续分布)}`}
    description="f 是连续分布的 PDF；曲线下面积是概率，单点密度不是概率。若 X 以伏特计，密度单位为 1/V；本实验均无量纲。"
  />
  <FormulaBlock
    latex={String.raw`p_{\mathrm{Bern}}(k)=p^k(1-p)^{1-k},\quad p_{\mathrm{Bin}}(k)={n\choose k}p^k(1-p)^{n-k}`}
    description="Bernoulli 的 k∈（0,1 两个值）；Binomial 的 k∈（0 到 n 的整数），n 为非负整数，p∈[0,1]。二项模型假设 n 次独立、同成功率试验。端点 p=0 或 1 用退化分布解释。"
  />
  <FormulaBlock
    latex={String.raw`f_U(x)=\frac{1}{b-a}\mathbf1_{[a,b]}(x),\quad f_N(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}`}
    description="Uniform 要求 a<b；Normal 要求 σ>0，μ 为位置参数，σ 为标准差；方差分别为 (b−a)²/12 和 σ²。正态分布支持整条实数轴。"
  />
  <FormulaBlock
    latex={String.raw`\mathbb E[X]=\sum_k k p_X(k)\quad\text{(离散)},\qquad\mathbb E[X]=\int_{-\infty}^{\infty}x f_X(x)\,dx\quad\text{(连续)}`}
    description="期望 E[X] 是按概率加权的平均值，不是每次观测必须取得的值；k 遍历离散支持点，连续情形对实数轴积分。要求绝对一阶矩有限，本课四种模型均满足。X 若有单位，期望具有相同单位；本实验无量纲。"
  />
  <FormulaBlock
    latex={String.raw`\operatorname{Var}(X)=\mathbb E\!\left[(X-\mathbb E[X])^2\right]`}
    description="总体方差度量围绕期望的平均平方偏离，要求二阶矩有限，单位是 X 单位的平方；本实验无量纲。它是模型性质，与有限样本计算的经验方差不同。"
  />
  <p>
    Bernoulli 的理论均值为 p，方差为 p(1−p)；Binomial 的均值为 np，方差为 np(1−p)。Uniform 的均值为
    (a+b)/2；Normal 的均值为 μ。对照参数变化，检查平均位置与离散程度是否同时改变。
  </p>
  <FormulaBlock
    latex={String.raw`\bar x=\frac1N\sum_{i=1}^Nx_i,\quad s^2=\frac1{N-1}\sum_{i=1}^N(x_i-\bar x)^2`}
    description="N 是样本数，x_i 是随机变量的观测值；s² 是 N>1 时的样本方差。经验总体方差用分母 N，界面同时报告；它们都不等同于已知理论总体方差。"
  />
</TheorySection>
<TheorySection id="experiment" title="理论分布与有限样本对照">
  <InteractivePanel
    title="改变参数，保持随机种子"
    instructions="先比较 μ 平移与 σ 缩放，再切换 CDF：离散分布产生跳跃，连续分布连续。固定 seed 后重复采样完全复现。"
    meaning="理论曲线解析计算；Normal CDF 使用 erf 数值近似（绝对误差约 8×10⁻⁸ 以内）。样本来自固定 Mulberry32 与 Box–Muller 算法。"
    limitations="样本最多 10000，n 最多 100；正态图范围固定为 −15 至 15，图外仍有尾部概率。重新采样会将 seed 加一，不代表真实设备测量。"
    computationKind="simulation"
    {seed}
    sampleCount={count}
    onreset={reset}
  >
    <PresetSelector {presets} value={preset} defaultId="normal" onchange={select} />
    <label class="field"
      >分布类型<select class="select" value={d.kind} onchange={(e) => kind(e.currentTarget.value)}
        ><option value="normal">Normal</option><option value="uniform">Uniform</option><option
          value="bernoulli">Bernoulli</option
        ><option value="binomial">Binomial</option></select
      ></label
    >
    {#if d.kind === 'normal'}<ParameterSlider
        label="均值 μ"
        value={d.mu}
        min={-3}
        max={3}
        step={0.1}
        onchange={(v) => {
          if (d.kind === 'normal') d = { ...d, mu: v };
          preset = 'custom';
        }}
      /><ParameterSlider
        label="标准差 σ"
        value={d.sigma}
        min={0.1}
        max={3}
        step={0.1}
        onchange={(v) => {
          if (d.kind === 'normal') d = { ...d, sigma: v };
          preset = 'custom';
        }}
      />
    {:else if d.kind === 'uniform'}<ParameterSlider
        label="下界 a"
        value={d.a}
        min={-5}
        max={d.b - 0.1}
        step={0.1}
        onchange={(v) => {
          if (d.kind === 'uniform') d = { ...d, a: v };
          preset = 'custom';
        }}
      /><ParameterSlider
        label="上界 b"
        value={d.b}
        min={d.a + 0.1}
        max={5}
        step={0.1}
        onchange={(v) => {
          if (d.kind === 'uniform') d = { ...d, b: v };
          preset = 'custom';
        }}
      />
    {:else}<ParameterSlider
        label="成功概率 p"
        value={d.p}
        min={0}
        max={1}
        step={0.01}
        onchange={(v) => {
          if (d.kind === 'binomial' || d.kind === 'bernoulli') d = { ...d, p: v };
          preset = 'custom';
        }}
      />{#if d.kind === 'binomial'}<NumericInput
          label="试验次数 n"
          value={d.n}
          min={0}
          max={100}
          integer
          onchange={(v) => {
            if (d.kind === 'binomial') d = { ...d, n: v };
            preset = 'custom';
          }}
        />{/if}{/if}
    <NumericInput
      label="样本数量 N"
      value={count}
      min={2}
      max={10000}
      integer
      onchange={(v) => (count = v)}
    /><NumericInput
      label="随机种子 seed"
      value={seed}
      min={0}
      max={4294967295}
      integer
      onchange={(v) => (seed = v)}
    />
    <button class="btn btn-sm" onclick={() => (seed = (seed + 1) >>> 0)}>重新采样（新 seed）</button
    >
    <button class="btn btn-sm btn-outline" onclick={() => (d = { ...d })}>重新生成理论曲线</button>
    <div>
      <label><input type="checkbox" bind:checked={cumulative} /> CDF 视图</label>
      <label><input type="checkbox" bind:checked={showTheory} /> 显示理论分布</label>
      <label><input type="checkbox" bind:checked={showSamples} /> 显示样本</label>
    </div>
    <ParameterSlider
      label="累计概率阈值 x"
      value={threshold}
      min={-20}
      max={101}
      step={0.1}
      onchange={(v) => (threshold = v)}
    />
    <p aria-live="polite">
      F({threshold}) = {probability.toFixed(6)}；阴影对应 x 以下的绘图区域。CDF 视图下看纵坐标，PDF
      视图下看曲线下面积。
    </p>
    <DistributionPlot
      points={showTheory ? (cumulative ? result.cumulative : result.mass) : []}
      discrete={result.discrete}
      {cumulative}
      xRange={result.range}
      yRange={[
        0,
        cumulative
          ? 1.05
          : Math.max(0.1, ...result.mass.map((p) => p.y), ...result.empirical.map((p) => p.y)) *
            1.15,
      ]}
      mean={result.theory.mean}
      empirical={showSamples && !cumulative ? result.empirical : []}
      highlight={[result.range[0], Math.max(result.range[0], Math.min(threshold, result.range[1]))]}
      description="实线为理论；经验柱表示随机样本的频率或密度。CDF 从左向右累计概率，离散分布在支持点跳跃。"
    />
    {#if showSamples}<HistogramPlot
        samples={result.samples}
        bins={result.discrete ? (d.kind === 'binomial' ? d.n + 1 : 2) : 20}
        mode={result.discrete ? 'frequency' : 'density'}
      />{/if}
    <div class="experiment-result" aria-live="polite">
      <strong
        >理论均值 {fmt(result.theory.mean)} · 理论总体方差 {fmt(result.theory.variance)}</strong
      ><span data-testid="sample-stats"
        >经验均值 {fmt(result.stats.mean)} · 样本方差 s² {fmt(result.stats.sampleVariance)} · 经验总体方差
        {fmt(result.stats.populationVariance)}</span
      ><span data-testid="sample-preview"
        >样本前五项：{result.samples
          .slice(0, 5)
          .map((v) => v.toFixed(4))
          .join(', ')}</span
      >
    </div>
    <p>
      探索：先选正态基准，再选增加样本量。经验图通常更稳定，但增加样本数不保证每次都更接近理论。少量二元试验中更换
      seed，比较经验比例波动。
    </p>
  </InteractivePanel>
</TheorySection>
<TheorySection id="pitfalls" title="一次读数无法代表整个分布"
  ><CommonMistakes
    items={[
      {
        mistake: '随机变量就是某次观测值',
        correction: 'X 是试验到数值的映射，x_i 是一次实现；同一个分布能产生不同样本。',
      },
      {
        mistake: '密度高度就是该点的概率',
        correction: '连续单点概率为零，区间概率由密度积分得到；密度可以大于 1。',
      },
      {
        mistake: '所有噪声都正态，且一定落在 3σ 内',
        correction: '正态只是模型假设；真实噪声可能偏斜、相关或重尾。即使正态，3σ 外也有非零概率。',
      },
      {
        mistake: '二项计数允许任意相关事件',
        correction: 'Binomial 假设固定 n、独立同分布的二元试验；关联故障不能直接套用。',
      },
    ]}
  /></TheorySection
>
<TheorySection id="engineering" title="从错误计数到测量不确定性"
  ><p>
    单次错误是否发生可用 Bernoulli，多次独立同概率错误计数可用 Binomial。Uniform
    可描述理想量化误差，Normal 常作为多因素叠加的近似。ADC
    噪声与重复采样估计仍需核查饱和、偏置、相关性和异常值，不能从一张直方图断言模型真实。CDF
    可直接回答超阈值率，均值与方差帮助描述测量不确定性。
  </p></TheorySection
>
<TheorySection id="summary" title="把分布与数据分开"
  ><LessonSummary
    points={[
      '随机变量是映射，样本是观测结果。',
      '离散概率用 PMF，连续概率由 PDF 面积给出。',
      'CDF 统一表达不超过阈值的概率。',
      '理论总体方差与经验方差应明确区分。',
      '固定 seed 便于对照，有限样本仍有波动。',
    ]}
    related={['M02-005', 'M02-006', 'M02-008']}
  /></TheorySection
>
