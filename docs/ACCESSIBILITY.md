# Accessibility

This is an audit of the current implementation plus the target for future changes. It does not claim the current accessibility pass is complete.

## Present today

- Interactive actions use native `button`, `input`, `textarea`, and radio controls; form controls are programmatically associated with visible labels.
- Icon-only home, edit, delete, reorder, and close buttons have accessible names.
- The question overlay uses `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` connected to its heading.
- Destructive actions use an in-application `alertdialog` with an explicit consequence, safe cancel label, destructive action label, trapped focus, Escape dismissal, and focus restoration.
- Opening the question dialog focuses its close control, traps Tab/Shift+Tab, and supports Escape. Closing returns to the originating card when it remains available, or to Spin after that card becomes completed; feedback moves focus to the next available action.
- The student wheel is an SVG image with an accessible label. Decorative logo/confetti/emoji treatment is hidden where marked.
- Question cards use native disabled states until a student is selected, with visible instructions explaining how to unlock the board. A selected student prevents another spin until a card is answered.
- Completed cards and unavailable actions are natively disabled. Correct/incorrect feedback uses words and icons as well as color and sound.
- Shared controls have a consistent high-contrast `focus-visible` outline, and inputs retain their existing focus treatment. New views focus their primary heading.
- Quiz fields use explicit labels, required/invalid state, and error-summary relationships. Quiz choices expose their pressed state, and setup/validation errors use alert semantics.
- Final student selection and answer feedback use restrained live announcements rather than announcing animation frames.
- Framer Motion honors the user’s reduced-motion preference and confetti is omitted; CSS also shortens animation and transition durations.
- Web Audio and Speech Synthesis failures are contained so optional feedback cannot prevent spin or answer state updates.
- Detectable storage and browser-feedback failures use teacher-facing alert messages with a keyboard-accessible dismiss action; messages do not expose storage keys or browser exceptions.
- Responsive layouts are mobile-first and retain large classroom-facing type and controls.
- Gameplay uses compact page chrome plus an enlarged wheel and selected-student result for projector viewing; administrative actions remain keyboard-accessible in a native teacher-controls disclosure.
- Question, answer, correct-answer, explanation, and feedback typography is enlarged for distance viewing without changing dialog focus behavior.

## Gaps confirmed in source

- No application keyboard shortcuts exist. Native Tab, Enter, and Space behavior is available through semantic controls.
- There is no user-facing sound/speech preference. Browser API failures are safe, but teachers cannot mute feedback within JoyHub.
- Speech Synthesis can fail asynchronously after the browser accepts an utterance; those failures are not consistently detectable across browsers.
- Reduced-motion wheel selection uses a short result delay instead of the full 1.7-second animation.

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
