<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  import FormulaBlock from '../../components/math/FormulaBlock.svelte';
  import InteractivePanel from '../../components/interactive/InteractivePanel.svelte';
  import ParameterSlider from '../../components/interactive/ParameterSlider.svelte';
  import PresetSelector from '../../components/interactive/PresetSelector.svelte';
  import VectorDiagram from '../../components/charts/VectorDiagram.svelte';
  import CommonMistakes from '../../components/lesson/CommonMistakes.svelte';
  import LessonSummary from '../../components/lesson/LessonSummary.svelte';
  import { experiment, presets } from './experiment.ts';
  let { metadata }: LessonBodyProps = $props();
  let x = $state(3),
    y = $state(4),
    factor = $state(1),
    sx = $state(1),
    sy = $state(1);
  const result = $derived(experiment(x, y, factor, sx, sy));
  function select(id: string) {
    const p = presets.find((p) => p.id === id);
    if (p) {
      x = 3;
      y = 4;
      sx = 1;
      sy = 1;
      factor = p.factor;
    }
  }
</script>

<TheorySection id="motivation" title="换单位为何改变近邻"
  ><p>
    近邻分类、聚类和误差评分都需要比较距离。如果把一个输入从米改记为毫米，模型却认为样本忽然远了很多，问题出在表示与度量。{metadata.title}先用同单位位移解释范数，再演示混合单位的错误。
  </p></TheorySection
>
<TheorySection id="intuition" title="直达与沿轴移动"
  ><p>
    从原点到(3,4)m，直线最短长度是5m；若只能先横向再纵向行走，路程是7m。L2范数对应欧氏长度，L1范数相加绝对分量。两点的距离等于差向量的范数，而范数本身衡量向量到零的距离。
  </p>
  <p>
    不同范数描述不同的几何与任务偏好，没有一种在所有问题上更正确。L1随坐标轴旋转通常改变，L2在正交旋转下不变；使用它们之前要确定坐标含义。
  </p></TheorySection
>
<TheorySection id="mathematics" title="从范数定义距离"
  ><FormulaBlock
    latex={String.raw`\|\mathbf z\|_1=\sum_i|z_i|,\quad\|\mathbf z\|_2=\sqrt{\sum_i z_i^2},\quad d_p(\mathbf a,\mathbf b)=\|\mathbf a-\mathbf b\|_p`}
    description="a、b是同坐标、同量纲的n×1实向量，z为其差；本课n=2、各分量单位m，所得范数/距离单位m。p取1或2。范数非负、仅零向量取零、满足绝对齐次性和三角不等式。"
  /><FormulaBlock
    latex={String.raw`\widetilde z_i=z_i/s_i,\quad s_i>0,\qquad d=\sqrt{\sum_i(z_i/s_i)^2}`}
    description="s_i与对应差分量z_i单位相同，是任务指定的正特征尺度；归一化分量及距离均无量纲。本实验两尺度均以m输入，显示单位换为mm时分量与尺度同时乘1000。"
  />
  <p>
    正尺度使这成为缩放坐标中的合法距离。标准化尺度若由数据估计，应只用训练数据拟合，避免验证信息泄露；本课尺度由学习者明确指定，没有估计过程。
  </p></TheorySection
