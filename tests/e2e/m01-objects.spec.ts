import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('M01-002：同图控制与结果在横屏同屏，全部场景可复位', async ({ page }, info) => {
  await page.goto('./#/lesson/math/linear-algebra/vector-addition');
  const route = page.url();
  await page.getByRole('link', { name: '两段移动后的终点', exact: true }).click();
  await expect(page).toHaveURL(route);
  const workbench = page.getByTestId('robot-workbench');
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('主题', { exact: true }).selectOption(theme);
      for (const stage of ['两段移动', '原路返回', '改变速度']) {
        await workbench.getByRole('button', { name: stage, exact: true }).click();
        if (stage === '两段移动')
          await workbench.getByRole('button', { name: '直接探索', exact: true }).click();
        if (stage === '改变速度') {
          for (const preset of ['两倍速', '反向', '静止', '反向两倍速']) {
            await workbench.getByRole('button', { name: preset, exact: true }).click();
            await expect(page.getByTestId('velocity-reading')).toBeVisible();
          }
        }
        await workbench.evaluate((element) =>
          element.scrollIntoView({ block: 'start', behavior: 'instant' }),
        );
        for (const area of [
          workbench.locator('svg').first(),
          page.getByTestId('movement-controls'),
          page.getByTestId('movement-result'),
        ]) {
          const box = (await area.boundingBox())!;
          expect(box.y).toBeGreaterThanOrEqual(63);
          expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        ).toBe(true);
        await workbench.screenshot({
          path: info.outputPath(`${theme}-${viewport.width}-${stage}.png`),
        });
        await workbench.getByRole('button', { name: '复位实验', exact: true }).click();
      }
      await page.evaluate(async () => {
        await Promise.all(
          document.getAnimations().map((animation) => animation.finished.catch(() => {})),
        );
      });
      const audit = await new AxeBuilder({ page }).include('.lesson-body').analyze();
      expect(audit.violations).toEqual([]);
    }
  }
});

