import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、误差预设、参数和复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-019');
  const v = render(Lesson, { metadata: lessonById.get('M01-019')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=1');
  await fireEvent.click(v.getByText('场景二：保留全部项'));
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=0');
  await fireEvent.click(v.getByText('场景三：混合坐标'));
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=1');
  await fireEvent.click(v.getByText('场景四：原矩阵秩1'));
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=0');
  await fireEvent.input(v.getByLabelText('保留项数 k'), { target: { value: '0' } });
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=3');
  await fireEvent.input(v.getByLabelText('保留项数 k'), { target: { value: '.5' } });
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=3');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=1');
});

it('对象操作与数学结果同源', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-019')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  expect(v.getByTestId('object-workbench')).toBeTruthy();
  await fireEvent.click(v.getByRole('button', { name: '传输 2 层' }));
  expect(v.getByTestId('tile-reading').textContent).toContain('重构值 3，0，0，1；丢失量 0');
  await fireEvent.click(v.getByRole('button', { name: '传输 1 层' }));
  expect(v.getByTestId('tile-reading').textContent).toContain('重构值 3，0，0，0；丢失量 1');
  expect(v.getByTestId('result').textContent).toContain('Frobenius误差=1');
  await fireEvent.click(v.getByText('复位 ↺'));
});
