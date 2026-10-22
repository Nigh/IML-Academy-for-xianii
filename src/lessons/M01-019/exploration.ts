export const exploration = {
  prompt: 'diag(3,1)只保留第一奇异项，剩余矩阵的Frobenius误差是多少？',
  options: [
    {
      text: '1',
      correct: true,
      observation: '查看遗漏矩阵，而不只看保留能量的百分比。',
    },
    {
      text: '0，因为保留了主要方向',
      correct: false,
      observation: '在k=0、1、2之间切换，比较遗漏元素及误差。',
    },
  ],
  hints: ['第二个方向的伸缩是零，还是只是比第一个小？', '把遗漏矩阵所有元素平方后相加，再开根。'],
  explanation:
    '保留一项后遗漏diag(0,1)，Frobenius误差为1。保留能量是9/10，但仍有非零误差；仅在删去的奇异值全为0时无损。',
} as const;
