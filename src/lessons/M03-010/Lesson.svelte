<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import NumericInput from '../../components/interactive/NumericInput.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import SimulationControls from '../../components/interactive/SimulationControls.svelte';
  import StepByStep from '../../components/interactive/StepByStep.svelte';
  import Plot2D from '../../components/charts/Plot2D.svelte';
  import ContourPlot from '../../components/charts/ContourPlot.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, curve, contours, presets, statusText, type Mode } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let mode = $state<Mode>('quadratic'),
    x = $state(-2),
    y = $state(2),
    eta = $state(0.1),
    maxSteps = $state(60),
    a = $state(1),
    b = $state(10),
    index = $state(0),
    speed = $state(2),
    stage = $state(0),
    preset = $state('custom'),
    revision = $state(0);
  const run = $derived(experiment(mode, x, y, eta, maxSteps, a, b));
  const shown = $derived(Math.min(index, run.history.length - 1));
  const current = $derived(run.history[shown]);
  const finished = $derived(shown >= run.history.length - 1);
  const history = $derived(run.history.slice(0, shown + 1));
  const fcurve = $derived(curve(mode));
  const fmt = (n: number) => Number(n.toPrecision(6));
  function rewind() {
    revision += 1;
    index = 0;
    stage = 0;
  }
  function reset() {
    mode = 'quadratic';
    x = -2;
    y = 2;
    eta = 0.1;
    maxSteps = 60;
    a = 1;
    b = 10;
    speed = 2;
    preset = 'custom';
    rewind();
  }
  function select(id: string) {
    mode = 'quadratic';
    eta = presets.find((p) => p.id === id)!.eta;
    x = -2;
    preset = id;
    rewind();
  }
  const stages = $derived([
    {
      title: '计算梯度',
      explanation: '在当前参数处计算函数变化最快的方向。',
      latex:
        mode === 'two'
          ? String.raw`\nabla f=(2ax,2by)^\mathsf T`
          : mode === 'nonconvex'
            ? String.raw`f'(x)=4x(x^2-1)`
            : mode === 'origin'
              ? String.raw`f'(x)=2x`
              : String.raw`f'(x)=2(x-2)`,
      snapshot: `当前梯度 (${current.gradient.map(fmt).join(', ')})`,
    },
    {
      title: '沿负梯度更新',
      explanation: '学习率决定移动距离；负梯度只保证足够小步长下的局部下降。',
      latex: String.raw`\mathbf x_{t+1}=\mathbf x_t-\eta\nabla f(\mathbf x_t)`,
      snapshot: `当前 η=${eta}，候选下一参数 (${current.x.map((v, i) => fmt(v - eta * current.gradient[i])).join(', ')})`,
    },
    {
      title: '检查损失与终止条件',
      explanation:
        '比较前后损失，检查梯度范数、迭代预算、两点周期和数值幅度。使用单步执行实际更新。',
      snapshot: `当前损失 ${fmt(current.loss)}；${finished ? statusText[run.status] : '尚未到预计算轨迹末端'}`,
    },
  ]);
</script>

<TheorySection id="motivation" title="怎样逐步改善模型参数？"
  ><p>
    拟合模型时，我们通常无法枚举所有参数。{metadata.title}用当前损失的局部斜率建议下一步方向。这里先在可验证的合成目标上检验更新规则，再讨论真实训练中的限制；所有轨迹都是实际数值迭代，不是训练结果。
  </p></TheorySection
>
<TheorySection id="intuition" title="方向来自梯度，距离来自学习率"
  ><p>
    梯度指向局部上升最快的方向，取反给出下降方向。但跨得太远可能越过谷底，甚至让损失更高。沿陡峭方向走相同步长，也比平缓方向更容易振荡。先预测下一步在谷底哪侧，再点击单步。
  </p></TheorySection
