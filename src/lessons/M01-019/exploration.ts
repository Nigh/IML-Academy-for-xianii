export const exploration = {
  prompt: '原图两格亮度为3和1，另两格为0。只传保留亮度3的第一层，重构图会完全一致吗？',
  options: [
    {
      text: '不会，遗漏亮度1，整体误差为1',
      correct: true,
      observation: '点击传输1层，比较原图、重构和丢失图块。',
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
