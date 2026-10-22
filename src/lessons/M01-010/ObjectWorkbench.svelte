<script lang="ts">
  import type { Vector2 } from '../../lib/math/vector.ts';
  let {
    v,
    u,
    p,
    r,
    degrees,
    onrotate,
    onmove,
  }: {
    v: Vector2;
    u: Vector2;
    p: Vector2;
    r: Vector2;
    degrees: number;
    onrotate: (degrees: number) => void;
    onmove: (x: number, y: number) => void;
  } = $props();
  const point = (q: Vector2) => `${180 + q.x * 22},${175 - q.y * 22}`;
</script>

<section class="workbench" data-testid="object-workbench" aria-label="旋转导轨与垂直连接臂">
  <h3>转动导轨，重新分配两段行程</h3>
  <p>
    小车沿穿过中心的导轨行驶，连接臂从小车垂直伸向目标。旋转导轨时目标固定；长度使用无量纲模型单位。先预测哪一段变短。
  </p>
  <div class="actions">
    <button
      class="btn"
      disabled={degrees > 165}
      onclick={() => onrotate(Math.min(180, degrees + 15))}>导轨逆时针转 15°</button
    ><button
      class="btn"
      disabled={degrees < -165}
      onclick={() => onrotate(Math.max(-180, degrees - 15))}>导轨顺时针转 15°</button
    ><button class="btn" disabled={v.x > 4} onclick={() => onmove(Math.min(5, v.x + 1), v.y)}
      >目标向右一格</button
    >
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables horizontal diagram scrolling.) -->
  <div class="scene" tabindex="0" role="region" aria-label="对象示意图，可横向滚动">
    <svg viewBox="0 0 360 350" role="img" aria-label={`导轨角度${degrees}度，小车投影与连接臂垂直`}>
      <rect x="15" y="15" width="330" height="320" class="floor" />
      <path
        d={`M${point({ x: -u.x * 6, y: -u.y * 6 })}L${point({ x: u.x * 6, y: u.y * 6 })}`}
        class="alternative"
      />
      <path d={`M180,175L${point(p)}`} class="path" />
      <path d={`M${point(p)}L${point(v)}`} class="alternative" />
      <circle cx="180" cy="175" r="5" class="fixed" />
      <circle cx={180 + v.x * 22} cy={175 - v.y * 22} r="5" class="fixed" />
      <rect
        data-testid="projection-carriage"
        x={180 + p.x * 22 - 4}
        y={175 - p.y * 22 - 4}
        width="8"
        height="8"
        class="object"
      />
      <text x="28" y="43">实线：沿轨；虚线：垂直臂</text>
      <text x="28" y="322">固定比例：每单位 22 逻辑像素</text>
    </svg>
  </div>
  <p data-testid="object-reading" aria-live="polite">
    沿轨长度 {Math.hypot(p.x, p.y).toFixed(3)}；连接臂长度 {Math.hypot(r.x, r.y).toFixed(
      3,
    )}；目标直距 {Math.hypot(v.x, v.y).toFixed(3)}。平方账本与下方分解共用同一结果。
  </p>
  <p>转到目标方向时连接臂归零；转到垂直方向时沿轨行程归零。长度本身相加一般不等于直距。</p>
</section>

<style>
  .scene {
    overflow-x: auto;
  }
  .scene svg {
    min-width: 320px;
  }
  .workbench {
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    padding: 1rem;
    margin-block: 1rem;
    min-width: 0;
  }
  svg {
    display: block;
    width: 100%;
    max-width: 32rem;
    margin: auto;
    overflow: visible;
  }
  text {
    fill: var(--color-base-content);
    font-size: 16px;
  }
  .floor {
    fill: var(--color-base-200);
    stroke: var(--color-base-content);
  }
  .path {
    fill: none;
    stroke: var(--color-primary);
    stroke-width: 3;
  }
  .alternative {
    fill: none;
    stroke: var(--color-secondary);
    stroke-width: 3;
    stroke-dasharray: 7 5;
  }
  .object {
    fill: var(--color-accent);
    stroke: var(--color-base-content);
    stroke-width: 2;
  }
  .fixed {
    fill: var(--color-base-content);
    stroke: var(--color-base-content);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 0.75rem;
  }
  button {
    min-height: 44px;
    height: auto;
    white-space: normal;
  }
  p {
    overflow-wrap: anywhere;
  }
</style>
