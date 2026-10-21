# Phase 0 验证记录

验证日期：2026-10-21。Node 24.9.0，pnpm 11.5.2，Linux x86_64。
这是 Phase 0 交付时的历史记录；后续新增或修订课程按最新 LESSON_SPEC 验收，不表示既有示范课已追溯满足后续新增的教学要求。

## 已完成

- 12 模块、247 课程元数据通过 schema、唯一性、引用与 DAG 校验。
- 247 张任务卡生成并通过同步检查，所有核心公式可被 KaTeX 解析。
- 实现状态：M01-002 ready，其他 246 课 planned；没有批量空 Lesson.svelte。
- svelte-check 与 TypeScript：零错误、零警告；ESLint 与格式检查通过。
- Vitest：6 个文件、15 个数学/基础设施/组件测试通过。
- 根路径 production build 与 11 个浏览器场景通过。
- `/IML-Academy-for-xianii/` production build 与 11 个浏览器场景通过。
- Chromium 遍历全部 247 个课程入口；正式课程验证实际章节加载，规划课不能完成。
- Chromium/Firefox/WebKit 核心交互、复位、测验、完成记录、刷新、导出与导入确认通过。
- 首页、规划课、示范课、进度页的亮暗主题 axe 扫描通过。
- 320、768、1024、1440 宽度的布局检查；首页和课程页已截图视觉检查。
- 首次缓存后离线刷新、课程切换和数学公式显示通过。
- 损坏/不可用 localStorage 降级，不覆盖损坏旧数据。

本机 WebKit 使用下载到 `/tmp` 的运行库预加载完成测试，没有修改系统包。CI 在 Ubuntu 24.04 使用 Playwright 官方 `install --with-deps`。

## 验证边界

- 自动检查无法证明全部任务卡未来实现的数学正确性；每课 ready 前仍需独立教学与数学审阅。
- Phase 1 的通用图表、矩阵、逐步算法和本地实验组件尚未实现；接口需求已写入 COMPONENTS 与 PLAN。
- 没有执行 Python/GPU/MuJoCo/硬件训练实验，Phase 0 不包含这些实验的实际实现。
- Service Worker 的提示更新由官方插件管理；跨真实版本升级仍需后续发布回归。
- 首次离线、缓存被清理、外部参考站点不承诺可用。

GitHub Actions 和 Pages 的实际发布状态以远端工作流为准。
