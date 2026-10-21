import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

type Lesson = { id: string; slug: string; title: string };
export function selectLessons(files: string[], before: Lesson[], after: Lesson[]) {
  const ids = new Set(
    files.flatMap((file) => /^(?:src|labs)\/lessons\/(M\d{2}-\d{3})\//.exec(file)?.[1] ?? []),
  );
  for (const lesson of [...before, ...after]) {
    if (
      JSON.stringify(before.find((item) => item.id === lesson.id)) !==
      JSON.stringify(after.find((item) => item.id === lesson.id))
    )
      ids.add(lesson.id);
  }
  return {
    lessons: after.filter((lesson) => ids.has(lesson.id)),
    removed: before.filter((lesson) => !after.some((item) => item.slug === lesson.slug)),
  };
}

export function resolveRange(
  event: string,
  payload: {
    before?: string;
    after?: string;
    pull_request?: { base: { sha: string }; head: { sha: string } };
  },
  ref: string,
) {
  if (event === 'push' && ref.startsWith('refs/tags/audit-courses-v')) return null;
  if (event === 'pull_request' && payload.pull_request)
    return {
      base: payload.pull_request.base.sha,
      head: payload.pull_request.head.sha,
      mergeBase: true,
    };
  if (event === 'push' && payload.before && payload.after && !/^0+$/.test(payload.before))
    return { base: payload.before, head: payload.after, mergeBase: false };
  throw new Error(
    '无法确定课程差异基线。请重跑有有效 before/after 的 push 或 PR；全量审计请推送 audit-courses-v* tag。',
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8'));
  const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  const range = resolveRange(
    manual ? 'push' : process.env.GITHUB_EVENT_NAME!,
    manual ? { before: event.inputs?.baseline, after: process.env.GITHUB_SHA } : event,
    process.env.GITHUB_REF!,
  );
  const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' });
  const after = JSON.parse(readFileSync('curriculum/lessons.json', 'utf8')) as Lesson[];
  let selection;
  if (range) {
    const base = range.mergeBase ? git('merge-base', range.base, range.head).trim() : range.base;
    const before = JSON.parse(git('show', `${base}:curriculum/lessons.json`)) as Lesson[];
    const files = git('diff', '--name-only', '--no-renames', '-z', base, range.head)
      .split('\0')
      .filter(Boolean);
    selection = selectLessons(files, before, after);
    console.log(`课程遍历：按需；基线 ${base}；目标 ${range.head}`);
  } else {
    selection = { lessons: after, removed: [] };
    console.log('课程遍历：tag 全量审计');
  }
  console.log(
    `选中 ${selection.lessons.length} 节：${selection.lessons.map((item) => item.id).join(', ') || '无'}；旧地址 ${selection.removed.length} 个`,
  );
  const compact = (items: Lesson[]) => items.map(({ id, slug, title }) => ({ id, slug, title }));
  selection = { lessons: compact(selection.lessons), removed: compact(selection.removed) };
  appendFileSync(process.env.GITHUB_OUTPUT!, `selection=${JSON.stringify(selection)}\n`);
}
