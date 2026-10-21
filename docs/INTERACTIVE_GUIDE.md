# 独立课程交互开发指南

## 范围与流程

Phase 1 的实际实现位于 `src/components`、`src/lib/math`、`src/lib/simulations`。
`Interactive Component Contract v1` 的接口见 [COMPONENTS](COMPONENTS.md)。
数学状态属于课程；公共组件只接收数据和回调，不读取课程 ID（课程链接、下载组件除外）。
新课程仅写自己的 `src/lessons/<ID>`、适用时的 `labs/lessons/<ID>`，用 `lesson.ts` 自动发现，无须修改清单或路由。
共享能力新增或破坏性接口修改走独立基础设施 PR。每课独立分支与 PR，不捆绑三课提交。

先读 LESSON_SPEC、任务卡与 NOTATION，定义 `experiment.ts` 的输入、输出、参数限制和误差容限，再写 UI。
输入回调只接收有效有限数；修改优化参数时归零显示索引，必要时用 Svelte `{#key}` 重建时钟组件。
派生结果用 `$derived`，不使用全局 store 同步实验状态。
以下代码是可运行的真实组件 API 组合；放在课内 Svelte 文件时调整相对路径。

## 1. 向量实验

```svelte
<script lang="ts">
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import { dot } from '../../lib/math/vector.ts';
  let a = $state({ x: 2, y: 1 });
  const b = { x: 1, y: 0 };
  const result = $derived(dot(a, b));
</script>

<ParameterSlider
  label="a 的 x 分量"
  value={a.x}
  min={-5}
  max={5}
  step={0.1}
  onchange={(x) => (a = { ...a, x })}
/>
<ParameterSlider
  label="a 的 y 分量"
  value={a.y}
  min={-5}
  max={5}
  step={0.1}
  onchange={(y) => (a = { ...a, y })}
/>
<VectorDiagram
  range={6}
  vectors={[
    { ...a, label: 'a', role: 'primary', draggable: true },
    { ...b, label: 'b', role: 'secondary' },
  ]}
  onchange={(_, x, y) => (a = { x, y })}
  description={`无量纲向量 a=(${a.x},${a.y})，b=(1,0)`}
/>
<p aria-live="polite">点积 = {result}</p>
```

拖拽使用 Pointer Events 和 SVG CTM 的逆变换，包含页面缩放、触控笔和触摸坐标转换；圆形命中区域禁用 touch scrolling。
必须提供同步数值输入，不能只提供拖拽。方向与投影为 `null` 时显示“未定义”，不能显示 0°。
完整课程示例：`src/lessons/M01-007`。

## 2. 概率实验

```svelte
<script lang="ts">
  import DistributionPlot from '../../components/charts/DistributionPlot.svelte';
  import NumericInput from '../../components/interactive/NumericInput.svelte';
  import { density, sample, statistics } from '../../lib/math/probability.ts';
  let mu = $state(0);
  const distribution = $derived({ kind: 'normal' as const, mu, sigma: 1 });
  const points = $derived(
    Array.from({ length: 201 }, (_, i) => {
      const x = -8 + i * 0.08;
      return { x, y: density(distribution, x) };
    }),
  );
  const samples = $derived(sample(distribution, 100, 42));
  const stats = $derived(statistics(samples));
</script>

<NumericInput label="均值 μ" value={mu} min={-3} max={3} step={0.1} onchange={(v) => (mu = v)} />
<DistributionPlot
  {points}
  xRange={[-8, 8]}
  yRange={[0, 0.5]}
  mean={mu}
  description="Normal PDF；纵轴为无量纲观测值的概率密度，区间概率由面积给出。"
/>
<p>固定 seed 42，N=100，经验均值 {stats.mean}；有限样本不等于总体。</p>
```

`Distribution` 是 Normal / Uniform / Bernoulli / Binomial 的判别联合类型；离散图传 `discrete`，CDF 传 `cumulative`。
`density` 在离散分支返回 PMF；界面必须标 PMF，不能写 PDF。
`sample` 使用固定 seed；参数变化保持相同基础随机序列，便于对照。
种子范围 uint32，样本 1–10000；不要在每个动画帧重新采样。
完整课程示例：`src/lessons/M02-004`，包含骰子 CDF、四分布、理论和经验统计。

## 3. 数值优化实验

