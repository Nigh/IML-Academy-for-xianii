import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-014',
  contractVersion: 1,
  status: 'draft',
  sections: [
    { id: 'motivation', title: '改变两路输入，为什么仪表读数不动？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '平衡两路信号，观察仪表' },
    { id: 'intuition', title: '沿看不见的方向移动' },
    { id: 'mathematics', title: '零空间与全部解' },
    { id: 'pitfalls', title: '有零空间不等于无解' },
    { id: 'summary', title: '被消去的自由度' },
  ],
  quiz: [
    {
      id: 'hidden',
      version: 1,
      prompt: 'A=[1,1]，输入从(1,1)变为(2,0)，输出如何变化？',
      options: [
        {
          id: 'same',
          text: '仍为2',
          explanation: '代回矩阵，检查输出是否为零。输入变化(1,−1)属于零空间，两次输出相同。',
        },
        {
          id: 'increase',
          text: '增加1',
          explanation: '第一分量增加1，但第二分量同时减少1，二者抵消。',
        },
      ],
      answerId: 'same',
    },
    {
      id: 'dimension',
      version: 1,
      prompt: '2×2矩阵秩为2时，零空间是什么？',
      options: [
        {
          id: 'zero',
          text: '只有零向量，维度0',
          explanation: '秩加零空间维度等于输入维度2，故无非零核方向。',
        },
        {
          id: 'empty',
          text: '空集',
          explanation: '任何线性映射都把零向量映射为零，零空间不可能为空。',
        },
      ],
      answerId: 'zero',
    },
    {
      id: 'solutions',
      version: 1,
      prompt: '若ker A含非零向量，Ax=b一定无解吗？',
      options: [
        {
          id: 'no',
          text: '不一定；一旦有一个解，就有无穷多个解',
          explanation: '在实数域中，特解加任意核向量仍为解；能否有解取决于b是否在列空间内。',
        },
        {
          id: 'yes',
          text: '一定无解',
          explanation:
            '例如x₁+x₂=2有解(1,1)，也有(2,0)，非平凡零空间影响唯一性而非自动否定存在性。',
        },
      ],
      answerId: 'no',
    },
  ],
} satisfies LessonDefinition;
