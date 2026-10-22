export const exploration = {
  prompt: 'A有2行3列，B有3行2列。AB第一个格子应如何计算？',
  options: [
    {
      text: 'A第一行与B第一列的三个乘积相加',
      correct: true,
      observation: '高亮一行一列，核对它们对当前结果格的贡献。',
    },
    {
      text: '只把左上角两个元素相乘',
      correct: false,
      observation: '保持默认矩阵，切换结果列，比较参与相乘的数。',
    },
  ],
  hints: [
    '一个输出要汇总三个输入，每个输入分别配哪个权重？',
    '改变A第一行的一个权重，观察受影响的是哪些结果格。',
  ],
  explanation:
    '第一个格子为1×7+2×9+3×11=58。共同轴把三份贡献相加，结果保留A的行和B的列，所以是2×2。逐元素乘法没有这一步求和。',
} as const;