>
<TheorySection id="experiment" title="同一位移，不同数值表示"
  ><InteractivePanel
    title="物理长度与数值分数"
    instructions="默认差向量(3,4)m，尺度均1m。分量范围±5m，尺度0.1至10m。预设只改变第一特征的显示单位；非法输入保留有效结果。"
    meaning="几何始终按m绘制。实线Δ是直达位移，横向与竖向两段显示L1轴向路径；数值区同时报告合法物理范数、错误混合单位分数与归一化度量。"
    limitations="两维欧氏教学模型，无随机/训练。混合m/mm数值平方和只是错误示范，不具有物理长度单位；更一般的特征尺度需要任务知识。"
    onreset={() => select('metres')}
  >
    <PresetSelector
      {presets}
      value={x === 3 && y === 4 && sx === 1 && sy === 1
        ? factor === 1
          ? 'metres'
          : 'millimetres'
        : 'custom'}
      defaultId="metres"
      onchange={select}
    />
    <div class="parameters">
      <ParameterSlider
        label="第一物理分量"
        value={x}
        min={-5}
        max={5}
        step={0.1}
        unit="m"
        onchange={(v) => (x = v)}
      /><ParameterSlider
        label="第二物理分量"
        value={y}
        min={-5}
        max={5}
        step={0.1}
        unit="m"
        onchange={(v) => (y = v)}
      /><ParameterSlider
        label="第一特征尺度"
        value={sx}
        min={0.1}
        max={10}
        step={0.1}
        unit="m"
        onchange={(v) => (sx = v)}
      /><ParameterSlider
        label="第二特征尺度"
        value={sy}
        min={0.1}
        max={10}
        step={0.1}
        unit="m"
        onchange={(v) => (sy = v)}
      />
    </div>
    <VectorDiagram
      range={result.range}
      vectors={[
        { x, y, label: x || y ? 'Δ' : '', role: 'primary' },
        { x, y: 0, label: x ? '横段' : '', role: 'secondary' },
        { x: 0, y, origin: { x, y: 0 }, label: '', role: 'accent' },
      ]}
      description="等比例坐标x/y均为m，Δ为差向量，横段与竖段首尾相接。零分量不画假箭头；重合端点通过独立数值解释。"
    />
    <div aria-live="polite">
      <p data-testid="result">L1={result.l1.toFixed(3)} m；L2={result.l2.toFixed(3)} m</p>
      <p>
        显示分量：{result.shownX}
        {factor === 1 ? 'm' : 'mm'}，{y} m；直接数值平方和开根={result.rawL2.toFixed(
          3,
        )}（{factor === 1 ? '同单位，数值对应m' : '错误混合单位示范，无合法物理长度单位'}）
      </p>
      <p>
        按尺度归一化：L1={result.normalizedL1.toFixed(3)}；L2={result.normalizedL2.toFixed(
          3,
        )}（无量纲）
      </p>
    </div>
  </InteractivePanel>
  <p>
    场景一确认L1=7m、L2=5m；场景二只有x显示变为3000mm，物理图形与归一化距离均不变，混合单位分数却约为3000。再增大第一尺度，观察该维对无量纲距离的贡献下降；把两分量置零验证距离为零，最后复位。
  </p></TheorySection
>
<TheorySection id="pitfalls" title="度量包含尺度选择"
  ><CommonMistakes
    items={[
      {
        mistake: '不同单位的特征可以直接等权计算距离。',
        correction:
          '相加的平方项必须先统一单位或按同量纲尺度转为无量纲，否则单位换算就会改变隐含权重。',
      },
      {
        mistake: '平方L2与L2范数可以互换。',
        correction:
          '(3,4)的平方和为25，范数是5；平方距离不满足范数的齐次性，也一般不满足三角不等式。',
      },
      {
        mistake: '归一化会自动决定特征重要性。',
        correction:
          '尺度是建模假设，需要领域知识或仅用训练数据估计；无量纲不意味着所有维度应等权。',
      },
    ]}
  />
  <p>
    工程中先记录每列单位、预处理尺度与度量，再比较近邻或标定误差。否则换一套记录单位就可能改变模型的判断。
  </p></TheorySection
>
<TheorySection id="summary" title="先定义单位再比较距离"
  ><LessonSummary
    points={[
      'L1相加绝对分量，L2取平方和开根，距离作用于差向量。',
      '度量需要明确坐标、单位与特征尺度。',
      '单位换算不改变物理量，但错误混合数值会改变评分。',
      '正尺度归一化产生无量纲度量，尺度选择仍是任务假设。',
    ]}
    related={['M01-007', 'M01-009', 'M05-001']}
  /></TheorySection
>

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
