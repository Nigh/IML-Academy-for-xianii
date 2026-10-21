<script lang="ts">
  import type { LessonMetadata } from '../../lib/curriculum/schema.ts';
  import { lessonHref, statusLabels, difficultyLabels } from '../../lib/curriculum/catalog.ts';
  import { getStatus } from '../../lib/curriculum/loader.ts';
  import { progress } from '../../lib/progress/progress.svelte.ts';
  let { items }: { items: LessonMetadata[] } = $props();
</script>

<ol class="lesson-list">
  {#each items as lesson (lesson.id)}<li>
      <a href={lessonHref(lesson.id)}>
        <span class="lesson-index mono">{lesson.id}</span>
        <div>
          <strong>{lesson.title}</strong>
          <p>{lesson.summary}</p>
        </div>
        <span class="lesson-list-meta"
          ><span class="status-badge" data-status={getStatus(lesson.id)}
            >{progress.data.lessons[lesson.id]?.completedAt && getStatus(lesson.id) === 'ready'
              ? '已完成 ✓'
              : statusLabels[getStatus(lesson.id)]}</span
          ><small>{difficultyLabels[lesson.difficulty]} · {lesson.estimatedMinutes} 分钟</small
          ></span
        ><span aria-hidden="true" class="list-arrow">↗</span>
      </a>
    </li>{/each}
</ol>
