import { it, expect } from 'vitest';
import { measure, presets, limitComponents } from './experiment.ts';
it('任务卡解析值、投影残差和边界', () => {
  expect(measure({ x: 1, y: 0 }, { x: 0, y: 1 }).dot).toBe(0);
  expect(measure({ x: 1, y: 1 }, { x: -1, y: -1 }).dot).toBe(-2);
  const r = measure({ x: 2, y: 3 }, { x: 1, y: 0 });
  expect(r.projection).toEqual({ x: 2, y: 0 });
  for (const p of presets) {
    const m = measure(p.a, p.b);
    expect(m.aNorm).toBeGreaterThanOrEqual(0);
    expect(m.dot).toBe(measure(p.b, p.a).dot);
  }
  expect(measure({ x: 0, y: 0 }, { x: 0, y: 0 }).angle).toBeNull();
  expect(() => measure({ x: NaN, y: 0 }, { x: 1, y: 0 })).toThrow();
  expect(limitComponents({ x: 6, y: -6 })).toEqual({ x: 5, y: -5 });
  expect(limitComponents({ x: 2.3, y: -1 })).toEqual({ x: 2.3, y: -1 });
  expect(() => limitComponents({ x: NaN, y: 0 })).toThrow();
});
