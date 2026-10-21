import { z } from 'zod';
export const lessonIdSchema = z.string().regex(/^M\d{2}-\d{3}$/);
export type LessonId = z.infer<typeof lessonIdSchema>;
export const moduleSchema = z
  .object({
    id: z.string().regex(/^M\d{2}$/),
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    order: z.number().int().positive(),
  })
  .strict();
export const lessonSchema = z
  .object({
    id: lessonIdSchema,
    moduleId: z.string().regex(/^M\d{2}$/),
    slug: z.string().regex(/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/),
    title: z.string().min(1),
    summary: z.string().min(1),
    difficulty: z.enum(['intro', 'intermediate', 'advanced']),
    estimatedMinutes: z.number().int().positive(),
    prerequisites: z.array(lessonIdSchema),
    objectives: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)),
    interactionType: z.enum(['visual', 'simulation', 'quiz', 'local-lab', 'mixed']),
    localLab: z.boolean(),
    order: z.number().int().positive(),
    relatedLessons: z.array(lessonIdSchema),
  })
  .strict();
export type LessonMetadata = z.infer<typeof lessonSchema>;
export type ModuleMetadata = z.infer<typeof moduleSchema>;
export type LessonStatus = 'planned' | 'draft' | 'ready';
