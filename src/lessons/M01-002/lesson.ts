import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-002',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '从两段位移开始' },
    { id: 'intuition', title: '首尾相接的直觉' },
    { id: 'experiment', title: '亲手合成两个向量' },
    { id: 'mathematics', title: '回到数学定义' },
    { id: 'pitfalls', title: '长度与方向的误区' },
    { id: 'engineering', title: '工程中的向量' },
    { id: 'summary', title: '带走三个结论' },
  ],
  quiz: [
    {
      id: 'cancellation',
      version: 1,
      prompt: '位移 a=(2,−1)m，b=(−2,1)m。合位移与走过的路径长度分别是什么？',
      options: [
        {
          id: 'zero',
          text: '合位移为 (0,0)m，路径长度为 2√5m',
          explanation:
            '两段位移完全抵消，但路径长度仍为两段各 √5m 的路程之和。位移与路程描述的是不同的物理量。',
        },
        {
          id: 'both-zero',
          text: '合位移为 (0,0)m，路径长度为 0m',
          explanation: '合位移为零只说明回到起点，不代表没有运动。每段路程都是 √5m。',
        },
        {
          id: 'sum-length',
          text: '合位移的长度与路径长度都是 2√5m',
          explanation: '长度相加只给出沿路径走过的路程。两个方向相反的位移相加时，合位移为零。',
        },
      ],
      answerId: 'zero',
    },
  ],
} satisfies LessonDefinition;
