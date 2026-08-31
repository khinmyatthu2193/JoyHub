# JoyHub Development Guide

JoyHub is a client-only React classroom quiz game. Local storage is its data layer; the MVP has no router, backend, authentication, database, or cloud sync.

## Start here

1. Read `PROJECT_STATUS.md`. Work on its first unchecked item unless the user requests something specific.
2. Read `PRODUCT_SPEC.md` before changing product behavior or scope.
3. Load only task-relevant context:
   - State, persistence, or structure: `docs/ARCHITECTURE.md`
   - UI, responsive behavior, motion, or accessibility: `docs/UI_GUIDELINES.md` and `.codex/skills/frontend/SKILL.md`
   - Setup, commands, validation, or deployment: `docs/DEVELOPMENT.md`
   - Bug diagnosis: `.codex/skills/debugging/SKILL.md`
   - Code review: `.codex/skills/code-review/SKILL.md`

## Global rules

- Keep changes within the local-only MVP and the user’s requested scope. Do not add dependencies without a concrete need.
- Inspect affected source and reuse existing components and patterns before introducing new ones. Do not restructure solely for tidiness.
- Preserve versioned `joyhub_*` storage compatibility or provide an explicit migration.
- Preserve the established classroom visual identity, responsive targets, and reduced-motion behavior.
- Do not edit generated or dependency output such as `dist/`, `node_modules/`, `*.tsbuildinfo`, or generated `vite.config.js`/`.d.ts` files.
- Preserve unrelated working-tree changes.

## Completion

- Use the checks in `docs/DEVELOPMENT.md` and manually verify affected behavior where no automated check exists.
- For implementation work, update `PROJECT_STATUS.md` in the same change. Do not mark a phase complete while an acceptance check remains open.
