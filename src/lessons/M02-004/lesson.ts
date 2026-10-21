import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M02-004',
  contractVersion: 1,
  status: 'ready',
  sections: [
    {
      id: 'motivation',
      title: '噪声落在阈值以内的概率',
    },
    {
      id: 'intuition',
      title: '随机变量是规则，样本是一次结果',
    },
    {
      id: 'mathematics',
      title: '质量、密度与累计概率',
    },
    {
      id: 'experiment',
      title: '理论分布与有限样本对照',
    },
    {
      id: 'pitfalls',
      title: '一次读数无法代表整个分布',
    },
    {
      id: 'engineering',
      title: '从错误计数到测量不确定性',
    },
    {
      id: 'summary',
      title: '把分布与数据分开',
    },
  ],
  quiz: [
    {
      id: 'cdf',
      version: 1,
      prompt: '公平骰子 F(3) 等于多少？',
      options: [
        {
          id: 'a',
          text: '1/2',
          explanation: '累计了点数 1、2、3 的概率，共 3/6。',
        },
        {
          id: 'b',
          text: '1/6',
          explanation: '1/6 是单点概率 P(X=3)，不是累计概率。',
        },
      ],
      answerId: 'a',
    },
    {
      id: 'density',
      version: 1,
      prompt: 'Normal 的 PDF 在某点高度为 0.4，该点概率是多少？',
      options: [
        {
          id: 'a',
          text: '0',
          explanation: '连续分布的单点概率为零；区间概率由积分给出。',
        },
        {
          id: 'b',
          text: '0.4',
          explanation: 'PDF 是密度，不能解释为该点概率。',
        },
      ],
      answerId: 'a',
    },
    {
      id: 'samples',
      version: 1,
      prompt: '增大样本量，经验均值是否每次都更接近理论均值？',
      options: [
        {
          id: 'a',
          text: '不保证，但统计稳定性通常改善',
          explanation: '单次轨迹仍有随机波动，大数规律不是单调保证。',
        },
        {
          id: 'b',
          text: '保证每次单调改善',
          explanation: '多出的随机样本可能暂时把经验均值拉远。',
        },
      ],
      answerId: 'a',
    },
  ],
} satisfies LessonDefinition;
