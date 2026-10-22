# 技术架构

## 模块边界

```text
curriculum/modules.json + lessons.json → catalog + DAG → router/navigation/search
curriculum/designs/Mxx.json + catalog → generated tasks + curriculum documentation
src/lessons/*/lesson.ts → eager light metadata → implementation status
src/lessons/*/Lesson.svelte → lazy code splitting → shared LessonShell
progress schema/storage → browser-local reactive state → shell/overview
```

`lessons.json` 是身份和学习关系的唯一真源。设计源仅以 ID 引用课程，不重复维护标题/依赖。生成任务卡作为便携开发输入提交仓库。

所有注册课程都可访问，未实现课程使用同一个 PlannedLesson。未知地址是 NotFound；加载错误与离线不可用不伪装成 planned。
目录中不存在的实现、ID 不一致、残缺目录、ready 缺内容/测试都使校验失败。

## 路由与部署

Vite SPA 原生 hash 路由，没有 SSR。`#/lesson/<slug>`、`#/module/<slug>`、`#/curriculum`、`#/progress` 与首页。
SvelteKit 预渲染更利于独立课程 SEO，但当前没有服务器与 SEO 要求；选用低复杂度 Vite。
课程地址的 hash 不发送给静态服务器，因此刷新只请求应用入口。所有资源使用 Vite base；不依赖 Pages 404 hack。
ID 不因标题改变而变化。发布 slug 原则不改，改动必须保留兼容映射并单独审阅。

## 目录

- `src/app`：固定页面与路由装配。
- `src/components`：共享 UI，课内专有组件不放这里。
- `src/lib/curriculum`：schema、唯一 catalog、图算法、加载器。
- `src/lib/lesson`：课程公共接口。
- `src/lib/progress`：版本化数据、纯合并、响应式持久化。
- `src/lessons/<ID>`：单课实现，自动发现。
- `labs/lessons/<ID>`：本地参考代码，不在浏览器训练。
- `scripts`：一致性、生成与文件所有权检查。
- `tests`：基础设施单元、组件和浏览器场景。

## 状态与发布

无入口为 planned；入口声明 draft 或 ready。声明 ready 需要实际正文、至少五个结构章节、有效测验、experiment.ts、数学测试和 lesson.test.ts。
CI 运行类型、验证、测试和生产加载。结构校验为最低门槛；教学审阅按 LESSON_SPEC 检查至少两个误区、2–4 道理解题、完整教学结构和数学正确性，不能通过空测试获取 ready。
现有 schema 的 ready 测验下限为一道，不代表达到新的教学标准；既有课程下次更新按规范补齐，接口兼容性不在文档 PR 中改变。
所有变更通过 PR 合并 main。新建课程一课一 PR；既有课程的授权批量修订可将相关课程、共享基础设施、先修关系和文档放入一个 PR，列出范围与逐课验证。禁止直接推送 main 或绕过失败检查。合并流程见 CONTRIBUTING。
生产只部署通过门禁的版本；本地开发状态不代表已验收。

## DAG

Kahn 稳定拓扑排序，循环时 DFS 输出具体环路径。展示顺序由 order 决定，不将 ID 顺序当依赖。
直接前置、传递前置、后续课程来自同一份数据。relatedLessons 不加入 DAG。

## 离线

vite-plugin-pwa generateSW 预缓存当前构建的代码、目录、KaTeX 字体和小资源。完成后才能离线。
缓存命名与部署 base 关联；新 SW 等待用户确认刷新。应用壳与课程不依赖外部 CDN。
总预算 10 MiB，单文件最大 2 MiB；实验参考文件最大 1 MiB。超预算通过基础设施变更处理。
大型数据、模型权重和外部参考不缓存。Cache Storage 被浏览器清理时不保证离线仍可用。

## 进度

`iml-academy.progress.v1` 存访问、完成、最近课程和作答。按 ID 关联，不保存可信的客户端评分。
schema 严格验证，导入限制 2 MiB。确认后按记录时间合并，时间相同保留当前；未知 ID 保留但不计统计。
已知非 ready 课程的导入完成标记会被清除。未来版本必须显式迁移；损坏数据不自动覆盖。
当前版本不提供跨标签页实时合并或云同步，使用导出备份迁移。

## 共享接口与扩展

Svelte 5 props/snippets/callbacks；数学纯函数不导入 UI。Phase 1 后冻结 contractVersion 1。
新实现只写课内目录，不能改 loader、router 或 App。新增课程身份由维护任务登记并生成卡片。
平台不引入后端、训练运行时、API 或遥测。
