<script lang="ts">
  import RobotWorkbench from './RobotWorkbench.svelte';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import KnowledgeCheck from '../../components/lesson/KnowledgeCheck.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';

  let { metadata }: LessonBodyProps = $props();
</script>

<TheorySection id="motivation" title="给机器人安排两段移动">
  <p>
    机器人从起点出发，第一段向东移动 2 米、向北移动 1 米，第二段向西移动 1 米、向北移动 2 米。
    地图上东为 x 正向，北为 y 正向。下面可以先标记你预计的终点，再执行指令；也可以直接探索。
  </p>
  <p>
    用东西、南北两个方向分别算，就能找到终点。向量把这两笔计算放在一起，方便记录和组合移动指令。
  </p>
</TheorySection>

<TheorySection id="experiment" title="两段移动后的终点">
  {#key metadata.id}<RobotWorkbench />{/key}
</TheorySection>

<TheorySection id="intuition" title="把两段位移首尾相接">
  <p>
    第一段位移记作 a，第二段记作 b。第二段从第一段的终点出发，所以把 b 的箭头平移到 a 的末端。
    平移不改变箭头的方向和长度。从最初起点指向最终终点的箭头，就是总位移 a+b。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf a+\mathbf b=\begin{bmatrix}2\\1\end{bmatrix}+\begin{bmatrix}-1\\2\end{bmatrix}=\begin{bmatrix}1\\3\end{bmatrix}\,\mathrm m`}
    description="本例两段位移的分量都以米计。东西方向合计向东 1 米，南北方向合计向北 3 米。"
  />
  <p>
    在工作区打开“平行四边形”，把 a 和 b 的起点放在一起，再分别补上平行的辅助边。
    从共同起点出发的对角线仍是
    a+b。首尾相接表示实际移动的先后，平行四边形展示同一个和的几何构造；辅助边不代表多走了两段路。
  </p>
</TheorySection>

<TheorySection id="pitfalls" title="原路返回时，路程仍然大于零">
  <p>
    在工作区选择“原路返回”。第一段是 (2,−1) 米，第二段是 (−2,1) 米。 第二段与第一段等长反向，记作
    −a，也就是 (−1)a。机器人回到起点，总位移为零向量。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf a+(-\mathbf a)=\mathbf 0,\qquad L=\sqrt{2^2+(-1)^2}+\sqrt{(-2)^2+1^2}=2\sqrt5\,\mathrm m`}
    description="L 表示实际路程，单位为米。零向量的两个分量都是零，长度为零，方向未定义。"
  />
  <p>
    两段路线在地图上重合，但机器人来回各走了一次。总位移只记录起点到终点的变化，路程要把走过的每段长度加起来。
  </p>
</TheorySection>

