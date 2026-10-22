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
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let mode = $state('row'),
    d = $state(0),
    t = $state(1),
    selected = $state('kernel');
  const result = $derived(experiment(mode, d, t));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      mode = p.mode;
      d = p.d;
      t = p.t;
      selected = id;
    }
  }
  const fmt = (n: number) => Number(n.toFixed(3));
</script>

<TheorySection id="learning-path" title="接上已有知识">
  <p>
    已经知道矩阵的秩表示输出能保留的独立方向。本课从输入一侧寻找被消掉的方向，再区分零输出的解与一般输出的解。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>
<TheorySection id="motivation" title="相同读数背后的不同输入"
  ><p>
    一个测量系统只读到两路信号的和：读数为2时，两路分别为(1,1)还是(2,0)？仅凭总和无法区分。{metadata.title}把这些被映射消除的变化方向单独找出来。在最小二乘标定中，它们意味着仅靠现有观测不能唯一恢复参数。本课使用无量纲的实数输入和解析计算，不模拟硬件采样或模型训练。
  </p></TheorySection
>
<TheorySection id="intuition" title="沿看不见的方向移动">
  <p>
    零空间（null
    space）收集的是输入向量，条件是变换后输出为零；列空间收集输出，不要把二者混在一张图里。零空间总含零输入，关键是还含不含非零方向。
  </p>
  <FormulaBlock
    latex={String.raw`A=\begin{pmatrix}1&1\end{pmatrix},\quad A(t,-t)^\mathsf T=0,\quad A(1+t,1-t)^\mathsf T=2`}
    description="A为1×2无量纲矩阵，输入二维而输出一维；t为任意实数。前式是全部零输出输入，后式是目标2的全部解。"
  />
  <p>
    读数2时，(1,1)是一个具体解，叫特解。加任何零空间向量，读数仍为2，所以全部解是特解加上零空间：一条平移后的直线。只有目标为0时，这条解集才恰好是零空间本身。
  </p>
  <p>
    自由度表示在不改变输出的前提下还能独立调几份输入。秩—零度定理说，输入维数等于输出保留的方向数加被消去的自由度。上例2个输入维度中，1个方向影响总和，另1个方向互相抵消；这比只背一个维数公式更容易检查结果。
  </p>
  <KnowledgeCheck prompt="给一个已知解加一个非零零空间向量，输出会变吗？"
    >{#snippet answer()}<p>
        不会。线性性使新增部分的输出为0，原目标不变，但输入已经不同。
      </p>{/snippet}</KnowledgeCheck
  >
</TheorySection>
<TheorySection id="mathematics" title="零空间与全部解">
  <FormulaBlock
    latex={String.raw`\ker A=\{z\in\mathbb R^n:Az=0\},\qquad \dim\ker A=n-\operatorname{rank}(A)`}
    description="A为m×n实矩阵，z为n维列向量，0为m维零向量；本课n=2、m为1或2，所有分量无量纲。ker A是线性子空间，维度称nullity；秩—零度定理对任意有限维实线性映射成立。"
  />
  <FormulaBlock
    latex={String.raw`Ax_p=b\ \Longrightarrow\ \{x:Ax=b\}=x_p+\ker A`}
    description="b为m维目标输出，x_p为一个n维特解。此式的前提是已存在特解；无解时不能使用。x_p+ker A表示对全部核向量作平移，不是向量加一个数字。"
  />
  <p>
    若x与x_p都满足方程，线性性给出A(x−x_p)=b−b=0；反过来，Az=0时A(x_p+z)=b。这证明所有解恰好由特解加零空间得到。b=0时特解可取0，解空间就是零空间；b≠0时非空解集为仿射空间，一般不是线性子空间。
  </p>
  <FormulaBlock
    latex={String.raw`A=[1\ \ 1],\quad x_p=(d/2,d/2)^\top,\quad x=x_p+t(1,-1)^\top,\quad Ax=d`}
    description="d为无量纲目标读数，t为沿核方向移动的实系数。代入两分量相加，+t与−t严格抵消。网页只展示有限参数区间，数学解族的t可取全部实数。"
  />
</TheorySection>
<TheorySection id="experiment" title="改变输入但保持输出">
  <p>
    先预测再操作：给一个已知解加一个非零零空间向量，输出会变吗？先说明你的理由，再用下面的预设和参数验证；比较图形与数值，最后复位重做一次。
  </p>
  <InteractivePanel
    title="输入移动，读数不动"
    instructions="选择矩阵预设。目标参数d默认0、范围−4到4；核方向系数t默认1、范围−3到3，均无量纲，步长0.25。可用滑块或键盘数值框，非法值不进入计算。"
    meaning="图中实线为特解x_p，虚线为当前输入x，点线为从x_p出发的核位移；重合或零长度不添加偏移。结果区显示实际Ax、b和残差。切换预设时坐标范围自适应，不能跨图凭像素长度比较。"
    limitations="三个固定小矩阵的解析模型；b按已知特解构造，所以实验总有解，不能据此推断任意b都有解。满列秩时t不起作用，因为没有非零核方向。"
    onreset={() => select('kernel')}
  >
    <PresetSelector {presets} value={selected} defaultId="kernel" onchange={select} />
    <ParameterSlider
      label="目标参数 d"
      value={d}
      min={-4}
      max={4}
      step={0.25}
      onchange={(n) => {
        d = n;
        selected = 'custom';
      }}
    />
    <ParameterSlider
      label="核方向系数 t"
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
    <VectorDiagram
      range={result.range}
      vectors={[
        { ...result.particular, label: '', role: 'primary' },
        { ...result.x, label: '', role: 'secondary' },
      ]}
      projection={{ from: result.particular, to: result.x }}
      description="输入平面x₁、x₂，均无量纲；实线特解，虚线当前解，点线核位移。标签移至文字区以免重合；零向量位于原点。"
    />
    <div aria-live="polite" data-testid="result">
      <p>
        秩={result.rank}；输入维度2；零空间维度={result.nullity}。{result.nullity
          ? '核基：(1,−1)，全部核向量为其任意实倍数。'
          : '核基为空，但零空间仍包含零向量。'}
      </p>
      <p>
        实线特解=({fmt(result.particular.x)},{fmt(result.particular.y)})；虚线当前输入=({fmt(
          result.x.x,
        )},{fmt(result.x.y)})；点线位移=({fmt(t * result.direction.x)},{fmt(
          t * result.direction.y,
        )})。
      </p>
      <p>
        Ax=({result.output.map(fmt).join(',')})；b=({result.rhs
          .map(fmt)
          .join(',')})；残差范数={result.residual.toExponential(2)}。
      </p>
    </div>
  </InteractivePanel>
  <p>
    场景一拖动t，验证(1,−1)以及整条核直线都输出0；场景二切换单位矩阵与降秩矩阵，比较零空间维度0和1。场景三保持d=2改变t，观察输入移动但读数固定；再改变d，得到另一条平行解直线，复位回到首场景。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="有零空间不等于无解">
  <CommonMistakes
    items={[
      {
        mistake: '存在非零零空间就意味着所有方程都无解。',
        correction:
          '[1,1]的零空间非平凡，但x₁+x₂=2有无穷多解。存在性由b是否属于列空间决定，非平凡核使已有解不唯一。',
      },
      {
        mistake: '零空间维度0等于零空间为空。',
        correction: '零向量永远在零空间内；维度0表示集合仅有零向量，没有独立的非零方向。',
      },
      {
        mistake: '每个Ax=b的解集都是线性子空间。',
        correction:
          'b≠0且有解时，0不满足方程，因此解集是平移后的仿射空间，不是过原点的线性子空间。',
      },
    ]}
  />
  <p>
    满行秩也不必有唯一解：1×2的[1,1]满行秩，却仍有一维零空间。唯一性要求满列秩；还需另行检查存在性。实际标定中的噪声和近似秩需要容差分析，本课只处理结构已知的精确矩阵。
  </p>
</TheorySection>
<TheorySection id="summary" title="被消去的自由度"
  ><LessonSummary
    points={[
      '零空间由所有映射到0的输入组成，永远包含零向量。',
      '输入维度等于秩加零空间维度。',
      '已有特解时，全部解等于特解加零空间。',
      '存在性看列空间，唯一性看零空间；两件事需要分别判断。',
    ]}
    related={['M01-013', 'M01-015', 'M01-016']}
  /></TheorySection
>

<style>
  p {
    overflow-wrap: anywhere;
  }
</style>
