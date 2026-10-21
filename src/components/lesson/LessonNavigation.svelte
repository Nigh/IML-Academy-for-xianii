<script lang="ts">
  import { adjacentLessons } from '../../app/navigation.ts';
  import { lessonHref } from '../../lib/curriculum/catalog.ts';
  let { id }: { id: string } = $props();
  const adjacent = $derived(adjacentLessons(id));
</script>

<nav class="lesson-navigation" aria-label="课程前后导航">
  {#if adjacent.previous}<a href={lessonHref(adjacent.previous.id)}
      ><span class="metadata">← 上一节</span><strong>{adjacent.previous.title}</strong></a
    >{:else}<span></span>{/if}
  {#if adjacent.next}<a href={lessonHref(adjacent.next.id)} class="next"
      ><span class="metadata">下一节 →</span><strong>{adjacent.next.title}</strong></a
    >{/if}
</nav>
