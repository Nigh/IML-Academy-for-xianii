<script lang="ts">
  import RoutePlatform from './RoutePlatform.svelte';
  import PredictionLab from '../../components/lesson/PredictionLab.svelte';
  import { exploration } from './exploration.ts';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import { add, magnitude, scale, vector } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let k = $state(1);
  let ax = $state(2);
  let ay = $state(1);
  let bx = $state(-1);
  let by = $state(2);
  let mode = $state<'head-tail' | 'parallelogram'>('head-tail');
  const a = $derived(scale(vector(ax, ay), k));
  const b = $derived(vector(bx, by));
  const sum = $derived(add(a, b));
  const fmt = (n: number) => Number(n.toFixed(2));
  const range = $derived(
    Math.max(
      5,
      1.35 *
        Math.max(
          Math.abs(a.x),
          Math.abs(a.y),
          Math.abs(b.x),
          Math.abs(b.y),
          Math.abs(sum.x),
          Math.abs(sum.y),
        ),
    ),
  );
  function reset() {
    resetVersion += 1;
    k = 1;
    ax = 2;
    ay = 1;
    bx = -1;
    by = 2;
    mode = 'head-tail';
  }
</script>

<TheorySection id="motivation" title="两段路都走了，为什么还能回到原点？">
  <p>
    平台第一段移到起点以东2m、以北1m处，第二段沿原路返回。记录最终位置和走过的路，能得到同一个数吗？给平台下达两段移动指令，分步执行后比较终点与经过的路线。
  </p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    上一课已经区分了物理位移、坐标分量和长度。本课固定同一个坐标系，学习怎样合并位移和改变位移的大小；不再重复标量与向量的完整定义。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="给移动平台安排两段路线">
  <p>
    比较转向和抵消；改变k的正负，观察第一段的方向与长度。再切换两种作图方式，检查合向量是否相同。
  </p>
  <PredictionLab
    {...exploration}
    context={JSON.stringify([k, ax, ay, bx, by, mode])}
    {resetVersion}
  >
    <InteractivePanel
      title="方向会改变答案"
      instructions="设置两段移动指令，点击执行第一段、执行第二段。再用完全抵消场景比较路程和位移。"
      meaning="箭头 ka、虚线箭头 b 与合向量 ka+b 都由当前坐标解析计算；不是预录动画。"
      limitations="二维欧氏空间、同一坐标系、同一单位；不描述旋转姿态的复合。"
      onreset={reset}
    >
      <RoutePlatform {a} {b} {sum} context={JSON.stringify([k, ax, ay, bx, by])} />
      <ParameterSlider
        label="数乘系数 k"
        value={k}
        min={-3}
        max={3}
        step={0.1}
        unit="无量纲"
        onchange={(n) => (k = n)}
      />
      <p>
        默认 k=1。计算 k a + b；k 为负时 a 反向。分量均为 m，范围 −5 至
        5；非法输入保留上次有效结果。视域随端点变化，比较长度时请读取数值。
      </p>
      <div class="vector-lab">
        <div class="vector-controls">
          <span class="vector-key primary-key">第一段移动指令 a · m</span>
          <ParameterSlider
            label="第一段东西位移"
            unit="m"
            value={ax}
            min={-5}
            max={5}
            step={0.1}
            onchange={(n) => (ax = n)}
          />
          <ParameterSlider
            label="第一段南北位移"
            unit="m"
            value={ay}
            min={-5}
            max={5}
            step={0.1}
            onchange={(n) => (ay = n)}
          />
          <span class="vector-key secondary-key">第二段移动指令 b · m</span>
          <ParameterSlider
            label="第二段东西位移"
            unit="m"
            value={bx}
            min={-5}
            max={5}
            step={0.1}
            onchange={(n) => (bx = n)}
          />
          <ParameterSlider
            label="第二段南北位移"
            unit="m"
            value={by}
            min={-5}
            max={5}
            step={0.1}
            onchange={(n) => (by = n)}
          />
        </div>
        <div>
          <VectorDiagram
            {range}
            vectors={[
              { ...a, label: 'ka', role: 'primary' },
              {
                ...b,
                label: mode === 'head-tail' ? '' : 'b',
                role: 'secondary',
                origin: mode === 'head-tail' ? a : undefined,
              },
              { ...sum, label: magnitude(sum) === 0 ? '' : '和', role: 'accent' },
              ...(mode === 'parallelogram'
                ? [
                    { ...b, origin: a, label: '', role: 'secondary' as const },
                    { ...a, origin: b, label: '', role: 'primary' as const },
                  ]
                : []),
            ]}
            description={`数乘后的向量 ka=(${fmt(a.x)},${fmt(a.y)}) 米，b=(${bx},${by}) 米，合向量=(${fmt(sum.x)},${fmt(sum.y)}) 米。`}
          />
          <label class="field"
            >作图方式<select class="select select-bordered" bind:value={mode}
              ><option value="head-tail">首尾相接</option><option value="parallelogram"
                >平行四边形</option
              ></select
            ></label
          >
        </div>
      </div>
      <p>图例：ka 为实线，b 为虚线，和为标有“和”的实线；抵消时合向量落在原点，不画虚假箭头。</p>
      <div class="experiment-result" aria-live="polite">
        k a + b = <strong>({fmt(sum.x)}, {fmt(sum.y)}) m</strong><span
          >合位移长度 {magnitude(sum).toFixed(2)} m · 路程 {(magnitude(a) + magnitude(b)).toFixed(
            2,
          )} m</span
        >
      </div>
      <div class="scenario-buttons">
        <button class="btn btn-sm btn-outline" onclick={reset}>场景一：转向后合成</button><button
          class="btn btn-sm btn-outline"
          onclick={() => {
            k = 1;
            mode = 'head-tail';
            ax = 2;
            ay = -1;
            bx = -2;
            by = 1;
          }}>场景二：完全抵消</button
        >
      </div>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="把箭头首尾相接">
  <p>
    向量相加表示连续完成两段位移：先向右走2m，再向上走1m，总位移从最初起点指向最终终点。把第二根箭头平移到第一根末端，不改变它本身的方向和长度，这叫首尾相接。
  </p>
  <p>
    也可以分别记账：横向贡献只与横向相加，纵向贡献只与纵向相加。两段位移必须使用同一组轴和同样单位；不能把不同坐标系的两列数字直接相加。
  </p>
  <FormulaBlock
    latex={String.raw`(2,0)^\mathsf T+(0,1)^\mathsf T=(2,1)^\mathsf T,\qquad 2(2,1)^\mathsf T=(4,2)^\mathsf T`}
    description="分量单位为m；系数2无量纲。数乘将每一个分量乘以同一个数。"
  />
  <p>
    正系数保持方向，绝对值表示长度变为几倍；负系数还会反向，零系数得到零向量。数乘不是“只改变横分量”。
  </p>
  <p>
    长度的相加是另一件事。向右2m再向上1m，实际路程为3m，但起点到终点的直线距离为平方根5m。只有两段非零位移同向共线时，合位移长度才等于两段长度之和。
  </p>
  <KnowledgeCheck prompt="迁移：一段记录用m，另一段用mm。可以直接逐分量相加吗？说明必须先做什么。">
    {#snippet answer()}<p>
        先统一单位并确认两段使用同一坐标系。数值能相加不代表含义匹配；位置记录还需先转成相对于同一起点的位移。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>

<TheorySection id="mathematics" title="回到数学定义">
  <FormulaBlock
    latex={String.raw`\mathbf a+\mathbf b=\begin{bmatrix}a_x+b_x\\a_y+b_y\end{bmatrix}`}
    description="同一坐标系中的向量逐分量相加。a 和 b 均为二维位移向量，各分量单位为米。"
  />
  <p>
    a、b 均为 2×1 列向量，k 为实数标量，无量纲；数乘后仍以 m
    计。加法满足交换律与结合律。零向量不改变任何位移；一个向量与其相反向量相加得到零向量。
  </p>
  <FormulaBlock
    latex={String.raw`k\mathbf a=\begin{bmatrix}ka_x\\ka_y\end{bmatrix}`}
    description="无量纲实数 k 对所有分量同时缩放；k 为负时方向反转，k 为零时得到零向量。"
  />
</TheorySection>
<TheorySection id="pitfalls" title="长度不能代替方向">
  <p>
    场景二里，机器人走了两段非零路程，却回到了原点。合位移长度是
    0，路径长度是两段长度之和。这正是向量和标量的区别。
  </p>
  <FormulaBlock
    latex={String.raw`\|\mathbf a+\mathbf b\|_2\le\|\mathbf a\|_2+\|\mathbf b\|_2`}
    description="三角不等式。非零向量同向时等号成立，方向不同通常严格小于。零向量的方向未定义。"
  />
  <p>
    另一个误区：把负数乘理解为只缩短长度。k=−1 会翻转方向、保持长度；k=0
    得到零向量，方向未定义。位置也不能无条件相加当作新位置，应先区分位置与位移。
  </p>
</TheorySection>
<TheorySection id="engineering" title="工程中的同一条规则">
  <p>
    多个力合成、传感器位移补偿、机器人轨迹段累加，都使用相同的分量规则。相加前先确认坐标系与量纲一致：米与毫米需要换算，机体坐标与世界坐标需要先变换。
  </p>
  <p>旋转的复合有自己的数学结构，不能直接套用本课的自由向量加法。</p>
</TheorySection>
<KnowledgeCheck prompt="a=(2,1)m，k=−2。k a 是什么，长度怎样变化？">
  {#snippet answer()}<p>
      结果 (−4,−2)m，长度乘 2、方向反转。每个分量都乘 −2；(−1,−0.5)m 是除法结果，(−4,1)m
      则错误地只改变了一个分量。
    </p>{/snippet}
</KnowledgeCheck>
<KnowledgeCheck prompt="两个非零向量何时满足合向量长度等于长度之和？">
  {#snippet answer()}<p>
      两者同向时成立。垂直时合长度由勾股定理计算，严格小于两个非零长度之和；反向时会抵消。只有长度相等不足以判断方向。
    </p>{/snippet}
</KnowledgeCheck>
<TheorySection id="summary" title="带走四个结论">
  <LessonSummary
    points={[
      '同坐标同单位的向量逐分量相加，几何上首尾相接。',
      '数乘同时作用于全部分量，负数翻转方向，零系数消去向量。',
      '合位移长度不超过两段长度之和；同向或含零向量时等号成立。',
      '相加前先统一坐标系与单位，区分位置、位移与路程。',
    ]}
    related={['M01-001', 'M01-005', 'M01-007']}
  />
</TheorySection>
