<script lang="ts">
  let {
    label,
    value,
    unit = 'm',
    limit = 5,
    onchange,
  }: {
    label: string;
    value: number;
    unit?: string;
    limit?: number;
    onchange: (value: number) => void;
  } = $props();
</script>

<div class="integer-stepper" role="group" aria-label={`${label} (${unit})`}>
  <span>{label} ({unit})</span>
  <div class="stepper-controls">
    <button
      aria-label={`减少${label}`}
      disabled={value <= -limit}
      onclick={() => onchange(value - 1)}>−</button
    >
    <output aria-label={`${label} (${unit})`}>{value}</output>
    <button
      aria-label={`增加${label}`}
      disabled={value >= limit}
      onclick={() => onchange(value + 1)}>+</button
    >
  </div>
</div>

<style>
  .integer-stepper {
    min-width: 0;
    font-size: var(--font-size-sm);
  }
  .stepper-controls {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr) 2.25rem;
    align-items: center;
    margin-top: 0.2rem;
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-field);
  }
  button {
    min-height: 2.25rem;
    background: transparent;
    color: var(--color-base-content);
    border: 0;
    font-size: var(--font-size-base);
  }
  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  output {
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
</style>
