<script lang="ts">
  import PredictionLab from '../../components/lesson/PredictionLab.svelte';
  import { exploration } from './exploration.ts';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import type { Vector2 } from '../../lib/math/vector.ts';
  import { mapping, unitGrid } from '../../lib/math/coordinates.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import MatrixView from '../../components/math/MatrixView.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let a = $state([
      [2, 0],
      [0, 1],
    ]),
    selected = $state('stretch');
  const result = $derived(experiment(a));
  const map = $derived(
    mapping([-result.extent, result.extent], [-result.extent, result.extent], 320, 320, true),
  );
  const screen = (p: Vector2) => {
    const q = map.toScreen(p);
    return { x: q.x + 50, y: q.y + 30 };
  };
  const polygon = (points: Vector2[]) =>
    points.map((p) => `${screen(p).x},${screen(p).y}`).join(' ');
  function select(id: string) {
    if (id === 'stretch') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      a = p.matrix.map((r) => [...r]);
      selected = id;
    }
  }
  function edit(r: number, c: number, n: number) {
    a = a.map((row, i) => row.map((value, j) => (i === r && j === c ? n : value)));
    selected = 'custom';
  }
</script>

<TheorySection id="motivation" title="只知道两个单位方向的去处，够不够画出整个变换？">
  <p>矩阵两列分别是(2,0)和(0,1)。单位方形右上角(1,1)会去哪里？</p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前课已经能够按行列计算矩阵乘法。本课把同一个计算应用到整个平面的点，而不只是一个数字列表，解释“变换”和“线性”的含义。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="变换网格和单位正方形">
  <p>
    对比拉伸、剪切与压成直线；试着只改一列，预测哪个基方向的像变化。原网格和新网格用相同坐标读数比较。
  </p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="两列决定整个网格"
      instructions="默认A=diag(2,1)。四个元素范围±2、无量纲；修改任一元素即时变换所有网格端点，非法输入保留有效值。"
      meaning="虚线网格与虚线正方形是变换前；实线网格及粗实线多边形是变换后。圆形端点表示第一列，方形端点表示第二列；原点不动。"
      limitations="二维、有界解析计算；视域随矩阵等比例调整，比较大小时读取坐标。压缩时网格真实重合，不人为拉开；原始方格仅覆盖[−1,1]²，不代表变换的全部定义域。"
      onreset={() => select('stretch')}
    >
      <PresetSelector {presets} value={selected} defaultId="stretch" onchange={select} />
      <div class="parameters">
        {#each a as row, r (r)}{#each row as value, c (c)}<ParameterSlider
              label={`A 第${r + 1}行第${c + 1}列`}
              {value}
              min={-2}
              max={2}
              step={0.1}
              onchange={(n) => edit(r, c, n)}
            />{/each}{/each}
      </div>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal diagram scrolling.) -->
      <div class="frame" tabindex="0" role="region" aria-label="线性变换图，可横向滚动">
        <svg
          viewBox="0 0 420 420"
          role="img"
          aria-label="等比例坐标：x横轴、y纵轴，无量纲；虚线为原网格、实线为变换后网格和单位正方形，圆/方端点区别两列。"
        >
          <title>矩阵作用于所有网格端点；压缩时保留重合关系。</title>
          {#each unitGrid([-result.extent, result.extent], 320).values as tick (tick)}
            <path
              d={`M${screen({ x: tick, y: -result.extent }).x},${screen({ x: tick, y: -result.extent }).y}V${screen({ x: tick, y: result.extent }).y} M${screen({ x: -result.extent, y: tick }).x},${screen({ x: -result.extent, y: tick }).y}H${screen({ x: result.extent, y: tick }).x}`}
              class="reference-grid"
            />
          {/each}
          <path d="M50,190H370 M210,30V350" class="axes" />
          {#each result.before as line, i (i)}<line
              x1={screen(line[0]).x}
              y1={screen(line[0]).y}
              x2={screen(line[1]).x}
              y2={screen(line[1]).y}
              class="before"
            />{/each}
          {#each result.after as line, i (i)}<line
              x1={screen(line[0]).x}
              y1={screen(line[0]).y}
              x2={screen(line[1]).x}
              y2={screen(line[1]).y}
              class="after"
            />{/each}
          <polygon points={polygon(result.square)} class="before shape" /><polygon
            points={polygon(result.transformedSquare)}
            class="transformed shape"
          />
          <circle
            cx={screen(result.columns[0]).x}
            cy={screen(result.columns[0]).y}
            r="5"
            class="column-one"
          /><rect
            x={screen(result.columns[1]).x - 5}
            y={screen(result.columns[1]).y - 5}
            width="10"
            height="10"
            class="column-two"
          />
          {#each unitGrid([-result.extent, result.extent], 320).values as tick (tick)}<text
              x={screen({ x: tick, y: 0 }).x}
              y="375"
              text-anchor="middle">{Number(tick.toFixed(2))}</text
            ><text x="44" y={screen({ x: 0, y: tick }).y + 4} text-anchor="end"
              >{Number(tick.toFixed(2))}</text
            >{/each}
          <text x="380" y="195">x</text><text x="215" y="22">y</text><text x="50" y="405"
            >单位参考网格=1 · x/y均无量纲</text
          >
        </svg>
      </div>
      <MatrixView
        values={a}
        rowLabels={['输出x', '输出y']}
        columnLabels={['T(e₁) · 圆点', 'T(e₂) · 方点']}
      />
      <p data-testid="result" aria-live="polite">
        原点像=({result.origin.x},{result.origin.y})；单位方形右上角像=({result.transformedSquare[2]
          .x},{result.transformedSquare[2].y})
      </p>
    </InteractivePanel>
  </PredictionLab></TheorySection
>
<TheorySection id="intuition" title="看两根基向量去哪里">
  <p>
    映射（mapping）是一条把输入变成输出的规则；向量的“像”就是应用规则后的输出。“线性”要求先把输入缩放、相加再变换，与先分别变换再按原系数组合得到同一结果。只把图画成一条直线，不足以定义线性。
  </p>
  <p>
    标准基在二维是向右和向上各一单位的两个向量。任意输入都能按它们分解。前课的矩阵乘法说明第一列是第一个单位方向的输出，第二列是第二个单位方向的输出；无需给每个点单独设计规则。
  </p>
  <FormulaBlock
    latex={String.raw`A=\begin{pmatrix}2&0\\0&1\end{pmatrix},\quad A\begin{pmatrix}3\\2\end{pmatrix}=3\begin{pmatrix}2\\0\end{pmatrix}+2\begin{pmatrix}0\\1\end{pmatrix}=\begin{pmatrix}6\\2\end{pmatrix}`}
    description="二维无量纲输入；diag(2,1)是只在主对角线上放2、1，其余元素为0的简写。"
  />
  <p>
    剪切让某个输出分量加上另一个输入分量，方格因而变成平行四边形。某方向被乘0时，整片平面也可能压成一条线；后续秩课程会正式命名这个方向数量。固定平移则会移动原点，因此通常不满足线性性。参考坐标的单位格不变，被变换的教学方格可以真实拉伸或重合。
  </p>
  <KnowledgeCheck
    prompt="迁移：规则T(x,y)=(x+1,y)看起来保持直线，能用一个2×2矩阵单独表示吗？解释原点给出的检验。"
  >
    {#snippet answer()}<p>
        不能。它把原点送到(1,0)，而任何矩阵都有A0=0；需要另加平移项，属于仿射变换。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="列向量决定整个映射"
  ><FormulaBlock
    latex={String.raw`T(\mathbf x)=A\mathbf x=x_1A\mathbf e_1+x_2A\mathbf e_2,\quad T(a\mathbf x+b\mathbf y)=aT(\mathbf x)+bT(\mathbf y)`}
    description="A为2×2实矩阵，x、y、e₁、e₂为2×1列向量，e₁=(1,0)ᵀ、e₂=(0,1)ᵀ；x₁、x₂与a、b为实标量，本课全部无量纲。右式为任意实系数的线性性。"
  />
  <p>
    直接展开矩阵乘法即可得到两列的线性组合；令输入为零便得到原点不动。加入固定偏置时得到仿射映射，通常不再满足上面的线性性。降秩矩阵也属于线性变换，只是可能把平面压缩成直线或一个点。
  </p></TheorySection
>

<TheorySection id="pitfalls" title="线性与平移的边界"
  ><CommonMistakes
    items={[
      {
        mistake: '线性变换可以把原点移到任意位置。',
        correction: 'A0恒为0；移动原点需要额外平移项，是仿射变换而非通常线性变换。',
      },
      {
        mistake: '线性变换一定保持长度与直角。',
        correction: '非均匀缩放和剪切都线性，却会改变长度或夹角；仅特殊的正交变换保持欧氏几何。',
      },
      {
        mistake: '线性变换一定可逆。',
        correction: 'diag(1,0)是线性的，但消除了y分量，多个输入产生相同输出，不能唯一恢复。',
      },
    ]}
  />
  <p>
    实际标定可能既有线性混合又有偏置。先判断需要哪个模型，再检查数据量纲、坐标约定与是否丢失独立方向。
  </p></TheorySection
>
<TheorySection id="summary" title="从基向量读变换"
  ><LessonSummary
    points={[
      '矩阵每一列是对应标准基向量的像。',
      '任意输入的像是各列按输入分量的线性组合。',
      '线性变换固定原点，通常不保持长度和角度。',
      '降维压缩仍然线性，但可能不可逆。',
    ]}
    related={['M01-011', 'M01-013', 'M01-017']}
  /></TheorySection
>

<style>
  .reference-grid {
    stroke: var(--color-base-content);
    stroke-opacity: 0.12;
    fill: none;
  }
  .parameters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }
  .frame {
    max-width: 100%;
    min-width: 0;
    overflow: auto;
    contain: inline-size;
  }
  svg {
    min-width: 360px;
    max-width: 100%;
    height: auto;
  }
  text {
    fill: var(--color-base-content);
    font-size: 14px;
  }
  .axes {
    stroke: var(--color-text-muted);
    fill: none;
  }
  .before {
    stroke: var(--color-base-content);
    stroke-dasharray: 5 4;
    opacity: 0.5;
    fill: none;
  }
  .after {
    stroke: var(--color-primary);
    opacity: 0.65;
  }
  .shape {
    stroke-width: 2;
    fill: none;
  }
  .transformed {
    stroke: var(--color-accent);
  }
  .column-one {
    fill: var(--color-primary);
  }
  .column-two {
    fill: var(--color-accent);
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
