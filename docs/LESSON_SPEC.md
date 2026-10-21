# LESSON_SPEC — 交互课程统一开发规范 v1

本规范定义单课的教学与交付标准；公共类型以 `src/lib/lesson/contract.ts` 为准。v1 接口在 Phase 1 验收后冻结。

## 1. 职责、输入与文件所有权

课程 Agent 负责一节可独立阅读、数学严谨、交互充分的课程。开始前依次读取：

1. 根目录 `AGENTS.md`。
2. `docs/ARCHITECTURE.md` 与本规范。
3. `curriculum/tasks/<LESSON_ID>.md`。
4. `docs/COMPONENTS.md`、`docs/NOTATION.md`；有本地实验时读取 `docs/LOCAL_LABS.md`。

无需阅读其他课程的实现。任务卡补充本课具体要求，不能降低本规范的教学底线；发现公式、前置关系或接口冲突时，在 PR 中记录，由维护者处理。

默认可写范围只有：

```text
src/lessons/<LESSON_ID>/**
labs/lessons/<LESSON_ID>/**
```

不得修改其他课程、curriculum 清单、App、路由、共享组件、构建系统、依赖或根配置。共享能力不足时优先做课内专用实现，并在 PR 中记录可复用能力需求；公共变更走独立基础设施 PR。

## 2. 目标读者与教学结构

读者具备电子工程、嵌入式、软件开发和基础工程数学知识，但未系统学习 ML。中文为主，保留英文术语；无需展开基础编程概念，也不能省略 ML 特有理论。

从直觉和问题出发，建立模型，再用交互验证，最后讨论应用与限制。直觉 → 实验 → 推导或直觉 → 模型 → 实验均可，按最自然的理解顺序组织。

Shell 已提供标题、模块、难度、时间、目标、前置、状态、测验、进度和导航。正文不重复创建 h1 或自行保存进度，可合并章节，但必须覆盖以下内容：

| 内容       | 最低要求                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 动机       | 一个自然的实际问题；可用传感器、噪声、延迟、控制、机器人或训练评测案例，不强行关联硬件               |
| 直觉       | 解释解决什么问题，用图示说明变量、关系和变化趋势                                                     |
| 数学       | 标准公式、全部变量的含义/形状/单位、假设和适用条件；按难度给出推导，避免堆公式                       |
| 核心实验   | 至少一个有教学意义的交互，明确输入、算法、输出与观察目标；仅任务卡明确规定纯本地实验时豁免浏览器交互 |
| 参数探索   | 至少两个有意义的正常、边界、不稳定、极端或反直觉场景，尽量提供一键预设                               |
| 误区与限制 | 至少两个误区、反例、限制或失败案例，并解释原因                                                       |
| 理解测试   | 2–4 道检查结果预测、参数后果、公式含义、成立条件或工程应用的问题，不仅考术语记忆                     |
| 总结       | 3–5 个核心结论，并链接已注册的相关课程；不得引用不存在的页面                                         |
| 本地实践   | 如适用，完整提供环境、数据、代码、执行与结果检查方法，见第 6 节                                      |

## 3. 课程文件与接口

```text
src/lessons/M03-010/
  lesson.ts
  Lesson.svelte
  experiment.ts
  experiment.test.ts
  lesson.test.ts
labs/lessons/M03-010/     # 仅有本地实验时
```

`lesson.ts` 默认导出 `LessonDefinition`，包含 `id`、`contractVersion: 1`、`status`、`sections`、`quiz` 和可选 `localLab`。从 draft 开始，达到完整验收标准后再声明 ready。

```ts
import type { LessonDefinition } from '../../lib/lesson/contract';
export default {
  id: 'M03-010',
  contractVersion: 1,
  status: 'draft',
  sections: [{ id: 'motivation', title: '为什么要优化' }],
  quiz: [],
} satisfies LessonDefinition;
```

这是允许逐步开发的 draft 接口示例，不能作为 ready 内容提交。章节 ID 在课内唯一，使用英文短横线，与正文 `TheorySection` 的 id 一致。ready 的结构检查至少要求五个实际章节。

`Lesson.svelte` 默认导出接受只读 `metadata: LessonMetadata` 的组件，复用类型和章节组件：

```svelte
<script lang="ts">
  import type { LessonBodyProps } from '../../lib/lesson/contract';
  import TheorySection from '../../components/lesson/TheorySection.svelte';
  let { metadata }: LessonBodyProps = $props();
</script>

<TheorySection id="motivation" title="为什么要优化">
  <p>{metadata.title}的工程动机、可验证模型和解释写在这里。</p>
</TheorySection>
```

每道单选题使用稳定的问题/选项 ID、版本、题干、选项及正确答案 ID；正确项与每个干扰项都需解释：

```ts
{
  id: 'step-direction', version: 1,
  prompt: '问题文本',
  options: [
    { id: 'a', text: '选项 A', explanation: '为何对或错' },
    { id: 'b', text: '选项 B', explanation: '为何对或错' },
  ],
  answerId: 'a',
}
```

题意或答案含义改变时增加 version。首版单选，无需服务端保密答案。完成状态由用户确认，不要求测验满分；planned/draft 不能标记完成。

