import { it, expect } from 'vitest';
import { emptyProgress, parseProgress } from '../../src/lib/progress/schema.ts';
import { readProgress, mergeProgress } from '../../src/lib/progress/storage.ts';
it('版本化导入导出，拒绝非法数据、伪评分与未知版本', () => {
  const data = emptyProgress();
  data.lessons['M01-002'] = {
    visitedAt: 5,
    answers: { q: { optionId: 'a', questionVersion: 1, answeredAt: 5 } },
  };
  expect(parseProgress(JSON.stringify(data))).toEqual(data);
  expect(() => parseProgress('{bad')).toThrow();
  expect(() => parseProgress('{"schemaVersion":2}')).toThrow(/版本/);
  expect(() => parseProgress(JSON.stringify({ ...data, correct: true }))).toThrow();
  expect(() => parseProgress('x'.repeat(2 * 1024 * 1024 + 1))).toThrow(/MiB/);
});
it('按新时间合并且冲突时保留当前记录，未知课程可往返', () => {
  const current = emptyProgress();
  current.updatedAt = 20;
  current.lastLesson = 'M01-002';
  current.lessons['M01-002'] = {
    visitedAt: 20,
    completedAt: 20,
    answers: { q: { optionId: 'a', answeredAt: 20, questionVersion: 1 } },
  };
  const incoming = emptyProgress();
  incoming.updatedAt = 10;
  incoming.lastLesson = 'M99-001';
  incoming.lessons['M01-002'] = {
    visitedAt: 10,
    completedAt: 10,
    answers: { q: { optionId: 'b', answeredAt: 20, questionVersion: 1 } },
  };
  incoming.lessons['M99-001'] = { visitedAt: 1, answers: {} };
  const merged = mergeProgress(current, incoming);
  expect(merged.lessons['M01-002'].answers.q.optionId).toBe('a');
  expect(merged.lessons['M01-002'].completedAt).toBe(20);
  expect(merged.lastLesson).toBe('M01-002');
  expect(merged.lessons['M99-001']).toBeTruthy();
  expect(current.lessons['M99-001']).toBeUndefined();
});
it('存储不可用或损坏时保留原数据并降级', () => {
  expect(readProgress().writable).toBe(false);
  expect(
    readProgress({
      getItem: () => '{bad',
      setItem: () => {
        throw new Error('must not write');
      },
    }).writable,
  ).toBe(false);
  expect(readProgress({ getItem: () => null, setItem: () => {} }).writable).toBe(true);
});
