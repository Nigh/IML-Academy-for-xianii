export type Point = { x: number; y: number };
export const presets = [
  {
    id: 'diagonal',
    name: '场景一：奇异值3和1',
    description: 'U=V=I，A=diag(3,1)。',
    s1: 3,
    s2: 1,
    u: 0,
    v: 0,
    reflect: false,
  },
  {
    id: 'rankone',
    name: '场景二：秩1',
    description: '第二奇异值为0，单位圆被压成线段。',
    s1: 3,
    s2: 0,
    u: 30,
    v: 45,
    reflect: false,
  },
  {
    id: 'rotate',
    name: '场景三：纯旋转',
    description: '90°旋转的奇异值都是1，与复特征值不同。',
    s1: 1,
    s2: 1,
    u: 90,
    v: 0,
    reflect: false,
  },
  {
    id: 'reflection',
    name: '场景四：反射',
    description: 'diag(−3,1)仍有非负奇异值3和1。',
    s1: 3,
    s2: 1,
    u: 0,
    v: 0,
    reflect: true,
  },
];
const rotate = (d: number) => {
  const a = (d * Math.PI) / 180;
  return [
    [Math.cos(a), -Math.sin(a)],
    [Math.sin(a), Math.cos(a)],
  ];
};
const apply = (a: number[][], p: Point): Point => ({
  x: a[0][0] * p.x + a[0][1] * p.y,
  y: a[1][0] * p.x + a[1][1] * p.y,
});
export function experiment(s1: number, s2: number, u: number, v: number, reflect: boolean) {
  if (
    ![s1, s2, u, v].every(Number.isFinite) ||
    s1 < 0 ||
    s1 > 4 ||
    s2 < 0 ||
    s2 > s1 ||
    Math.abs(u) > 180 ||
    Math.abs(v) > 180 ||
    typeof reflect !== 'boolean'
  )
    throw new RangeError('须0≤σ₂≤σ₁≤4，角度±180°且有限，反射为布尔值。');
  const U = rotate(u);
  if (reflect) {
    U[0][0] *= -1;
    U[1][0] *= -1;
  }
  const Vt = rotate(-v),
    sigma = [
      [s1, 0],
      [0, s2],
    ];
  const stage = (p: Point) => {
    const q = apply(Vt, p),
      z = apply(sigma, q);
    return [p, q, z, apply(U, z)];
  };
  const columns = [stage({ x: 1, y: 0 })[3], stage({ x: 0, y: 1 })[3]],
    matrix = [
      [columns[0].x, columns[1].x],
      [columns[0].y, columns[1].y],
    ];
  const circle = Array.from({ length: 73 }, (_, i) => ({
    x: Math.cos((i * Math.PI) / 36),
    y: Math.sin((i * Math.PI) / 36),
  }));
  const stamp = [
    { x: -0.6, y: -0.4 },
    { x: 0.6, y: -0.4 },
    { x: 0.6, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0.7 },
    { x: -0.6, y: 0.7 },
  ].map(stage);
  const stages = circle.map(stage),
    probe = stage({ x: Math.SQRT1_2, y: Math.SQRT1_2 });
  return {
    stamp: [0, 1, 2, 3].map((i) => stamp.map((p) => p[i])),
    U,
    Vt,
    sigma,
    matrix,
    circle,
    curves: [0, 1, 2, 3].map((i) => stages.map((p) => p[i])),
    probe,
    rank: Number(s1 > 0) + Number(s2 > 0),
    extent: 1.3 * Math.max(1, s1),
  };
}
