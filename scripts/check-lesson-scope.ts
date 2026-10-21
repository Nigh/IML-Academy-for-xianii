import { execFileSync } from 'node:child_process';
const branch =
  process.env.GITHUB_HEAD_REF ||
  execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
const match = /^lesson\/(M\d{2}-\d{3})-/.exec(branch);
if (match) {
  const base = process.env.SCOPE_BASE ?? 'origin/main';
  const files = execFileSync('git', ['diff', '--name-only', '--no-renames', `${base}...HEAD`], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);
  const allowed = [`src/lessons/${match[1]}/`, `labs/lessons/${match[1]}/`];
  const invalid = files.filter((file) => !allowed.some((prefix) => file.startsWith(prefix)));
  if (invalid.length) throw new Error(`课程任务越界：\n${invalid.join('\n')}`);
  console.log(`${match[1]} scope ✓`);
} else console.log('Infrastructure branch: lesson-only scope restriction does not apply.');
