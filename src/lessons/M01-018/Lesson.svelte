<script lang="ts">
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import MatrixView from '../../components/math/MatrixView.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { mapping, unitGrid } from '../../lib/math/coordinates.ts';
  import { experiment, presets, type Point } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let s1 = $state(3),
    s2 = $state(1),
    u = $state(0),
    v = $state(0),
    reflect = $state(false),
    stage = $state(3),
    selected = $state('diagonal');
  const r = $derived(experiment(s1, s2, u, v, reflect));
  const map = $derived(mapping([-r.extent, r.extent], [-r.extent, r.extent], 320, 320, true));
  const pt = (p: Point) => {
    const q = map.toScreen(p);
    return `${q.x + 40},${q.y + 40}`;
  };
  const fmt = (n: number) => Number(n.toPrecision(5));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      s1 = p.s1;
      s2 = p.s2;
      u = p.u;
      v = p.v;
      reflect = p.reflect;
      stage = 3;
      selected = id;
    }
  }
</script>

<TheorySection id="learning-path" title="接上已有知识">
  <p>
    已有特征方向、矩阵乘法和正交分解。本课把任意实矩阵的作用拆为三个步骤；转置、正交矩阵和奇异值在下面逐一解释。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>
<TheorySection id="motivation" title="找出变换最强与最弱的方向"
  ><p>
    标定系统对不同输入方向的响应可能差很多：有的被放大，有的几乎被消去。{metadata.title}用一组正交方向和非负伸缩量描述这种差异，为伪逆、秩和压缩提供统一工具。本课从已知因子构造二维矩阵并计算真实映射，不假装执行通用SVD求解器。
  </p></TheorySection
