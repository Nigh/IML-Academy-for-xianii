import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('课程协议有效且交互结果与输入一致、可复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-002');
  const view = render(Lesson, { metadata: lessonById.get('M01-002')! });
  expect(view.getByText('(1, 3) m')).toBeTruthy();
  await fireEvent.click(view.getByText('场景二：完全抵消'));
  expect(view.getByText('(0, 0) m')).toBeTruthy();
  await fireEvent.click(view.getByText('复位 ↺'));
  expect(view.getByText('(1, 3) m')).toBeTruthy();
  for (const section of definition.sections)
    expect(view.container.querySelector(`#${section.id}`)).toBeTruthy();
});
