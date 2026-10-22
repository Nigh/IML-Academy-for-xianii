export const exploration = {
  prompt: '两路驱动总指令必须为2，只在达标的分配中，哪组归一化指令的平方和最小？',
  options: [
    {
      text: '(0,0)',
      correct: false,
      observation: '操作第一路增减按钮，检查总读数是否达标，再比较指令平方和。',
    },
    {
      text: '(1,1)',
      correct: true,
      observation: '先检查候选是否拟合，再比较合格候选的长度。',
    },
  ],
  hints: ['零输入虽然短，是否还满足目标2？', '写成(1+t,1−t)，展开长度的平方。'],
  explanation:
    '平方范数为2+2t²，在t=0最小。伪逆先最小化输出残差，再在同样最优的解中选最短输入；超定矛盾观测的最小残差仍可能非零。',
} as const;
