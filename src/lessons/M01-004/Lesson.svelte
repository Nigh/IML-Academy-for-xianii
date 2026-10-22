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
  import Plot2D from '../../components/charts/Plot2D.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let d = $state(0),
    a = $state(1),
    b = $state(1);
  const result = $derived(experiment(d, a, b));
  const selected = $derived(
    presets.find((p) => p.d === d && p.a === a && p.b === b)?.id ?? 'custom',
  );
  function select(id: string) {
    if (id === 'linear') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      d = p.d;
      a = p.a;
      b = p.b;
    }
  }
</script>

<TheorySection id="motivation" title="两张合格的向量卡相加，输出卡还合格吗？">
  <p>
    检验台用一条坐标规则筛选向量卡。输入的两张卡都满足规则；把它们相加、取反或乘零，输出卡是否仍能通过同一检验？比较过原点的规则与带固定偏移的规则。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前置课程已经教过向量逐分量相加，以及正、负、零倍数。本课问的是：选定的一批向量，经过这些操作后会不会离开这批向量？
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="用成员卡检查组合是否仍合法">
  <p>
    先在两种规则下按“两张成员卡相加”和“成员乘以零”；再试“各取一半”。比较输出卡的通过状态，说明为什么某次成功不能证明所有组合都合法。
  </p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="组合后还在线上吗"
      instructions="偏移 d 默认0，系数 a、b 默认1；范围均 −2 至2，无量纲。u=(1,2+d)、v=(−1,−2+d)。输入非法时保留有效结果。"
      meaning="折线是候选集合，三个有名称的散点为 u、v 和 w；计算缺陷 w_y−2w_x−d 判断组合是否仍满足方程。重合点通过下方坐标和图例读取。"
      limitations="只展示直线族和两名成员；有限交互不是任意集合封闭性的证明。点的成员判定用绝对容差1e−12，子空间结论由解析条件 d=0 给出。"
      onreset={() => select('linear')}
    >
      <section
        class="object-workbench"
        data-testid="object-workbench"
        aria-label="向量成员组合检验台"
      >
        <h3>把两张成员卡送进组合检验器</h3>
        <p>候选规则是 y=2x+{d}。两张卡都满足它；选择一个运算，检验输出卡还能否通过同一规则。</p>
        <div class="actions">
          <span>卡 u：({result.u.x},{result.u.y})</span><span
            >卡 v：({result.v.x},{result.v.y})</span
          >
        </div>
        <div class="actions">
          <button
            class="btn btn-outline"
            onclick={() => {
              a = 1;
              b = 1;
            }}>两张成员卡相加</button
          >
          <button
            class="btn btn-outline"
            onclick={() => {
              a = 0;
              b = 0;
            }}>成员乘以零</button
          >
          <button
            class="btn btn-outline"
            onclick={() => {
              a = -1;
              b = 0;
            }}>把成员 u 取反</button
          >
          <button
            class="btn btn-outline"
            onclick={() => {
              a = 0.5;
              b = 0.5;
            }}>两张卡各取一半</button
          >
        </div>
        <output data-testid="object-result"
          >输出卡 ({result.w.x.toFixed(2)},{result.w.y.toFixed(2)})：{result.member
            ? '通过成员检验'
            : '未通过成员检验'}；检验差值 {result.defect.toFixed(3)}</output
        >
        <p>
          一次未通过就能推翻封闭性；几次通过不能代替对任意成员、任意实系数的证明。此处直接操作向量卡，避免把仿射位置误当成位移。
        </p>
      </section>
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
        equal
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
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="封闭意味着组合后仍合法">
  <p>
    先从高中直线开始：满足某条方程的所有点构成一个集合（set），其中某个点就是集合的成员。“属于”只是在问这个点是否满足条件。把点的坐标当作从原点指向它的向量，便能对成员做加法和数乘。
  </p>
  <p>
    向量空间（vector
    space）是一组能按规则相加、数乘的对象；运算满足交换、结合和分配等规律。普通二维实向量已经满足这些规律。我们从这个大空间中挑一部分成员时，若它们仍构成向量空间，这一部分就叫子空间（subspace）。
  </p>
  <FormulaBlock
    latex={String.raw`V=\{(x,y)^\mathsf T:y=2x\},\quad \mathbf u=(1,2)^\mathsf T,\quad \mathbf v=(-1,-2)^\mathsf T`}
    description="V读作“所有满足y等于2x的二维向量的集合”；u、v是其中两个成员。本课坐标和系数均无量纲。"
  />
  <p>
    试着相加：两个成员相加得到原点，仍在线上；把其中一个成员乘−2，也仍在线上。这种“做完允许的运算，还留在集合里”的性质叫封闭（closure）。要证明子空间，不能只测这两个点：必须对任意成员、任意实数系数都成立，并且集合非空。
  </p>
  <p>
    为什么一定要有零向量？任何成员乘0都会得到它。如果候选集合不含原点，就已经失败。把直线向上移1，虽然仍像一条普通直线，却不含原点，因而不是线性子空间。这不表示它没用，而是属于不同的数学结构。
  </p>
  <p>
    线性模型在这里指把固定向量分别乘系数后相加的规则。所有允许的输出合起来叫输出集合；系数允许取任意实数且没有固定偏移时，这个集合就是线性输出空间。机器学习中常把加固定偏置的模型也叫线性模型，但严格数学上它对输入通常是仿射（affine）映射；读本课时要区分这两种用法。
  </p>
  <KnowledgeCheck prompt="迁移：两条坐标轴的并集包含原点，它是子空间吗？请给出一组检验。">
    {#snippet answer()}<p>
        取(1,0)和(0,1)，和为(1,1)，不在任一坐标轴上。零向量是必要条件，加法和任意实数乘的封闭性也必须成立。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="子空间判据与反例">
  <p>
    读公式时，R表示实数，R²表示两个实数排成的向量；∈读作“属于”，∀读作“对于任意”，空集符号表示没有成员，花括号表示把满足条件的对象收集成集合。这里“任意”不能替换为“我试过的几个”。
  </p>
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
  .object-workbench {
    padding: 1rem;
    border: 1px solid var(--color-base-content);
    border-radius: 0.75rem;
    background: var(--color-base-200);
    margin-block: 1rem;
  }
  .object-workbench .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 0.75rem;
  }
  .object-workbench button {
    min-height: 44px;
    height: auto;
    white-space: normal;
  }
  .object-workbench output {
    display: block;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }

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
