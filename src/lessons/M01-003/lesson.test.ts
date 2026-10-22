import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('全部预设、切片、非法值与复位符合协议', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-003');
  const v = render(Lesson, { metadata: lessonById.get('M01-003')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  await fireEvent.click(v.getByRole('button', { name: '记录 2' }));
  await fireEvent.click(v.getByRole('button', { name: '后一个时刻' }));
  expect(v.getByTestId('object-result').textContent).toContain('记录 2 / 2，时刻 2 / 3');
  expect(v.getByText('通道 1：地址码 16')).toBeTruthy();
  await fireEvent.click(v.getByRole('button', { name: '增加一个测量通道' }));
  expect(v.getByTestId('shape').textContent).toContain('(2,3,5)');
  expect(v.getByText('通道 1：地址码 20')).toBeTruthy();
  await fireEvent.click(v.getByText('复位 ↺'));

  for (const section of definition.sections)
    expect(v.container.querySelector(`#${section.id}`)).toBeTruthy();
  for (const [name, count] of [
    ['场景一：(2,3,4)', 24],
    ['场景一对照：(3,2,4)', 24],
    ['场景二：单通道', 800],
    ['场景二对照：三通道', 2400],
  ] as const) {
    await fireEvent.click(v.getByText(name));
    expect(v.getByTestId('shape').textContent).toContain(`${count} 个元素`);
  }
  await fireEvent.input(v.getByLabelText('批次索引 b'), { target: { value: '7' } });
  expect(v.getByText('2100')).toBeTruthy();
  await fireEvent.input(v.getByLabelText('批次数 B'), { target: { value: '1' } });
  expect(v.getByText('0')).toBeTruthy();
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('shape').textContent).toContain('(2,3,4)');
});
