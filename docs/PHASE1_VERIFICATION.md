# Phase 1 实现与验证记录

> 本文记录 Phase 1 当时的交付规则和事实。当前规则见 CONTRIBUTING：新建课程仍一课一 PR，既有课程的授权批量修订允许一个 PR；下文的集中分支限制不适用于后一种情况。

日期：2026-10-21。Node 24.9.0、pnpm 11.5.2，Svelte 5 + TypeScript strict + Vite。
原集成分支：`codex/phase1-interactive`；发布使用独立 worktree 与分支。基线工作区干净；没有覆盖用户未提交修改。

## 实际范围与差异

附件将内积、梯度下降分别写为 M01-003、M03-007；正式清单中它们是 **M01-007、M03-010**。
未改任何 ID、标题、slug 或前置 DAG。M01-003（张量形状）和 M03-007（梯度）仍由 planned 回退。
M02-004 的正式标题是“随机变量与分布函数”，保留任务卡的骰子 F(3)=1/2、CDF 跳跃与连续性，扩展四分布作为统一实验。
PLAN.md 早期 Phase 1 列出另外五个验证目标；本次以附件的三课任务为实施范围，不额外实现矩阵变换、其他概率课或真实本地训练课。

集中开发仅用于集成验证，没有创建捆绑多课的 PR，也没有直接推送 main。
发布已拆分为共享基础设施、三节独立课程、跨课 E2E 和共享文档共六个 PR；课程分支严格限定本课五个文件。
集中分支不得直接作为多课发布 PR。根 AGENTS、依赖、路由、loader、主题 tokens、构建和 Pages 配置均未修改。

## Step A 的设计与最终实现

数学层使用纯 TypeScript：二维向量、双向坐标映射、概率/统计/seeded 采样、固定步长一/二维下降。
图形输入是有限数据坐标点；`mapping` 显式转换数据坐标和 SVG 逻辑像素。SVG 提供高 DPI，Canvas 辅助函数单独测试。
Plot2D 不计算函数；分布曲线、等高线和优化历史由课程模型生成。
组件使用类型化 props/snippets/callbacks；课程拥有参数和派生值，不引入全局实验 store。
SimulationControls 拥有播放时钟，数学迭代与时钟分离；父层 reset/参数改变通过 key 重建控制器。

新增 Plot2D、DistributionPlot、HistogramPlot、ContourPlot、MatrixView、PresetSelector、SimulationControls、StepByStep。
完善 VectorDiagram（真实拖拽/等比例/辅助线/角弧）、NumericInput（中间态/失焦校验）、ParameterSlider（说明/局部重置）、InteractivePanel（计算性质/seed/N）、FormulaBlock（行内/编号/变量）。
新增 DefinitionBlock、KnowledgeCheck、CommonMistakes、ExperimentGuide、LessonSummary、LocalLabGuide、CodeBlock、ReferenceLinks。
复用现有 LessonShell、TheorySection 和 QuizBlock，避免重复保存进度或注册路由。
接口、状态、回调、限制和示例见 COMPONENTS.md；三个完整可运行 Svelte 组合见 INTERACTIVE_GUIDE.md。

## 三节课程

| 课程    | 实际功能与教学                                                                                                                                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M01-007 | 拖动两个向量与键盘数值输入同步；实时范数、点积、夹角、投影和计算过程；五种预设、投影辅助线和角弧；零向量、尺度误区、传感器/特征/线性层应用；三题、四点总结及两条注册课链接。                                                        |
| M02-004 | 公平骰子阈值累计；Bernoulli/Binomial/Uniform/Normal 参数切换；PMF/PDF/CDF、阈值概率、理论均值/总体方差、seed 与样本数、重新采样、经验图与两种经验方差；六种预设；随机变量与样本、密度与概率等误区；三题、五点总结及三条注册课链接。 |
| M03-010 | 默认一维二次函数及任务卡 x²；学习率、初值、预算、单步/播放/暂停/速度/重置；函数/切线/当前点/轨迹/损失图；二维曲率与条件数、等高线和负梯度方向；非凸双井与不同初值；四种学习率预设、算法解释；三题、四点总结及三条注册课链接。       |

所有正文覆盖动机、直觉、定义与条件、实验、探索、误区、工程联系和总结。新课程均有真实 experiment.ts、数学测试和组件测试，lesson.ts 声明 ready；已完成代理教学、数学、范围审阅及独立 PR CI。代理审阅不等同于独立人工教学审阅。

## 数学验证

