import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-015',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '相同测量规则，为什么能出现唯一解、无穷解和无解？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '切换右端项与解的类型' },
    { id: 'intuition', title: '约束直线的三种关系' },
    { id: 'mathematics', title: '逆矩阵需要什么条件' },
    { id: 'pitfalls', title: '奇异与无解不是同义词' },
    { id: 'summary', title: '先判存在性再判唯一性' },
  ],
  quiz: [
    {
      id: 'identity',
      version: 1,
      prompt: 'I₂x=(2,−1)ᵀ，解是什么？',
      options: [
        {
          id: 'b',
          text: '(2,−1)ᵀ',
          explanation: '先看约束是否独立且一致。单位矩阵保持输入，逆矩阵仍是自身。',
        },
        { id: 'zero', text: '(0,0)ᵀ', explanation: '零输入只会产生零输出，无法得到非零右端项。' },
      ],
      answerId: 'b',
    },
    {
      id: 'singular',
      version: 1,
      prompt: 'A=[[1,1],[2,2]]，b从(2,4)变为(2,3)，解如何变化？',
      options: [
        {
          id: 'none',
          text: '从无穷多解变为无解',
          explanation: '第一式要求x₁+x₂=2；第二式原来重复该约束，改变后要求和为1.5，互相矛盾。',
        },
        {
          id: 'unique',
          text: '从无穷多解变为唯一解',
          explanation: '修改b不会增加A的秩，两条约束无法因此成为独立约束。',
        },
      ],
      answerId: 'none',
    },
    {
      id: 'inverse',
      version: 1,
      prompt: '可以对每个方阵都使用x=A⁻¹b吗？',
      options: [
        {
          id: 'no',
          text: '只有方阵可逆时才成立',
          explanation: '可逆要求满秩；奇异方阵没有逆，需要判断相容性与核方向。',
        },
        {
          id: 'yes',
          text: '方阵都有同形状逆矩阵',
          explanation: '方形是必要形状条件，但倍数行矩阵就是不可逆反例。',
        },
      ],
      answerId: 'no',
    },
  ],
} satisfies LessonDefinition;
