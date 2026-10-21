<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import Plot2D from '../../components/charts/Plot2D.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let d = $state(0),
    a = $state(1),
    b = $state(1);
  const result = $derived(experiment(d, a, b));
  const selected = $derived(
    presets.find((p) => p.d === d && p.a === a && p.b === b)?.id ?? 'custom',
  );
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      d = p.d;
      a = p.a;
      b = p.b;
    }
  }
</script>

<TheorySection id="motivation" title="模型允许哪些输出">
  <p>
    一个线性模型只能把若干固定方向按实数系数相加。如果允许的输出集合在相加或缩放后会跑出去，它就不能作为这样的线性输出空间。{metadata.title}帮助我们区分“所有线性组合都合法”的集合与带偏移的集合。
  </p>
  <p>
    例如两路无量纲特征受约束 y=2x，任何强度的叠加仍满足比例关系；加上固定偏置后变成
    y=2x+1，关系看似只是平移，代数结构却改变了。ML 中带 bias
    的映射通常是仿射映射，不是严格线性映射。
  </p>
</TheorySection>
<TheorySection id="intuition" title="封闭意味着组合后仍合法">
  <p>
    在一个集合中选两个向量，任意拉伸、翻转并相加，结果仍属于集合，这叫对线性组合封闭。非空集合还必须容纳零向量，因为把任何成员乘零就得到零。过原点的直线能满足；离开原点的平移直线不能满足。
  </p>
  <p>
    这里研究 R²
    中采用通常加法与数乘的子空间。结合律、交换律、分配律等从环境空间继承；非空加上线性组合封闭即可验证子空间。一般抽象向量空间还包括函数、多项式等对象，不能仅用箭头定义。
  </p>
</TheorySection>
<TheorySection id="mathematics" title="子空间判据与反例">
  <FormulaBlock
    latex={String.raw`V\ne\varnothing,\quad \forall\mathbf u,\mathbf v\in V,\ \forall a,b\in\mathbb R:\ a\mathbf u+b\mathbf v\in V`}
    description="V 为 R² 的候选非空子集；u、v 为2×1实向量；a、b为任意实标量。本课所有坐标、系数均无量纲。使用通常的加法与数乘，不能另加系数限制。"
  />
  <FormulaBlock
    latex={String.raw`V_d=\{(x,y)^\mathsf T:y=2x+d\},\quad w_y-2w_x-d=(a+b-1)d`}
    description="d 是固定偏移；w=a u+b v。u、v 属于 V_d，因此各自的 y−2x=d。将它们代入可得右式；所有量无量纲。"
  />
  <p>
    当 d=0，右式对任意 a、b 都为零，且集合包含原点，所以是子空间。d 非零时，取 a=b=0
    就得到非零的成员缺陷 −d，因此不是子空间。这是解析证明；交互只是让反例可以看见。d 非零且 a+b=1
    时结果也会在线上，但仅说明仿射组合封闭。
  </p>
</TheorySection>
<TheorySection id="experiment" title="直线能否容纳线性组合">
  <InteractivePanel
    title="组合后还在线上吗"
    instructions="偏移 d 默认0，系数 a、b 默认1；范围均 −2 至2，无量纲。u=(1,2+d)、v=(−1,−2+d)。输入非法时保留有效结果。"
    meaning="折线是候选集合，三个有名称的散点为 u、v 和 w；计算缺陷 w_y−2w_x−d 判断组合是否仍满足方程。重合点通过下方坐标和图例读取。"
    limitations="只展示直线族和两名成员；有限交互不是任意集合封闭性的证明。点的成员判定用绝对容差1e−12，子空间结论由解析条件 d=0 给出。"
    onreset={() => select('linear')}
  >
    <PresetSelector {presets} value={selected} defaultId="linear" onchange={select} />
    <div class="parameters">
      <ParameterSlider
        label="偏移 d"
        value={d}
        min={-2}
        max={2}
        step={0.1}
        onchange={(n) => (d = n)}
      />
      <ParameterSlider
        label="u 的系数 a"
        value={a}
        min={-2}
        max={2}
        step={0.1}
        onchange={(n) => (a = n)}
      />
      <ParameterSlider
        label="v 的系数 b"
        value={b}
        min={-2}
        max={2}
        step={0.1}
        onchange={(n) => (b = n)}
      />
    </div>
    <Plot2D
      series={result.series}
      xRange={[-5, 5]}
      yRange={[-12, 12]}
      xLabel="x"
      yLabel="y"
      xUnit="无量纲"
      yUnit="无量纲"
      description="折线为候选集合 y=2x+d，散点图例分别标出 u、v、组合 w；横纵坐标均无量纲，固定视域方便比较偏移。"
    />
    <div aria-live="polite">
      <p>u=({result.u.x},{result.u.y})；v=({result.v.x},{result.v.y})</p>
      <p data-testid="result">
        w=({result.w.x.toFixed(3)},{result.w.y.toFixed(3)}) · 缺陷 {result.defect.toFixed(3)} · {result.member
          ? '当前组合属于集合'
          : '当前组合不属于集合'}
      </p>
      <p>
        集合 V_d：{result.subspace ? '是线性子空间' : '不是线性子空间'}；{d === 0
          ? '原点在集合内'
          : '原点不在集合内'}。
      </p>
    </div>
  </InteractivePanel>
  <p>
    场景一先取
    a=b=1，检查相加结果；任意改系数，缺陷仍为零。场景二保持系数不动只加偏移，缺陷变为1。场景三取零系数，在平移直线中直接见到零向量不属于集合。再令
    a+b=1，观察偶然成功为何不足以证明子空间。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="一次成功不是证明">
  <CommonMistakes
    items={[
      {
        mistake: '任何几何直线或平面都是线性子空间。',
        correction: '还必须经过原点并对通常加法、任意实数乘封闭。y=2x+1 是仿射集合，不包含原点。',
      },
      {
        mistake: '测试几组组合成立就证明封闭。',
        correction:
          '封闭性是全称命题，一次反例可以否定，有限次成功无法证明。本课推导给出了对任意系数成立的代数条件。',
      },
      {
        mistake: '包含零向量就足以成为子空间。',
        correction: '两条坐标轴的并集包含零，但 (1,0)+(0,1)=(1,1) 不在并集中；仍需检查加法和数乘。',
      },
    ]}
  />
  <p>
    工程上，若线性模型缺少固定偏置，可把常数特征单独加入设计矩阵。这样扩充的是模型表示，不能把原来的平移集合说成子空间。
  </p>
</TheorySection>
<TheorySection id="summary" title="从集合到子空间">
  <LessonSummary
    points={[
      'R² 的非空子集在通常运算下对任意线性组合封闭，就构成线性子空间。',
      '零向量是必要条件；仅有零向量仍不足以证明封闭。',
      '过原点的直线与平移直线具有不同代数结构。',
      '反例能否定全称命题，证明则需覆盖全部成员与系数。',
    ]}
    related={['M01-002', 'M01-005', 'M01-012']}
  />
</TheorySection>

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
