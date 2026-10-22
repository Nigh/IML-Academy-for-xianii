import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-017',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'motivation', title: '哪些方向在反复变换中最简单' },
    { id: 'intuition', title: '共线可以同向也可以反向' },
    { id: 'mathematics', title: '非零向量与实数条件' },
    { id: 'experiment', title: '旋转输入寻找特征方向' },
    { id: 'pitfalls', title: '实矩阵不保证实特征向量基' },
    { id: 'summary', title: '用不变方向理解变换' },
  ],
  quiz: [
    {
      id: 'axis',
      version: 1,
      prompt: 'diag(2,3)作用在(0,1)ᵀ，特征值是什么？',
      options: [
        { id: 'three', text: '3', explanation: '比较输入输出是否共线。输出(0,3)ᵀ等于原向量3倍。' },
        { id: 'two', text: '2', explanation: '2对应横轴方向，不是纵轴方向。' },
      ],
      answerId: 'three',
    },
    {
      id: 'rotation',
      version: 1,
      prompt: '90°旋转的实特征向量能选为(1,1)吗？',
      options: [
        {
          id: 'no',
          text: '不能，输出(−1,1)与输入不共线',
          explanation: '所有非零输入都转过直角；实数倍不可能实现直角旋转。',
        },
        {
          id: 'yes',
          text: '可以，因为旋转保持长度',
          explanation: '长度保持不等于方向所在直线保持，特征条件要求Av=λv。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'negative',
      version: 1,
      prompt: 'Av=−v且v非零，v是不是特征向量？',
      options: [
        {
          id: 'yes',
          text: '是，特征值−1',
          explanation: '负比例会反向，但仍在同一直线上，符合定义。',
        },
        {
          id: 'no',
          text: '不是，因为箭头方向变了',
          explanation: '特征方向指过原点的直线不变，允许负特征值导致反向。',
        },
      ],
      answerId: 'yes',
    },
  ],
} satisfies LessonDefinition;
