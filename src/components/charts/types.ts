import type { Vector2 } from '../../lib/math/vector.ts';
export interface PlotSeries {
  id: string;
  label: string;
  kind: 'line' | 'scatter' | 'bar' | 'step';
  points: (Vector2 & { width?: number })[];
  role: 'primary' | 'secondary' | 'accent';
}
export interface ReferenceLine {
  axis: 'x' | 'y';
  value: number;
  label: string;
}
