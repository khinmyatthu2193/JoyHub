---
name: bug-fix
description: Diagnose JoyHub bugs and, when requested, implement the smallest safe fix across UI state, game flow, persistence, build tooling, audio, or speech.
---

# JoyHub Bug Fix

Establish the expected and failing behavior before changing code. Read only the relevant context: `../../../docs/GAME_FLOW.md`, `../../../docs/STORAGE.md`, `../../../docs/ARCHITECTURE.md`, or `../../../docs/DEVELOPMENT.md`.

1. Trace the affected state and callbacks through the source; reproduce when feasible.
2. Check persisted versus temporary state, stale/malformed storage, timers, shuffled displayed/original answer indexes, and browser API support when relevant.
3. Identify the root cause. Do not mask it with arbitrary delays, forced reloads, or broad storage/state resets.
4. If authorized to fix, make the narrowest compatible change and avoid unrelated refactoring. Diagnosis alone does not authorize source edits.
5. Reproduce the original case, check nearby edge cases, and verify refresh/resume when persistence is involved. Use `../../../docs/DEVELOPMENT.md` for available checks.

Report the cause, changed behavior, and verification gaps.