<TheorySection id="speed" title="运行时间相同，改变速度">
  <p>
    选择“改变速度”。参考速度的东西、南北分量为 (2,1) 米/秒，每次匀速运行 1 秒。 依次试试速度倍率
    2、−1、0、−2，比较终点的方向和到起点的距离。
  </p>
  <p>
    速度倍率记作 k，没有单位。正数表示沿参考运动方向，负数表示沿相反方向，绝对值表示速率的倍数。
    这里反向指地面上的运动方向反转，不要求机器人转身。运行时间始终为正，负倍率不表示负时间。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf v_0=\begin{bmatrix}2\\1\end{bmatrix}\,\mathrm{m/s},\quad T=1\,\mathrm s,\quad \mathbf a=\mathbf v_0T,\quad \Delta\mathbf r=(k\mathbf v_0)T=k\mathbf a`}
    description="参考速度 v₀ 和实际速度 kv₀ 都是 2×1 列向量，分量单位为米/秒。T 是固定正时长；a 是参考位移，Δr 是实际位移，分量单位为米。"
  />
  <p>
    k=2 时，终点为 (4,2) 米；k=−1 时为 (−2,−1) 米；k=0 时停在起点；k=−2 时为 (−4,−2) 米。
    两个速度分量一起乘 k。负倍率会反向，路程按倍率的绝对值变化。
  </p>
  <p>
    这个模型假设每段匀速直线平移，忽略达到速度和停车的过程。屏幕播放快慢不代表速度倍率。
    若把参考速度的两个分量都设为零，任意 k 的位移都为零，方向未定义。
  </p>
</TheorySection>

<TheorySection id="mathematics" title="用分量计算位移和长度">
  <p>
    本课所有位移都在同一个二维正交坐标系中，用 2×1
    列向量表示；上下两项分别是东西、南北分量，单位为米。 a、b 表示两段位移，k
    是有限实数且无量纲。实验允许 k 在 −3 到 3 之间变化，数学定义不局限于这个范围。
  </p>
  <FormulaBlock
    latex={String.raw`\mathbf a+\mathbf b=\begin{bmatrix}a_x+b_x\\a_y+b_y\end{bmatrix},\qquad k\mathbf a=\begin{bmatrix}ka_x\\ka_y\end{bmatrix}`}
    description="aₓ、aᵧ 是第一段的两个位移分量，bₓ、bᵧ 是第二段的两个位移分量。加法分别合计同一方向的变化，数乘同时作用于全部分量。"
  />
  <p>
    这套位移模型不包含旋转、障碍、转弯半径或测量误差。第二段指令描述从当前点再移动多少，不能直接把最终位置坐标填成第二段位移。
  </p>
  <FormulaBlock
    latex={String.raw`\|\mathbf a+\mathbf b\|_2\leq\|\mathbf a\|_2+\|\mathbf b\|_2=L,\qquad \|k\mathbf a\|_2=|k|\,\|\mathbf a\|_2`}
    description="‖·‖₂ 表示欧氏长度，L 为两段直线移动的路程，均以米计。第一式是三角不等式，第二式说明数乘怎样改变长度。"
  />
  <p>
    三角形两边之和不小于第三边，因此绕经中间点的路程不会小于起终点的直线距离。
    两个非零向量同向时等号成立；只要其中一个是零向量，等号也成立。其余情形严格小于，不能漏掉零向量这个边界。
  </p>
  <FormulaBlock
    latex={String.raw`\begin{bmatrix}2\\0\end{bmatrix}+\begin{bmatrix}0\\1\end{bmatrix}=\begin{bmatrix}2\\1\end{bmatrix}\,\mathrm m,\qquad L=2+1=3\,\mathrm m,\qquad \|\mathbf a+\mathbf b\|_2=\sqrt{2^2+1^2}=\sqrt5\,\mathrm m`}
    description="手算例：向东 2 米，再向北 1 米。两段垂直，路程 3 米大于总位移长度 √5 米。"
  />
</TheorySection>

<TheorySection id="engineering" title="换一条路线，还能完成取货吗">
  <p>
    给默认两段移动加一个要求：机器人必须先到第一段终点取货，再到最终终点。
    回到“两段移动”，把两段指令的分量交换，比较最终终点和中间点。终点相同，能说明取到货了吗？
  </p>
  <KnowledgeCheck prompt="交换两段非平行位移后，取货要求还能满足吗？先检查地图上的中间点。">
    {#snippet answer()}
      <p>
        默认路线先经过 (2,1) 米，交换后先经过 (−1,2) 米，之后仍到 (1,3) 米，但不经过原取货点。
        逐分量相加满足交换律
        a+b=b+a，只保证终点一致。取货要求约束了经过的位置和顺序，必须另外检查路径。
      </p>
    {/snippet}
  </KnowledgeCheck>
  <p>继续组合更多移动时，加法的结合律允许先合计一部分位移；合计结果同样不会保留所有中间点。</p>
</TheorySection>

<TheorySection id="summary" title="合并指令时记住四件事">
  <LessonSummary
    points={[
      '同坐标、同单位的位移逐分量相加；首尾相接和平行四边形给出同一个总位移。',
      '固定正时长时，速度倍率 k 也缩放位移；全部分量一起变化，负值反向，零位移无方向。',
      '路程累加每段长度，总位移长度不超过路程；两个非零向量同向或包含零向量时等号成立。',
      '交换两段位移不改变终点，但可能改变路线；有取货等经过点要求时，还要检查路径。',
    ]}
    related={['M01-001', 'M01-005', 'M01-007']}
  />
</TheorySection>
