<script lang="ts">
  import { modules, lessons, moduleHref } from '../../lib/curriculum/catalog.ts';
  import type { Route } from '../../app/router.ts';
  let { route, onclose }: { route: Route; onclose: () => void } = $props();
</script>

<nav class="sidebar-nav" aria-label="学习导航">
  <div class="nav-primary">
    <a
      href="#/"
      class:active={route.type === 'home'}
      aria-current={route.type === 'home' ? 'page' : undefined}
      onclick={onclose}><span aria-hidden="true">⌂</span> 学习概览</a
    ><a
      href="#/curriculum"
      class:active={route.type === 'curriculum'}
      aria-current={route.type === 'curriculum' ? 'page' : undefined}
      onclick={onclose}
      ><span aria-hidden="true">⊞</span> 全部课程 <span class="nav-count">{lessons.length}</span></a
    ><a
      href="#/progress"
      class:active={route.type === 'progress'}
      aria-current={route.type === 'progress' ? 'page' : undefined}
      onclick={onclose}><span aria-hidden="true">◷</span> 我的进度</a
    >
  </div>
  <div class="nav-label">学习地图 <span>12 MODULES</span></div>
  <ol class="module-nav">
    {#each modules as mod (mod.id)}{@const selected =
        (route.type === 'module' && route.slug === mod.slug) ||
        (route.type === 'lesson' && route.slug.startsWith(mod.slug + '/'))}
      <li>
        <a href={moduleHref(mod.id)} class:active={selected} onclick={onclose}
          ><span class="mono module-code">{mod.id}</span><span>{mod.title}</span><small
            >{lessons.filter((l) => l.moduleId === mod.id).length}</small
          ></a
        >
      </li>{/each}
  </ol>
  <div class="sidebar-footer">
    <span class="eyebrow">为工程师而设计</span>
    <p>数学直觉 → 交互实验<br />→ 可复现的工程实践</p>
    <a href="https://github.com/Nigh/IML-Academy-for-xianii" target="_blank" rel="noreferrer"
      >源码与贡献 ↗</a
    >
  </div>
</nav>
