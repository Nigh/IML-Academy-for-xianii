# 公共组件协议

真实接口以 src/lib/lesson/contract.ts 和组件的类型化 props 为准。Phase 0 仅交付框架与向量示范课需要的组件；下表标明 Phase 1 待实现部分，禁止假设未实现组件已经存在。

## Phase 0 可用

| 组件              | props / 合同                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| LessonShell       | metadata、status、definition?、children snippet；仅平台装配调用                                        |
| LessonHeader      | metadata、status；仅 Shell 使用                                                                        |
| PrerequisiteLinks | id、prerequisites；前置链接与传递依赖展开                                                              |
| LessonNavigation  | id；目录前后导航                                                                                       |
| TheorySection     | id、title、children snippet；渲染 h2，课内 id 唯一                                                     |
| FormulaBlock      | latex、description、inline?；KaTeX，默认块级，错误有文本反馈                                           |
| InteractivePanel  | title、instructions、meaning、limitations、onreset、children snippet；首版标注解析计算，仅用于解析实验 |
| NumericInput      | label、value、min、max、step?、unit?、onchange(number)；非法值不传播                                   |
| ParameterSlider   | 同 NumericInput；数值输入与 range 同步，支持键盘                                                       |
| VectorDiagram     | vectors: {x,y,label,role,origin?}[]、range?、description；role 是 primary/secondary/accent             |
| QuizBlock         | question、savedAnswer?、onsubmit(optionId)；稳定题目/选项 ID、反馈解释                                 |
| PlannedLesson     | metadata；仅路由回退使用                                                                               |
| LessonList        | items: LessonMetadata[]；展示元信息和状态                                                              |

FormulaBlock 的公式必须放在 JS 字符串表达式中，避免 Svelte 将 LaTeX 花括号作为插值，例如：

```svelte
<FormulaBlock latex={String.raw`f(x)=x^2`} description="x 为无量纲实数，输出是其平方。" />
```

输入是受控值：父组件拥有参数和 reset，控件通过 onchange 返回合法有限数。
VectorDiagram 是二维显示组件，没有默认拖动能力；用 NumericInput/ParameterSlider 提供键盘等价操作。
所有颜色来自主题 role；次向量用虚线，图形必须有可访问描述与文字输出。

## Phase 1 实现与冻结

| 组件            | 最小合同                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| DefinitionBlock | term、内容 snippet、可选 notation                                                                                         |
| Plot2D          | series: {id,label,kind:'line'或'scatter',points:{x,y}[],role}[]；xRange、yRange、轴标签及单位、description、可选 onselect |
| MatrixView      | values: number[][]、行列标签、readonly、可选 oncellchange；检查矩形结构和有限元素                                         |
| StepByStep      | index、total?、playing、speed、finished、onstep/onplay/onpause/onreset/onspeedchange；父组件拥有算法状态                  |
| KnowledgeCheck  | prompt、answer snippet；只管理答案揭示，不直接保存进度                                                                    |
| LocalLabGuide   | LocalLabDescriptor、lessonId；下载路径使用 BASE_URL                                                                       |
| CodeBlock       | code、language、filename?；转义文本与复制反馈，首版不依赖重型高亮器                                                       |
| ReferenceLinks  | {title,source,url}[]；来源可识别                                                                                          |

Phase 1 还需给 InteractivePanel 增加兼容可选 computationKind（analytic/simulation/precomputed）和 seed/sample count 描述，默认 analytic 保持示范课兼容。
Plot2D 第一版只做线和散点，不引入提前设计的全图表抽象。复杂图形留在课程内。

## 共同验收

类型检查；亮暗主题；真实 label、可见焦点和键盘操作；输入范围与非法值；图形文本摘要；非颜色区分；复位；320px 布局；reduced motion；卸载清理。
图表提供轴标签、单位、图例和观察说明，支持高 DPI 与浏览器缩放；长计算有运行上限，复杂图表只局部横向滚动。
QuizBlock 渲染单题，课程通过 lesson.ts 的 quiz 组合 2–4 道理解题；组件可用不等于已满足 LESSON_SPEC 的教学验收。
共享组件改动须由独立基础设施 PR 合并 main，不属于单课 PR 的可写范围。
