# 贡献指南

先读 AGENTS 和 LESSON_SPEC。课程身份由维护者登记，实现通过 glob 自动发现。单课开发不修改全局文件。

## 分支与检查

- 课程分支 `lesson/<ID>-<slug>`，一个独立 worktree、一个所有者、一个课程 PR。
- 全局类型/组件/依赖变更用独立基础设施分支，先兼容旧课程。
- Conventional Commits，例如 `feat(M03-010): add deterministic gradient descent experiment`。
- 无全局格式化与无关课程改动。
- `pnpm scope:check` 默认与 origin/main 比较；可通过 SCOPE_BASE 指定比较基线。
- CI 对课程命名分支检查只允许所属 src/lessons 和 labs/lessons 路径。

所有 PR 运行类型、格式、lint、目录/实现校验、任务卡一致性、单元/组件测试和构建。浏览器修改附 Playwright 证据。
ready 需要数学/教学审阅，不仅是字段与文件存在。明确实际执行了哪些实验。

## 修改课程目录

仅维护者修改 modules.json/lessons.json 与 designs。ID 永久且不复用；新增时选择新 ID 和不冲突 slug，维护 DAG。
生成任务卡与课程文档后提交，CI --check 确保无漂移。

## 并行工作

Agent 不读取全项目作为必要前提，只需协议、任务卡和组件文档。公共能力不足先做课程内组件，复用提案独立提交。
冻结合同后破坏性接口需版本迁移和全课程验证。Phase 1 前不开展大量课程并行以免接口分叉。
