import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

type Comment = {
  body: string;
  author_association: string;
  user: { type: string; login: string } | null;
  html_url: string;
};

export function teachingAcceptance(files: string[], sha: string, comments: Comment[]) {
  if (!files.some((file) => /^(src|labs|curriculum)\//.test(file)))
    return { state: 'success', description: '无课程或运行时变更，教学验收不适用' } as const;
  const acceptance = comments.find(
    (comment) =>
      comment.user?.type === 'User' &&
      !comment.user.login.endsWith('[bot]') &&
      ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(comment.author_association) &&
      comment.body.trim().startsWith(`/teaching-accept ${sha}\n`) &&
      comment.body.trim().slice(`/teaching-accept ${sha}\n`.length).trim().length > 0,
  );
  return acceptance
    ? ({
        state: 'success',
        description: '维护者已确认当前提交的教学验收；质量判断由人类负责',
        target_url: acceptance.html_url,
      } as const)
    : ({ state: 'failure', description: '等待维护者对当前提交确认教学验收及证据' } as const);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8'));
  const number = event.pull_request?.number ?? (event.issue?.pull_request && event.issue.number);
  if (!number) process.exit(0);
  const root = `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}`;
  async function api(path: string, body?: object) {
    const response = await fetch(`${root}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
    return response.json();
  }
  async function pages(path: string) {
    const items = [];
    for (let page = 1; ; page++) {
      const batch = await api(`${path}?per_page=100&page=${page}`);
      items.push(...batch);
      if (batch.length < 100) return items;
    }
  }
  const pull = await api(`/pulls/${number}`);
  if (pull.state !== 'open') process.exit(0);
  await api(`/statuses/${pull.head.sha}`, {
    context: 'teaching-review',
    state: 'pending',
    description: '正在核对当前提交与维护者验收记录',
  });
  const files = await pages(`/pulls/${number}/files`);
  // GitHub caps this endpoint at 3000 files. Never silently accept a partial diff.
  if (files.length !== pull.changed_files) throw new Error('PR 文件列表不完整，不能判定验收范围');
  const comments = await pages(`/issues/${number}/comments`);
  const result = teachingAcceptance(
    files.flatMap((file) => [
      file.filename,
      ...(file.previous_filename ? [file.previous_filename] : []),
    ]),
    pull.head.sha,
    comments,
  );
  await api(`/statuses/${pull.head.sha}`, { context: 'teaching-review', ...result });
  console.log(`${result.state}: ${result.description}`);
}
