<script lang="ts">
  import type { QuizQuestion } from '../../lib/lesson/contract.ts';
  let {
    question,
    savedAnswer,
    onsubmit,
  }: { question: QuizQuestion; savedAnswer?: string; onsubmit: (optionId: string) => void } =
    $props();
  let selected = $state('');
  let submitted = $state(false);
  $effect(() => {
    selected = savedAnswer ?? '';
    submitted = !!savedAnswer;
  });
  const option = $derived(question.options.find((o) => o.id === selected));
  const uid = $props.id();
</script>

<form
  class="quiz-block"
  onsubmit={(e) => {
    e.preventDefault();
    if (option) {
      onsubmit(selected);
      submitted = true;
    }
  }}
>
  <fieldset>
    <legend>{question.prompt}</legend>
    {#each question.options as o (o.id)}<label class="quiz-option"
        ><input
          type="radio"
          name={uid}
          value={o.id}
          bind:group={selected}
          onchange={() => (submitted = false)}
        /><span>{o.text}</span></label
      >{/each}
  </fieldset>
  <button class="btn btn-sm btn-primary" disabled={!selected} type="submit">检查理解</button>
  {#if submitted && option}<div class="quiz-feedback" role="status">
      <strong>{selected === question.answerId ? '回答正确' : '再想一想'}</strong>
      <p>{option.explanation}</p>
    </div>{/if}
</form>
