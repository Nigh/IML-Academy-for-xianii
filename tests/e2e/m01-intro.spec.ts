import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = './#/lesson/math/linear-algebra/scalars-vectors';

test('M01-001：三个例子与换轴在横屏同屏，图形与读数一致', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(route);
  const workbench = page.getByTestId('intro-workbench');
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('主题', { exact: true }).selectOption(theme);
      for (const example of ['东北方向', '西北方向', '零位移']) {
        await page.getByRole('button', { name: '复位实验', exact: true }).click();
        await page.getByRole('button', { name: example, exact: true }).click();
        await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
        const before = await page.getByTestId('intro-robot').getAttribute('aria-label');
        await page.getByRole('button', { name: '换坐标轴', exact: true }).click();
        for (const rotated of [false, true]) {
          if (rotated) {
            await page.getByRole('button', { name: '长度不变', exact: true }).click();
            await page.getByRole('button', { name: '坐标轴逆时针转 90°', exact: true }).click();
            await page.getByLabel('显示相同距离的位置（点线圆）', { exact: true }).check();
          }
          await workbench.evaluate((e) =>
            e.scrollIntoView({ block: 'start', behavior: 'instant' }),
          );
          for (const area of [
            workbench.locator('svg'),
            page.getByTestId('intro-controls'),
            page.getByTestId('intro-result'),
          ]) {
            const box = (await area.boundingBox())!;
            expect(box.y).toBeGreaterThanOrEqual(63);
            expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
          }
          await expect(page.getByTestId('intro-robot')).toHaveAttribute('aria-label', before!);
        }
        await expect(page.getByTestId('intro-components')).toContainText(
          example === '东北方向' ? '(4, -3)' : example === '西北方向' ? '(4, 3)' : '(0, 0)',
        );
        await expect(page.getByTestId('intro-length')).toHaveText(
          example === '零位移' ? '0 m' : '5 m',
        );
        if (example === '零位移') {
          await expect(page.getByTestId('intro-vector')).toHaveCount(0);
          await expect(page.getByTestId('same-distance-circle')).toHaveCount(0);
        }
        await workbench.screenshot({
          path: info.outputPath(`${theme}-${viewport.width}-${example}.png`),
        });
      }
      const audit = await new AxeBuilder({ page }).include('.lesson-body').analyze();
      expect(audit.violations).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      const available = (await workbench.boundingBox())!.width;
      expect((await page.locator('#intuition > p').first().boundingBox())!.width).toBeGreaterThan(
        available * 0.9,
      );
    }
  }
});

test('M01-001：运动结束才留箭头，换坐标不搬机器人，改参取消旧运动', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(route);
  const robot = page.getByTestId('intro-robot');
  const sample = () =>
    robot.evaluate((e) => {
      const m = e.getAttribute('aria-label')!.match(/\(([-\d.]+), ([-\d.]+)\)/)!;
      return {
        x: Number(m[1]),
        y: Number(m[2]),
        arrow: !!document.querySelector('[data-testid="intro-vector"]'),
      };
    });
  const started = await page.evaluate(() => performance.now());
  await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
  await expect.poll(async () => (await sample()).x, { intervals: [20] }).toBeGreaterThan(0.4);
  const middle = await sample();
  expect(middle.x).toBeLessThan(3);
  expect(Math.abs(middle.y - (4 * middle.x) / 3)).toBeLessThan(0.04);
  expect(middle.arrow).toBe(false);
  await expect(robot).toHaveAttribute('aria-label', /位置 \(3, 4\)/);
  await expect(page.getByTestId('intro-vector')).toHaveCount(1);
  expect((await page.evaluate(() => performance.now())) - started).toBeGreaterThanOrEqual(950);
  const endpoint = await page
    .getByTestId('intro-vector')
    .evaluate((e) => [e.getAttribute('x2'), e.getAttribute('y2')]);
  await page.getByRole('button', { name: '换坐标轴', exact: true }).click();
  await page.getByRole('button', { name: '长度改变', exact: true }).click();
  await page.getByRole('button', { name: '坐标轴逆时针转 90°', exact: true }).click();
  await expect(page.getByTestId('intro-components')).toContainText('(4, -3)');
  await expect(robot).toHaveAttribute('aria-label', /位置 \(3, 4\)/);
  expect(
    await page
      .getByTestId('intro-vector')
      .evaluate((e) => [e.getAttribute('x2'), e.getAttribute('y2')]),
  ).toEqual(endpoint);
  await page.getByRole('button', { name: '增加东西位移', exact: true }).click();
  await expect(robot).toHaveAttribute('aria-label', /位置 \(0, 0\)/);
  for (const id of ['intro-vector', 'component-guide', 'same-distance-circle', 'axis-feedback'])
    await expect(page.getByTestId(id)).toHaveCount(0);
  await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
  await expect.poll(async () => (await sample()).x, { intervals: [20] }).toBeGreaterThan(0.4);
  await page.getByRole('button', { name: '复位实验', exact: true }).click();
  await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
  await expect(robot).toHaveAttribute('aria-label', /位置 \(3, 4\)/);
  await expect(page.getByTestId('intro-components')).toContainText('(3, 4)');
});

