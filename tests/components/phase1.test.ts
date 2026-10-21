import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { it, expect, vi, afterEach } from 'vitest';
import NumericInput from '../../src/components/interactive/NumericInput.svelte';
import ParameterSlider from '../../src/components/interactive/ParameterSlider.svelte';
import SimulationControls from '../../src/components/interactive/SimulationControls.svelte';
import Plot2D from '../../src/components/charts/Plot2D.svelte';
import MatrixView from '../../src/components/math/MatrixView.svelte';
import FormulaBlock from '../../src/components/math/FormulaBlock.svelte';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('编辑负号和小数中间态；失焦校验；整数模式', async () => {
  const change = vi.fn();
  const v = render(NumericInput, {
    label: '值',
    value: 0,
    min: -5,
    max: 5,
    step: 0.1,
    onchange: change,
  });
  const input = v.getByLabelText('值');
  await fireEvent.input(input, { target: { value: '-' } });
  expect((input as HTMLInputElement).value).toBe('-');
  expect(change).not.toHaveBeenCalled();
  expect(input.getAttribute('aria-invalid')).toBe('false');
  await fireEvent.blur(input);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  await fireEvent.input(input, { target: { value: '-1.5' } });
  expect(change).toHaveBeenCalledWith(-1.5);
  await v.rerender({ value: -1.5 });
  change.mockClear();
  await fireEvent.blur(input);
  expect(change).not.toHaveBeenCalled();
  await v.rerender({ integer: true });
  await fireEvent.input(input, { target: { value: '1.5' } });
  expect(input.getAttribute('aria-invalid')).toBe('true');
});
it('滑块初值与回调、说明和独立重置', async () => {
  const change = vi.fn();
  const v = render(ParameterSlider, {
    label: '参数',
    value: 2,
    min: 0,
    max: 5,
    initialValue: 1,
    description: '无量纲',
    onchange: change,
  });
  expect((v.getByLabelText('参数') as HTMLInputElement).value).toBe('2');
  await fireEvent.input(v.getByLabelText('参数 滑块'), { target: { value: '4' } });
  expect(change).toHaveBeenCalledWith(4);
  await fireEvent.click(v.getByText('重置参数'));
  expect(change).toHaveBeenCalledWith(1);
});
it('播放只启动一次，暂停、隐藏、结束与卸载都释放时钟', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  const step = vi.fn();
  const clear = vi.spyOn(globalThis, 'clearInterval');
  const v = render(SimulationControls, {
    index: 0,
    maxSteps: 5,
    speed: 2,
    onstep: step,
    onreset: vi.fn(),
    onspeedchange: vi.fn(),
  });
  await fireEvent.click(v.getByText('播放', { exact: true }));
  await vi.advanceTimersByTimeAsync(500);
  expect(step).toHaveBeenCalledTimes(1);
  await fireEvent.click(v.getByText('暂停', { exact: true }));
  await vi.advanceTimersByTimeAsync(1000);
  expect(step).toHaveBeenCalledTimes(1);
  await fireEvent.click(v.getByText('播放', { exact: true }));
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  await fireEvent(document, new Event('visibilitychange'));
  await vi.advanceTimersByTimeAsync(1000);
  expect(step).toHaveBeenCalledTimes(1);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  await fireEvent.click(v.getByText('播放', { exact: true }));
  await v.rerender({ finished: true });
  expect(clear).toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(2000);
  expect(step).toHaveBeenCalledTimes(1);
  await v.rerender({ finished: false });
  expect(v.getByText('播放', { exact: true })).toBeTruthy();
  await vi.advanceTimersByTimeAsync(2000);
  expect(step).toHaveBeenCalledTimes(1);
  v.unmount();
  await vi.advanceTimersByTimeAsync(2000);
  expect(step).toHaveBeenCalledTimes(1);
  clear.mockRestore();
});
it('减少动态效果时只能单步', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  const v = render(SimulationControls, {
    index: 0,
    maxSteps: 5,
    speed: 2,
    onstep: vi.fn(),
    onreset: vi.fn(),
    onspeedchange: vi.fn(),
  });
  expect(v.getByText('播放', { exact: true }).hasAttribute('disabled')).toBe(true);
});
it('图表空态、无效输入、矩阵与公式错误可读', async () => {
  const v = render(Plot2D, {
    series: [],
    xRange: [0, 1],
    yRange: [0, 1],
    xLabel: 'x',
    yLabel: 'y',
    description: '测试',
  });
  expect(v.getByText('暂无数据。')).toBeTruthy();
  await v.rerender({
    series: [
      { id: 'invalid', label: '无效', kind: 'line', role: 'primary', points: [{ x: NaN, y: 0 }] },
    ],
  });
  expect(v.getByText(/图表数据无效/)).toBeTruthy();
  const invalid = render(MatrixView, { values: [[1], [2, 3]] });
  expect(invalid.getByText(/矩阵须为非空矩形/)).toBeTruthy();
  const formula = render(FormulaBlock, { latex: '\\unknowncommand', description: '无效公式' });
  expect(formula.getByRole('alert')).toBeTruthy();
});

it('行内公式使用 span，不插入块级公式容器', () => {
  const v = render(FormulaBlock, { latex: 'x^2', description: 'x 的平方', inline: true });
  expect(v.container.querySelector('.inline-formula')?.tagName).toBe('SPAN');
  expect(v.container.querySelector('.formula-block')).toBeNull();
  expect(v.container.querySelector('math')).toBeTruthy();
});
