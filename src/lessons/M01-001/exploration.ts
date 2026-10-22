export const exploration = {
  prompt: '地图上向东3m、向北4m的位移保持不动。只把坐标轴逆时针转90°，会发生什么？',
  options: [
    {
      text: '箭头不动，新横分量为4m',
      correct: true,
      observation: '对照轴的朝向和箭头端点，分别说明什么变了。',
    },
    {
      text: '箭头也逆时针转90°',
      correct: false,
      observation: '只切换坐标轴旋转预设，留意箭头端点是否移动。',
    },
  ],
  hints: ['找新x轴的正方向。它对应旧坐标的哪个方向？', '再看新y轴，位移沿它的正向还是反向？'],
  explanation:
    '新x轴朝北、新y轴朝西，所以分量为(4,−3)m。用这两份分量重构，仍得到原来的位移；长度由勾股定理保持为5m。',
} as const;
