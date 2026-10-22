import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { it, expect, afterEach, vi } from 'vitest';
import VectorDiagram from '../../src/components/charts/VectorDiagram.svelte';
import Plot2D from '../../src/components/charts/Plot2D.svelte';
import QuizBlock from '../../src/components/lesson/QuizBlock.svelte';
afterEach(cleanup);
it('坐标系转动而物理向量屏幕端点不动，复位恢复', async () => {
  const v = render(VectorDiagram, {
    range: 7,
    vectors: [{ x: 3, y: 4, label: 'v', role: 'primary' }],
    description: '旋转坐标',
  });
  const end = () => v.container.querySelector('[data-vector="0"]')?.getAttribute('x2');
  const before = end();
  expect(v.container.querySelector('[data-grid-unit="1"]')).toBeTruthy();
  await v.rerender({ axisRotation: 90 });
  expect(
    v.container.querySelector('[data-coordinate-system]')?.getAttribute('transform'),
  ).toContain('rotate(-90)');
  expect(end()).toBe(before);
  await v.rerender({ axisRotation: 0 });
  expect(
    v.container.querySelector('[data-coordinate-system]')?.getAttribute('transform'),
  ).toContain('rotate(0)');
  await v.rerender({ axisRotation: NaN });
  expect(v.getByRole('status').textContent).toContain('无效');
});
it('等比例绘图的参考线和柱宽随同一映射变化', () => {
  const v = render(Plot2D, {
    equal: true,
    xRange: [-5, 5],
    yRange: [-12, 12],
    xLabel: 'x',
    yLabel: 'y',
    description: '几何',
    references: [{ axis: 'y', value: 0, label: '零' }],
    series: [
      {
        id: 'bar',
        kind: 'bar',
        label: '宽度一',
        role: 'primary',
        points: [{ x: 0, y: 1, width: 1 }],
      },
    ],
  });
  const width = Number(v.container.querySelector('rect[opacity]')?.getAttribute('width'));
  expect(width).toBeCloseTo(280 / 24, 10);
  expect(v.getByText(/横纵单位等长/)).toBeTruthy();
});
it('错答、重新选择、正确答案与保存答案分别呈现', async () => {
  const v = render(QuizBlock, {
    question: {
      id: 'q',
      version: 1,
      prompt: '判断',
      answerId: 'yes',
      options: [
        { id: 'yes', text: '成立', explanation: '原因正确' },
        { id: 'no', text: '不成立', explanation: '再检查条件' },
      ],
    },
    onsubmit: vi.fn(),
  });
  await fireEvent.click(v.getByLabelText('不成立'));
  await fireEvent.submit(v.container.querySelector('form')!);
  expect(v.getByRole('status').getAttribute('data-state')).toBe('incorrect');
  await fireEvent.click(v.getByLabelText('成立'));
  expect(v.queryByRole('status')).toBeNull();
  await fireEvent.submit(v.container.querySelector('form')!);
  expect(v.getByRole('status').getAttribute('data-state')).toBe('correct');
  await v.rerender({ savedAnswer: 'no' });
  expect(v.getByRole('status').getAttribute('data-state')).toBe('incorrect');
});
