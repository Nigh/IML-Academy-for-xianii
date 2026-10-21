<script lang="ts">
  import {
    difficultyLabels,
    statusLabels,
    modules,
    moduleHref,
  } from '../../lib/curriculum/catalog.ts';
  import type { LessonMetadata, LessonStatus } from '../../lib/curriculum/schema.ts';
  let { metadata, status }: { metadata: LessonMetadata; status: LessonStatus } = $props();
</script>

<header class="lesson-header">
  <a class="eyebrow" href={moduleHref(metadata.moduleId)}
    >{metadata.moduleId} / {modules.find((m) => m.id === metadata.moduleId)?.title}</a
  >
  <div class="lesson-title-line">
    <h1>{metadata.title}</h1>
    <span class="status-badge" data-status={status}>{statusLabels[status]}</span>
  </div>
  <p class="lead">{metadata.summary}</p>
  <div class="lesson-meta">
    <span class="mono">{metadata.id}</span><span>{difficultyLabels[metadata.difficulty]}</span><span
      >约 {metadata.estimatedMinutes} 分钟</span
    ><span>{metadata.localLab ? '本地实践' : '浏览器交互'}</span>
  </div>
</header>
