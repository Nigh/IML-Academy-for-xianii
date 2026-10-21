# 实施计划与阶段合同

项目全称：Interactive Machine Learning Academy for xianii。
仓库名：IML-Academy-for-xianii。

## 已确认方案

采用 Svelte 5 + TypeScript strict + Vite SPA、hash 路由、Tailwind v4、daisyUI v5 和 @xianii/design-system/theme.css。
课程按独立学习目标拆分，预注册 12 模块 247 课。完整 ID、名称、前置 DAG 和 slug 见 [CURRICULUM](docs/CURRICULUM.md)。
Phase 0 完成 M01-002 向量加法示范课，其余课程由共享 planned 页面呈现。

## Phase 0

1. 初始化依赖、类型、样式与质量工具。
2. 完整课程身份、目标与依赖数据；校验唯一性、引用和无环。
3. 每课独立教学设计，生成 247 张含公式、双场景、误区和数学断言的任务卡。
4. 通用路由、懒加载、状态校验、模块导航、搜索、依赖展开与 planned 回退。
5. 主题、桌面与移动布局、键盘操作。
6. 版本化本地进度、导入预览和合并、导出、存储降级。
7. M01-002 实际数学交互、测验与测试。
8. 离线缓存、根路径和仓库子路径验证、CI、GitHub Pages 部署。
9. 架构、课程、组件、贡献、数学符号和本地实验文档。

验收：install/dev/check/lint/format/test/build 通过；所有 247 路由可达；246 planned、1 ready；导入导出、浅深主题、刷新与离线可用；无网页训练后端。

## Phase 1

完成 docs/COMPONENTS.md 中的全部 v1 组件，以下示范课用于验证抽象：

- M01-002：向量图、数值控件、复位、测验。
- M01-012：MatrixView、线性变换。
- M02-008：Plot2D、概率密度、固定 seed 与重新采样。
- M03-010：单步、播放暂停、速度、迭代状态、异常处理。
- M12-001：本地教程、代码下载、环境与复现记录。

验收：共享 API、主题、可访问性、复位和错误行为稳定；数学逻辑可独立测试；动画隐藏暂停且卸载释放；五课验证后冻结 contractVersion 1。

## Phase 2

按 DAG 与工程价值分批开发，一课一个 PR。每个 Agent 独立 worktree，只写所属课程与本地实验目录。
共享基础设施由维护者单独修改。新增课程身份由维护者预注册；实现者无需改全局文件。

验收：任务卡目标、场景、公式、误区、工程联系、测验均满足；数学与 UI 一致；测试通过；明确数据和硬件验证证据后 ready。

## 风险控制

- 不用复制空正文实现占位，planned 自动回退。
- ready 是需要发布门禁与教学审阅的声明，不等于字段自动证明数学正确。
- 图表按真实共性抽象；不预装完整图表/数学库。
- 离线预缓存预算 10 MiB；大数据和模型权重不缓存、不提交。
- 固定依赖锁文件；主题升级运行两种主题与控件检查。
- 进度 ID 稳定、schema 版本化；旧数据损坏时不覆盖。
- 控制/GPU 实验未执行时如实声明，不报告虚假成功。

## 发布

main 通过 CI 后部署 Pages；base 由 Pages 配置提供。迁移自定义域名使用 `/`，同步检查 SW scope 与 manifest。
部署工作流文件完成不等于线上部署成功，需核对 Actions 结果和线上地址。
