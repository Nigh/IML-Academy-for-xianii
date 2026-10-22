import { finite } from '../../lib/math/vector.ts';
export const presets = [
  {
    id: 'metres',
    name: '场景一：(3,4) 的范数',
    description: '同单位位移的L2长度5m，L1轴向路程7m。',
    factor: 1,
  },
  {
    id: 'millimetres',
    name: '场景二：第一特征改用毫米',
    description: '物理位移不变，错误的混合单位数值分数改变；按尺度归一化后不变。',
    factor: 1000,
  },
] as const;
export function experiment(x: number, y: number, factor: number, sx: number, sy: number) {
  finite(x, y, factor, sx, sy);
  if (
    Math.abs(x) > 5 ||
    Math.abs(y) > 5 ||
    ![1, 1000].includes(factor) ||
    sx < 0.1 ||
    sx > 10 ||
    sy < 0.1 ||
    sy > 10
  )
    throw new RangeError('分量±5m；尺度0.1至10m；单位因子只能为1或1000。');
  return {
    l1: Math.abs(x) + Math.abs(y),
    l2: Math.hypot(x, y),
    shownX: x * factor,
    rawL2: Math.hypot(x * factor, y),
    normalizedL1: Math.abs(x / sx) + Math.abs(y / sy),
    normalizedL2: Math.hypot(x / sx, y / sy),
    range: 1.4 * Math.max(1, Math.abs(x), Math.abs(y)),
  };
}
