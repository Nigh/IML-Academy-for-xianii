import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、全部章节、三个场景、输入与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-001');
  expect(definition.quiz).toHaveLength(3);
  const view = render(Lesson, { metadata: lessonById.get('M01-001')! });
  await fireEvent.click(view.getByRole('button', { name: '直接探索' }));
  for (const section of definition.sections)
    expect(view.container.querySelector(`#${section.id}`)).toBeTruthy();
  expect(view.getByTestId('components').textContent).toContain('(3.000, 4.000) m');
  const arrow = view.container.querySelector('[data-vector="0"]')!;
  const endpoint = [arrow.getAttribute('x2'), arrow.getAttribute('y2')];
  await fireEvent.click(view.getByRole('button', { name: '场景二：坐标轴旋转 90°' }));
  expect(
    view.container.querySelector('[data-coordinate-system]')?.getAttribute('transform'),
  ).toContain('rotate(-90)');
  expect([arrow.getAttribute('x2'), arrow.getAttribute('y2')]).toEqual(endpoint);
  expect(view.getByTestId('components').textContent).toContain('(4.000, -3.000) m');
  await fireEvent.click(view.getByRole('button', { name: '场景三：零位移' }));
  expect(view.getByText('原坐标方向：未定义（零向量）')).toBeTruthy();
  await fireEvent.click(view.getByRole('button', { name: '复位 ↺' }));
  const input = view.getByRole('textbox', { name: '原坐标 x 分量 (m)' });
  await fireEvent.input(input, { target: { value: '2' } });
  expect(view.getByTestId('components').textContent).toContain('(2.000, 4.000) m');
  await fireEvent.input(input, { target: { value: '99' } });
  await fireEvent.blur(input);
  expect(view.getByTestId('components').textContent).toContain('(2.000, 4.000) m');
  await fireEvent.click(view.getByRole('button', { name: '复位 ↺' }));
  expect(view.getByTestId('components').textContent).toContain('(3.000, 4.000) m');
});
