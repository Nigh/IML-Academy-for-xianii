export const exploration = {
  prompt: '最小二乘拟合的残差与模型每列都正交，是否代表每个点都拟合准确？',
  options: [
    {
      text: '代表，正交残差一定为零',
      correct: false,
      observation: '默认三点时，对照残差表和两个列内积。',
    },
    {
      text: '不代表，列空间外仍可有非零残差',
      correct: true,
      observation: '同时看逐点残差和Aᵀr，分辨两个不同条件。',
    },
  ],
  hints: [
    '三个响应组成三维向量，两列模型能覆盖整个三维空间吗？',
    '加入离群点，检查一处误差变化会不会牵动其他点。',
  ],
  explanation:
    '最优残差不能再沿任何模型列缩短，但可以保留非零正交分量。默认三点的SSE为1/6，两个列内积均为0；最小二乘优化总平方和，并非逐点零误差。',
} as const;
