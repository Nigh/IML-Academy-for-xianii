import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-011',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '一层模型如何同时计算多个输出' },
    { id: 'intuition', title: '一格是一次行列匹配' },
    { id: 'mathematics', title: '内维度收缩，外维度保留' },
    { id: 'experiment', title: '编辑矩阵并逐格检查' },
    { id: 'pitfalls', title: '顺序和形状不能省略' },
    { id: 'summary', title: '用形状读懂矩阵乘法' },
  ],
  quiz: [
    {
      id: 'shape',
      version: 1,
      prompt: '2×3的A乘3×2的B，AB的形状是什么？',
      options: [
        { id: 'two', text: '2×2', explanation: '中间的3对应求和轴，保留左行数2与右列数2。' },
        { id: 'three', text: '3×3', explanation: '3×3是此处BA的形状，不能交换保留维度。' },
      ],
      answerId: 'two',
    },
    {
      id: 'order',
      version: 1,
      prompt: 'A是剪切，B是x方向放大2倍。对列向量先执行B再执行A，应写什么？',
      options: [
        { id: 'ab', text: 'ABx', explanation: '矩阵从右向左作用：先Bx，再A(Bx)。' },
        { id: 'ba', text: 'BAx', explanation: 'BAx表示先剪切后缩放，通常得到不同结果。' },
      ],
      answerId: 'ab',
    },
    {
      id: 'elementwise',
      version: 1,
      prompt: '矩阵乘法的一个结果单元格需要哪些数据？',
      options: [
        {
          id: 'dot',
          text: '左矩阵对应行与右矩阵对应列的内积',
          explanation: '沿共同的内维度逐项相乘再求和。',
        },
        {
          id: 'single',
          text: '两矩阵同一位置的单个元素相乘',
          explanation: '这是逐元素乘法，不是矩阵乘法。',
        },
      ],
      answerId: 'dot',
    },
  ],
} satisfies LessonDefinition;
