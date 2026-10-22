export const exploration = {
  prompt: '一个90°旋转保持所有长度。它的奇异值可能是什么？',
  options: [
    {
      text: '没有实特征值，所以也没有奇异值',
      correct: false,
      observation: '选择纯旋转，逐阶段查看圆和探针。',
    },
    {
      text: '1和1',
      correct: true,
      observation: '用单位圆的大小检验长度伸缩，别把方向是否共线当作条件。',
    },
  ],
  hints: [
    '奇异方向允许输入方向与输出方向不同。哪一步只改方向？',
    '加入反射后，长度伸缩需要改成负数吗？',
  ],
  explanation:
    '旋转满足AᵀA=I，所以两个奇异值都是1。SVD分别记录输入方向、非负伸缩和输出方向；旋转和反射由正交因子表达，不要求实特征方向存在。',
} as const;
