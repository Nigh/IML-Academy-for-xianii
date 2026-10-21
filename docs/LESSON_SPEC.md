# 独立课程开发协议 v1

状态：Phase 0 已建立最小合同；Phase 1 验收后冻结。公共 TypeScript 来源：`src/lib/lesson/contract.ts`。

## 输入与目录

读取 AGENTS、你的任务卡、COMPONENTS 与 NOTATION 后即可开发，无需理解其他课程。

```text
src/lessons/M03-010/
  lesson.ts
  Lesson.svelte
  experiment.ts
  experiment.test.ts
  lesson.test.ts
labs/lessons/M03-010/     # 仅有本地实验时
```

不得修改课程身份、App、路由、公共组件或工程依赖。任务卡若发现数学或前置问题，在 PR 说明并由维护者处理。

## 课程导出

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

章节 ID 在课内唯一，使用英文短横线；与正文 TheorySection 的 id 一致。ready 至少有五个实际章节及有效测验。

正文默认导出 Svelte 组件，接受只读 `metadata: LessonMetadata`：

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

这只是接口示例，不能以此空壳提交 ready。

## 教学结构

Shell 已提供标题、模块、难度、时间、学习目标、前置、状态、测验、进度与导航。
正文提供：工程动机 → 直觉 → 真实交互 → 严格数学 → 参数探索 → 误区反例 → 工程联系 → 总结。
按需提供本地实验指南和参考链接。不要在正文再创建 h1 或自己保存进度。

交互必须解释参数、单位、模型、输出、预期现象、反直觉条件与局限。不能只放装饰动画。

## 测验

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

问题和选项 ID 稳定，含义变化时增加 version。首版单选；无需服务端保密答案。每个干扰项有解释。
完成状态由用户确认，测验不强制满分。planned/draft 不能标记完成。

## 数学与随机过程

experiment.ts 只导出纯函数与类型。输入无效、形状错误、越界与非有限数值必须明确处理。
使用解析值与不变量断言，而不是只测试实现副本或截图。
误差容差结合数据尺度说明，避免对浮点数一律严格等于。
随机模拟固定 seed、明确样本数、提供重新采样。改变参数时默认保留基础随机样本，区分模型变化和抽样噪声。
逐步算法提供步号、当前状态、单步、播放暂停、速度和复位，隐藏页暂停，卸载释放资源。

## 本地实验

遵守 LOCAL_LABS。lesson.ts 的 localLab 描述 environment、data、steps、files、expected、troubleshooting。
files 相对于 labs/lessons/<ID>，禁止 .. 越界，每个文件不超过 1 MiB。
构建复制文件到 BASE_URL + labs/<ID>/<file>；课程内下载链接必须使用 BASE_URL。
网页不执行 Python 或训练任务。

## 检查与 PR

- experiment.test.ts：解析结果、两个任务卡场景、边界、无效参数、随机复现与容差。
- lesson.test.ts：协议、章节存在、输入改变结果、复位与主要交互。
- ready 必须完成内容、测验和独立教学审阅；不能靠伪造状态或空测试获取发布资格。
- 运行 check/lint/validate/test/build；涉及导航、交互或存储时运行浏览器测试。
- 仅一课一个 PR，附截图、数学证据、执行过的检查与限制。
