export const exploration = {
  prompt: '收货点向东3m、向北4m，沿街与直达分别有多远？',
  options: [
    {
      text: '沿街5m、直达7m',
      correct: false,
      observation: '移动收货点，比较两段街道与直线。',
    },
    {
      text: '沿街7m、直达5m',
      correct: true,
      observation: '读出两条路线，再测试换单位会不会搬动收货点。',
    },
  ],
  hints: [
    '沿街先走横向再走纵向，直达对应哪条三角形边？',
    '用勾股定理计算直达长度，再切换单位，检查是否改变真实路线。',
  ],
  explanation:
    '沿街需3+4=7m，直达由勾股定理得5m。' +
    '(1000x)/(1000s_x)=x/s_x，单位换算保留归一化距离。只改分量会偷偷改变该维权重；改变尺度本身则是在选择新的度量。',
} as const;
