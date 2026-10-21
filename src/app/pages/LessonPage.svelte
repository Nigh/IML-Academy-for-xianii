<script lang="ts">
  import { untrack } from 'svelte';
  import type { Component } from 'svelte';
  import type { LessonBodyProps } from '../../lib/lesson/contract.ts';
  import { lessonBySlug } from '../../lib/curriculum/catalog.ts';
  import { definitions, getStatus, loadLesson } from '../../lib/curriculum/loader.ts';
  import { visitLesson } from '../../lib/progress/progress.svelte.ts';
  import LessonShell from '../../components/lesson/LessonShell.svelte';
  import PlannedLesson from '../../components/lesson/PlannedLesson.svelte';
  import NotFoundPage from './NotFoundPage.svelte';
  let { slug }: { slug: string } = $props();
  const metadata = $derived(lessonBySlug.get(slug));
  let Body = $state<Component<LessonBodyProps> | null>(null);
  let loading = $state(false);
  let error = $state(false);
  let attempt = $state(0);
  $effect(() => {
    void attempt;
    const current = metadata;
    let cancelled = false;
    Body = null;
    error = false;
    loading = !!current && getStatus(current.id) !== 'planned';
    if (current) {
      untrack(() => visitLesson(current.id));
      loadLesson(current.id)
        .then((component) => {
          if (!cancelled) {
            Body = component;
            loading = false;
          }
        })
        .catch(() => {
          if (!cancelled) {
            error = true;
            loading = false;
          }
        });
    }
    return () => {
      cancelled = true;
    };
  });
</script>

{#if metadata}<LessonShell
    {metadata}
    status={getStatus(metadata.id)}
    definition={definitions.get(metadata.id)}
  >
    {#if loading}<div class="loading-state" role="status" aria-busy="true">正在加载课程…</div>
    {:else if error}<div class="notice" role="alert">
        <h2>课程暂时无法加载</h2>
        <p>可能是网络中断、此课尚未缓存或站点刚刚更新。进度已保留。</p>
        <button class="btn btn-sm" onclick={() => attempt++}>重试</button><button
          class="btn btn-sm btn-ghost"
          onclick={() => location.reload()}>刷新站点</button
        >
      </div>
    {:else if Body}{#key metadata.id}<Body {metadata} />{/key}
    {:else}<PlannedLesson {metadata} />{/if}
  </LessonShell>{:else}<NotFoundPage />{/if}
