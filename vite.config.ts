import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { lessons } from './src/lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from './src/lib/lesson/contract.ts';
import { pathToFileURL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';
  if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..'))
    throw new Error('VITE_BASE_PATH 必须是以 / 开始并结束的路径');
  return {
    base,
    plugins: [
      svelte(),
      tailwindcss(),
      {
        name: 'local-lab-downloads',
        async generateBundle() {
          for (const lesson of lessons.filter((l) => l.localLab)) {
            const path = resolve('src/lessons', lesson.id, 'lesson.ts');
            try {
              await stat(path);
            } catch {
              continue;
            }
            const definition = lessonDefinitionSchema.parse(
              (await import(pathToFileURL(path).href)).default,
            );
            for (const file of definition.localLab?.files ?? []) {
              const labRoot = resolve('labs/lessons', lesson.id);
              const full = resolve(labRoot, file);
              const rel = relative(labRoot, full);
              if (rel.startsWith(`..${sep}`) || rel === '..' || rel === '')
                throw new Error('实验路径越界');
              if ((await stat(full)).size > 1024 * 1024) throw new Error('实验参考文件超过 1 MiB');
              this.emitFile({
                type: 'asset',
                fileName: `labs/${lesson.id}/${file}`,
                source: await readFile(full),
              });
            }
          }
        },
      },
      VitePWA({
        registerType: 'prompt',
        base,
        scope: base,
        manifest: {
          name: 'Interactive Machine Learning Academy for xianii',
          short_name: 'IML Academy',
          description: '面向工程师的交互式机器学习自学课程',
          lang: 'zh-CN',
          start_url: `${base}#/`,
          scope: base,
          display: 'standalone',
          theme_color: '#333333',
          background_color: '#333333',
          icons: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
        },
        workbox: {
          cacheId: `iml-academy-${base.replace(/[^a-z0-9]/gi, '-')}`,
          globPatterns: ['**/*.{js,css,html,svg,woff,woff2,ttf,py,json,md}'],
          maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          manifestTransforms: [
            async (entries) => {
              const bytes = entries.reduce((sum, e) => sum + (e.size ?? 0), 0);
              if (bytes > 10 * 1024 * 1024)
                throw new Error('离线预缓存超过 10 MiB：审查资源后再发布');
              return { manifest: entries, warnings: [] };
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
  };
});
