export const exploration = {
  prompt: '印章只转90°，不拉伸。描述长度变化的两个奇异值应该是什么？',
  options: [
    {
      text: '没有实特征值，所以也没有奇异值',
      correct: false,
      observation: '选择纯旋转，取回原始印章并逐道送入工序；比较轮廓尺寸和缺口朝向。',
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
