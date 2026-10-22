import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、全部预设、角度与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-010');
  const v = render(Lesson, { metadata: lessonById.get('M01-010')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('13.000 = 9.000 + 4.000');
  await fireEvent.click(v.getByText('场景二：转到45°方向'));
  expect(v.getByTestId('result').textContent).toContain('13.000 = 12.500 + 0.500');
  expect(Array.from(v.container.querySelectorAll('td'), (cell) => cell.textContent)).toEqual([
    '3',
    '2.5',
    '0.5',
    '2',
    '2.5',
    '-0.5',
  ]);
  await fireEvent.click(v.getByText('场景三：没有残差'));
  expect(v.getByTestId('result').textContent).toContain('9.000 = 9.000 + 0.000');
  await fireEvent.input(v.getByLabelText('参考方向角 (°)'), { target: { value: '90' } });
  expect(v.getByTestId('result').textContent).toContain('9.000 = 0.000 + 9.000');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('13.000 = 9.000 + 4.000');
});

it('现实对象操作与数学结果共享状态，复位恢复默认', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-010')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  const initial = v.getByTestId('object-reading').textContent;
  const before = v.getByTestId('projection-carriage').getAttribute('y');
  await fireEvent.click(v.getByRole('button', { name: '导轨逆时针转 15°' }));
  expect(v.getByTestId('projection-carriage').getAttribute('y')).not.toBe(before);
  expect(v.getByLabelText('参考方向角 (°)')).toHaveProperty('value', '15');
  expect(v.getByTestId('result').textContent).toContain('13.000');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('object-reading').textContent).toBe(initial);
});
