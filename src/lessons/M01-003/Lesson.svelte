<script lang="ts">
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
    const p = presets.find((p) => p.id === id);
    if (p) {
      [B, T, C] = p.shape;
      batch = 0;
      start = 0;
    }
  }
</script>

<TheorySection id="motivation" title="一段数据属于谁、何时、哪个通道">
  <p>
    训练一个时序分类器时，8 段录音、每段 100 个时刻、每时刻 3 个特征，不能只交付“2400
    个数”。模型还需要知道哪一维是样本批次（batch）、时间（time）和通道（channel）。{metadata.title}把这些信息写进数据形状。
  </p>
  <p>
    本课没有录音采样或训练；表中数据是按地址生成的无量纲整数编码，用来追踪元素在哪里。真实特征的单位要单独登记，例如振幅或频率，形状本身不包含单位。
  </p>
</TheorySection>
<TheorySection id="intuition" title="轴是数据的地址">
  <p>
    把每个批次看作一张表：行沿时间，列沿通道。切换批次就是翻到另一张表。标量有零根轴，向量有一根轴，矩阵有两根轴；这里用三根轴形成三阶张量（tensor）。阶数是轴数，不是矩阵的秩。
  </p>
  <p>
    这份轴语义由数据协议指定，框架不会自动知道。将同一串数字解释成不同形状，通常会改变数字对应的地址。转置（transpose）会交换轴和数据索引；重塑（reshape）在保留展平顺序时只重新解释地址，不能代替转置。
  </p>
</TheorySection>
<TheorySection id="mathematics" title="阶数、形状与索引">
  <FormulaBlock
    latex={String.raw`X\in\mathbb R^{B\times T\times C},\quad N=BTC,\quad q=(bT+t)C+c`}
    description="X 是确定性的三阶实数数组（此处不是随机变量），B 为批次数、T 为时刻数、C 为通道数，均为无量纲正整数。N 是元素个数。零起始索引 b∈[0,B−1]、t∈[0,T−1]、c∈[0,C−1]。q 是行主序、通道变化最快的展平索引，无量纲。"
  />
  <p>
    每跨过一个时间步，跳过 C 个通道；每跨过一个批次，跳过 TC 个元素，因此得到上面的地址公式。float32
    每个元素占 4 字节，原始连续数组的存储量是元素数乘 4；框架对象开销不包含在内。
  </p>
</TheorySection>
<TheorySection id="experiment" title="切开三阶张量">
  <InteractivePanel
    title="带语义的切片"
    instructions="B 默认2（1–8），T 默认3（1–100），C 默认4（1–8）；全部为无量纲整数。输入非法时保留有效值。选批次和起始时刻，查看最多8行、全部通道；所有时刻可通过起始索引访问。"
    meaning="每格实际计算 X[b,t,c]=(bT+t)C+c。表头给出地址，各预设展示真实元素数与索引变化。"
    limitations="这是固定行主序的教学数组，不代表任意框架内存布局；不分配训练模型，不测量运行时内存或速度。"
    onreset={() => select('original')}
  >
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
      <NumericInput label="通道数 C" value={C} min={1} max={8} integer onchange={(v) => (C = v)} />
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
  <p>
    先比较 (2,3,4) 和 (3,2,4)：都为24个元素，但 q=8 的地址从 (0,2,0) 变为
    (1,0,0)。再比较单通道与三通道：元素数由800变为2400。切到最后批次与最后时刻，验证零起始边界；复位恢复
    (2,3,4)。
  </p>
</TheorySection>
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
