<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { parseRoute } from './router.ts';
  import { watchSystemTheme, theme, applyTheme } from '../lib/theme/theme.svelte.ts';
  import type { ThemePreference } from '../lib/theme/theme.svelte.ts';
  import { progress } from '../lib/progress/progress.svelte.ts';
  import { lessonBySlug, modules } from '../lib/curriculum/catalog.ts';
  import Sidebar from '../components/layout/Sidebar.svelte';
  import OfflineStatus from '../components/common/OfflineStatus.svelte';
  import HomePage from './pages/HomePage.svelte';
  import CurriculumPage from './pages/CurriculumPage.svelte';
  import ModulePage from './pages/ModulePage.svelte';
  import LessonPage from './pages/LessonPage.svelte';
  import ProgressPage from './pages/ProgressPage.svelte';
  import NotFoundPage from './pages/NotFoundPage.svelte';
  let hash = $state(location.hash);
  let menuOpen = $state(false);
  let search = $state('');
  let submittedSearch = $state('');
  const route = $derived(parseRoute(hash));
  let main: HTMLElement;
  onMount(() => {
    const stopTheme = watchSystemTheme();
    const change = async () => {
      hash = location.hash;
      menuOpen = false;
      await tick();
      main?.focus();
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', change);
    return () => {
      stopTheme();
      window.removeEventListener('hashchange', change);
    };
  });
  $effect(() => {
    let title = '学习概览';
    if (route.type === 'lesson') title = lessonBySlug.get(route.slug)?.title ?? '未找到课程';
    else if (route.type === 'module')
      title = modules.find((m) => m.slug === route.slug)?.title ?? '未找到模块';
    else if (route.type === 'curriculum') title = '全部课程';
    else if (route.type === 'progress') title = '我的进度';
    document.title = `${title} · Interactive Machine Learning Academy for xianii`;
  });
</script>

<a
  class="skip-link"
  href="#main-content"
  onclick={(e) => {
    e.preventDefault();
    main?.focus();
  }}>跳到主要内容</a
>
<header class="app-header">
  <a class="brand" href="#/"
    ><span class="brand-mark" aria-hidden="true">M<span>↗</span></span><span
      ><strong>IML Academy</strong><small>FOR XIANII</small></span
    ></a
  ><button
    class="btn btn-sm btn-ghost mobile-menu"
    aria-expanded={menuOpen}
    aria-controls="sidebar"
    onclick={() => (menuOpen = !menuOpen)}>课程导航 ☰</button
  >
  <form
    class="header-search"
    role="search"
    onsubmit={(e) => {
      e.preventDefault();
      submittedSearch = search;
      location.hash = '/curriculum';
    }}
  >
    <input
      aria-label="全站课程搜索"
      type="search"
      placeholder="寻找一个知识点…"
      bind:value={search}
    /><button aria-label="搜索课程" type="submit">↗</button>
  </form>
  <label class="theme-control"
    ><span>主题</span><select
      aria-label="主题"
      value={theme.preference}
      onchange={(e) => applyTheme(e.currentTarget.value as ThemePreference)}
      ><option value="system">跟随系统</option><option value="light">浅色</option><option
        value="dark">深色</option
      ></select
    ></label
  >
</header>
<div class="app-layout">
  <aside id="sidebar" class="app-sidebar" class:menu-open={menuOpen}>
    <Sidebar {route} onclose={() => (menuOpen = false)} />
  </aside>
  <div class="main-column">
    <main id="main-content" tabindex="-1" bind:this={main}>
      {#if progress.warning}<p class="notice" role="status">{progress.warning}</p>{/if}
      {#if route.type === 'home'}<HomePage />{:else if route.type === 'curriculum'}<CurriculumPage
          initialQuery={submittedSearch}
        />{:else if route.type === 'module'}<ModulePage
          slug={route.slug}
        />{:else if route.type === 'lesson'}<LessonPage
          slug={route.slug}
        />{:else if route.type === 'progress'}<ProgressPage />{:else}<NotFoundPage />{/if}
    </main>
    <footer class="app-footer">
      <span>Interactive Machine Learning Academy for xianii</span><OfflineStatus />
    </footer>
  </div>
</div>
