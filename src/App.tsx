import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, BookOpen, Check, CircleHelp, Pencil, Play, Plus, RotateCcw, RotateCw, Trash2, Trophy, Users, X } from 'lucide-react'
import type { ClassSettings, GameState, Question, Quiz, WheelStudent } from './types/quiz'
import { storage } from './utils/localStorage'
import { playCorrectChime, playCorrectVoice, playIncorrectVoice, playQuizCelebration, playWheelSpin } from './utils/sounds'
import joyHubLogo from './assets/joyhub-logo.png'

type View = 'dashboard' | 'quizzes' | 'editor' | 'setup' | 'game'
type QuizDraft = Pick<Quiz, 'id' | 'title' | 'description' | 'questions' | 'createdAt'>
type Confirmation = { title: string; message: string; confirmLabel: string; cancelLabel?: string; onConfirm: () => void }

const id = () => crypto.randomUUID()
const emptyQuestion = (): Question => ({ id: id(), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' })
const emptyQuiz = (): QuizDraft => ({ id: id(), title: '', description: '', questions: [emptyQuestion()], createdAt: new Date().toISOString() })
const shuffledOptionIndexes = (length: number) => {
  const indexes = Array.from({ length }, (_, index) => index)
  for (let index = indexes.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]]
  }
  return indexes
}

const wheelColors = ['#ff8277', '#ffd86f', '#65c6a3', '#75b9e6', '#a98bdd', '#ffad68']
const studentIcons = ['', '⭐', '🚀', '🎨', '⚽', '🎵', '🌱', '🧠']
const makeStudent = (index: number): WheelStudent => ({ id: `student-${index + 1}`, name: `Student ${index + 1}`, color: wheelColors[index % wheelColors.length], icon: '' })
const resizeStudents = (students: WheelStudent[], count: number) => Array.from({ length: count }, (_, index) => students[index] ?? makeStudent(index))
const isQuizUsable = (quiz?: Quiz) => Boolean(quiz?.questions.length)

const focusableSelector = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

function useHeadingFocus() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])
  return headingRef
}

function useDialogFocus(open: boolean, onClose: () => void, fallbackFocusRef: React.RefObject<HTMLElement | null>) {
  const dialogRef = useRef<HTMLElement>(null)
  const initialFocusRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const fallbackFocus = fallbackFocusRef.current
    initialFocusRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      if (!focusable.length) { event.preventDefault(); dialog.focus(); return }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
      if (event.shiftKey && currentIndex <= 0) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (currentIndex === -1 || currentIndex === focusable.length - 1)) { event.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const triggerIsDisabled = trigger instanceof HTMLButtonElement && trigger.disabled
      if (trigger?.isConnected && !triggerIsDisabled) trigger.focus()
      else fallbackFocus?.focus()
    }
  }, [fallbackFocusRef, open, onClose])

  return { dialogRef, initialFocusRef }
}

