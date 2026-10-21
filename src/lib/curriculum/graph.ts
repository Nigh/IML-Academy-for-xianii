import { lessonSchema, moduleSchema } from './schema.ts';
import type { LessonMetadata, ModuleMetadata } from './schema.ts';

export function validateCurriculum(rawModules: unknown, rawLessons: unknown) {
  const modules = moduleSchema.array().parse(rawModules);
  const lessons = lessonSchema.array().parse(rawLessons);
  const unique = (values: string[], label: string) => {
    const seen = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) throw new Error(`${label} 重复：${value}`);
      seen.add(value);
    }
  };
  unique(
    modules.map((m) => m.id),
    '模块 ID',
  );
  unique(
    modules.map((m) => m.slug),
    '模块 slug',
  );
  unique(
    lessons.map((l) => l.id),
    '课程 ID',
  );
  unique(
    lessons.map((l) => l.slug),
    '课程 slug',
  );
  const moduleIds = new Set(modules.map((m) => m.id));
  const byId = new Map(lessons.map((l) => [l.id, l]));
  for (const l of lessons) {
    if (!moduleIds.has(l.moduleId) || !l.id.startsWith(`${l.moduleId}-`))
      throw new Error(`${l.id} 模块不匹配`);
    unique(l.prerequisites, `${l.id} 前置课程`);
    unique(l.relatedLessons, `${l.id} 相关课程`);
    for (const id of [...l.prerequisites, ...l.relatedLessons]) {
      if (!byId.has(id)) throw new Error(`${l.id} 引用不存在：${id}`);
      if (id === l.id) throw new Error(`${l.id} 自依赖`);
    }
  }
  for (const m of modules)
    unique(
      lessons.filter((l) => l.moduleId === m.id).map((l) => String(l.order)),
      `${m.id} 顺序`,
    );
  topologicalOrder(lessons);
  return { modules, lessons };
}

export function topologicalOrder(lessons: readonly LessonMetadata[]): LessonMetadata[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const degrees = new Map(lessons.map((l) => [l.id, l.prerequisites.length]));
  const followers = new Map<string, string[]>();
  for (const lesson of lessons)
    for (const pre of lesson.prerequisites) {
      if (!byId.has(pre)) throw new Error(`不存在的前置：${pre}`);
      followers.set(pre, [...(followers.get(pre) ?? []), lesson.id]);
    }
  const queue = lessons
    .filter((l) => !degrees.get(l.id))
    .map((l) => l.id)
    .sort();
  const result: LessonMetadata[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    result.push(byId.get(id)!);
    for (const next of followers.get(id) ?? []) {
      degrees.set(next, degrees.get(next)! - 1);
      if (degrees.get(next) === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }
  if (result.length !== lessons.length) {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const path: string[] = [];
    const walk = (id: string): string[] | undefined => {
      if (visiting.has(id)) return [...path.slice(path.indexOf(id)), id];
      if (visited.has(id)) return;
      visiting.add(id);
      path.push(id);
      for (const pre of byId.get(id)!.prerequisites) {
        const cycle = walk(pre);
        if (cycle) return cycle;
      }
      path.pop();
      visiting.delete(id);
      visited.add(id);
    };
    for (const l of lessons) {
      const cycle = walk(l.id);
      if (cycle) throw new Error(`课程依赖循环：${cycle.join(' → ')}`);
    }
    throw new Error('课程依赖不是 DAG');
  }
  return result;
}

export function prerequisiteClosure(
  id: string,
  lessons: readonly LessonMetadata[],
): LessonMetadata[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const ids = new Set<string>();
  const visit = (current: string) => {
    for (const pre of byId.get(current)?.prerequisites ?? [])
      if (!ids.has(pre)) {
        ids.add(pre);
        visit(pre);
      }
  };
  visit(id);
  return topologicalOrder(lessons).filter((l) => ids.has(l.id));
}

export function moduleDependencySummary(modules: ModuleMetadata[], lessons: LessonMetadata[]) {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  return modules.map((m) => ({
    module: m.id,
    prerequisites: [
      ...new Set(
        lessons
          .filter((l) => l.moduleId === m.id)
          .flatMap((l) => l.prerequisites.map((p) => byId.get(p)!.moduleId))
          .filter((id) => id !== m.id),
      ),
    ].sort(),
  }));
}
