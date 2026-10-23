import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, beforeEach, it, expect, vi } from 'vitest';
import Lesson from './Lesson.svelte';
import { lessonById } from '../../lib/curriculum/catalog.ts';

beforeEach(() =>
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  })),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const setup = () => render(Lesson, { metadata: lessonById.get('M01-002')! });
async function press(
  view: { getByRole: (role: 'button', options: { name: string }) => HTMLElement },
  name: string,
  times = 1,
) {
  for (let i = 0; i < times; i++) await fireEvent.click(view.getByRole('button', { name }));
}

it('整数预测先于终点揭示，改参清理反馈，加减按钮在正负边界禁用', async () => {
  const view = setup();
  const result = view.getByTestId('movement-result');
  expect(result.textContent).not.toContain('(1, 3)');
  await press(view, '增加预测 x');
  await press(view, '增加预测 y', 3);
  await press(view, '标记预测');
  await press(view, '执行下一段');
  expect(result.textContent).toContain('(2, 1)');
  expect(view.queryByTestId('first-route')).toBeTruthy();
  expect(view.queryByTestId('second-route')).toBeNull();
  expect(view.queryByTestId('sum-route')).toBeNull();
  expect(view.queryByTestId('prediction-feedback')).toBeNull();
  await press(view, '执行下一段');
  expect(result.textContent).toContain('(1, 3)');
  expect(view.getByTestId('prediction-feedback').textContent).toContain('一致');
  expect(view.queryByTestId('second-route')).toBeTruthy();
  expect(view.queryByTestId('sum-route')).toBeTruthy();
  await press(view, '增加第一段东西位移');
  expect(view.queryByTestId('prediction-feedback')).toBeNull();
  expect(result.textContent).toContain('(2, 3)');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(0, 0)');
  expect(view.queryByTestId('first-route')).toBeNull();
  expect(view.queryByTestId('second-route')).toBeNull();
  expect(view.queryByTestId('sum-route')).toBeNull();
  await press(view, '增加第一段东西位移', 2);
  expect(view.getByRole('button', { name: '增加第一段东西位移' })).toHaveProperty('disabled', true);
  expect(result.textContent).toContain('(4, 3)');
  await press(view, '减少第一段东西位移', 10);
  expect(view.getByRole('button', { name: '减少第一段东西位移' })).toHaveProperty('disabled', true);
  expect(result.textContent).toContain('(-6, 3)');
  await press(view, '复位实验');
  expect(result.textContent).not.toContain('(1, 3)');
  expect(view.queryByTestId('prediction-feedback')).toBeNull();
});

it('返回不伪造零向量箭头，减少动态效果时执行直接到达正确终点', async () => {
  const view = setup();
  await press(view, '原路返回');
  const result = view.getByTestId('movement-result');
  expect(result.textContent).toContain('(0, 0)');
  expect(result.textContent).toContain('4.47');
  expect(view.queryByTestId('sum-route')).toBeNull();
  await press(view, '改变速度');
  await press(view, '反向两倍速');
  expect(view.getByTestId('velocity-reading').textContent).toContain('(-4, -2) m/s');
  await press(view, '执行 1 秒');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(-4, -2)');
  await press(view, '静止');
  expect(result.textContent).toContain('(0, 0)');
  expect(result.textContent).toContain('方向未定义');
  await press(view, '复位实验');
  expect(view.getByLabelText('速度倍率 k (无量纲)')).toHaveProperty('value', '1');
  expect(result.textContent).toContain('(2, 1)');
});

it('交换已执行指令后隐藏终点并清除预测，重新执行经过交换后的中间点', async () => {
  const view = setup();
  await press(view, '增加预测 x');
  await press(view, '标记预测');
  await press(view, '直接探索');
  await press(view, '执行下一段');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(2, 1)');
  await press(view, '交换两段指令');
  expect(view.getByTestId('movement-result').textContent).not.toContain('(1, 3)');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(0, 0)');
  expect(view.queryByText('我的预测')).toBeNull();
  expect(view.queryByTestId('first-route')).toBeNull();
  expect(view.queryByTestId('second-route')).toBeNull();
  await press(view, '执行下一段');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(-1, 2)');
  await press(view, '执行下一段');
  expect(view.getByTestId('movement-result').textContent).toContain('(1, 3)');
  await fireEvent.click(view.getByLabelText('平行四边形辅助线'));
  expect(view.getByTestId('parallelogram')).toBeTruthy();
});

it('合向量直达与两段移动终点相同，改参清除对照，零合向量保持静止', async () => {
  const view = setup();
  await press(view, '直接探索');
  expect(view.queryByTestId('first-route')).toBeNull();
  expect(view.queryByTestId('second-route')).toBeNull();
  expect(view.queryByTestId('sum-route')).toBeNull();
  await press(view, '执行下一段', 2);
  const endpoint = view.getByTestId('robot-position').getAttribute('aria-label');
  await fireEvent.click(view.getByLabelText('显示总位移（虚线）'));
  await press(view, '沿合向量走一次');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toBe(endpoint);
  expect(view.getByTestId('comparison-feedback').textContent).toContain('两次都到达 (1, 3) m');
  expect(view.getByTestId('movement-result').textContent).toContain('两段路程约 4.47 m');
  expect(view.getByTestId('movement-result').textContent).toContain('直达路程约 3.16 m');
  expect(view.queryByTestId('first-route')).toBeTruthy();
  expect(view.queryByTestId('second-route')).toBeTruthy();
  expect(view.queryByTestId('sum-route')).toBeTruthy();
  await press(view, '增加第一段东西位移');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(0, 0)');
  expect(view.queryByTestId('comparison-feedback')).toBeNull();
  expect(view.queryByTestId('first-route')).toBeNull();
  expect(view.queryByTestId('second-route')).toBeNull();
  expect(view.queryByTestId('sum-route')).toBeNull();
  await press(view, '执行下一段', 2);
  await press(view, '沿合向量走一次');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(2, 3)');
  await press(view, '原路返回');
  await press(view, '执行下一段', 2);
  await press(view, '沿合向量走一次');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(0, 0)');
  expect(view.getByTestId('comparison-feedback').textContent).toContain('合向量为零');
  expect(view.queryByTestId('sum-route')).toBeNull();
});
