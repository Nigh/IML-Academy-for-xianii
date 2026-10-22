import type { LessonDefinition } from '../../lib/lesson/contract.ts';
export default {
  id: 'M01-020',
  contractVersion: 1,
  status: 'ready',
  sections: [
    { id: 'motivation', title: '无法同时穿过每个观测' },
    { id: 'intuition', title: '观测空间中的正交投影' },
    { id: 'mathematics', title: '最优性条件与线性拟合' },
    { id: 'experiment', title: '三点残差与离群点影响' },
    { id: 'pitfalls', title: '整体最优不等于逐点最优' },
    { id: 'summary', title: '把残差与模型方向分开' },
  ],
  quiz: [
    {
      id: 'normal',
      version: 1,
      prompt: '最小二乘得到Aᵀr≈0，是否表示每个r_i≈0？',
      options: [
        {
          id: 'no',
          text: '不是，残差只需与全部模型列正交',
          explanation: '三点不共线时残差非零，仍可与常数列和输入列正交。',
        },
        {
          id: 'yes',
          text: '是，每个观测都精确拟合',
          explanation: 'Aᵀr=0不等于r=0；列空间外仍可能有非零残差。',
        },
      ],
      answerId: 'no',
    },
    {
      id: 'outlier',
      version: 1,
      prompt: '一个残差从1增至3，其平方损失贡献怎样变？',
      options: [
        {
          id: 'nine',
          text: '从1增至9',
          explanation: '平方使大残差影响迅速增加，可能牵动整条拟合线。',
        },
        { id: 'three', text: '从1增至3', explanation: '这是绝对误差，不是平方误差。' },
      ],
      answerId: 'nine',
    },
    {
      id: 'unique',
      version: 1,
      prompt: '何时(AᵀA)⁻¹Aᵀb可用于唯一最小二乘解？',
      options: [
        {
          id: 'full',
          text: 'A满列秩时',
          explanation: '此时AᵀA正定可逆；否则可用伪逆找最小范数解，不能强行求逆。',
        },
        {
          id: 'any',
          text: '只要观测数大于参数数就可以',
          explanation: '观测多不保证模型列独立，重复或常数输入仍可能降秩。',
        },
      ],
      answerId: 'full',
    },
  ],
} satisfies LessonDefinition;
