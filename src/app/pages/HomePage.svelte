<script lang="ts">
  import {
    modules,
    lessons,
    moduleHref,
    lessonById,
    lessonHref,
  } from '../../lib/curriculum/catalog.ts';
  import { readyLessons } from '../../lib/curriculum/loader.ts';
  import { progress } from '../../lib/progress/progress.svelte.ts';
  const ready = readyLessons();
  const completed = $derived(ready.filter((l) => progress.data.lessons[l.id]?.completedAt).length);
  const last = $derived(
    progress.data.lastLesson ? lessonById.get(progress.data.lastLesson) : undefined,
  );
</script>

<div class="home-page">
  <div class="page-kicker">
    <span class="eyebrow">Interactive Machine Learning Academy</span><span class="edition mono"
      >FOR XIANII / 开放自学课程</span
    >
  </div>
  <section class="home-hero" aria-labelledby="home-title">
    <div>
      <p class="hero-overline">从数学直觉，到真实工程</p>
      <h1 id="home-title">看见原理，<br />亲手理解机器学习<span class="primary-text">。</span></h1>
      <p class="hero-copy">
        面向工程师的机器学习知识地图。调节参数、观察变化、验证公式，再把理解带到传感器、机器人与模型部署中。
      </p>
      <div class="hero-actions">
        <a
          class="btn btn-primary"
          href={last ? lessonHref(last.id) : '#/lesson/math/linear-algebra/vector-addition'}
          >{last ? '继续最近学习' : '从向量加法开始'} <span aria-hidden="true">→</span></a
        ><a class="text-link" href="#/curriculum">探索完整课程 ↗</a>
      </div>
      {#if last}<p class="metadata">最近访问：{last.id} · {last.title}</p>{/if}
    </div>
    <div class="hero-figure">
      <svg viewBox="0 0 420 320" role="img" aria-labelledby="hero-plot-title"
        ><title id="hero-plot-title">向量加法示意：向量 a=(3,1)，b=(1,3)，合向量为 (4,4)。</title
        ><defs
          ><pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse"
            ><path d="M30 0H0V30" class="grid-line" fill="none" /></pattern
          ><marker id="hero-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"
            ><path d="M0 0L8 4L0 8" fill="var(--color-primary)" /></marker
          ></defs
        ><rect x="20" y="20" width="360" height="270" fill="url(#hero-grid)" /><path
          d="M50 260H390M80 290V20"
          class="axis-line"
        /><path d="M80 260L260 200" stroke="var(--color-secondary)" stroke-width="3" /><path
          d="M260 200L320 20"
          stroke="var(--color-accent)"
          stroke-width="3"
          stroke-dasharray="7 4"
        /><path
          d="M80 260L320 20"
          stroke="var(--color-primary)"
          stroke-width="3"
          marker-end="url(#hero-arrow)"
        /><text x="180" y="250" fill="var(--color-secondary)">a</text><text
          x="310"
          y="130"
          fill="var(--color-accent)">b</text
        ><text x="160" y="112" fill="var(--color-primary)">a + b</text><circle
          cx="80"
          cy="260"
          r="4"
          fill="var(--color-base-content)"
        /></svg
      ><span class="figure-caption mono">01 / VECTOR ADDITION</span>
    </div>
  </section>
  <section class="learning-strip" aria-label="课程建设与学习进度">
    <div><strong>{modules.length}</strong><span>知识模块</span></div>
    <div><strong>{lessons.length}</strong><span>规划课程</span></div>
    <div><strong>{ready.length}</strong><span>已发布课程</span></div>
    <div>
      <strong>{completed}<small> / {ready.length}</small></strong><span>已完成 / 已发布</span>
    </div>
  </section>
  <section class="home-modules" aria-labelledby="map-title">
    <div class="section-heading">
      <div>
        <span class="eyebrow">Curriculum / 课程体系</span>
        <h2 id="map-title">一张可以逐步走通的知识地图</h2>
      </div>
      <a href="#/curriculum" class="text-link">查看全部 →</a>
    </div>
    <div class="module-grid">
      {#each modules as mod (mod.id)}<a class="module-card" href={moduleHref(mod.id)}
          ><span class="module-card-code mono">{mod.id}<span>↗</span></span>
          <h3>{mod.title}</h3>
          <p>{mod.description}</p>
          <span class="metadata">{lessons.filter((l) => l.moduleId === mod.id).length} 节课程</span
          ></a
        >{/each}
    </div>
  </section>
  <section class="approach-note">
    <span class="eyebrow">Learn by doing</span>
    <h2>浏览器里理解，本地环境里实践。</h2>
    <p>
      轻量数学实验直接运行在浏览器。需要 Python、PyTorch、MuJoCo
      或真实设备的课程，会提供可复现的本地教程与参考代码。
    </p>
  </section>
</div>
