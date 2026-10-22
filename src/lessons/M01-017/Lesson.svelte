<script lang="ts">
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
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('diagonal'),
    angle = $state(0),
    selected = $state('x');
  const r = $derived(experiment(mode, angle));
  const fmt = (n: number) =>
    n !== 0 && Math.abs(n) < 1e-4 ? n.toExponential(3) : Number(n.toFixed(4));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      angle = p.angle;
      selected = id;
    }
  }
</script>

<TheorySection id="motivation" title="哪些方向在反复变换中最简单"
  ><p>
    一个线性状态更新反复作用时，普通向量可能同时转向和伸缩，但某些方向只按一个比例变化。这让动力学模态、协方差主方向和迭代算法更容易分析。{metadata.title}寻找这些特殊方向。本课用无量纲二维实矩阵解析计算，不以小模型证明真实系统稳定性。
  </p></TheorySection
>
<TheorySection id="intuition" title="共线可以同向也可以反向"
  ><p>
    特征向量（eigenvector）是一根非零输入向量，变换后的输出仍在它张成的同一条直线上。比例为正时同向，为负时反向，为零时被压到原点。特征值（eigenvalue）就是这个比例。不是所有向量都具有这种性质：不同轴缩放时，斜向输入通常会转向。
  </p>
  <p>
    diag(2,3)分别沿横轴和纵轴放大，两个轴都是特征方向；90°旋转保持长度，却把每根非零箭头转到垂直方向，实平面里没有任何特征方向。
  </p></TheorySection
>
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
    description="R为90°逆时针旋转，故没有实特征值及非零实特征向量；在复数域其特征值是±i。diag(2,3)的特征多项式为(2−λ)(3−λ)，两根为2、3。"
  />
  <FormulaBlock
    latex={String.raw`\rho=\frac{v^\top Av}{v^\top v},\quad e=\|Av-\rho v\|_2`}
    description="ρ为给定非零v时最接近Av的实数倍系数（Rayleigh quotient），e是偏离共线的残差。e为0才构成实特征对；普通向量的ρ不能直接称为特征值。网页用单位v，三角函数与e为浮点计算，判定同时依据固定矩阵的解析结构。"
  />
  <p>
    有n个线性无关实特征向量时才可组成实特征向量基并作实对角化。实对称矩阵保证存在正交实特征向量基；一般实矩阵不保证，甚至有实特征值也可能缺少足够独立特征向量。
  </p>
</TheorySection>
<TheorySection id="experiment" title="旋转输入寻找特征方向">
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
  <p>
    场景一比较横轴λ=2和纵轴λ=3，再将θ改为45°观察转向与非零残差。场景二连续改变θ，残差始终约1；结合λ²+1无实根理解为何不是“还没找到角度”。场景三观察负特征值导致反向，复位恢复横轴放大。
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
  p {
    overflow-wrap: anywhere;
  }
</style>
