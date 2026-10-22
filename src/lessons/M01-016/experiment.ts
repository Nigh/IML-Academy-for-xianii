export const presets = [
  {
    id: 'under',
    name: '场景一：欠定最小范数',
    description: '[1,1]x=2，伪逆选择(1,1)。',
    mode: 'under',
    b1: 2,
    b2: 0,
    t: 1,
  },
  {
    id: 'over',
    name: '场景二：超定不一致',
    description: '同一标量需要同时等于1和3，只能折中为2。',
    mode: 'over',
    b1: 1,
    b2: 3,
    t: 1,
  },
  {
    id: 'consistent',
    name: '场景二对照：可精确拟合',
    description: '两个目标都是2，伪逆残差为0。',
    mode: 'over',
    b1: 2,
    b2: 2,
    t: 0,
  },
];
export function experiment(mode: string, b1: number, b2: number, t: number) {
  if (
    !['under', 'over'].includes(mode) ||
    ![b1, b2, t].every(Number.isFinite) ||
    Math.abs(b1) > 4 ||
    Math.abs(b2) > 4 ||
    Math.abs(t) > 3
  )
    throw new RangeError('模型无效；b分量±4，t±3，必须有限。');
  const under = mode === 'under';
  const matrix = under ? [[1, 1]] : [[1], [1]],
    pinverse = under ? [[0.5], [0.5]] : [[0.5, 0.5]];
  const rhs = under ? [b1] : [b1, b2],
    star = under ? [b1 / 2, b1 / 2] : [(b1 + b2) / 2];
  const candidate = under ? [star[0] + t, star[1] - t] : [star[0] + t];
  const apply = (x: number[]) => matrix.map((r) => r.reduce((s, a, i) => s + a * x[i], 0));
  const fitted = apply(star),
    current = apply(candidate);
  const norm = (x: number[]) => Math.hypot(...x),
    distance = (x: number[], y: number[]) => norm(x.map((n, i) => n - y[i]));
  const target = under ? { x: star[0], y: star[1] } : { x: b1, y: b2 };
  const displayed = under ? { x: candidate[0], y: candidate[1] } : { x: fitted[0], y: fitted[1] };
  const extent =
    1.4 *
    Math.max(
      1,
      Math.abs(target.x),
      Math.abs(target.y),
      Math.abs(displayed.x),
      Math.abs(displayed.y),
    );
  return {
    matrix,
    pinverse,
    rhs,
    star,
    candidate,
    fitted,
    current,
    starNorm: norm(star),
    candidateNorm: norm(candidate),
    residual: distance(fitted, rhs),
    candidateResidual: distance(current, rhs),
    target,
    displayed,
    extent,
  };
}
