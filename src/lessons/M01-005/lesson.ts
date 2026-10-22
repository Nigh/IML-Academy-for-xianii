import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-005',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '权重可以随便调，就一定能命中任意目标吗？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '尝试命中目标' },
    { id: 'intuition', title: '固定方向，改变系数' },
    { id: 'mathematics', title: '从一次组合到整个张成空间' },
    { id: 'pitfalls', title: '更多向量不一定增加方向' },
    { id: 'summary', title: '张成描述表达能力' },
  ],
  quiz: [
    {
      id: 'coefficients',
      version: 1,
      prompt: '用 (1,0) 与 (0,1) 生成 (3,−2)，系数应是什么？',
      options: [
        {
          id: 'right',
          text: '3 和 −2',
          explanation:
            '先判断目标是否属于可达集合，再调系数。第一向量提供全部 x 分量，第二向量提供全部 y 分量，逐分量相加得到目标。',
        },
        {
          id: 'positive',
          text: '3 和 2',
          explanation: '第二系数为正会生成 y=2，方向与目标的 y 分量相反。',
        },
      ],
      answerId: 'right',
    },
    {
      id: 'redundancy',
      version: 1,
      prompt: '已有 (1,1)，加入 (2,2) 后是否可以表示 (1,0)？',
      options: [
        {
          id: 'no',
          text: '不能，所有组合的两个分量仍相等',
          explanation: '任何组合都形如 (a+2b,a+2b)，无法同时等于1和0。',
        },
        {
          id: 'yes',
          text: '可以，因为两个向量一定张成二维',
          explanation: '向量数量不是独立方向数量，新增向量只是原向量的倍数。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'grid',
      version: 1,
      prompt: '图中只画了25组整数系数的点，张成空间是否只有25个点？',
      options: [
        {
          id: 'infinite',
          text: '不是，定义允许任意实数系数',
          explanation: '离散网格只是有限显示；独立方向张成整个平面，共线方向张成整条直线。',
        },
        {
          id: 'finite',
          text: '是，显示了多少点就有多少可能输出',
          explanation: '这把有限可视化范围误当成数学定义。',
        },
      ],
      answerId: 'infinite',
    },
  ],
} satisfies LessonDefinition;
