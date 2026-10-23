import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-018',
  contractVersion: 1,
  status: 'draft',
  sections: [
    { id: 'motivation', title: '没有实特征方向的旋转，还能拆成简单步骤吗？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '逐步观察单位圆的像' },
    { id: 'intuition', title: '换轴、拉伸、再换轴' },
    { id: 'mathematics', title: '正交因子与非负奇异值' },
    { id: 'pitfalls', title: '奇异值不是带符号的特征值' },
    { id: 'summary', title: '统一描述线性映射的伸缩' },
  ],
  quiz: [
    {
      id: 'diagonal',
      version: 1,
      prompt: 'diag(3,1)的两个奇异值是什么？',
      options: [
        {
          id: 'yes',
          text: '3和1',
          explanation: '比较单位方向变换前后的长度。AᵀA=diag(9,1)，非负平方根为3和1。',
        },
        { id: 'squares', text: '9和1', explanation: '9是AᵀA的特征值，取平方根后才是A的奇异值。' },
      ],
      answerId: 'yes',
    },
    {
      id: 'rank',
      version: 1,
      prompt: 'σ₁=3、σ₂=0时，二维单位圆的像是什么？',
      options: [
        {
          id: 'line',
          text: '沿第一左奇异方向的线段',
          explanation: '一个主方向完全被消去，秩1，椭圆退化为线段。',
        },
        {
          id: 'ellipse',
          text: '仍有非零宽度的椭圆',
          explanation: '第二半轴长度正是0，不能人为添加宽度。',
        },
      ],
      answerId: 'line',
    },
    {
      id: 'negative',
      version: 1,
      prompt: 'diag(−3,1)中的负号在SVD里如何体现？',
      options: [
        {
          id: 'orthogonal',
          text: '由正交因子中的反射体现，奇异值仍3和1',
          explanation: '奇异值是非负伸缩，方向反转留给U或V。',
        },
        {
          id: 'negative',
          text: '产生负奇异值−3',
          explanation: '定义规定奇异值非负；它们不必等于带符号的特征值。',
        },
      ],
      answerId: 'orthogonal',
    },
  ],
} satisfies LessonDefinition;
