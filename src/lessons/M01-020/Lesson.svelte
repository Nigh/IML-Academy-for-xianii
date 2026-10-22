<script lang="ts">
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
  import { experiment, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let extra = $state(false),
    delta = $state(0),
    selected = $state('three');
  const r = $derived(experiment(extra, delta));
  const fmt = (n: number) => Number(n.toPrecision(5));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      extra = p.extra;
      delta = p.delta;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="无法同时穿过每个观测"
  ><p>
    用直线校准传感器或拟合特征与响应，观测常不共线，无法让每个点误差同时为0。{metadata.title}选择让残差平方和最小的参数，并解释这种折中为什么是投影。本课只有3或4个无量纲合成观测，解析拟合，不声称这些点来自真实设备或能代表泛化能力。
  </p></TheorySection
>
<TheorySection id="intuition" title="观测空间中的正交投影"
  ><p>
    把全部观测排成向量b。模型能产生的所有预测组成A的列空间，最优预测Ax⋆是b在这个空间上的正交投影。残差r=Ax⋆−b与每个模型列都正交；若还带着某个列方向的分量，就能沿该参数方向继续降低误差。
  </p>
  <p>
    数据图里的横轴是观测输入t、纵轴是响应，不是列空间本身。3个观测对应R³、4个对应R⁴；网页用Aᵀr的两个数验证高维投影条件，避免把二维散点图误当观测空间。
  </p></TheorySection
>
<TheorySection id="mathematics" title="最优性条件与线性拟合">
  <FormulaBlock
    latex={String.raw`L(x)=\|Ax-b\|_2^2,\quad r=Ax-b,\quad\nabla_x L=2A^\mathsf T r,\quad A^\mathsf Tr=0`}
    description="A为n×p实设计矩阵，b为n维观测，x为p维参数；r为n维残差。n是观测数，p是参数数，所有量无量纲。平方目标为凸函数，梯度为0是全局最小条件；本课n=3或4，p=2，不除以n，也不含1/2。"
  />
  <FormulaBlock
    latex={String.raw`\widehat b_i=c+a t_i,\quad A_i=[1\ \ t_i],\quad x=(c,a)^\top,\quad a=\frac{\sum_i(t_i-\bar t)(b_i-\bar b)}{\sum_i(t_i-\bar t)^2},\ c=\bar b-a\bar t`}
    description="t_i为第i个输入，b_i为对应响应，c为截距、a为斜率，横线表示样本算术平均。该解析式要求输入不全相同，分母正；网页对过小分母拒绝计算，不用零替代未定义斜率。"
  />
  <p>
    将平方和分别对c、a求导，可得Σr_i=0与Σt_i
    r_i=0，解出上式。对输入(−1,0,1)、响应(0,1,3)，斜率3/2、截距4/3，残差为(−1/6,1/3,−1/6)，平方和1/6，两项正交检查都为0。
  </p>
  <FormulaBlock
    latex={String.raw`\operatorname{rank}(A)=p\ \Longrightarrow\ x^\star=(A^\mathsf TA)^{-1}A^\mathsf Tb`}
    description="满列秩时参数解唯一。若不满列秩，最优预测仍唯一，但参数可不唯一；伪逆给最小范数解。大型或病态问题通常采用QR/SVD等更稳定的分解，不必显式形成法方程的逆。"
  />
</TheorySection>
<TheorySection id="experiment" title="三点残差与离群点影响">
  <InteractivePanel
    title="投影条件不要求每点零残差"
    instructions="默认三点。勾选增加第四观测(t=2,b=3+δ)，δ默认0，范围−8至8，步长0.5，无量纲；非法数值保留有效值，可键盘编辑。预设离群点δ=6。复位恢复三点。"
    meaning="圆点为观测，虚线为当前最小二乘，实线为原三点拟合；默认二线重合。表格显示每个残差及平方贡献，数值区检查Aᵀr。图中拟合线不是逐点插值。"
    limitations="确定性小样本解析计算，无随机性。仅最小化训练样本未加权平方和，不保证鲁棒、因果或泛化。视域随数据自适应，跨场景比较应看轴刻度与系数。"
    onreset={() => select('three')}
  >
    <PresetSelector {presets} value={selected} defaultId="three" onchange={select} />
    <label
      ><input
        type="checkbox"
        checked={extra}
        onchange={(e) => {
          extra = e.currentTarget.checked;
          selected = 'custom';
        }}
      /> 增加第四观测</label
    >
    {#if extra}<ParameterSlider
        label="第四观测偏移 δ"
        value={delta}
        min={-8}
        max={8}
        step={0.5}
        onchange={(n) => {
          delta = n;
          selected = 'custom';
        }}
      />{/if}
    <Plot2D
      series={r.series}
      xRange={[-1.5, 2.5]}
      yRange={r.yRange}
      xLabel="观测输入 t"
      yLabel="响应 b"
      xUnit="无量纲"
      yUnit="无量纲"
      description="观测散点与两条拟合线；圆点是数据，当前拟合为虚线，原三点拟合为实线。此图不等同于Rⁿ观测空间。"
    />
    <div aria-live="polite" data-testid="result">
      <p>
        观测数={r.points.length}；斜率a={fmt(r.slope)}；截距c={fmt(r.intercept)}；平方和SSE={fmt(
          r.sse,
        )}。
      </p>
      <p>
        Aᵀr=({r.normal.map((n) => n.toExponential(3)).join(',')})；原三点系数a={fmt(
          r.baseline.slope,
        )}、c={fmt(r.baseline.intercept)}。
      </p>
    </div>
    <MatrixView
      values={r.points.map((p, i) => [
        p[0],
        p[1],
        fmt(r.predicted[i]),
        fmt(r.residual[i]),
        fmt(r.residual[i] ** 2),
      ])}
      columnLabels={['t', 'b', '拟合', 'r=拟合−b', 'r²']}
    />
    <details>
      <summary>查看设计矩阵A</summary><MatrixView
        values={r.matrix}
        columnLabels={['常数列', '输入列']}
      />
    </details>
  </InteractivePanel>
  <p>
    场景一确认残差非零而Aᵀr接近0。先加入普通第四点，再切换离群点δ=6，比较斜率、原点附近的拟合和各点平方贡献；调回δ=0并复位。增加离群点会牵动整体参数，并非只影响该点自己的误差。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="整体最优不等于逐点最优"
  ><CommonMistakes
    items={[
      {
        mistake: '最小二乘会令每个观测误差分别最小。',
        correction: '它最小化总平方和，参数在各点之间折中；三点不共线时无法逐点都零误差。',
      },
      {
        mistake: '残差与模型列正交说明残差为0。',
        correction: '列空间外可有非零正交分量；Aᵀr≈0只是最优性条件，不是完美拟合。',
      },
      {
        mistake: '平方损失会自动忽略离群点。',
        correction: '大残差的平方贡献更大，常会强烈牵动参数；鲁棒损失或异常处理是额外选择。',
      },
    ]}
  />
  <p>
    这里的几何正交是有限样本内积关系，不是残差与真实信号统计独立的证明。观测有不同噪声方差或量纲时，应考虑加权与尺度处理。
  </p></TheorySection
>
<TheorySection id="summary" title="把残差与模型方向分开"
  ><LessonSummary
    points={[
      '最小二乘寻找b在设计矩阵列空间中的正交投影。',
      '最优残差满足Aᵀr=0，但每个分量未必为0。',
      '满列秩保证参数唯一，降秩需结合伪逆与零空间。',
      '平方损失放大离群点影响，拟合好坏不等于泛化或鲁棒性。',
    ]}
    related={['M01-010', 'M01-015', 'M01-016', 'M01-018']}
  /></TheorySection
>

<style>
  p {
    overflow-wrap: anywhere;
  }
</style>
