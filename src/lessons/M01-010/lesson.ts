import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-010',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '转动导轨，两段行程怎样重新分配？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '转导轨，比较行程与平方账本' },
    { id: 'intuition', title: '沿线分量与垂直剩余' },
    { id: 'mathematics', title: '正交性消去交叉项' },
    { id: 'pitfalls', title: '残差不是任意剩余' },
    { id: 'summary', title: '解释部分加正交残差' },
  ],
  quiz: [
    {
      id: 'residual',
      version: 1,
      prompt: '把(3,2)投影到x轴，残差是什么？',
      options: [
        {
          id: 'right',
          text: '(0,2)',
          explanation: '先求投影，再用观测减去投影。观测减投影：(3,2)−(3,0)=(0,2)，与x轴内积为零。',
        },
        { id: 'projection', text: '(3,0)', explanation: '这是投影向量，不是残差。' },
      ],
      answerId: 'right',
    },
    {
      id: 'energy',
      version: 1,
      prompt: '正交分解后，哪些量可直接相加得到原向量对应量？',
      options: [
        {
          id: 'squares',
          text: '两个分量的平方L2范数',
          explanation: '正交使内积交叉项为零，勾股关系对平方范数成立。',
        },
        {
          id: 'lengths',
          text: '两个分量的L2范数',
          explanation: '原向量长度是平方和开根，不是两个非零正交分量长度之和。',
        },
      ],
      answerId: 'squares',
    },
    {
      id: 'noise',
      version: 1,
      prompt: '残差与模型方向正交，是否证明残差是独立噪声？',
      options: [
        {
          id: 'no',
          text: '不能，几何正交不等于概率独立',
          explanation:
            '这里计算的是确定性向量的内积；随机独立需要分布假设，模型漏项也可留在残差中。',
        },
        {
          id: 'yes',
          text: '能，正交保证所有统计关系消失',
          explanation: '正交只排除指定方向上的线性分量，不排除非线性关系或结构性误差。',
        },
      ],
      answerId: 'no',
    },
  ],
} satisfies LessonDefinition;
