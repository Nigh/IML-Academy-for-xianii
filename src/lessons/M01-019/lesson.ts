import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-019',
  contractVersion: 1,
  status: 'draft',
  sections: [
    { id: 'motivation', title: '只保留一个方向时，删掉的信息能否从其他方向补回来？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '逐项恢复矩阵' },
    { id: 'intuition', title: '保留强方向，舍弃弱方向' },
    { id: 'mathematics', title: '截断SVD与最优误差' },
    { id: 'pitfalls', title: '能量保留不等于细节无损' },
    { id: 'summary', title: '明确压缩目标和误差' },
  ],
  quiz: [
    {
      id: 'error',
      version: 1,
      prompt: 'diag(3,1)只保留第一奇异项，Frobenius误差是多少？',
      options: [
        {
          id: 'one',
          text: '1',
          explanation: '先写出被删掉的奇异项。剩余矩阵diag(0,1)的元素平方和为1，开根号为1。',
        },
        { id: 'three', text: '3', explanation: '3是被保留的奇异值，误差来自被舍弃的一项。' },
      ],
      answerId: 'one',
    },
    {
      id: 'full',
      version: 1,
      prompt: '把保留项数从1增至2时，diag(3,1)的误差怎样变化？',
      options: [
        {
          id: 'zero',
          text: '从1降到0',
          explanation: '全部奇异项恢复原矩阵；双精度实现以容差检查数值零。',
        },
        { id: 'same', text: '仍为1', explanation: '第二项携带的遗漏信息已被补回。' },
      ],
      answerId: 'zero',
    },
    {
      id: 'lossless',
      version: 1,
      prompt: '什么时候k=1可能无损？',
      options: [
        {
          id: 'rank',
          text: '原矩阵的秩不超过1',
          explanation: '被舍弃的全部奇异值本来就为0；否则必然有非零Frobenius误差。',
        },
        {
          id: 'energy',
          text: '第一项能量较大就一定无损',
          explanation: '较大只意味着相对误差可能较小，不代表剩余奇异值严格为0。',
        },
      ],
      answerId: 'rank',
    },
  ],
} satisfies LessonDefinition;
