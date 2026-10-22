export const exploration = {
  prompt: '两路执行器分别沿(1,2)和(2,4)推动，能到达任意方向吗？',
  options: [
    {
      text: '不能，输出只能沿一个方向变化',
      correct: true,
      observation: '分别推动两路，再点相互抵消，比较平台的移动方向。',
    },
    {
      text: '能，两列就对应两个独立方向',
      correct: false,
      observation: '切换两路执行器，观察平台能否离开原来的直线。',
    },
  ],
  hints: [
    '把输出写成第一列的一个系数倍。',
    '转到很小但非零的对角缩放，区分“很难分辨”和“完全消去”。',
  ],
  explanation:
    '输出为(a+2b)(1,2)，所以列空间是一条线，秩为1。diag(1,ε)在ε非零时精确秩为2，数值秩是否忽略第二方向则依赖阈值。',
} as const;
