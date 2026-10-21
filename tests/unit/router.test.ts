import { expect, it } from 'vitest';
import { parseRoute } from '../../src/app/router.ts';
import { lessonSchema } from '../../src/lib/curriculum/schema.ts';
import { lessons } from '../../src/lib/curriculum/catalog.ts';
import { lessonDefinitionSchema } from '../../src/lib/lesson/contract.ts';
import definition from '../../src/lessons/M01-002/lesson.ts';
it('hash 深链接、根路径与未知地址', () => {
  expect(parseRoute('')).toEqual({ type: 'home' });
  expect(parseRoute('#/lesson/math/linear-algebra/vector-addition')).toEqual({
    type: 'lesson',
    slug: 'math/linear-algebra/vector-addition',
  });
  expect(parseRoute('#/unknown')).toEqual({ type: 'not-found' });
  expect(parseRoute('#/%E0%A4%A')).toEqual({ type: 'not-found' });
  for (const lesson of lessons) {
    lessonSchema.parse(lesson);
    expect(parseRoute(`#/lesson/${lesson.slug}`).type).toBe('lesson');
  }
});
it('课程导出拒绝不存在答案、重复章节和无测验 ready', () => {
  expect(() => lessonDefinitionSchema.parse({ ...definition, quiz: [] })).toThrow();
  expect(() =>
    lessonDefinitionSchema.parse({
      ...definition,
      sections: [definition.sections[0], definition.sections[0]],
    }),
  ).toThrow();
  expect(() =>
    lessonDefinitionSchema.parse({
      ...definition,
      quiz: [{ ...definition.quiz[0], answerId: 'missing' }],
    }),
  ).toThrow();
});
