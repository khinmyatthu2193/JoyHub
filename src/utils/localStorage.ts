import type { ClassSettings, GameState, Quiz, WheelStudent, WinnerPolicy } from '../types/quiz'

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

export type StorageNotice = 'quizzes-recovered' | 'settings-recovered' | 'session-recovered'
const notices = new Set<StorageNotice>()
const report = (notice: StorageNotice) => notices.add(notice)
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const read = <T>(key: string, fallback: T, notice: StorageNotice): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    report(notice)
    return fallback
  }
}

const write = <T>(key: string, value: T) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}

const wheelColors = ['#ff8277', '#ffd86f', '#65c6a3', '#75b9e6', '#a98bdd', '#ffad68']
const makeStudents = (count: number): WheelStudent[] => Array.from({ length: count }, (_, index) => ({
  id: `student-${index + 1}`,
  name: `Student ${index + 1}`,
  color: wheelColors[index % wheelColors.length],
  icon: '',
}))

const normalizePolicy = (value: unknown): WinnerPolicy => value === 'remove' || value === 'limit' ? value : 'unlimited'
const normalizeSettings = (value: unknown, reportInvalid = false): ClassSettings => {
  const source = isRecord(value) ? value : {}
  if (reportInvalid && value !== undefined && !isRecord(value)) report('settings-recovered')
  if (reportInvalid && isRecord(value)) {
    const count = Number(source.studentCount)
    const maxWins = Number(source.maxWins)
    if (source.studentCount !== undefined && (!Number.isFinite(count) || count < 1 || count > 100)) report('settings-recovered')
    if (source.students !== undefined && !Array.isArray(source.students)) report('settings-recovered')
    if (source.winnerPolicy !== undefined && !['unlimited', 'remove', 'limit'].includes(String(source.winnerPolicy))) report('settings-recovered')
    if (source.maxWins !== undefined && (!Number.isFinite(maxWins) || maxWins < 2 || maxWins > 100)) report('settings-recovered')
  }
  const studentCount = Math.max(1, Math.min(100, Number(source.studentCount) || 30))
  const generated = makeStudents(studentCount)
  const savedStudents = Array.isArray(source.students) ? source.students : []
  const students = generated.map((fallback, index) => {
    const saved = savedStudents[index]
    if (!isRecord(saved)) return fallback
    return {
      id: typeof saved.id === 'string' && saved.id ? saved.id : fallback.id,
      name: typeof saved.name === 'string' && saved.name.trim() ? saved.name.trim() : fallback.name,
      color: typeof saved.color === 'string' && /^#[0-9a-f]{6}$/i.test(saved.color) ? saved.color : fallback.color,
      icon: typeof saved.icon === 'string' ? saved.icon : '',
    }
  })
  return { studentCount, students, winnerPolicy: normalizePolicy(source.winnerPolicy), maxWins: Math.max(2, Math.min(100, Number(source.maxWins) || 2)) }
}

const normalizeGame = (value: unknown): GameState | null => {
  if (value === null || value === undefined) return null
  if (!isRecord(value) || typeof value.quizId !== 'string' || !value.quizId) { report('session-recovered'); return null }
  const settings = normalizeSettings(value)
  if (value.students !== undefined && !Array.isArray(value.students)) report('session-recovered')
  if (value.winCounts !== undefined && !isRecord(value.winCounts)) report('session-recovered')
  if (value.completedQuestionIds !== undefined && (!Array.isArray(value.completedQuestionIds) || value.completedQuestionIds.some(item => typeof item !== 'string'))) report('session-recovered')
  const legacyStudent = Number(value.currentStudent)
  const legacyCurrentId = legacyStudent ? settings.students[legacyStudent - 1]?.id ?? null : null
  const currentStudentId = typeof value.currentStudentId === 'string' ? value.currentStudentId : legacyCurrentId
  const savedWinCounts = isRecord(value.winCounts) ? value.winCounts : {}
  const winCounts = Object.fromEntries(settings.students.map(student => [student.id, Math.max(0, Number(savedWinCounts[student.id]) || 0)]))
  return {
    quizId: value.quizId,
    studentCount: settings.studentCount,
    students: settings.students,
    currentStudentId: currentStudentId && settings.students.some(student => student.id === currentStudentId) ? currentStudentId : null,
    winnerPolicy: settings.winnerPolicy,
    maxWins: settings.maxWins,
    winCounts,
    completedQuestionIds: Array.isArray(value.completedQuestionIds) ? value.completedQuestionIds.filter((item): item is string => typeof item === 'string') : [],
  }
}

const isQuestion = (value: unknown) => isRecord(value) && typeof value.id === 'string' && typeof value.question === 'string' && Array.isArray(value.options) && value.options.length === 4 && value.options.every(option => typeof option === 'string') && typeof value.correctAnswer === 'number' && Number.isInteger(value.correctAnswer) && value.correctAnswer >= 0 && value.correctAnswer < 4 && typeof value.explanation === 'string'
const isQuiz = (value: unknown): value is Quiz => isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' && Array.isArray(value.questions) && value.questions.every(isQuestion) && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string'

export const storage = {
  getQuizzes: () => {
    const value = read<unknown>(keys.quizzes, [starterQuiz], 'quizzes-recovered')
    if (!Array.isArray(value)) { report('quizzes-recovered'); return [starterQuiz] }
    const valid = value.filter(isQuiz)
    if (valid.length !== value.length) report('quizzes-recovered')
    return valid
  },
  saveQuizzes: (quizzes: Quiz[]) => write(keys.quizzes, quizzes),
  getClassSettings: () => normalizeSettings(read<unknown>(keys.settings, { studentCount: 30 }, 'settings-recovered'), true),
  saveClassSettings: (settings: ClassSettings) => write(keys.settings, settings),
  getGame: () => normalizeGame(read<unknown>(keys.game, null, 'session-recovered')),
  saveGame: (game: GameState) => write(keys.game, game),
  clearGame: () => { try { localStorage.removeItem(keys.game); return true } catch { return false } },
  takeNotices: () => { const value = [...notices]; notices.clear(); return value },
}
