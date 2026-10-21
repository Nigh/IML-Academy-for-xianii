import { z } from 'zod';
import { lessonIdSchema } from '../curriculum/schema.ts';
export const quizSchema = z
  .object({
    id: z.string().min(1),
    version: z.number().int().positive(),
    prompt: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          text: z.string().min(1),
          explanation: z.string().min(1),
        }),
      )
      .min(2),
    answerId: z.string().min(1),
  })
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length || !ids.includes(q.answerId))
      ctx.addIssue({ code: 'custom', message: '测验选项重复或答案不存在' });
  });
export const localLabSchema = z.object({
  environment: z.string().min(1),
  data: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
  files: z.array(z.string().regex(/^[\w./-]+$/)).min(1),
  expected: z.string().min(1),
  troubleshooting: z.array(z.string().min(1)).min(1),
});
export const lessonDefinitionSchema = z
  .object({
    id: lessonIdSchema,
    contractVersion: z.literal(1),
    status: z.enum(['draft', 'ready']),
    sections: z
      .array(z.object({ id: z.string().regex(/^[a-z][a-z0-9-]*$/), title: z.string().min(1) }))
      .min(1),
    quiz: z.array(quizSchema),
    localLab: localLabSchema.optional(),
  })
  .superRefine((d, ctx) => {
    for (const [name, ids] of [
      ['章节', d.sections.map((s) => s.id)],
      ['测验', d.quiz.map((q) => q.id)],
    ] as const) {
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({ code: 'custom', message: `${name} ID 重复` });
    }
    if (d.status === 'ready' && !d.quiz.length)
      ctx.addIssue({ code: 'custom', message: 'ready 课程必须有测验' });
  });
export type LessonDefinition = z.infer<typeof lessonDefinitionSchema>;
export type QuizQuestion = z.infer<typeof quizSchema>;
export type LocalLabDescriptor = z.infer<typeof localLabSchema>;
export interface LessonBodyProps {
  metadata: Readonly<import('../curriculum/schema').LessonMetadata>;
}
