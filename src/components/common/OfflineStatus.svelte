<script lang="ts">
  import { onMount } from 'svelte';
  import { registerSW } from 'virtual:pwa-register';
  let offlineReady = $state(false);
  let updateReady = $state(false);
  let error = $state(false);
  let online = $state(true);
  let update: (reload?: boolean) => Promise<void> = async () => {};
  onMount(() => {
    const listener = () => (online = navigator.onLine);
    listener();
    window.addEventListener('online', listener);
    window.addEventListener('offline', listener);
    update = registerSW({
      onOfflineReady: () => (offlineReady = true),
      onNeedRefresh: () => (updateReady = true),
      onRegisterError: () => (error = true),
    });
    return () => {
      window.removeEventListener('online', listener);
      window.removeEventListener('offline', listener);
    };
  });
</script>

<div class="offline-status" role="status">
  {#if updateReady}<span>新课程版本已就绪</span><button
      class="text-link"
      onclick={() => update(true)}>刷新更新</button
    >
  {:else if error}<span>离线准备未完成，联网浏览仍可用</span>
  {:else if !online}<span>○ 离线浏览 · 仅已缓存内容可用</span>
  {:else if offlineReady}<span>● 已支持离线浏览</span>
  {:else}<span>○ 开放课程 · 本地保存进度</span>{/if}
</div>
