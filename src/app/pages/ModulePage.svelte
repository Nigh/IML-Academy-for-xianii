<script lang="ts">
  import { lessons, modules } from '../../lib/curriculum/catalog.ts';
  import { getStatus } from '../../lib/curriculum/loader.ts';
  import LessonList from '../../components/common/LessonList.svelte';
  import NotFoundPage from './NotFoundPage.svelte';
  let { slug }: { slug: string } = $props();
  const module = $derived(modules.find((m) => m.slug === slug));
  const items = $derived(lessons.filter((l) => l.moduleId === module?.id));
</script>

{#if module}<header class="page-header">
    <span class="eyebrow">{module.id} / Learning module</span>
    <h1>{module.title}</h1>
    <p class="lead">{module.description}</p>
    <div class="lesson-meta">
      <span>{items.length} 节规划课程</span><span
        >{items.filter((l) => getStatus(l.id) === 'ready').length} 节已发布</span
      >
    </div>
  </header>
  <LessonList {items} />{:else}<NotFoundPage />{/if}
