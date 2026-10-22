import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('章节、两场景、系数与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-005');
  const v = render(Lesson, { metadata: lessonById.get('M01-005')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  await fireEvent.click(v.getByRole('button', { name: '驱动一后退一份' }));
  expect(v.getByTestId('object-result').textContent).toContain('平台 (2.00,-2.00)；距目标 1.0000');
  expect(v.getByTestId('result').textContent).toContain('组合=(2.00,-2.00)');
  await fireEvent.click(v.getByRole('button', { name: '驱动一前进一份' }));
  expect(v.getByTestId('object-result').textContent).toContain('已命中目标');

  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('当前误差=0.0000');
  await fireEvent.click(v.getByText('场景二：两个共线方向'));
  expect(v.getByTestId('result').textContent).toContain('张成维数=1');
  await fireEvent.input(v.getByLabelText('第一方向系数 a'), { target: { value: '-2' } });
  await fireEvent.input(v.getByLabelText('第二方向系数 b'), { target: { value: '1' } });
  expect(v.getByTestId('result').textContent).toContain('组合=(0.00,0.00)');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('张成维数=2');
});
