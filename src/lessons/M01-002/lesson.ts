import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-002',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '两段路都走了，为什么还能回到原点？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '给移动平台安排两段路线' },
    { id: 'intuition', title: '把箭头首尾相接' },
    { id: 'mathematics', title: '回到数学定义' },
    { id: 'pitfalls', title: '长度不能代替方向' },
    { id: 'engineering', title: '工程中的同一条规则' },
    { id: 'summary', title: '带走四个结论' },
  ],
  quiz: [
    {
      id: 'cancellation',
      version: 1,
      prompt: '位移 a=(2,−1)m，b=(−2,1)m。合位移与走过的路径长度分别是什么？',
      options: [
        {
          id: 'zero',
          text: '合位移为 (0,0)m，路径长度为 2√5m',
          explanation:
            '先逐分量相加，再比较长度。两段位移完全抵消，但路径长度仍为两段各 √5m 的路程之和。位移与路程描述的是不同的物理量。',
        },
        {
          id: 'both-zero',
          text: '合位移为 (0,0)m，路径长度为 0m',
          explanation: '合位移为零只说明回到起点，不代表没有运动。每段路程都是 √5m。',
        },
        {
          id: 'sum-length',
          text: '合位移的长度与路径长度都是 2√5m',
          explanation: '长度相加只给出沿路径走过的路程。两个方向相反的位移相加时，合位移为零。',
        },
      ],
      answerId: 'zero',
    },
    {
      id: 'negative-scale',
      version: 1,
      prompt: 'a=(2,1)m，k=−2。k a 是什么？',
      options: [
        { id: 'both', text: '(−4,−2)m', explanation: '每个分量都乘−2，长度变成2倍并反向。' },
        { id: 'one', text: '(−4,1)m', explanation: '数乘同时作用于全部分量，不能只改变横分量。' },
      ],
      answerId: 'both',
    },
    {
      id: 'units',
      version: 1,
      prompt: '两段位移分别用m和mm记录，相加前必须怎样处理？',
      options: [
        {
          id: 'convert',
          text: '统一单位并确认坐标系相同',
          explanation: '逐分量相加要求同一基和同一单位，需先换算和变换。',
        },
        {
          id: 'direct',
          text: '按原数字直接相加',
          explanation: '相同数字在m和mm中对应不同位移，直接加会改变实际含义。',
        },
      ],
      answerId: 'convert',
    },
    {
      id: 'route-order',
      version: 1,
      prompt:
        '绘图平台必须先到 P 再到 Q。交换两段非平行位移后，虽然仍到 Q，是否完成原任务？说明判断依据。',
      options: [
        {
          id: 'path',
          text: '没有：第一段末端改变，原目标路线没有完成',
          explanation:
            '向量加法交换律只保证终点相同。先到 P 是路径约束，必须另外检查第一段末端；可在任务台交换指令验证。',
        },
        {
          id: 'end',
          text: '完成：合向量相同就代表路线相同',
          explanation:
            '合向量只记录起点到终点的变化，丢失中间路径。两段非平行位移交换后，中间点不同。',
        },
      ],
      answerId: 'path',
    },
  ],
} satisfies LessonDefinition;
