# Interactive Machine Learning Academy for xianii — Agent contract

## Read first

1. `docs/LESSON_SPEC.md`
2. Your `curriculum/tasks/<LESSON_ID>.md`
3. `docs/COMPONENTS.md` and `docs/NOTATION.md`
4. The assigned lesson directory only; no need to read other lessons.

## Ownership

A lesson task may modify only `src/lessons/<LESSON_ID>/**` and `labs/lessons/<LESSON_ID>/**`.
Do not edit curriculum identity, app/router, shared components, package dependencies, build configuration or this file in a lesson PR.
Use an isolated branch/worktree: `lesson/M03-010-gradient-descent`.
One file has one owner at a time. Shared infrastructure changes belong in a separate task/PR.
Prefer existing components; otherwise build a lesson-specific component inside your own directory.
Record a reusable capability request in your PR rather than changing shared interfaces.

## Architecture

`curriculum/lessons.json` owns identity, routes, learning goals and prerequisite DAG. It never owns implementation status.
`src/lessons/*/lesson.ts` is automatically discovered. Unimplemented registered lessons use one shared PlannedLesson.
Never create empty Lesson.svelte files for planned lessons. Never edit App or the loader to register an implementation.
Stable lesson IDs are permanent. Do not reuse IDs or change published slugs without an infrastructure migration.
`contractVersion: 1` is provisional during Phase 0 and freezes after Phase 1 acceptance.
Phase 0 contains exactly one ready example (M01-002); Phase 1 builds shared primitives before broad Phase 2 parallelism.

## Content and mathematics

Chinese prose with English technical terms. All formulas use KaTeX, define symbols/shapes/units/assumptions.
Use consistent notation; distinguish random variables from samples and risk from empirical loss.
Keep mathematical computation in pure TypeScript, separate from Svelte.
No fake training results. Label toy simulations, analytic calculation, random sampling and precomputed output honestly.
Use seeded randomness; report sample count and limitations. Test analytic answers, boundaries, invalid input and tolerance.
Browser code must not require API keys, Python runtimes, remote GPU or account access.
Python/PyTorch/MuJoCo/hardware labs run in the learner's own environment and need full text instructions.
Use public/synthetic data. Never commit weights, secrets, restricted datasets or large binary artifacts.

## UI

Svelte 5 runes, strict TypeScript, typed props and callback attributes. Use the shared contract.
Use @xianii/design-system semantic tokens; no business-component brand hex colors or external font/CDN dependency.
Body uses base typography, compact UI uses sm, xs only metadata (never below 12px).
Inputs need real labels, keyboard access and error text; charts need text descriptions and non-color distinctions.
Respect reduced motion. Reset experiments; stop animation on hidden tabs and dispose timers/subscriptions on unmount.
Use native dialog with title, cancel and focus handling; do not use alert/confirm/prompt.

## Verification and delivery

Run `pnpm check`, `pnpm lint`, `pnpm validate:curriculum`, `pnpm validate:lessons`, `pnpm test`, `pnpm build`.
Use `pnpm test:e2e` for browser-impacting changes. A ready declaration requires actual content, quiz, math tests and component tests.
Use Conventional Commits. One lesson per PR, no global formatting changes.
Attach a screenshot or interaction recording/description, math evidence, checks actually run and known limitations.
Never claim hardware/GPU verification you did not execute.
