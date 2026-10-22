export const exploration = {
  prompt: 'diag(2,3)作用于(1,1)得到(2,3)。原输入是特征向量吗？',
  options: [
    {
      text: '不是，输出和输入不共线',
      correct: true,
      observation: '比较输出与输入两个分量的倍率是否相同。',
    },
    {
      text: '是，因为可以算出一个平均倍率',
      correct: false,
      observation: '从横轴方向转到45°，观察共线残差。',
    },
  ],
  hints: [
    '若输出等于一个数乘输入，两个分量应该满足什么？',
    '再看90°旋转：是否存在任何非零实箭头能保持所在直线？',
  ],
  explanation:
    '(2,3)无法写成λ(1,1)，所以该输入不是特征向量；最佳拟合倍率2.5仍有残差。特征值必须对整个向量使用同一倍率，负倍率允许反向。',
} as const;
