import { it, expect } from 'vitest';
import { descend } from '../../lib/simulations/gradient.ts';
import { objective, experiment, contours } from './experiment.ts';
it('梯度、单步与解析收敛条件（绝对容差 1e-10）', () => {
  expect(objective('origin').gradient([2])).toEqual([4]);
  expect(descend(objective('origin'), [2], 0.1, 1).history[1].x[0]).toBe(1.6);
  for (const eta of [0.05, 0.5, 0.9]) {
    const r = descend(objective('quadratic'), [-2], eta, 10);
    r.history.forEach((p, t) =>
      expect(Math.abs(p.x[0] - (2 - 4 * (1 - 2 * eta) ** t))).toBeLessThan(1e-10),
    );
  }
  expect(descend(objective('quadratic'), [-2], 1, 20).status).toBe('oscillating');
  expect(descend(objective('quadratic'), [-2], 1.1, 1000).status).toBe('diverged');
  expect(descend(objective('quadratic'), [2], 1.1, 10).status).toBe('stationary');
  expect(objective('two').gradient([2, 3])).toEqual([4, 60]);
  expect(descend(objective('two'), [2, 3], 0.05, 1000).status).toBe('stationary');
});
it('非凸端点、数值保护、预算与重置复现', () => {
  expect(descend(objective('nonconvex'), [0], 0.05, 100).status).toBe('stationary');
  for (const sign of [-1, 1])
    expect(
      descend(objective('nonconvex'), [0.5 * sign], 0.05, 300).history.at(-1)!.x[0],
    ).toBeCloseTo(sign, 6);
  const r = experiment('quadratic', -2, 2, 0.1, 2, 1, 10);
  expect(r.status).toBe('max-steps');
  expect(r.history).toHaveLength(3);
  expect(r).toEqual(experiment('quadratic', -2, 2, 0.1, 2, 1, 10));
  expect(descend({ value: () => Infinity, gradient: () => [0] }, [1], 0.1, 10).status).toBe(
    'invalid',
  );
  expect(() => descend(objective('origin'), [NaN], 0.1, 1)).toThrow();
  expect(() => descend(objective('origin'), [2], 0, 1)).toThrow();
  expect(() => descend(objective('origin'), [2], 0.1, 1001)).toThrow();
  expect(() => objective('two', 0, 1)).toThrow();
  for (const c of contours(1, 10))
    for (const p of c.points)
      expect(p.x * p.x + 10 * p.y * p.y).toBeCloseTo(Number(c.id.split('-')[1]), 10);
});
