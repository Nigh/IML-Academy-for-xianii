export const exploration = {
  prompt: '两路驱动每份分别移动(1,1)和(2,2)，都能前进后退。定位平台能到达目标(1,0)吗？',
  options: [
    {
      text: '不能，两个分量总相等',
      correct: true,
      observation: '观察两个输出分量的差，不只观察误差是否变小。',
    },
    {
      text: '可以，只要继续调整权重',
      correct: false,
      observation: '切到共线方向，尝试让两个输出分量出现不同值。',
    },
  ],
  hints: ['把两个分量分别写成a、b的表达式。', '若目标违反每次组合都满足的关系，再多尝试能改变吗？'],
  explanation:
    '每次组合都是(a+2b,a+2b)，所以无法得到(1,0)。这是覆盖所有实系数的代数理由，超出滑块范围也不会解决；独立方向则能分别控制两个分量。',
} as const;
