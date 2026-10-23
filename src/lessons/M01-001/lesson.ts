import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-001',
  contractVersion: 1,
  status: 'draft',
  sections: [
    { id: 'motivation', title: '配送车没有移动，导航仪读数为什么变了？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '先设置配送终点，再转动导航仪' },
    { id: 'intuition', title: '向量与它的坐标不是同一件事' },
    { id: 'mathematics', title: '分量来自基向量' },
    { id: 'pitfalls', title: '表示的边界' },
    { id: 'engineering', title: '从位置记录到 ML 特征' },
    { id: 'summary', title: '带走四个结论' },
  ],
  quiz: [
    {
      id: 'rotating-frame',
      version: 1,
      prompt: '位移在原坐标中为 (3,4)m。坐标轴逆时针旋转 90°、物理位移不动，新分量是什么？',
      options: [
        {
          id: 'passive',
          text: '(4,−3)m，长度仍为 5m',
          explanation:
            '先区分位移本身与它的坐标表示。新 x 轴沿旧 y 轴，新 y 轴沿旧负 x 轴；被动坐标变换不改变物理长度。',
        },
        {
          id: 'active',
          text: '(−4,3)m，长度仍为 5m',
          explanation: '这是保持坐标轴不动、主动旋转位移 90° 的结果，与题目的操作不同。',
        },
        {
          id: 'same',
          text: '(3,4)m，分量不会改变',
          explanation: '物理向量不变不代表坐标不变；分量依赖选定的基。',
        },
      ],
      answerId: 'passive',
    },
    {
      id: 'scalar',
      version: 1,
      prompt: '温度 25°C 与位移长度 5m 都是标量。这是否说明位移也只需一个数？',
      options: [
        {
          id: 'no',
          text: '不能，长度没有记录位移的方向',
          explanation: '同样长的位移可以指向不同方向；平面位移需要两个分量及其坐标约定。',
        },
        {
          id: 'yes',
          text: '能，所有物理量只要大小就够了',
          explanation: '温度是标量，但位移包含方向；二者的信息结构不同。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'zero',
      version: 1,
      prompt: '零位移的方向应如何报告？',
      options: [
        {
          id: 'undefined',
          text: '方向未定义',
          explanation: '零向量没有唯一方向，不能把默认的 0° 当作数学结果。',
        },
        {
          id: 'east',
          text: '固定为沿 x 轴的 0°',
          explanation: '沿 x 轴是一个有方向的约定，零向量自身并不提供它。',
        },
      ],
      answerId: 'undefined',
    },
  ],
} satisfies LessonDefinition;
