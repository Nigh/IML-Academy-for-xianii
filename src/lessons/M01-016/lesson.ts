import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-016',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '同样拟合得好的多个解，应该怎样选一个？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '比较伪逆与候选解' },
    { id: 'intuition', title: '先最小残差，再最小范数' },
    { id: 'mathematics', title: 'Moore–Penrose伪逆' },
    { id: 'pitfalls', title: '伪逆不会制造不存在的精确解' },
    { id: 'summary', title: '一个有条件解释的统一解' },
  ],
  quiz: [
    {
      id: 'minimum',
      version: 1,
      prompt: '[1,1]x=2，(1,1)与(2,0)都精确满足，为何伪逆选前者？',
      options: [
        {
          id: 'norm',
          text: '欧氏范数更小',
          explanation:
            '先最小化输出误差，再比较输入长度。前者范数√2，后者2；全部精确解中(1,1)范数最小。',
        },
        {
          id: 'fit',
          text: '后者不满足方程',
          explanation: '2+0=2，后者也是精确解，区别在参数范数。',
        },
      ],
      answerId: 'norm',
    },
    {
      id: 'residual',
      version: 1,
      prompt: 'A=(1,1)ᵀ，b=(1,3)ᵀ，伪逆能让残差为0吗？',
      options: [
        {
          id: 'no',
          text: '不能，最优标量2仍有残差√2',
          explanation: '同一标量无法同时等于1和3；投影(2,2)与目标的差为(1,−1)。',
        },
        {
          id: 'yes',
          text: '能，因为伪逆可代替逆',
          explanation: '伪逆求最小二乘解，不保证右端项属于列空间。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'priority',
      version: 1,
      prompt: '“最小范数最小二乘解”先限制在哪类候选中？',
      options: [
        {
          id: 'least',
          text: '残差范数已达到最小的候选',
          explanation: '先最小化残差，再在所有最小二乘解中选参数范数最小者。',
        },
        {
          id: 'all',
          text: '所有向量中直接选范数最小者',
          explanation: '那总会得到0，通常不能最小化拟合残差；两层条件不能省略。',
        },
      ],
      answerId: 'least',
    },
  ],
} satisfies LessonDefinition;