```svelte
<script lang="ts">
  import Plot2D from '../../components/charts/Plot2D.svelte';
  import SimulationControls from '../../components/interactive/SimulationControls.svelte';
  import { descend } from '../../lib/simulations/gradient.ts';
  const run = descend({ value: ([x]) => x * x, gradient: ([x]) => [2 * x] }, [2], 0.1, 50);
  let index = $state(0);
  let speed = $state(2);
  const history = $derived(run.history.slice(0, index + 1));
</script>

<SimulationControls
  {index}
  maxSteps={50}
  {speed}
  finished={index >= run.history.length - 1}
  onstep={() => (index = Math.min(index + 1, run.history.length - 1))}
  onreset={() => (index = 0)}
  onspeedchange={(v) => (speed = v)}
/>
<Plot2D
  series={[
    {
      id: 'loss',
      label: '目标值',
      kind: 'line',
      role: 'primary',
      points: history.map((p, t) => ({ x: t, y: p.loss })),
    },
  ]}
  xRange={[0, 50]}
  yRange={[0, 4.5]}
  xLabel="迭代步 t"
  yLabel="损失"
  description="从 x₀=2、η=0.1 的真实数值迭代得到的损失历史。"
/>
<p aria-live="polite">当前参数 {history.at(-1)?.x[0]}</p>
```

`descend` 支持一维/二维、固定步长、最大 1000 步；返回历史与终止状态。
驻点不等于极小值，`max-steps` 不等于收敛。
时钟组件暂停隐藏标签页、不补帧、遵循 reduced motion、卸载清理 interval。
完整示例 `src/lessons/M03-010` 还覆盖参数变更重建控制器、二维等高线、非凸目标与算法解释。

## 数学与图形边界

- `vector.ts`：非有限输入抛错，零方向返回 null；使用 hypot 处理尺度、单位向量内积夹紧处理舍入。
- `coordinates.ts`：数据与屏幕互逆、等比例映射、范围缩放平移、Canvas backing size；SVG 本身为矢量，不需要 DPR 放大。
- `probability.ts`：参数边界严格验证；Normal CDF 使用 A&S 7.1.26 的 erf 近似，误差测试见 `math.test.ts`。统计同时返回分母 N 与 N−1 方差，空样本为 null。
- `gradient.ts`：纯迭代，不依赖 Svelte 或时钟；超过数值上限停止。两点周期检测是有限容差判定，不是对一般动力系统的收敛证明。
- Plot2D 每序列最多 2000 点；当前 SVG 适合教学规模，不用于高频遥测。坐标域固定，由课程选择；越界图形裁切，真实参数另以文本显示。
- HistogramPlot 连续柱宽来自真实 bin 宽度，计数/频率/密度分别有不同纵轴单位；理论叠加必须使用同单位数值。

## 验证与交付

数学测试断言解析答案、边界和非法值；随机测试固定 seed，不能凭单次样本证明分布正确。
组件测试检查参数、预设、复位、错误与生命周期；浏览器测试检查实际拖拽、主题、缩放、移动阅读与深链接刷新。
课程至少两个场景和误区、2–4 题、3–5 总结及已注册链接。不得以结构门槛代替内容审阅。
报告实际执行的检查与截图，未验证的 CI、部署、本地硬件不得声称通过。

## 小型教学组件组合

```svelte
<script lang="ts">
  import DefinitionBlock from '../../components/lesson/DefinitionBlock.svelte';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import ExperimentGuide from '../../components/lesson/ExperimentGuide.svelte';
</script>

<DefinitionBlock term="累计分布函数" notation={String.raw`F_X(x)=P(X\le x)`}>
  <p>X 为实值随机变量，x 为无量纲阈值，F 返回无量纲累计概率。</p>
</DefinitionBlock>
<ExperimentGuide steps={['先预测 F(3)。', '选择公平骰子。', '比较阈值在 3 与 3.9 时的结果。']} />
<KnowledgeCheck prompt="离散 CDF 为什么在整数之间保持不变？">
  {#snippet answer()}<p>公平骰子在非整数处没有概率质量，因此累计概率只在支持点改变。</p>{/snippet}
</KnowledgeCheck>
```

数值算法和概率近似参考：Abramowitz & Stegun，Handbook of Mathematical Functions，
[第 299 页，7.1.26](https://personal.math.ubc.ca/~cbm/aands/page_299.htm)；
[手册来源介绍（NIST）](https://www.nist.gov/mathematics-statistics/handbook-mathematical-functions-abramowitz-and-stegun)。
