export const exploration = {
  prompt: '第一段位移(2,1)m，第二段(−2,−1)m。总位移长度与实际路程相同吗？',
  options: [
    {
      text: '相同，两段长度总要相加',
      correct: false,
      observation: '切到完全抵消，观察“合位移长度”和“路程”两项。',
    },
    {
      text: '不同，总位移可以为零',
      correct: true,
      observation: '用相反方向的两段路，对照终点和经过的路径。',
    },
  ],
  hints: ['先标记最初起点和最终终点，不急着加长度。', '把第一段乘−1，比较每个分量怎样改变。'],
  explanation:
    '合位移只连接起点和终点；完全抵消时为零。路程仍为两段非零长度之和。分量相加与长度相加回答了不同问题。',
} as const;
