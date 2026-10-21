import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes = [
  ['向量内积与夹角', 'math/linear-algebra/dot-product'],
  ['随机变量与分布函数', 'math/probability/random-variables'],
  ['梯度下降', 'math/optimization/gradient-descent'],
] as const;
for (const [title, slug] of routes) {
  test(`${title}：从首页搜索进入、刷新、主题和移动布局`, async ({ page }, testInfo) => {
    await page.goto('./#/');
    await page.getByLabel('全站课程搜索').fill(title);
    await page.getByRole('button', { name: '搜索课程', exact: true }).click();
    await page
      .getByRole('link', { name: new RegExp(title) })
      .first()
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await page.locator('#experiment').scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('主题', { exact: true }).selectOption(theme);
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        theme === 'light' ? 'xianii-light' : 'xianii',
      );
      await page.screenshot({
        path: testInfo.outputPath(`${slug.split('/').at(-1)}-${theme}.png`),
        fullPage: true,
      });
      await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
      });
      const result = await new AxeBuilder({ page })
        .include('.lesson-body')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    }
    await page.setViewportSize({ width: 320, height: 850 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
    await page.locator('.lesson-body').evaluate((el) => (el.style.fontSize = '200%'));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
  });
}
test('向量拖动与键盘输入同步更新点积', async ({ page }) => {
  await page.goto('./#/lesson/math/linear-algebra/dot-product');
  await expect(page.getByTestId('dot-result')).toHaveText('点积 = 6');
  const end = page.getByTestId('vector-end-0');
  await end.scrollIntoViewIfNeeded();
  const box = (await end.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 30, box.y + box.height / 2 + 20, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByTestId('dot-result')).not.toHaveText('点积 = 6');
  const moved = (await end.boundingBox())!;
  const canvas = (await page.locator('svg.vector-diagram').boundingBox())!;
  await page.mouse.move(moved.x + moved.width / 2, moved.y + moved.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width - 5, canvas.y + 5, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByLabel('a 的 x 分量', { exact: true })).toHaveValue('5');
  await expect(page.getByLabel('a 的 y 分量', { exact: true })).toHaveValue('5');
  await page.getByLabel('a 的 x 分量', { exact: true }).fill('2');
  await page.getByLabel('a 的 y 分量', { exact: true }).fill('0');
  await expect(page.getByTestId('dot-result')).toHaveText('点积 = 2');
  await page.getByRole('button', { name: '复位 ↺' }).click();
  await expect(page.getByTestId('dot-result')).toHaveText('点积 = 6');
});
test('正态曲线随 μ 改变，固定 seed 复现，CDF 正确跳转', async ({ page }) => {
  await page.goto('./#/lesson/math/probability/random-variables');
  const curve = page.locator('[data-series="theory"]');
  await expect(curve).toBeAttached();
  const before = await curve.getAttribute('d');
  const sample = await page.getByTestId('sample-preview').textContent();
  await page.getByLabel('均值 μ', { exact: true }).fill('2');
  await expect(curve).not.toHaveAttribute('d', before!);
  await page.getByRole('button', { name: '重新采样（新 seed）' }).click();
  await expect(page.getByTestId('sample-preview')).not.toHaveText(sample!);
  await page.getByRole('button', { name: '复位 ↺' }).click();
  await expect(page.getByTestId('sample-preview')).toHaveText(sample!);
  await page.getByLabel('CDF 视图', { exact: true }).check();
  await expect(page.locator('.legend').first()).toContainText('CDF');
});
test('梯度下降单步、复位、预算、参数变化和减少动态效果', async ({ page }) => {
  await page.goto('./#/lesson/math/optimization/gradient-descent');
  const state = page.getByTestId('optimization-state');
  await expect(state).toContainText('第 0 步');
  await page.getByRole('button', { name: '单步', exact: true }).click();
  await expect(state).toContainText('参数 (-1.2)');
  await page.getByRole('button', { name: '重置迭代', exact: true }).click();
  await expect(state).toContainText('参数 (-2)');
  await page.getByLabel('最大迭代步数', { exact: true }).fill('1');
  await page.getByRole('button', { name: '单步', exact: true }).click();
  await expect(page.getByRole('button', { name: '单步', exact: true })).toBeDisabled();
  await page.getByLabel('学习率 η', { exact: true }).fill('0.2');
  await expect(state).toContainText('第 0 步');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: '播放', exact: true })).toBeDisabled();
});
