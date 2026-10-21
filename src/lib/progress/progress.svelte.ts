import { lessonById } from '../curriculum/catalog.ts';
import { definitions, getStatus } from '../curriculum/loader.ts';
import { readProgress, mergeProgress, STORAGE_KEY } from './storage.ts';
import { parseProgress } from './schema.ts';
import type { ProgressData } from './schema.ts';
let storage: Storage | undefined;
try {
  storage = window.localStorage;
} catch {}
const initial = readProgress(storage);
export const progress = $state({ data: initial.data, warning: initial.warning });
let writable = initial.writable;
function save() {
  if (!writable || !storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress.data));
  } catch {
    writable = false;
    progress.warning = '保存失败，当前进度仅在本次会话中有效。请导出备份。';
  }
}
export function visitLesson(id: string) {
  if (!lessonById.has(id)) return;
  const now = Date.now();
  progress.data.lessons[id] ??= { visitedAt: now, answers: {} };
  progress.data.lessons[id].visitedAt = now;
  progress.data.lastLesson = id;
  progress.data.updatedAt = now;
  save();
}
export function completeLesson(id: string) {
  if (getStatus(id) !== 'ready') return;
  visitLesson(id);
  progress.data.lessons[id].completedAt = Date.now();
  save();
}
export function answerQuestion(id: string, questionId: string, optionId: string) {
  const question = definitions.get(id)?.quiz.find((q) => q.id === questionId);
  if (!question || !question.options.some((o) => o.id === optionId)) return;
  visitLesson(id);
  progress.data.lessons[id].answers[questionId] = {
    optionId,
    questionVersion: question.version,
    answeredAt: Date.now(),
  };
  save();
}
export function exportProgress() {
  return JSON.stringify(progress.data, null, 2);
}
export function previewImport(text: string) {
  return parseProgress(text);
}
export function importProgress(incoming: ProgressData) {
  const validated = parseProgress(JSON.stringify(incoming));
  for (const [id, entry] of Object.entries(validated.lessons)) {
    if (lessonById.has(id) && getStatus(id) !== 'ready') delete entry.completedAt;
  }
  progress.data = mergeProgress(JSON.parse(JSON.stringify(progress.data)), validated);
  save();
}
