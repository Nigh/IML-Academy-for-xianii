import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-004',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '模型允许哪些输出' },
    { id: 'intuition', title: '封闭意味着组合后仍合法' },
    { id: 'mathematics', title: '子空间判据与反例' },
    { id: 'experiment', title: '直线能否容纳线性组合' },
    { id: 'pitfalls', title: '一次成功不是证明' },
    { id: 'summary', title: '从集合到子空间' },
  ],
  quiz: [
    {
      id: 'offset',
      version: 1,
      prompt: '集合 y=2x+1 为什么不是实向量空间 R² 的线性子空间？',
      options: [
        {
          id: 'zero',
          text: '不包含零向量，数乘零就会离开集合',
          explanation: '任何成员乘零都应得到仍在子空间内的零向量，但 (0,0) 不满足 y=2x+1。',
        },
        {
          id: 'line',
          text: '因为直线的维数小于2',
          explanation: '低维本身不是问题；过原点的直线就是一维子空间。',
        },
      ],
      answerId: 'zero',
    },
    {
      id: 'proof',
      version: 1,
      prompt: '在 y=2x 上测试100组系数都未失败，是否构成封闭性的证明？',
      options: [
        {
          id: 'no',
          text: '不是，需要对任意实系数给出推导',
          explanation:
            '有限测试帮助发现反例，但无法覆盖无穷多个成员与系数；y−2x 在任意组合下恒为零才给出证明。',
        },
        {
          id: 'yes',
          text: '是，100组足以证明',
          explanation: '再多有限样例也不能替代全称命题的证明。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'affine',
      version: 1,
      prompt: '在平移直线内选择 a+b=1，组合仍在线上，能否说明它是子空间？',
      options: [
        {
          id: 'restricted',
          text: '不能，这只是满足系数和为1的仿射组合',
          explanation: '子空间要求任意实系数，不能额外限制系数和。',
        },
        {
          id: 'space',
          text: '能，只要找到一种封闭组合即可',
          explanation: '存在一组成功系数不满足任意线性组合的要求。',
        },
      ],
      answerId: 'restricted',
    },
  ],
} satisfies LessonDefinition;
