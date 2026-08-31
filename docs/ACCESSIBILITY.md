# Accessibility

This is an audit of the current implementation plus the target for future changes. It does not claim the current accessibility pass is complete.

## Present today

- Interactive actions use native `button`, `input`, `textarea`, and radio controls; form controls are nested in visible labels.
- Icon-only home, edit, delete, reorder, and close buttons have accessible names.
- The question overlay uses `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` connected to its heading.
- The number wheel is an SVG image with an accessible label. Decorative logo/confetti/emoji treatment is hidden where marked.
- Completed cards and unavailable actions are natively disabled. Correct/incorrect feedback uses words and icons as well as color and sound.
- Inputs have a visible custom focus ring. CSS reduces animation and transition durations for `prefers-reduced-motion: reduce`.
- Responsive layouts are mobile-first and retain large classroom-facing type and controls.

## Gaps confirmed in source

- Opening the question dialog does not move focus into it, trap focus, close on Escape, or restore focus to the triggering card.
- Page/view transitions do not deliberately place focus on the new heading.
- Most buttons rely on browser focus styling; shared button classes do not define a consistent `focus-visible` treatment.
- Validation messages are not associated with fields through `aria-describedby`/`aria-invalid` and are not announced as live status.
- Spin result, answer feedback, and completion changes are not exposed through live regions.
- The global reduced-motion CSS shortens CSS durations, but Framer Motion still supplies transforms/timers and the wheel still waits 1.7 seconds before selection is committed.
- No application keyboard shortcuts exist. Native Tab, Enter, and Space behavior is available through semantic controls.
- The End game action has no confirmation, while quiz deletion uses the browser’s `confirm()` dialog.

## Standard for future work

- Prefer native HTML behavior; add ARIA only to provide a name, relationship, state, or announcement that semantics do not already supply.
- Provide a visible `focus-visible` state for every interactive control and maintain a logical tab order.
- For dialogs: focus a meaningful control on open, keep focus inside, support Escape when dismissal is safe, and restore focus to the opener on close.
- Associate field errors with their controls and announce validation summaries without unexpectedly moving focus.
- Announce asynchronous classroom results concisely without duplicating spoken audio or overwhelming screen-reader users.
- Keep status understandable without color, motion, or sound. Preserve large touch targets and check zoom/reflow as well as projector readability.
- Reduced-motion mode should remove nonessential transforms and long waits, not merely shorten CSS transitions.

## Keyboard opportunities to evaluate

Potential shortcuts include Space to spin, 1–4 to choose a displayed answer, Enter to continue, and Escape to close the question. They are not current behavior. Add them only when they do not conflict with focused form controls, native button activation, browser shortcuts, or accidental classroom input; expose any non-obvious shortcut in the UI.
