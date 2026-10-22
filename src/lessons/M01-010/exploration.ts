export const exploration = {
  prompt: '把(3,2)正交投影到横轴后，投影和残差的长度平方如何合计？',
  options: [
    {
      text: '两项长度直接相加等于原长度',
      correct: false,
      observation: '从横轴转到45°，对比平方和与方向内积。',
    },
    {
      text: '两项平方和等于原长度平方',
      correct: true,
      observation: '同时看两份向量的夹角和平方范数账本。',
    },
  ],
  hints: ['展开(p+r)与自身的点积，会出现几项？', '哪一项由垂直关系消掉？普通拆分也有这个条件吗？'],
  explanation:
    '展开得到原平方范数=p的平方范数+2pᵀr+r的平方范数。正交投影使交叉项为0，所以平方相加；长度通常不能直接相加。',
} as const;