>
<TheorySection id="mathematics" title="从二次函数推导稳定区间">
  <FormulaBlock
    latex={String.raw`f(x)=(x-2)^2+1,\quad f'(x)=2(x-2),\quad x_{t+1}=x_t-\eta f'(x_t)`}
    description="x、f、梯度和 η 在教学模型中均无量纲；t 是非负整数迭代步，η>0 为固定学习率。默认初值 x₀=−2。"
  />
  <FormulaBlock
    latex={String.raw`e_t=x_t-2,\quad e_{t+1}=(1-2\eta)e_t,\quad e_t=(1-2\eta)^te_0`}
    description="非最优初值下，0<η<1 收敛；η=1 等幅两点振荡；η>1 误差幅度增长。η=0.5 一步到达最小点；0.5<η<1 交替跨谷但幅度递减。初值已经最优则保持不变。"
  />
  <FormulaBlock
    latex={String.raw`f(x,y)=ax^2+by^2,\quad\nabla f=(2ax,2by)^\mathsf T,\quad\kappa=\frac{\max(a,b)}{\min(a,b)}`}
    description="(x,y) 是二维参数列向量；a,b>0 为曲率系数，均无量纲。Hessian 为 diag(2a,2b)，稳定范围为 0<η<1/max(a,b)。条件数 κ 较大时不同方向收敛速度差异明显。"
  />
  <FormulaBlock
    latex={String.raw`g(x)=(x^2-1)^2,\quad g'(x)=4x(x^2-1),\quad g''(x)=12x^2-4`}
    description="非凸示例：x=±1 是全局极小点，也都是局部极小点；x=0 是驻点和局部极大点。这个一维模型没有鞍点。梯度接近零只能报告驻点，不能自动证明极小值。"
  />
