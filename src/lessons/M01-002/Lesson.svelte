<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import { add, magnitude, vector } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let ax = $state(2);
  let ay = $state(1);
  let bx = $state(-1);
  let by = $state(2);
  let mode = $state<'head-tail' | 'parallelogram'>('head-tail');
  const a = $derived(vector(ax, ay));
  const b = $derived(vector(bx, by));
  const sum = $derived(add(a, b));
  const fmt = (n: number) => Number(n.toFixed(2));
  function reset() {
    ax = 2;
    ay = 1;
    bx = -1;
    by = 2;
    mode = 'head-tail';
  }
</script>

<TheorySection id="motivation" title="从两段位移开始">
  <p>
    机器人先移动到位置 a，再沿方向 b
    移动一段。它最终在哪里？只把两段距离加起来还不够，我们需要同时保留方向。
  </p>
  <p>
    本课用平面位移建立 {metadata.title} 的直觉。坐标以米（m）为单位，向右为 x 正方向，向上为 y 正方向。
  </p>
</TheorySection>
<TheorySection id="intuition" title="把箭头首尾相接">
  <p>
    向量用一个箭头表示，长度代表大小，箭头朝向代表方向。将第二个箭头平移到第一个箭头的终点；从起点连到最终终点，就是合向量。
  </p>
  <p>
    这里的位移是<strong>自由向量</strong
    >：平移箭头不改变它的分量。交换两段位移的先后顺序，终点不变。
  </p>
</TheorySection>
<TheorySection id="experiment" title="亲手合成两个向量">
  <InteractivePanel
    title="方向会改变答案"
    instructions="调节四个坐标分量。也可以切换作图方式，或直接尝试下面的对照场景。"
    meaning="箭头 a、虚线箭头 b 与合向量 a+b 都由当前坐标解析计算；不是预录动画。"
    limitations="二维欧氏空间、同一坐标系、同一单位；不描述旋转姿态的复合。"
    onreset={reset}
  >
    <div class="vector-lab">
      <div class="vector-controls">
        <span class="vector-key primary-key">向量 a · m</span>
        <ParameterSlider
          label="a 的 x 分量"
          value={ax}
          min={-5}
          max={5}
          step={0.1}
          onchange={(n) => (ax = n)}
        />
        <ParameterSlider
          label="a 的 y 分量"
          value={ay}
          min={-5}
          max={5}
          step={0.1}
          onchange={(n) => (ay = n)}
        />
        <span class="vector-key secondary-key">向量 b · m</span>
        <ParameterSlider
          label="b 的 x 分量"
          value={bx}
          min={-5}
          max={5}
          step={0.1}
          onchange={(n) => (bx = n)}
        />
        <ParameterSlider
          label="b 的 y 分量"
          value={by}
          min={-5}
          max={5}
          step={0.1}
          onchange={(n) => (by = n)}
        />
      </div>
      <div>
        <VectorDiagram
          vectors={[
            { ...a, label: 'a', role: 'primary' },
            { ...b, label: 'b', role: 'secondary', origin: mode === 'head-tail' ? a : undefined },
            { ...sum, label: 'a+b', role: 'accent' },
            ...(mode === 'parallelogram'
              ? [
                  { ...b, origin: a, label: '', role: 'secondary' as const },
                  { ...a, origin: b, label: '', role: 'primary' as const },
                ]
              : []),
          ]}
          description={`向量 a=(${ax},${ay}) 米，b=(${bx},${by}) 米，合向量=(${fmt(sum.x)},${fmt(sum.y)}) 米。`}
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
    <div class="experiment-result" aria-live="polite">
      a + b = <strong>({fmt(sum.x)}, {fmt(sum.y)}) m</strong><span
        >合位移长度 {magnitude(sum).toFixed(2)} m · 路程 {(magnitude(a) + magnitude(b)).toFixed(2)} m</span
      >
    </div>
    <div class="scenario-buttons">
      <button class="btn btn-sm btn-outline" onclick={reset}>场景一：转向后合成</button><button
        class="btn btn-sm btn-outline"
        onclick={() => {
          ax = 2;
          ay = -1;
          bx = -2;
          by = 1;
        }}>场景二：完全抵消</button
      >
    </div>
  </InteractivePanel>
</TheorySection>
<TheorySection id="mathematics" title="回到数学定义">
  <FormulaBlock
    latex={String.raw`\mathbf a+\mathbf b=\begin{bmatrix}a_x+b_x\\a_y+b_y\end{bmatrix}`}
    description="同一坐标系中的向量逐分量相加。a 和 b 均为二维位移向量，各分量单位为米。"
  />
  <p>加法满足交换律与结合律。零向量不改变任何位移；一个向量与其相反向量相加得到零向量。</p>
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
</TheorySection>
<TheorySection id="engineering" title="工程中的同一条规则">
  <p>
    多个力合成、传感器位移补偿、机器人轨迹段累加，都使用相同的分量规则。相加前先确认坐标系与量纲一致：米与毫米需要换算，机体坐标与世界坐标需要先变换。
  </p>
  <p>旋转的复合有自己的数学结构，不能直接套用本课的自由向量加法。</p>
</TheorySection>
<TheorySection id="summary" title="带走三个结论">
  <ol>
    <li>向量加法同时保留方向与大小，计算时逐分量相加。</li>
    <li>数乘同时缩放所有分量，负系数使方向反转。</li>
    <li>合位移与路径长度不同；计算之前先统一坐标系和单位。</li>
  </ol>
</TheorySection>
