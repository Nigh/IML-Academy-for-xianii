export const exploration = {
  prompt: '(3,)和(4,)相加，会自动得到3×4表吗？',
  options: [
    {
      text: '不会，尾轴3与4冲突',
      correct: true,
      observation: '比较两个一维形状与显式行列形状的来源索引。',
    },
    {
      text: '会，两个向量自动沿不同轴扩展',
      correct: false,
      observation: '对照(3,1)+(1,4)与不兼容的一维场景。',
    },
  ],
  hints: [
    '先把两个形状靠右写齐，不要自动调换它们的轴。',
    '某轴只有一个元素时，输出在这根轴上复用哪个索引？',
  ],
  explanation:
    '一维形状末轴3与4不兼容；(3,1)+(1,4)逐轴兼容，得到(3,4)。广播只按长度和位置配对，单例轴始终读取来源索引0。',
} as const;
