import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';
import lessons from '../../curriculum/lessons.json' with { type: 'json' };
import AxeBuilder from '@axe-core/playwright';
test('所有 247 个课程深链接能加载，planned 不能完成', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  for (const lesson of lessons) {
    await page.goto(`./#/lesson/${lesson.slug}`);
    await expect(
      page.getByRole('heading', { level: 1, name: lesson.title, exact: true }),
    ).toBeVisible();
    if (!existsSync(`src/lessons/${lesson.id}/lesson.ts`)) {
      await expect(page.getByRole('heading', { name: '这一节已列入学习地图' })).toBeVisible();
      await expect(page.getByRole('button', { name: '标记为已完成' })).toHaveCount(0);
    } else {
      const definition = (
        await import(pathToFileURL(resolve('src/lessons', lesson.id, 'lesson.ts')).href)
      ).default;
      await expect(page.locator(`#${definition.sections[0].id}`)).toBeVisible();
      await expect(page.getByRole('heading', { name: '课程暂时无法加载' })).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});
test('搜索、模块、主题、响应式和无障碍', async ({ page }) => {
  await page.goto('./#/curriculum');
  await page.getByRole('searchbox', { name: '搜索课程', exact: true }).fill('M03-010');
  await expect(page.getByText('找到 1 节课程')).toBeVisible();
  await page.getByRole('link', { name: /M03-010/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: '梯度下降' })).toBeVisible();
  await page.getByLabel('主题', { exact: true }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'xianii-light');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.getByLabel('主题', { exact: true }).selectOption('dark');
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
test('已缓存应用和示范课可以离线刷新，字体与 chunk 无错误', async ({ page, context }) => {
  await page.goto('./#/lesson/math/linear-algebra/vector-addition');
  await expect(page.getByText('(1, 3) m')).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('(1, 3) m')).toBeVisible();
  await page.getByRole('button', { name: '场景二：完全抵消' }).click();
  await expect(page.getByText('(0, 0) m')).toBeVisible();
  await page.goto('./#/lesson/math/optimization/gradient-descent');
  await expect(page.getByRole('heading', { name: '梯度下降', exact: true })).toBeVisible();
  await context.setOffline(false);
});

test('首页、示范课与进度页在亮暗主题下可访问', async ({ page }) => {
  for (const route of ['#/', '#/lesson/math/linear-algebra/vector-addition', '#/progress']) {
    await page.goto(`./${route}`);
    if (route.includes('vector-addition')) await expect(page.getByText('(1, 3) m')).toBeVisible();
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('主题', { exact: true }).selectOption(theme);
      const result = await new AxeBuilder({ page }).analyze();
      expect(result.violations, `${route} ${theme}`).toEqual([]);
    }
    await page.setViewportSize({ width: 320, height: 850 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
});

test('存储损坏或不可用时不覆盖旧数据且可以学习', async ({ browser, baseURL }) => {
  for (const mode of ['corrupt', 'unavailable']) {
    const context = await browser.newContext({ baseURL });
    await context.addInitScript((mode) => {
      if (mode === 'corrupt') localStorage.setItem('iml-academy.progress.v1', '{bad');
      else
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new Error('unavailable');
          },
        });
    }, mode);
    const page = await context.newPage();
    await page.goto('./#/lesson/math/linear-algebra/vector-addition');
    await expect(page.getByText(/当前使用内存模式|浏览器存储不可用/)).toBeVisible();
    await expect(page.getByText('(1, 3) m')).toBeVisible();
    await page.getByRole('button', { name: '标记为已完成' }).click();
    await expect(page.getByRole('button', { name: '已完成 ✓' })).toBeDisabled();
    if (mode === 'corrupt')
      expect(await page.evaluate(() => localStorage.getItem('iml-academy.progress.v1'))).toBe(
        '{bad',
      );
    await context.close();
  }
});
