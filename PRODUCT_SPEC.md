# JoyHub MVP Product Specification

## Product

JoyHub is an interactive classroom engagement platform with the tagline: **Teach with Joy. Learn with Confidence.**

The MVP lets a teacher create quizzes, configure numbered students, randomly select a student, reveal hidden question cards, record an answer, and celebrate classroom progress.

## Required flow

1. A teacher creates or selects a quiz.
2. The teacher configures the number of students.
3. JoyHub starts or resumes a classroom game.
4. The teacher spins to select a numbered student.
5. The student chooses an unused hidden card.
6. The teacher records the selected answer.
7. JoyHub provides encouraging feedback.
8. The class repeats until every card is complete.

## Data model

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
```

Persist quizzes, settings, and active game progress under versioned `joyhub_*` local-storage keys.

## Experience principles

- Warm, encouraging, and playful without looking childish.
- Large controls and type suitable for a classroom projector.
- Clear state changes and forgiving teacher interactions.
- Responsive for tablet, laptop, and projector displays.
- Respect reduced-motion preferences.

## Technical direction

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Local storage only

## Explicitly out of scope

Authentication, backend services, databases, AI generation, student accounts, analytics, leaderboards, and cloud sync.

