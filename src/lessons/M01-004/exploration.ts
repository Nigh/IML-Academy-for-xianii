export const exploration = {
  prompt: '比较y=2x与y=2x+1，各取线上两点相加。两条直线都能始终容纳结果吗？',
  options: [
    {
      text: '都是直线，所以都可以',
      correct: false,
      observation: '将偏移设为1，再把两个系数都设为0，检查原点。',
    },
    {
      text: '只有过原点的整条直线可以',
      correct: true,
      observation: '比较相加后的点是否仍满足各自的方程。',
    },
  ],
  hints: ['先别检查所有点，只找一组能否定猜测的输入。', '对一般系数，计算组合的y−2x，再和d比较。'],
  explanation:
    '组合满足w_y−2w_x=(a+b)d，回到原集合需(a+b−1)d=0。d=0时对任意系数成立；d非零时取零系数就失败。一次成功不能证明封闭。',
} as const;
