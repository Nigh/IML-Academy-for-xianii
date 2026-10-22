import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、单位对照、尺度与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-008');
  const v = render(Lesson, { metadata: lessonById.get('M01-008')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('L1=7.000 m；L2=5.000 m');
  await fireEvent.click(v.getByText('场景二：第一特征改用毫米'));
  expect(v.getByText(/显示分量：3000 mm/)).toBeTruthy();
  await fireEvent.input(v.getByLabelText('第一特征尺度 (m)'), { target: { value: '3' } });
  expect(v.getByText(/L2=4.123（无量纲）/)).toBeTruthy();
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByText(/显示分量：3 m/)).toBeTruthy();
});

it('现实对象操作与数学结果共享状态，复位恢复默认', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-008')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  const initial = v.getByTestId('object-reading').textContent;
  expect(v.getByTestId('object-reading').textContent).toContain('沿街 7.000 m；直达 5.000 m');
  const before = v.getByTestId('delivery-target').getAttribute('cx');
  await fireEvent.click(v.getByRole('button', { name: '收货点向东 1 m' }));
  expect(v.getByTestId('delivery-target').getAttribute('cx')).not.toBe(before);
  expect(v.getByTestId('result').textContent).toContain('L1=8.000 m；L2=5.657 m');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('object-reading').textContent).toBe(initial);
});
