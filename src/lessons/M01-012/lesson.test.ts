import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、全部变换、矩阵参数与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-012');
  const v = render(Lesson, { metadata: lessonById.get('M01-012')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('右上角像=(2,1)');
  await fireEvent.click(v.getByText('场景二：剪切方格'));
  expect(v.container.querySelectorAll('.after')).toHaveLength(6);
  await fireEvent.click(v.getByText('场景三：压成直线'));
  expect(v.getByTestId('result').textContent).toContain('右上角像=(1,0)');
  await fireEvent.input(v.getByLabelText('A 第2行第2列'), { target: { value: '2' } });
  expect(v.getByTestId('result').textContent).toContain('右上角像=(1,2)');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('右上角像=(2,1)');
});

it('现实对象操作与数学结果共享状态，复位恢复默认', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-012')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  const initial = v.getByTestId('object-reading').textContent;
  const before = v.getByTestId('stamp-outline').getAttribute('points');
  await fireEvent.click(v.getByRole('button', { name: '把印章上边向右推' }));
  expect(v.getByTestId('stamp-outline').getAttribute('points')).not.toBe(before);
  expect(v.getByTestId('object-reading').textContent).toContain('(1.000, 0.750)');
  expect(v.getByTestId('result').textContent).toContain('右上角像=(2,1)');
  await fireEvent.click(v.getByRole('button', { name: '把印章压扁' }));
  expect(v.getByTestId('object-reading').textContent).toContain('(0.250, 0.000)');
  expect(v.getByTestId('result').textContent).toContain('右上角像=(1,0)');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('object-reading').textContent).toBe(initial);
});

it('负向极端变换仍将完整印章保留在画布内', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-012')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  await fireEvent.click(v.getByRole('button', { name: '恢复原形' }));
  await fireEvent.input(v.getByLabelText('A 第2行第1列'), { target: { value: '-2' } });
  await fireEvent.input(v.getByLabelText('A 第2行第2列'), { target: { value: '-2' } });
  const points = v
    .getByTestId('stamp-outline')
    .getAttribute('points')!
    .split(' ')
    .map((p) => p.split(',').map(Number));
  expect(points.every(([x, y]) => x >= 20 && x <= 340 && y >= 20 && y <= 290)).toBe(true);
});
