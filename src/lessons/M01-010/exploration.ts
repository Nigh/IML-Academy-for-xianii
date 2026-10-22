export const exploration = {
  prompt: '目标固定，导轨横放。沿轨和垂直臂的长度平方怎样合计？',
  options: [
    {
      text: '两项长度直接相加等于原长度',
      correct: false,
      observation: '转动导轨，对比小车行程、臂长以及它们的平方和。',
    },
    {
      text: '两项平方和等于原长度平方',
      correct: true,
      observation: '看导轨与连接臂的垂直关系，再核对平方范数账本。',
    },
  ],
  hints: ['展开(p+r)与自身的点积，会出现几项？', '哪一项由垂直关系消掉？普通拆分也有这个条件吗？'],
  explanation:
    '展开得到原平方范数=p的平方范数+2pᵀr+r的平方范数。正交投影使交叉项为0，所以平方相加；长度通常不能直接相加。',
} as const;
