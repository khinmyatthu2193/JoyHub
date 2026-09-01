export type Question = {
  id: string
  question: string
  options: [string, string, string, string]
  correctAnswer: number
  explanation: string
}

export type Quiz = {
  id: string
  title: string
  description?: string
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export type WheelStudent = {
  id: string
  name: string
  color: string
  icon: string
}

export type WinnerPolicy = 'unlimited' | 'remove' | 'limit'

export type ClassSettings = {
  studentCount: number
  students: WheelStudent[]
  winnerPolicy: WinnerPolicy
  maxWins: number
}

export type GameState = {
  quizId: string
  studentCount: number
  students: WheelStudent[]
  currentStudentId: string | null
  winnerPolicy: WinnerPolicy
  maxWins: number
  winCounts: Record<string, number>
  completedQuestionIds: string[]
}
