<script lang="ts">
  import NumericInput from './NumericInput.svelte';
  let {
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    onchange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onchange: (value: number) => void;
  } = $props();
</script>

<div class="parameter-control">
  <NumericInput {label} {value} {min} {max} {step} {unit} {onchange} />
  <input
    class="range range-primary range-xs"
    aria-label={`${label} 滑块`}
    type="range"
    {min}
    {max}
    {step}
    {value}
    oninput={(e) => onchange(e.currentTarget.valueAsNumber)}
  />
</div>
