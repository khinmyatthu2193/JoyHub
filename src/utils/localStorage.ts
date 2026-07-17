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
  questions: [
    { id: 'starter-question-1', question: 'I ____ football every Sunday.', options: ['go', 'do', 'play', 'make'], correctAnswer: 2, explanation: 'We use “play” with sports and games.' },
    { id: 'starter-question-2', question: 'She is interested ____ photography.', options: ['at', 'in', 'on', 'for'], correctAnswer: 1, explanation: 'The adjective “interested” is followed by the preposition “in”.' },
    { id: 'starter-question-3', question: 'We usually go swimming ____ the weekend.', options: ['at', 'in', 'from', 'by'], correctAnswer: 0, explanation: 'We commonly use “at the weekend” when talking about weekend activities.' },
    { id: 'starter-question-4', question: 'My brother enjoys ____ comic books.', options: ['read', 'reads', 'reading', 'to reading'], correctAnswer: 2, explanation: 'The verb “enjoy” is followed by a verb ending in -ing.' },
    { id: 'starter-question-5', question: 'They ____ hiking twice a month.', options: ['go', 'play', 'do', 'make'], correctAnswer: 0, explanation: 'We use “go” with activities ending in -ing, such as hiking and swimming.' },
    { id: 'starter-question-6', question: 'The art club meets ____ Friday afternoons.', options: ['at', 'in', 'on', 'for'], correctAnswer: 2, explanation: 'We use “on” with days of the week and specific day periods.' },
    { id: 'starter-question-7', question: 'Tom is very good ____ playing chess.', options: ['at', 'in', 'with', 'to'], correctAnswer: 0, explanation: 'We use “good at” to describe someone’s skill in an activity.' },
    { id: 'starter-question-8', question: 'I listen ____ music when I do my homework.', options: ['at', 'on', 'to', 'with'], correctAnswer: 2, explanation: 'The verb “listen” is followed by the preposition “to”.' },
    { id: 'starter-question-9', question: 'Mia ____ yoga every morning before school.', options: ['plays', 'goes', 'does', 'makes'], correctAnswer: 2, explanation: 'We use “do” with activities such as yoga, exercise, and martial arts.' },
    { id: 'starter-question-10', question: 'Our movie starts ____ seven o’clock.', options: ['at', 'in', 'on', 'from'], correctAnswer: 0, explanation: 'We use “at” before a specific clock time.' },
  ],
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
