export const exploration = {
  prompt: '保持两向量方向，只把b放大2倍，点积会怎样？',
  options: [
    {
      text: '点积放大2倍，夹角不变',
      correct: true,
      observation: '把点积和夹角两项分开比较，避免把长度影响归给方向。',
    },
    {
      text: '点积不变，因为方向没变',
      correct: false,
      observation: '选择平行预设，将b从(4,0)改为(2,0)。',
    },
  ],
  hints: ['对应分量的两个乘积各怎样变化？', '再比较除以两个向量长度乘积后的比值。'],
  explanation:
    '点积对b线性，放大2倍使每项乘积都放大2倍。余弦相似度的分母也放大2倍，故非零向量的方向分数不变。',
} as const;
