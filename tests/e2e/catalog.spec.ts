import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import lessons from '../../curriculum/lessons.json' with { type: 'json' };
import AxeBuilder from '@axe-core/playwright';
async function audit(page: Page) {
  // Audit settled theme colors rather than intermediate CSS transition colors.
  await page.evaluate(async () => {
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  return new AxeBuilder({ page }).analyze();
}
// Local runs use explicit selections too; no implicit full-catalog fallback.
const selection: { lessons: typeof lessons; removed: typeof lessons } = JSON.parse(
  process.env.LESSON_SELECTION || '{"lessons":[],"removed":[]}',
);
test('选中课程深链接能加载，planned 与 draft 不能完成', async ({ page }) => {
  test.skip(selection.lessons.length + selection.removed.length === 0, '无课程变更');
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  for (const lesson of selection.lessons) {
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
      if (definition.status === 'draft') {
        await expect(page.locator('.status-badge[data-status="draft"]')).toBeVisible();
        await expect(
          page.getByText('这是一节草稿课，内容仍在验证中，暂不计入完成率。'),
        ).toBeVisible();
        await expect(page.getByRole('button', { name: '标记为已完成' })).toHaveCount(0);
      }
    }
  }
  for (const lesson of selection.removed) {
    await page.goto(`./#/lesson/${lesson.slug}`);
    await expect(page.getByRole('heading', { name: '这条路径没有对应的课程' })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test('代表性 planned 页面仍可加载 @smoke', async ({ page }) => {
  const planned = lessons.find((lesson) => !existsSync(`src/lessons/${lesson.id}/lesson.ts`));
  test.skip(!planned, '全部课程已实现');
  await page.goto(`./#/lesson/${planned!.slug}`);
  await expect(page.getByRole('heading', { name: '这一节已列入学习地图' })).toBeVisible();
  await expect(page.getByRole('button', { name: '标记为已完成' })).toHaveCount(0);
});
test('搜索、模块、主题、横屏桌面和无障碍', async ({ page }) => {
  await page.goto('./#/curriculum');
  await page.getByRole('searchbox', { name: '搜索课程', exact: true }).fill('M03-010');
  await expect(page.getByText('找到 1 节课程')).toBeVisible();
  await page.getByRole('link', { name: /M03-010/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: '梯度下降' })).toBeVisible();
  await page.getByLabel('主题', { exact: true }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'xianii-light');
  let results = await audit(page);
  expect(results.violations).toEqual([]);
  await page.getByLabel('主题', { exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'xianii');
  results = await audit(page);
  expect(results.violations).toEqual([]);
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
test('已缓存应用和示范课可以离线刷新，字体与 chunk 无错误 @smoke', async ({ page, context }) => {
  await page.goto('./#/lesson/math/linear-algebra/vector-addition');
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await expect(page.getByTestId('movement-result')).toContainText('(1, 3) m');
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
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await expect(page.getByTestId('movement-result')).toContainText('(1, 3) m');
  await page.getByRole('button', { name: '原路返回', exact: true }).click();
  await expect(page.getByTestId('movement-result')).toContainText('(0, 0) m');
  await page.goto('./#/lesson/math/optimization/gradient-descent');
  await expect(page.getByRole('heading', { name: '梯度下降', exact: true })).toBeVisible();
  await context.setOffline(false);
});

test('首页、示范课与进度页在亮暗主题下可访问', async ({ page }) => {
  for (const route of ['#/', '#/lesson/math/linear-algebra/vector-addition', '#/progress']) {
    await page.goto(`./${route}`);
    if (route.includes('vector-addition')) {
      await page.getByRole('button', { name: '直接探索', exact: true }).click();
      await expect(page.getByTestId('movement-result')).toContainText('(1, 3) m');
    }
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('主题', { exact: true }).selectOption(theme);
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        theme === 'light' ? 'xianii-light' : 'xianii',
      );
      const result = await audit(page);
      expect(result.violations, `${route} ${theme}`).toEqual([]);
    }
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
    await page.getByRole('button', { name: '直接探索', exact: true }).click();
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
