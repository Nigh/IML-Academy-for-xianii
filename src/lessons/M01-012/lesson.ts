import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-012',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '改变印章形状，内部标记会去哪里？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '变形印章，再核对矩阵与网格' },
    { id: 'intuition', title: '看两根基向量去哪里' },
    { id: 'mathematics', title: '列向量决定整个映射' },
    { id: 'pitfalls', title: '线性与平移的边界' },
    { id: 'summary', title: '从基向量读变换' },
  ],
  quiz: [
    {
      id: 'stretch',
      version: 1,
      prompt: 'diag(2,1)作用于(1,1)，输出是什么？',
      options: [
        {
          id: 'right',
          text: '(2,1)',
          explanation:
            '从两根单位方向的输出检查。第一坐标乘2，第二坐标乘1；不是所有方向都等比例放大。',
        },
        { id: 'uniform', text: '(2,2)', explanation: '这对应diag(2,2)，不是题目的非均匀缩放。' },
      ],
      answerId: 'right',
    },
    {
      id: 'origin',
      version: 1,
      prompt: '通常矩阵乘法能否把零向量移到非零位置？',
      options: [
        {
          id: 'no',
          text: '不能，A0=0',
          explanation: '每个分量都是矩阵行与零向量的内积，结果为零。平移需要仿射项。',
        },
        {
          id: 'yes',
          text: '能，调节非对角元素即可',
          explanation: '非对角元素能剪切或混合坐标，不能改变零输入的结果。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'columns',
      version: 1,
      prompt: '只知道二维矩阵两列的含义，是否足以知道任意输入的输出？',
      options: [
        {
          id: 'yes',
          text: '是，输入分量就是对两列的组合系数',
          explanation: 'x=x₁e₁+x₂e₂；线性性使Ax=x₁Ae₁+x₂Ae₂。',
        },
        {
          id: 'no',
          text: '不是，还需要逐个记录每个输入',
          explanation: '这忽略了线性性；两根基的像已决定整个线性映射。',
        },
      ],
      answerId: 'yes',
    },
  ],
} satisfies LessonDefinition;
