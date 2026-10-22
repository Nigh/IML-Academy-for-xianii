<script lang="ts">
  import PredictionLab from '../../components/lesson/PredictionLab.svelte';
  import { exploration } from './exploration.ts';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { measure, presets, limitComponents } from './experiment.ts';
  let resetVersion = $state(0);
  let { metadata }: LessonBodyProps = $props();
  let a = $state({ x: 3, y: 1 }),
    b = $state({ x: 1, y: 3 }),
    preset = $state('arbitrary'),
    guides = $state(true),
    process = $state(true);
  const result = $derived(measure(a, b));
  const range = $derived(
    1.4 *
      Math.max(
        1,
        Math.abs(a.x),
        Math.abs(a.y),
        Math.abs(b.x),
        Math.abs(b.y),
        Math.abs(result.projection?.x ?? 0),
        Math.abs(result.projection?.y ?? 0),
      ),
  );
  const fmt = (n: number) => Number(n.toFixed(4));
  function select(id: string) {
    const p = presets.find((p) => p.id === id)!;
    a = { ...p.a };
    b = { ...p.b };
    preset = id;
  }
  function reset() {
    resetVersion += 1;
    select('arbitrary');
    guides = true;
    process = true;
  }
  function change(i: number, x: number, y: number) {
    const value = limitComponents({ x, y });
    if (i === 0) a = value;
    else b = value;
    preset = 'custom';
  }
</script>

<TheorySection id="motivation" title="检索分数变大，是方向更接近，还是特征变长了？">
  <p>保持两向量方向，只把b放大2倍，点积会怎样？</p>
