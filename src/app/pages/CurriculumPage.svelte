<script lang="ts">
  import { lessons, modules } from '../../lib/curriculum/catalog.ts';
  import { getStatus } from '../../lib/curriculum/loader.ts';
  import LessonList from '../../components/common/LessonList.svelte';
  let { initialQuery = '' }: { initialQuery?: string } = $props();
  let query = $derived(initialQuery);
  let moduleId = $state('');
  let status = $state('');
  let difficulty = $state('');
  const results = $derived(
    lessons.filter((l) => {
      const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
      return (
        (!moduleId || l.moduleId === moduleId) &&
        (!status || getStatus(l.id) === status) &&
        (!difficulty || l.difficulty === difficulty) &&
        terms.every((term) =>
          [l.id, l.title, l.summary, ...l.tags].join(' ').toLocaleLowerCase().includes(term),
        )
      );
    }),
  );
</script>

<header class="page-header">
  <span class="eyebrow">Curriculum</span>
  <h1>全部课程</h1>
  <p class="lead">从基础数学到工程实践。可以顺序学习，也可以直接进入感兴趣的知识点。</p>
</header>
<div class="catalog-filters">
  <label class="field search-field"
    >搜索课程<input
      class="input input-bordered"
      type="search"
      placeholder="搜索标题、关键词或课程 ID"
      bind:value={query}
    /></label
  ><label class="field"
    >知识模块<select class="select select-bordered" bind:value={moduleId}
      ><option value="">全部模块</option>{#each modules as m (m.id)}<option value={m.id}
          >{m.id} {m.title}</option
        >{/each}</select
    ></label
  ><label class="field"
    >内容状态<select class="select select-bordered" bind:value={status}
      ><option value="">全部状态</option><option value="ready">已发布</option><option value="draft"
        >草稿</option
      ><option value="planned">规划中</option></select
    ></label
  ><label class="field"
    >难度<select class="select select-bordered" bind:value={difficulty}
      ><option value="">全部难度</option><option value="intro">入门</option><option
        value="intermediate">进阶</option
      ><option value="advanced">高级</option></select
    ></label
  >
</div>
<p class="result-count" role="status">找到 {results.length} 节课程 · 规划页可浏览学习目标与依赖</p>
{#if results.length}<LessonList items={results} />{:else}<div class="empty-state">
    <h2>没有匹配的课程</h2>
    <p>试试更短的关键词，或清除模块、状态与难度筛选。</p>
    <button
      class="btn btn-outline"
      onclick={() => {
        query = '';
        moduleId = '';
        status = '';
        difficulty = '';
      }}>清除筛选</button
    >
  </div>{/if}
