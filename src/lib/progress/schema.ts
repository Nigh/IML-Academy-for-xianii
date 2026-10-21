import { z } from 'zod';
const timestamp = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const answerSchema = z
  .object({
    optionId: z.string().min(1).max(100),
    questionVersion: z.number().int().positive(),
    answeredAt: timestamp,
  })
  .strict();
export const recordSchema = z
  .object({
    visitedAt: timestamp,
    completedAt: timestamp.optional(),
    answers: z.record(z.string().max(100), answerSchema),
  })
  .strict();
export const progressSchema = z
  .object({
    schemaVersion: z.literal(1),
    updatedAt: timestamp,
    lastLesson: z
      .string()
      .regex(/^M\d{2}-\d{3}$/)
      .optional(),
    lessons: z.record(z.string().regex(/^M\d{2}-\d{3}$/), recordSchema),
  })
  .strict();
export type ProgressData = z.infer<typeof progressSchema>;
export const emptyProgress = (): ProgressData => ({ schemaVersion: 1, updatedAt: 0, lessons: {} });
export function parseProgress(text: string): ProgressData {
  if (text.length > 2 * 1024 * 1024) throw new Error('进度文件超过 2 MiB');
  const raw: unknown = JSON.parse(text);
  if (typeof raw === 'object' && raw !== null && 'schemaVersion' in raw && raw.schemaVersion !== 1)
    throw new Error('不支持的进度版本，原数据未改变');
  return progressSchema.parse(raw);
}
