export const exploration = {
  prompt: '把第一分量从m改成mm，同时把该维尺度也换成mm，归一化距离会改变吗？',
  options: [
    {
      text: '变大1000倍，数值变大了',
      correct: false,
      observation: '切换毫米预设，观察哪一项读数变化。',
    },
    {
      text: '不变，分量和尺度同比换算',
      correct: true,
      observation: '比较物理图形、错误混合单位分数和归一化距离。',
    },
  ],
  hints: [
    '写出第一维的比值，分别给分子分母换单位。',
    '只改变尺度sx而不换单位，检查这和单位换算是否相同。',
  ],
  explanation:
    '(1000x)/(1000s_x)=x/s_x，单位换算保留归一化距离。只改分量会偷偷改变该维权重；改变尺度本身则是在选择新的度量。',
} as const;
