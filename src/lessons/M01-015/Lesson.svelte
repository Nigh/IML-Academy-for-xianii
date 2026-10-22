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
  import { experiment, presets, commandOutput } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('identity'),
    b1 = $state(2),
    b2 = $state(1),
    t = $state(0),
    selected = $state('identity');
  let drive1 = $state(0),
    drive2 = $state(0);
  const measured = $derived(commandOutput(mode, drive1, drive2));
  const result = $derived(
    experiment(mode, b1, b2, t, 1.3 * Math.max(Math.abs(drive1), Math.abs(drive2))),
  );
  const viewExtent = $derived(
    Math.max(result.extent, 1.3 * Math.abs(drive1), 1.3 * Math.abs(drive2)),
  );
  const fmt = (n: number) => Number(n.toFixed(3));
  function select(id: string) {
    if (id === 'identity') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      drive1 = 0;
      drive2 = 0;
      mode = p.mode;
      b1 = p.b1;
      b2 = p.b2;
      t = p.t;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="相同测量规则，为什么能出现唯一解、无穷解和无解？">
  <p>
    两路控制指令经过一个已标定的混合器，驱动两个读数表。给定目标读数，怎样反求指令？如果两个表其实测的是同一组合，还能独立设定目标吗？这里使用无量纲的理想线性模型。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    已有列空间、秩、零空间及解族的知识。本课把高中方程组的相交、平行与重合连接到这些概念，再解释何时能用逆矩阵恢复输入。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="切换右端项与解的类型">
  <p>先比较相交、重合与平行，再只改右端项；检查系数矩阵奇异时，目标变化会怎样改变解的存在性。</p>
  <PredictionLab {...exploration} context={JSON.stringify([result, drive1, drive2])} {resetVersion}>
    <InteractivePanel
      title="同一个矩阵，不同观测"
      instructions="先操作双通道控制器，比较表读数与目标，再查看约束线与解。选择矩阵场景。b₁默认2、b₂默认1，各范围−4至4；解族系数t默认0、范围−3至3，步长0.25，均无量纲。数值框支持键盘；非有限或越界输入不进入计算。"
      meaning="实线与虚线分别表示两行约束，圆点是唯一解或解族当前成员。无解时不伪造交点；两线重合时虚线覆盖实线，文字明确说明。图范围自适应，像素长度不可跨预设比较。"
      limitations="仅三个结构已知的小矩阵；相容性按当前双精度数值严格比较b₂−2b₁是否为0，预设与0.25步长均能精确表示。任意近似输入或含噪数据需容差/最小二乘分析。t只在无穷解时影响当前成员。"
      onreset={() => select('identity')}
    >
      <PresetSelector {presets} value={selected} defaultId="identity" onchange={select} />
      <section class="object-workbench" data-testid="object-workbench" aria-label="双通道标定台">
        <h3>先操作控制器，让两只表同时到达目标</h3>
        <p>
          指令 x₁、x₂ 可正可负。混合规则由下方 A
          给出；切换预设会清零指令。先试自己的指令，再对照解析解。
        </p>
        <div class="object-cards">
          <div class="object-card">
            <ParameterSlider
              label="控制器一指令 x₁"
              value={drive1}
              min={-8}
              max={8}
              step={0.25}
              onchange={(n) => (drive1 = n)}
            />
          </div>
          <div class="object-card">
            <ParameterSlider
              label="控制器二指令 x₂"
              value={drive2}
              min={-8}
              max={8}
              step={0.25}
              onchange={(n) => (drive2 = n)}
            />
          </div>
        </div>
        <div class="object-cards" aria-live="polite" data-testid="instrument-readings">
          <output class="object-card"
            >表一：{fmt(measured[0])}；目标 {b1}；差值 {fmt(measured[0] - b1)}</output
          >
          <output class="object-card"
            >表二：{fmt(measured[1])}；目标 {b2}；差值 {fmt(measured[1] - b2)}</output
          >
        </div>
        <p>现在调整下方目标，再试控制器：重复测量模式下，两只表能否任意独立设置？</p>
      </section>
      <ParameterSlider
        label="右端项 b₁"
        value={b1}
        min={-4}
        max={4}
        step={0.25}
        onchange={(n) => {
          b1 = n;
          selected = 'custom';
        }}
      />
      <ParameterSlider
        label="右端项 b₂"
        value={b2}
        min={-4}
        max={4}
        step={0.25}
        onchange={(n) => {
          b2 = n;
          selected = 'custom';
        }}
      />
      <ParameterSlider
        label="解族系数 t"
        value={t}
        min={-3}
        max={3}
        step={0.25}
        onchange={(n) => {
          t = n;
          selected = 'custom';
        }}
      />
      <MatrixView values={result.matrix} columnLabels={['x₁系数', 'x₂系数']} />
      <Plot2D
        equal
        series={[
          ...result.series,
          {
            id: 'command',
            label: '我的控制指令',
            kind: 'scatter',
            points: [{ x: drive1, y: drive2 }],
            role: 'secondary',
          },
        ]}
        xRange={[-viewExtent, viewExtent]}
        yRange={[-viewExtent, viewExtent]}
        xLabel="x₁"
        yLabel="x₂"
        xUnit="无量纲"
        yUnit="无量纲"
        description="输入平面中的两行约束：实线第一式，虚线第二式；重合表示约束重复，圆点标识解析解，另一个散点标识我的控制指令。线段在视域边界截取，解族不限于图中范围。"
      />
      <div aria-live="polite" data-testid="result">
        <p>
          解的类型：{result.status === 'unique'
            ? '唯一解'
            : result.status === 'infinite'
              ? '无穷多解（两约束重合）'
              : '无解（两约束平行分离）'}；det A={result.determinant}。
        </p>
        {#if mode === 'dependent'}<p>
            消元检查：0=b₂−2b₁={result.consistency.toExponential(3)}。{result.status === 'none'
              ? '矛盾，故没有精确解。'
              : '恒等式，剩余一个自由参数。'}
          </p>{/if}
        {#if result.solution && result.output}<p>
            当前解=({result.solution.map(fmt).join(',')})；Ax=({result.output
              .map(fmt)
              .join(',')})；b=({b1},{b2})；残差范数={result.residual?.toExponential(2)}。
          </p>{/if}
        {#if result.inverse}<p>解析逆矩阵：</p>
          <MatrixView values={result.inverse} />{:else}<p>
            逆矩阵不存在；这不等于每个右端项都无解。
          </p>{/if}
      </div>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="约束直线的三种关系">
  <p>
    矩阵方程把一组高中线性方程简写到一起：每行就是一条约束，未知数放在同一列。先按消元法判断约束有没有冲突，再问能不能唯一还原输入。
  </p>
  <FormulaBlock
    latex={String.raw`\begin{cases}x_1+x_2=2\\2x_1+2x_2=d\end{cases}\quad\Longrightarrow\quad 0=d-4`}
    description="两式相减：第二式减第一式的2倍。d为目标第二读数，各量无量纲；d不为4时矛盾，为4时第二式没有新增约束。"
  />
  <p>
    逆矩阵是撤销变换的规则，记号上标−1不是对每个元素取倒数。单位矩阵I沿每个方向保持输入，作用相当于“什么也不改”；逆矩阵与原矩阵先后作用必须得到I。仅对某个目标找到解，不代表对所有目标都能唯一反求。
  </p>
  <p>
    满秩方阵表示输入方向全部保留，且输入输出维数相同。二维行列式是从四个元素算出的一个数，下面给出乘积之差公式；其绝对值是单位方形经变换后的面积，为0说明被压成线或点，因此不能逆转。增广矩阵是在系数矩阵右侧再附上目标列，用于同时记录约束及其目标。
  </p>
  <KnowledgeCheck
    prompt="迁移：一个1×2矩阵满行秩，对所有标量目标都有解。这是否足以定义普通逆和唯一解？"
  >
    {#snippet answer()}<p>
        不足。[1,1]满行秩但有非零核方向，对任意已有解可加(t,−t)。非方阵没有此处的双边普通逆，满行秩也不保证唯一。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="逆矩阵需要什么条件">
  <FormulaBlock
    latex={String.raw`A\mathbf x=\mathbf b,\quad A\in\mathbb R^{n\times n},\quad \operatorname{rank}A=n\ \Longrightarrow\ \mathbf x=A^{-1}\mathbf b`}
    description="x、b为n维实列向量，A为n×n实方阵，本课n=2，全部分量无量纲。仅当A满秩时存在逆A⁻¹，满足A⁻¹A=AA⁻¹=I_n，I_n为单位矩阵。此时对任意b都有且只有一个解。"
  />
  <FormulaBlock
    latex={String.raw`A=\begin{bmatrix}a&c\\d&e\end{bmatrix},\quad\det A=ae-cd\ne0,\quad A^{-1}=\frac1{ae-cd}\begin{bmatrix}e&-c\\-d&a\end{bmatrix}`}
    description="a、c、d、e为矩阵的四个无量纲实元素；det为行列式。此2×2公式要求分母非零；不适用于奇异矩阵，也不是任意维度求解器。网页只计算固定矩阵的已知解析逆。"
  />
  <p>
    把Ax=b左乘A⁻¹即可得到解公式。对倍数行矩阵，第二式减去第一式的2倍后得到0=b₂−2b₁：右端非零时矛盾；右端为零时只剩x₁+x₂=b₁，因此x=(b₁/2+t,b₁/2−t)，t可为任意实数。
  </p>
  <p>
    一般线性系统有解当且仅当b属于A的列空间；等价地，增广矩阵[A|b]与A的秩相同。若有解，零空间是否只有0决定唯一性。实际大型计算通常直接求解或做分解，不必显式形成逆矩阵；含噪观测需要最小二乘，留给后续课程。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="奇异与无解不是同义词"
  ><CommonMistakes
    items={[
      {
        mistake: '每个方阵都存在逆矩阵。',
        correction: '[[1,1],[2,2]]行列式为0、秩1，没有逆。方形只规定形状，满秩才保证可逆。',
      },
      {
        mistake: '矩阵不可逆，所以任何b都无解。',
        correction: '同一个倍数行矩阵，b=(2,4)有无穷多解，b=(2,3)无解；需要检查相容性。',
      },
      {
        mistake: '计算出的残差很小就说明逆存在且解稳定。',
        correction:
          '小残差只说明当前候选近似满足方程。近奇异矩阵仍可能放大观测误差，需要额外的条件数和稳定性分析。',
      },
    ]}
  />
  <p>
    这里的直线分类针对每行都是非零约束的二维示例。一般矩阵还可能出现零行、更多变量和高维仿射解集，应使用秩与零空间判据，不能把二维画面当作完整算法。
  </p></TheorySection
>
<TheorySection id="summary" title="先判存在性再判唯一性"
  ><LessonSummary
    points={[
      '方程能否有解取决于b与列空间是否相容。',
      '方阵满秩时才可逆，且任意右端项都有唯一解。',
      '奇异系统可以无解，也可以有无穷多解。',
      '解公式有适用条件，数值求解还需考虑噪声与稳定性。',
    ]}
    related={['M01-013', 'M01-014', 'M01-016', 'M01-020']}
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
