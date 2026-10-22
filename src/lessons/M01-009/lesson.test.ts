import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、四个预设、候选与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-009');
  const v = render(Lesson, { metadata: lessonById.get('M01-009')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  await fireEvent.click(v.getByText('场景二：方向放大两倍'));
  expect(v.getByTestId('result').textContent).toContain('(3.000,0.000)');
  await fireEvent.input(v.getByLabelText('候选系数 t'), { target: { value: '1.5' } });
  expect(v.getByText(/候选距离：2.000/)).toBeTruthy();
  await fireEvent.click(v.getByText('场景三：正交零投影'));
  expect(v.getByTestId('result').textContent).toContain('(0.000,0.000)');
  await fireEvent.click(v.getByText('场景四：零方向'));
  expect(v.getByTestId('result').textContent).toContain('未定义');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('(3.000,0.000)');
});

it('现实对象操作与数学结果共享状态，复位恢复默认', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-009')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  const initial = v.getByTestId('object-reading').textContent;
  const before = v.getByTestId('rail-carriage').getAttribute('x');
  await fireEvent.click(v.getByRole('button', { name: '小车前进半步' }));
  expect(v.getByTestId('rail-carriage').getAttribute('x')).not.toBe(before);
  expect(v.getByTestId('object-reading').textContent).toContain('小车位置 (1.500, 0.000)');
  expect(v.getByText(/候选距离：2.500/)).toBeTruthy();
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('object-reading').textContent).toBe(initial);
});
