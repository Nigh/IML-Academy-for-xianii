import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-013',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '矩阵有两列，就一定保留两份独立信息吗？' },
    { id: 'learning-path', title: '接上已有知识' },
    { id: 'experiment', title: '逐步缩小一个方向' },
    { id: 'intuition', title: '列空间决定可达输出' },
    { id: 'mathematics', title: '精确秩与阈值下的数值秩' },
    { id: 'pitfalls', title: '图形和容差的边界' },
    { id: 'summary', title: '秩回答独立方向数量' },
  ],
  quiz: [
    {
      id: 'columns',
      version: 1,
      prompt: '[[1,2],[2,4]]为什么秩为1？',
      options: [
        {
          id: 'one',
          text: '第二列是第一列的2倍，且第一列非零',
          explanation:
            '计算独立方向，而不是统计矩阵元素。所有输出都在(1,2)张成的直线上，只有一个独立方向。',
        },
        {
          id: 'two',
          text: '因为有两行两列，所以秩2',
          explanation: '形状只给秩的上界，不能保证列独立。',
        },
      ],
      answerId: 'one',
    },
    {
      id: 'threshold',
      version: 1,
      prompt: 'diag(1,1e−8)用相对阈值1e−6计算，精确秩与数值秩分别是多少？',
      options: [
        {
          id: 'different',
          text: '2和1',
          explanation: '两个奇异值非零，所以精确秩2；较小值未超过1e−6的阈值，被数值秩规则舍弃。',
        },
        { id: 'both', text: '都为1', explanation: '不能把“小于阈值”与数学上“恰好为零”混为一谈。' },
      ],
      answerId: 'different',
    },
    {
      id: 'noise',
      version: 1,
      prompt: '换一个数值秩容差就可能改变结论，这是否说明矩阵数学上变了？',
      options: [
        {
          id: 'no',
          text: '不是，改变的是可分辨尺度的判定',
          explanation: '矩阵未改，算法对小方向的取舍改变；容差应结合测量噪声与数据尺度说明。',
        },
        {
          id: 'yes',
          text: '是，容差会自动修改原矩阵',
          explanation: '本课数值秩只进行阈值计数，并未替换矩阵元素。',
        },
      ],
      answerId: 'no',
    },
  ],
} satisfies LessonDefinition;
