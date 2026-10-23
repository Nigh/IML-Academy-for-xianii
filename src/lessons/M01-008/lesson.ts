import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-008',
  contractVersion: 1,
  status: 'draft',
  sections: [
    { id: 'motivation', title: '沿街送货与直达，哪条路线更短？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '规划路线，再切换记录单位' },
    { id: 'intuition', title: '直达与沿轴移动' },
    { id: 'mathematics', title: '从范数定义距离' },
    { id: 'pitfalls', title: '度量包含尺度选择' },
    { id: 'summary', title: '先定义单位再比较距离' },
  ],
  quiz: [
    {
      id: 'norms',
      version: 1,
      prompt: '差向量 (3,4) 的 L1 与 L2 范数分别是多少？',
      options: [
        {
          id: 'right',
          text: '7和5',
          explanation: '先统一坐标和单位。L1相加绝对分量，L2取平方和的平方根。',
        },
        {
          id: 'squared',
          text: '7和25',
          explanation: '25是平方L2范数，不是L2范数；它也不满足范数的一次齐次性。',
        },
      ],
      answerId: 'right',
    },
    {
      id: 'units',
      version: 1,
      prompt: '仅将第一特征从m改记为mm，为什么直接数值距离会变？',
      options: [
        {
          id: 'representation',
          text: '第一维数值放大1000倍，数值度量隐含权重改变',
          explanation:
            '物理量未变；若直接混合单位，计算出的分数不再是原物理距离。尺度也需同步换算。',
        },
        {
          id: 'motion',
          text: '因为实际位移也变大1000倍',
          explanation: '换单位是表示变化，不是物理运动变化。',
        },
      ],
      answerId: 'representation',
    },
    {
      id: 'scales',
      version: 1,
      prompt: '按正尺度归一化后，距离是否就有唯一客观定义？',
      options: [
        {
          id: 'no',
          text: '不是，尺度和度量仍取决于任务',
          explanation: '尺度表达各特征差异的重要性；无量纲解决量纲问题，但不能替代任务定义。',
        },
        {
          id: 'yes',
          text: '是，所有任务都应使用同样的尺度',
          explanation: '不同任务可能关心不同特征差异，不能假定统一重要性。',
        },
      ],
      answerId: 'no',
    },
  ],
} satisfies LessonDefinition;
