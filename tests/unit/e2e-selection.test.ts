import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';
import { requiresBrowser, resolveRange, selectLessons } from '../../scripts/select-e2e-lessons';
const a = { id: 'M01-002', slug: 'a', title: 'A' };
const b = { id: 'M03-010', slug: 'b', title: 'B' };
it('单课、多课和删除文件按目录去重；共享和说明文档不扩大全量', () => {
  expect(
    selectLessons(
      ['src/lessons/M01-002/Lesson.svelte', 'labs/lessons/M01-002/run.py'],
      [a, b],
      [a, b],
    ).lessons,
  ).toEqual([a]);
  expect(
    selectLessons(
      ['src/lessons/M01-002/deleted.ts', 'src/lessons/M03-010/lesson.ts'],
      [a, b],
      [a, b],
    ).lessons,
  ).toEqual([a, b]);
  expect(
    selectLessons(['docs/CONTRIBUTING.md', 'src/components/shared.svelte'], [a, b], [a, b]).lessons,
  ).toEqual([]);
});
it('注册表新增、修改、删除和 slug 迁移选中相关课程并检查旧地址', () => {
  expect(selectLessons([], [a], [a, b]).lessons).toEqual([b]);
  expect(selectLessons([], [a, b], [a]).removed).toEqual([b]);
  const renamed = { ...b, slug: 'new-b' };
  expect(selectLessons([], [a, b], [a, renamed])).toEqual({ lessons: [renamed], removed: [b] });
});
it('PR 使用 merge-base；push 使用完整 before/after；仅审计 tag 全量', () => {
  expect(
    resolveRange(
      'pull_request',
      { pull_request: { base: { sha: 'base' }, head: { sha: 'head' } } },
      'refs/pull/1/merge',
    ),
  ).toEqual({ base: 'base', head: 'head', mergeBase: true });
  expect(resolveRange('push', { before: 'old', after: 'new' }, 'refs/heads/main')).toEqual({
    base: 'old',
    head: 'new',
    mergeBase: false,
  });
  expect(resolveRange('push', {}, 'refs/tags/audit-courses-v2026.10.21.1')).toBeNull();
  expect(() => resolveRange('push', { before: '0000', after: 'new' }, 'refs/heads/main')).toThrow(
    /基线/,
  );
  expect(() => resolveRange('push', {}, 'refs/tags/v1')).toThrow(/基线/);
});

it('真实 Git 多提交 push、PR merge-base、删除和 tag 输出', () => {
  const dir = mkdtempSync(join(tmpdir(), 'e2e-selection-'));
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  const commit = () => {
    git('add', '.', ':!event.json', ':!output');
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'fixture');
    return git('rev-parse', 'HEAD');
  };
  const run = (event: string, payload: object, ref = 'refs/heads/main', force = false) => {
    writeFileSync(join(dir, 'event.json'), JSON.stringify(payload));
    writeFileSync(join(dir, 'output'), '');
    execFileSync(
      process.execPath,
      ['--import', import.meta.resolve('tsx'), resolve('scripts/select-e2e-lessons.ts')],
      {
        cwd: dir,
        stdio: 'pipe',
        env: {
          ...process.env,
          FORCE_BROWSER: String(force),
          GITHUB_EVENT_NAME: event,
          GITHUB_REF: ref,
          GITHUB_EVENT_PATH: join(dir, 'event.json'),
          GITHUB_OUTPUT: join(dir, 'output'),
        },
      },
    );
    const output = readFileSync(join(dir, 'output'), 'utf8').trim().split('\n');
    return {
      ...JSON.parse(output[0].slice('selection='.length)),
      browser: output[1] === 'browser=true',
    };
  };
  try {
    git('init', '-q');
    mkdirSync(join(dir, 'curriculum'));
    writeFileSync(join(dir, 'curriculum/lessons.json'), JSON.stringify([a, b]));
    const base = commit();
    mkdirSync(join(dir, 'src/lessons/M01-002'), { recursive: true });
    writeFileSync(join(dir, 'src/lessons/M01-002/lesson.ts'), '// fixture');
    commit();
    mkdirSync(join(dir, 'labs/lessons/M03-010'), { recursive: true });
    writeFileSync(join(dir, 'labs/lessons/M03-010/run.py'), '# fixture');
    const head = commit();
    expect(run('push', { before: base, after: head }).lessons).toEqual([a, b]);
    expect(
      run('pull_request', { pull_request: { base: { sha: base }, head: { sha: head } } }).lessons,
    ).toEqual([a, b]);
    expect(run('push', {}, 'refs/tags/audit-courses-v1').lessons).toEqual([a, b]);
    writeFileSync(join(dir, 'curriculum/lessons.json'), JSON.stringify([a]));
    const deleted = commit();
    expect(run('push', { before: head, after: deleted })).toEqual({
      lessons: [],
      removed: [b],
      browser: true,
    });
    expect(() => run('push', { before: '0'.repeat(40), after: deleted })).toThrow();
    mkdirSync(join(dir, 'skills/example'), { recursive: true });
    writeFileSync(join(dir, 'skills/example/SKILL.md'), '# Example');
    const docs = commit();
    const pr = { pull_request: { base: { sha: deleted }, head: { sha: docs } } };
    expect(run('pull_request', pr).browser).toBe(false);
    expect(run('pull_request', pr, 'refs/pull/1/merge', true).browser).toBe(true);
    expect(run('push', { before: deleted, after: docs }).browser).toBe(false);
    expect(run('push', {}, 'refs/tags/audit-courses-v1').browser).toBe(true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

it('仅已知项目说明与 skill Markdown 跳过浏览器，未知或混合变更保守运行', () => {
  expect(
    requiresBrowser([
      'skills/math-storytelling/SKILL.md',
      'skills/math-storytelling/references/example.md',
      'docs/CONTRIBUTING.md',
      'README.md',
      'AGENTS.md',
      'PLAN.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
    ]),
  ).toBe(false);
  for (const file of [
    'src/lessons/M01-002/Lesson.svelte',
    'src/lessons/M01-002/README.md',
    'labs/lessons/M01-002/run.py',
    'curriculum/lessons.json',
    'package.json',
    'pnpm-lock.yaml',
    'vite.config.ts',
    '.github/workflows/ci.yml',
    'scripts/select-e2e-lessons.ts',
    'tests/e2e/core.spec.ts',
    'public/example.md',
    'skills/example/run.ts',
    'unknown.txt',
  ]) {
    expect(requiresBrowser([file]), file).toBe(true);
    expect(requiresBrowser(['skills/example/SKILL.md', file]), file).toBe(true);
  }
});
