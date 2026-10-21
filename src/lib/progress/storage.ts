import { emptyProgress, parseProgress } from './schema.ts';
import type { ProgressData } from './schema.ts';
export const STORAGE_KEY = 'iml-academy.progress.v1';
export interface ProgressStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function readProgress(storage?: ProgressStorage): {
  data: ProgressData;
  warning: string;
  writable: boolean;
} {
  if (!storage)
    return {
      data: emptyProgress(),
      warning: '浏览器存储不可用，当前进度仅保存在本次会话中。可导出备份。',
      writable: false,
    };
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return { data: raw ? parseProgress(raw) : emptyProgress(), warning: '', writable: true };
  } catch {
    return {
      data: emptyProgress(),
      warning: '无法读取旧进度，已保留原数据。当前使用内存模式，可导出本次进度。',
      writable: false,
    };
  }
}
export function mergeProgress(current: ProgressData, incoming: ProgressData): ProgressData {
  const result = structuredClone(current);
  for (const [id, entry] of Object.entries(incoming.lessons)) {
    const old = result.lessons[id];
    if (!old) {
      result.lessons[id] = structuredClone(entry);
      continue;
    }
    old.visitedAt = Math.max(old.visitedAt, entry.visitedAt);
    if (
      entry.completedAt !== undefined &&
      (old.completedAt === undefined || entry.completedAt > old.completedAt)
    )
      old.completedAt = entry.completedAt;
    for (const [question, answer] of Object.entries(entry.answers)) {
      if (!old.answers[question] || answer.answeredAt > old.answers[question].answeredAt)
        old.answers[question] = structuredClone(answer);
    }
  }
  if (incoming.updatedAt > current.updatedAt && incoming.lastLesson)
    result.lastLesson = incoming.lastLesson;
  result.updatedAt = Math.max(current.updatedAt, incoming.updatedAt);
  return result;
}
