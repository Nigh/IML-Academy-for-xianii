<script lang="ts">
  import { lessonById, lessonHref } from '../../lib/curriculum/catalog.ts';
  import { prerequisiteClosure } from '../../lib/curriculum/graph.ts';
  import { lessons, statusLabels } from '../../lib/curriculum/catalog.ts';
  import { getStatus } from '../../lib/curriculum/loader.ts';
  let { id, prerequisites }: { id: string; prerequisites: string[] } = $props();
  const all = $derived(prerequisiteClosure(id, lessons));
</script>

<div class="prerequisites">
  <h2>前置知识</h2>
  {#if !prerequisites.length}<p class="muted">无需平台内前置课程，可直接开始。</p>{:else}
    <ul class="link-list">
      {#each prerequisites as pre (pre)}<li>
          <a href={lessonHref(pre)}
            ><span class="mono metadata">{pre}</span>
            {lessonById.get(pre)?.title}
            <span class="metadata">{statusLabels[getStatus(pre)]}</span></a
          >
        </li>{/each}
    </ul>
    <p class="metadata">前置课程仅为学习建议，不限制访问。</p>
  {/if}
  {#if all.length > prerequisites.length}<details>
      <summary>查看全部 {all.length} 节前置课程</summary>
      <ol>
        {#each all as lesson (lesson.id)}<li>
            <a href={lessonHref(lesson.id)}>{lesson.id} · {lesson.title}</a>
          </li>{/each}
      </ol>
    </details>{/if}
</div>
