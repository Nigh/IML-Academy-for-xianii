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
  import NumericInput from '../../components/interactive/NumericInput.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, parseShape, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let a = $state('2,3,4'),
    b = $state('4'),
    offset = $state(10),
    selected = $state('channels'),
    flat = $state(0);
  const outcome = $derived.by(() => {
    try {
      return { result: experiment(parseShape(a), parseShape(b), offset), error: '' };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : '输入无效' };
    }
  });
  const current = $derived(
    outcome.result?.rows[Math.min(flat, (outcome.result?.rows.length ?? 1) - 1)],
  );
  function select(id: string) {
    if (id === 'channels') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      a = p.a;
      b = p.b;
      offset = 10;
      flat = 0;
      selected = id;
    }
  }
  const fmt = (s: readonly number[]) => `(${s.join(',')}${s.length === 1 ? ',' : ''})`;
</script>

<TheorySection id="motivation" title="给每个通道加偏置，程序怎么知道哪个轴是通道？">
  <p>(3,)和(4,)相加，会自动得到3×4表吗？</p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    已有张量的阶数、形状与索引，也会区分矩阵乘法。本课新增广播：让一个较小数组中的值在逐元素运算中重复使用。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="追踪每个输出来自哪里">
  <p>
    先追踪逐通道偏置跨批次与时间的复用，再比较行列扩展和尾轴冲突。最后用时间与通道等长的场景检查语义错误。
  </p>
  <PredictionLab {...exploration} context={JSON.stringify([a, b, offset, flat])} {resetVersion}>
    <InteractivePanel
      title="尾轴对齐与真实加法"
      instructions="形状用逗号分隔1–3个整数，每轴1–4，默认2,3,4和4；不输入括号。偏置起点默认10，范围±10，步长1，可键盘编辑。输出位置从0起；形状非法或不兼容时显示原因并停止计算。"
      meaning="第一个输入A按行优先扁平索引i赋值A[i]=i；第二个输入D[j]=偏置起点+j。这是确定性地址编码，便于查来源，不代表实测特征。选择任意输出，查看完整坐标、两个来源和实际求和。"
      limitations="仅演示正长度小张量加法，不含标量、空轴、其他运算或实际框架内存分配。表格只列前12项，全部最多64项都可用输出位置检查器访问。形状合法不能证明批次/时间/通道语义正确。"
      onreset={() => select('channels')}
    >
      <PresetSelector {presets} value={selected} defaultId="channels" onchange={select} />
      <div class="shapes">
        <label
          >输入A形状<input
            class="input"
            value={a}
            aria-invalid={!!outcome.error}
            oninput={(e) => {
              a = e.currentTarget.value;
              flat = 0;
              selected = 'custom';
            }}
          /></label
        ><label
          >输入D形状<input
            class="input"
            value={b}
            aria-invalid={!!outcome.error}
            oninput={(e) => {
              b = e.currentTarget.value;
              flat = 0;
              selected = 'custom';
            }}
          /></label
        >
      </div>
      <ParameterSlider
        label="偏置起点"
        value={offset}
        min={-10}
        max={10}
        step={1}
        onchange={(n) => {
          offset = n;
          selected = 'custom';
        }}
      />
      {#if outcome.error}<p role="status" class="error">
          无法计算：{outcome.error}
        </p>{:else if outcome.result && current}
        {@const r = outcome.result}
        <div aria-live="polite" data-testid="result">
          <p>
            尾轴对齐：A={fmt(r.left)}；D={fmt(r.right)}；输出形状={fmt(r.shape)}；元素数={r.rows
              .length}。
          </p>
        </div>
        <MatrixView
          values={[r.left, r.right, r.shape]}
          rowLabels={['A补前轴', 'D补前轴', '输出']}
        />
        <NumericInput
          integer
          label="输出扁平位置"
          value={flat}
          min={0}
          max={r.rows.length - 1}
          step={1}
          onchange={(n) => (flat = n)}
        />
        <p data-testid="trace" aria-live="polite">
          输出坐标{fmt(current.index)}：A来源{fmt(current.left.index)}（扁平{current.left
            .flat}）={current.av}；D来源{fmt(current.right.index)}（扁平{current.right
            .flat}）={current.bv}；相加={current.value}。
        </p>
        <p>前{Math.min(12, r.rows.length)}项／共{r.rows.length}项：</p>
        <MatrixView
          values={r.rows
            .slice(0, 12)
            .map((x) => [x.flat, x.left.flat, x.right.flat, x.av, x.bv, x.value])}
          columnLabels={['输出位置', 'A位置', 'D位置', 'A值', 'D值', '和']}
        />
      {/if}
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="从最后一轴开始对齐">
  <p>
    先做一张表的加法：每行有4个通道，想给第一个通道加10、第二个加20，以此类推。同一份4个偏置要在每行重复使用，程序把这种按规则复用称为广播（broadcasting）。它不执行矩阵乘法里的行列求和。
  </p>
  <FormulaBlock
    latex={String.raw`\begin{pmatrix}0&1&2&3\\4&5&6&7\end{pmatrix}+(10,20,30,40)=\begin{pmatrix}10&21&32&43\\14&25&36&47\end{pmatrix}`}
    description="左数组形状(2,4)，偏置形状(4,)，结果(2,4)；元素无量纲。偏置按末尾通道轴对齐，在每行使用相同通道值。"
  />
  <p>
    形状中的逗号用于区分一维列表记法：(4,)只有一个轴；(4,1)有两个轴。比较时从右向左对齐，缺少的前轴当作长度1；每对长度相同或有一个为1才兼容。长度1表示这里总是复用索引0的数，不表示丢弃这一轴。
  </p>
  <p>
    例如(3,1)与(1,4)，前者每行只有一个值，后者只有一行，每个输出取对应行值加对应列值，形成3×4表；(3,)与(4,)末轴3和4不兼容，会失败。形状兼容并不能证明通道意义正确，程序不会自动理解业务语义。
  </p>
  <KnowledgeCheck
    prompt="迁移：形状(2,3,3)希望按时间加偏置，写成(3,)会发生什么？应该如何明确时间轴？"
  >
    {#snippet answer()}<p>
        (3,)会沿最后的通道轴对齐，形状合法但语义错误。明确写成(1,3,1)才能按时间复用；可用来源索引验证。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="兼容条件与索引映射">
  <FormulaBlock
    latex={String.raw`Y_{btc}=X_{btc}+\beta_c,\quad X,Y\in\mathbb R^{B\times T\times C},\quad\beta\in\mathbb R^C`}
    description="X、Y为确定性张量名称，不表示随机变量；B、T、C为批次、时间、通道轴长度，b、t、c为从0开始的样本/时间/通道索引，β为通道偏置。所有元素无量纲，加法要求相同量纲。例中(B,T,C)=(2,3,4)，偏置缺失的前轴视为1。"
  />
  <FormulaBlock
    latex={String.raw`a_j=d_j\ \lor\ a_j=1\ \lor\ d_j=1,\quad s_j=\max(a_j,d_j)`}
    description="a_j、d_j为尾对齐后第j轴的正整数长度，s_j为输出长度；每轴都满足兼容条件才可广播。完整库还可支持标量和空轴，本课限定1–3轴、每轴1–4，最多64个输出，避免无界计算。"
  />
  <FormulaBlock
    latex={String.raw`q_j=\begin{cases}0,&a_j=1\\i_j,&a_j>1\end{cases},\qquad Y_i=A_q+D_r`}
    description="i为输出多重索引，q为第一个输入的来源索引，r按第二个输入同理构造；缺失前轴不属于原输入索引。A、D为两个输入张量，Y为结果，均为确定性数组。此为逐元素加法，不是矩阵乘法或张量缩并。"
  />
  <p>
    广播语义不要求先把输入物理复制成完整输出大小；实现可能使用步幅等机制。但输出计算和后续操作仍有成本，不能把广播理解为任意大张量都不占内存。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="广播只懂形状，不懂轴的名字"
  ><CommonMistakes
    items={[
      {
        mistake: '广播会自动理解批次与通道的业务语义。',
        correction:
          '它只从尾轴检查长度；当时间与通道长度相同，错误的偏置轴也可能形状合法，必须显式reshape并检查索引。',
      },
      {
        mistake: '两个一维向量总会自动产生外和。',
        correction: '(3,)+(4,)不兼容；明确写(3,1)+(1,4)才得到(3,4)。',
      },
      {
        mistake: '广播相加等于矩阵乘法，或没有任何内存成本。',
        correction:
          '本课每个位置只加两个元素，不做内积；输入可逻辑复用，但大输出及后续运算仍需资源。',
      },
    ]}
  />
  <p>
    数学上形状可广播也不能相加不同单位的物理量。真实ML代码还需检查轴约定、dtype、设备与数值范围，这里只验证形状和无量纲数值映射。
  </p></TheorySection
>
<TheorySection id="summary" title="先检查轴，再检查语义"
  ><LessonSummary
    points={[
      '广播从尾轴对齐，缺失前轴视为1。',
      '每轴必须相同或含单例轴，冲突时应明确报错。',
      '输出索引沿单例轴映射回0，数值来自真实逐元素计算。',
      '形状兼容不能替代轴语义、量纲和资源检查。',
    ]}
    related={['M01-003', 'M01-011', 'M01-018']}
  /></TheorySection
>

<style>
  p {
    overflow-wrap: anywhere;
  }
  .shapes {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1rem 0;
  }
  .shapes label {
    display: grid;
    gap: 0.5rem;
    min-width: 0;
    max-width: 100%;
  }
  .shapes input {
    max-width: 100%;
    min-width: 0;
  }
  .error {
    color: var(--color-error);
  }
</style>