- 向量：交换律、正交零点积、范数、投影解析值、零方向、极小非零向量、非有限输入与运算溢出；任务卡 (1,1)·(−1,−1)=−2。
- 坐标：数据/屏幕互逆，等比例、缩放和平移、范围边界、Canvas DPR。
- 分布：Binomial PMF 求和与 p=0/1、n=0 边界；Normal/Uniform 数值积分；CDF 单调；Normal PDF 解析值；CDF 标准参考点绝对误差小于 8e-8。
- 随机与统计：同 seed 逐项复现、不同 seed 改变序列，参数平移使用同一基础样本，三种分布边界采样，均值与分母 N/N−1 的方差，直方图计数守恒和密度面积为 1。
- 优化：任务卡 x²、x₀=2、η=0.1 得 1.6；默认二次误差解析式逐步对照（绝对误差 1e-10）；η=1 周期、η>1 数值增长、安全上限、二维梯度与等高线、非凸 ±1 极小点及 0 驻点、非法参数/非有限输出、预算与确定复位。
- 播放：暂停、隐藏页、结束、卸载都不再推进；减少动态效果仅单步；结束后回到初态不自动重播。面板复位会停止旧控制器。
- 合并前审阅还统一了向量拖拽与数值输入的 −5 至 5 范围，明确零向量下几何表达的条件，并补齐概率期望与总体方差定义。
- 回归修复：近收敛的小位移不能单凭两步距离判成振荡；数值框失焦时若值未变化，不重复通知父组件，防止重建控制器吞掉刚刚点击的单步按钮。

## 检查结果

- `pnpm check`：零错误、零警告。
- `pnpm lint`、`pnpm format:check`、`git diff --check`：通过。
- `pnpm validate:curriculum`：12 模块、247 课程，身份与 DAG 通过。
- `pnpm validate:lessons`：4 ready（含原有 M01-002），全部实现入口通过。
- `pnpm test`：15 个文件、37 项测试通过。
- 根路径与 `/IML-Academy-for-xianii/` 子路径生产构建通过；两种 base 的完整 Playwright 各 21 项通过（Chromium 15、Firefox 3、WebKit 3）。
- 三课主要交互、首页搜索进入、刷新、实际拖拽、固定 seed、参数改变、单步预算、复位、reduced motion 均有浏览器断言。
- 三课亮暗主题 axe 检查通过；320px 无整页水平溢出；200% 正文文字放大无整页溢出。复杂图形/公式仅局部滚动，滚动区域可键盘聚焦。
- 截图覆盖三课桌面亮色、暗色与手机布局；没有建立脆弱的随机图像逐像素基准。
- 主题与样式沿用 @xianii/design-system 的语义 tokens，未复制品牌颜色；机械 UI 检测结果为空数组。
- 所有新相关课链接均指向正式清单；Git 范围检查未发现无关课程、课程身份、路由或配置修改。

基线 check 通过、19 项单测通过、build 通过。首次沙箱内测试因禁止启动 Git 子进程失败，随后在允许环境运行通过。
WebKit 首次缺少 libevent；使用 Phase 0 已留在 `/tmp/iml-browser-libs` 的三份库，通过 LD_PRELOAD 运行通过，未安装系统包。
可复现本地环境命令：

```sh
LD_PRELOAD='/tmp/iml-browser-libs/root/usr/lib/x86_64-linux-gnu/libevent-2.1.so.7:/tmp/iml-browser-libs/root/usr/lib/x86_64-linux-gnu/libhidapi-hidraw.so.0:/tmp/iml-browser-libs/root/usr/lib/x86_64-linux-gnu/libmanette-0.2.so.0' pnpm test:e2e
```

上面命令未显式选择课程时，既有“选中课程”遍历按项目规则跳过；本次完整验收还将 LESSON_SELECTION 设为三课清单，因此 21 项没有跳过。

## 已知限制与 Phase 2

- Plot2D 每序列最多 2000 点，采样最多 10000，优化最多 1000 步；适用于教学规模。没有 WebGL/通用 3D/百万点绘图。
- Normal CDF 是近似；正态图固定 −15 至 15，图外仍有尾部概率。两点周期检测是有限容差判断，不能证明一般目标的全局行为。
- NumericInput 不将浮点文本自动量化至 step；step 提示建议步长，integer 模式显式限制整数。数学模型的有效范围由父层约束。
- 图形使用本地横向滚动保持字体可读；没有声称执行过屏幕阅读器人工验收或所有设备的触控笔实测。
- LocalLabGuide 与 MatrixView 是共享可用组件，没有增加附件范围之外的完整本地训练/矩阵变换课。未运行 GPU、硬件、PyTorch 或 MuJoCo 实验。
- 共享层、三课与跨课 E2E 的独立 PR CI 和代理内容审阅已通过并按用户授权 squash 合并；没有使用管理员绕过检查。独立人工教学审阅及硬件实验未执行。最终 Pages 发布结果仍以最新 main 的 Deploy 工作流为准。
- Phase 1 的三课任务已完成，内部协议 v1 由本次 CI 与代理内容审阅验收冻结。Phase 2 可按现有 DAG 和单课目录所有权开展并行开发；每个 Agent 继续使用独立 worktree、独立课程分支与独立 PR。

