export const exploration = {
  prompt: '矩阵两列分别是(2,0)和(0,1)。单位方形右上角(1,1)会去哪里？',
  options: [
    {
      text: '(2,2)，所有方向都放大2倍',
      correct: false,
      observation: '先看两个有不同端点标记的基方向，再看右上角。',
    },
    {
      text: '(2,1)，两列相加',
      correct: true,
      observation: '分别跟踪横向与纵向贡献，再看方格是否等比例放大。',
    },
  ],
  hints: ['把(1,1)拆成两个标准基的和。', '修改第一列的一个元素，检查另一根基方向是否也改变。'],
  explanation:
    '线性性给出T(1,1)=T(e₁)+T(e₂)=(2,1)。两列决定任意输入的像；不同方向可以有不同伸缩，甚至某方向被完全消去。',
} as const;
