<script lang="ts">
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
  const uid = $props.id();
  let error = $state('');
  function update(event: Event) {
    const el = event.currentTarget as HTMLInputElement;
    const n = el.valueAsNumber;
    if (!Number.isFinite(n) || n < min || n > max) {
      error = `请输入 ${min} 至 ${max} 的有效数值`;
      return;
    }
    error = '';
    onchange(n);
  }
  $effect(() => {
    void value;
    error = '';
  });
</script>

<div class="field">
  <label for={uid}>{label}{unit ? ` (${unit})` : ''}</label>
  <input
    id={uid}
    class="input input-bordered numeric-input"
    type="number"
    {min}
    {max}
    {step}
    {value}
    oninput={update}
    aria-invalid={!!error}
    aria-describedby={error ? `${uid}-error` : undefined}
  />
  {#if error}<small id={`${uid}-error`} class="field-error">{error}</small>{/if}
</div>
