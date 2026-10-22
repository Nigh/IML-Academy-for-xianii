import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('课程协议有效且交互结果与输入一致、可复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-002');
  expect(definition.quiz).toHaveLength(3);
  const view = render(Lesson, { metadata: lessonById.get('M01-002')! });
  await fireEvent.click(view.getByRole('button', { name: '直接探索' }));
  expect(view.getByText('(1, 3) m')).toBeTruthy();
  await fireEvent.click(view.getByRole('button', { name: '执行第一段' }));
  expect(view.getByTestId('platform-position').textContent).toContain('(2, 1) 米');
  await fireEvent.click(view.getByRole('button', { name: '执行第二段' }));
  expect(view.getByTestId('platform-position').textContent).toContain('(1, 3) 米');
  await fireEvent.click(view.getByText('复位 ↺'));
  expect(view.getByTestId('platform-position').textContent).toContain('等待指令');
  await fireEvent.click(view.getByText('场景二：完全抵消'));
  expect(view.getByText('(0, 0) m')).toBeTruthy();
  expect(view.getByTestId('platform-position').textContent).toContain('等待指令');
  await fireEvent.click(view.getByRole('button', { name: '执行第一段' }));
  await fireEvent.click(view.getByRole('button', { name: '执行第二段' }));
  expect(view.getByTestId('platform-position').textContent).toContain('(0, 0) 米');
  await fireEvent.click(view.getByText('复位 ↺'));
  expect(view.getByText('(1, 3) m')).toBeTruthy();
  await fireEvent.input(view.getByRole('textbox', { name: '数乘系数 k (无量纲)' }), {
    target: { value: '-1' },
  });
  expect(view.getByText('(-3, 1) m')).toBeTruthy();
  await fireEvent.change(view.getByLabelText('作图方式'), { target: { value: 'parallelogram' } });
  expect(view.container.querySelectorAll('.vector-diagram line')).toHaveLength(5);
  await fireEvent.click(view.getByText('复位 ↺'));
  expect(view.getByText('(1, 3) m')).toBeTruthy();
  expect(view.getByText(/^迁移：/)).toBeTruthy();
  for (const section of definition.sections)
    expect(view.container.querySelector(`#${section.id}`)).toBeTruthy();
});
