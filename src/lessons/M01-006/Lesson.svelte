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
  import { experiment, presets, combineCommands } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let x = $state(0),
    y = $state(1),
    third = $state(false);
  const result = $derived(experiment(x, y, third));
  let commands = $state([0, 0, 0]);
  const motion = $derived(
    combineCommands(result.vectors, commands.slice(0, result.vectors.length)),
  );
  const motionRange = $derived(
    Math.max(2, ...motion.path.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)])) * 1.2,
  );
  const selected = $derived(
    presets.find((p) => p.x === x && p.y === y && p.third === third)?.id ?? 'custom',
  );
  function select(id: string) {
    if (id === 'basis') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = p.x;
      y = p.y;
      third = p.third;
      commands = [0, 0, 0];
    }
  }
</script>

<TheorySection id="motivation" title="平台接到非零指令，为什么还能停在起点？">
  <p>
    平台的每一路驱动提供一个固定移动方向。两路都沿横向时，能否执行非零指令却回到起点？再加入斜向驱动，比较驱动数量与真正可独立控制的方向数。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前课的张成空间收集全部实系数组合。本课进一步问：哪些方向是重复的？最少保留几根向量，才能保持同样的表达能力？
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="试出一组能够抵消的驱动指令">
  <p>
    选择共线驱动，让第一路执行−2份、第二路执行1份，再自行尝试独立驱动。加入第三路后重新寻找抵消指令；观察路线不是空的，终点却可与起点重合。
  </p>
  <PredictionLab {...exploration} context={JSON.stringify([result, commands])} {resetVersion}>
    <InteractivePanel
      title="从两个方向到三个方向"
      instructions="第二向量默认(0,1)，分量范围−2至2，无量纲。第一向量固定(1,0)，可加入第三向量(1,1)。非法输入保留有效值；复位恢复两个标准基。"
      meaning="箭头由当前分量绘制，给出秩、是否为R²的基；若相关，展示实际非平凡系数及其零组合残差。视域按分量等比例调整，比较长度请读坐标。"
      limitations="只对固定第一/第三向量的结构化小模型解析判别；极接近共线的向量在测量噪声下可能难区分，不代表一般数值秩算法。自定义重合箭头的身份由下方坐标读取。"
      onreset={() => select('basis')}
    >
      <section
        class="object-workbench"
        data-testid="object-workbench"
        aria-label="驱动指令抵消实验台"
      >
        <h3>指令不是全零，平台也能回到起点吗？</h3>
        <p>
          先选择驱动配置，再调整每一路的有符号份数。线段按驱动顺序接起；终点由当前指令直接相加，未模拟动力学。
        </p>
        <svg
          viewBox="0 0 360 300"
          role="img"
          aria-label={`指令执行后终点${motion.endpoint.x},${motion.endpoint.y}`}
        >
          <rect class="floor" x="20" y="20" width="320" height="260" rx="12" />
          <polyline
            class="route"
            points={motion.path
              .map((p) => `${180 + (p.x / motionRange) * 110},${150 - (p.y / motionRange) * 110}`)
              .join(' ')}
          />
          <circle
            class="object"
            cx={180 + (motion.endpoint.x / motionRange) * 110}
            cy={150 - (motion.endpoint.y / motionRange) * 110}
            r="11"
          />
          <path class="reference" d="M 172 142 L 188 158 M 172 158 L 188 142" />
        </svg>
        <p>图例：交叉为起点，圆形为执行终点；实线按各路指令顺序接起，横向向右、纵向向上。</p>
        {#each result.vectors as v, i (i)}
          <p>驱动 {i + 1} 每份移动 ({v.x},{v.y})，无量纲。</p>
          <ParameterSlider
            label={`驱动 ${i + 1} 的有符号份数`}
            value={commands[i]}
            min={-3}
            max={3}
            step={0.1}
            onchange={(n) => (commands = commands.map((c, j) => (i === j ? n : c)))}
          />
        {/each}
        <div class="actions">
          <button class="btn btn-outline" onclick={() => (commands = [1, 0, 0])}
            >只执行第一路一份</button
          >
          <button class="btn btn-outline" onclick={() => (commands = [0, 0, 0])}
            >清空全部指令</button
          >
        </div>
        <output data-testid="object-result"
          >终点 ({motion.endpoint.x.toFixed(3)},{motion.endpoint.y.toFixed(3)})；{motion.nontrivial
            ? '指令不全为零'
            : '指令全为零'}；{motion.returned ? '已回到起点' : '尚未回到起点'}</output
        >
        <p>
          先自行找到抵消组合，再与下方解析系数核对。全零指令当然不移动，只有非全零且回到起点才是冗余证据。终点长度不超过1e−12时按返回判定，以容纳浮点舍入；这不代替下方的解析证明。
        </p>
      </section>
      <PresetSelector {presets} value={selected} defaultId="basis" onchange={select} />
      <ParameterSlider
        label="第二向量 x 分量"
        value={x}
        min={-2}
        max={2}
        step={0.1}
        onchange={(v) => (x = v)}
      /><ParameterSlider
        label="第二向量 y 分量"
        value={y}
        min={-2}
        max={2}
        step={0.1}
        onchange={(v) => (y = v)}
      />
      <label>加入第三向量 <input type="checkbox" bind:checked={third} /></label>
      <VectorDiagram
        range={result.range}
        vectors={result.vectors.map((v, i) => ({
          ...v,
          label: v.x === 0 && v.y === 0 ? '' : ['u', 'v', 'w'][i],
          role: (['primary', 'secondary', 'accent'] as const)[i],
        }))}
        description="u为实线，v为虚线，第三向量w另有名称；横纵轴均为无量纲等比例坐标。"
      />
      <div aria-live="polite">
        <p>u=(1,0)，v=({x},{y}){third ? '，w=(1,1)' : ''}</p>
        <p data-testid="result">
          向量数={result.vectors.length}；秩={result.rank}；{result.isBasis
            ? '是 R² 的基'
            : '不是 R² 的基'}
        </p>
        <p>
          {result.coefficients
            ? `非平凡零组合系数：(${result.coefficients.join(',')})；残差长度=${result.residual!.toExponential(2)}`
            : '只有全零系数才能产生零向量。'}
        </p>
      </div>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="能抵消的贡献揭示冗余">
  <p>
    两个方向都能参与组合，不代表它们提供两份独立能力。例如第二向量是第一向量的2倍，那么“第一份−2倍，加第二份1倍”正好抵消。这个抵消式反过来说明，第二向量完全可以由第一向量替代。
  </p>
  <p>
    把“不全为零的系数能组合出零”称为线性相关。这里“不全为零”允许部分系数是0，只要求至少一个不是0；全部系数为0的组合任何向量组都有，不能说明冗余。
  </p>
  <FormulaBlock
    latex={String.raw`-2(1,0)^\mathsf T+1(2,0)^\mathsf T=\mathbf0,\qquad a(1,0)^\mathsf T+b(0,1)^\mathsf T=(a,b)^\mathsf T`}
    description="左侧给出一组非全零系数，因此相关；右侧要得到零向量只能a=b=0，因此两个方向独立。各量无量纲。"
  />
  <p>
    线性独立表示没有某根向量能被其余向量替代。能够张成指定空间、同时又独立的一组向量叫基（basis）；基中向量的数量定义该空间的维数（dimension）。基不唯一，但同一有限维空间的所有基都有相同数量。
  </p>
  <p>
    一个非零向量就能作为它所在直线的基，却不能作为整个平面的基。两个独立平面向量构成平面的基；若硬加第三根，它必能由前两根表示。刚才的实验把第二方向从横轴抬起来，观察零组合的条件如何改变。
  </p>
  <KnowledgeCheck
    prompt="迁移：(1,0)和(1,1)不垂直，能作为平面的基吗？请解释任意(x,y)如何组合出来。"
  >
    {#snippet answer()}<p>
        可以，取系数x−y和y，得到(x,y)。两个系数唯一；正交让计算方便，但不是基的必要条件。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="相关、独立与基">
  <p>
    符号∃表示“至少存在一个”，不等号表示该系数不是0；下标i用于逐个编号。本课讨论的是确定性向量的线性相关，不是随机变量的统计相关。
  </p>
  <FormulaBlock
    latex={String.raw`\sum_{i=1}^{m}a_i\mathbf u_i=\mathbf0,\qquad \exists i:a_i\ne0`}
    description="相关性的判据：m为向量个数，u_i为2×1实列向量，a_i为实系数；存在不全为零的系数满足等式。本课所有量无量纲。若等式仅有全零系数解则独立。"
  />
  <FormulaBlock
    latex={String.raw`u=(1,0)^\mathsf T,\ v=(v_x,v_y)^\mathsf T:\quad au+bv=(a+bv_x,bv_y)^\mathsf T`}
    description="a、b 为两个系数，v_x、v_y 为可调分量。v_y非零时，零组合迫使b=0再迫使a=0；v_y=0时，系数(−v_x,1)给出非平凡零组合。"
  />
  <p>
    本课固定第一向量，所以可直接按第二分量是否为零精确判别；一般浮点矩阵需要明确数值秩容差。基必须相对于空间说明：一个非零向量可作为其所在直线的基，但不足以作为整个平面的基。二维基恰好两个向量。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="数量与维数的区别"
  ><CommonMistakes
    items={[
      {
        mistake: '基的向量数可以超过空间维数。',
        correction: '有限维空间的基既独立又张成，其元素个数等于维数；三根平面向量必相关。',
      },
      {
        mistake: '全零系数能抵消，说明向量组相关。',
        correction: '任何向量组都有平凡零组合；相关必须找到不全为零的系数。',
      },
      {
        mistake: '非正交就不能成为基。',
        correction: '正交不是必要条件；例如(1,0),(1,1)同样独立并张成平面，只是坐标计算需要解方程。',
      },
    ]}
  />
  <p>
    在特征选择中去掉精确冗余列可恢复参数可辨识性，但不等于自动改善泛化。近似冗余则还涉及噪声尺度与条件数，需要结合后续的矩阵秩和SVD分析。
  </p></TheorySection
>
<TheorySection id="summary" title="用最少方向完整表示"
  ><LessonSummary
    points={[
      '相关意味着存在不全为零的系数产生零组合。',
      '独立排除冗余，张成保证覆盖，二者同时成立才构成指定空间的基。',
      '二维空间最多两个独立方向，加入第三向量必相关。',
      '基不必正交；近似相关与数值容差需要单独分析。',
    ]}
    related={['M01-005', 'M01-013', 'M01-018']}
  /></TheorySection
>

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
</style>
