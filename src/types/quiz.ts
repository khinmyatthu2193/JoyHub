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

export type GameState = {
  quizId: string
  studentCount: number
  currentStudent: number | null
  completedQuestionIds: string[]
}

