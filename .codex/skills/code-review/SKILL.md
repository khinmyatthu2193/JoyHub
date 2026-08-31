---
name: code-review
description: Review JoyHub changes for concrete correctness, regression, accessibility, responsive, persistence, TypeScript, performance, and security risks without rewriting the code.
---

# JoyHub Code Review

Read the diff and affected call paths before judging style. Consult `../../../docs/ARCHITECTURE.md` for state/persistence changes and `../../../docs/UI_GUIDELINES.md` for interface changes.

Prioritize findings that can change behavior or user outcomes:

- quiz validation and immutable updates; preservation of IDs, timestamps, four-option tuples, and original correct-answer indexes
- student bounds, wheel timing/random selection, question completion, restart/end behavior, and refresh restoration
- compatibility and failure handling for versioned local-storage data
- stale closures, timer/audio/speech behavior, invalid active-game references, and browser support assumptions
- keyboard/focus/dialog behavior, accessible names, non-color feedback, reduced motion, touch targets, and narrow/wide layouts
- strict TypeScript issues, duplicated patterns that can drift, unnecessary render/animation work, unsafe content handling, and unintended dependencies or scope expansion

Use `../../../docs/DEVELOPMENT.md` to select relevant validation. Lead with actionable findings ordered by severity and cite file/line locations. Explain the failure scenario and impact; avoid preference-only comments. If there are no findings, say so and identify any validation gaps.
