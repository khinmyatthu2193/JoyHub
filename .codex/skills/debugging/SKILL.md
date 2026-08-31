---
name: debugging
description: Diagnose JoyHub behavior, persistence, rendering, build, or browser-integration bugs and, when requested, implement a focused fix.
---

# JoyHub Debugging Workflow

Read the affected code first. Use `../../../docs/ARCHITECTURE.md` for state, persistence, or browser API issues and `../../../docs/DEVELOPMENT.md` for tooling failures.

1. Establish the failing flow, expected behavior, and whether the issue survives refresh or depends on stored browser data.
2. Trace the relevant state/callback path in `src/App.tsx` and its boundary in `src/utils/` or `src/types/quiz.ts`; distinguish transient UI state from persisted state.
3. Check malformed/stale local-storage values, missing quiz references, browser API support, timers, shuffled original/displayed answer indexes, and React Strict Mode effects when relevant.
4. If the user requested a fix, address the root cause with the smallest safe change and preserve versioned storage compatibility. Otherwise, report the diagnosis without modifying source.
5. Use `../../../docs/DEVELOPMENT.md` to validate any fix. Reproduce the original scenario and test the nearest refresh/resume and empty/error path when persistence is involved.

Report the cause, any requested fix, and exactly what was verified. Do not silently clear all site storage as a fix.
