---
name: regression-check
description: Perform a release-oriented JoyHub regression review after meaningful changes, covering classroom flows, persistence, accessibility, responsive behavior, and browser feedback APIs.
---

# JoyHub Regression Check

Review the diff first and select affected flows from `../../../docs/GAME_FLOW.md`. Read `../../../docs/STORAGE.md`, `../../../docs/ACCESSIBILITY.md`, or `../../../docs/UI_GUIDELINES.md` only when those areas changed.

Check relevant paths end to end: quiz create/edit/delete and validation; setup and 1–100 student bounds; spin and selection; unused/used cards; shuffled answers and feedback; completion, restart, and end; refresh/resume; sound/speech/celebration; empty/error/confirmation states; keyboard/focus/reduced motion.

For UI changes, sample the layouts that expose the affected breakpoint behavior. Useful viewport targets are 360×800, 390×844, 768×1024, 1024×768, 1366×768, 1440×900, and 1920×1080; test a smaller set when the change is localized.

Use `../../../docs/DEVELOPMENT.md` for automated checks. Report concrete regressions and evidence in severity order, followed by validation gaps. Do not modify code during a review unless the user also asks for fixes, and do not report personal style preferences as defects.