test('M01-002：地图预测、逐段执行、输入错误与速度倍率都有真实反馈', async ({ page }) => {
  await page.goto('./#/lesson/math/linear-algebra/vector-addition');
  const workbench = page.getByTestId('robot-workbench');
  const result = page.getByTestId('movement-result');
  await expect(result).not.toContainText('(1, 3)');
  const map = workbench.locator('svg').first();
  await map.scrollIntoViewIfNeeded();
  const target = await map.evaluate((element) => {
    const point = new DOMPoint(250, 66).matrixTransform((element as SVGSVGElement).getScreenCTM()!);
    return { x: point.x, y: point.y };
  });
  await page.mouse.click(target.x, target.y);
  await workbench.getByRole('button', { name: '执行下一段' }).click();
  await expect(page.getByTestId('robot-position')).toHaveAttribute('aria-label', /位置 \(2, 1\)/);
  await expect(page.getByTestId('prediction-feedback')).toHaveCount(0);
  await workbench.getByRole('button', { name: '执行下一段' }).click();
  await expect(page.getByTestId('prediction-feedback')).toContainText('一致');
  await page.getByLabel('第一段东西位移 (m)', { exact: true }).fill('3');
  await expect(result).toContainText('(2, 3) m');
  await expect(page.getByTestId('prediction-feedback')).toHaveCount(0);
  await page.getByLabel('第一段东西位移 (m)', { exact: true }).fill('100');
  await page.getByLabel('第一段东西位移 (m)', { exact: true }).press('Enter');
  await expect(page.getByLabel('第一段东西位移 (m)', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(result).toContainText('(2, 3) m');
  await workbench.getByRole('button', { name: '改变速度', exact: true }).click();
  await workbench.getByRole('button', { name: '反向两倍速', exact: true }).click();
  await expect(result).toContainText('(-4, -2) m');
  await expect(page.getByTestId('velocity-reading')).toContainText('(-4, -2) m/s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const execute = workbench.getByRole('button', { name: '执行 1 秒', exact: true });
  await execute.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('robot-position')).toHaveAttribute('aria-label', /位置 \(-4, -2\)/);
  await workbench.getByRole('button', { name: '静止', exact: true }).click();
  await expect(result).toContainText('方向未定义');
  await expect(page.getByTestId('sum-route')).toHaveCount(0);
});

test('M01-002：交换路线、键盘预测、缩放与课程导航保留可达性', async ({ page }, info) => {
  await page.goto('./#/lesson/math/linear-algebra/vector-addition');
  await page.getByLabel('预测 x (m)', { exact: true }).fill('0');
  await page.getByLabel('预测 y (m)', { exact: true }).fill('0');
  await page.getByRole('button', { name: /^在地图上标记预测/ }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '执行下一段', exact: true }).click();
  await page.getByRole('button', { name: '执行下一段', exact: true }).click();
  await expect(page.getByTestId('prediction-feedback')).toContainText('3.16 m');
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await page.getByRole('button', { name: '交换两段指令', exact: true }).click();
  await expect(page.getByTestId('movement-result')).toContainText('(1, 3) m');
  await page.getByRole('button', { name: '执行下一段', exact: true }).click();
  await expect(page.getByTestId('robot-position')).toHaveAttribute('aria-label', /位置 \(-1, 2\)/);
  await page.getByLabel('平行四边形辅助线', { exact: true }).check();
  await expect(page.getByTestId('parallelogram')).toBeVisible();
  await page.getByRole('button', { name: '课程导航', exact: true }).click();
  await expect(page.locator('#sidebar')).toBeVisible();
  await page.getByRole('button', { name: '课程导航', exact: true }).click();
  await expect(page.locator('#sidebar')).toBeHidden();
  await page.locator('html').evaluate((element) => {
    element.style.fontSize = '200%';
  });
  await page.getByRole('button', { name: '复位实验', exact: true }).click();
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await expect(page.getByTestId('movement-result')).toContainText('(1, 3) m');
  await page.screenshot({ path: info.outputPath('text-200.png'), fullPage: true });
  await page.locator('html').evaluate((element) => {
    element.style.removeProperty('font-size');
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
  await page.screenshot({ path: info.outputPath('zoom-200.png') });
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
});
import lessons from '../../curriculum/lessons.json' with { type: 'json' };
const selection: { lessons: { id: string }[] } = JSON.parse(
  process.env.LESSON_SELECTION || '{"lessons":[]}',
);
const selectedIds = new Set(selection.lessons.map((l) => l.id));
const tasks = [
  ['M01-001', ['终点向西 1m', '导航仪转向 / 回正'], 'object-result', '(4.000, -2.000)'],
  ['M01-003', ['记录 2', '后一个时刻'], 'object-result', '记录 2 / 2，时刻 2 / 3'],
  ['M01-004', ['场景二：平移直线', '成员乘以零'], 'object-result', '未通过成员检验'],
  ['M01-005', ['驱动一后退一份'], 'object-result', '距目标 1.0000'],
  ['M01-007', ['候选卡强度减半'], 'dot-result', '点积 = 3'],
  ['M01-008', ['收货点向东 1 m'], 'object-reading', '5.657'],
  ['M01-009', ['小车前进半步'], 'object-reading', '到目标 2.500'],
  ['M01-010', ['导轨逆时针转 15°'], 'object-reading', ''],
  ['M01-011', ['产品 1 加一件'], 'object-reading', '总量：65'],
  ['M01-012', ['把印章压扁'], 'object-reading', '(0.250, 0.000)'],
  ['M01-013', ['试着相互抵消'], 'object-reading', '平台位置 (0.00e+0, 0.00e+0)'],
  ['M01-014', ['第一路加半格，第二路减半格'], 'object-reading', '输出 0.000'],
  ['M01-016', ['采用伪逆分配'], 'drive-readings', '表 1：2；目标 2；差值 0'],
  ['M01-017', ['模板竖直放置'], 'template-reading', '输出 (0,3)'],
  ['M01-018', ['压平第二方向'], 'stamp-reading', '保留方向数 1'],
  ['M01-019', ['传输 2 层'], 'tile-reading', '丢失量 0'],
  ['M01-020', ['零点提高半单位', '增益提高半单位'], 'sample-readings', '仪表预测 3'],
  ['M01-021', ['读取坐标 1,2,3', '偏置板整体减1'], 'sensor-reading', '= 35'],
] as const;
for (const [id, actions, reading, expected] of tasks.filter(([id]) => selectedIds.has(id))) {
  test(`${id}：对象操作与任务读数联动`, async ({ page }) => {
    const lesson = lessons.find((l) => l.id === id)!;
    await page.goto(`./#/lesson/${lesson.slug}`);
    await page.getByRole('button', { name: '直接探索', exact: true }).click();
    await expect(page.getByTestId('object-workbench')).toBeVisible();
    for (const name of actions) await page.getByRole('button', { name, exact: true }).click();
    if (expected) await expect(page.getByTestId(reading)).toContainText(expected);
    else await expect(page.getByLabel('参考方向角 (°)', { exact: true })).toHaveValue('15');
    await page.getByRole('button', { name: '复位 ↺' }).click();
    await expect(page.getByTestId('object-workbench')).toBeVisible();
  });
}

test('M01-006：用非零指令寻找返回起点的组合', async ({ page }) => {
  test.skip(!selectedIds.has('M01-006'), '仅验证选中的课程');
  await page.goto(`./#/lesson/${lessons.find((l) => l.id === 'M01-006')!.slug}`);
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await page.getByRole('button', { name: '场景一对照：共线二向量', exact: true }).click();
  await page.getByLabel('驱动 1 的有符号份数', { exact: true }).fill('-2');
  await page.getByLabel('驱动 2 的有符号份数', { exact: true }).fill('1');
  await expect(page.getByTestId('object-result')).toContainText('指令不全为零；已回到起点');
});

test('M01-015：控制输入与两只标定表同步', async ({ page }) => {
  test.skip(!selectedIds.has('M01-015'), '仅验证选中的课程');
  await page.goto(`./#/lesson/${lessons.find((l) => l.id === 'M01-015')!.slug}`);
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await page.getByLabel('控制器一指令 x₁', { exact: true }).fill('2');
  await page.getByLabel('控制器二指令 x₂', { exact: true }).fill('1');
  await expect(page.getByTestId('instrument-readings')).toContainText('表一：2；目标 2；差值 0');
});
