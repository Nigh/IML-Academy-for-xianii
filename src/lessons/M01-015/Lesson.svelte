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
  let mode = $state('identity'),
    b1 = $state(2),
    b2 = $state(1),
    t = $state(0),
    selected = $state('identity');
  const result = $derived(experiment(mode, b1, b2, t));
  const fmt = (n: number) => Number(n.toFixed(3));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      b1 = p.b1;
      b2 = p.b2;
      t = p.t;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="标定能否唯一反推参数"
  ><p>
    标定模型把未知参数x映射为观测b，已知观测后能否反求参数？{metadata.title}研究这件事的存在性和唯一性。若两个测量只是同一约束的重复，更多读数并不一定带来更多信息；若读数彼此矛盾，则精确方程根本无解。本课用无量纲实数、三个固定二维矩阵解析展示，不把合成数据当实测结果。
  </p></TheorySection
>
<TheorySection id="intuition" title="约束直线的三种关系"
  ><p>
    每一行方程给出输入平面里的一条直线。两线相交于一点时有唯一解，重合时有无穷多个解，平行且分离时无解。单位矩阵的两行分别固定x₁和x₂；倍数行矩阵只约束两分量之和，第二行若不给相同总和就产生矛盾。
  </p>
  <p>
    逆矩阵（inverse
    matrix）表示撤销一个可逆线性变换。它必须对所有输出都能恢复唯一输入；只为某个b找到一个解，并不证明矩阵可逆。
  </p></TheorySection
>
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
<TheorySection id="experiment" title="切换右端项与解的类型">
  <InteractivePanel
    title="同一个矩阵，不同观测"
    instructions="选择矩阵场景。b₁默认2、b₂默认1，各范围−4至4；解族系数t默认0、范围−3至3，步长0.25，均无量纲。数值框支持键盘；非有限或越界输入不进入计算。"
    meaning="实线与虚线分别表示两行约束，圆点是唯一解或解族当前成员。无解时不伪造交点；两线重合时虚线覆盖实线，文字明确说明。图范围自适应，像素长度不可跨预设比较。"
    limitations="仅三个结构已知的小矩阵；相容性按当前双精度数值严格比较b₂−2b₁是否为0，预设与0.25步长均能精确表示。任意近似输入或含噪数据需容差/最小二乘分析。t只在无穷解时影响当前成员。"
    onreset={() => select('identity')}
  >
    <PresetSelector {presets} value={selected} defaultId="identity" onchange={select} />
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
      series={result.series}
      xRange={[-result.extent, result.extent]}
      yRange={[-result.extent, result.extent]}
      xLabel="x₁"
      yLabel="x₂"
      xUnit="无量纲"
      yUnit="无量纲"
      description="输入平面中的两行约束：实线第一式，虚线第二式；重合表示约束重复，圆点标识当前解。线段在视域边界截取，解族不限于图中范围。"
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
  <p>
    场景一验证x直接等于b。场景二先保持b=(2,4)拖动t，观察圆点沿重合直线移动；切到b=(2,3)，第二条线平移并失去全部交点。场景三检查剪切逆得到x=(1,1)而不是原样返回b，复位恢复单位矩阵。
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
  p {
    overflow-wrap: anywhere;
  }
</style>
