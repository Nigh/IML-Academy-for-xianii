import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-003',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '一段数据属于谁、何时、哪个通道' },
    { id: 'intuition', title: '轴是数据的地址' },
    { id: 'mathematics', title: '阶数、形状与索引' },
    { id: 'experiment', title: '切开三阶张量' },
    { id: 'pitfalls', title: '元素数不决定语义' },
    { id: 'summary', title: '把形状写进数据协议' },
  ],
  quiz: [
    {
      id: 'same-count',
      version: 1,
      prompt: '(2,3,4) 与 (3,2,4) 都有 24 个元素，是否可以不改数据协议直接交换使用？',
      options: [
        {
          id: 'no',
          text: '不能，批次与时间轴的语义和索引解释不同',
          explanation: '乘积相同只保证元素数相同，不保证每个位置代表同一个批次和时刻。',
        },
        {
          id: 'yes',
          text: '能，模型只看元素总数',
          explanation: '模型通常对特定轴进行运算，批次与时间混淆会改变其行为。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'channels',
      version: 1,
      prompt: '8 批、100 时刻的时序，通道从 1 变为 3，元素数和 float32 原始数据字节数是多少？',
      options: [
        {
          id: 'triple',
          text: '2400 个元素，9600 字节',
          explanation: '8×100×3=2400；float32 每元素4字节。这里不计对象和框架额外开销。',
        },
        {
          id: 'same',
          text: '800 个元素，3200 字节',
          explanation: '这是单通道的数量，忽略了新增两个通道。',
        },
      ],
      answerId: 'triple',
    },
    {
      id: 'order',
      version: 1,
      prompt: '形状 (8,100,1) 中最后一轴长度为 1，张量阶数是多少？',
      options: [
        { id: 'three', text: '3 阶', explanation: '阶数是轴的个数；长度为1的轴仍是一个轴。' },
        {
          id: 'two',
          text: '2 阶',
          explanation: '只有显式移除长度为1的轴后才是2阶，该操作也改变形状协议。',
        },
      ],
      answerId: 'three',
    },
  ],
} satisfies LessonDefinition;
