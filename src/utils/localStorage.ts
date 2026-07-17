import type { GameState, Quiz } from '../types/quiz'

const keys = {
  quizzes: 'joyhub_quizzes_v1',
  settings: 'joyhub_settings_v1',
  game: 'joyhub_game_state_v1',
} as const

const createdAt = '2026-07-17T00:00:00.000Z'
const starterQuiz: Quiz = {
  id: 'starter-free-time',
  title: 'Free Time Activities & Prepositions',
  description: 'English grammar practice',
  createdAt,
  updatedAt: createdAt,
  questions: [{
    id: 'starter-question-1',
    question: 'I ____ football every Sunday.',
    options: ['go', 'do', 'play', 'make'],
    correctAnswer: 2,
    explanation: 'We use “play” with sports and games.',
  }],
}

const read = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

const write = <T>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value))

export const storage = {
  getQuizzes: () => read<Quiz[]>(keys.quizzes, [starterQuiz]),
  saveQuizzes: (quizzes: Quiz[]) => write(keys.quizzes, quizzes),
  getStudentCount: () => read(keys.settings, { studentCount: 30 }).studentCount,
  saveStudentCount: (studentCount: number) => write(keys.settings, { studentCount }),
  getGame: () => read<GameState | null>(keys.game, null),
  saveGame: (game: GameState) => write(keys.game, game),
  clearGame: () => localStorage.removeItem(keys.game),
}
