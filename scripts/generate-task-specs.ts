import { readFile, writeFile, readdir } from 'node:fs/promises';
import { z } from 'zod';
import katex from 'katex';
import { lessons, modules } from '../src/lib/curriculum/catalog.ts';
const check = process.argv.includes('--check');
const schema = z.object({
  id: z.string(),
  concepts: z.array(z.string().min(2)).min(2),
  formula: z.string().min(2),
  notation: z.string().min(10),
  interaction: z.object({
    model: z.string().min(10),
    controls: z.string().min(10),
    output: z.string().min(10),
    limitations: z.string().min(10),
  }),
  scenarios: z.array(z.string().min(12)).min(2),
  misconceptions: z.array(z.string().min(8)).min(1),
  engineeringCase: z.string().min(12),
  acceptance: z.array(z.string().min(10)).min(4),
  testCases: z.array(z.string().min(10)).min(3),
  references: z.array(z.string()),
});
const all: z.infer<typeof schema>[] = [];
for (const mod of modules) {
  const designs = schema
    .array()
    .parse(JSON.parse(await readFile(`curriculum/designs/${mod.id}.json`, 'utf8')));
  for (const design of designs) {
    if (all.some((d) => d.id === design.id)) throw new Error(`设计 ID 重复：${design.id}`);
    const lesson = lessons.find((l) => l.id === design.id && l.moduleId === mod.id);
    if (!lesson) throw new Error(`孤立教学设计：${design.id}`);
    katex.renderToString(design.formula, { throwOnError: true, trust: false, strict: 'ignore' });
    const front = [
      '---',
      `id: ${lesson.id}`,
      `title: ${JSON.stringify(lesson.title)}`,
      `module: ${lesson.moduleId}`,
      `dependencies: ${JSON.stringify(lesson.prerequisites)}`,
      `difficulty: ${lesson.difficulty}`,
      `estimatedMinutes: ${lesson.estimatedMinutes}`,
      `interactionType: ${lesson.interactionType}`,
      `localLab: ${lesson.localLab}`,
      '---',
    ].join('\n');
    const bullets = (items: string[]) => items.map((s) => `- ${s}`).join('\n');
    const text = `${front}\n\n# ${lesson.id} · ${lesson.title}\n\n> 生成源：curriculum/lessons.json 与 curriculum/designs/${mod.id}.json。请修改源文件后运行 pnpm tasks:generate。\n\n## 开始前\n\n依次读取 AGENTS.md、docs/LESSON_SPEC.md、docs/COMPONENTS.md、docs/NOTATION.md。本任务仅实现本课；前置课程未 ready 不妨碍开发。\n\n## 教学目标\n\n${bullets(lesson.objectives)}\n\n## 必须讲解的概念\n\n${bullets(design.concepts)}\n\n## 核心数学模型\n\n\\[\n${design.formula}\n\\]\n\n${design.notation}\n\n公式仅在课内声明的假设下使用；涉及近似、渐近或算法机制时解释成立条件，不能把本式当作无条件定理。\n\n## 必须实现的交互或本地实验\n\n- 模型：${design.interaction.model}\n- 操作：${design.interaction.controls}\n- 输出：${design.interaction.output}\n- 局限：${design.interaction.limitations}\n- 输入范围必须覆盖以下两个场景；每个参数标注名称、单位、有效区间与非法输入策略。\n\n## 必须探索的两个场景\n\n${design.scenarios.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n## 误区与反例\n\n${bullets(design.misconceptions)}\n\n## 工程案例\n\n${design.engineeringCase}\n\n## 数学验证\n\n${bullets(design.testCases)}\n\n把期望值或定性不变量写成断言，不能仅生成快照。随机模型固定 seed、标注样本数，不用单次随机结果断言普遍结论。\n\n## 验收标准\n\n${bullets(design.acceptance)}\n- Shell 提供元信息、依赖、测验、进度和导航；正文覆盖动机、直觉、交互、数学、误区、工程联系与总结。\n- 声明 ready 前通过 pnpm check、pnpm lint、pnpm validate:lessons、pnpm test 和 pnpm build；提供课程截图及交互说明。\n${lesson.localLab ? '- 提供实验目标、环境安装命令、公开或合成数据、参考代码、执行步骤、预期范围、排错与扩展建议；网页不运行训练环境。\n- 代码优先 .py，不提交数据集或模型权重；区分已执行与未执行的硬件验证。\n' : ''}\n## 可写范围\n\n\`src/lessons/${lesson.id}/**\`\n\`labs/lessons/${lesson.id}/**\`\n\n不得修改中央注册表、App、路由、共享组件公共接口或依赖。复用不足时先做课程内组件，通用能力另开基础设施任务。\n\n## 交付文件\n\nlesson.ts、Lesson.svelte、experiment.ts、experiment.test.ts、lesson.test.ts${lesson.localLab ? ' 与 labs/lessons/' + lesson.id + '/README.md、参考代码和配置' : ''}。复杂计算必须是纯函数。\n`;
    const path = `curriculum/tasks/${lesson.id}.md`;
    if (check) {
      if ((await readFile(path, 'utf8')) !== text) throw new Error(`任务卡未同步：${path}`);
    } else await writeFile(path, text);
    all.push(design);
  }
}
if (all.length !== lessons.length) throw new Error('教学设计没有覆盖全部课程');
const taskFiles = (await readdir('curriculum/tasks')).filter((p) => p.endsWith('.md'));
if (taskFiles.length !== lessons.length) throw new Error('任务卡数量不一致或有孤立文件');
console.log(
  `${check ? 'Checked' : 'Generated'} ${all.length} independently specified lesson tasks ✓`,
);