</TheorySection>
<TheorySection id="learning-path" title="接上已有知识">
  <p>
    前置课程已经教过向量分量、加法和数乘。本课新增一种把两个向量变成一个数的运算；高中夹角与余弦用于解释它。
  </p>
  {#if metadata.prerequisites.length}<p>需要回顾时，按正式前置关系返回：</p>
    <ul>
      {#each metadata.prerequisites as id (id)}<li>
          <a href={lessonHref(id)}>{id} · {lessonById.get(id)?.title}</a>
        </li>{/each}
    </ul>{/if}
</TheorySection>

<TheorySection id="experiment" title="先预测符号，再移动端点">
  <p>比较平行、反向和正交，再只改变长度。用零向量检查：点积能计算时，夹角是否一定存在？</p>
  <PredictionLab {...exploration} context={JSON.stringify([a, b, guides, process])} {resetVersion}>
    <InteractivePanel
      title="方向与尺度的对照实验"
      instructions="选择预设，先预测点积正负。拖动 a、b 的圆形端点，或使用同步数值控件。每个分量范围 −5 至 5，超范围输入不传播。"
      meaning="范数、点积、角度和投影均按当前向量解析计算；角度单位为度。"
      limitations="二维欧氏空间、同一坐标系、无量纲特征；零向量方向不定义。"
      onreset={reset}
    >
      <PresetSelector {presets} value={preset} defaultId="arbitrary" onchange={select} />
      <div class="vector-lab">
        <div>
          {#each ['x', 'y'] as axis (axis)}<ParameterSlider
              label={`a 的 ${axis} 分量`}
              value={a[axis as 'x' | 'y']}
              min={-5}
              max={5}
              step={0.1}
              onchange={(v) => change(0, axis === 'x' ? v : a.x, axis === 'y' ? v : a.y)}
            />{/each}
          {#each ['x', 'y'] as axis (axis)}<ParameterSlider
              label={`b 的 ${axis} 分量`}
              value={b[axis as 'x' | 'y']}
              min={-5}
              max={5}
              step={0.1}
              onchange={(v) => change(1, axis === 'x' ? v : b.x, axis === 'y' ? v : b.y)}
            />{/each}
        </div>
        <VectorDiagram
          vectors={[
            { ...a, label: result.aNorm === 0 ? '' : 'a', role: 'primary', draggable: true },
            { ...b, label: result.bNorm === 0 ? '' : 'b', role: 'secondary', draggable: true },
            ...(result.projection
              ? [{ ...result.projection, label: '', role: 'accent' as const }]
              : []),
          ]}
          {range}
          onchange={change}
          projection={guides && result.projection ? { from: a, to: result.projection } : undefined}
          showAngle
          description={`a=(${a.x},${a.y}), b=(${b.x},${b.y})；点积 ${result.dot}`}
        />
      </div>
      <p>
        图例：a 为实线，b 为虚线；投影数值在下方单独列出，投影与 a
        重合时保留真实重合关系。零投影落在原点，不另画方向箭头。视域按当前分量等比例调整，比较大小时请读取范数和坐标。
      </p>
      <label><input type="checkbox" bind:checked={guides} /> 显示投影辅助线</label>
      <label><input type="checkbox" bind:checked={process} /> 显示计算过程</label>
      <div class="experiment-result" aria-live="polite">
        <strong data-testid="dot-result">点积 = {fmt(result.dot)}</strong><span
          >‖a‖ = {fmt(result.aNorm)}；‖b‖ = {fmt(result.bNorm)}</span
        ><span data-testid="cosine-result"
          >余弦相似度 = {result.angle === null
            ? '未定义'
            : fmt(Math.cos((result.angle * Math.PI) / 180))}</span
        ><span>夹角 = {result.angle === null ? '未定义' : `${fmt(result.angle)}°`}</span><span
          >投影 = {result.projection
            ? `(${fmt(result.projection.x)}, ${fmt(result.projection.y)})`
            : '未定义：b 为零向量'}</span
        >
      </div>
      {#if process}<FormulaBlock
          latex={`${a.x} \\times (${b.x}) + (${a.y}) \\times (${b.y}) = ${fmt(result.dot)}`}
          description="逐分量相乘并相加；对照图中的投影。"
        />{/if}
      <p>
        探索一：从正交预设开始，只改变 a 的长度，点积仍为零。探索二：选择平行，把 b
        缩短一半，角度不变而点积减半。探索三：选择零向量，检查哪些量仍然有定义。
      </p>
    </InteractivePanel>
  </PredictionLab>
</TheorySection>
<TheorySection id="intuition" title="把一个箭头投到另一个方向">
  <p>
    内积或点积（dot
    product）是一条明确的计算规则：对应分量相乘，把乘积相加，结果是一个标量。它不生成新箭头。先算最简单的例子，再讨论它为什么能描述方向。
  </p>
  <FormulaBlock
    latex={String.raw`(3,2)^\mathsf T\cdot(1,0)^\mathsf T=3\times1+2\times0=3,\qquad \mathbf a\cdot\mathbf b=\|\mathbf a\|_2\|\mathbf b\|_2\cos\theta`}
    description="向量为二维无量纲实向量，θ是两根非零箭头的夹角，双竖线表示欧氏长度。零向量没有方向，因而不定义它的夹角。"
  />
  <p>
    如果参考向量沿横轴且长度为1，点积恰好读出另一个向量的横向分量。一般参考方向也是如此：先把箭头沿参考方向的贡献读出来，再乘参考向量自己的长度。M01-009
    投影会系统解释如何从这个数恢复对应的箭头。
  </p>
  <p>
    锐角的余弦为正，钝角为负，垂直时为0，故点积符号反映夹角。但把任一向量放大，点积也随之放大；方向没变，分数却变了。余弦相似度除掉两个长度的乘积，只比较方向，两向量都非零才有定义。
  </p>
  <KnowledgeCheck
    prompt="迁移：若系统只比较方向，零特征向量可以得到余弦相似度0吗？说明应如何处理。"
  >
    {#snippet answer()}<p>
        不能直接赋0；分母为0，余弦相似度未定义。应报告缺少方向并明确业务处理策略，不能伪造一个正交判断。
      </p>{/snippet}
  </KnowledgeCheck>
</TheorySection>

<TheorySection id="mathematics" title="把投影写成公式">
  <FormulaBlock
    latex={String.raw`\|\mathbf v\|_2=\sqrt{v_x^2+v_y^2},\quad\mathbf a^\mathsf T\mathbf b=a_xb_x+a_yb_y=\|\mathbf a\|_2\|\mathbf b\|_2\cos\theta`}
    description="a、b、v 是二维实列向量；分量和范数均无量纲，θ∈[0,π] 为弧度，界面换算为度。代数内积允许零向量；夹角及含 cosθ 的几何表达要求两向量均非零。"
  />
  <FormulaBlock
    latex={String.raw`\operatorname{proj}_{\mathbf b}(\mathbf a)=\frac{\mathbf a^\mathsf T\mathbf b}{\mathbf b^\mathsf T\mathbf b}\mathbf b,\quad\mathbf b\ne\mathbf0`}
    description="先求参考方向的单位向量，再取 a 在该方向上的有符号长度，最后恢复为向量。投影与 b 平行，残差与 b 正交。"
  />
  <p>
    计算夹角时先归一化，再将余弦值限制在 [−1,1]，避免浮点舍入使 arccos
    的输入越界。精确的零向量返回未定义，近零非零向量仍有数学方向，但测量误差可能让这个方向非常不可靠。
  </p>
</TheorySection>
<TheorySection id="pitfalls" title="点积不是纯粹的方向分数"
  ><CommonMistakes
    items={[
      {
        mistake: '内积大就意味着夹角小',
        correction:
          '(100,0) 与 (1,1) 点积 100，而 (1,0) 与 (1,0) 点积 1；前者夹角反而更大。比较方向时需要归一化。',
      },
      {
        mistake: '点积为零总能推出夹角 90°',
        correction: '还需要两个向量非零。零向量和任何向量点积均为零，但夹角未定义。',
      },
      {
        mistake: '对零向量也能投影',
        correction: '目标方向 b=0 时分母为零；a=0、b 非零时投影则合法且为零。',
      },
    ]}
  /></TheorySection
>
<TheorySection id="engineering" title="从传感器投影到线性层"
  ><p>
    传感器测量向量投影到已知单位轴，可提取该轴的分量；多轴标定与最小二乘使用内积来衡量残差。特征余弦相似度去除长度影响，适用于方向有意义的表示。线性层以每一行权重与输入的内积再加偏置得到输出。真实带单位测量的点积单位是两个分量单位的乘积，归一化与比较之前必须统一坐标和尺度。
  </p></TheorySection
>
<TheorySection id="summary" title="带走四个结论"
  ><LessonSummary
    points={[
      '范数描述长度，方向还需向量非零。',
      '点积同时依赖两向量长度和夹角。',
      '投影提取参考方向的有符号分量。',
      '零向量与浮点误差需要明确处理。',
    ]}
    related={['M01-002', 'M01-008']}
  /></TheorySection
>
