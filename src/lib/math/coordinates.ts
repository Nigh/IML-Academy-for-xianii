import { finite, type Vector2 } from './vector.ts';
export type Range = readonly [number, number];
export function validRange(r: Range) {
  finite(...r);
  if (r[0] >= r[1] || !Number.isFinite(r[1] - r[0])) throw new RangeError('坐标范围必须递增且有限');
}
export function mapping(x: Range, y: Range, width: number, height: number, equal = false) {
  validRange(x);
  validRange(y);
  finite(width, height);
  if (width <= 0 || height <= 0) throw new RangeError('尺寸必须为正');
  let sx = width / (x[1] - x[0]),
    sy = height / (y[1] - y[0]);
  if (equal) sx = sy = Math.min(sx, sy);
  const ox = (width - (x[1] - x[0]) * sx) / 2,
    oy = (height - (y[1] - y[0]) * sy) / 2;
  return {
    toScreen: (p: Vector2): Vector2 => ({
      x: ox + (p.x - x[0]) * sx,
      y: height - oy - (p.y - y[0]) * sy,
    }),
    toData: (p: Vector2): Vector2 => ({
      x: x[0] + (p.x - ox) / sx,
      y: y[0] + (height - oy - p.y) / sy,
    }),
  };
}
export function transformRange(r: Range, zoom: number, pan = 0): Range {
  validRange(r);
  finite(zoom, pan);
  if (zoom <= 0) throw new RangeError('缩放必须为正');
  const mid = (r[0] + r[1]) / 2 + pan,
    half = (r[1] - r[0]) / 2 / zoom;
  const out: Range = [mid - half, mid + half];
  validRange(out);
  return out;
}
export function canvasSize(width: number, height: number, dpr = 1) {
  finite(width, height, dpr);
  if (width <= 0 || height <= 0 || dpr <= 0 || dpr > 8)
    throw new RangeError('Canvas 尺寸或 DPR 无效');
  return { width: Math.round(width * dpr), height: Math.round(height * dpr), scale: dpr };
}

/** Integer unit lattice; omit crowded lines without redefining a coordinate unit. */
export function unitGrid(range: Range, pixels: number) {
  validRange(range);
  finite(pixels);
  if (pixels <= 0) throw new RangeError('网格尺寸必须为正');
  const limit = Math.max(1, Math.min(80, Math.floor(pixels / 16)));
  const step = Math.max(1, Math.ceil((range[1] - range[0]) / limit));
  const first = Math.ceil(range[0] / step) * step;
  const count = Math.max(0, Math.min(limit + 1, Math.floor((range[1] - first) / step) + 1));
  const values = Array.from({ length: count }, (_, i) => first + i * step).filter(
    (n) => Number.isFinite(n) && n >= range[0] && n <= range[1],
  );
  return { step, values: [...new Set(values.map((n) => (n === 0 ? 0 : n)))] };
}
