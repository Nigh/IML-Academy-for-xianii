export const exploration = {
  prompt: '矩阵两列为(1,2)和(2,4)。所有输出能铺满平面吗？',
  options: [
    {
      text: '不能，输出只能沿一个方向变化',
      correct: true,
      observation: '试着改变输入而保持输出不动，辨认列之间的倍数关系。',
    },
    {
      text: '能，两列就对应两个独立方向',
      correct: false,
      observation: '观察两列端点的朝向，比较它们是否提供不同方向。',
    },
  ],
  hints: [
    '把输出写成第一列的一个系数倍。',
    '转到很小但非零的对角缩放，区分“很难分辨”和“完全消去”。',
  ],
  explanation:
    '输出为(a+2b)(1,2)，所以列空间是一条线，秩为1。diag(1,ε)在ε非零时精确秩为2，数值秩是否忽略第二方向则依赖阈值。',
} as const;
