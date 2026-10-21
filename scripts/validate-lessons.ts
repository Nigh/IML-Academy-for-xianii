import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lessons } from '../src/lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../src/lib/lesson/contract.ts';
const root = resolve('src/lessons');
let ready = 0;
for (const dir of await readdir(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) throw new Error(`课程根目录不接受文件：${dir.name}`);
  const meta = lessons.find((l) => l.id === dir.name);
  if (!meta) throw new Error(`未注册课程：${dir.name}`);
  const entry = await import(pathToFileURL(resolve(root, dir.name, 'lesson.ts')).href);
  const definition = lessonDefinitionSchema.parse(entry.default);
  if (definition.id !== dir.name) throw new Error(`页面 ID 不匹配：${dir.name}`);
  const body = await readFile(resolve(root, dir.name, 'Lesson.svelte'), 'utf8');
  if (!body.trim() || !body.includes('TheorySection')) throw new Error(`缺少实际正文：${dir.name}`);
  if (definition.status === 'ready') {
    ready++;
    for (const name of ['experiment.ts', 'experiment.test.ts', 'lesson.test.ts'])
      await stat(resolve(root, dir.name, name));
    if (definition.sections.length < 5) throw new Error(`ready 章节不足：${dir.name}`);
    if (meta.localLab && !definition.localLab) throw new Error(`缺少本地实验描述：${dir.name}`);
  }
  for (const file of definition.localLab?.files ?? []) {
    const base = resolve('labs/lessons', dir.name);
    const path = resolve(base, file);
    const rel = relative(base, path);
    if (rel === '..' || rel.startsWith(`..${sep}`) || resolve(path) === base)
      throw new Error(`参考代码路径越界：${file}`);
    if ((await stat(path)).size > 1024 * 1024) throw new Error(`参考代码超过 1 MiB：${file}`);
  }
}
console.log(`Lessons: ${ready} ready; all implementation entries valid ✓`);
