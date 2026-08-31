---
name: frontend
description: Modify or polish JoyHub pages and components, including responsive layout, accessibility, and animation, while preserving its existing classroom UI language.
---

# JoyHub Frontend Workflow

Read `../../../docs/UI_GUIDELINES.md` and inspect the affected source. Consult `../../../docs/ARCHITECTURE.md` only if the change affects state, persistence, or structure.

- Trace the affected teacher/classroom flow before editing and reuse existing components, semantic CSS classes, Tailwind patterns, colors, icons, and motion conventions where they fit.
- Keep controls native and clearly named, maintain visible focus and non-color cues, and account for dialog focus/keyboard behavior when relevant.
- Verify the base/narrow layout and the affected `sm`/`md`/`lg`/`xl` layouts. Keep controls and critical type suitable for touch and projector use.
- Make motion purposeful and verify that the result remains usable with reduced motion enabled.
- Validate the changed flow using `../../../docs/DEVELOPMENT.md`.
