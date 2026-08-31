---
name: accessibility-review
description: Audit or improve JoyHub keyboard behavior, focus, dialogs, forms, announcements, color-independent feedback, touch targets, and reduced motion.
---

# JoyHub Accessibility Review

Read `../../../docs/ACCESSIBILITY.md`, then walk the requested flow using the current source rather than assuming documented gaps are unchanged.

- Test keyboard-only operation and visible focus in the actual interaction order.
- Inspect native semantics before adding ARIA. Verify accessible names, label/error relationships, and non-color status cues.
- For overlays, verify focus entry, containment, Escape behavior where safe, and restoration to the opener.
- Check asynchronous announcements, reduced-motion behavior, touch targets, zoom/reflow, and projector readability when relevant.
- Prioritize blockers and confusing behavior over theoretical completeness; keep visual changes consistent with `../../../docs/UI_GUIDELINES.md`.
- If changes are requested, keep them scoped and validate with `../../../docs/DEVELOPMENT.md`.

Report existing behavior separately from recommendations or implemented fixes.