</TheorySection>
<TheorySection id="experiment" title="逐步执行并检查每一次更新">
  <InteractivePanel
    title="学习率、曲率与初值"
    instructions="从一维预设比较收敛、振荡与发散。切到二维后将 η 设为 0.05，再比较 b=1 与 b=10；切到非凸后比较初值 −0.5、0、0.5。修改模型参数会回到第 0 步。"
    meaning="数学模型先生成有界确定性轨迹，播放时钟只推进显示索引；重置恢复同一初值。"
    limitations="最多 1000 步，梯度范数阈值 10⁻⁸；参数范数超过 10⁶ 或损失幅度超过 10¹² 停止。达到步数预算不代表收敛。"
    computationKind="simulation"
    onreset={reset}
  >
    <PresetSelector {presets} value={preset} defaultId="slow" onchange={select} />
    <label class="field"
      >目标函数<select
        class="select"
        bind:value={mode}
        onchange={() => {
          eta = 0.05;
          preset = 'custom';
          rewind();
        }}
        ><option value="quadratic">一维：(x−2)²+1</option><option value="origin"
          >任务卡验证：x²</option
        ><option value="two">二维：ax²+by²</option><option value="nonconvex">非凸：(x²−1)²</option
        ></select
      ></label
    >
    <ParameterSlider
      label="初始 x"
      value={x}
      min={-4}
      max={4}
      step={0.1}
      onchange={(v) => {
        x = v;
        rewind();
      }}
    />
    {#if mode === 'two'}<ParameterSlider
        label="初始 y"
        value={y}
        min={-4}
        max={4}
        step={0.1}
        onchange={(v) => {
          y = v;
          rewind();
        }}
      /><ParameterSlider
        label="曲率 a"
        value={a}
        min={1}
        max={20}
        onchange={(v) => {
          a = v;
          rewind();
        }}
      /><ParameterSlider
        label="曲率 b"
        value={b}
        min={1}
        max={20}
        onchange={(v) => {
          b = v;
          rewind();
        }}
      />
      <p>
        条件数 κ = {fmt(Math.max(a, b) / Math.min(a, b))}；稳定学习率应小于 {fmt(
          1 / Math.max(a, b),
        )}。
      </p>{/if}
    <ParameterSlider
      label="学习率 η"
      value={eta}
      min={0.001}
      max={1.2}
      step={0.001}
      onchange={(v) => {
        eta = v;
        preset = 'custom';
        rewind();
      }}
    />
    <NumericInput
      label="最大迭代步数"
      value={maxSteps}
      min={1}
      max={1000}
      integer
      onchange={(v) => {
        maxSteps = v;
        rewind();
      }}
    />
    {#key `${revision}-${mode}-${x}-${y}-${eta}-${a}-${b}-${maxSteps}`}<SimulationControls
        index={shown}
        {maxSteps}
        {finished}
        {speed}
        onstep={() => (index = Math.min(shown + 1, run.history.length - 1))}
        onreset={rewind}
        onspeedchange={(v) => (speed = v)}
      />{/key}
    <div class="experiment-result" aria-live="polite">
      <strong data-testid="optimization-state"
        >第 {shown} 步：参数 ({current.x.map(fmt).join(', ')}) · 损失 {fmt(current.loss)}</strong
      ><span
        >梯度 ({current.gradient.map(fmt).join(', ')}) · {finished
          ? statusText[run.status]
          : '迭代中'}</span
      >
    </div>
    {#if mode === 'two'}<ContourPlot
        contours={contours(a, b)}
        path={history.map((p) => ({ x: p.x[0], y: p.x[1] }))}
        current={{ x: current.x[0], y: current.x[1] }}
        gradient={{
          x: current.gradient[0] / Math.max(1, Math.hypot(...current.gradient)),
          y: current.gradient[1] / Math.max(1, Math.hypot(...current.gradient)),
        }}
        xRange={[-5, 5]}
        yRange={[-5, 5]}
        description="椭圆为不同损失等高线，轨迹连接实际迭代点；负梯度线段仅表示方向，显示长度最多 1。越界轨迹裁切，参数文本仍显示真实数值。"
      />
    {:else}<Plot2D
        series={[
          { id: 'objective', label: '目标函数', kind: 'line', points: fcurve, role: 'primary' },
          {
            id: 'trajectory',
            label: '迭代轨迹',
            kind: 'line',
            points: history.map((p) => ({ x: p.x[0], y: p.loss })),
            role: 'secondary',
          },
          {
            id: 'position',
            label: '当前参数',
            kind: 'scatter',
            points: [{ x: current.x[0], y: current.loss }],
            role: 'accent',
          },
          {
            id: 'tangent',
            label: '当前切线',
            kind: 'line',
            points: [-0.5, 0.5].map((delta) => ({
              x: current.x[0] + delta,
              y: current.loss + delta * current.gradient[0],
            })),
            role: 'accent',
          },
        ]}
        xRange={[-5, 5]}
        yRange={[0, mode === 'nonconvex' ? 100 : 55]}
        xLabel="参数 x"
        yLabel="目标值 f(x)"
        description="实线为目标函数，虚线连接历史点，圆点为当前参数，短线为切线；图外数值请看文本。"
      />{/if}
    <Plot2D
      series={[
        {
          id: 'loss',
          label: '实际损失历史',
          kind: 'line',
          points: history.map((p, i) => ({ x: i, y: p.loss })),
          role: 'primary',
        },
      ]}
      xRange={[0, Math.max(1, shown)]}
      yRange={[0, Math.max(1, ...history.map((p) => p.loss)) * 1.1]}
      xLabel="迭代步 t"
      yLabel="损失"
      description="每一点对应一次实际目标函数计算。局部下降方向不保证任意学习率下这条曲线下降。"
    />
    <StepByStep steps={stages} index={stage} onchange={(v) => (stage = v)} />
    <p>
      任务卡对照：选择 x²、初始 x=2、η=0.1，单步应得到 1.6；将 η 改为
      1.1，绝对值逐步增长。非凸对照：η=0.05、初值 0 会立即停止在局部极大点；±0.5
      分别趋近两个全局极小点。
    </p>
  </InteractivePanel>
</TheorySection>
<TheorySection id="pitfalls" title="停止并不等于找到最优解"
  ><CommonMistakes
    items={[
      {
        mistake: '沿负梯度走，任意步长都会下降',
        correction:
          '默认二次函数 η=1.1 时误差每步放大 1.2 倍，损失上升；方向是局部信息，距离也必须适当。',
      },
      {
        mistake: '梯度为零必定是全局极小值',
        correction: '非凸示例在 x=0 梯度为零，但它是局部极大点。更高维中还可能遇到鞍点。',
      },
      {
        mistake: '最大步数到达就是收敛',
        correction: '停止可能仅因为预算耗尽。必须检查梯度、损失轨迹和模型性质。',
      },
      {
        mistake: '条件数大就增大学习率',
        correction: '最陡方向限制稳定步长；大步长可能使该方向发散，而平缓方向仍移动缓慢。',
      },
    ]}
  /></TheorySection
>
<TheorySection id="engineering" title="把可验证更新带回模型拟合"
  ><p>
    在线性回归等平滑损失中，梯度将每个参数的微小影响汇总为更新方向。真实神经网络通常是高维非凸问题，小批量梯度还含采样噪声。这里的精确二次收敛阈值不能直接套到所有模型；控制参数优化更需要先确认可微性、尺度、约束与安全边界。实际训练应同时观察训练与验证误差，不把目标下降当作泛化改善的证明。
  </p></TheorySection
>
<TheorySection id="summary" title="四个可以迁移的判断"
  ><LessonSummary
    points={[
      '梯度决定方向，学习率决定每步距离。',
      '二次函数的误差递推能精确解释收敛边界。',
      '曲率尺度差异使固定步长更难兼顾所有方向。',
      '驻点、预算停止与全局最优必须区分。',
    ]}
    related={['M03-007', 'M03-009', 'M03-012']}
  /></TheorySection
>
