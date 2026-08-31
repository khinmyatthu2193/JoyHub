# UI Guidelines

Use this as a record of the current interface, not as a proposal for a new design system. The source of truth is `src/index.css` plus existing markup in `src/App.tsx`.

## Visual language

- Tone: warm, encouraging, playful, and classroom-friendly without looking childish.
- Typeface: Nunito (weights 400, 600, 700, 800, 900) loaded from Google Fonts, with `ui-rounded, sans-serif` fallbacks. Keep essential content usable if the remote font is unavailable.
- Core colors: cream backgrounds (`#fffaf2`, `#fff8e9`), ink (`#263238`), coral (`#ff8277` / `#ed675c`), sun (`#ffd86f`), and mint (`#8ed9bd`). Blue, purple, and orange appear as supporting wheel/confetti colors. Success uses green; destructive/error states use red.
- Surfaces: large rounded corners, soft borders, translucent white cards, subtle blur, and low-contrast warm shadows. Background blobs add depth without carrying information.
- Typography: heavy, tight display headings; bold labels and controls; muted ink for supporting copy. Classroom-critical information uses large type and strong contrast.

## Reusable UI patterns

Prefer the existing semantic classes before composing replacements: `card`, `eyebrow`, `page-title`, `label`, `input`, `btn-primary`, `btn-secondary`, `btn-quiet`, `icon-btn`, `error-box`, `selection`, `question-card`, `question-modal`, `answer-option`, and result-state classes. Use Lucide icons at the established 16–22px control sizes and accessible text/labels rather than introducing another icon set.

Primary actions are coral, secondary actions are ink, and quiet actions use pale/white surfaces. Icon-only controls require an `aria-label`; disabled controls need visible and functional disabled states. Destructive actions use the existing red treatment and require confirmation when data loss is involved.

## Layout and responsiveness

- Pages sit within `max-w-6xl`, with `px-5 py-7` at the base size, then wider padding at `sm` and `lg`.
- Default layouts are single-column/mobile-first. Existing changes occur mainly at Tailwind `sm`, `md`, `lg`, and `xl` breakpoints.
- Cards use 1.5rem padding by default and 2rem from `sm`; page headings scale from 4xl to 6xl.
- Feature grids expand only when space supports them: dashboard at `md`, editor answers at `sm`, setup/game split at `lg`, and question cards from two to three/four columns.
- Preserve large touch targets, readable projector sizing, and useful layouts down to the body’s 320px minimum width. Avoid hover-only affordances.

## Motion and feedback

Framer Motion provides page transitions, button/card movement, the wheel, modal/result transitions, and confetti. Motion should clarify selection, reveal, progress, or celebration—not delay routine teacher actions. `prefers-reduced-motion: reduce` shortens CSS animation and transition durations globally; new motion must remain understandable with reduced motion enabled.

Answer feedback combines color, icons, text, explanation, and optional audio so meaning does not depend on color or sound alone. Preserve the encouraging copy style for both correct and incorrect answers.

## Interaction hierarchy

- Give each screen one obvious primary action; gameplay actions should visually dominate setup and administrative controls.
- Keep teacher interactions short and use human-readable validation or recovery messages with a clear next action.
- Confirm destructive data changes. Do not rely on color or sound alone for status.
- Check the affected flow at a narrow phone/tablet width and a wide laptop/projector width.

Accessibility requirements and the current implementation gaps are tracked separately in `ACCESSIBILITY.md`.
