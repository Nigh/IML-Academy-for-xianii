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
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M02-004');
  expect(definition.quiz.length).toBeGreaterThanOrEqual(2);
  const v = render(Lesson, { metadata: lessonById.get('M02-004')! });
  for (const section of definition.sections)
    expect(v.container.querySelector(`#${section.id}`)).toBeTruthy();
  expect(v.container.querySelector('[role="alert"]')).toBeNull();
  const initial = v.getByTestId('sample-preview').textContent;
  await fireEvent.click(v.getByText('重新采样（新 seed）'));
  expect(v.getByTestId('sample-preview').textContent).not.toBe(initial);
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('sample-preview').textContent).toBe(initial);
  await fireEvent.input(v.getByLabelText('均值 μ'), { target: { value: '2' } });
  expect(v.getByTestId('sample-preview').textContent).not.toBe(initial);
});
