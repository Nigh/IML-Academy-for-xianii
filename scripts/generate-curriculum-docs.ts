import { readFile, writeFile } from 'node:fs/promises';
import { modules, lessons } from '../src/lib/curriculum/catalog.ts';
import { moduleDependencySummary } from '../src/lib/curriculum/graph.ts';
let text =
  '# 课程目录与依赖\n\n由 curriculum/modules.json 与 lessons.json 生成。ID 永不复用；前置仅建议，不锁定访问。\n\n';
for (const m of modules) {
  const list = lessons.filter((l) => l.moduleId === m.id);
  text += `## ${m.id} — ${m.title}（${list.length} 课）\n\n| ID | 名称 | 直接前置 | 路由 slug |\n|---|---|---|---|\n`;
  for (const l of list)
    text += `| ${l.id} | ${l.title} | ${l.prerequisites.join('、') || '—'} | ${l.slug} |\n`;
  text += '\n';
}
text += '## 模块依赖摘要\n\n```mermaid\ngraph LR\n';
for (const m of moduleDependencySummary(modules, lessons))
  for (const pre of m.prerequisites) text += `  ${pre} --> ${m.module}\n`;
text += '```\n';
const path = 'docs/CURRICULUM.md';
if (process.argv.includes('--check')) {
  if ((await readFile(path, 'utf8')) !== text) throw new Error('课程文档未同步');
} else await writeFile(path, text);
console.log('Curriculum documentation ✓');
