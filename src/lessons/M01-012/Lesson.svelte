<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import type { Vector2 } from '../../lib/math/vector.ts';
  import { mapping } from '../../lib/math/coordinates.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import MatrixView from '../../components/math/MatrixView.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
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

<TheorySection id="motivation" title="矩阵改变的不只是数字"
  ><p>
    传感器标定矩阵把测量坐标映射到校准坐标，线性层把输入特征映射到新表示。{metadata.title}让我们直接观察网格与形状如何改变。此处坐标和矩阵系数均无量纲，使用二维解析模型，不代表真实设备标定精度。
  </p></TheorySection
>
<TheorySection id="intuition" title="看两根基向量去哪里"
  ><p>
    把输入拆成沿两根标准基的分量，分别变换，再按原系数合成。矩阵第一列就是第一根基的像，第二列就是第二根基的像；两列决定整张网格的变化。不退化为点的直线像保持平行或重合；降秩时直线也可能压成点。长度、直角和面积一般不保持。
  </p></TheorySection
>
<TheorySection id="mathematics" title="列向量决定整个映射"
  ><FormulaBlock
    latex={String.raw`T(\mathbf x)=A\mathbf x=x_1A\mathbf e_1+x_2A\mathbf e_2,\quad T(a\mathbf x+b\mathbf y)=aT(\mathbf x)+bT(\mathbf y)`}
    description="A为2×2实矩阵，x、y、e₁、e₂为2×1列向量，e₁=(1,0)ᵀ、e₂=(0,1)ᵀ；x₁、x₂与a、b为实标量，本课全部无量纲。右式为任意实系数的线性性。"
  />
  <p>
    直接展开矩阵乘法即可得到两列的线性组合；令输入为零便得到原点不动。加入固定偏置时得到仿射映射，通常不再满足上面的线性性。降秩矩阵也属于线性变换，只是可能把平面压缩成直线或一个点。
  </p></TheorySection
>
<TheorySection id="experiment" title="变换网格和单位正方形"
  ><InteractivePanel
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
        {#each [-1, -0.5, 0, 0.5, 1] as tick (tick)}<text
            x={screen({ x: tick * result.extent, y: 0 }).x}
            y="375"
            text-anchor="middle">{Number((tick * result.extent).toFixed(2))}</text
          ><text x="44" y={screen({ x: 0, y: tick * result.extent }).y + 4} text-anchor="end"
            >{Number((tick * result.extent).toFixed(2))}</text
          >{/each}
        <text x="380" y="195">x</text><text x="215" y="22">y</text><text x="50" y="405"
          >等比例 · x/y均无量纲</text
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
  <p>
    场景一检查横向间距放大2倍而纵向不变；场景二观察方格变成平行四边形，右上角从(1,1)变为(2,1)。场景三全部y信息被消去，网格重合为直线。修改两列，观察不同基方向如何共同决定网格，最后复位。
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
