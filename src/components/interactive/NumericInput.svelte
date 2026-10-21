<script lang="ts">
  let {
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    integer = false,
    onchange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    integer?: boolean;
    onchange: (value: number) => void;
  } = $props();
  const uid = $props.id();
  let error = $state('');
  let draft = $state('');
  function update(event: Event) {
    const el = event.currentTarget as HTMLInputElement;
    draft = el.value;
    if (event.type === 'input' && ['', '-', '.', '-.'].includes(draft)) {
      error = '';
      return;
    }
    const n = draft.trim() === '' ? NaN : Number(draft);
    if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
      error = `请输入 ${min} 至 ${max} 的有效数值`;
      return;
    }
    error = '';
    if (n !== value) onchange(n);
  }
  $effect(() => {
    draft = String(value);
    error = '';
  });
</script>

<div class="field">
  <label for={uid}>{label}{unit ? ` (${unit})` : ''}</label>
  <input
    id={uid}
    class="input input-bordered numeric-input"
    type="text"
    inputmode="decimal"
    value={draft}
    oninput={update}
    onblur={update}
    onkeydown={(e) => {
      if (e.key === 'Enter') update(e);
    }}
    aria-invalid={!!error}
    aria-describedby={`${uid}-help${error ? ` ${uid}-error` : ''}`}
  />
  <small id={`${uid}-help`}
    >{integer ? '整数；' : ''}范围 {min} 至 {max}；建议步长 {step}{unit ? ` ${unit}` : ''}</small
  >
  {#if error}<small id={`${uid}-error`} class="field-error">{error}</small>{/if}
</div>
