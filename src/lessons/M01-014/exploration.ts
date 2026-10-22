export const exploration = {
  prompt: '仪表只显示两路总和。第一路加半格、第二路减半格，读数如何变化？',
  options: [
    {
      text: '读数增加2t',
      correct: false,
      observation: '选择目标2的解族，只改t，观察输入坐标和Ax。',
    },
    {
      text: '读数不变',
      correct: true,
      observation: '分别计算两路变化对读数的贡献，检查是否抵消。',
    },
  ],
  hints: [
    '比较改变前后两个输入的差，而不只看各自坐标。',
    '把这个差向量送入同一个矩阵，输出是多少？',
  ],
  explanation:
    'A(t,−t)=0，所以这些变化在零空间中。已有特解时加它们不改变目标；反过来两个解的差必在零空间，因此这给出了全部解。',
} as const;
