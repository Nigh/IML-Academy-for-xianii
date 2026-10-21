import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M03-010',
  contractVersion: 1,
  status: 'ready',
  sections: [
    {
      id: 'motivation',
      title: '怎样逐步改善模型参数？',
    },
    {
      id: 'intuition',
      title: '方向来自梯度，距离来自学习率',
    },
    {
      id: 'mathematics',
      title: '从二次函数推导稳定区间',
    },
    {
      id: 'experiment',
      title: '逐步执行并检查每一次更新',
    },
    {
      id: 'pitfalls',
      title: '停止并不等于找到最优解',
    },
    {
      id: 'engineering',
      title: '把可验证更新带回模型拟合',
    },
    {
      id: 'summary',
      title: '四个可以迁移的判断',
    },
  ],
  quiz: [
    {
      id: 'step',
      version: 1,
      prompt: 'f(x)=x²，x₀=2，η=0.1，x₁ 是多少？',
      options: [
        {
          id: 'a',
          text: '1.6',
          explanation: '梯度 2x=4，因此 2−0.1×4=1.6。',
        },
        {
          id: 'b',
          text: '1.8',
          explanation: '把梯度误写为 x 会得到 1.8。',
        },
      ],
      answerId: 'a',
    },
    {
      id: 'boundary',
      version: 1,
      prompt: '默认二次函数 η=1，非最优初值会怎样？',
      options: [
        {
          id: 'a',
          text: '等幅两点振荡',
          explanation: '误差递推系数 1−2η=−1，幅值不缩小。',
        },
        {
          id: 'b',
          text: '稳定趋近最小值',
          explanation: '只有 0<η<1 的非特殊初值才稳定收敛。',
        },
      ],
      answerId: 'a',
    },
    {
      id: 'stationary',
      version: 1,
      prompt: 'g(x)=(x²−1)²，初值 0，梯度为零说明什么？',
      options: [
        {
          id: 'a',
          text: '到达驻点，但这里是局部极大点',
          explanation: 'g″(0)=−4，g(0)=1，而 g(±1)=0。',
        },
        {
          id: 'b',
          text: '已经到达全局极小点',
          explanation: '梯度为零不是极小值的充分条件。',
        },
      ],
      answerId: 'a',
    },
  ],
} satisfies LessonDefinition;
