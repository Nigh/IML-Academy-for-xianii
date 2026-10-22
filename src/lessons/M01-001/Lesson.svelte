<script lang="ts">
  import PredictionLab from '../../components/lesson/PredictionLab.svelte';
  import { exploration } from './exploration.ts';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import { experiment, formatVector, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let x = $state(3),
    y = $state(4),
    degrees = $state(0);
  const result = $derived(experiment(x, y, degrees));
  const selected = $derived(
    presets.find((p) => p.x === x && p.y === y && p.degrees === degrees)?.id ?? 'custom',
  );
  function select(id: string) {
    if (id === 'displacement') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = p.x;
      y = p.y;
      degrees = p.degrees;
    }
  }
</script>

<TheorySection id="motivation" title="配送车没有移动，导航仪读数为什么变了？">
  <p>
    配送车要从站点到达东面3m、北面4m的地址。先在地图上移动终点，再只转动导航仪的参考方向：车的位置、距离和两个方向的读数，哪些会变？
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    课程从高中平面坐标、实数、勾股定理和正弦余弦开始。不需要先会矩阵乘法或内积；本课先教会读向量，再理解同一位移为什么有不同坐标。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="先设置配送终点，再转动导航仪">
  <p>
    用方向按钮改变配送终点，观察位移与距离；随后只转动导航仪，对照地图与本地读数。最后让车回到起点，检查没有位移时还能否定义方向。
  </p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="同一位移，两套分量"
      instructions="默认位移为 (3,4)m、转角为 0°。分量范围 −5 至 5m，转角 −180 至 180°；非法或非有限输入不会进入计算。固定分量后只改转角，观察新分量与长度。"
      meaning="坐标轴改变了表示，原坐标中的位移箭头与重构结果保持一致。温度 25°C 不需要两根方向轴。"
      limitations="只讨论同原点、正交归一基的二维旋转；不涉及平移、曲线坐标或混合单位的特征距离。图中单位为 m，方向基按 1m 刻度显示。"
      onreset={() => select('displacement')}
    >
      <section
        class="object-workbench"
        data-testid="object-workbench"
        aria-label="送货地图与导航仪"
      >
        <h3>给配送车设置终点，再转动导航仪</h3>
        <p>终点按地图的东西、南北方向移动。导航仪只改变读数的参考方向，不会把配送车搬走。</p>
        <svg
          viewBox="0 0 360 320"
          role="img"
          aria-label={`配送车位于东向${x}米、北向${y}米；导航仪转过${degrees}度`}
        >
          <rect class="floor" x="20" y="20" width="320" height="280" rx="12" />

          <path class="reference" d="M 180 70 V 290 M 30 180 H 330" />
          <path class="route" d={`M 180 180 H ${180 + x * 24} V ${180 - y * 24}`} />
          <circle class="object" cx={180 + x * 24} cy={180 - y * 24} r="12" />

          <circle cx="180" cy="180" r="4" fill="currentColor" />
          <g transform={`translate(180 180) rotate(${-degrees})`}>
            <path class="route" d="M 0 0 H 40 L 32 -5 M 40 0 L 32 5" />
          </g>
        </svg>
        <p>
          地图固定，北向上、东向右。圆形为配送终点，中心圆点为起点；短箭头指导航仪的横轴正方向。
        </p>
        <div class="actions">
          <button class="btn btn-outline" disabled={x > 4} onclick={() => (x += 1)}
            >终点向东 1m</button
          >
          <button class="btn btn-outline" disabled={x < -4} onclick={() => (x -= 1)}
            >终点向西 1m</button
          >
          <button class="btn btn-outline" disabled={y > 4} onclick={() => (y += 1)}
            >终点向北 1m</button
          >
          <button class="btn btn-outline" disabled={y < -4} onclick={() => (y -= 1)}
            >终点向南 1m</button
          >
          <button class="btn btn-outline" onclick={() => (degrees = degrees === 90 ? 0 : 90)}
            >导航仪转向 / 回正</button
          >
        </div>
        <output data-testid="object-result"
          >地图终点 ({x},{y}) m；导航仪读数 {formatVector(result.components)}；直线距离 {result.length.toFixed(
            3,
          )} m</output
        >
        <p>圆形车标是终点位置，不表示车身朝向。下方数学图中的箭头就是从起点到这辆车的位移。</p>
      </section>
      <PresetSelector {presets} value={selected} defaultId="displacement" onchange={select} />
      <div class="parameters">
        <ParameterSlider
          label="原坐标 x 分量"
          value={x}
          min={-5}
          max={5}
          step={0.1}
          unit="m"
          onchange={(v) => (x = v)}
        />
        <ParameterSlider
          label="原坐标 y 分量"
          value={y}
          min={-5}
          max={5}
          step={0.1}
          unit="m"
          onchange={(v) => (y = v)}
        />
        <ParameterSlider
          label="坐标轴逆时针转角"
          value={degrees}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onchange={(v) => (degrees = v)}
        />
      </div>
      <VectorDiagram
        range={7}
        axisRotation={degrees}
        vectors={[{ ...result.original, label: x === 0 && y === 0 ? '' : 'v', role: 'primary' }]}
        description="物理位移v固定；完整网格、刻度与坐标轴按转角旋转，正方向标为x′和y′，每单位为1m。零位移没有方向箭头。"
      />
      <div class="readout" aria-live="polite">
        <p>
          新坐标轴的单位方向（无量纲）：e₁′ = ({result.basisX.x.toFixed(3)}, {result.basisX.y.toFixed(
            3,
          )})；e₂′ = ({result.basisY.x.toFixed(3)}, {result.basisY.y.toFixed(3)})。
        </p>
        <p>标量对照：温度 25°C；原分量：{formatVector(result.original)}</p>
        <p data-testid="components">新坐标分量：{formatVector(result.components)}</p>
        <p>重构位移：{formatVector(result.reconstructed)}；长度：{result.length.toFixed(3)} m</p>
        <p>
          原坐标方向：{result.direction === null
            ? '未定义（零向量）'
            : `${result.direction.toFixed(2)}°`}
        </p>
      </div>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="向量与它的坐标不是同一件事">
  <p>
    先把向量读成一段位移：从原点出发，向右走3m，再向上走4m。终点的位置需要两个数；只说走了5m，无法区分向东北还是向西北。标量（scalar）只需一个数值和单位，例如温度25°C；向量（vector）还要保留各方向的贡献。
  </p>
  <p>
    分量是沿某根坐标轴计量的有符号数：正数沿正方向，负数沿反方向。横纵分量按顺序写成一列，就是列向量。“2×1”只表示2行、1列；上标T表示把横排改成竖排，不是幂次。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf v=\begin{pmatrix}3\\4\end{pmatrix}\mathrm{m},\qquad \|\mathbf v\|_2=\sqrt{3^2+4^2}\mathrm{m}=5\mathrm{m}`}
    description="二维位移的两个分量单位均为m；双竖线和下标2在本课表示勾股定理算出的长度。"
  />
  <p>
    现在固定这根箭头，只把坐标纸逆时针转90°。新横轴指向原来的上方，所以新横分量为4m；新纵轴指向原来的左方，而位移向右3m，所以新纵分量为−3m。长度仍是5m。图中旋转的是完整坐标系，箭头不转。
  </p>
  <p>
    基向量是给坐标轴选定的单位方向，例如向右和向上各一份。向量可由“横分量乘横方向，再加纵分量乘纵方向”重建。本课仅用互相垂直、同尺度的坐标轴；任意斜坐标不在这里讨论。
  </p>
  <KnowledgeCheck
    prompt="迁移：地图改成向南为x正向、向东为y正向。同一位移如何记录？为什么长度不变？"
  >
    {#snippet answer()}<p>
        新分量为(−4,3)m。两根轴仍互相垂直且每单位1m，平方和仍为25m²；记录改变，位移未改变。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="分量来自基向量">
  <FormulaBlock
    latex={String.raw`\mathbf v=(v_1,v_2)^\mathsf T=v_1\mathbf e_1+v_2\mathbf e_2,\qquad \|\mathbf v\|_2=\sqrt{v_1^2+v_2^2}`}
    description="v 是平面位移（2×1，m）；v₁、v₂ 是实数分量（m），e₁、e₂ 是无量纲的正交单位基。长度公式只适用于本课的正交归一坐标。"
  />
  <details>
    <summary>补充：把一般角度的分量关系写成矩阵</summary>
    <p>
      括号中的方阵按行记录两条分量计算式：每行先把对应数相乘，再相加，分别得到新横、纵分量。矩阵乘法在M01-011系统学习；不影响先理解90°几何例子。
    </p>
    <FormulaBlock
      latex={String.raw`\mathbf e'_1=(\cos\theta,\sin\theta)^\mathsf T,\quad \mathbf e'_2=(-\sin\theta,\cos\theta)^\mathsf T,\quad \begin{pmatrix}v'_1\\v'_2\end{pmatrix}=\begin{pmatrix}\cos\theta&\sin\theta\\-\sin\theta&\cos\theta\end{pmatrix}\begin{pmatrix}v_1\\v_2\end{pmatrix}`}
      description="θ 是坐标轴逆时针转角，公式用弧度、控件显示度；新基 e′ 的形状为 2×1，无量纲。变换矩阵为 2×2、无量纲；新分量 v′ 的单位仍为 m，可由各方向的正弦、余弦分量相加得到，无需先学内积。"
    />
    <p>
      第一行把位移沿新 x
      轴的贡献相加；第二行同理。把两份贡献乘回新基再相加，就还原原来的物理位移。正弦平方与余弦平方之和为一，交叉项抵消，因此旋转前后长度相同。
    </p>
  </details>
</TheorySection>

<TheorySection id="pitfalls" title="表示的边界">
  <CommonMistakes
    items={[
      {
        mistake: '向量分量是脱离坐标系的绝对量。',
        correction:
          '同一位移在转过 90° 的基中由 (3,4)m 变为 (4,−3)m。比较两个传感器输出前必须先统一坐标约定。',
      },
      {
        mistake: '标量没有单位，或者向量的长度就能代替向量。',
        correction: '25°C 有单位但没有方向；长度同为 5m 的 (3,4)m 与 (−3,4)m 有不同终点。',
      },
      {
        mistake: '零向量指向 x 轴，所有数字数组都是空间方向。',
        correction:
          '零向量方向未定义；ML 特征也可用向量表示，但温度与速度等混合单位的分量不是一根物理箭头，需先定义尺度与度量。',
      },
    ]}
  />
</TheorySection>
<TheorySection id="engineering" title="从位置记录到 ML 特征">
  <p>
    机器人中，机身坐标与地图坐标可能采用不同朝向。把两份位移直接逐分量比较，会把坐标差异误判为运动差异。先记录基与单位，再做坐标变换，才有可比较的输入。
  </p>
  <p>
    ML
    中一行样本也常用向量表示，每个分量对应一个特征。这里的“方向”属于所定义的特征空间，不自动等同于物理方向；列顺序改变时必须同步调整模型的输入约定。后续的张量课程会进一步描述批次和通道轴。
  </p>
</TheorySection>
<TheorySection id="summary" title="带走四个结论">
  <LessonSummary
    points={[
      '标量由一个数与单位描述；物理位移还要表达方向。',
      '向量分量依赖基、顺序与单位，坐标变换不必改变物理量。',
      '正交坐标旋转保留长度；零向量方向未定义。',
      'ML 特征向量需要明确各维含义，混合单位不能自动解释为空间距离。',
    ]}
    related={['M01-002', 'M01-003', 'M01-007']}
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
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .readout {
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }
</style>
