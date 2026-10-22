export const exploration = {
  prompt: '只把印章横向拉宽两倍，原右上角(1,1)会去哪里？',
  options: [
    {
      text: '(2,2)，所有方向都放大2倍',
      correct: false,
      observation: '先按横向拉宽，比较缺角和内部标记的高度。',
    },
    {
      text: '(2,1)，两列相加',
      correct: true,
      observation: '跟踪印章右侧与上边，再核对网格和矩阵两列。',
    },
  ],
  hints: ['把(1,1)拆成两个标准基的和。', '修改第一列的一个元素，检查另一根基方向是否也改变。'],
  explanation:
    '线性性给出T(1,1)=T(e₁)+T(e₂)=(2,1)。两列决定任意输入的像；不同方向可以有不同伸缩，甚至某方向被完全消去。',
} as const;
