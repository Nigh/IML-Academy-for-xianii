export const exploration = {
  prompt: '配送终点保持在东面3m、北面4m。只把导航仪参考方向转90°，它报告的分量和直线距离会怎样？',
  options: [
    {
      text: '车不动，新横分量为4m、距离仍为5m',
      correct: true,
      observation: '对照轴的朝向和箭头端点，分别说明什么变了。',
    },
    {
      text: '车也绕起点逆时针转90°',
      correct: false,
      observation: '只切换坐标轴旋转预设，留意车的位置是否移动。',
    },
  ],
  hints: ['找新x轴的正方向。它对应旧坐标的哪个方向？', '再看新y轴，位移沿它的正向还是反向？'],
  explanation:
    '新x轴朝北、新y轴朝西，所以分量为(4,−3)m。用这两份分量重构，仍得到原来的位移；长度由勾股定理保持为5m。',
} as const;