>
<TheorySection id="intuition" title="换轴、拉伸、再换轴">
  <p>
    分解是把一个复杂变换写成几个简单变换的连续作用。SVD读作奇异值分解：先换输入坐标轴，再沿轴伸缩，最后换到输出方向。矩阵乘法从右向左作用，因而这三步写成UΣVᵀ。
  </p>
  <p>
    转置T交换矩阵的行和列。若一个方阵的列向量互相垂直且长度全为1，它叫正交矩阵；这种矩阵只改变方向约定，保持长度，转置恰好可以撤销它。反射也满足这些条件，因此换轴不一定只包含旋转。
  </p>
  <FormulaBlock
    latex={String.raw`\Sigma=\begin{pmatrix}3&0\\0&1\end{pmatrix},\quad \Sigma(1,0)^\mathsf T=(3,0)^\mathsf T,\quad\Sigma(0,1)^\mathsf T=(0,1)^\mathsf T`}
    description="二维无量纲例子。非负伸缩倍数3和1称奇异值；单位圆变成半轴长3和1的椭圆。Σ是大写希腊字母Sigma，此处是矩阵名，不是求和符号。"
  />
  <p>
    V的列给出输入的单位主方向，U的列给出对应输出方向；奇异值表示这对方向间的长度倍率。输入方向不必与输出方向相同，所以奇异值不是一般矩阵的特征值。倍率为0时对应方向被消去，数非零奇异值就得到精确秩。
  </p>
  <p>
    对称矩阵是转置后不变的方阵；半正定表示任何输入与其输出的点积都非负。AᵀA满足这两个性质，因为该点积等于Ax的长度平方。这说明下面公式里的特征值可开平方得到非负奇异值；不需要在这里实现通用分解求解器。
  </p>
  <KnowledgeCheck prompt="出现反射时，必须让某个奇异值为负吗？"
    >{#snippet answer()}<p>
        不需要。反射包含在正交因子中，奇异值只记录非负长度伸缩。
      </p>{/snippet}</KnowledgeCheck
  >
</TheorySection>
<TheorySection id="mathematics" title="正交因子与非负奇异值">
  <FormulaBlock
    latex={String.raw`A=U\Sigma V^\mathsf T,\quad U^\mathsf TU=I_m,\quad V^\mathsf TV=I_n,\quad \sigma_1\ge\cdots\ge\sigma_p\ge0`}
    description="A为m×n实矩阵；完整SVD的U为m×m、V为n×n正交矩阵；Σ为m×n矩形对角矩阵，p=min(m,n)个非负奇异值，其余元素0。I为相应维度单位矩阵，ᵀ表示转置。所有量无量纲；任意有限实矩阵存在这种分解。本课m=n=2。"
  />
  <FormulaBlock
    latex={String.raw`Av_i=\sigma_i u_i,\qquad A^\mathsf TA v_i=\sigma_i^2 v_i,\qquad \operatorname{rank}A=\#\{i:\sigma_i>0\}`}
    description="v_i和u_i分别为V和U第i列的单位正交向量，σ_i为对应伸缩。AᵀA为对称半正定矩阵，因此特征值非负，其平方根是奇异值；精确秩数非零奇异值，数值秩还需声明容差。"
  />
  <p>
    因为Vᵀv_i=e_i，Σ把第i轴乘σ_i，再由U映为σ_i
    u_i，得到第一式。对diag(3,1)，U=V=I即可；90°旋转的AᵀA=I，奇异值为1、1，却没有实特征值。奇异值描述长度伸缩，不能与一般矩阵的特征值等同。
  </p>
</TheorySection>
<TheorySection id="experiment" title="逐步观察单位圆的像">
  <p>
    先预测再操作：出现反射时，必须让某个奇异值为负吗？先说明你的理由，再用下面的预设和参数验证；比较图形与数值，最后复位重做一次。
  </p>
  <InteractivePanel
    title="同一分解的四个阶段"
    instructions="σ₁默认3，范围0–4；σ₂默认1，范围0–σ₁。降低σ₁会同步收紧σ₂。U/V角默认0°，范围±180°。均可键盘编辑，非法值不参与计算；复选框让U含反射。阶段选择不改变A。"
    meaning="等比例图中虚线是原单位圆，实线是当前阶段的像；圆点为45°输入探针在该阶段的位置，四阶段坐标列于下方。圆周72个等间隔线段仅用于绘图，不是随机样本。零宽度保持真实退化。"
    limitations="从合法SVD因子构造A，不从任意输入矩阵反求分解。图形是有限分段近似，矩阵与探针直接解析计算。所有阶段使用同一视域，较小圆可能显得小，便于比较伸缩；改变σ₁会调整整张图尺度。"
    onreset={() => select('diagonal')}
  >
    <PresetSelector {presets} value={selected} defaultId="diagonal" onchange={select} />
    <ParameterSlider
      label="第一奇异值 σ₁"
      value={s1}
      min={0}
      max={4}
      step={0.25}
      onchange={(n) => {
        s1 = n;
        s2 = Math.min(s2, n);
        selected = 'custom';
      }}
    />
    <ParameterSlider
      label="第二奇异值 σ₂"
      value={s2}
      min={0}
      max={s1}
      step={0.25}
      onchange={(n) => {
        s2 = n;
        selected = 'custom';
      }}
    />
    <ParameterSlider
      label="U旋转角"
      unit="°"
      value={u}
      min={-180}
      max={180}
      step={5}
      onchange={(n) => {
        u = n;
        selected = 'custom';
      }}
    />
    <ParameterSlider
      label="V旋转角"
      unit="°"
      value={v}
      min={-180}
      max={180}
      step={5}
      onchange={(n) => {
        v = n;
        selected = 'custom';
      }}
    />
    <label
      ><input
        type="checkbox"
        checked={reflect}
        onchange={(e) => {
          reflect = e.currentTarget.checked;
          selected = 'custom';
        }}
      /> U包含反射</label
    >
    <label class="stage"
      >观察阶段<select class="select" bind:value={stage}
        ><option value={0}>0：输入单位圆</option><option value={1}>1：Vᵀ换轴</option><option
          value={2}>2：Σ拉伸</option
        ><option value={3}>3：U换轴得到输出</option></select
      ></label
    >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables local chart scrolling.) -->
    <div class="chart" tabindex="0" role="region" aria-label="SVD图，可横向滚动">
      <svg viewBox="0 0 400 435" role="img" aria-label="单位圆的逐阶段映射，等比例无量纲坐标">
        {#each unitGrid([-r.extent, r.extent], 320).values as tick (tick)}
          {@const q = map.toScreen({ x: tick, y: tick })}
          <path d={`M${q.x + 40},40V360 M40,${q.y + 40}H360`} class="reference-grid" />
          {#if tick !== 0}<text x={q.x + 40} y="380" text-anchor="middle">{tick}</text>{/if}
        {/each}
        <line x1="40" y1="200" x2="360" y2="200" class="axis" /><line
          x1="200"
          y1="40"
          x2="200"
          y2="360"
          class="axis"
        />
        <polyline points={r.circle.map(pt).join(' ')} class="original" /><polyline
          points={r.curves[stage].map(pt).join(' ')}
          class="transformed"
        />
        <circle
          cx={map.toScreen(r.probe[stage]).x + 40}
          cy={map.toScreen(r.probe[stage]).y + 40}
          r="5"
          class="probe"
        />
        <text x="365" y="195">x</text><text x="208" y="30">y</text><text x="208" y="220">0</text>
        <text x="40" y="420">单位网格=1 · 两轴范围±{fmt(r.extent)}，无量纲</text>
      </svg>
    </div>
    <p>
      虚线：原单位圆；实线：当前阶段；圆点：45°探针。{s2 === 0
        ? '第二方向精确消去；σ₁也为0时输出只剩原点。'
        : ''}
    </p>
    <div aria-live="polite" data-testid="result">
      <p>奇异值=({s1},{s2})；精确秩={r.rank}；阶段={stage}。</p>
      <p>A=UΣVᵀ：</p>
      <MatrixView values={r.matrix.map((row) => row.map(fmt))} />
      <p>探针逐步坐标：</p>
      <MatrixView
        values={r.probe.map((p) => [fmt(p.x), fmt(p.y)])}
        rowLabels={['输入', 'Vᵀ后', 'Σ后', 'U后']}
        columnLabels={['x', 'y']}
      />
    </div>
    <details>
      <summary>查看三个分解因子的数值</summary>
      <p>U：</p>
      <MatrixView values={r.U.map((row) => row.map(fmt))} />
      <p>Σ：</p>
      <MatrixView values={r.sigma} />
      <p>Vᵀ：</p>
      <MatrixView values={r.Vt.map((row) => row.map(fmt))} />
    </details>
  </InteractivePanel>
  <p>
    场景一切换四阶段，确认最终椭圆半轴3与1。场景二检查第二奇异值为0，改变U角只旋转退化线段。场景三比较纯旋转前后圆的大小与探针位置。场景四观察反射探针，奇异值仍非负。复位恢复diag(3,1)。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="奇异值不是带符号的特征值"
  ><CommonMistakes
    items={[
      {
        mistake: '奇异值可以为负或必须等于特征值。',
        correction: '奇异值非负；diag(−3,1)奇异值3、1，90°旋转奇异值1、1而特征值为±i。',
      },
      {
        mistake: 'SVD仅包含两个普通旋转。',
        correction: '一般实矩阵的正交因子也可能包含反射；负行列式不能仅靠两个旋转与非负伸缩产生。',
      },
      {
        mistake: 'SVD方向总唯一。',
        correction:
          '奇异值重复时可在对应子空间换正交基；符号也有成对自由度，不能把因子不同直接当分解错误。',
      },
    ]}
  />
  <p>
    零与极小非零奇异值必须区分。数值求伪逆和低秩近似时，需要根据噪声、尺度和目的选择阈值，本课不会自动把小量裁为零。
  </p></TheorySection
>
<TheorySection id="summary" title="统一描述线性映射的伸缩"
  ><LessonSummary
    points={[
      'SVD把实矩阵写成正交换轴、非负伸缩、正交换轴。',
      '奇异值是AᵀA特征值的非负平方根，不是一般特征值。',
      '非零奇异值数量给出精确秩，零值对应消去的方向。',
      '反射、退化和因子不唯一都需要明确解释。',
    ]}
    related={['M01-010', 'M01-013', 'M01-016', 'M01-017', 'M01-019']}
  /></TheorySection
>

<style>
  .reference-grid {
    stroke: var(--color-base-content);
    stroke-opacity: 0.12;
    fill: none;
  }
  p {
    overflow-wrap: anywhere;
  }
  .stage {
    display: grid;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  .chart {
    overflow-x: auto;
  }
  svg {
    display: block;
    min-width: 360px;
    max-width: 520px;
    width: 100%;
    margin: auto;
  }
  text {
    fill: var(--color-base-content);
    font-size: 14px;
  }
  .axis {
    stroke: var(--color-base-content);
    opacity: 0.4;
  }
  .original,
  .transformed {
    fill: none;
    stroke-width: 2;
  }
  .original {
    stroke: var(--color-secondary);
    stroke-dasharray: 5 4;
  }
  .transformed {
    stroke: var(--color-primary);
  }
  .probe {
    fill: var(--color-base-content);
  }
</style>
