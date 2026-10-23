import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import lessons from '../../curriculum/lessons.json' with { type: 'json' };

const selected: { lessons: { id: string }[] } = JSON.parse(
  process.env.LESSON_SELECTION || '{"lessons":[]}',
);
const selectedIds = new Set(selected.lessons.map((lesson) => lesson.id));
for (const lesson of lessons.filter(
  (l) =>
    l.id.startsWith('M01-') &&
    selectedIds.has(l.id) &&
    existsSync(`src/lessons/${l.id}/exploration.ts`),
)) {
  test(`${lesson.id}：预测、全部预设、复位和横屏桌面`, async ({ page }, info) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./#/lesson/${lesson.slug}`);
    const lab = page.getByTestId('prediction-lab');
    await expect(lab).toBeVisible();
    await expect(lab.getByRole('button', { name: '复位 ↺' })).toBeHidden();
    await lab.getByRole('radio').first().check();
    await lab.getByRole('button', { name: '用实验检验预测' }).click();
    await lab.getByRole('button', { name: '对照我的预测' }).click();
    await lab.getByRole('button', { name: '给一点提示' }).click();
    await lab.getByRole('button', { name: '给一点提示' }).click();
    await expect(lab.getByRole('button', { name: '给一点提示' })).toBeDisabled();
    await lab.getByRole('button', { name: '查看推理' }).click();
    const presets = lab.locator('.presets button[aria-pressed], .scenario-buttons > button');
    const count = await presets.count();
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('主题', { exact: true }).selectOption(theme);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
      });
      for (let i = 0; i < count; i++) {
        await presets.nth(i).click();
        if (lesson.id === 'M01-021' && (await presets.nth(i).innerText()).includes('不兼容')) {
          await expect(lab.getByText(/^无法计算：/)).toBeVisible();
          await expect(lab.getByTestId('trace')).toHaveCount(0);
        } else await expect(lab.locator('svg, table').first()).toBeVisible();
        await lab.screenshot({ path: info.outputPath(`${theme}-preset-${i}.png`) });
      }
      if (!count) await lab.screenshot({ path: info.outputPath(`${theme}-default.png`) });
      const audit = await new AxeBuilder({ page })
        .include('.lesson-body')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(audit.violations).toEqual([]);
      await lab.getByRole('button', { name: '复位 ↺' }).click();
      await expect(lab.getByRole('radio').first()).not.toBeChecked();
      await lab.screenshot({ path: info.outputPath(`${theme}-desktop-reset.png`) });
      await page.locator('.lesson-body').evaluate((el) => {
        el.style.fontSize = '200%';
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      await page.locator('.lesson-body').evaluate((el) => {
        el.style.fontSize = '';
      });
    }
    // Real browser zoom also checks the visual viewport, beyond enlarged lesson text.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
    await page.screenshot({ path: info.outputPath('zoom-200.png') });
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    expect(errors).toEqual([]);
  });
}

test('最小二乘：键盘调整候选线，平方误差同步并可复位', async ({ page }) => {
  await page.goto('./#/lesson/math/linear-algebra/least-squares');
  await page.getByRole('button', { name: '直接探索' }).click();
  await expect(page.getByTestId('candidate-loss')).toContainText('SSE=1');
  await page.getByLabel('我的斜率 a', { exact: true }).fill('1.5');
  await page.getByLabel('我的截距 c', { exact: true }).fill(String(4 / 3));
  await expect(page.getByTestId('candidate-loss')).toContainText('SSE=0.16667');
  await page.getByRole('button', { name: '复位 ↺' }).click();
  await expect(page.getByTestId('candidate-loss')).toContainText('SSE=1');
});
