<script lang="ts">
  import { lessonById } from '../../lib/curriculum/catalog.ts';
  import { readyLessons } from '../../lib/curriculum/loader.ts';
  import {
    progress,
    exportProgress,
    previewImport,
    importProgress,
  } from '../../lib/progress/progress.svelte.ts';
  import type { ProgressData } from '../../lib/progress/schema.ts';
  import LessonList from '../../components/common/LessonList.svelte';
  let pending = $state<ProgressData | null>(null);
  let message = $state('');
  let dialog: HTMLDialogElement;
  const ready = readyLessons();
  const visited = $derived(
    Object.keys(progress.data.lessons)
      .map((id) => lessonById.get(id))
      .filter((l) => l !== undefined),
  );
  const completed = $derived(ready.filter((l) => progress.data.lessons[l.id]?.completedAt));
  function download() {
    const url = URL.createObjectURL(new Blob([exportProgress()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `iml-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function read(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('文件超过 2 MiB');
      pending = previewImport(await file.text());
      dialog.showModal();
      message = '';
    } catch (error) {
      message = `无法导入：${error instanceof Error ? error.message : '文件无效'}。原进度未改变。`;
    }
    input.value = '';
  }
</script>

<header class="page-header">
  <span class="eyebrow">Your learning</span>
  <h1>我的学习进度</h1>
  <p class="lead">进度保存在当前浏览器。导出一份备份，就可以在另一台设备上继续。</p>
</header>
<div class="progress-overview">
  <strong>{completed.length}<small> / {ready.length}</small></strong>
  <div>
    <h2>已完成 / 已发布课程</h2>
    <p>
      {ready.length
        ? `已完成 ${Math.round((completed.length / ready.length) * 100)}% 的已发布课程`
        : '尚无已发布课程'} · 已访问 {visited.length} 节
    </p>
  </div>
</div>
<div class="progress-actions">
  <button class="btn btn-primary" onclick={download}>导出 JSON 备份 ↓</button><label
    class="file-import"
    >导入进度 JSON<input type="file" accept="application/json,.json" onchange={read} /></label
  >
</div>
{#if message}<p class="notice" role="status">{message}</p>{/if}
<section>
  <div class="section-heading">
    <h2>已经访问的课程</h2>
    <span class="metadata">规划页不计入完成率</span>
  </div>
  {#if visited.length}<LessonList
      items={visited.sort(
        (a, b) => progress.data.lessons[b.id].visitedAt - progress.data.lessons[a.id].visitedAt,
      )}
    />{:else}<div class="empty-state">
      <h3>从一次探索开始</h3>
      <p>打开课程后，它会出现在这里。</p>
      <a class="text-link" href="#/curriculum">探索课程 →</a>
    </div>{/if}
</section>
<dialog bind:this={dialog} aria-labelledby="import-title" onclose={() => (pending = null)}>
  <h2 id="import-title">合并这份学习进度？</h2>
  {#if pending}<p>
      文件包含 {Object.keys(pending.lessons).length} 节课程记录，其中 {Object.keys(
        pending.lessons,
      ).filter((id) => !lessonById.has(id)).length} 节当前目录未知。未知记录会保留。
    </p>
    <p>相同记录采用较新的时间；不会将规划课标记为完成。</p>{/if}
  <form method="dialog" class="dialog-actions">
    <button class="btn btn-ghost" value="cancel">取消</button><button
      class="btn btn-primary"
      value="confirm"
      onclick={() => {
        if (pending) {
          importProgress(pending);
          message = '进度已合并。';
        }
      }}>确认合并</button
    >
  </form>
</dialog>
