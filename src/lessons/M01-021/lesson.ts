import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-021',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '给每个通道加偏置，不写三重循环' },
    { id: 'intuition', title: '从最后一轴开始对齐' },
    { id: 'mathematics', title: '兼容条件与索引映射' },
    { id: 'experiment', title: '追踪每个输出来自哪里' },
    { id: 'pitfalls', title: '广播只懂形状，不懂轴的名字' },
    { id: 'summary', title: '先检查轴，再检查语义' },
  ],
  quiz: [
    {
      id: 'channels',
      version: 1,
      prompt: '(2,3,4)张量与(4,)偏置相加，输出形状是什么？',
      options: [
        {
          id: 'same',
          text: '(2,3,4)',
          explanation: '尾轴4匹配，缺失前轴视为1，偏置跨批次与时间复用。',
        },
        { id: 'append', text: '(2,3,4,4)', explanation: '逐元素广播不会自动增加一个新尾轴。' },
      ],
      answerId: 'same',
    },
    {
      id: 'outer',
      version: 1,
      prompt: '为何(3,1)+(1,4)可行，而(3,)+(4,)不可行？',
      options: [
        {
          id: 'one',
          text: '前者逐轴有1可扩展，后者尾轴3与4冲突',
          explanation: '广播要求对应长度相同或至少一个为1，不是只看元素总数。',
        },
        {
          id: 'any',
          text: '广播能自动把任意两个向量变成外和',
          explanation: '需要显式插入单例轴，两个一维向量不会自动成为行列向量。',
        },
      ],
      answerId: 'one',
    },
    {
      id: 'semantics',
      version: 1,
      prompt: '时间轴与通道轴都长3时，(3,)偏置会自动加到你想要的轴吗？',
      options: [
        {
          id: 'no',
          text: '不会，它对齐最后一轴',
          explanation:
            '广播不理解时间或通道语义；若想沿中间轴加偏置，必须显式reshape为(1,3,1)等相容形状。',
        },
        {
          id: 'yes',
          text: '会根据变量名推断',
          explanation: '普通广播只检查轴长度，不读取变量业务名称。',
        },
      ],
      answerId: 'no',
    },
  ],
} satisfies LessonDefinition;
