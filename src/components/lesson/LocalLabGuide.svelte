<script lang="ts">
  import type { LocalLabDescriptor } from '../../lib/lesson/contract.ts';
  let { lab, lessonId }: { lab: LocalLabDescriptor; lessonId: string } = $props();
  const safe = $derived(
    /^M\d{2}-\d{3}$/.test(lessonId) &&
      lab.files.every(
        (f) => /^[\w./-]+$/.test(f) && !f.split('/').includes('..') && !f.startsWith('/'),
      ),
  );
</script>

<section>
  <h3>本地实验</h3>
  <p>环境：{lab.environment}</p>
  <p>数据：{lab.data}</p>
  <ol>
    {#each lab.steps as step (step)}<li>{step}</li>{/each}
  </ol>
  {#if safe}<ul>
      {#each lab.files as file (file)}<li>
          <a href={`${import.meta.env.BASE_URL}labs/${lessonId}/${file}`} download>{file}</a>
        </li>{/each}
    </ul>{:else}<p role="alert">下载路径无效。</p>{/if}
  <p>结果检查：{lab.expected}</p>
  <ul>
    {#each lab.troubleshooting as tip (tip)}<li>{tip}</li>{/each}
  </ul>
  <p>运行在你自己的环境中；此页面没有执行训练。</p>
</section>
