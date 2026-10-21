import rawModules from '../../../curriculum/modules.json' with { type: 'json' };
import rawLessons from '../../../curriculum/lessons.json' with { type: 'json' };
import { validateCurriculum } from './graph.ts';
export const { modules, lessons } = validateCurriculum(rawModules, rawLessons);
export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
export const lessonBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
export const lessonHref = (id: string) => `#/lesson/${lessonById.get(id)?.slug ?? ''}`;
export const moduleHref = (id: string) =>
  `#/module/${modules.find((m) => m.id === id)?.slug ?? ''}`;
export const difficultyLabels = { intro: '入门', intermediate: '进阶', advanced: '高级' } as const;
export const statusLabels = { planned: '规划中', draft: '草稿', ready: '已发布' } as const;
