# JoyHub Development Guide

JoyHub is an offline-friendly classroom quiz game for teachers. It is a client-only React application: quizzes, settings, and active progress remain in the current browser.

## Start here

1. Read `PROJECT_STATUS.md`; work on its first unchecked item unless the user requests a specific task.
2. Read `PRODUCT_SPEC.md` before changing behavior or scope.
3. Read only the context relevant to the task:
   - Architecture or state ownership: `docs/ARCHITECTURE.md`
   - Game behavior: `docs/GAME_FLOW.md`
   - Persistence or recovery: `docs/STORAGE.md`
   - UI or responsive polish: `docs/UI_GUIDELINES.md` and `.codex/skills/ui-polish/SKILL.md`
   - Accessibility: `docs/ACCESSIBILITY.md` and `.codex/skills/accessibility-review/SKILL.md`
   - Bug diagnosis/fix: `.codex/skills/bug-fix/SKILL.md`
   - Release or regression review: `.codex/skills/regression-check/SKILL.md`
   - Commands, tooling, or deployment: `docs/DEVELOPMENT.md`

Do not load every document for every task. Source code is authoritative; update stale guidance when implementation changes.

## Technology and layout

- React + TypeScript + Vite; Tailwind CSS; Framer Motion; Lucide React
- `src/App.tsx`: state-driven views, quiz management, setup, and game orchestration
- `src/types/`: domain and persisted-state types
- `src/utils/`: local-storage and sound/speech boundaries
- `src/index.css`: Tailwind entry point and shared visual classes
- `docs/`: deeper factual context; `.codex/skills/`: repeatable workflows

## Global rules

- Keep the MVP local-only: no backend, authentication, database, cloud sync, or router unless scope changes explicitly.
- Optimize for fast teacher interaction, encouraging feedback, projector readability, keyboard use, reduced motion, and tablet/laptop responsiveness.
- Inspect affected source and reuse existing components and patterns. Avoid unrelated refactors and dependencies without a concrete need.
- Preserve quiz/game behavior and versioned `joyhub_*` data unless the task explicitly changes them; prevent avoidable data loss.
- Preserve the current visual identity. Empty/error states should explain the next action; destructive actions need clear confirmation.
- Do not edit generated/dependency output (`dist/`, `node_modules/`, `*.tsbuildinfo`, generated `vite.config.js`/`.d.ts`). Preserve unrelated working-tree changes.

## Completion

- Use the verified checks in `docs/DEVELOPMENT.md` and manually exercise affected flows where automation is absent.
- Update `PROJECT_STATUS.md` with implementation work. Do not complete a phase while an acceptance check remains open.
