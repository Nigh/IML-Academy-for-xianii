<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import ExperimentGuide from '../../components/lesson/ExperimentGuide.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import { experiment, formatVector, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let x = $state(3),
    y = $state(4),
    degrees = $state(0);
  const result = $derived(experiment(x, y, degrees));
  const selected = $derived(
    presets.find((p) => p.x === x && p.y === y && p.degrees === degrees)?.id ?? 'custom',
  );
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = p.x;
      y = p.y;
      degrees = p.degrees;
    }
  }
</script>

<TheorySection id="motivation" title="25°C 与向东走多远">
  <p>
    在{metadata.title}中，先问数据需要保留什么信息：温度计报告
    25°C，已经描述了一个标量（scalar）。导航记录若只说“移动
    5m”，你仍不知道终点；平面位移还需要方向。选择向东为 x 轴、向北为 y 轴后，向东 3m、向北 4m
    的位移可以用一个列向量（vector）表示。
  </p>
  <p>
    温度的单位不是方向。标量也可以有单位、可以为负；向量则用多个分量记录相对于基的关系。本课是二维欧氏平面的解析教学模型，没有采样或训练。
  </p>
</TheorySection>
<TheorySection id="intuition" title="向量与它的坐标不是同一件事">
  <p>
    把一根指向终点的箭头留在桌上，再转动桌面的坐标纸。箭头没有动，但沿新两条坐标轴的分量会改变。图中的实线
    v 是物理位移，虚线表示新 x 轴方向 e₁′，另一根实线表示新 y 轴方向
    e₂′；基的名称与数值列在图外，避免原点附近标签重叠。这两个方向的箭头长度代表 1m 的坐标刻度。
  </p>
  <p>
    向量不是两个脱离上下文的数字。分量的顺序、轴方向和单位共同定义位移表示；平移原点不改变自由位移的分量。若表示位置，才还需要指定原点。正交坐标轴旋转保留长度；任意非正交基的分量不能直接套用勾股定理。
  </p>
</TheorySection>
<TheorySection id="mathematics" title="分量来自基向量">
  <FormulaBlock
    latex={String.raw`\mathbf v=(v_1,v_2)^\mathsf T=v_1\mathbf e_1+v_2\mathbf e_2,\qquad \|\mathbf v\|_2=\sqrt{v_1^2+v_2^2}`}
    description="v 是平面位移（2×1，m）；v₁、v₂ 是实数分量（m），e₁、e₂ 是无量纲的正交单位基。长度公式只适用于本课的正交归一坐标。"
  />
  <FormulaBlock
    latex={String.raw`\mathbf e'_1=(\cos\theta,\sin\theta)^\mathsf T,\quad \mathbf e'_2=(-\sin\theta,\cos\theta)^\mathsf T,\quad \begin{pmatrix}v'_1\\v'_2\end{pmatrix}=\begin{pmatrix}\cos\theta&\sin\theta\\-\sin\theta&\cos\theta\end{pmatrix}\begin{pmatrix}v_1\\v_2\end{pmatrix}`}
    description="θ 是坐标轴逆时针转角，公式用弧度、控件显示度；新基 e′ 的形状为 2×1，无量纲。变换矩阵为 2×2、无量纲；新分量 v′ 的单位仍为 m，来自位移与每根新单位轴的内积。"
  />
  <p>
    第一行把位移沿新 x
    轴的贡献相加；第二行同理。把两份贡献乘回新基再相加，就还原原来的物理位移。正弦平方与余弦平方之和为一，交叉项抵消，因此旋转前后长度相同。
  </p>
</TheorySection>
<TheorySection id="experiment" title="移动坐标轴，保持位移">
  <InteractivePanel
    title="同一位移，两套分量"
    instructions="默认位移为 (3,4)m、转角为 0°。分量范围 −5 至 5m，转角 −180 至 180°；非法或非有限输入不会进入计算。固定分量后只改转角，观察新分量与长度。"
    meaning="坐标轴改变了表示，原坐标中的位移箭头与重构结果保持一致。温度 25°C 不需要两根方向轴。"
    limitations="只讨论同原点、正交归一基的二维旋转；不涉及平移、曲线坐标或混合单位的特征距离。图中单位为 m，方向基按 1m 刻度显示。"
    onreset={() => select('displacement')}
  >
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
      vectors={[
        { ...result.original, label: x === 0 && y === 0 ? '' : 'v', role: 'primary' },
        { ...result.basisX, label: '', role: 'secondary' },
        { ...result.basisY, label: '', role: 'accent' },
      ]}
      description="物理位移 v 与旋转后的两根正交坐标轴；横轴 x、纵轴 y，坐标单位 m，固定等比例视域 ±7m。零位移在原点，没有方向箭头。"
    />
    <div class="readout" aria-live="polite">
      <p>
        基方向图例（无量纲）：虚线 e₁′ = ({result.basisX.x.toFixed(3)}, {result.basisX.y.toFixed(
          3,
        )})；实线 e₂′ = ({result.basisY.x.toFixed(3)}, {result.basisY.y.toFixed(3)})。
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
  <ExperimentGuide
    steps={[
      '场景一：温度 25°C 是标量；位移 (3,4)m 长度为 5m，却还保留了方向。',
      '场景二：坐标轴转 90°，确认新分量 (4,−3)m，而重构仍为 (3,4)m。',
      '场景三：零位移长度为零、方向未定义。单位基只占较小范围是为了和 5m 位移保持真实比例；标签与数值在独立结果区读取。',
      '修改任一分量再调转角，观察重构与长度；最后复位，恢复全部默认参数。',
    ]}
  />
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
