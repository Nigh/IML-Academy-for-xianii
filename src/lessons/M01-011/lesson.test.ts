import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、矩阵编辑、逐格计算、顺序和复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-011');
  const v = render(Lesson, { metadata: lessonById.get('M01-011')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('和：58');
  await fireEvent.input(v.getByLabelText('结果行索引 i'), { target: { value: '1' } });
  expect(v.getByTestId('result').textContent).toContain('和：139');
  await fireEvent.click(v.getByText('场景二：剪切与缩放'));
  expect(v.getByTestId('result').textContent).toContain('和：2');
  await fireEvent.input(v.getAllByLabelText('第 1 行，第 1 列')[0], { target: { value: '2' } });
  expect(v.getByTestId('result').textContent).toContain('和：4');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('和：58');
});

it('现实对象操作与数学结果共享状态，复位恢复默认', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-011')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  const initial = v.getByTestId('object-reading').textContent;
  await fireEvent.click(v.getByRole('button', { name: '产品 1 加一件' }));
  expect(v.getByTestId('object-reading').textContent).toContain('资源 1 总量：65');
  expect(v.getByTestId('result').textContent).toContain('和：65');
  await fireEvent.click(v.getByRole('button', { name: '查看第 2 批订单' }));
  expect(v.getByTestId('object-reading').textContent).toContain('资源 1 总量：139');
  expect(v.getByTestId('result').textContent).toContain('和：139');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('object-reading').textContent).toBe(initial);
});
