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
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('diagonal'),
    angle = $state(0),
    selected = $state('x');
  const r = $derived(experiment(mode, angle));
  const fmt = (n: number) =>
    n !== 0 && Math.abs(n) < 1e-4 ? n.toExponential(3) : Number(n.toFixed(4));
  function select(id: string) {
    if (id === 'x') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      angle = p.angle;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="反复应用同一个变换，哪些输入方向最容易追踪？">
  <p>
    一张平面模板经过固定变形后，哪些方向标记还能留在原来的直线上？转动同一标记，比对变形前后的位置；允许长度改变，也允许反向。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前课已经能解释矩阵如何改变平面。这里新增特征值与特征向量；它们不要求先学逆矩阵课，本课会解释用到的二维行列式。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="旋转输入寻找特征方向">
  <p>
    寻找坐标轴特征方向，再尝试45°与90°旋转矩阵。对照正负倍率和残差，区分“没有找到”与“解析上不存在”。
  </p>
  <PredictionLab {...exploration} context={JSON.stringify(r)} {resetVersion}>
    <InteractivePanel
      title="同一输入与它的像"
      instructions="选择固定矩阵。单位输入角θ默认0°，范围−180°至180°，步长1°，可用键盘数值框；非法值保留有效角度。横轴正向为0°，逆时针为正。"
      meaning="实线是单位输入v，虚线是Av。数值给出最佳比例ρ和共线残差e；标签移至文字区防止重叠。仅在该矩阵解析条件满足时报告特征值。切换矩阵时等比例视域自适应，不能跨图按像素比较长度。"
      limitations="三个固定2×2矩阵，非通用特征分解。显示残差为浮点近似，接近零不替代精确证明；坐标轴角度采用精确零分量，避免三角函数舍入制造假箭头。"
      onreset={() => select('x')}
    >
      <PresetSelector {presets} value={selected} defaultId="x" onchange={select} />
      <ParameterSlider
        label="输入角 θ"
        unit="°"
        value={angle}
        min={-180}
        max={180}
        step={1}
        onchange={(n) => {
          angle = n;
          selected = 'custom';
        }}
      />
      <section class="object-workbench" data-testid="object-workbench" aria-label="方向标记变换台">
        <h3>转动模板的方向标记，寻找变换后仍在原直线上的方向</h3>
        <p>
          这是可操作的几何模板，不模拟刚体运动。实线是模板标记，虚线是同一标记经过 A
          后的位置；负比例会翻到另一边。
        </p>
        <div class="object-actions">
          <button
            class="btn"
            disabled={angle <= -180}
            onclick={() => {
              angle = Math.max(-180, angle - 15);
              selected = 'custom';
            }}>模板顺时针转15°</button
          >
          <button
            class="btn"
            disabled={angle >= 180}
            onclick={() => {
              angle = Math.min(180, angle + 15);
              selected = 'custom';
            }}>模板逆时针转15°</button
          >
          <button
            class="btn"
            onclick={() => {
              angle = 90;
              selected = 'custom';
            }}>模板竖直放置</button
          >
        </div>
        <svg
          viewBox="0 0 320 240"
          role="img"
          aria-label="模板输入标记与变换后的标记，以共同中心和相同比例显示"
        >
          <circle
            cx="160"
            cy="120"
            r="95"
            fill="none"
            stroke="currentColor"
            stroke-dasharray="2 5"
          />
          <line
            x1="160"
            y1="120"
            x2={160 + 30 * r.v.x}
            y2={120 - 30 * r.v.y}
            stroke="currentColor"
            stroke-width="5"
          />
          <line
            x1="160"
            y1="120"
            x2={160 + 30 * r.av.x}
            y2={120 - 30 * r.av.y}
            stroke="currentColor"
            stroke-width="3"
            stroke-dasharray="7 4"
          />
          <circle cx={160 + 30 * r.v.x} cy={120 - 30 * r.v.y} r="5" fill="currentColor" />
          <rect
            x={156 + 30 * r.av.x}
            y={116 - 30 * r.av.y}
            width="8"
            height="8"
            fill="none"
            stroke="currentColor"
          />
          <text x="12" y="225">圆点：输入 / 方框：输出 / 单位长度=30</text>
        </svg>
        <output data-testid="template-reading" aria-live="polite"
          >模板角度 {angle}°；输出 ({fmt(r.av.x)},{fmt(r.av.y)})；偏离原直线 {fmt(
            r.residual,
          )}</output
        >
      </section>
      <MatrixView values={r.matrix} />
      <VectorDiagram
        range={r.range}
        vectors={[
          { ...r.v, label: '', role: 'primary' },
          { ...r.av, label: '', role: 'secondary' },
        ]}
        description="无量纲等比例x/y坐标；实线单位输入v、虚线输出Av，重合或反向保持真实几何关系。"
      />
      <div aria-live="polite" data-testid="result">
        <p>实线v=({fmt(r.v.x)},{fmt(r.v.y)})；虚线Av=({fmt(r.av.x)},{fmt(r.av.y)})。</p>
        <p>最佳比例ρ={fmt(r.rho)}；共线残差e={r.residual.toExponential(3)}。</p>
        <p>
          {r.eigen ? `当前是特征方向，特征值λ=${r.eigenvalue}。` : '当前不是实特征方向。'}{mode ===
          'rotation'
            ? '解析结论：此90°旋转没有任何非零实特征向量。'
            : '解析结论：此矩阵的实特征方向仅为两个坐标轴。'}
        </p>
      </div>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="共线可以同向也可以反向">
  <p>
    特征向量是一根非零输入向量，变换后仍在原来的直线上；特征值是长度和正反方向的有符号倍率。它与机器学习中的“特征列”不是同一层含义。
  </p>
  <FormulaBlock
    latex={String.raw`A=\begin{pmatrix}2&0\\0&3\end{pmatrix},\quad A(1,0)^\mathsf T=2(1,0)^\mathsf T,\quad A(1,1)^\mathsf T=(2,3)^\mathsf T`}
    description="二维无量纲例子：横轴方向的特征值为2；斜向输入的输出不再与输入共线，因此该输入不是特征向量。"
  />
  <p>
    倍率为负会反向，为0会压到原点；输入必须非零，否则任意倍率乘它都得0，无法识别方向。90°旋转使所有非零箭头垂直于原方向，所以实平面中没有特征向量。这个反例只用几何就能理解。
  </p>
  <p>
    下面的单位矩阵I保持每个分量；A减去λI表示在每个对角元素上减λ。二维行列式是主对角乘积减另一条对角乘积，等于0表示两列不能独立覆盖平面。因此这里的核（kernel）就是所有零输出输入的集合。寻找非零的零输出输入时，要检查该乘积差是否为0。复数特征值和实对角化只作补充，不要求在此掌握。
  </p>
  <KnowledgeCheck
    prompt="迁移：矩阵把非零向量送到原点，这个输入能是特征向量吗？与零向量本身有何区别？"
  >
    {#snippet answer()}<p>
        能，对应λ=0。输入仍非零，方向可识别；零输入不能作为特征向量，否则任意λ都形式上满足等式。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="非零向量与实数条件">
  <FormulaBlock
    latex={String.raw`Av=\lambda v,\quad A\in\mathbb R^{n\times n},\ v\in\mathbb R^n\setminus\{0\},\ \lambda\in\mathbb R`}
    description="A为实方阵，v为非零实列向量，λ为实比例，本课n=2，全部无量纲。此处只讨论实特征对；复数域中结论不同。特征向量可乘任意非零实数，仍属于同一特征方向。"
  />
  <FormulaBlock
    latex={String.raw`(A-\lambda I)v=0\quad\Longrightarrow\quad\det(A-\lambda I)=0`}
    description="I为n维单位矩阵，det为行列式。非零v落在A−λI的核中，因而矩阵奇异。反之，奇异时核非平凡，可找出非零特征向量。不能把零向量作为特征向量，否则任何λ都会形式上成立。"
  />
  <FormulaBlock
    latex={String.raw`R=\begin{bmatrix}0&-1\\1&0\end{bmatrix},\quad\det(R-\lambda I)=\lambda^2+1>0\quad(\lambda\in\mathbb R)`}
    description="R为90°逆时针旋转，故没有实特征值及非零实特征向量；若继续学习复数特征值，先掌握虚数单位i满足i²=−1以及复数乘法；本课不要求求复数方向。diag(2,3)的特征多项式为(2−λ)(3−λ)，两根为2、3。"
  />
  <FormulaBlock
    latex={String.raw`\rho=\frac{v^\top Av}{v^\top v},\quad e=\|Av-\rho v\|_2`}
    description="ρ为给定非零v时最接近Av的实数倍系数（Rayleigh quotient），e是偏离共线的残差。e为0才构成实特征对；普通向量的ρ不能直接称为特征值。网页用单位v，三角函数与e为浮点计算，判定同时依据固定矩阵的解析结构。"
  />
  <p>
    有n个线性无关实特征向量时才可组成实特征向量基并作实对角化。实对称矩阵保证存在正交实特征向量基；一般实矩阵不保证，甚至有实特征值也可能缺少足够独立特征向量。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="实矩阵不保证实特征向量基"
  ><CommonMistakes
    items={[
      {
        mistake: '每个实矩阵都有实数特征向量基。',
        correction: '90°旋转没有实特征向量；一般矩阵即使有实特征值，也可能缺乏足够独立向量。',
      },
      {
        mistake: '特征值总是正数，或总等于输出长度。',
        correction: '负值代表反向，零值代表消去。只有单位输入时输出长度才等于特征值的绝对值。',
      },
      {
        mistake: '最佳比例ρ可以对任意输入直接当作特征值。',
        correction: '例如diag(2,3)对45°输入的ρ=2.5，但它不是特征值，残差非零。',
      },
    ]}
  />
  <p>
    用特征值分析迭代稳定性还依赖更新模型、时间定义及矩阵性质。这里仅识别方向与比例，不把一次变换的图形外推为训练收敛结论。
  </p></TheorySection
>
<TheorySection id="summary" title="用不变方向理解变换"
  ><LessonSummary
    points={[
      '非零向量满足Av=λv时才是特征向量。',
      'λ可正、负或零，保持的是一条方向直线。',
      '实矩阵不保证实特征向量基，90°旋转给出反例。',
      '候选比例和数值残差需要结合模型条件解释。',
    ]}
    related={['M01-012', 'M01-014', 'M01-018']}
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
  .object-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 0.75rem;
  }
  .object-actions button {
    min-height: 44px;
    white-space: normal;
  }
  .object-workbench svg {
    display: block;
    width: 100%;
    max-width: 28rem;
    margin-inline: auto;
    color: var(--color-base-content);
  }
  .object-workbench svg text {
    fill: currentColor;
    font-size: 16px;
  }
  .object-workbench output {
    display: block;
    font-variant-numeric: tabular-nums;
  }

  p {
    overflow-wrap: anywhere;
  }
</style>
