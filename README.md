# Interactive Machine Learning Academy for xianii

面向工程师的交互式机器学习自学课程。用中文建立数学直觉，通过浏览器实验验证原理，再在本地环境完成工程实践。

**12 个模块 · 247 节预注册课程 · Phase 0：1 节已发布示范课，其余为规划页。**

[在线课程](https://nigh.github.io/IML-Academy-for-xianii/) · [完整课程与依赖](docs/CURRICULUM.md) · [架构](docs/ARCHITECTURE.md) · [实施计划](PLAN.md)

## 本地运行

要求 Node.js 24（`.node-version` 固定开发版本）和 pnpm 11.5.2。

```sh
corepack enable
corepack prepare pnpm@11.5.2 --activate
pnpm install
pnpm dev
```

开发服务器输出本地地址。网页无需后端、登录、API Key 或本地 ML 环境。依赖安装需要联网；生产网站完成离线缓存后可离线浏览。

```sh
pnpm check
pnpm lint
pnpm format:check
pnpm validate:curriculum
pnpm validate:lessons
pnpm tasks:check
pnpm docs:check
pnpm test
pnpm build
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test:e2e
```

`pnpm test` 单次运行；`pnpm preview` 预览 production build（包含 Service Worker）。开发模式不注册离线缓存。

## 开发一节课程

1. 阅读 [AGENTS.md](AGENTS.md)、[课程协议](docs/LESSON_SPEC.md)、[组件合同](docs/COMPONENTS.md)。
2. 从 [课程目录](docs/CURRICULUM.md) 选择已注册 ID，读取 `curriculum/tasks/<ID>.md`。
3. 创建 `lesson/<ID>-<slug>` 分支或独立 worktree。
4. 只在 `src/lessons/<ID>/` 和 `labs/lessons/<ID>/` 实现该课。
5. 提供 `lesson.ts`、`Lesson.svelte`、`experiment.ts`、`experiment.test.ts`、`lesson.test.ts`。
6. 声明 draft 开始开发。内容与必要验证完成后改为 ready。
7. 运行以上检查，提交一个课程的 PR，附截图与数学验证证据。

无需修改 App、路由或中央实现注册表。未实现的已注册课程自动显示同一个规划页。

课程身份在 `curriculum/lessons.json`；教学设计在 `curriculum/designs/Mxx.json`。维护者修改设计源后运行：

```sh
pnpm tasks:generate
pnpm docs:generate
pnpm format
```

任务卡与课程文档由脚本确定性生成，不要直接修改生成结果。课程 ID 永不复用。

## GitHub Pages

仓库：<https://github.com/Nigh/IML-Academy-for-xianii>

在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
`main` 更新后，Deploy 执行同等质量检查、构建并发布到 Pages。仓库公开可读，进度只保存在访问者的浏览器。

- hash 路由形如 `/IML-Academy-for-xianii/#/lesson/math/linear-algebra/vector-addition`，刷新不依赖服务器路由回退。
- Deploy 自动读取 Pages 的 base path。本地默认 `/`。
- 子路径构建：`VITE_BASE_PATH=/IML-Academy-for-xianii/ pnpm build`，预览同一构建后访问对应子路径。
- 自定义域名：配置 Pages 域名和 CNAME，将构建 base 设为 `/`；同时检查 SW scope、manifest 和旧链接迁移。
- `dist/`、测试报告、依赖和缓存不提交 Git。

在线链接只有在 Pages 成功部署后可用。Actions 检查结果是发布是否成功的依据。

## 学习与隐私

课程可自由访问；前置知识只提示，不锁定学习。规划课不计入完成率，也不能标记完成。
进度支持 JSON 导出、校验预览和确认合并。浏览器存储损坏或不可用时进入内存模式并提示。

无第三方统计、广告、云端同步。外部参考与数据源需要联网，离线不保证可访问。
Python、PyTorch、MuJoCo 和硬件实验由用户自行管理环境：[本地实验规范](docs/LOCAL_LABS.md)。

## 技术栈与后续阶段

Svelte 5 · TypeScript strict · Vite · Tailwind v4 · daisyUI v5 · Xianii Design Tokens · KaTeX · Vitest · Playwright。

Phase 1 完成通用交互原语并冻结 v1 合同；Phase 2 按单课独立 PR 持续实现。不在 Phase 0 批量生成课程正文。
