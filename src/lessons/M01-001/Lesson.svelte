<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import VectorWorkbench from './VectorWorkbench.svelte';
  let { metadata }: LessonBodyProps = $props();
</script>

<TheorySection id="motivation" title="给机器人指定终点">
  <p>
    机器人从地图中央出发，要到达东面 3 米、北面 4 米的位置。如果只告诉它“离起点 5
    米”，向东北和向西北都能满足这个距离，终点还没有确定。把两个方向分别说清楚，才能记录这次位移。
  </p>
  <p>
    再看一条温度记录：25°C。一个数值和单位就能报告这份温度，不需要再补一个空间方向。本课用这两种记录认识标量（scalar）与向量（vector），再换一套坐标轴，观察同一位移的分量怎样变化。
  </p>
</TheorySection>

<TheorySection id="experiment" title="移动机器人，再换一套坐标轴">
  {#key metadata.id}<VectorWorkbench />{/key}
</TheorySection>

<TheorySection id="intuition" title="长度相同，终点也可以不同">
  <p>
    先执行东北方向的移动，再打开“显示相同距离的位置”。圆上的点离起点一样远。选择“西北方向”并重新执行，机器人会停在圆的另一侧，直线距离仍是
    5 米。距离只留下一个数，位移还记录了方向。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf u=\begin{bmatrix}3\\4\end{bmatrix}\,\mathrm m,\qquad \mathbf v=\begin{bmatrix}-3\\4\end{bmatrix}\,\mathrm m,\qquad \|\mathbf u\|=\|\mathbf v\|=5\,\mathrm m`}
    description="u、v 是同一地图中的二维位移，均为 2×1 列向量，分量单位米；双竖线表示长度。两个长度相等，终点和位移方向不同。"
  />
  <p>
    温度和直线距离都是标量。标量可以有正负号，也可以有单位；例如 −5°C
    没有“向西”的意思。计数和比例也可以是没有物理单位的标量。判断一个量是否需要方向，要看它记录什么，不能只看数字有没有负号。
  </p>
</TheorySection>

<TheorySection id="mathematics" title="用两个分量记录位移">
  <p>
    先约定地图向东为 x 正向、向北为 y 正向，每单位都是 1
    米。东西分量放在上面，南北分量放在下面；这两个有符号数排成一列，叫列向量。2×1 表示两行、一列。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf d=\begin{bmatrix}d_x\\d_y\end{bmatrix},\qquad \|\mathbf d\|=\sqrt{d_x^2+d_y^2}`}
    description="d 是平面位移，形状为 2×1；dₓ、dᵧ 是实数分量，单位均为米。两根轴互相垂直、每单位同样长，所以可以用勾股定理计算长度。"
  />
  <p>
    分量为正就沿该轴正向，为负就沿反向。地图里的 (3,4) 米记录向东 3 米、向北 4
    米；这次机器人沿直线抵达终点。图上的虚线折角只帮助读两个分量，不表示机器人实际绕了两段路。
  </p>
  <FormulaBlock
    latex={String.raw`\|\mathbf d\|=\sqrt{3^2+4^2}\,\mathrm m=5\,\mathrm m`}
    description="本例利用直角三角形的两条直角边计算位移长度；5 米是直线距离，不是把 3 米和 4 米相加。"
  />
</TheorySection>

<TheorySection id="frame" title="只转坐标轴，机器人不动">
  <p>
    让机器人完成一次移动，再选择“换坐标轴”。先预测长度是否会改变，然后把坐标轴逆时针转
    90°。留意实线箭头与机器人：它们还在原来的地图位置，改变的是读分量的方向。
  </p>
  <p>
    新 x′ 轴向北，新 y′ 轴向西。同一终点沿新 x′ 正向是 4 米，沿新 y′ 反向是 3 米，所以新分量为
    (4,−3) 米。两个分量必须连同坐标约定一起读，不能把坐标轴转动误当作机器人转弯。
  </p>
  <FormulaBlock
    latex={String.raw`\begin{bmatrix}d'_x\\d'_y\end{bmatrix}=\begin{bmatrix}d_y\\-d_x\end{bmatrix}=\begin{bmatrix}4\\-3\end{bmatrix}\,\mathrm m,\qquad \sqrt{4^2+(-3)^2}\,\mathrm m=5\,\mathrm m`}
    description="本式针对两根正交、同尺度坐标轴一起逆时针转 90°，原点与位移保持不动。撇号表示新坐标分量，单位仍为米，长度仍为 5 米；不要求先学矩阵乘法。"
  />
  <p>
    坐标轴还可以回正，或再转一个四分之一圈。每次都先认清哪边是新轴的正方向，再读正负号。一般角度的坐标变换留到后续课程，这里先把同一对象与不同表示对应起来。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="零位移与负数怎么读">
  <p>
    选择“零位移”并执行。两个分量和长度都为零，机器人停在起点。此时没有唯一方向，不能为了画箭头而默认指向东面。图中不画零长度的位移箭头，读数明确写“方向未定义”。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf 0=\begin{bmatrix}0\\0\end{bmatrix}\,\mathrm m,\qquad \|\mathbf 0\|=0\,\mathrm m`}
    description="二维零位移的两个分量均为 0 米，长度为 0 米，方向未定义；转动坐标轴后仍是零位移。"
  />
  <p>
    非零位移的某个分量为负，也不表示长度为负。例如西北方向的东西分量为 −3
    米，只是相对于向东的正方向，机器人向西移动了 3 米。长度仍是非负的 5 米。
  </p>
</TheorySection>

<TheorySection id="engineering" title="记录坐标时写清方向和单位">
  <p>
    机器人地图向东为横轴正向，另一份记录可能以向北为横轴正向。两份记录中的数字不同，机器人仍可能在同一位置。交换数据时写清原点、轴的方向、分量顺序和单位，才能判断是否记录了同一段位移。本课只换轴向，不改变原点。
  </p>
  <KnowledgeCheck
    prompt="换一个约定：横轴正向朝南，纵轴正向朝东。原来东 3 米、北 4 米的位移，现在怎么记录？直线距离会变吗？"
  >
    {#snippet answer()}<p>
        新横分量是 −4 米，新纵分量是 3 米，直线距离仍为 5
        米。先按新方向读正负号，不需要移动机器人；可在工作区把坐标轴转到 −90° 核对。
      </p>{/snippet}
  </KnowledgeCheck>
  <p>
    ML
    中也常把多个特征按顺序排成向量，例如一条样本里的温度与速度。每项的含义、单位和顺序要先约定好；这样的特征向量不自动是一根地图上的位移箭头，混合单位也不能直接当作米来计算空间距离。
  </p>
</TheorySection>

<TheorySection id="summary" title="记住位移的四个要点">
  <LessonSummary
    points={[
      '标量用一个数值记录；有物理单位时把单位一并写清。位移还需要方向。',
      '同样长的位移可以有不同终点；两个分量要连同轴向、顺序和单位一起读。',
      '只换正交、同尺度的坐标轴，位移和长度保持不变，分量可以改变。',
      '零位移没有唯一方向；下一课再把两段位移合成一次移动。',
    ]}
    related={['M01-002', 'M01-003', 'M01-007']}
  />
</TheorySection>
