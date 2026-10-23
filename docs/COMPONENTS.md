# Interactive Component Contract v1

实现接口以组件内 TypeScript props 为准；Svelte 5 snippets 与 callback attributes，不使用旧式事件 dispatcher。
Phase 1 的共享层、三课和集成测试已分别通过 PR CI 与代理内容审阅，Interactive Component Contract v1 在本次验收后冻结。后续破坏性变更需显式迁移并验证现有课程。完整组合示例见 [INTERACTIVE_GUIDE](INTERACTIVE_GUIDE.md)。
现有 M01-002 调用保持兼容。公共组件不包含课程目标函数或实验参数；参数归课程所有。

组件兼容性不证明教学布局合格。先按 LESSON_SPEC §4 设计桌面核心工作区，再组合控件；同状态的两张图不等于连续操作。图表默认实虚线不能决定课程对象的含义，需要课内呈现时在授权范围实现，不为复用强行保留误导样式。旧示范课不自动获得可信样板资格。

## 数学与数据协议

| 模块                              | 真实导出与行为                                                                                                                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/math/vector.ts`          | `Vector2 {x,y}`、`vector`、`add`、`subtract`、`scale`、`dot`、`norm`、`normalize`、`angle`、`project`、`finite`。角度返回弧度；零向量归一化/夹角/目标投影返回 null；非法有限性输入抛 RangeError。                                                                       |
| `coordinates.ts`                  | `Range = readonly [number,number]`、`validRange`、`mapping(xRange,yRange,width,height,equal?)` 返回 `toScreen/toData`；屏幕 y 向下，数据 y 向上；`transformRange(range,zoom,pan?)`；`canvasSize(width,height,dpr?)`。范围递增、尺寸为正。                               |
| `probability.ts`                  | `Distribution` 判别联合；`validate`、`density`（连续 PDF/离散 PMF）、`cdf`、`normalCDF`、`binomialPMF`、`moments`、`seeded`、`sample`、`statistics`、`histogram`。统计返回 mean、populationVariance、sampleVariance；空样本返回 null，单样本的 sampleVariance 为 null。 |
| `src/lib/simulations/gradient.ts` | `Objective {value,gradient}`、`descend(objective,initial,eta,maxSteps,tolerance?)`；初值维度 1 或 2，eta>0，最多 1000 步；返回 history 的 x/loss/gradient 和 status。驻点阈值默认 1e-8；周期为有限容差的两点检测；绝对参数/损失上限保护。                               |
| `charts/types.ts`                 | `PlotSeries {id,label,kind,points,role}`；kind 为 line/scatter/bar/step，points 为 `{x,y,width?}[]`，width 是柱的数据坐标宽；role 为 primary/secondary/accent。`ReferenceLine {axis,value,label}`。                                                                     |

`mapping` 不依赖组件尺寸测量；图表 viewBox 使用逻辑像素，浏览器缩放保持 SVG 清晰。
Canvas 调用者应设置 backing width/height 并按 scale 缩放上下文；当前公共图表采用 SVG。
随机算法为 Mulberry32、Normal 采样为 Box–Muller；seed 为 uint32，样本 1–10000；Binomial n 为整数 0–1000（课程 UI 收紧为 100）。
Normal CDF 使用 A&S 7.1.26 的 erf 近似，标准参考值误差测试 <8e-8；不是符号积分。

## 输入与交互

| 组件               | Props / callbacks                                                                                                                                     | 使用、状态与限制                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NumericInput       | label、value、min、max、step=1、unit=''、integer=false、onchange(number)                                                                              | 受控有限数。合法输入即时回调；负号/小数点中间态保留，blur/Enter 明确校验。错误关联 aria-describedby，非法值不传播。整数计数显式传 integer；step 是建议步长。                    |
| ParameterSlider    | NumericInput 的原有 props；initialValue?、description?                                                                                                | 数值框和原生 range 同步；initialValue 提供局部重置按钮，完整实验 reset 在父层。step 不强制量化文本值（整数模式除外）。                                                          |
| PresetSelector     | presets: readonly `{id,name,description}[]`、value、defaultId、onchange(id)                                                                           | 按钮 aria-pressed 标示选中，父层应用参数；不匹配 id 显示“自定义参数”。默认 id 必须存在。                                                                                        |
| InteractivePanel   | title、instructions、meaning、limitations、onreset、children；computationKind?: analytic/simulation/precomputed（默认 analytic）、seed?、sampleCount? | 统一标题、复位、说明、计算性质和边界。通过 children 自由组合参数/图/结果；不拥有数学状态。                                                                                      |
| SimulationControls | index、maxSteps、finished=false、speed、onstep、onreset、onspeedchange                                                                                | 单步、播放/暂停、复位、1/2/5/10 步每秒。结束禁用推进；父层限制索引。隐藏暂停、不补帧、卸载清理 interval；reduced motion 禁用播放，仍可单步。修改模型时用 key 重建，见课程示例。 |
| StepByStep         | steps: readonly `{title,explanation,latex?,snapshot?}[]`、index、onchange(index)                                                                      | 只显示解释步骤和公式/快照、前后导航；不计算算法状态。与 SimulationControls 分工不同。                                                                                           |

例如 `<NumericInput label="阈值" value={threshold} min={-5} max={5} step={0.1} onchange={v => threshold = v} />`。
`<PresetSelector presets={presets} value={preset} defaultId="normal" onchange={select} />` 的 select 应设置全部相关参数。

## 图表

| 组件             | Props / callbacks                                                                                                                                                | 用途、无障碍与边界                                                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plot2D           | series、xRange、yRange、xLabel、yLabel、description；title?、xUnit?、yUnit?、grid=true、equal=false、references=[]、highlight?:Range、onselect?(seriesId,index)  | 轴刻度、折线/散点/柱/右连续阶梯、图例、参考线、范围高亮；无效输入显示错误、空数据有空态。图例文字与实虚线区分系列。details 内原生 range 提供键盘逐点数值与回调。超过 2000 点/序列拒绝；越界图形 clip。                 |
| VectorDiagram    | vectors: `{x,y,label,role,origin?,draggable?}[]`、description、range=10；onchange?(index,x,y)、projection?:{from,to}、showAngle=false、grid=true、axisRotation=0 | 等比例正交坐标、箭头、网格、标签；显示范围 ±range（0<range≤100）。Pointer Events + capture；屏幕坐标逆映射，拖动输出四舍五入至 0.1。带 origin 时输出相对分量。需要父层提供键盘数值输入。投影辅助线和非零向量角弧可选。 |
| DistributionPlot | points、xRange、yRange、description；discrete=false、cumulative=false、mean?、empirical=[]、highlight?                                                           | 只接受已算好的理论/经验数据；PMF 柱、PDF 折线、离散 CDF 阶梯；均值参考线。连续纵轴为密度，CDF 为累计概率。不会替课程计算概率积分。                                                                                     |
| HistogramPlot    | samples、bins=20、mode=count/frequency/density（默认 density）、theory=[]                                                                                        | 原始样本计算直方图。bin 1–200，空/退化样本有处理；density 柱面积总和为 1。理论叠加必须与纵轴同单位，组件不推断理论单位。非法数据进入空态，数学函数独立抛错。                                                           |
| ContourPlot      | contours:PlotSeries[]、path、current、xRange、yRange、description；gradient?                                                                                     | 等高线由课程纯函数生成，叠加路径、当前点和负梯度方向线段；gradient 为课程已缩放的显示向量，坐标图不计算函数。                                                                                                          |

图表最小逻辑宽度保持文字可读，必要时局部横向滚动；SVG 高 DPI 自适应，无外部字体/CDN。项目不提供窄屏、竖屏适配或测试，使用范围按 LESSON_SPEC §4。
关键结果必须另外放在正文或 aria-live output；图形标题不能替代所有数学解释。
预设参数、视域与标签布局按 [LESSON_SPEC §4.1](LESSON_SPEC.md#41-预设图形的可读性验收) 逐项验收。共享组件不会自动保证所有输入组合的布局可读；课程应显式选择 `range` / `xRange` / `yRange`，避免内容挤在原点附近。该要求是使用与验收约束，不新增自动缩放、标签避让等组件能力或修改 v1 props。
例：`<HistogramPlot samples={samples} bins={20} mode="density" />`；
`<ContourPlot contours={levels} path={trajectory} current={point} xRange={[-5,5]} yRange={[-5,5]} description="椭圆为目标值等高线" />`。

## 数学与教学

| 组件                      | Props / callbacks                                                                                                             | 使用与限制                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| FormulaBlock（math 目录） | latex、description、inline=false、number?、variables?: readonly `{symbol,meaning}[]`                                          | KaTeX、trust=false、MathML 与 HTML；错误显示可读反馈；长公式局部滚动。公式通过 JS 字符串传递，不能让 Svelte 解析 LaTeX 花括号。 |
| MatrixView                | values、rowLabels=[]、columnLabels=[]、readonly=true、highlight:readonly `[row,column][]`=[]、oncellchange?(row,column,value) | 非空矩形有限数值、最多 100×100；可选 NumericInput 编辑（±1e6）；单元格高亮还通过下划线/粗体表示；表格行列标题。                 |
| DefinitionBlock           | term、notation?、children                                                                                                     | 术语 h3、可选 KaTeX 定义和正文 snippet。                                                                                        |
| KnowledgeCheck            | prompt、answer snippet                                                                                                        | 原生 details 揭示解释，不保存进度；正式测验仍由 lesson.ts 配置。                                                                |
| CommonMistakes            | items: readonly `{mistake,correction}[]`                                                                                      | 误区与反例的定义列表，内容归课程。                                                                                              |
| ExperimentGuide           | steps: readonly string[]                                                                                                      | 探索步骤有序列表。                                                                                                              |
| LessonSummary             | points:readonly string[]、related:readonly LessonId[]                                                                         | 3–5 要点由调用者提供，相关课使用 catalog 的正式地址；调用者必须保证 ID 已注册。                                                 |
| LocalLabGuide             | lab:LocalLabDescriptor、lessonId                                                                                              | 环境、数据、步骤、结果、排错和 BASE_URL 下载；拒绝路径越界。仅展示本地运行指南，不执行训练。                                    |
| CodeBlock                 | code、language、filename?                                                                                                     | 原样转义文本、横向滚动、复制与失败反馈；无重型高亮。                                                                            |
| ReferenceLinks            | items:readonly `{title,source,url}[]`                                                                                         | 外部来源说明，只有 http/https 可点击。                                                                                          |

`<FormulaBlock latex={String.raw\`f(x)=x^2\`} description="x 为无量纲实数。" />`。
`<MatrixView values={[[1,0],[0,1]]} highlight={[[0,0]]} />`。
`<CommonMistakes items={[{mistake:'密度等于单点概率',correction:'连续单点概率为零。'}]} />`。
`<LessonSummary points={['结论一','结论二','结论三']} related={['M01-002']} />`。
`<StepByStep steps={[{title:'计算梯度',explanation:'在当前位置求导。'}]} index={stage} onchange={v=>stage=v} />`。
`<LocalLabGuide lab={definition.localLab} lessonId={metadata.id} />`只在 localLab 存在时渲染。`<CodeBlock code="print(1)" language="python" />`；`<ReferenceLinks items={[{title:'原文',source:'作者',url:'https://example.com'}]} />`。

## 现有 Shell 协议（不变）

- LessonShell：metadata、status、definition?、children；仅平台装配调用。
- LessonHeader：metadata、status；仅 Shell 使用。
- PrerequisiteLinks：id、prerequisites；直接/传递前置链接。
- LessonNavigation：id；目录导航。
- TheorySection：id、title、children；课内唯一章节锚点和 h2。
- QuizBlock：question、savedAnswer?、onsubmit(optionId)；选项解释与稳定版本，Shell 持久化。
- PlannedLesson：metadata；只有路由回退使用。
- LessonList：items:LessonMetadata[]；元信息与状态。

无需再创建重复 KnowledgeCheck/QuizBlock：前者自检揭示，后者有版本的正式单选。

## 通用验收与发布

所有颜色引用既有主题语义 tokens，不复制品牌色；基础字号继承现有 app.css。
输入须有 label、错误文本、可见焦点和键盘操作。图表提供单位、文字说明与非颜色区分。
必须检查 1280×720 与 1920×1080 横屏桌面、亮暗主题、桌面缩放、reduced motion、复位、卸载清理和非法值。窄屏、竖屏与手机触屏不在测试范围。
新建课程一课一 PR，共享接口与规范文档通常独立提交；既有课程的授权批量修订可将直接相关变更放入同一个 PR；CI 与内容审阅完成前，不将本地通过写成正式发布。

## 单位网格与坐标旋转

`unitGrid(range,pixels)` 返回整数单位格的显示位置及省略间隔step，每轴最多81条。密集时跳过整数线，不把一格重新定义为视域的五分之一；少于一单位的视域可仅显示边界读数。
`Plot2D.equal=true` 使横纵坐标单位等长，短轴的可见范围扩展以填满绘图区；输入范围仍全部可见。统一映射作用于曲线、柱宽、参考线和高亮；几何课程显式启用，不同单位统计曲线保持默认独立轴比例。
`VectorDiagram.axisRotation` 为坐标系逆时针角度（度），默认0。网格、坐标轴和刻度整体旋转，向量仍使用原物理坐标。拖拽回调保留原物理分量约定，调用者若显示旋转坐标需自行转换；不要再用两根短向量冒充坐标轴。
答题反馈用error/success语义色及文字区分错误与正确，重新选择后隐藏上次反馈。
