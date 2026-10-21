import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、三类解、逆、参数与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-015');
  const v = render(Lesson, { metadata: lessonById.get('M01-015')! });
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('当前解=(2,1)');
  await fireEvent.click(v.getByText('场景二：重复约束'));
  expect(v.getByTestId('result').textContent).toContain('无穷多解');
  await fireEvent.input(v.getByLabelText('解族系数 t'), { target: { value: '1' } });
  expect(v.getByTestId('result').textContent).toContain('当前解=(2,0)');
  await fireEvent.click(v.getByText('场景二对照：矛盾约束'));
  expect(v.getByTestId('result').textContent).toContain('无解（');
  expect(v.getByTestId('result').textContent).not.toContain('当前解=');
  await fireEvent.input(v.getByLabelText('右端项 b₂'), { target: { value: '4' } });
  expect(v.getByTestId('result').textContent).toContain('无穷多解');
  await fireEvent.click(v.getByText('场景三：可逆剪切'));
  expect(v.getByTestId('result').textContent).toContain('当前解=(1,1)');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('当前解=(2,1)');
});

it('非零微小消元缺陷不会显示为零', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-015')! });
  await fireEvent.click(v.getByText('场景二对照：矛盾约束'));
  await fireEvent.input(v.getByLabelText('右端项 b₁'), { target: { value: '0' } });
  await fireEvent.input(v.getByLabelText('右端项 b₂'), { target: { value: '0.0001' } });
  expect(v.getByTestId('result').textContent).toContain('1.000e-4');
  expect(v.getByTestId('result').textContent).toContain('无解（');
});
