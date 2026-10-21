import { it, expect } from 'vitest';
import { modules, lessons } from '../../src/lib/curriculum/catalog.ts';
import {
  validateCurriculum,
  topologicalOrder,
  prerequisiteClosure,
} from '../../src/lib/curriculum/graph.ts';
const copy = () => structuredClone(lessons);
it('完整 247 课都是合法 DAG，M12 有理论前置', () => {
  expect(lessons).toHaveLength(247);
  expect(modules).toHaveLength(12);
  const sorted = topologicalOrder(lessons);
  const indices = new Map(sorted.map((l, i) => [l.id, i]));
  for (const l of lessons)
    for (const pre of l.prerequisites) expect(indices.get(pre)!).toBeLessThan(indices.get(l.id)!);
  for (const l of lessons.filter((l) => l.moduleId === 'M12' && l.id !== 'M12-001'))
    expect(l.prerequisites.length).toBeGreaterThan(0);
});
it('拒绝重复、失效引用、错误模块、slug 和循环并报告路径', () => {
  expect(() => validateCurriculum(modules, [...lessons, lessons[0]])).toThrow(/重复/);
  let invalid = copy();
  invalid[1].slug = invalid[0].slug;
  expect(() => validateCurriculum(modules, invalid)).toThrow(/slug/);
  invalid = copy();
  invalid[0].prerequisites = ['M99-999'];
  expect(() => validateCurriculum(modules, invalid)).toThrow(/不存在/);
  invalid = copy();
  invalid[0].moduleId = 'M99';
  expect(() => validateCurriculum(modules, invalid)).toThrow(/模块/);
  invalid = copy();
  invalid[0].prerequisites = ['M01-001'];
  expect(() => validateCurriculum(modules, invalid)).toThrow(/自依赖/);
  invalid = copy();
  invalid[0].prerequisites = ['M01-002'];
  expect(() => validateCurriculum(modules, invalid)).toThrow(/M01-001.*M01-002.*M01-001/);
  invalid = copy();
  invalid[0].slug = '/invalid';
  expect(() => validateCurriculum(modules, invalid)).toThrow();
});
it('传递前置去重并按拓扑排列', () => {
  const closure = prerequisiteClosure('M01-010', lessons).map((l) => l.id);
  expect(closure).toContain('M01-001');
  expect(closure).toContain('M01-009');
  expect(new Set(closure).size).toBe(closure.length);
  expect(closure).not.toContain('M01-010');
});
