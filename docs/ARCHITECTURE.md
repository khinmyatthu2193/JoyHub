# Architecture

This document summarizes the current structure; the source files remain authoritative when the implementation changes.

## Runtime shape

JoyHub is a Vite-served React single-page application. `src/main.tsx` mounts `App` inside React `StrictMode`. There is no URL router: `App` owns a `View` union and conditionally renders dashboard, quiz library, quiz editor, class setup, or game views inside the shared `Shell`.

All feature components currently live in `src/App.tsx`. They are local implementation boundaries rather than independently routed pages:

- `Shell` and `PageHeader` provide shared page framing.
- `Dashboard`, `QuizList`, `QuizEditor`, and `ClassSetup` implement teacher setup flows.
- `GameLobby` coordinates the student wheel, hidden cards, answer/result modal, persistence, sound, and completion actions.
- `NumberWheel` and `Confetti` render game visuals.

## State and data flow

`App` is the state owner for the current view, quizzes, quiz draft, selected quiz, student count, active game, and validation messages. It passes values and callbacks down to feature components. `GameLobby` owns transient presentation state such as wheel rotation, spinning, the open question, shuffled option order, and the selected answer.

Persisted types are defined in `src/types/quiz.ts`:

- `Question` uses a four-item tuple for options and stores the correct option as its original zero-based index.
- `Quiz` owns question content and ISO timestamp strings.
- `GameState` references a quiz by ID and stores the class size, current student, and completed question IDs.

The `storage` facade in `src/utils/localStorage.ts` is the persistence boundary. See `STORAGE.md` for keys, lifecycle, recovery behavior, and compatibility risks. See `GAME_FLOW.md` for persistent versus transient game state and transitions.

## Source conventions

The current code uses named function components, PascalCase for components and types, camelCase for helpers and values, single quotes, no semicolons, immutable state updates, and `import type` for type-only imports. Follow the surrounding file when a convention is not listed here. Keep domain types in `src/types/quiz.ts` and browser persistence behind the `storage` facade.

## Other browser integrations

`src/utils/sounds.ts` lazily creates a Web Audio context, synthesizes wheel/correct/completion sounds, and uses the browser Speech Synthesis API for spoken feedback. These APIs are invoked from user-driven game flows; preserve graceful behavior where speech synthesis is unavailable.

## Styling and assets

Tailwind scans `index.html` and `src/**/*.{js,ts,jsx,tsx}`. `src/index.css` combines Tailwind layers, a small set of semantic component classes, project color helpers, and custom CSS for the wheel, modals, background blobs, and reduced motion. `src/assets/joyhub-logo.png` is imported through Vite and reused in the shell and SVG wheel.

## Deliberately absent layers

There is no backend, API client, authentication, server state, global state library, route configuration, database, service worker, or deployment-provider configuration.
