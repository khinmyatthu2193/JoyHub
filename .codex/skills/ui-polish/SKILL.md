---
name: ui-polish
description: Refine JoyHub layout, responsiveness, interactions, animation, empty/error/confirmation states, or classroom presentation without redesigning unrelated screens.
---

# JoyHub UI Polish

Read `../../../docs/UI_GUIDELINES.md`, inspect the affected flow and adjacent patterns, and identify the concrete usability problem before editing.

- Make the smallest improvement that solves the problem and reuse existing components, semantic classes, Tailwind patterns, icons, and motion language.
- Preserve the primary-action hierarchy and keep gameplay controls easy to read and operate on classroom displays.
- Give empty and error states a clear recovery action; confirm destructive actions without adding unnecessary friction.
- Check keyboard use and consult `../../../docs/ACCESSIBILITY.md` when focus, dialogs, forms, or motion are affected.
- Verify a narrow phone/tablet layout and a wide laptop/projector layout. Test reduced motion when animation changes.
- Use `../../../docs/DEVELOPMENT.md` for validation and manually exercise the changed flow.

Do not redesign or refactor unrelated areas.
