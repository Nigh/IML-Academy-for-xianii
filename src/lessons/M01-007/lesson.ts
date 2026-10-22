import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-007',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '检索分数变大，是方向更接近，还是特征变长了？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '先预测符号，再移动端点' },
    { id: 'intuition', title: '把一个箭头投到另一个方向' },
    { id: 'mathematics', title: '把投影写成公式' },
    { id: 'pitfalls', title: '点积不是纯粹的方向分数' },
    { id: 'engineering', title: '从传感器投影到线性层' },
    { id: 'summary', title: '带走四个结论' },
  ],
  quiz: [
    {
      id: 'angle',
      version: 1,
      prompt: '将非零 b 放大两倍，a 不变，夹角和点积如何变化？',
      options: [
        {
          id: 'a',
          text: '夹角不变，点积加倍',
          explanation: '先算对应分量乘积，再求和。正数缩放保持方向；点积对 b 线性。',
        },
        {
          id: 'b',
          text: '夹角减半，点积不变',
          explanation: '缩放改变长度，不改变方向。',
        },
      ],
      answerId: 'a',
    },
    {
      id: 'zero',
      version: 1,
      prompt: 'a 非零而 b=0 时，哪些计算仍合法？',
      options: [
        {
          id: 'a',
          text: '点积为零，夹角与在 b 上的投影未定义',
          explanation: '点积逐分量相乘始终有定义；方向与投影需要非零参考向量。',
        },
        {
          id: 'b',
          text: '点积为零，夹角为 90°',
          explanation: '零向量没有方向，不能赋予它直角。',
        },
      ],
      answerId: 'a',
    },
    {
      id: 'projection',
      version: 1,
      prompt: 'a=(2,3)，b=(1,0)，a 在 b 上的投影是什么？',
      options: [
        {
          id: 'a',
          text: '(2,0)',
          explanation: '保留 x 方向分量，残差 (0,3) 与 b 正交。',
        },
        {
          id: 'b',
          text: '(0,3)',
          explanation: '(0,3) 是残差而非投影。',
        },
      ],
      answerId: 'a',
    },
  ],
} satisfies LessonDefinition;
