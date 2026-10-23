import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Component } from 'svelte';
import type { LessonBodyProps } from '../../src/lib/lesson/contract.ts';
import { lessonById } from '../../src/lib/curriculum/catalog.ts';
import FitLesson from '../../src/lessons/M01-020/Lesson.svelte';

const lessons = import.meta.glob<{ default: Component<LessonBodyProps> }>(
  '../../src/lessons/M01-*/Lesson.svelte',
  { eager: true },
);
const explorations = import.meta.glob<{
  exploration: {
    prompt: string;
    options: { text: string; correct: boolean; observation: string }[];
    hints: string[];
    explanation: string;
  };
}>('../../src/lessons/M01-*/exploration.ts', { eager: true });
afterEach(cleanup);
beforeEach(() =>
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })),
);
afterEach(() => vi.unstubAllGlobals());

for (const [path, module] of Object.entries(lessons)) {
  const id = path.split('/').at(-2)!;
  const exploration = explorations[path.replace('Lesson.svelte', 'exploration.ts')];
  if (!exploration) continue;
  const { exploration: spec } = exploration;
  it(`${id}：预测先于推导，提示不泄题，参数变化和复位清理反馈`, async () => {
    const view = render(module.default, { metadata: lessonById.get(id)! });
    const sections = [...view.container.querySelectorAll('section[id]')].map((s) => s.id);
    expect(sections.indexOf('experiment')).toBeLessThan(sections.indexOf('intuition'));
    expect(spec.options.filter((o) => o.correct)).toHaveLength(1);
    expect(view.queryByText(spec.explanation)).toBeNull();
    const lab = view.getByTestId('prediction-lab');
    expect(lab.querySelector('[hidden]')).toBeTruthy();
    const wrong = spec.options.find((o) => !o.correct)!;
    await fireEvent.click(view.getByLabelText(wrong.text));
    await fireEvent.click(view.getByRole('button', { name: '用实验检验预测' }));
    expect(lab.querySelector('[hidden]')).toBeNull();
    await fireEvent.click(view.getByRole('button', { name: '对照我的预测' }));
    expect(
      view.getByText(new RegExp(wrong.observation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
    ).toBeTruthy();
    expect(view.queryByText(spec.explanation)).toBeNull();
    await fireEvent.click(view.getByRole('button', { name: '给一点提示' }));
    expect(view.getByText(spec.hints[0])).toBeTruthy();
    expect(view.queryByText(spec.hints[1])).toBeNull();
    await fireEvent.click(view.getByRole('button', { name: '给一点提示' }));
    expect(view.getByText(spec.hints[1])).toBeTruthy();
    expect((view.getByRole('button', { name: '给一点提示' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    const input = lab.querySelector<HTMLInputElement>('input[type="range"]');
    if (input) {
      const next =
        Number(input.value) === Number(input.max) ? Number(input.min) : Number(input.max);
      await fireEvent.input(input, { target: { value: String(next) } });
    } else {
      const text = lab.querySelector<HTMLInputElement>('input[type="text"]')!;
      await fireEvent.input(text, {
        target: { value: id === 'M01-021' ? '3,1' : text.value === '1' ? '0' : '1' },
      });
    }
    expect(view.getByText(/参数已改变/)).toBeTruthy();
    await fireEvent.click(view.getByRole('button', { name: '查看推理' }));
    expect(view.getByText(spec.explanation)).toBeTruthy();
    await fireEvent.click(view.getByRole('button', { name: '复位 ↺' }));
    expect(view.queryByText(spec.explanation)).toBeNull();
    expect(
      [...lab.querySelectorAll<HTMLInputElement>('input[type="radio"]')].every((i) => !i.checked),
    ).toBe(true);
    expect(view.getByText(/^迁移：/)).toBeTruthy();
  });
}

it('M01-020：候选线、逐点误差、总损失同步，复位恢复候选参数', async () => {
  const v = render(FitLesson, { metadata: lessonById.get('M01-020')! });
  await fireEvent.click(v.getByRole('button', { name: '直接探索' }));
  expect(v.getByTestId('candidate-loss').textContent).toContain('SSE=1');
  await fireEvent.input(v.getByLabelText('我的斜率 a'), { target: { value: '1.5' } });
  await fireEvent.input(v.getByLabelText('我的截距 c'), { target: { value: String(4 / 3) } });
  expect(v.getByTestId('candidate-loss').textContent).toContain('SSE=0.16667');
  expect(v.container.querySelector('[data-series="candidate"]')).toBeTruthy();
  await fireEvent.click(v.getByRole('button', { name: '复位 ↺' }));
  expect(v.getByTestId('candidate-loss').textContent).toContain('SSE=1');
});
