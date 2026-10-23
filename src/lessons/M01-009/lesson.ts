import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-009',
  contractVersion: 1,
  status: 'draft',
  sections: [
    { id: 'motivation', title: '小车只能沿直轨走，停在哪里离目标最近？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '移动小车寻找最近停车点' },
    { id: 'intuition', title: '垂足是最近点' },
    { id: 'mathematics', title: '最小距离导出投影' },
    { id: 'pitfalls', title: '系数不是投影向量' },
    { id: 'summary', title: '最近分量与条件' },
  ],
  quiz: [
    {
      id: 'scaled',
      version: 1,
      prompt: '把方向u=(1,0)放大为(2,0)，v=(3,2)不变，投影如何变化？',
      options: [
        {
          id: 'same',
          text: '仍为(3,0)，系数由3变为1.5',
          explanation:
            '把候选点限制在同一条参考直线上。方向张成的直线不变，系数与u的长度反比，二者乘积不变。',
        },
        { id: 'double', text: '变成(6,0)', explanation: '这忽略了公式分母随方向长度平方增加。' },
      ],
      answerId: 'same',
    },
    {
      id: 'zero',
      version: 1,
      prompt: '方向u=0时，投影公式应输出什么？',
      options: [
        {
          id: 'undefined',
          text: '未定义，并说明方向需非零',
          explanation: '分母为零，零向量不提供参考方向；不应伪造一个合法结果。',
        },
        {
          id: 'zero-vector',
          text: '始终输出零向量',
          explanation: '这混淆了未定义方向与合法方向上的零投影。',
        },
      ],
      answerId: 'undefined',
    },
    {
      id: 'sign',
      version: 1,
      prompt: 'v=(−3,2)投影到u=(1,0)，结果是否必须沿u正向？',
      options: [
        {
          id: 'negative',
          text: '不是，结果为(−3,0)',
          explanation: '系数允许为负，投影在整条直线上寻找最近点，不限制在正向射线上。',
        },
        {
          id: 'positive',
          text: '必须，负系数应截为零',
          explanation: '截断系数会变成另一种约束优化问题，不是正交投影到直线。',
        },
      ],
      answerId: 'negative',
    },
  ],
} satisfies LessonDefinition;
