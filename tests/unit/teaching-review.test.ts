import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';
import { teachingAcceptance } from '../../scripts/check-teaching-review';

const sha = 'a'.repeat(40);
const comment = {
  body: `/teaching-accept ${sha}\n已检查任务操作与解释，证据见 PR 的试用记录。`,
  author_association: 'OWNER',
  user: { type: 'User', login: 'maintainer' },
  html_url: 'https://github.com/example/repo/pull/1#issuecomment-1',
};
const files = ['src/lessons/M01-002/Lesson.svelte'];

it('只有当前提交的维护者人工记录可放行；修改、撤回和机器人均不能沿用批准', () => {
  expect(teachingAcceptance(files, sha, [comment]).state).toBe('success');
  expect(teachingAcceptance(files, 'b'.repeat(40), [comment]).state).toBe('failure');
  expect(teachingAcceptance(files, sha, []).state).toBe('failure');
  for (const invalid of [
    { ...comment, author_association: 'CONTRIBUTOR' },
    { ...comment, user: { type: 'Bot', login: 'reviewer[bot]' } },
    { ...comment, user: null },
    { ...comment, body: `/teaching-accept ${sha}` },
    { ...comment, body: '引用旧批准，不代表本次验收\n' + comment.body },
  ])
    expect(teachingAcceptance(files, sha, [invalid]).state).toBe('failure');
  expect(teachingAcceptance(['docs/LESSON_SPEC.md'], sha, []).state).toBe('success');
  expect(teachingAcceptance(['src/components/charts/VectorDiagram.svelte'], sha, []).state).toBe(
    'failure',
  );
  expect(teachingAcceptance(['curriculum/designs/M01.json'], sha, []).state).toBe('failure');
});

it('真实脚本读取 PR 当前提交、文件与评论，先置 pending 再发布验收状态；API 失败不保留绿灯', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'teaching-review-'));
  const statuses: { state: string; context: string; target_url?: string }[] = [];
  let failComments = false;
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const path = request.url!;
    if (request.method === 'POST') {
      let body = '';
      for await (const chunk of request) body += chunk;
      statuses.push(JSON.parse(body));
      response.end('{}');
    } else if (path.endsWith('/pulls/1')) {
      response.end(JSON.stringify({ state: 'open', head: { sha }, changed_files: 1 }));
    } else if (path.includes('/files?')) {
      response.end(JSON.stringify([{ filename: files[0] }]));
    } else if (path.includes('/comments?')) {
      response.statusCode = failComments ? 503 : 200;
      response.end(JSON.stringify([comment]));
    } else {
      response.statusCode = 404;
      response.end('{}');
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address() as { port: number };
    const event = join(directory, 'event.json');
    await writeFile(event, JSON.stringify({ issue: { number: 1, pull_request: {} } }));
    const run = () =>
      promisify(execFile)(process.execPath, [resolve('scripts/check-teaching-review.ts')], {
        env: {
          ...process.env,
          GITHUB_EVENT_PATH: event,
          GITHUB_REPOSITORY: 'example/repo',
          GITHUB_API_URL: `http://127.0.0.1:${address.port}`,
          GH_TOKEN: 'local-test-token',
        },
      });
    await run();
    expect(statuses.map((status) => status.state)).toEqual(['pending', 'success']);
    expect(statuses[1]).toMatchObject({ context: 'teaching-review', target_url: comment.html_url });
    failComments = true;
    await expect(run()).rejects.toThrow();
    expect(statuses.at(-1)?.state).toBe('pending');
  } finally {
    await promisify(server.close.bind(server))();
    await rm(directory, { recursive: true, force: true });
  }
});
