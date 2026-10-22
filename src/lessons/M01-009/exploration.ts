export const exploration = {
  prompt: '目标在(3,2)，小车沿横向轨道移动。走到哪里距离最小？',
  options: [
    {
      text: 't=3，沿横向对齐观测',
      correct: true,
      observation: '比较到观测的距离，别把目标换成到原点的距离。',
    },
    {
      text: 't=0，离原点最近就够了',
      correct: false,
      observation: '保持横轨，用前进和后退按钮比较到目标的距离。',
    },
  ],
  hints: ['小车沿横轨移动时，哪一部分距离始终不能消除？', '横向误差能否降到0？剩下哪项无法消除？'],
  explanation:
    '距离平方为(3−t)²+4，第一项在t=3时为0。最近点(3,0)是投影，剩余距离2；把方向放大只改变系数，不改变整条候选直线。',
} as const;