## 截图与交互证据

三课桌面亮色、暗色及手机截图由 Playwright 生成，保存在本地会话附件，未作为源码二进制资源提交。
远端读者可按各 PR 的交互说明复核；同一操作流程由 tests/e2e/phase1.spec.ts 自动执行。

- 向量：拖动、分量上下界、数值同步与复位；截图 vector-dot-product-light.png / vector-dot-product-dark.png / vector-mobile.png。
- 概率：均值平移、固定 seed 采样复现、CDF 切换；截图 probability-random-variables-light.png / probability-random-variables-dark.png / probability-mobile.png。
- 梯度：单步、重置、一步预算、参数变化与 reduced motion；截图 gradient-gradient-descent-light.png / gradient-gradient-descent-dark.png / gradient-mobile.png。

## PR 验收证据

- [feat(ui): add reusable interactive teaching primitives](https://github.com/Nigh/IML-Academy-for-xianii/pull/4) · squash commit `edf60aa`。
- [feat(M01-007): teach dot products angles and projections](https://github.com/Nigh/IML-Academy-for-xianii/pull/5) · squash commit `55a6139`。
- [feat(M02-004): teach random variables and distribution experiments](https://github.com/Nigh/IML-Academy-for-xianii/pull/6) · squash commit `ebedf87`。
- [feat(M03-010): teach deterministic gradient descent experiments](https://github.com/Nigh/IML-Academy-for-xianii/pull/7) · squash commit `ac2c8af`。
- [test: cover phase one lesson interactions and accessibility](https://github.com/Nigh/IML-Academy-for-xianii/pull/8) · squash commit `e4ff7d0`。

以上 PR 的 quality、browser (root)、browser (project) 均成功后合并。本文档通过后续独立 docs/phase1-contract PR 归档。

## 修改文件清单

- `docs/COMPONENTS.md`
- `docs/INTERACTIVE_GUIDE.md`
- `docs/LESSON_SPEC.md`
- `docs/PHASE1_VERIFICATION.md`
- `src/components/charts/ContourPlot.svelte`
- `src/components/charts/DistributionPlot.svelte`
- `src/components/charts/HistogramPlot.svelte`
- `src/components/charts/Plot2D.svelte`
- `src/components/charts/VectorDiagram.svelte`
- `src/components/charts/types.ts`
- `src/components/interactive/InteractivePanel.svelte`
- `src/components/interactive/NumericInput.svelte`
- `src/components/interactive/ParameterSlider.svelte`
- `src/components/interactive/PresetSelector.svelte`
- `src/components/interactive/SimulationControls.svelte`
- `src/components/interactive/StepByStep.svelte`
- `src/components/lesson/CodeBlock.svelte`
- `src/components/lesson/CommonMistakes.svelte`
- `src/components/lesson/DefinitionBlock.svelte`
- `src/components/lesson/ExperimentGuide.svelte`
- `src/components/lesson/KnowledgeCheck.svelte`
- `src/components/lesson/LessonSummary.svelte`
- `src/components/lesson/LocalLabGuide.svelte`
- `src/components/lesson/ReferenceLinks.svelte`
- `src/components/math/FormulaBlock.svelte`
- `src/components/math/MatrixView.svelte`
- `src/lessons/M01-007/Lesson.svelte`
- `src/lessons/M01-007/experiment.test.ts`
- `src/lessons/M01-007/experiment.ts`
- `src/lessons/M01-007/lesson.test.ts`
- `src/lessons/M01-007/lesson.ts`
- `src/lessons/M02-004/Lesson.svelte`
- `src/lessons/M02-004/experiment.test.ts`
- `src/lessons/M02-004/experiment.ts`
- `src/lessons/M02-004/lesson.test.ts`
- `src/lessons/M02-004/lesson.ts`
- `src/lessons/M03-010/Lesson.svelte`
- `src/lessons/M03-010/experiment.test.ts`
- `src/lessons/M03-010/experiment.ts`
- `src/lessons/M03-010/lesson.test.ts`
- `src/lessons/M03-010/lesson.ts`
- `src/lib/math/coordinates.ts`
- `src/lib/math/math.test.ts`
- `src/lib/math/probability.ts`
- `src/lib/math/vector.ts`
- `src/lib/simulations/gradient.ts`
- `tests/components/phase1.test.ts`
- `tests/e2e/phase1.spec.ts`