function ConfirmDialog({ confirmation, onCancel }: { confirmation: Confirmation; onCancel: () => void }) {
  const fallbackRef = useRef<HTMLElement>(null)
  const { dialogRef, initialFocusRef } = useDialogFocus(true, onCancel, fallbackRef)
  return <div className="modal-backdrop"><section ref={dialogRef} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message" className="w-full max-w-lg rounded-[2rem] bg-[#fffaf2] p-6 shadow-2xl outline-none sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-700"><AlertTriangle aria-hidden="true" /></span><h2 id="confirmation-title" className="mt-5 text-3xl font-black">{confirmation.title}</h2><p id="confirmation-message" className="mt-3 text-lg leading-7 text-ink/65">{confirmation.message}</p><div className="mt-7 flex flex-wrap justify-end gap-3"><button ref={initialFocusRef} className="btn-quiet" onClick={onCancel}>{confirmation.cancelLabel ?? 'Cancel'}</button><button className="btn-danger" onClick={confirmation.onConfirm}>{confirmation.confirmLabel}</button></div></section></div>
}

function Shell({ children, onHome, compact = false, notice, onDismissNotice }: { children: React.ReactNode; onHome: () => void; compact?: boolean; notice: string | null; onDismissNotice: () => void }) {
  return <MotionConfig reducedMotion="user"><main className={`min-h-screen overflow-hidden px-5 sm:px-10 lg:px-16 ${compact ? 'py-4 sm:py-5' : 'py-7'}`}>
    <div className="blob blob-one" /><div className="blob blob-two" />
    <button onClick={onHome} className="brand relative mx-auto flex max-w-6xl items-center text-2xl font-black text-ink" aria-label="JoyHub home">
      <img src={joyHubLogo} alt="" className={compact ? 'h-12 w-12 shrink-0 object-contain drop-shadow-md' : 'brand-logo'} /><span>Joy<span className="text-coral">Hub</span></span>
    </button>
    {notice && <div className="relative mx-auto mt-4 flex max-w-6xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-soft" role="alert"><AlertTriangle className="mt-0.5 shrink-0" size={20} aria-hidden="true" /><p className="flex-1 font-bold leading-6">{notice}</p><button className="icon-btn !h-8 !w-8 !bg-amber-100" onClick={onDismissNotice} aria-label="Dismiss message"><X size={17} /></button></div>}
    <AnimatePresence mode="wait"><motion.div key={(children as React.ReactElement).key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative mx-auto max-w-6xl">{children}</motion.div></AnimatePresence>
  </main></MotionConfig>
}

function PageHeader({ eyebrow, title, text, back }: { eyebrow: string; title: string; text: string; back?: () => void }) {
  const headingRef = useHeadingFocus()
  return <header className="pb-10 pt-12 sm:pt-16">
    {back && <button className="btn-quiet mb-7" onClick={back}><ArrowLeft size={18} /> Back</button>}
    <p className="eyebrow">{eyebrow}</p><h1 ref={headingRef} tabIndex={-1} className="page-title outline-none">{title}</h1><p className="mt-4 max-w-2xl text-lg text-ink/60">{text}</p>
  </header>
}

export function App() {
  const [initialData] = useState(() => {
    const quizzes = storage.getQuizzes()
    const classSettings = storage.getClassSettings()
    const game = storage.getGame()
    return { quizzes, classSettings, game, notices: storage.takeNotices() }
  })
  const initialNotice = initialData.notices.includes('session-recovered')
    ? 'We couldn’t restore this classroom session. Your quizzes are still available.'
    : initialData.notices.includes('quizzes-recovered')
      ? 'Some saved activities couldn’t be loaded. The activities still available are shown.'
      : initialData.notices.includes('settings-recovered')
        ? 'We restored the classroom setup with safe defaults. Please review it before starting.'
        : null
  const [view, setView] = useState<View>(initialData.game ? 'game' : 'dashboard')
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialData.quizzes)
  const [draft, setDraft] = useState<QuizDraft | null>(null)
  const [selectedQuizId, setSelectedQuizId] = useState(initialData.game?.quizId ?? '')
  const [classSettings, setClassSettings] = useState<ClassSettings>(initialData.classSettings)
  const [game, setGame] = useState<GameState | null>(initialData.game)
  const [errors, setErrors] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(initialNotice)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  const goHome = () => setView('dashboard')
  const warnSaveFailed = () => setNotice('We couldn’t save that change. It may be lost if this page is refreshed.')
  const saveQuizzes = (next: Quiz[]) => { setQuizzes(next); if (!storage.saveQuizzes(next)) warnSaveFailed() }
  const editQuiz = (quiz?: Quiz) => { setDraft(quiz ? structuredClone(quiz) : emptyQuiz()); setErrors([]); setView('editor') }
  const removeQuiz = (quizId: string) => {
    const quiz = quizzes.find(item => item.id === quizId)
    if (!quiz) return
    const endsSession = game?.quizId === quizId
    setConfirmation({
      title: `Delete “${quiz.title}”?`,
      message: `This quiz and all of its questions will be permanently deleted.${endsSession ? ' The saved classroom session using it will also end.' : ''}`,
      confirmLabel: 'Delete Quiz',
      onConfirm: () => {
        saveQuizzes(quizzes.filter(item => item.id !== quizId))
        if (endsSession) { if (!storage.clearGame()) warnSaveFailed(); setGame(null) }
      },
    })
  }
  const validateAndSave = () => {
    if (!draft) return
    const nextErrors: string[] = []
    if (!draft.title.trim()) nextErrors.push('Add a quiz title.')
    if (!draft.questions.length) nextErrors.push('Add at least one question.')
    draft.questions.forEach((q, i) => {
      if (!q.question.trim()) nextErrors.push(`Question ${i + 1} needs question text.`)
      if (q.options.some(option => !option.trim())) nextErrors.push(`Question ${i + 1} needs all four options.`)
      if (!q.explanation.trim()) nextErrors.push(`Question ${i + 1} needs an explanation.`)
    })
    setErrors(nextErrors)
    if (nextErrors.length) return
    const saved: Quiz = { ...draft, title: draft.title.trim(), description: draft.description?.trim(), updatedAt: new Date().toISOString() }
    const exists = quizzes.some(q => q.id === saved.id)
    saveQuizzes(exists ? quizzes.map(q => q.id === saved.id ? saved : q) : [...quizzes, saved])
    setView('quizzes')
  }
  const performStartGame = () => {
    const count = Math.max(1, Math.min(100, Number(classSettings.studentCount) || 1))
    const selectedQuiz = quizzes.find(quiz => quiz.id === selectedQuizId)
    if (!selectedQuiz) { setErrors(['Choose an activity to continue.']); return }
    if (!isQuizUsable(selectedQuiz)) { setErrors(['Add at least one question before starting this activity.']); return }
    const settings = { ...classSettings, studentCount: count, students: resizeStudents(classSettings.students, count) }
    const next: GameState = { ...settings, quizId: selectedQuizId, currentStudentId: null, winCounts: {}, completedQuestionIds: [] }
    setClassSettings(settings); if (!storage.saveClassSettings(settings)) warnSaveFailed(); setGame(next); if (!storage.saveGame(next)) warnSaveFailed(); setErrors([]); setView('game')
  }
  const startGame = () => {
    const selectedQuiz = quizzes.find(quiz => quiz.id === selectedQuizId)
    if (!selectedQuiz) { setErrors(['Choose an activity to continue.']); return }
    if (!isQuizUsable(selectedQuiz)) { setErrors(['Add at least one question before starting this activity.']); return }
    if (game) setConfirmation({ title: 'Start a new classroom activity?', message: 'The current classroom progress will be replaced. Your quizzes will stay available.', cancelLabel: 'Keep Current Activity', confirmLabel: 'Start New Activity', onConfirm: performStartGame })
    else performStartGame()
  }
  const prepareQuiz = (quizId: string) => { setSelectedQuizId(quizId); setErrors([]); setView('setup') }
  const clearSession = (nextView: View) => { if (!storage.clearGame()) warnSaveFailed(); setGame(null); setView(nextView) }
  const endGame = () => setConfirmation({ title: 'End this classroom game?', message: 'The saved classroom progress will be cleared. Your quizzes will stay available.', cancelLabel: 'Keep Playing', confirmLabel: 'End Game', onConfirm: () => clearSession('dashboard') })
  const recoverSession = () => clearSession('setup')
  const updateGame = (next: GameState) => { setGame(next); if (!storage.saveGame(next)) warnSaveFailed() }
  const restartGame = () => game && setConfirmation({ title: 'Restart this activity?', message: 'Completed questions and student win counts will be cleared so the class can begin again.', cancelLabel: 'Keep Progress', confirmLabel: 'Restart Activity', onConfirm: () => updateGame({ ...game, currentStudentId: null, winCounts: {}, completedQuestionIds: [] }) })
  const resetWheel = () => game && setConfirmation({ title: 'Reset the classroom wheel?', message: 'Student win counts will be cleared. Completed questions and quiz progress will stay saved.', cancelLabel: 'Keep Win Counts', confirmLabel: 'Reset Wheel', onConfirm: () => updateGame({ ...game, currentStudentId: null, winCounts: {} }) })
  const feedbackUnavailable = () => setNotice('Sound or spoken feedback isn’t available in this browser. The classroom game will continue normally.')

  return <><Shell onHome={goHome} compact={view === 'game'} notice={notice} onDismissNotice={() => setNotice(null)}>
    {view === 'dashboard' ? <Dashboard key="dashboard" quizCount={quizzes.length} game={game} activeQuiz={quizzes.find(q => q.id === game?.quizId)} onCreate={() => editQuiz()} onManage={() => setView('quizzes')} onStart={() => setView('setup')} onResume={() => setView('game')} /> :
      view === 'quizzes' ? <QuizList key="quizzes" quizzes={quizzes} onBack={goHome} onCreate={() => editQuiz()} onStart={prepareQuiz} onEdit={editQuiz} onDelete={removeQuiz} /> :
      view === 'editor' && draft ? <QuizEditor key="editor" draft={draft} setDraft={setDraft} errors={errors} onBack={() => setView('quizzes')} onSave={validateAndSave} /> :
      view === 'setup' ? <ClassSetup key="setup" quizzes={quizzes} selected={selectedQuizId} setSelected={setSelectedQuizId} settings={classSettings} setSettings={setClassSettings} errors={errors} onBack={goHome} onStart={startGame} onCreateQuiz={() => editQuiz()} onEditQuiz={editQuiz} /> :
      <GameLobby key="game" game={game} quiz={quizzes.find(q => q.id === game?.quizId)} onUpdate={updateGame} onEnd={endGame} onSetup={() => setView('setup')} onRecover={recoverSession} onRestart={restartGame} onResetWheel={resetWheel} onFeedbackUnavailable={feedbackUnavailable} />}
  </Shell>{confirmation && <ConfirmDialog confirmation={{ ...confirmation, onConfirm: () => { const action = confirmation.onConfirm; setConfirmation(null); action() } }} onCancel={() => setConfirmation(null)} />}</>
}

function Dashboard({ quizCount, game, activeQuiz, onCreate, onManage, onStart, onResume }: { quizCount: number; game: GameState | null; activeQuiz?: Quiz; onCreate: () => void; onManage: () => void; onStart: () => void; onResume: () => void }) {
  const headingRef = useHeadingFocus()
  const hasGame = Boolean(game)
  const completed = game?.completedQuestionIds.length ?? 0
  const total = activeQuiz?.questions.length ?? 0
  const progress = total ? Math.min(100, completed / total * 100) : 0
  const secondaryActions = [
    { title: 'Create quiz', text: 'Build a new activity', icon: Plus, color: 'bg-sun', action: onCreate },
    { title: 'Quiz library', text: `${quizCount} ${quizCount === 1 ? 'activity' : 'activities'} ready`, icon: BookOpen, color: 'bg-mint', action: onManage },
  ]
  return <section className="py-10 sm:py-14 lg:py-16"><div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
    <div><p className="eyebrow">Today’s classroom activity</p><h1 ref={headingRef} tabIndex={-1} className="max-w-3xl text-5xl font-black leading-[.98] tracking-tight text-ink outline-none sm:text-7xl">Teach with joy.<br /><span className="text-coral">Learn with confidence.</span> 🌱</h1><p className="mt-6 max-w-xl text-lg leading-8 text-ink/65">Bring the class together with a quick spin, a surprise question, and plenty of encouragement.</p></div>
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-[#263238] p-7 text-white shadow-2xl shadow-[#263238]/15 sm:p-9" aria-labelledby="classroom-launch-title">
      <span className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#ff8277]/90" aria-hidden="true" /><span className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-[#8ed9bd]/70" aria-hidden="true" />
      <div className="relative"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-coral text-white shadow-lg shadow-black/10"><Play fill="currentColor" aria-hidden="true" /></span><p className="mt-7 text-sm font-extrabold uppercase tracking-[.2em] text-white/60">{hasGame ? 'Saved classroom' : 'Ready when you are'}</p><h2 id="classroom-launch-title" className="mt-2 text-3xl font-black sm:text-4xl">{hasGame ? 'Continue Classroom' : 'Start Classroom Game'}</h2>
        {hasGame ? <div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-xl font-black">{activeQuiz?.title ?? 'Saved classroom activity'}</p><div className="mt-3 flex items-center justify-between gap-3 text-sm font-bold text-white/75"><span>{total ? `${completed} of ${total} questions complete` : `${completed} questions complete`}</span>{total > 0 && <span>{Math.round(progress)}%</span>}</div>{total > 0 && <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(completed, total)}><div className="h-full rounded-full bg-mint" style={{ width: `${progress}%` }} /></div>}</div> : <p className="mt-4 max-w-md text-lg leading-7 text-white/70">Choose a quiz, prepare the wheel, and start today’s classroom activity.</p>}
        <button className="btn-primary mt-7 w-full justify-center !bg-[#ff8277] !py-4 text-lg hover:!bg-[#ed675c]" onClick={hasGame ? onResume : onStart}><Play size={21} fill="currentColor" /> {hasGame ? 'Continue activity' : 'Choose an activity'}</button>
      </div>
    </motion.section>
  </div><div className="mt-8 border-t border-ink/10 pt-6"><p className="text-sm font-extrabold uppercase tracking-[.18em] text-ink/45">Prepare an activity</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{secondaryActions.map((action, index) => <motion.button key={action.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 + index * .06 }} whileHover={{ y: -3 }} onClick={action.action} className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/65 p-4 text-left shadow-soft backdrop-blur transition hover:bg-white"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${action.color}`}><action.icon size={20} aria-hidden="true" /></span><span><strong className="block text-lg font-black">{action.title}</strong><span className="text-sm font-bold text-ink/50">{action.text}</span></span><span className="ml-auto text-xl font-black text-coral" aria-hidden="true">→</span></motion.button>)}</div></div></section>
}

function QuizList({ quizzes, onBack, onCreate, onStart, onEdit, onDelete }: { quizzes: Quiz[]; onBack: () => void; onCreate: () => void; onStart: (id: string) => void; onEdit: (q: Quiz) => void; onDelete: (id: string) => void }) {
  return <><PageHeader eyebrow="Activity library" title="Choose today’s activity" text="Pick a quiz and get the classroom ready to play." back={onBack} />{quizzes.length > 0 ? <><div className="mb-6 flex justify-end"><button className="btn-secondary" onClick={onCreate}><Plus size={19} /> Create Quiz</button></div><div className="grid gap-5 md:grid-cols-2">{quizzes.map(q => { const usable = isQuizUsable(q); return <article className="card flex flex-col" key={q.id}><div><span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold text-ink ${usable ? 'bg-[#e7f6f0]' : 'bg-amber-100'}`}>{usable ? `${q.questions.length} ${q.questions.length === 1 ? 'question' : 'questions'}` : 'Needs questions'}</span><h2 className="mt-6 text-2xl font-black">{q.title}</h2><p className="mt-2 min-h-12 leading-6 text-ink/60">{usable ? q.description || 'A classroom activity ready to play.' : 'Add at least one question before starting this classroom activity.'}</p></div><div className="mt-7 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-5"><button className="btn-primary flex-1 justify-center" onClick={() => usable ? onStart(q.id) : onEdit(q)}>{usable ? <><Play size={18} fill="currentColor" /> Start Activity</> : <><Plus size={18} /> Add Questions</>}</button><button className="btn-quiet" onClick={() => onEdit(q)}><Pencil size={17} /> Edit</button><button className="icon-btn danger" aria-label={`Delete ${q.title}`} onClick={() => onDelete(q.id)}><Trash2 size={18} /></button></div></article> })}</div></> : <section className="card mx-auto max-w-2xl py-12 text-center sm:py-16"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-mint"><BookOpen size={28} aria-hidden="true" /></span><p className="eyebrow mt-7 !mb-2">Your activity library is empty</p><h2 className="text-3xl font-black sm:text-4xl">Create your first classroom activity.</h2><p className="mx-auto mt-4 max-w-lg text-lg leading-7 text-ink/60">A quiz gives students questions to choose and answer during the classroom game. Create one now, then it will be ready to start from this library.</p><button className="btn-primary mt-7" onClick={onCreate}><Plus size={19} /> Create Quiz</button></section>}</>
}

function QuizEditor({ draft, setDraft, errors, onBack, onSave }: { draft: QuizDraft; setDraft: (q: QuizDraft) => void; errors: string[]; onBack: () => void; onSave: () => void }) {
  const updateQuestion = (index: number, next: Question) => setDraft({ ...draft, questions: draft.questions.map((q, i) => i === index ? next : q) })
  const move = (index: number, direction: -1 | 1) => { const questions = [...draft.questions]; const target = index + direction; if (target < 0 || target >= questions.length) return; [questions[index], questions[target]] = [questions[target], questions[index]]; setDraft({ ...draft, questions }) }
  const errorId = errors.length ? 'quiz-errors' : undefined
  const required = <><span aria-hidden="true" className="text-coral"> *</span><span className="sr-only"> required</span></>

  return <><PageHeader eyebrow="Quiz builder" title={draft.title || 'Create a quiz'} text="Add four choices, select the right answer, and give students a helpful explanation." back={onBack} /><div className="space-y-6 pb-20">
    <section className="card">
      <label className="label" htmlFor="quiz-title">Quiz title{required}</label><input id="quiz-title" className="input" required aria-invalid={errors.includes('Add a quiz title.')} aria-describedby={errors.includes('Add a quiz title.') ? errorId : undefined} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Space Explorers" />
      <label className="label mt-5" htmlFor="quiz-description">Description <span className="font-normal text-ink/40">(optional)</span></label><textarea id="quiz-description" className="input min-h-24" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="What will your class practice?" />
    </section>
    {draft.questions.map((q, index) => {
      const questionInvalid = errors.includes(`Question ${index + 1} needs question text.`)
      const optionsInvalid = errors.includes(`Question ${index + 1} needs all four options.`)
      const explanationInvalid = errors.includes(`Question ${index + 1} needs an explanation.`)
      return <section className="card" key={q.id}><div className="flex items-center justify-between"><h2 className="text-xl font-black">Question {index + 1}</h2><div className="flex gap-2"><button className="icon-btn" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move question ${index + 1} up`}><ArrowUp size={18} /></button><button className="icon-btn" disabled={index === draft.questions.length - 1} onClick={() => move(index, 1)} aria-label={`Move question ${index + 1} down`}><ArrowDown size={18} /></button><button className="icon-btn danger" disabled={draft.questions.length === 1} onClick={() => setDraft({ ...draft, questions: draft.questions.filter(item => item.id !== q.id) })} aria-label={`Delete question ${index + 1}`}><Trash2 size={18} /></button></div></div>
        <label className="label mt-5" htmlFor={`question-${q.id}`}>Question text{required}</label><input id={`question-${q.id}`} className="input" required aria-invalid={questionInvalid} aria-describedby={questionInvalid ? errorId : undefined} value={q.question} onChange={e => updateQuestion(index, { ...q, question: e.target.value })} />
        <fieldset className="mt-5"><legend className="label">Answer options{required}</legend><div className="mt-2 grid gap-4 sm:grid-cols-2">{q.options.map((option, optionIndex) => { const letter = String.fromCharCode(65 + optionIndex); return <div key={optionIndex}><span className="flex items-center gap-2 font-extrabold"><input id={`correct-${q.id}-${optionIndex}`} type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === optionIndex} onChange={() => updateQuestion(index, { ...q, correctAnswer: optionIndex })} /><label htmlFor={`correct-${q.id}-${optionIndex}`}>Option {letter} is correct {q.correctAnswer === optionIndex && <span className="text-xs text-coral">Selected</span>}</label></span><label className="sr-only" htmlFor={`option-${q.id}-${optionIndex}`}>Option {letter} text</label><input id={`option-${q.id}-${optionIndex}`} className="input" required aria-invalid={optionsInvalid && !option.trim()} aria-describedby={optionsInvalid && !option.trim() ? errorId : undefined} value={option} onChange={e => { const options = [...q.options] as Question['options']; options[optionIndex] = e.target.value; updateQuestion(index, { ...q, options }) }} /></div> })}</div></fieldset>
        <label className="label mt-5" htmlFor={`explanation-${q.id}`}>Explanation{required}</label><textarea id={`explanation-${q.id}`} className="input min-h-20" required aria-invalid={explanationInvalid} aria-describedby={explanationInvalid ? errorId : undefined} value={q.explanation} onChange={e => updateQuestion(index, { ...q, explanation: e.target.value })} />
      </section>
    })}
    <button className="btn-secondary w-full justify-center" onClick={() => setDraft({ ...draft, questions: [...draft.questions, emptyQuestion()] })}><Plus size={19} /> Add question</button>
    {errors.length > 0 && <div id="quiz-errors" className="error-box" role="alert"><strong>Please check your quiz:</strong><ul className="mt-2 list-disc pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
    <div className="flex justify-end"><button className="btn-primary" onClick={onSave}><Check size={19} /> Save quiz</button></div>
  </div></>
}

function ClassSetup({ quizzes, selected, setSelected, settings, setSettings, errors, onBack, onStart, onCreateQuiz, onEditQuiz }: { quizzes: Quiz[]; selected: string; setSelected: (id: string) => void; settings: ClassSettings; setSettings: (settings: ClassSettings) => void; errors: string[]; onBack: () => void; onStart: () => void; onCreateQuiz: () => void; onEditQuiz: (quiz: Quiz) => void }) {
  const [showCustomization, setShowCustomization] = useState(false)
  const safeCount = Math.max(1, Math.min(100, Number(settings.studentCount) || 1))
  const students = useMemo(() => resizeStudents(settings.students, safeCount), [safeCount, settings.students])
  const selectedQuiz = quizzes.find(quiz => quiz.id === selected)
  const winnerSummary = settings.winnerPolicy === 'remove' ? 'Each student wins once' : settings.winnerPolicy === 'limit' ? `Up to ${settings.maxWins} wins each` : 'Winners stay on the wheel'
  const updateStudent = (index: number, patch: Partial<WheelStudent>) => setSettings({ ...settings, students: students.map((student, studentIndex) => studentIndex === index ? { ...student, ...patch } : student) })
  const changeCount = (studentCount: number) => {
    const count = Math.max(1, Math.min(100, Number(studentCount) || 1))
    setSettings({ ...settings, studentCount: count, students: resizeStudents(settings.students, count) })
  }
  const errorId = errors.length ? 'setup-error' : undefined
  return <><PageHeader eyebrow="Classroom setup" title="Prepare today’s activity" text="Choose an activity, set your class size, and you’re ready to play." back={onBack} />
    <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Classroom setup steps">{['Choose Activity', 'Prepare Class', 'Start Activity'].map((step, index) => <li key={step} className={`rounded-2xl px-3 py-3 text-center text-xs font-black sm:text-sm ${index < 2 ? 'bg-white/75 text-ink' : 'bg-[#fff1ef] text-coral'}`}><span className="mr-1" aria-hidden="true">{index + 1}.</span>{step}</li>)}</ol>
    <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_.85fr]"><section className="card"><div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sun font-black" aria-hidden="true">1</span><div><h2 id="quiz-selection-label" className="text-xl font-black">Choose Activity</h2><p className="text-sm font-bold text-ink/50">What will the class play today?</p></div></div><div className="mt-5 space-y-3" role="group" aria-labelledby="quiz-selection-label" aria-describedby={errorId}>{quizzes.map(q => <button key={q.id} type="button" aria-pressed={selected === q.id} onClick={() => setSelected(q.id)} className={`selection ${selected === q.id ? 'selected' : ''}`}><span><strong className="block text-lg">{q.title}</strong><span className="text-sm text-ink/55">{q.questions.length ? `${q.questions.length} questions` : 'Needs questions before play'}</span></span>{selected === q.id && <Check className="text-coral" aria-hidden="true" />}</button>)}</div>{quizzes.length === 0 && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"><strong className="block text-lg">You need a quiz before starting a classroom activity.</strong><p className="mt-2 text-ink/65">Create an activity with at least one question, then return here to prepare the class.</p><button className="btn-primary mt-4" onClick={onCreateQuiz}><Plus size={18} /> Create Quiz</button></div>}
      <div className="mt-8 border-t border-ink/10 pt-7"><div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint font-black" aria-hidden="true">2</span><div><label className="block text-xl font-black" htmlFor="student-count">Prepare Class</label><p className="text-sm font-bold text-ink/50">How many students are joining?</p></div></div><input id="student-count" className="input mt-5 max-w-40 text-2xl font-black" type="number" min="1" max="100" aria-describedby="student-count-help" value={settings.studentCount} onChange={e => changeCount(Number(e.target.value))} /><p id="student-count-help" className="mt-2 text-sm text-ink/50">Choose between 1 and 100 students.</p></div>
      <button type="button" className="btn-quiet mt-7 w-full justify-between border border-[#eee8dd] !bg-[#fffaf2] text-left" aria-expanded={showCustomization} aria-controls="wheel-customization" onClick={() => setShowCustomization(value => !value)}><span className="flex items-center gap-2"><Pencil size={17} /> Customize wheel <span className="font-bold text-ink/45">(optional)</span></span><span aria-hidden="true">{showCustomization ? '−' : '+'}</span></button>
    </section>
    <aside className="card lg:sticky lg:top-6"><p className="eyebrow !mb-2">Setup summary</p><h2 className="text-3xl font-black">{selectedQuiz ? isQuizUsable(selectedQuiz) ? 'Ready to start' : 'Add questions to continue' : 'Choose an activity'}</h2><div className="mt-6 space-y-3 rounded-2xl bg-[#fffaf2] p-5"><div className="flex items-start justify-between gap-4"><span className="text-sm font-bold text-ink/50">Activity</span><strong className="max-w-[70%] text-right">{selectedQuiz?.title ?? 'Not selected'}</strong></div><div className="flex items-center justify-between gap-4"><span className="text-sm font-bold text-ink/50">Class</span><strong>{safeCount} {safeCount === 1 ? 'student' : 'students'}</strong></div><div className="flex items-start justify-between gap-4"><span className="text-sm font-bold text-ink/50">Wheel</span><strong className="max-w-[70%] text-right">{winnerSummary}</strong></div></div>
      {errors.length > 0 && <div id="setup-error" className="error-box mt-5" role="alert">{errors[0]}</div>}{selectedQuiz && !isQuizUsable(selectedQuiz) ? <button className="btn-primary mt-6 w-full justify-center !py-4 text-lg" onClick={() => onEditQuiz(selectedQuiz)}><Plus size={20} /> Add Questions</button> : <button className="btn-primary mt-6 w-full justify-center !py-4 text-lg" disabled={!selectedQuiz} onClick={onStart}><Play size={20} fill="currentColor" /> Start Activity</button>}<p className="mt-3 text-center text-sm font-bold text-ink/45">{selectedQuiz && !isQuizUsable(selectedQuiz) ? 'This activity needs at least one question.' : 'You can use numbered students now and customize later.'}</p>
    </aside></div>
    {showCustomization && <motion.section id="wheel-customization" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mt-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f3eee4]"><Pencil size={19} aria-hidden="true" /></span><div><h2 className="text-xl font-black">Customize the wheel</h2><p className="text-sm font-bold text-ink/50">Optional names, colors, icons, and winner rules.</p></div></div>
      <div className="mt-7 grid gap-8 lg:grid-cols-[.75fr_1.25fr]"><div><fieldset><legend className="label">After a student wins</legend><div className="mt-3 space-y-2">{([['unlimited', 'Keep on wheel', 'Students can win countless times.'], ['remove', 'Remove after winning', 'Each student can win once.'], ['limit', 'Set a win limit', 'Allow two, three, or another limit.']] as const).map(([value, title, description]) => <label key={value} className={`selection cursor-pointer ${settings.winnerPolicy === value ? 'selected' : ''}`}><span><strong className="block">{title}</strong><span className="text-sm text-ink/55">{description}</span></span><input type="radio" name="winner-policy" value={value} checked={settings.winnerPolicy === value} onChange={() => setSettings({ ...settings, winnerPolicy: value })} /></label>)}</div></fieldset>{settings.winnerPolicy === 'limit' && <div className="mt-4"><label className="label" htmlFor="max-wins">Wins allowed per student</label><input id="max-wins" className="input max-w-32" type="number" min="2" max="100" value={settings.maxWins} onChange={e => setSettings({ ...settings, maxWins: Math.max(2, Math.min(100, Number(e.target.value) || 2)) })} /></div>}</div>
      <div><div className="flex items-center gap-3"><Users aria-hidden="true" /><div><h3 className="font-black">Student names and styles</h3><p className="text-sm text-ink/55">These appear on the classroom wheel.</p></div></div><div className="mt-4 max-h-[38rem] space-y-3 overflow-auto pr-2">{students.map((student, index) => <div key={student.id} className="grid grid-cols-[3.25rem_1fr] gap-3 rounded-2xl border border-[#eee8dd] bg-white p-3 sm:grid-cols-[3.25rem_1fr_5rem]"><input type="color" className="h-12 w-12 cursor-pointer rounded-xl border-0 bg-transparent p-0" value={student.color} onChange={e => updateStudent(index, { color: e.target.value })} aria-label={`Color for ${student.name}`} /><div><label className="sr-only" htmlFor={`student-name-${student.id}`}>Student {index + 1} name</label><input id={`student-name-${student.id}`} className="input !mt-0" value={student.name} maxLength={30} onChange={e => updateStudent(index, { name: e.target.value })} onBlur={() => !student.name.trim() && updateStudent(index, { name: `Student ${index + 1}` })} /></div><div className="col-start-2 sm:col-start-auto"><label className="sr-only" htmlFor={`student-icon-${student.id}`}>Icon for {student.name}</label><select id={`student-icon-${student.id}`} className="input !mt-0 text-xl" value={student.icon} onChange={e => updateStudent(index, { icon: e.target.value })}>{studentIcons.map(icon => <option key={icon || 'none'} value={icon}>{icon || 'None'}</option>)}</select></div></div>)}</div></div></div>
    </motion.section>}<div className="pb-16" /></>
}

function GameLobby({ game, quiz, onUpdate, onEnd, onSetup, onRecover, onRestart, onResetWheel, onFeedbackUnavailable }: { game: GameState | null; quiz?: Quiz; onUpdate: (game: GameState) => void; onEnd: () => void; onSetup: () => void; onRecover: () => void; onRestart: () => void; onResetWheel: () => void; onFeedbackUnavailable: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
  const [activeStudent, setActiveStudent] = useState<WheelStudent | null>(null)
  const [optionOrder, setOptionOrder] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const closeQuestion = useCallback(() => { setActiveQuestion(null); setActiveStudent(null); setSelectedAnswer(null) }, [])
  const spinButtonRef = useRef<HTMLButtonElement>(null)
  const { dialogRef, initialFocusRef } = useDialogFocus(Boolean(activeQuestion), closeQuestion, spinButtonRef)
  const resultActionRef = useRef<HTMLButtonElement>(null)
  const headingRef = useHeadingFocus()

  useEffect(() => {
    if (selectedAnswer !== null) resultActionRef.current?.focus()
  }, [selectedAnswer])

  if (!game || !quiz) return <section className="card mx-auto my-16 max-w-2xl py-12 text-center sm:py-16"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sun"><AlertTriangle size={28} aria-hidden="true" /></span><p className="eyebrow mt-7 !mb-2">Classroom recovery</p><h1 className="text-3xl font-black sm:text-4xl">{game ? 'We couldn’t restore this classroom session.' : 'No classroom session is active.'}</h1><p className="mx-auto mt-4 max-w-lg text-lg leading-7 text-ink/60">{game ? 'The activity used by this saved progress is no longer available. Your other quizzes are still available.' : 'Choose an activity and prepare the class to begin a new game.'}</p><button className="btn-primary mt-7" onClick={game ? onRecover : onSetup}><Play size={18} /> {game ? 'Choose Another Activity' : 'Set Up an Activity'}</button></section>
  if (!quiz.questions.length) return <section className="card mx-auto my-16 max-w-2xl py-12 text-center sm:py-16"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sun"><CircleHelp size={28} aria-hidden="true" /></span><p className="eyebrow mt-7 !mb-2">Activity unavailable</p><h1 className="text-3xl font-black sm:text-4xl">This activity needs a question.</h1><p className="mx-auto mt-4 max-w-lg text-lg leading-7 text-ink/60">Add a question or choose another activity before starting the classroom game.</p><button className="btn-primary mt-7" onClick={onRecover}><ArrowLeft size={18} /> Return to Setup</button></section>
  const currentStudent = game.students.find(student => student.id === game.currentStudentId)
  const eligibleStudents = game.students.filter(student => {
    const wins = game.winCounts[student.id] ?? 0
    if (game.winnerPolicy === 'remove') return wins < 1
    if (game.winnerPolicy === 'limit') return wins < game.maxWins
    return true
  })
  const spin = () => {
    if (isSpinning || currentStudent || !eligibleStudents.length) return
    const studentIndex = Math.floor(Math.random() * eligibleStudents.length)
    const student = eligibleStudents[studentIndex]
    const slice = 360 / eligibleStudents.length
    const target = -(studentIndex + .5) * slice
    const delta = 1440 + ((target - (rotation % 360) + 360) % 360)
    setIsSpinning(true)
    setRotation(value => value + delta)
    if (!playWheelSpin()) onFeedbackUnavailable()
    window.setTimeout(() => {
      onUpdate({ ...game, currentStudentId: student.id, winCounts: { ...game.winCounts, [student.id]: (game.winCounts[student.id] ?? 0) + 1 } })
      setIsSpinning(false)
    }, shouldReduceMotion ? 150 : 1700)
  }
  const chooseCard = (question: Question) => {
    if (!currentStudent || isSpinning || game.completedQuestionIds.includes(question.id)) return
    setSelectedAnswer(null)
    setOptionOrder(shuffledOptionIndexes(question.options.length))
    setActiveStudent(currentStudent)
    setActiveQuestion(question)
  }
  const answer = (option: number) => {
    if (!activeQuestion || selectedAnswer !== null) return
    setSelectedAnswer(option)
    const correct = option === activeQuestion.correctAnswer
    const finishingQuiz = quiz.questions.every(question => question.id === activeQuestion.id || game.completedQuestionIds.includes(question.id))
    const feedbackPlayed = correct ? [playCorrectChime(), playCorrectVoice()].every(Boolean) : playIncorrectVoice()
    if (!feedbackPlayed) onFeedbackUnavailable()
    if (finishingQuiz) window.setTimeout(() => { if (!playQuizCelebration()) onFeedbackUnavailable() }, 1200)
    onUpdate({ ...game, currentStudentId: null, completedQuestionIds: [...game.completedQuestionIds, activeQuestion.id] })
  }
  const isCorrect = activeQuestion && selectedAnswer === activeQuestion.correctAnswer
  const displayedCorrectAnswer = activeQuestion ? optionOrder.indexOf(activeQuestion.correctAnswer) : -1
  const complete = quiz.questions.every(question => game.completedQuestionIds.includes(question.id))
  const completedCount = quiz.questions.filter(question => game.completedQuestionIds.includes(question.id)).length

  if (complete && !activeQuestion) return <section className="card mx-auto my-12 max-w-3xl py-12 text-center sm:py-16"><span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-sun"><Trophy size={38} aria-hidden="true" /></span><p className="eyebrow mt-7 !mb-2">Activity complete</p><h1 ref={headingRef} tabIndex={-1} className="text-4xl font-black outline-none sm:text-5xl">Great work, everyone!</h1><p className="mx-auto mt-4 max-w-xl text-xl leading-8 text-ink/65">The class completed all {quiz.questions.length} questions in {quiz.title}.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button className="btn-primary" onClick={onRestart}><RotateCcw size={18} /> Restart Activity</button><button className="btn-quiet" onClick={onEnd}>End Game</button></div></section>

  return <><header className="pb-6 pt-5 sm:pb-8 sm:pt-6"><button className="btn-quiet mb-4" onClick={onSetup}><ArrowLeft size={18} aria-hidden="true" /> Back</button><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow !mb-2">Classroom game</p><h1 ref={headingRef} tabIndex={-1} className="text-3xl font-black tracking-tight text-ink outline-none sm:text-4xl lg:text-5xl">{quiz.title}</h1></div><div className="rounded-2xl bg-white/75 px-5 py-3 text-right shadow-soft"><strong className="block text-lg font-black">{game.completedQuestionIds.length} of {quiz.questions.length}</strong><span className="text-sm font-bold text-ink/55">questions complete · saved</span></div></div></header>
    <div className="grid gap-6 pb-12 lg:grid-cols-[.9fr_1.1fr] xl:grid-cols-[.95fr_1.05fr]">
      <section className="card text-center lg:sticky lg:top-6 lg:self-start">
        <p className="text-base font-extrabold uppercase tracking-[.18em] text-ink/55">Current student</p>
        <div className="relative mx-auto mt-5 h-72 w-72 max-w-full xl:h-80 xl:w-80">
          <motion.div animate={{ rotate: rotation }} transition={{ duration: shouldReduceMotion ? 0 : 1.7, ease: [0.12, 0.72, 0.18, 1] }} className="h-full w-full drop-shadow-xl">
            <StudentWheel students={eligibleStudents.length ? eligibleStudents : game.students} />
          </motion.div>
          <span className="wheel-pointer" />
        </div>
        <AnimatePresence mode="wait"><motion.div key={isSpinning ? 'spinning' : game.currentStudentId ?? 'none'} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 min-h-24">
          {isSpinning ? <p className="text-2xl font-black text-coral">Round and round…</p> : currentStudent ? <><p className="text-sm font-extrabold uppercase tracking-[.16em] text-ink/55">Student selected</p><p className="mt-1 break-words text-5xl font-black leading-none text-ink underline decoration-8 underline-offset-8 sm:text-6xl" style={{ textDecorationColor: currentStudent.color }}><span aria-hidden="true">{currentStudent.icon && `${currentStudent.icon} `}</span>{currentStudent.name}</p></> : <><p className="text-2xl font-black text-ink">Ready for the next round?</p><p className="mt-2 text-base font-bold text-ink/55">Spin to choose a student.</p></>}
        </motion.div></AnimatePresence>
        <p className="sr-only" aria-live="polite">{!isSpinning && currentStudent ? `${currentStudent.name} selected.` : ''}</p>
        <button ref={spinButtonRef} className="btn-primary mt-5 w-full justify-center !py-4 text-lg" onClick={spin} disabled={isSpinning || Boolean(currentStudent) || !eligibleStudents.length}><RotateCw className={isSpinning ? 'animate-spin' : ''} size={22} /> {isSpinning ? 'Spinning…' : currentStudent ? 'Choose a card to continue' : eligibleStudents.length ? completedCount ? 'Spin for the next student' : 'Spin the wheel' : 'Everyone reached the limit'}</button>
        {game.winnerPolicy !== 'unlimited' && (eligibleStudents.length ? <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#f7f2e9] px-4 py-3 text-left text-sm"><span><strong className="block">{eligibleStudents.length} eligible</strong><span className="text-ink/55">{game.winnerPolicy === 'remove' ? 'Winners leave the wheel' : `${game.maxWins} wins maximum`}</span></span><button className="btn-quiet !px-3 !py-2" disabled={Boolean(currentStudent)} onClick={onResetWheel}>Reset wheel</button></div> : <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left"><strong className="block text-lg">Everyone has reached the turn limit.</strong><p className="mt-1 text-sm leading-6 text-ink/60">Reset the wheel to make every student eligible again. Quiz progress will stay saved.</p><button className="btn-secondary mt-3 w-full justify-center" onClick={onResetWheel}><RotateCcw size={17} /> Reset Wheel</button></div>)}
        <details className="mt-5 rounded-2xl border border-ink/10 bg-white/45 text-left"><summary className="cursor-pointer px-4 py-3 text-center text-sm font-extrabold text-ink/50">Teacher controls</summary><div className="flex flex-wrap justify-center gap-2 border-t border-ink/10 p-3"><button className="btn-quiet text-sm text-red-600" onClick={onEnd}><X size={16} /> End game</button></div></details>
      </section>
      <section className={`card transition ${currentStudent ? '' : 'question-board-locked'}`} aria-labelledby="question-board-title" aria-describedby={!currentStudent ? 'question-board-instruction' : undefined}>
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow !mb-2">Question board</p><h2 id="question-board-title" className="text-3xl font-black leading-tight sm:text-4xl">{currentStudent ? `${currentStudent.name}, choose a question card.` : 'Spin the wheel to choose a student.'}</h2></div><span className="rounded-full bg-[#f7f2e9] px-4 py-2 text-base font-black">{quiz.questions.length - completedCount} remaining</span></div>
        {!currentStudent && <div id="question-board-instruction" className="mt-6 rounded-2xl border-2 border-dashed border-[#e6dcca] bg-[#fffaf2] p-6 text-center"><RotateCw className="mx-auto text-coral" size={28} aria-hidden="true" /><p className="mt-3 text-2xl font-black">Spin the wheel to choose a student.</p><p className="mt-2 text-base font-bold text-ink/60">Question cards unlock after the wheel stops.</p></div>}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{quiz.questions.map((question, index) => { const used = game.completedQuestionIds.includes(question.id); const locked = !currentStudent || isSpinning; return <motion.button layout key={question.id} whileHover={used || locked ? undefined : { y: -5, rotate: -1 }} whileTap={used || locked ? undefined : { scale: .96 }} disabled={used || locked} onClick={() => chooseCard(question)} className={`question-card ${used ? 'used' : locked ? 'locked' : ''}`}><span className="card-shine" />{used ? <><Check size={34} /><span className="text-base">Completed</span></> : <><CircleHelp size={34} /><span className="text-4xl sm:text-5xl">{index + 1}</span></>}</motion.button> })}</div>
      </section>
    </div>
    <AnimatePresence>{activeQuestion && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="question-title" aria-describedby="question-dialog-description" initial={{ opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .97 }} className={`question-modal outline-none ${selectedAnswer !== null ? 'result-modal' : ''}`}>
      <p id="question-dialog-description" className="sr-only">{selectedAnswer === null ? 'Choose one of four answer options. Press Escape to close.' : 'Answer feedback and explanation. Press Escape to close.'}</p>
      <AnimatePresence mode="wait" initial={false}>{selectedAnswer === null ? <motion.div key="question" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
        <div className="flex items-center justify-between"><span className="rounded-full bg-[#fff1ef] px-5 py-2 text-base font-black text-coral">{activeStudent ? `${activeStudent.icon} ${activeStudent.name}`.trim() : 'Selected student'}</span><button ref={initialFocusRef} className="icon-btn" onClick={closeQuestion} aria-label="Close question"><X /></button></div>
        <h2 id="question-title" className="mt-7 text-3xl font-black leading-tight sm:text-5xl">{activeQuestion.question}</h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">{optionOrder.map((originalIndex, displayIndex) => <button onClick={() => answer(originalIndex)} key={originalIndex} className="answer-option"><span>{String.fromCharCode(65 + displayIndex)}</span>{activeQuestion.options[originalIndex]}</button>)}</div>
      </motion.div> : <motion.div key="result" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} className={`result-stage ${isCorrect ? 'correct' : 'wrong'}`}>
        <p className="sr-only" role="status">{isCorrect ? 'Correct answer.' : `Incorrect answer. The correct answer is ${activeQuestion.options[activeQuestion.correctAnswer]}.`} {activeQuestion.explanation}{complete ? ' Quiz completed.' : ''}</p>
        {(isCorrect || complete) && <Confetti />}
        {complete && <motion.div initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="completion-badge"><Trophy size={22} /> Quiz completed! 🎉</motion.div>}
        <motion.div initial={{ scale: .65, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: .5 }} className={`result-icon ${isCorrect ? 'correct' : 'wrong'}`}>{isCorrect ? <Check size={54} strokeWidth={4} /> : <X size={54} strokeWidth={4} />}</motion.div>
        <div className="relative mt-2 text-2xl" aria-hidden="true">{isCorrect ? '✅ 🎉' : '❌ 🌱'}</div>
        <p className="relative mt-3 text-xs font-extrabold uppercase tracking-[.18em] text-ink/45">{isCorrect ? 'Correct answer' : 'Incorrect answer'}</p>
        <h2 id="question-title" className="relative mt-2 text-4xl font-black sm:text-5xl">{isCorrect ? 'Excellent! Great job!' : 'Good try! You’ve got this.'}</h2>
        {!isCorrect && <div className="result-answer"><span>{String.fromCharCode(65 + displayedCorrectAnswer)}</span><strong>{activeQuestion.options[activeQuestion.correctAnswer]}</strong></div>}
        <p className="relative mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8 text-ink/75 sm:text-xl">{activeQuestion.explanation}</p>
        {complete ? <div className="relative mt-5 border-t border-ink/10 pt-5"><p className="font-black">Great job, everyone! 👏 You completed the quiz.</p><div className="mt-4 flex flex-wrap justify-center gap-3"><button ref={resultActionRef} className="btn-secondary" onClick={() => { closeQuestion(); onRestart() }}><RotateCcw size={18} /> Restart Activity</button><button className="btn-quiet" onClick={onEnd}>End Game</button></div></div> : <button ref={resultActionRef} className="btn-primary relative mt-6" onClick={closeQuestion}><RotateCw size={18} /> Spin for the next student</button>}
      </motion.div>}</AnimatePresence>
    </motion.section></motion.div>}</AnimatePresence>
  </>
}

const point = (angle: number, radius: number) => {
  const radians = angle * Math.PI / 180
  return { x: 120 + radius * Math.cos(radians), y: 120 + radius * Math.sin(radians) }
}
function StudentWheel({ students }: { students: WheelStudent[] }) {
  const count = students.length
  const slice = 360 / count
  const fontSize = Math.max(4, Math.min(14, 150 / count))
  return <svg viewBox="0 0 240 240" className="number-wheel" role="img" aria-label={`Wheel with ${count} students: ${students.map(student => student.name).join(', ')}`}>
    <circle cx="120" cy="120" r="116" fill="#fff" />
    {count === 1 && <><circle cx="120" cy="120" r="108" fill={students[0].color} /><text x="120" y="43" textAnchor="middle" fontSize="16" fontWeight="900" fill="#263238">{students[0].icon || students[0].name.slice(0, 12)}</text></>}
    {count > 1 && students.map((student, index) => {
      const startAngle = -90 + index * slice
      const endAngle = startAngle + slice
      const start = point(startAngle, 108)
      const end = point(endAngle, 108)
      const label = point(startAngle + slice / 2, count > 36 ? 91 : 82)
      const largeArc = slice > 180 ? 1 : 0
      return <g key={index}>
        <path d={`M 120 120 L ${start.x} ${start.y} A 108 108 0 ${largeArc} 1 ${end.x} ${end.y} Z`} fill={student.color} stroke="rgba(255,255,255,.7)" strokeWidth={count > 40 ? .35 : 1} />
        <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize={student.icon ? Math.max(fontSize, 8) : fontSize} fontWeight="900" fill="#263238" transform={`rotate(${startAngle + slice / 2 + 90} ${label.x} ${label.y})`}>{student.icon || student.name.slice(0, count > 20 ? 3 : 10)}</text>
      </g>
    })}
    <circle cx="120" cy="120" r="31" fill="#fffaf2" stroke="#fff" strokeWidth="5" />
    <image href={joyHubLogo} x="94" y="94" width="52" height="52" />
  </svg>
}

const confettiColors = ['#ff8277', '#ffd86f', '#8ed9bd', '#75b9e6', '#a98bdd']
function Confetti() {
  const shouldReduceMotion = useReducedMotion()
  if (shouldReduceMotion) return null
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 42 }, (_, index) => <motion.i key={index} style={{ left: `${(index * 37) % 100}%`, background: confettiColors[index % confettiColors.length] }} initial={{ y: -60, rotate: 0, opacity: 1 }} animate={{ y: 420, rotate: 540 + index * 19, opacity: [1, 1, 0] }} transition={{ duration: 2.4 + (index % 5) * .22, delay: (index % 9) * .08, repeat: Infinity, repeatDelay: .6 }} />)}</div>
}
