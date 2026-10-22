import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、精确/数值秩场景、阈值与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-013');
  const v = render(Lesson, { metadata: lessonById.get('M01-013')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  await fireEvent.click(v.getByText('场景二：单位矩阵'));
  expect(v.getByTestId('result').textContent).toContain('精确秩=2；数值秩=2');
  await fireEvent.click(v.getByText('场景二对照：微小奇异值'));
  expect(v.getByTestId('result').textContent).toContain('精确秩=2；数值秩=1');
  await fireEvent.input(v.getByLabelText('相对阈值 τ'), { target: { value: '1e-10' } });
  expect(v.getByTestId('result').textContent).toContain('数值秩=2');
  await fireEvent.click(v.getByText('场景三：精确消去一维'));
  expect(v.getByTestId('result').textContent).toContain('精确秩=1');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('精确秩=1；数值秩=1');
});

it('现实对象操作与数学结果共享状态，复位恢复默认', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-013')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  const initial = v.getByTestId('object-reading').textContent;
  await fireEvent.click(v.getByRole('button', { name: '试着相互抵消' }));
  expect(v.getByTestId('object-reading').textContent).toContain('(0.00e+0, 0.00e+0)');
  await fireEvent.click(v.getByText('场景二：单位矩阵'));
  await fireEvent.click(v.getByRole('button', { name: '只推动执行器二' }));
  expect(v.getByTestId('object-reading').textContent).toContain('(0.00e+0, 1.00e+0)');
  expect(v.getByTestId('result').textContent).toContain('精确秩=2；数值秩=2');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('object-reading').textContent).toBe(initial);
});