## 4. 交互与界面

- Svelte 5、TypeScript strict；优先使用已实现的公共组件，不能假设 Phase 1 待建组件已经存在，也不复制多套近似 UI。
- 遵守 Xianii Tokens、字号与间距规范，兼容亮暗主题；不得为单课修改全局设计系统。
- 参数变化尽量即时反映到真实数学计算结果；同时展示过程和关键中间量，不只给最终答案。
- 参数标明名称、单位、默认值、范围和无效输入反馈，支持复位与键盘操作；不能只支持拖动。
- 图表有轴标签、单位、图例及必要的文字说明，重要信息不用颜色单独区分。SVG 或 Canvas 正确处理高 DPI 与屏幕缩放。
- 移动端可阅读；复杂图表可局部横向滚动，不能让整页溢出。
- 不用装饰性动画，尊重 reduced motion。长运算限制样本数、迭代数或耗时，避免阻塞页面。
- 逐步算法提供初值、步号、状态、单步、播放/暂停、速度和复位；隐藏页暂停，卸载清理动画、计时器与订阅。

共享组件的实际 props 见 COMPONENTS；复杂的课程专用可视化留在课内目录。

## 5. 数学计算与质量底线

复杂计算与 UI 分离，`experiment.ts` 导出纯函数和类型。纯本地实验可在其中放实际的数据/配置/结果校验逻辑，不伪造网页训练，也不放空测试凑文件。

| 类型       | 实现与验证要求                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| 确定性算法 | 对照解析解、标准算法或可信参考实现，断言结果/不变量，检查边界和无效输入；浮点容差结合尺度说明               |
| 随机模拟   | 明确 seed 与样本数，允许重新采样；默认固定基础随机样本比较参数影响，解释波动和统计局限                      |
| 数值优化   | 明确初始值、学习率等参数、迭代数与终止条件；解释收敛/发散，限制运行次数并处理 NaN、Infinity、溢出及非法参数 |

公式采用 KaTeX，符号遵循 NOTATION。所有近似、经验统计和预计算结果明确标注。引用外部结论或性能数字时说明来源、条件和测量方法。

禁止：纯长文或装饰图替代必要交互；伪随机图形冒充模型结果；直接复制教程；省略模型条件；混淆相关与因果、训练误差与泛化误差；把预测当物理真值；无来源的绝对性能声明；网页暗中调用外部 AI API。

## 6. 本地实验

真实模型训练、Python/PyTorch、GPU、MuJoCo 或设备任务在用户自行管理的本地环境执行，网页只提供教程和参考代码。

必须包含：目标与前置、支持环境和依赖安装命令、数据来源/格式、可独立运行代码、执行步骤、输出检查方法、合理结果范围、排错及进一步实验。说明 seed、软件版本与硬件差异，不声称用户已运行代码，也不报告未执行的实测结果。

`lesson.ts` 的 `localLab` 描述 `environment`、`data`、`steps`、`files`、`expected`、`troubleshooting`。文件相对 `labs/lessons/<ID>`，禁止越界，每个不超过 1 MiB；构建复制到 `BASE_URL + labs/<ID>/<file>`。优先 `.py`，不提交模型权重、敏感数据或受限数据集。完整要求见 LOCAL_LABS。

## 7. 验收与 PR 交付

结构校验是最低自动门槛，不替代教学审阅：当前 schema 只检查 ready 至少有一道有效题；本规范要求的 2–4 题和至少两个误区由内容审阅确认。既有课程下次更新时按本规范补齐，本次规范更新不追溯修改课程实现。

提交前逐项确认：

1. `pnpm check`、`pnpm lint`、`pnpm format:check` 通过。
2. 相关数学与组件测试通过；`experiment.test.ts` 覆盖任务卡场景、解析值/不变量、边界、非法输入和适用的随机复现；`lesson.test.ts` 覆盖协议、章节、参数变化、复位与主要交互。
3. `pnpm validate:curriculum`、`pnpm validate:lessons`、`pnpm build` 通过，PR CI 全部通过。
4. 实际检查主要交互、键盘、亮暗主题、重要响应式布局和缩放；涉及页面/交互/存储变更时运行 Playwright，记录截图或操作说明。
5. 相关链接均指向已注册课程；本地参考文件存在且路径正确。
6. 对比 main 检查变更仅在授权目录，没有无关课程或全局格式化修改。
7. 教学结构、2–4 道题、至少两个误区及数学正确性经过审阅；不以字段声明或空测试获得 ready。

每节课程使用独立 `lesson/<ID>-<slug>` 分支和一个 PR，目标为 `main`；禁止多课捆绑或直接推送 main。公共基础设施和跨课程文档分别走独立 PR。使用 Conventional Commits；通过 CI 和内容审阅后合并，不能绕过失败检查。具体合并流程见 CONTRIBUTING。

完成报告及 PR 必须列出：课程 ID、实际交互、数学验证方式、实际运行的测试与结果、主题/响应式/链接与文件范围检查、限制和遗留问题、修改文件清单。未运行的验证明确注明。
