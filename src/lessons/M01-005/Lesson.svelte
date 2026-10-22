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
  let chartHost = $state<HTMLDivElement>();
  $effect(() => {
    const plot = chartHost?.querySelector('figure');
    if (!plot || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      plot.scrollLeft = (plot.scrollWidth - plot.clientWidth) / 2;
    });
    observer.observe(plot);
    return () => observer.disconnect();
  });

  let { metadata }: LessonBodyProps = $props();
  let mode = $state('plane'),
    a = $state(3),
    b = $state(-2);
  const result = $derived(experiment(mode, a, b));
  const selected = $derived(
    presets.find((p) => p.id === mode && p.a === a && p.b === b)?.id ?? 'custom',
  );
  function select(id: string) {
    if (id === 'plane') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.id;
      a = p.a;
      b = p.b;
    }
  }
</script>

<TheorySection id="motivation" title="两路驱动都能前进后退，平台就能到达任何目标吗？">
  <p>
    定位平台有两路驱动，每一路都能前进、后退。先用横向、纵向驱动把平台送到目标；再把两路驱动都装到同一条斜线上，观察再多指令能否补出缺少的移动方向。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前课已经解释集合、向量加法、数乘和子空间的封闭性。本课固定几根向量，研究只靠调整系数能够到达哪些位置。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="给定位平台下达驱动指令">
  <p>
    在独立驱动场景先按后退，再找回目标；换到共线驱动，尝试前进和后退。平台终点、两段移动轨迹和数学图同步更新：哪些误差能靠指令消除，哪些需要增加新方向？
  </p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="组合与不可消除的距离"
      instructions="场景一默认 a=3、b=−2；场景二默认 a=1、b=0。两个系数范围均−3至3、无量纲，非法输入不会进入模型。先预测再切换场景，尝试把当前组合移到目标。"
      meaning="散点由25组固定整数系数实时生成；目标和当前组合另列图例。下方显示两份中间贡献、组合、当前误差及目标到完整span的最小距离。"
      limitations="有限网格不等于连续span。图域按场景和当前参数调整，比较距离请读取数值；最近点仅对本课标准平面或直线解析计算。"
      onreset={() => select('plane')}
    >
      <section
        class="object-workbench"
        data-testid="object-workbench"
        aria-label="两路驱动定位平台"
      >
        <h3>用两路驱动把平台送到目标</h3>
        <p>
          每次点按给相应驱动增加或减少一份指令。标准驱动分别改变横、纵位置；共线驱动只能沿同一方向往返。坐标是无量纲教学指令单位。
        </p>
        <svg
          viewBox="0 0 360 320"
          role="img"
          aria-label={`平台终点${result.w.x},${result.w.y}，目标${result.target.x},${result.target.y}`}
        >
          <rect class="floor" x="20" y="20" width="320" height="280" rx="12" />
          <path class="reference" d="M 180 40 V 290 M 30 160 H 330" />
          <path
            class="route"
            d={`M 180 160 L ${180 + (result.first.x / result.extent) * 120} ${160 - (result.first.y / result.extent) * 120} L ${180 + (result.w.x / result.extent) * 120} ${160 - (result.w.y / result.extent) * 120}`}
          />
          <circle
            class="object"
            cx={180 + (result.w.x / result.extent) * 120}
            cy={160 - (result.w.y / result.extent) * 120}
            r="10"
          />
          <path
            class="reference"
            d={`M ${180 + (result.target.x / result.extent) * 120 - 9} ${160 - (result.target.y / result.extent) * 120 - 9} l 18 18 m -18 0 l 18 -18`}
          />
        </svg>
        <p>
          图例：圆形为平台，交叉为目标，中心为起点。横向向右、纵向向上，实线路线依次显示两路贡献。
        </p>
        <div class="actions">
          <button class="btn btn-outline" disabled={a > 2} onclick={() => (a += 1)}
            >驱动一前进一份</button
          >
          <button class="btn btn-outline" disabled={a < -2} onclick={() => (a -= 1)}
            >驱动一后退一份</button
          >
          <button class="btn btn-outline" disabled={b > 2} onclick={() => (b += 1)}
            >驱动二前进一份</button
          >
          <button class="btn btn-outline" disabled={b < -2} onclick={() => (b -= 1)}
            >驱动二后退一份</button
          >
        </div>
        <output data-testid="object-result"
          >平台 ({result.w.x.toFixed(2)},{result.w.y.toFixed(2)})；距目标 {result.error.toFixed(
            4,
          )}；{result.error < 1e-12 ? '已命中目标' : '继续调整指令，或判断目标是否可达'}</output
        >
      </section>
      <PresetSelector {presets} value={selected} defaultId="plane" onchange={select} />
      <div class="parameters">
        <ParameterSlider
          label="第一方向系数 a"
          value={a}
          min={-3}
          max={3}
          step={0.1}
          onchange={(n) => (a = n)}
        /><ParameterSlider
          label="第二方向系数 b"
          value={b}
          min={-3}
          max={3}
          step={0.1}
          onchange={(n) => (b = n)}
        />
      </div>
      <div bind:this={chartHost}>
        <Plot2D
          equal
          series={result.series}
          xRange={[-result.extent, result.extent]}
          yRange={[-result.extent, result.extent]}
          xLabel="第一特征"
          yLabel="第二特征"
          xUnit="无量纲"
          yUnit="无量纲"
          description="25组系数网格：两个独立方向铺开平面，共线方向的点重合在一条直线上。目标与组合可能重合，数值区域如实报告。"
        />
      </div>
      <div aria-live="polite">
        <p>
          u=({result.u.x},{result.u.y})；v=({result.v.x},{result.v.y})；目标=({result.target
            .x},{result.target.y})
        </p>
        <p>
          贡献 a u=({result.first.x.toFixed(2)},{result.first.y.toFixed(2)})，b v=({result.second.x.toFixed(
            2,
          )},{result.second.y.toFixed(2)})
        </p>
        <p data-testid="result">
          组合=({result.w.x.toFixed(2)},{result.w.y.toFixed(2)})；当前误差={result.error.toFixed(
            4,
          )}；张成维数={result.dimension}
        </p>
        <details>
          <summary>进阶：目标到可达集合的最近距离</summary>
          <p>
            这是到整条可达直线的垂直距离，不是当前滑块结果的误差。系统解释见 <a
              href={lessonHref('M01-009')}>M01-009 投影</a
            >；不需要先掌握它才能理解张成。
          </p>
          <p>
            目标在span中的最近点=({result.nearest.x.toFixed(2)},{result.nearest.y.toFixed(
              2,
            )})；最小距离={result.distance.toFixed(4)}
          </p>
        </details>
      </div>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="固定方向，改变系数">
  <p>
    固定两个方向，把各自的贡献缩放再相加，得到一个结果，这叫一次线性组合（linear
    combination）。系数就是每个方向贡献多少的数，可以为负、为零，也不要求相加等于1。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf u=(1,0)^\mathsf T,\quad\mathbf v=(0,1)^\mathsf T,\qquad 3\mathbf u-2\mathbf v=(3,-2)^\mathsf T`}
    description="u和v是固定方向，3和−2是本次选取的无量纲系数；结果是二维无量纲向量。"
  />
  <p>
    如果把系数换一遍，就会到另一个位置。让系数取遍所有实数，把所有可能到达的向量收集起来，就是这组向量的张成空间（span）。“张成”不是一种额外运算，而是描述这些方向合起来能覆盖哪些结果。一次组合是一个点，张成空间是全部可达点的集合。
  </p>
  <p>
    两个坐标轴方向可以分别控制横、纵分量，因此能覆盖整个平面。换成沿同一直线的两个方向，即使系数再多，也只能沿这条线前进和后退。
  </p>
  <FormulaBlock
    latex={String.raw`a(1,1)^\mathsf T+b(2,2)^\mathsf T=(a+2b,a+2b)^\mathsf T`}
    description="a、b为任意实系数。两个结果分量总相等，所以目标(1,0)永远无法由这两个方向组合得到。"
  />
  <p>
    “张成维数”数的是可独立变化的方向：只有零向量是0维，一条过原点的直线是1维，整个二维平面是2维。它不是数手上有几根箭头。新增一根原有方向的倍数不会增加维数；下一课会用线性独立和基给出更正式的解释。
  </p>
  <p>
    实验图中的有限点只是若干系数组合的示例。点之间以及视域外也可能属于张成空间；滑块的有限范围是操作边界，不是数学定义的范围。先判断能否命中目标，再调参数验证。
  </p>
  <KnowledgeCheck
    prompt="迁移：新增方向(−3,−3)能帮助命中(1,0)吗？若不能，给出一个能扩展可达集合的方向并解释。"
  >
    {#snippet answer()}<p>
        它仍在同一直线上，不能。新增(1,0)等线外方向后，两个独立方向可张成平面；增加数量本身没有保证。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="从一次组合到整个张成空间">
  <p>
    下面Σ读作求和：逐个取方向乘它的系数，再把结果相加；i是编号，m是向量数量。花括号和冒号表示“收集所有满足冒号后条件的结果”，不是再算出一个向量。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf w=\sum_{i=1}^{m}a_i\mathbf u_i,\quad\operatorname{span}\{\mathbf u_1,\ldots,\mathbf u_m\}=\left\{\sum_{i=1}^{m}a_i\mathbf u_i:a_i\in\mathbb R\right\}`}
    description="m 是方向向量个数（正整数）；u_i 与 w 是2×1实列向量，a_i 为实系数；本课均无量纲。span 是集合，w 是其中一个元素；系数不受UI范围限制。"
  />
  <FormulaBlock
    latex={String.raw`a\begin{pmatrix}1\\0\end{pmatrix}+b\begin{pmatrix}0\\1\end{pmatrix}=\begin{pmatrix}a\\b\end{pmatrix},\qquad a\begin{pmatrix}1\\1\end{pmatrix}+b\begin{pmatrix}2\\2\end{pmatrix}=\begin{pmatrix}a+2b\\a+2b\end{pmatrix}`}
    description="a、b 是两个无量纲实系数。左式取 a=3、b=−2 命中目标；右式的两个分量始终相等，因此不可能生成 (1,0)。"
  />
  <p>
    张成空间必含零向量，也对线性组合封闭：两个组合相加或缩放，只是把它们的系数相加或缩放。这连接了前一课的子空间判据。能张成平面不等于任何受限系数范围都能到达整个平面，数学定义和控件预算要区分。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="更多向量不一定增加方向">
  <CommonMistakes
    items={[
      {
        mistake: '增加向量数量必然增加张成维数。',
        correction:
          '(2,2) 是 (1,1) 的倍数，加入后没有新方向。只有不在已有span内的向量才扩展表达能力。',
      },
      {
        mistake: '调参总能消除拟合误差。',
        correction:
          '当目标不在模型张成空间时，再调系数也不可能精确命中。本课共线场景的最小距离严格为正。',
      },
      {
        mistake: '图中没有的点就不在span中。',
        correction: '图只显示25组整数系数；span定义允许任意实数，还包含网格之间和视域外的点。',
      },
    ]}
  />
  <p>
    设计矩阵中重复或倍数关系的特征列不会增加模型的线性表达方向，反而可能令权重表示不唯一。下一课用非平凡零组合准确描述这种冗余；这里的表达误差也不等于数据分布上的泛化误差。
  </p>
</TheorySection>
<TheorySection id="summary" title="张成描述表达能力">
  <LessonSummary
    points={[
      '线性组合是一次加权求和，span收集所有实系数的组合。',
      '新增向量只有带来已有span外的方向才增加维数。',
      '目标不在span中时，权重调节不能消除表达误差。',
      '有限系数网格只是可视化样本，不是整个张成空间。',
    ]}
    related={['M01-004', 'M01-006', 'M01-020']}
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
  .object-workbench svg {
    display: block;
    width: 100%;
    max-width: 32rem;
    margin: auto;
  }
  .object-workbench .floor {
    fill: var(--color-base-100);
    stroke: var(--color-base-content);
  }
  .object-workbench .route {
    stroke: var(--color-primary);
    stroke-width: 3;
    fill: none;
  }
  .object-workbench .reference {
    stroke: var(--color-base-content);
    stroke-width: 2;
    fill: none;
    stroke-dasharray: 5 4;
  }
  .object-workbench .object {
    fill: var(--color-accent);
    stroke: var(--color-base-content);
    stroke-width: 2;
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