test('M01-001：键盘加减覆盖边界，零向量与桌面缩放可操作', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(route);
  const increase = page.getByRole('button', { name: '增加东西位移', exact: true });
  await increase.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(increase).toBeDisabled();
  await expect(page.getByRole('status', { name: '东西位移 (m)', exact: true })).toHaveText('5');
  for (let i = 0; i < 10; i++)
    await page.getByRole('button', { name: '减少东西位移', exact: true }).click();
  await expect(page.getByRole('button', { name: '减少东西位移', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
  await expect(page.getByTestId('intro-robot')).toHaveAttribute('aria-label', /位置 \(-5, 4\)/);
  await page.getByLabel('显示相同距离的位置（点线圆）', { exact: true }).check();
  await expect(page.getByTestId('same-distance-circle')).toBeVisible();
  await page.getByRole('button', { name: '零位移', exact: true }).click();
  await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
  await expect(page.getByTestId('intro-length')).toHaveText('0 m');
  await expect(page.getByTestId('intro-vector')).toHaveCount(0);
  await expect(page.getByTestId('intro-result')).toContainText('方向未定义');
  await page.locator('html').evaluate((e) => (e.style.fontSize = '200%'));
  await page.getByRole('button', { name: '复位实验', exact: true }).click();
  await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
  await expect(page.getByTestId('intro-robot')).toHaveAttribute('aria-label', /位置 \(3, 4\)/);
  await page.screenshot({ path: info.outputPath('text-200.png'), fullPage: true });
  await page.locator('html').evaluate((e) => e.style.removeProperty('font-size'));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
  await page.screenshot({ path: info.outputPath('zoom-200.png') });
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await page.screenshot({ path: info.outputPath('high-dpi.png') });
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  await expect(page.getByRole('button', { name: '标记为已完成', exact: true })).toHaveCount(0);
});

test('M01-001：坐标轴匀速转动，机器人固定，跨半圈仍逆时针且复位取消动画', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(route);
  await page.getByRole('button', { name: '执行移动（1 秒）', exact: true }).click();
  await page.getByRole('button', { name: '换坐标轴', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const turn = page.getByRole('button', { name: '坐标轴逆时针转 90°', exact: true });
  const axes = page.getByTestId('intro-axes');
  const angle = () =>
    axes.evaluate((e) => Number(e.getAttribute('transform')!.match(/rotate\(([-\d.]+)\)/)![1]));
  for (const start of [0, -90, -180, 90]) {
    await turn.click();
    await expect(turn).toBeDisabled();
    await expect.poll(angle, { intervals: [20] }).toBeLessThan(start - 15);
    const middle = await angle();
    expect(middle).toBeGreaterThan(start - 90);
    await expect(page.getByTestId('intro-robot')).toHaveAttribute('aria-label', /位置 \(3, 4\)/);
    await expect(page.getByTestId('intro-length')).toHaveText('5 m');
    await expect(page.getByTestId('axis-feedback')).toHaveCount(0);
    await expect(turn).toBeEnabled();
    await expect(axes).toHaveAttribute(
      'transform',
      `translate(240 200) rotate(${start === -180 ? 90 : start - 90})`,
    );
  }
  await expect(page.getByTestId('intro-components')).toContainText('(3, 4)');
  await turn.click();
  await expect.poll(angle, { intervals: [20] }).toBeLessThan(-15);
  await page.getByRole('button', { name: '坐标轴回正', exact: true }).click();
  await page.waitForTimeout(1100);
  await expect(axes).toHaveAttribute('transform', 'translate(240 200) rotate(0)');
  await expect(page.getByTestId('intro-components')).toContainText('(3, 4)');
  await expect(page.getByTestId('axis-feedback')).toHaveCount(0);
});
