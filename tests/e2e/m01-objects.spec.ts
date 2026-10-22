import { test, expect } from '@playwright/test';

test('移动平台：执行两段指令、改参清理、抵消与键盘复位', async ({ page }) => {
  await page.goto('./#/lesson/math/linear-algebra/vector-addition');
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  const position = page.getByTestId('platform-position');
  await page.getByRole('button', { name: '执行第一段', exact: true }).click();
  await expect(position).toContainText('(2, 1) 米');
  await page.getByRole('button', { name: '执行第二段', exact: true }).click();
  await expect(position).toContainText('(1, 3) 米');
  await page.getByRole('textbox', { name: '第一段东西位移 (m)', exact: true }).fill('3');
  await expect(position).toContainText('等待指令');
  await expect(page.getByText('(2, 3) m', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '场景二：完全抵消' }).click();
  await page.getByRole('button', { name: '执行第一段', exact: true }).click();
  await page.getByRole('button', { name: '执行第二段', exact: true }).click();
  await expect(position).toContainText('(0, 0) 米');
  const reset = page.getByRole('button', { name: '复位 ↺' });
  await reset.focus();
  await page.keyboard.press('Enter');
  await expect(position).toContainText('等待指令');
  await expect(page.getByText('(1, 3) m', { exact: true })).toBeVisible();
});
import lessons from '../../curriculum/lessons.json' with { type: 'json' };
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
  ['M01-012', ['把印章压扁'], 'object-reading', '标记(0.250, 0.000)'],
  ['M01-013', ['试着相互抵消'], 'object-reading', '平台位置 (0.00e+0, 0.00e+0)'],
  ['M01-014', ['第一路加半格，第二路减半格'], 'object-reading', '输出 0.000'],
  ['M01-016', ['采用伪逆分配'], 'drive-readings', '表 1：2；目标 2；差值 0'],
  ['M01-017', ['模板竖直放置'], 'template-reading', '输出 (0,3)'],
  ['M01-018', ['压平第二方向'], 'stamp-reading', '保留方向数 1'],
  ['M01-019', ['传输 2 层'], 'tile-reading', '丢失量 0'],
  ['M01-020', ['零点提高半单位', '增益提高半单位'], 'sample-readings', '仪表预测 3'],
  ['M01-021', ['读取坐标 1,2,3', '偏置板整体减1'], 'sensor-reading', '= 35'],
] as const;
for (const [id, actions, reading, expected] of tasks) {
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
  await page.goto(`./#/lesson/${lessons.find((l) => l.id === 'M01-006')!.slug}`);
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await page.getByRole('button', { name: '场景一对照：共线二向量', exact: true }).click();
  await page.getByLabel('驱动 1 的有符号份数', { exact: true }).fill('-2');
  await page.getByLabel('驱动 2 的有符号份数', { exact: true }).fill('1');
  await expect(page.getByTestId('object-result')).toContainText('指令不全为零；已回到起点');
});

test('M01-015：控制输入与两只标定表同步', async ({ page }) => {
  await page.goto(`./#/lesson/${lessons.find((l) => l.id === 'M01-015')!.slug}`);
  await page.getByRole('button', { name: '直接探索', exact: true }).click();
  await page.getByLabel('控制器一指令 x₁', { exact: true }).fill('2');
  await page.getByLabel('控制器二指令 x₂', { exact: true }).fill('1');
  await expect(page.getByTestId('instrument-readings')).toContainText('表一：2；目标 2；差值 0');
});
