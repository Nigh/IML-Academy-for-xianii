import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, it, expect } from 'vitest';
import Lesson from './Lesson.svelte';
import definition from './lesson.ts';
import { lessonById } from '../../lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../lib/lesson/contract.ts';
afterEach(cleanup);
it('协议、四预设、阶段、零矩阵与复位', async () => {
  expect(lessonDefinitionSchema.parse(definition).id).toBe('M01-018');
  const v = render(Lesson, { metadata: lessonById.get('M01-018')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  for (const s of definition.sections) expect(v.container.querySelector(`#${s.id}`)).toBeTruthy();
  expect(v.getByTestId('result').textContent).toContain('奇异值=(3,1)');
  await fireEvent.click(v.getByText('场景二：秩1'));
  expect(v.getByTestId('result').textContent).toContain('精确秩=1');
  await fireEvent.change(v.getByLabelText('观察阶段'), { target: { value: '1' } });
  expect(v.getByTestId('result').textContent).toContain('阶段=1');
  await fireEvent.click(v.getByText('场景三：纯旋转'));
  expect(v.getByTestId('result').textContent).toContain('奇异值=(1,1)');
  await fireEvent.click(v.getByText('场景四：反射'));
  expect((v.getByLabelText('U包含反射') as HTMLInputElement).checked).toBe(true);
  await fireEvent.input(v.getByLabelText('第一奇异值 σ₁'), { target: { value: '0' } });
  expect(v.getByTestId('result').textContent).toContain('奇异值=(0,0)');
  await fireEvent.click(v.getByText('复位 ↺'));
  expect(v.getByTestId('result').textContent).toContain('奇异值=(3,1)');
});

it('对象操作与数学结果同源', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-018')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  expect(v.getByTestId('object-workbench')).toBeTruthy();
  await fireEvent.click(v.getByRole('button', { name: '取回原始印章' }));
  const original = v.getByTestId('stamp-shape').getAttribute('points');
  await fireEvent.click(v.getByRole('button', { name: '送入下一道工序' }));
  await fireEvent.click(v.getByRole('button', { name: '送入下一道工序' }));
  expect(v.getByTestId('stamp-shape').getAttribute('points')).not.toBe(original);
  expect(v.getByTestId('stamp-reading').textContent).toContain('工序 2');
  await fireEvent.click(v.getByRole('button', { name: '压平第二方向' }));
  expect(v.getByTestId('stamp-reading').textContent).toContain('保留方向数 1');
  expect(v.getByTestId('result').textContent).toContain('精确秩=1');
  await fireEvent.click(v.getByText('复位 ↺'));
});

it('印章主视图在默认完整变换下有可辨认跨度且保留边界', async () => {
  const v = render(Lesson, { metadata: lessonById.get('M01-018')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  const points = v
    .getByTestId('stamp-shape')
    .getAttribute('points')!
    .split(' ')
    .map((p) => p.split(',').map(Number));
  expect(
    Math.max(...points.map((p) => p[0])) - Math.min(...points.map((p) => p[0])),
  ).toBeGreaterThan(240);
  expect(points.every(([x, y]) => x >= 40 && x <= 360 && y >= 40 && y <= 360)).toBe(true);
});
