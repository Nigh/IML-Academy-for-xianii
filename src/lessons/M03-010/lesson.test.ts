import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect, vi } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、章节、主要参数更新和复位', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M03-010');
  expect(definition.quiz.length).toBeGreaterThanOrEqual(2);
  const v = render(Lesson, { metadata: lessonById.get('M03-010')! });
  for (const section of definition.sections)
    expect(v.container.querySelector(`#${section.id}`)).toBeTruthy();
  expect(v.container.querySelector('[role="alert"]')).toBeNull();
  expect(v.getByTestId('optimization-state').textContent).toContain('第 0 步');
  await fireEvent.click(v.getByText('单步', { exact: true }));
  expect(v.getByTestId('optimization-state').textContent).toContain('第 1 步');
  expect(v.getByTestId('optimization-state').textContent).toContain('-1.2');
  await fireEvent.click(v.getByText('播放', { exact: true }));
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByText('播放', { exact: true })).toBeTruthy();
  await fireEvent.click(v.getByText('重置迭代'));
  expect(v.getByTestId('optimization-state').textContent).toContain('第 0 步');
  await fireEvent.click(v.getByText('等幅振荡', { exact: true }));
  await fireEvent.click(v.getByText('单步', { exact: true }));
  await fireEvent.click(v.getByText('单步', { exact: true }));
  expect(v.getByText('单步', { exact: true }).hasAttribute('disabled')).toBe(true);
});
