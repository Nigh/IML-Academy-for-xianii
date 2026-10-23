import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-001',
  contractVersion: 1,
  status: 'draft',
  sections: [
    { id: 'motivation', title: '给机器人指定终点' },
    { id: 'experiment', title: '移动机器人，再换一套坐标轴' },
    { id: 'intuition', title: '长度相同，终点也可以不同' },
    { id: 'mathematics', title: '用两个分量记录位移' },
    { id: 'frame', title: '只转坐标轴，机器人不动' },
    { id: 'pitfalls', title: '零位移与负数怎么读' },
    { id: 'engineering', title: '记录坐标时写清方向和单位' },
    { id: 'summary', title: '记住位移的四个要点' },
  ],
  quiz: [
    {
      id: 'rotating-frame',
      version: 2,
      prompt: '机器人位移在地图中为 (2,1) 米。只把坐标轴逆时针转 90°，机器人不动，新分量是多少？',
      options: [
        {
          id: 'passive',
          text: '(1,−2) 米，长度仍为 √5 米',
          explanation:
            '新 x 轴向北，读到 1 米；新 y 轴向西，向东的 2 米沿其反向，所以读到 −2 米。位移没变，长度仍为 √5 米。',
        },
        {
          id: 'active',
          text: '(−1,2) 米，长度仍为 √5 米',
          explanation:
            '这是把位移箭头逆时针转 90° 才会得到的分量；题目只转坐标轴，机器人没有移动。',
        },
        {
          id: 'same',
          text: '(2,1) 米，分量不会改变',
          explanation: '换了读数方向，同一位移的分量一般会改变。要沿新坐标轴读数。',
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
