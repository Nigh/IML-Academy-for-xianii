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
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let B = $state(2),
    T = $state(3),
    C = $state(4),
    batch = $state(0),
    start = $state(0);
  const result = $derived(experiment([B, T, C], batch, start));
  const selected = $derived(
    presets.find((p) => p.shape[0] === B && p.shape[1] === T && p.shape[2] === C)?.id ?? 'custom',
  );
  function select(id: string) {
    if (id === 'original') resetVersion += 1;
    const p = presets.find((p) => p.id === id);
    if (p) {
      [B, T, C] = p.shape;
      batch = 0;
      start = 0;
    }
  }
</script>

<TheorySection id="motivation" title="实验记录有24个数，怎样找到某一时刻的读数？">
  <p>
    记录台收到两段实验，每段三个时刻、每时刻四个通道。打开第二段、选择一个时刻，能否找到对应通道的槽位？如果接收方把同一串数分成三段、每段两个时刻，记录地址又会怎样变化？
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    上一课用两个有顺序的分量表示一个向量。现在把这种“每个位置有含义”的想法扩展到列表、表格和多张表，不要求学过矩阵运算。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="在记录台中选择批次、时刻与通道">
  <p>
    先打开不同记录并前后切换时刻，核对表格第一行；再增加一个通道，观察槽位与总元素数。比较两种24元素的分组，最后找到第八段记录的最后时刻。
  </p>
  <PredictionLab {...exploration} context={JSON.stringify(result)} {resetVersion}>
    <InteractivePanel
      title="带语义的切片"
      instructions="B 默认2（1–8），T 默认3（1–100），C 默认4（1–8）；全部为无量纲整数。输入非法时保留有效值。选批次和起始时刻，查看最多8行、全部通道；所有时刻可通过起始索引访问。"
      meaning="每格实际计算 X[b,t,c]=(bT+t)C+c。表头给出地址，各预设展示真实元素数与索引变化。"
      limitations="这是固定行主序的教学数组，不代表任意框架内存布局；不分配训练模型，不测量运行时内存或速度。"
      onreset={() => select('original')}
    >
      <section class="object-workbench" data-testid="object-workbench" aria-label="多次实验记录台">
        <h3>打开一段实验记录</h3>
        <p>每张卡代表一段独立记录。选择卡片和时刻，下面的表格随之切换；每个通道是一列记录槽。</p>
        <div class="actions" aria-label="实验记录卡">
          {#each Array.from({ length: B }, (_, i) => i) as i (i)}
            <button class="btn btn-outline" aria-pressed={batch === i} onclick={() => (batch = i)}
              >记录 {i + 1}</button
            >
          {/each}
        </div>
        <div class="actions">
          <button class="btn btn-outline" disabled={start === 0} onclick={() => (start -= 1)}
            >前一个时刻</button
          >
          <button class="btn btn-outline" disabled={start === T - 1} onclick={() => (start += 1)}
            >后一个时刻</button
          >
          <button class="btn btn-outline" disabled={C === 8} onclick={() => (C += 1)}
            >增加一个测量通道</button
          >
          <button class="btn btn-outline" disabled={C === 1} onclick={() => (C -= 1)}
            >移除最后通道</button
          >
        </div>
        <output data-testid="object-result"
          >正在打开记录 {batch + 1} / {B}，时刻 {start + 1} / {T}；本时刻有 {C} 个通道槽。</output
        >
        <div class="actions" aria-label="当前时刻的通道记录">
          {#each result.values[0] as value, c (c)}
            <span class="badge badge-outline">通道 {c + 1}：地址码 {value}</span>
          {/each}
        </div>
        <p>
          这是确定性地址编码，不是真实传感器读数。增加通道会重新编码地址；原有读数不被模拟成实测数据。
        </p>
      </section>
      <PresetSelector {presets} value={selected} defaultId="original" onchange={select} />
      <div class="parameters">
        <NumericInput
          label="批次数 B"
          value={B}
          min={1}
          max={8}
          integer
          onchange={(v) => {
            B = v;
            batch = 0;
          }}
        />
        <NumericInput
          label="时刻数 T"
          value={T}
          min={1}
          max={100}
          integer
          onchange={(v) => {
            T = v;
            start = 0;
          }}
        />
        <NumericInput
          label="通道数 C"
          value={C}
          min={1}
          max={8}
          integer
          onchange={(v) => (C = v)}
        />
        <NumericInput
          label="批次索引 b"
          value={batch}
          min={0}
          max={B - 1}
          integer
          onchange={(v) => (batch = v)}
        />
        <NumericInput
          label="起始时刻 t"
          value={start}
          min={0}
          max={T - 1}
          integer
          onchange={(v) => (start = v)}
        />
      </div>
      <p data-testid="shape" aria-live="polite">
        形状 ({B},{T},{C}) · 3阶 · {result.count} 个元素 · float32 原始数据 {result.bytes} 字节
      </p>
      <MatrixView
        values={result.values}
        rowLabels={Array.from({ length: result.rows }, (_, i) => `t=${start + i}`)}
        columnLabels={Array.from({ length: C }, (_, i) => `c=${i}`)}
      />
      <p>
        当前批次 b={batch}；每格为无量纲地址编码。展平索引 q={result.offset} 对应地址 ({result.coordinates.join(
          ',',
        )})。
      </p>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="轴是数据的地址">
  <p>
    张量（tensor）在本课采用机器学习里的数组含义：把数按若干个有顺序的方向组织起来。这里不展开物理学中张量随坐标变换的严格定义。先不用公式，想象连续记录温度：一个时刻得到一个数，三个时刻得到一列数。
  </p>
  <p>
    如果每个时刻同时记录温度与湿度，就得到一张表：每行是一个时刻，每列是一种通道。再记录两段独立实验，每段各有一张同样大小的表，把两张表叠起来，就是三个轴的数据。通道不是几何方向，而是每个时刻记录的不同数值种类。
  </p>
  <p>
    轴（axis）是选择元素时需要指定的一个位置方向；阶数（order）是轴的个数；形状（shape）按约定顺序列出每个轴有多长。一个数没有轴，零阶；一列数一阶；表格二阶；一叠表三阶。阶数不等于元素总数，也不等于矩阵的秩。
  </p>
  <FormulaBlock
    latex={String.raw`\operatorname{shape}(X)=(B,T,C)=(2,3,4),\qquad N=2\times3\times4=24`}
    description="B为实验片段的个数（批次），T为每段时刻数，C为每时刻通道数；N为元素总数，所有计数无量纲。X是确定性教学数组。"
  />
  <p>
    找一个元素就像报地址：“第几张表、第几行、第几列”。程序从0开始编号，因此地址(1,2,3)表示第二段实验、第三个时刻、第四个通道；不是把这三个数相乘。刚才的实验用地址编码代替真实温湿度，所有格子无量纲。
  </p>
  <p>
    形状(3,2,4)虽然也有24个数，却意味着三段实验、每段两个时刻。同样数量的纸张文字，分成不同表格就有不同地址含义。形状只说大小；每个轴代表什么、数值单位是什么，需要另行约定。长度为1的轴仍然存在，例如单通道数据仍可有批次、时间、通道三个轴。
  </p>
  <KnowledgeCheck
    prompt="迁移：当时间和通道长度恰好都为4，交换这两轴还能靠形状发现吗？说明应该检查什么。"
  >
    {#snippet answer()}<p>
        形状可能仍相同，需要追踪已知元素的地址并核对轴名称、通道顺序和单位。形状检查无法代替语义检查。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>
<TheorySection id="mathematics" title="阶数、形状与索引">
  <p>
    先确认你能说明(2,3,4)为什么是三阶、24个元素，并用三个索引定位一个元素。下面把这个地址进一步换成一条长列表中的位置；这是存储表示，不是张量概念本身。
  </p>
  <details>
    <summary>进阶：展平地址与存储量</summary>
    <p>
      重塑（reshape）把同一条数字序列重新分组，例如2行3列改成3行2列；转置（transpose）则把行列角色互换并移动对应元素。这两种操作一般给出不同的排列，不能仅凭元素总数相同互相替代。
    </p>
    <FormulaBlock
      latex={String.raw`X\in\mathbb R^{B\times T\times C},\quad N=BTC,\quad q=(bT+t)C+c`}
      description="X 是确定性的三阶实数数组（此处不是随机变量），B 为批次数、T 为时刻数、C 为通道数，均为无量纲正整数。N 是元素个数。零起始索引 b∈[0,B−1]、t∈[0,T−1]、c∈[0,C−1]。q 是行主序、通道变化最快的展平索引，无量纲。"
    />
    <p>
      每跨过一个时间步，跳过 C 个通道；每跨过一个批次，跳过 TC
      个元素，因此得到上面的地址公式。float32 每个元素占 4 字节，原始连续数组的存储量是元素数乘
      4；框架对象开销不包含在内。
    </p>
    <p>
      按行主序，最内层通道先变化：地址(1,2,3)前面有1整批、2整行、3个通道值，因此展平位置是23，从0编号。float32是一种每个数占4字节的数值格式；字节是存储单位，不是形状的一根轴。
    </p>
  </details></TheorySection
>

<TheorySection id="pitfalls" title="元素数不决定语义">
  <CommonMistakes
    items={[
      {
        mistake: '元素总数相同就能交换使用。',
        correction:
          '(2,3,4) 与 (3,2,4) 的 q=8 对应不同批次和时刻；仅 reshape 不会替你交换业务语义。',
      },
      {
        mistake: '长度为1的轴可以随时忽略。',
        correction:
          '(8,100,1) 仍为3阶。删除通道轴会改变后续算子接收的形状，广播时尤其容易产生意外结果。',
      },
      {
        mistake: '形状正确就保证通道意义和单位正确。',
        correction:
          '互换两个通道，形状保持不变却可能令模型输入语义错误。应同时记录通道顺序、单位和归一化方式。',
      },
    ]}
  />
  <p>
    工程中将多个传感器窗口组成批次时，先检查各轴语义、窗口长度和缺失值策略，再喂给模型。形状检查是结构门槛，无法替代数据质量检查。
  </p>
</TheorySection>
<TheorySection id="summary" title="把形状写进数据协议">
  <LessonSummary
    points={[
      '阶数是轴的个数，形状逐轴记录长度，元素数是各长度乘积。',
      '批次、时间、通道是约定的轴语义，需要显式记录。',
      'reshape 与 transpose 的索引行为不同；元素数相同不保证语义等价。',
      '存储预算取决于元素数和数据类型，真实运行还包含额外开销。',
    ]}
    related={['M01-001', 'M01-011', 'M01-021']}
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
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
