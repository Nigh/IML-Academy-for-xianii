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
const setup = () => render(Lesson, { metadata: lessonById.get('M01-001')! });
async function press(
  view: { getByRole: (role: 'button', options: { name: string }) => HTMLElement },
  name: string,
  times = 1,
) {
  for (let i = 0; i < times; i++) await fireEvent.click(view.getByRole('button', { name }));
}

it('同长异向有不同终点，改参清除已完成的箭头和等距离圆', async () => {
  const view = setup();
  expect(view.queryByTestId('intro-vector')).toBeNull();
  await press(view, '执行移动（1 秒）');
  expect(view.getByTestId('intro-robot').getAttribute('aria-label')).toContain('(3, 4)');
  expect(view.getByTestId('intro-length').textContent).toBe('5 m');
  await fireEvent.click(view.getByLabelText('显示相同距离的位置（点线圆）'));
  const radius = view.getByTestId('same-distance-circle').getAttribute('r');
  await press(view, '西北方向');
  expect(view.getByTestId('intro-robot').getAttribute('aria-label')).toContain('(0, 0)');
  expect(view.queryByTestId('intro-vector')).toBeNull();
  expect(view.queryByTestId('same-distance-circle')).toBeNull();
  await press(view, '执行移动（1 秒）');
  expect(view.getByTestId('intro-robot').getAttribute('aria-label')).toContain('(-3, 4)');
  expect(view.getByTestId('intro-length').textContent).toBe('5 m');
  expect(view.getByTestId('same-distance-circle').getAttribute('r')).toBe(radius);
});

it('换读数坐标只改变分量，机器人和位移端点保持原位，回正清理旧反馈', async () => {
  const view = setup();
  await press(view, '执行移动（1 秒）');
  const robot = view.getByTestId('intro-robot').getAttribute('aria-label');
  const arrow = view.getByTestId('intro-vector');
  const endpoint = [arrow.getAttribute('x2'), arrow.getAttribute('y2')];
  await press(view, '换坐标轴');
  await press(view, '长度改变');
  await press(view, '坐标轴逆时针转 90°');
  expect(view.getByTestId('intro-components').textContent).toContain('(4, -3) m');
  expect(view.getByTestId('axis-feedback').textContent).toContain('(4, -3) m');
  expect(view.getByTestId('intro-length').textContent).toBe('5 m');
  expect(view.getByTestId('intro-robot').getAttribute('aria-label')).toBe(robot);
  expect([arrow.getAttribute('x2'), arrow.getAttribute('y2')]).toEqual(endpoint);
  await press(view, '坐标轴逆时针转 90°');
  expect(view.getByTestId('intro-components').textContent).toContain('(-3, -4) m');
  await press(view, '坐标轴回正');
  expect(view.getByTestId('intro-components').textContent).toContain('(3, 4) m');
  expect(view.queryByTestId('axis-feedback')).toBeNull();
});

it('整数边界禁用加减，零位移无假箭头，复位恢复指令但不伪造执行', async () => {
  const view = setup();
  await press(view, '增加东西位移', 2);
  expect(view.getByRole('button', { name: '增加东西位移' })).toHaveProperty('disabled', true);
  await press(view, '减少东西位移', 10);
  expect(view.getByRole('button', { name: '减少东西位移' })).toHaveProperty('disabled', true);
  await press(view, '零位移');
  await press(view, '执行移动（1 秒）');
  expect(view.getByTestId('intro-length').textContent).toBe('0 m');
  expect(view.getByTestId('intro-robot').getAttribute('aria-label')).toContain('(0, 0)');
  expect(view.queryByTestId('intro-vector')).toBeNull();
  await press(view, '换坐标轴');
  await press(view, '坐标轴逆时针转 90°');
  expect(view.getByTestId('intro-components').textContent).toContain('(0, 0) m');
  expect(view.queryByTestId('component-guide')).toBeNull();
  await press(view, '复位实验');
  expect(view.getByTestId('intro-components').textContent).toContain('(3, 4) m');
  expect(view.queryByTestId('intro-vector')).toBeNull();
  expect(view.queryByTestId('axis-feedback')).toBeNull();
  expect(view.getByTestId('intro-robot').getAttribute('aria-label')).toContain('(0, 0)');
});
