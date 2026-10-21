import type { Component } from 'svelte';
import type { LessonBodyProps, LessonDefinition } from '../lesson/contract.ts';
import { lessonDefinitionSchema } from '../lesson/contract.ts';
import { lessonById } from './catalog.ts';
import type { LessonStatus } from './schema.ts';
const exports = import.meta.glob<{ default: LessonDefinition }>('/src/lessons/*/lesson.ts', {
  eager: true,
});
const components = import.meta.glob<{ default: Component<LessonBodyProps> }>(
  '/src/lessons/*/Lesson.svelte',
);
export const definitions = new Map<string, LessonDefinition>();
for (const [path, value] of Object.entries(exports)) {
  const id = path.split('/').at(-2)!;
  const definition = lessonDefinitionSchema.parse(value.default);
  if (definition.id !== id || !lessonById.has(id)) throw new Error(`无效课程入口：${path}`);
  if (!components[`/src/lessons/${id}/Lesson.svelte`]) throw new Error(`缺少课程正文：${id}`);
  definitions.set(id, definition);
}
export const getStatus = (id: string): LessonStatus => definitions.get(id)?.status ?? 'planned';
export const readyLessons = () => [...definitions.values()].filter((d) => d.status === 'ready');
export async function loadLesson(id: string) {
  if (!lessonById.has(id)) throw new Error(`未知课程：${id}`);
  if (!definitions.has(id)) return null;
  const loaded = await components[`/src/lessons/${id}/Lesson.svelte`]();
  return loaded.default;
}
