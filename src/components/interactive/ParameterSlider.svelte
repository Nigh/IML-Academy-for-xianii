<script lang="ts">
  import NumericInput from './NumericInput.svelte';
  let {
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    initialValue,
    description = '',
    onchange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    initialValue?: number;
    description?: string;
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
  {#if description}<p>{description}</p>{/if}
  {#if initialValue !== undefined}<button
      class="btn btn-sm btn-ghost"
      onclick={() => onchange(initialValue!)}>重置{label}</button
    >{/if}
</div>
