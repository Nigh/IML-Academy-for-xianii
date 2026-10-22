# 教学 Skills 协作说明

## 本次项目观察

项目使用 Svelte 5 + TypeScript、Vite hash SPA，课程身份/目标/前置 DAG 在 `curriculum/lessons.json`；设计源与身份生成任务卡，`src/lessons/*/lesson.ts` 自动发现实现。Shell 处理元信息、测验与本地进度，课内持有实验状态。数学通过 FormulaBlock 的 KaTeX HTML/MathML 渲染，计算独立于界面。

已核对 ARCHITECTURE、LESSON_SPEC、COMPONENTS、NOTATION、LOCAL_LABS、CONTRIBUTING、INTERACTIVE_GUIDE、课程 schema/contract、数学与反馈组件及 M01-002 示例/任务卡。示例说明了状态到图形的组合，也显示出存量课程不能仅凭 ready 声明视为满足新标准：M01-002 当前定义只有一道测验，且正文在同题预测前已经解释结果。本轮未改该课，也未审计全部课程。

本次参考了 skill-creator 的独立与渐进披露原则、现有 humanizer 的保留语义原则，以及两个外部 Skill 的上游说明。未执行 graphify 建图，避免为文档任务安装工具和生成无关产物；未加载与本次任务无关的 UI 风格包。

## 调用与分工

| 入口                                                            | 职责                                           | 输出交给谁         |
| --------------------------------------------------------------- | ---------------------------------------------- | ------------------ |
| [math-storytelling](../skills/math-storytelling/SKILL.md)       | 核心问题、概念动机、直觉/证明边界、推导和迁移  | 课程作者或交互设计 |
| [interactive-pedagogy](../skills/interactive-pedagogy/SKILL.md) | 预测、变量控制、因果对照、反馈、提示和学习证据 | 实现与测试         |
| [课程质量规范](TEACHING_DESIGN.md)                              | 本项目共同验收证据                             | 所有课程 Agent     |
| [四阶段流程及提示词](LESSON_OPTIMIZATION.md)                    | 审查→路径→实现→润色与验收                      | 单课优化任务       |

两 Skill 可分别用于审查和设计；本项目编写课程内容时，必须同时满足下述必需 Skills 检查。移植到其他项目时，由当地规范决定外部依赖。项目内按根 AGENTS 的路径路由读取；如当前会话尚未自动发现名称，直接提供 `skills/<name>/SKILL.md` 路径读取即可，不声称创建后本会话自动注册。

选择 `skills/` 作为版本化源目录：当前环境的 `.agents/` 与 `.codex/` 为只读。两个目录均自包含、无仓库外绝对路径，无需复制本项目文档即可移植；其他项目可将完整目录复制到自己的 `.agents/skills/`，或个人 Skills 根目录，然后按目标工具的发现机制加载。当地项目规范负责技术栈和验收适配；不要把本项目 Svelte、目录或课程数量约束强加给其他项目。

## 外部 Skills 状态与安装

核对日期：2026-10-22。用户已安装 humanizer-zh 与 ui-ux-pro-max；本次已读取 `~/.agents/skills/humanizer-zh/SKILL.md` 和 `~/.agents/skills/ui-ux-pro-max/SKILL.md`。本机安装状态不能当作其他环境可用的证据；通用 humanizer 不能替代 humanizer-zh。

### 课程内容编写前的必需检查

每次开始课程内容编写任务，尤其在新环境中，先检查 math-storytelling、interactive-pedagogy、humanizer-zh 和 ui-ux-pro-max。课程内容包括面向学生的正文、推导、测验、教学交互和本地实验说明，既含新课也含已有课程改写。

1. 从当前会话 Skills 清单、项目 Skills、个人 Skills 或已配置的插件目录解析实际路径；两个项目 Skill 也可直接从 `skills/<name>/SKILL.md` 读取。不要硬编码本机绝对路径，也不要仅凭目录名或旧文档判断已安装。
2. 确认可读取实际 SKILL.md，并按任务读取它引用的必要资源。humanizer-zh 的所需 references 必须存在；ui-ux-pro-max 使用搜索时，须确认脚本、数据及 Python 可用，按入口解析真实路径，不照抄其他工具的环境变量。
3. 记录各 Skill 的实际入口、所需资源和可用/缺失/不可用结果。任何必需 Skill 缺失、不可读或必要资源不完整，都必须暂停课程内容编写，明确告知缺失项及安装/修复方式，要求用户安装好后才能继续。用户回复已安装后重新检查；禁止以人工检查、通用 humanizer 或其他 UI Skill 降级替代。
4. 只读审查、项目规范、Skills、工具、测试基础设施和其他不编写课程内容的修改不受此门禁约束，可继续完成。混合任务仅暂停课程内容部分，其他独立工作继续。

以下是用户选择安装时使用的上游方式，本轮没有运行安装命令或下载执行外部代码。安装前核对来源与版本，查看将写入的文件；安装不能授予课程改动以外的权限。

[humanizer-zh 官方仓库](https://github.com/ai-zixun/humanizer-zh) 的项目级安装：

```bash
npx skills add ai-zixun/humanizer-zh
```

选择 Codex 对应的项目目录；上游列出的 Codex 项目路径为 `.agents/skills/humanizer-zh/`。使用全局安装时在命令末尾加 `-g`。保留完整 references，而非只拷贝 SKILL.md。

[UI UX Pro Max 官方仓库](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 当前推荐 CLI 包为 `ui-ux-pro-max-cli`（命令名仍为 `uipro`），在目标项目根执行：

```bash
npm install -g ui-ux-pro-max-cli
uipro init --ai codex
```

可在初始化前用 `uipro init --ai codex --dry-run` 预览写入。搜索功能需要 Python 3；不能只下载其 SKILL.md 而遗漏脚本/数据。本环境项目隐藏目录只读，不能假定安装可直接完成；换到可写环境或经授权调整权限后再执行。上游命令可能更新，执行前重新核对官方说明。

## 在流程中的必需使用

- 阶段 3：必须读取 ui-ux-pro-max 的实际入口，使用 `svelte` 栈或针对性 UX 查询，检查拖动替代操作、反馈、移动布局和性能。建议需映射到现有设计 tokens；不自动生成新的全局设计系统、换字体/配色、引入动画库或覆盖冻结 API。缺失或不可用时按前置门禁暂停课程内容编写，要求用户安装或修复。
- 阶段 4：必须读取 humanizer-zh，以中性技术中文润色；保留事实、条件、术语与结论强度，不启动作者模仿。润色后重新核对公式、量词、否定和错误反馈。缺失或不可用时按前置门禁暂停课程内容编写，要求用户安装或修复。
- 外部 UX 建议和文案建议不改变数学结论、组件合同及用户授权。两者无法裁决数学正确性；冲突时由项目规范与数学证据决定，并记录未采用建议的原因。
