import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、两层目标、候选变化和复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-016');
  const v = render(Lesson, { metadata: lessonById.get('M01-016')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('伪逆解=(1,1)');
  expect(v.getByTestId('result').textContent).toContain('候选解=(2,0)');
  await fireEvent.input(v.getByLabelText('候选偏移 t'), { target: { value: '0' } });
  expect(v.getByTestId('result').textContent).toContain('候选解=(1,1)');
  await fireEvent.click(v.getByText('场景二：超定不一致'));
  expect(v.getByTestId('result').textContent).toContain('最小残差=1.4142');
  await fireEvent.click(v.getByText('场景二对照：可精确拟合'));
  expect(v.getByTestId('result').textContent).toContain('最小残差=0');
  await fireEvent.input(v.getByLabelText('目标 b₂'), { target: { value: 'NaN' } });
  expect(v.getByTestId('result').textContent).toContain('最小残差=0');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('候选解=(2,0)');
});

it('对象操作与数学结果同源', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-016')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  expect(v.getByTestId('object-workbench')).toBeTruthy();
  await fireEvent.click(v.getByRole('button', { name: '第一路减少半单位' }));
  expect(v.getByTestId('drive-readings').textContent).toContain('驱动 1 指令：1.5');
  expect(v.getByTestId('drive-readings').textContent).toContain('表 1：2；目标 2；差值 0');
  await fireEvent.click(v.getByRole('button', { name: '采用伪逆分配' }));
  expect(v.getByTestId('drive-readings').textContent).toContain('驱动 2 指令：1');
  await fireEvent.click(v.getByText('复位 ↺'));
});
