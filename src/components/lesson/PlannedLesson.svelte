<script lang="ts">
  import type { LessonMetadata } from '../../lib/curriculum/schema.ts';
  let { metadata }: { metadata: LessonMetadata } = $props();
</script>

<section class="planned-notice" aria-labelledby="planned-heading">
  <span class="eyebrow">课程建设中 / Planned</span>
  <h2 id="planned-heading">这一节已列入学习地图</h2>
  <p>
    学习目标与前置关系已经确定，正文和{metadata.localLab
      ? '本地实验教程'
      : '交互实验'}将独立完善。你可以先探索前置知识，或从已发布课程开始。
  </p>
  <a class="text-link" href="#/lesson/math/linear-algebra/vector-addition">体验向量加法示范课 ↗</a>
  <p class="metadata">规划页不会计入完成率，也不能标记为已完成。</p>
</section>
