<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LessonMetadata, LessonStatus } from '../../lib/curriculum/schema.ts';
  import type { LessonDefinition } from '../../lib/lesson/contract.ts';
  import { lessonHref, lessons } from '../../lib/curriculum/catalog.ts';
  import { progress, completeLesson, answerQuestion } from '../../lib/progress/progress.svelte.ts';
  import LessonHeader from './LessonHeader.svelte';
  import PrerequisiteLinks from './PrerequisiteLinks.svelte';
  import LessonNavigation from './LessonNavigation.svelte';
  import QuizBlock from './QuizBlock.svelte';
  let {
    metadata,
    status,
    definition,
    children,
  }: {
    metadata: LessonMetadata;
    status: LessonStatus;
    definition?: LessonDefinition;
    children: Snippet;
  } = $props();
  const following = $derived(lessons.filter((l) => l.prerequisites.includes(metadata.id)));
</script>

<article class="lesson-shell">
  <LessonHeader {metadata} {status} />
  <div class="lesson-columns">
    <div class="lesson-body">
      <section class="learning-objectives">
        <h2>学完你将能够</h2>
        <ul>
          {#each metadata.objectives as objective (objective)}<li>{objective}</li>{/each}
        </ul>
      </section>
      <PrerequisiteLinks id={metadata.id} prerequisites={metadata.prerequisites} />
      {#if status === 'draft'}<p class="notice">
          这是一节草稿课，内容仍在验证中，暂不计入完成率。
        </p>{/if}
      {@render children()}
      {#if definition?.quiz.length}<section id="knowledge-check" class="theory-section">
          <h2>检查理解</h2>
          {#each definition.quiz as question (question.id)}{@const saved =
              progress.data.lessons[metadata.id]?.answers[question.id]}<QuizBlock
              {question}
              savedAnswer={saved?.questionVersion === question.version ? saved.optionId : undefined}
              onsubmit={(optionId) => answerQuestion(metadata.id, question.id, optionId)}
            />{/each}
        </section>{/if}
      {#if status === 'ready'}<div class="completion-panel">
          <p>
            {progress.data.lessons[metadata.id]?.completedAt
              ? '已记录完成，随时可以回来复习。'
              : '完成探索后，记录你的学习进度。'}
          </p>
          <button
            class="btn btn-primary"
            onclick={() => completeLesson(metadata.id)}
            disabled={!!progress.data.lessons[metadata.id]?.completedAt}
            >{progress.data.lessons[metadata.id]?.completedAt ? '已完成 ✓' : '标记为已完成'}</button
          >
        </div>{/if}
      {#if following.length}<details class="followup-list">
          <summary>后续知识 · {following.length} 节课程以本课为前置</summary>
          <ul>
            {#each following as l (l.id)}<li>
                <a href={lessonHref(l.id)}>{l.id} · {l.title}</a>
              </li>{/each}
          </ul>
        </details>{/if}
      <LessonNavigation id={metadata.id} />
    </div>
    {#if definition}<aside class="lesson-toc" aria-label="本课目录">
        <span class="eyebrow">本课内容</span
        >{#each definition.sections as section (section.id)}<button
            aria-label={`跳到章节：${section.title}`}
            onclick={() =>
              document.getElementById(section.id)?.scrollIntoView({
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'instant'
                  : 'smooth',
              })}>{section.title}</button
          >{/each}<button
          aria-label="跳到章节：检查理解"
          onclick={() => document.getElementById('knowledge-check')?.scrollIntoView()}
          >检查理解</button
        >
      </aside>{/if}
  </div>
</article>
