# Browser Storage

`src/utils/localStorage.ts` is the only persistence facade. Values are JSON in the current browser origin; there is no server copy or cross-device recovery.

## Keys and lifecycle

| Key | Stored value | Read | Written | Cleared |
| --- | --- | --- | --- | --- |
| `joyhub_quizzes_v1` | `Quiz[]` | App initialization | Successful quiz create/edit; confirmed quiz deletion | Never by the application |
| `joyhub_settings_v1` | `ClassSettings` | App initialization | Starting a game after validating wheel setup | Never by the application |
| `joyhub_game_state_v1` | `GameState` | Application initialization | Start, completed spin, submitted answer, wheel reset, restart | Confirmed end game, recovery from a missing quiz, deletion of the active quiz |

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
  students: WheelStudent[]
  currentStudentId: string | null
  winnerPolicy: 'unlimited' | 'remove' | 'limit'
  maxWins: number
  winCounts: Record<string, number>
  completedQuestionIds: string[]
}
```

## Current safety behavior

Reads catch `localStorage.getItem` and JSON parsing failures and return the key’s fallback. Quiz records and questions receive basic runtime shape validation; invalid records are omitted. Settings and game state are normalized to safe ranges and valid student references, and an invalid game without a quiz ID is discarded. The application shows a teacher-facing recovery notice when malformed or invalid saved data is detected.

Writes and clears catch detectable `localStorage` failures and return a result to the application. The in-memory action still completes, while JoyHub warns that it may be lost after refresh.

The `_v1` suffix versions key names. Settings and games saved before customizable wheels are normalized on read into numbered student entries with the unlimited-repeat policy, preserving active quiz progress.

## Known risks and recovery limits

- A saved game that references a missing quiz opens a recovery state. Choosing another activity clears the stale session; deleting the active quiz also clears its session after confirmation.
- Validation is intentionally shallow and does not migrate future schemas. Unknown extra fields are ignored, and invalid quiz records are omitted rather than repaired.
- Completed question IDs remain stored as recorded, but progress and completion counts only use IDs that still exist in the current quiz.
- Browser/site-data clearing permanently removes user-created quizzes and progress. There is no import/export or backup.
- When a malformed quiz payload falls back to the starter quiz, the malformed stored value is not repaired automatically.
- A write failure can leave the current in-memory view ahead of persisted data. JoyHub warns the teacher, but cannot recover storage capacity or browser permissions automatically.

Storage key names and persisted shapes remain version 1. There is still no migration framework, backup/export, or cross-device recovery.
