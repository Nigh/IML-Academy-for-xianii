<script lang="ts">
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import type { LessonId } from '../../lib/curriculum/schema.ts';
  let { points, related }: { points: readonly string[]; related: readonly LessonId[] } = $props();
</script>

<ul>
  {#each points as point (point)}<li>{point}</li>{/each}
</ul>
<p>
  继续探索：{#each related as id (id)}{@const lesson = lessonById.get(id)}{#if lesson}<a
        href={lessonHref(id)}>{lesson.title}</a
      >
    {/if}{/each}
</p>
