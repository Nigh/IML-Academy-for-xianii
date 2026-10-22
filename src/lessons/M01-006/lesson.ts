import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-006',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '删去一个特征，模型的表达能力一定下降吗？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '寻找非平凡零组合' },
    { id: 'intuition', title: '能抵消的贡献揭示冗余' },
    { id: 'mathematics', title: '相关、独立与基' },
    { id: 'pitfalls', title: '数量与维数的区别' },
    { id: 'summary', title: '用最少方向完整表示' },
  ],
  quiz: [
    {
      id: 'dependent',
      version: 1,
      prompt: 'u=(1,0)，v=(2,0)，哪组系数证明相关？',
      options: [
        {
          id: 'nontrivial',
          text: '−2和1',
          explanation:
            '检查能否用已有方向替代它。−2u+v=0，且系数不全为零，证明一个方向可由另一个表示。',
        },
        {
          id: 'zero',
          text: '0和0',
          explanation: '任何向量组都满足全零组合，不能据此区分相关与独立。',
        },
      ],
      answerId: 'nontrivial',
    },
    {
      id: 'third',
      version: 1,
      prompt: '在二维空间的两个基向量之外再加一个向量，能否得到三向量基？',
      options: [
        {
          id: 'no',
          text: '不能，第三向量已有唯一的二基展开',
          explanation: '把展开移到同一边就得到非平凡零组合，三个向量相关。',
        },
        {
          id: 'yes',
          text: '能，更多向量使基更完整',
          explanation: '基既要张成又要独立，冗余方向破坏独立性。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'line',
      version: 1,
      prompt: '只含 (1,0) 的向量组是不是基？',
      options: [
        {
          id: 'relative',
          text: '是 x 轴子空间的基，但不是 R² 的基',
          explanation: '基总是相对于指定空间：该向量独立且张成x轴，却不能生成非零y分量。',
        },
        {
          id: 'absolute',
          text: '任何基都至少需要两个向量',
          explanation: '一维空间的基恰好含一个非零向量。',
        },
      ],
      answerId: 'relative',
    },
  ],
} satisfies LessonDefinition;
