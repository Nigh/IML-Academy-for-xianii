import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { it, expect, vi, afterEach } from 'vitest';
import NumericInput from '../../src/components/interactive/NumericInput.svelte';
import QuizBlock from '../../src/components/lesson/QuizBlock.svelte';
import definition from '../../src/lessons/M01-002/lesson.ts';
afterEach(cleanup);
it('非法数值不传播，恢复有效输入后清理错误', async () => {
  const change = vi.fn();
  const v = render(NumericInput, { label: '坐标', value: 1, min: -5, max: 5, onchange: change });
  const input = v.getByLabelText('坐标');
  await fireEvent.input(input, { target: { value: '99' } });
  expect(change).not.toHaveBeenCalled();
  expect(input.getAttribute('aria-invalid')).toBe('true');
  await fireEvent.input(input, { target: { value: '2' } });
  expect(change).toHaveBeenCalledWith(2);
  expect(input.getAttribute('aria-invalid')).toBe('false');
});
it('测验提交显示解释并保存选项 ID', async () => {
  const submit = vi.fn();
  const v = render(QuizBlock, { question: definition.quiz[0], onsubmit: submit });
  await fireEvent.click(v.getByLabelText(definition.quiz[0].options[0].text));
  await fireEvent.click(v.getByText('检查理解'));
  expect(submit).toHaveBeenCalledWith('zero');
  expect(v.getByText('回答正确')).toBeTruthy();
});
