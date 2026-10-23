import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-002',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '给机器人安排两段移动' },
    { id: 'experiment', title: '两段移动后的终点' },
    { id: 'intuition', title: '把两段位移首尾相接' },
    { id: 'pitfalls', title: '原路返回时，路程仍然大于零' },
    { id: 'speed', title: '运行时间相同，改变速度' },
    { id: 'mathematics', title: '用分量计算位移和长度' },
    { id: 'engineering', title: '换一条路线，还能完成取货吗' },
    { id: 'summary', title: '合并指令时记住四件事' },
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
      version: 2,
      prompt: '参考速度 v₀=(2,1) 米/秒，速度倍率 k=−2，匀速运行 1 秒。位移和路程怎样变化？',
      options: [
        {
          id: 'both',
          text: '位移为 (−4,−2) 米，路程为参考运动的两倍',
          explanation: '固定正时长 T=1 秒，位移是 k v₀T。两个分量都乘 −2，方向反转，路程乘 |k|=2。',
        },
        {
          id: 'one',
          text: '位移为 (−4,1) 米，只改变东西方向',
          explanation: '速度倍率作用于整个速度向量，南北分量也要乘 −2。',
        },
        {
          id: 'same-distance',
          text: '位移为 (−2,−1) 米，反向但路程不变',
          explanation: '这对应 k=−1。k=−2 不仅反向，速率也变为两倍；运行时间相同，路程随之加倍。',
        },
        {
          id: 'negative-time',
          text: '需要运行 −2 秒，才能表示反向',
          explanation: 'T 始终固定为正的 1 秒。负号属于速度倍率，表示运动方向反转，不表示负时间。',
        },
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
      version: 2,
      prompt:
        '机器人从原点出发，先按 (2,1) 米到取货点，再按 (−1,2) 米到终点。交换这两段指令后，终点相同，取货任务完成了吗？',
      options: [
        {
          id: 'path',
          text: '没有：还需要经过原取货点，终点相同不够',
          explanation:
            '交换律只保证总位移不变。取货要求约束了中间路径，交换指令后还要检查是否经过原取货点。',
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
