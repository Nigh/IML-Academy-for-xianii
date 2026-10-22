import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、预设、第三向量开关与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-006');
  const v = render(Lesson, { metadata: lessonById.get('M01-006')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  await fireEvent.click(v.getByText('场景一对照：共线二向量'));
  await fireEvent.input(v.getByLabelText('驱动 1 的有符号份数'), { target: { value: '-2' } });
  await fireEvent.input(v.getByLabelText('驱动 2 的有符号份数'), { target: { value: '1' } });
  expect(v.getByTestId('object-result').textContent).toContain('指令不全为零；已回到起点');
  await fireEvent.click(v.getByRole('button', { name: '清空全部指令' }));
  expect(v.getByTestId('object-result').textContent).toContain('指令全为零');
  await fireEvent.click(v.getByText('复位 ↺'));

  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  await fireEvent.click(v.getByText('场景一对照：共线二向量'));
  expect(v.getByTestId('result').textContent).toContain('秩=1');
  await fireEvent.click(v.getByLabelText('加入第三向量'));
  expect(v.getByTestId('result').textContent).toContain('向量数=3；秩=2');
  await fireEvent.click(v.getByText('场景二：加入第三个向量'));
  expect(v.getByText(/非平凡零组合系数：\(-1,-1,1\)/)).toBeTruthy();
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('是 R² 的基');
});
