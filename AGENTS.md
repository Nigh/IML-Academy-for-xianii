# Interactive Machine Learning Academy for xianii — Agent contract

## Read first

1. `docs/ARCHITECTURE.md` and `docs/LESSON_SPEC.md`.
2. Your `curriculum/tasks/<LESSON_ID>.md`.
3. `docs/COMPONENTS.md` and `docs/NOTATION.md`; `docs/LOCAL_LABS.md` for local labs.
4. The assigned lesson directory only; no need to read other lessons.

LESSON_SPEC owns teaching acceptance; task cards add lesson-specific requirements without lowering it. Runtime types/checks are structural gates, not proof of teaching quality.

## Teaching design Skills

For lesson creation or optimization, read `docs/TEACHING_DESIGN.md` and follow `docs/LESSON_OPTIMIZATION.md` within the authorized scope. Use `skills/math-storytelling/SKILL.md` for core questions, concept motivation and derivation paths; use `skills/interactive-pedagogy/SKILL.md` for active exploration, feedback and transfer challenges. Load only the relevant skill for a narrower review. These are versioned project skills; read their paths explicitly if the session has not discovered their names. Collaboration, portability and required external skills are documented in `docs/TEACHING_SKILLS.md`. Before writing or revising learner-facing course content (including prose, quizzes, teaching interactions and lab instructions), verify that math-storytelling, interactive-pedagogy, humanizer-zh and ui-ux-pro-max have readable SKILL.md entrypoints and the resources needed for this task. Use humanizer-zh for Chinese prose and ui-ux-pro-max for course UX review. If any required skill is missing, unreadable or incomplete, stop course-content authoring, identify the missing skill and ask the user to install or repair it before continuing; recheck after installation. Do not substitute another skill or silently fall back. This gate does not apply to non-content changes, including documentation, tooling, infrastructure or read-only review. Do not automatically install external skills.

Current production policy: rebuild M01-002 first, then establish a few user-approved exemplars before scaling. Follow TEACHING_DESIGN for one-page design approval, target-reader trial and human acceptance; ready status and model self-review do not confer exemplar status. Do not start batch production without explicit user authorization of exemplars and scope.

## Ownership

A new-lesson creation task may modify only `src/lessons/<LESSON_ID>/**` and `labs/lessons/<LESSON_ID>/**`.
Do not edit curriculum identity, app/router, shared components, package dependencies, build configuration or this file in a new-lesson PR.
Use an isolated `lesson/<LESSON_ID>-<slug>` branch for new lessons.
For authorized batch revisions of existing lessons, use one `codex/<topic>` branch and one PR. The same PR may include directly related shared-component, prerequisite, constraint-document and generated-task updates; list all affected lesson IDs, file scope and verification. Do not include new lessons or unrelated changes.
Parallel agents must use separate worktrees and must not share a writable checkout.
One file has one owner at a time. Outside an authorized batch revision, shared infrastructure changes belong in a separate task/PR.
Prefer existing components; otherwise build a lesson-specific component inside your own directory.
For new lessons, record a reusable capability request in your PR rather than changing shared interfaces.

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
Landscape desktop only: recommend 720p or higher; test 1280×720 and 1920×1080 CSS-pixel viewports per LESSON_SPEC §4. No narrow-screen, portrait or mobile adaptation or tests, including reading fallbacks. Retain desktop zoom, high DPI, keyboard access and bounded computation.
Respect reduced motion. Reset experiments; stop animation on hidden tabs and dispose timers/subscriptions on unmount.
Use native dialog with title, cancel and focus handling; do not use alert/confirm/prompt.

## Verification and delivery

Run `pnpm check`, `pnpm lint`, `pnpm validate:curriculum`, `pnpm validate:lessons`, `pnpm test`, `pnpm build`.
Use `pnpm test:e2e` for browser-impacting changes. A ready declaration requires actual content, quiz, math tests and component tests.
Use Conventional Commits. Each newly created lesson uses one PR targeting main; never bundle new lessons or push directly to main. Existing lessons may be revised together in an authorized batch-revision PR.
Shared documentation and infrastructure normally use separate PRs; directly related changes may join an authorized batch-revision PR. Merge only after all CI checks pass and content review is complete; do not bypass failed checks. Follow docs/CONTRIBUTING.md.
Report the lesson ID, implemented interactions, mathematical verification, actual checks/results, theme/responsive/link/scope checks, limitations and changed files. Attach screenshots or interaction evidence; mark inapplicable/unrun checks honestly.
Never claim hardware/GPU verification you did not execute.
