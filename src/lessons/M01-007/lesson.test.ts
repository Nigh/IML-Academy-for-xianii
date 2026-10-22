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
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-007');
  expect(definition.quiz.length).toBeGreaterThanOrEqual(2);
  const v = render(Lesson, { metadata: lessonById.get('M01-007')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  await fireEvent.click(v.getByRole('button', { name: '候选卡强度减半' }));
  expect(v.getByTestId('object-result').textContent).toContain('1.5 + (1.5) = 3');
  expect(v.getByTestId('dot-result').textContent).toContain('3');
  await fireEvent.click(v.getByRole('button', { name: '候选卡强度加倍' }));
  expect(v.getByTestId('dot-result').textContent).toContain('6');
  await fireEvent.click(v.getByRole('button', { name: '清空候选卡' }));
  expect(v.getByTestId('object-result').textContent).toContain('方向分数 未定义');
  await fireEvent.click(v.getByText('复位 ↺'));

  for (const section of definition.sections)
    expect(v.container.querySelector(`#${section.id}`)).toBeTruthy();
  expect(v.container.querySelector('[role="alert"]')).toBeNull();
  expect(v.getByTestId('dot-result').textContent).toContain('6');
  await fireEvent.click(v.getByText('正交', { exact: true }));
  expect(v.getByTestId('dot-result').textContent).toContain('0');
  await fireEvent.input(v.getByLabelText('a 的 x 分量'), { target: { value: '2' } });
  await fireEvent.click(v.getByText('反向', { exact: true }));
  expect(v.getByTestId('dot-result').textContent).toContain('-2');
  await fireEvent.click(v.getByText('平行', { exact: true }));
  expect(v.getByTestId('dot-result').textContent).toContain('8');
  await fireEvent.click(v.getByText('零向量', { exact: true }));
  expect(v.getByText('夹角 = 未定义')).toBeTruthy();
  expect(v.getByText('投影 = 未定义：b 为零向量')).toBeTruthy();
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('dot-result').textContent).toContain('6');
});
