import { existsSync } from 'node:fs';
import lessons from '../../curriculum/lessons.json' with { type: 'json' };
import { test, expect } from '@playwright/test';
test('示范课交互、复位、测验、完成、进度导出和深链接刷新 @smoke', async ({ page }) => {
  await page.goto('./#/lesson/math/linear-algebra/vector-addition');
  await expect(page.getByText('(1, 3) m')).toBeVisible();
  await page.getByRole('button', { name: '场景二：完全抵消' }).click();
  await expect(page.getByText('(0, 0) m')).toBeVisible();
  await page.getByRole('button', { name: '复位 ↺' }).click();
  await expect(page.getByText('(1, 3) m')).toBeVisible();
  await page.getByLabel('合位移为 (0,0)m，路径长度为 2√5m', { exact: true }).check();
  await page.getByRole('button', { name: '检查理解', exact: true }).click();
  await expect(page.getByText('回答正确', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '标记为已完成' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '已完成 ✓' })).toBeDisabled();
  await page.goto('./#/progress');
  await expect(page.locator('.progress-overview > strong')).toHaveText(/^1\s*\/\s*\d+$/);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出 JSON 备份 ↓' }).click();
  expect((await download).suggestedFilename()).toMatch(/iml-progress.*json/);
});
test('进度导入需确认，非法文件保留现有进度', async ({ page }) => {
  await page.goto('./#/progress');
  await page
    .getByLabel('导入进度 JSON')
    .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  await expect(page.getByText(/无法导入/)).toBeVisible();
  const planned = lessons.find((l) => !existsSync(`src/lessons/${l.id}/lesson.ts`));
  const data = {
    schemaVersion: 1,
    updatedAt: 30,
    lessons: {
      'M99-001': { visitedAt: 20, answers: {} },
      ...(planned ? { [planned.id]: { visitedAt: 20, completedAt: 20, answers: {} } } : {}),
    },
  };
  await page.getByLabel('导入进度 JSON').setInputFiles({
    name: 'valid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '确认合并' }).click();
  await expect(page.getByText('进度已合并。')).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('iml-academy.progress.v1')!),
  );
  expect(saved.lessons['M99-001']).toBeTruthy();
  if (planned) expect(saved.lessons[planned.id].completedAt).toBeUndefined();
});

test('品牌 logo 加载并链接回首页 @smoke', async ({ page }) => {
  await page.goto('./#/curriculum');
  const brand = page.getByRole('link', { name: 'IML Academy FOR XIANII' });
  const logo = brand.locator('img');
  await expect(logo).toBeVisible();
  expect(
    await logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
  ).toBe(true);
  await page.setViewportSize({ width: 320, height: 850 });
  await expect(logo).toBeVisible();
  await brand.click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('亲手理解机器学习');
});
