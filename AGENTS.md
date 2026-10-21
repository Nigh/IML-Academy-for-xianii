# Interactive Machine Learning Academy for xianii — Agent contract

## Read first

1. `docs/ARCHITECTURE.md` and `docs/LESSON_SPEC.md`.
2. Your `curriculum/tasks/<LESSON_ID>.md`.
3. `docs/COMPONENTS.md` and `docs/NOTATION.md`; `docs/LOCAL_LABS.md` for local labs.
4. The assigned lesson directory only; no need to read other lessons.

LESSON_SPEC owns teaching acceptance; task cards add lesson-specific requirements without lowering it. Runtime types/checks are structural gates, not proof of teaching quality.

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
Phase 0 delivered one ready example (M01-002); Phase 1 builds shared primitives before broad Phase 2 parallelism.

## Content and mathematics

Chinese prose with English technical terms. All formulas use KaTeX, define symbols/shapes/units/assumptions.
Use consistent notation; distinguish random variables from samples and risk from empirical loss.
Keep mathematical computation in pure TypeScript, separate from Svelte.
Teach motivation, intuition, conditions and definitions, meaningful interaction (except explicit local-only labs), at least two exploration scenarios and two misconceptions/limitations, 2–4 understanding questions, and 3–5 summary points with registered related links.
Start from natural engineering/ML examples; do not force hardware analogies or skip ML-specific theory.
No fake training results. Label toy simulations, analytic calculation, random sampling and precomputed output honestly.
Use seeded randomness; report sample count and limitations. Test analytic answers, boundaries, invalid input and tolerance.
Browser code must not require API keys, Python runtimes, remote GPU or account access.
Python/PyTorch/MuJoCo/hardware labs run in the learner's own environment and need full text instructions.
Use public/synthetic data. Never commit weights, secrets, restricted datasets or large binary artifacts.

## UI

Svelte 5 runes, strict TypeScript, typed props and callback attributes. Use the shared contract.
Use @xianii/design-system semantic tokens; no business-component brand hex colors or external font/CDN dependency.
Body uses base typography, compact UI uses sm, xs only metadata (never below 12px).
Inputs need real labels, keyboard access and error text; charts need text descriptions, axes/units/legends and non-color distinctions.
Support high DPI, zoom, mobile reading and bounded computation. Complex charts may scroll locally.
Respect reduced motion. Reset experiments; stop animation on hidden tabs and dispose timers/subscriptions on unmount.
Use native dialog with title, cancel and focus handling; do not use alert/confirm/prompt.

## Verification and delivery

Run `pnpm check`, `pnpm lint`, `pnpm validate:curriculum`, `pnpm validate:lessons`, `pnpm test`, `pnpm build`.
Use `pnpm test:e2e` for browser-impacting changes. A ready declaration requires actual content, quiz, math tests and component tests.
Use Conventional Commits. Each lesson (including revisions) uses one PR targeting main; never bundle lessons or push directly to main.
Shared documentation and infrastructure also use separate PRs. Merge only after all CI checks pass and content review is complete; do not bypass failed checks. Follow docs/CONTRIBUTING.md.
Report the lesson ID, implemented interactions, mathematical verification, actual checks/results, theme/responsive/link/scope checks, limitations and changed files. Attach screenshots or interaction evidence; mark inapplicable/unrun checks honestly.
Never claim hardware/GPU verification you did not execute.
