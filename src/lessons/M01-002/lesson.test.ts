import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import { lessonById } from '../../lib/curriculum/catalog.ts';

afterEach(cleanup);
const setup = () => render(Lesson, { metadata: lessonById.get('M01-002')! });

it('预测先于终点揭示，逐段执行可核对预测，改参清理过期反馈', async () => {
  const view = setup();
  const result = view.getByTestId('movement-result');
  expect(result.textContent).not.toContain('(1, 3)');
  expect(view.queryByTestId('second-route')).toBeNull();
  await fireEvent.input(view.getByLabelText('预测 x (m)'), { target: { value: '1' } });
  await fireEvent.input(view.getByLabelText('预测 y (m)'), { target: { value: '3' } });
  await fireEvent.click(view.getByRole('button', { name: '标记预测' }));
  await fireEvent.click(view.getByRole('button', { name: '执行下一段' }));
  expect(result.textContent).toContain('(2, 1)');
  expect(view.queryByTestId('prediction-feedback')).toBeNull();
  await fireEvent.click(view.getByRole('button', { name: '执行下一段' }));
  expect(result.textContent).toContain('(1, 3)');
  expect(view.getByTestId('prediction-feedback').textContent).toContain('一致');
  await fireEvent.input(view.getByLabelText('第一段东西位移 (m)'), { target: { value: '3' } });
  expect(view.queryByTestId('prediction-feedback')).toBeNull();
  expect(result.textContent).toContain('(2, 3)');
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(0, 0)');
  await fireEvent.input(view.getByLabelText('第一段东西位移 (m)'), { target: { value: '100' } });
  expect(view.getByLabelText('第一段东西位移 (m)').getAttribute('aria-invalid')).toBe('true');
  expect(result.textContent).toContain('(2, 3)');
  await fireEvent.click(view.getByRole('button', { name: '复位实验' }));
  expect(result.textContent).not.toContain('(1, 3)');
  expect(view.queryByTestId('prediction-feedback')).toBeNull();
});

it('返回场景不伪造零向量箭头，速度倍率有物理单位且切换复位', async () => {
  const view = setup();
  await fireEvent.click(view.getByRole('button', { name: '原路返回' }));
  const result = view.getByTestId('movement-result');
  expect(result.textContent).toContain('(0, 0)');
  expect(result.textContent).toContain('4.47');
  expect(view.queryByTestId('sum-route')).toBeNull();
  await fireEvent.click(view.getByRole('button', { name: '改变速度' }));
  await fireEvent.click(view.getByRole('button', { name: '反向两倍速' }));
  expect(view.getByTestId('velocity-reading').textContent).toContain('(-4, -2) m/s');
  expect(result.textContent).toContain('(-4, -2) m');
  expect(result.textContent).toContain('4.47');
  await fireEvent.click(view.getByRole('button', { name: '执行 1 秒' }));
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(-4, -2)');
  await fireEvent.click(view.getByRole('button', { name: '静止' }));
  expect(result.textContent).toContain('(0, 0)');
  expect(result.textContent).toContain('方向未定义');
  await fireEvent.click(view.getByRole('button', { name: '复位实验' }));
  expect(view.getByLabelText('速度倍率 k (无量纲)')).toHaveProperty('value', '1');
  expect(result.textContent).toContain('(2, 1)');
});

it('交换指令保留终点但改变中间点，同图显示辅助构造', async () => {
  const view = setup();
  await fireEvent.click(view.getByRole('button', { name: '直接探索' }));
  await fireEvent.click(view.getByRole('button', { name: '执行下一段' }));
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(2, 1)');
  await fireEvent.click(view.getByRole('button', { name: '交换两段指令' }));
  expect(view.getByTestId('movement-result').textContent).toContain('(1, 3)');
  await fireEvent.click(view.getByRole('button', { name: '执行下一段' }));
  expect(view.getByTestId('robot-position').getAttribute('aria-label')).toContain('(-1, 2)');
  await fireEvent.click(view.getByLabelText('平行四边形辅助线'));
  expect(view.getByTestId('parallelogram')).toBeTruthy();
});
