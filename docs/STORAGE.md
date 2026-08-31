# Browser Storage

`src/utils/localStorage.ts` is the only persistence facade. Values are JSON in the current browser origin; there is no server copy or cross-device recovery.

## Keys and lifecycle

| Key | Stored value | Read | Written | Cleared |
| --- | --- | --- | --- | --- |
| `joyhub_quizzes_v1` | `Quiz[]` | App initialization | Successful quiz create/edit; confirmed quiz deletion | Never by the application |
| `joyhub_settings_v1` | `{ studentCount: number }` | App initialization | Starting a game after clamping to 1–100 | Never by the application |
| `joyhub_game_state_v1` | `GameState` | View, selection, and game initialization | Start, completed spin, submitted answer, restart | End-game/dashboard action |

If the quiz key is absent or unreadable, `getQuizzes()` returns the built-in starter quiz. If settings are absent or unreadable, the default student count is 30. If game state is absent or unreadable, it returns `null`.

## Shapes

The canonical TypeScript declarations are in `src/types/quiz.ts`:

```ts
type Question = {
  id: string
  question: string
  options: [string, string, string, string]
  correctAnswer: number
  explanation: string
}

type Quiz = {
  id: string
  title: string
  description?: string
  questions: Question[]
  createdAt: string
  updatedAt: string
}

type GameState = {
  quizId: string
  studentCount: number
  currentStudent: number | null
  completedQuestionIds: string[]
}
```

## Current safety behavior

Reads catch `localStorage.getItem` and JSON parsing failures and return the key’s fallback. Parsed JSON is asserted as the requested TypeScript type; runtime fields, ranges, IDs, and schema versions are not validated. Writes call `localStorage.setItem` directly and do not catch quota, privacy-mode, or other write failures.

The `_v1` suffix versions key names, but there is no migration layer. A future shape change must either preserve compatibility, validate and migrate old values, or deliberately introduce a new key version.

## Known risks and recovery limits

- A saved game may reference a deleted or missing quiz. The game view then shows “No active game,” but the stale game record remains until the user starts or ends a game.
- Structurally valid JSON with invalid fields is accepted. An invalid stored student count, answer index, or question ID can reach application logic.
- Quiz deletion does not check whether the quiz belongs to the active game.
- Completed question IDs are not reconciled with edited/deleted questions.
- Browser/site-data clearing permanently removes user-created quizzes and progress. There is no import/export or backup.
- When a malformed quiz payload falls back to the starter quiz, the malformed stored value is not repaired automatically.
- Storage write failures are not surfaced to the teacher, so “saved automatically” can be inaccurate in those cases.

These are audit findings, not implemented behavior. Treat validation, migrations, backup/export, and write-error UI as future improvements unless a task explicitly requests them.
