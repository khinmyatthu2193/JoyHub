import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Check, CircleHelp, Pencil, Play, Plus, RotateCcw, RotateCw, Sparkles, Star, Trash2, Trophy, Users, Volume2, VolumeX, X } from 'lucide-react'
import type { GameState, Question, Quiz } from './types/quiz'
import { storage } from './utils/localStorage'
import { playCorrectChime, playQuizCelebration } from './utils/sounds'

type View = 'dashboard' | 'quizzes' | 'editor' | 'setup' | 'game'
type QuizDraft = Pick<Quiz, 'id' | 'title' | 'description' | 'questions' | 'createdAt'>

const id = () => crypto.randomUUID()
const emptyQuestion = (): Question => ({ id: id(), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' })
const emptyQuiz = (): QuizDraft => ({ id: id(), title: '', description: '', questions: [emptyQuestion()], createdAt: new Date().toISOString() })

function Shell({ children, onHome }: { children: React.ReactNode; onHome: () => void }) {
  return <main className="min-h-screen overflow-hidden px-5 py-7 sm:px-10 lg:px-16">
    <div className="blob blob-one" /><div className="blob blob-two" />
    <button onClick={onHome} className="relative mx-auto flex max-w-6xl items-center gap-3 text-xl font-black text-ink">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral text-white shadow-soft"><Sparkles /></span>JoyHub
    </button>
    <AnimatePresence mode="wait"><motion.div key={(children as React.ReactElement).key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative mx-auto max-w-6xl">{children}</motion.div></AnimatePresence>
  </main>
}

function PageHeader({ eyebrow, title, text, back }: { eyebrow: string; title: string; text: string; back?: () => void }) {
  return <header className="pb-10 pt-12 sm:pt-16">
    {back && <button className="btn-quiet mb-7" onClick={back}><ArrowLeft size={18} /> Back</button>}
    <p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="mt-4 max-w-2xl text-lg text-ink/60">{text}</p>
  </header>
}

export function App() {
  const [view, setView] = useState<View>(() => storage.getGame() ? 'game' : 'dashboard')
  const [quizzes, setQuizzes] = useState<Quiz[]>(storage.getQuizzes)
  const [draft, setDraft] = useState<QuizDraft | null>(null)
  const [selectedQuizId, setSelectedQuizId] = useState(() => storage.getGame()?.quizId ?? '')
  const [studentCount, setStudentCount] = useState(storage.getStudentCount)
  const [game, setGame] = useState<GameState | null>(storage.getGame)
  const [errors, setErrors] = useState<string[]>([])

  const goHome = () => setView('dashboard')
  const saveQuizzes = (next: Quiz[]) => { setQuizzes(next); storage.saveQuizzes(next) }
  const editQuiz = (quiz?: Quiz) => { setDraft(quiz ? structuredClone(quiz) : emptyQuiz()); setErrors([]); setView('editor') }
  const removeQuiz = (quizId: string) => { if (confirm('Delete this quiz? This cannot be undone.')) saveQuizzes(quizzes.filter(q => q.id !== quizId)) }
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
  const startGame = () => {
    const count = Math.max(1, Math.min(100, Number(studentCount) || 1))
    if (!selectedQuizId) { setErrors(['Choose a quiz to continue.']); return }
    const next: GameState = { quizId: selectedQuizId, studentCount: count, currentStudent: null, completedQuestionIds: [] }
    setStudentCount(count); storage.saveStudentCount(count); setGame(next); storage.saveGame(next); setErrors([]); setView('game')
  }
  const endGame = () => { storage.clearGame(); setGame(null); setView('dashboard') }
  const updateGame = (next: GameState) => { setGame(next); storage.saveGame(next) }

  return <Shell onHome={goHome}>
    {view === 'dashboard' ? <Dashboard key="dashboard" quizCount={quizzes.length} onCreate={() => editQuiz()} onManage={() => setView('quizzes')} onStart={() => setView('setup')} hasGame={Boolean(game)} onResume={() => setView('game')} /> :
      view === 'quizzes' ? <QuizList key="quizzes" quizzes={quizzes} onBack={goHome} onCreate={() => editQuiz()} onEdit={editQuiz} onDelete={removeQuiz} /> :
      view === 'editor' && draft ? <QuizEditor key="editor" draft={draft} setDraft={setDraft} errors={errors} onBack={() => setView('quizzes')} onSave={validateAndSave} /> :
      view === 'setup' ? <ClassSetup key="setup" quizzes={quizzes} selected={selectedQuizId} setSelected={setSelectedQuizId} count={studentCount} setCount={setStudentCount} errors={errors} onBack={goHome} onStart={startGame} /> :
      <GameLobby key="game" game={game} quiz={quizzes.find(q => q.id === game?.quizId)} onUpdate={updateGame} onEnd={endGame} onSetup={() => setView('setup')} />}
  </Shell>
}

function Dashboard({ quizCount, onCreate, onManage, onStart, hasGame, onResume }: { quizCount: number; onCreate: () => void; onManage: () => void; onStart: () => void; hasGame: boolean; onResume: () => void }) {
  const actions = [
    { title: 'Create a quiz', text: 'Build questions for your next lesson.', icon: Plus, color: 'bg-coral', action: onCreate },
    { title: 'Manage quizzes', text: `${quizCount} ${quizCount === 1 ? 'quiz' : 'quizzes'} ready to use.`, icon: BookOpen, color: 'bg-sun', action: onManage },
    { title: hasGame ? 'Resume classroom game' : 'Start classroom game', text: hasGame ? 'Your classroom progress is safely stored.' : 'Pick a quiz and bring the room to life.', icon: Play, color: 'bg-mint', action: hasGame ? onResume : onStart },
  ]
  return <section className="py-16 sm:py-24"><p className="eyebrow">Interactive classroom joy</p><h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-tight text-ink sm:text-7xl">Teach with joy.<br /><span className="text-coral">Learn with confidence.</span> 🌱</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-ink/65">Turn everyday lessons into lively classroom moments with quizzes, surprise questions, and plenty of encouragement.</p><div className="mt-14 grid gap-5 md:grid-cols-3">{actions.map((a, i) => <motion.button key={a.title} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} whileHover={{ y: -6 }} onClick={a.action} className="card text-left"><span className={`grid h-14 w-14 place-items-center rounded-2xl ${a.color}`}><a.icon /></span><h2 className="mt-8 text-2xl font-black">{a.title}</h2><p className="mt-2 leading-7 text-ink/60">{a.text}</p><span className="mt-7 inline-block font-bold text-coral">Let’s go →</span></motion.button>)}</div></section>
}

function QuizList({ quizzes, onBack, onCreate, onEdit, onDelete }: { quizzes: Quiz[]; onBack: () => void; onCreate: () => void; onEdit: (q: Quiz) => void; onDelete: (id: string) => void }) {
  return <><PageHeader eyebrow="Quiz library" title="Your quizzes" text="Create, review, and prepare activities for class." back={onBack} /><div className="mb-6 flex justify-end"><button className="btn-primary" onClick={onCreate}><Plus size={19} /> New quiz</button></div><div className="grid gap-5 md:grid-cols-2">{quizzes.map(q => <article className="card" key={q.id}><div className="flex items-start justify-between gap-4"><span className="rounded-full bg-mint/40 px-3 py-1 text-sm font-bold">{q.questions.length} questions</span><div className="flex gap-2"><button className="icon-btn" aria-label={`Edit ${q.title}`} onClick={() => onEdit(q)}><Pencil size={18} /></button><button className="icon-btn danger" aria-label={`Delete ${q.title}`} onClick={() => onDelete(q.id)}><Trash2 size={18} /></button></div></div><h2 className="mt-7 text-2xl font-black">{q.title}</h2><p className="mt-2 text-ink/60">{q.description || 'No description'}</p></article>)}</div></>
}

function QuizEditor({ draft, setDraft, errors, onBack, onSave }: { draft: QuizDraft; setDraft: (q: QuizDraft) => void; errors: string[]; onBack: () => void; onSave: () => void }) {
  const updateQuestion = (index: number, next: Question) => setDraft({ ...draft, questions: draft.questions.map((q, i) => i === index ? next : q) })
  const move = (index: number, direction: -1 | 1) => { const questions = [...draft.questions]; const target = index + direction; if (target < 0 || target >= questions.length) return; [questions[index], questions[target]] = [questions[target], questions[index]]; setDraft({ ...draft, questions }) }
  return <><PageHeader eyebrow="Quiz builder" title={draft.title || 'Create a quiz'} text="Add four choices, select the right answer, and give students a helpful explanation." back={onBack} /><div className="space-y-6 pb-20"><section className="card"><label className="label">Quiz title<input className="input" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Space Explorers" /></label><label className="label mt-5">Description <span className="font-normal text-ink/40">(optional)</span><textarea className="input min-h-24" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="What will your class practice?" /></label></section>{draft.questions.map((q, index) => <section className="card" key={q.id}><div className="flex items-center justify-between"><h2 className="text-xl font-black">Question {index + 1}</h2><div className="flex gap-2"><button className="icon-btn" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move question up"><ArrowUp size={18} /></button><button className="icon-btn" disabled={index === draft.questions.length - 1} onClick={() => move(index, 1)} aria-label="Move question down"><ArrowDown size={18} /></button><button className="icon-btn danger" disabled={draft.questions.length === 1} onClick={() => setDraft({ ...draft, questions: draft.questions.filter(item => item.id !== q.id) })} aria-label="Delete question"><Trash2 size={18} /></button></div></div><label className="label mt-5">Question<input className="input" value={q.question} onChange={e => updateQuestion(index, { ...q, question: e.target.value })} /></label><div className="mt-5 grid gap-4 sm:grid-cols-2">{q.options.map((option, optionIndex) => <label className="label" key={optionIndex}><span className="flex items-center gap-2"><input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === optionIndex} onChange={() => updateQuestion(index, { ...q, correctAnswer: optionIndex })} /> Option {String.fromCharCode(65 + optionIndex)} {q.correctAnswer === optionIndex && <span className="text-xs text-coral">Correct</span>}</span><input className="input" value={option} onChange={e => { const options = [...q.options] as Question['options']; options[optionIndex] = e.target.value; updateQuestion(index, { ...q, options }) }} /></label>)}</div><label className="label mt-5">Explanation<textarea className="input min-h-20" value={q.explanation} onChange={e => updateQuestion(index, { ...q, explanation: e.target.value })} /></label></section>)}<button className="btn-secondary w-full justify-center" onClick={() => setDraft({ ...draft, questions: [...draft.questions, emptyQuestion()] })}><Plus size={19} /> Add question</button>{errors.length > 0 && <div className="error-box"><strong>Please check your quiz:</strong><ul className="mt-2 list-disc pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}<div className="flex justify-end"><button className="btn-primary" onClick={onSave}><Check size={19} /> Save quiz</button></div></div></>
}

function ClassSetup({ quizzes, selected, setSelected, count, setCount, errors, onBack, onStart }: { quizzes: Quiz[]; selected: string; setSelected: (id: string) => void; count: number; setCount: (n: number) => void; errors: string[]; onBack: () => void; onStart: () => void }) {
  const safeCount = Math.max(1, Math.min(100, Number(count) || 1)); const students = useMemo(() => Array.from({ length: safeCount }, (_, i) => i + 1), [safeCount])
  return <><PageHeader eyebrow="Classroom setup" title="Ready the room" text="Choose an activity and set how many students are joining today." back={onBack} /><div className="grid gap-6 pb-16 lg:grid-cols-[1.1fr_.9fr]"><section className="card"><h2 className="text-xl font-black">1. Choose a quiz</h2><div className="mt-5 space-y-3">{quizzes.map(q => <button key={q.id} onClick={() => setSelected(q.id)} className={`selection ${selected === q.id ? 'selected' : ''}`}><span><strong className="block text-lg">{q.title}</strong><span className="text-sm text-ink/55">{q.questions.length} questions</span></span>{selected === q.id && <Check className="text-coral" />}</button>)}</div>{quizzes.length === 0 && <p className="mt-5 text-ink/60">Create a quiz before starting a game.</p>}<label className="label mt-8">2. Number of students<input className="input max-w-40 text-2xl font-black" type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))} /></label><p className="mt-2 text-sm text-ink/50">Choose between 1 and 100 students.</p>{errors.length > 0 && <div className="error-box mt-6">{errors[0]}</div>}<button className="btn-primary mt-8" disabled={!quizzes.length} onClick={onStart}><Play size={19} /> Start game</button></section><section className="card"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-mint"><Users /></span><div><h2 className="font-black">Class preview</h2><p className="text-sm text-ink/55">{safeCount} numbered students</p></div></div><div className="mt-6 grid max-h-[30rem] grid-cols-3 gap-2 overflow-auto pr-2 sm:grid-cols-4 lg:grid-cols-3">{students.map(n => <span key={n} className="rounded-xl bg-cream p-3 text-center text-sm font-bold">Student #{n}</span>)}</div></section></div></>
}

function GameLobby({ game, quiz, onUpdate, onEnd, onSetup }: { game: GameState | null; quiz?: Quiz; onUpdate: (game: GameState) => void; onEnd: () => void; onSetup: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  if (!game || !quiz) return <section className="py-24 text-center"><h1 className="page-title">No active game</h1><button className="btn-primary mt-8" onClick={onSetup}>Set up a game</button></section>
  const spin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setRotation(value => value + 1440 + Math.floor(Math.random() * 720))
    window.setTimeout(() => {
      const student = Math.floor(Math.random() * game.studentCount) + 1
      onUpdate({ ...game, currentStudent: student })
      setIsSpinning(false)
    }, 1700)
  }
  const chooseCard = (question: Question) => {
    if (game.completedQuestionIds.includes(question.id)) return
    setSelectedAnswer(null)
    setActiveQuestion(question)
  }
  const answer = (option: number) => {
    if (!activeQuestion || selectedAnswer !== null) return
    setSelectedAnswer(option)
    const finishingQuiz = game.completedQuestionIds.length + 1 === quiz.questions.length
    if (soundEnabled) finishingQuiz ? playQuizCelebration() : option === activeQuestion.correctAnswer && playCorrectChime()
    onUpdate({ ...game, completedQuestionIds: [...game.completedQuestionIds, activeQuestion.id] })
  }
  const closeQuestion = () => { setActiveQuestion(null); setSelectedAnswer(null) }
  const isCorrect = activeQuestion && selectedAnswer === activeQuestion.correctAnswer
  const complete = game.completedQuestionIds.length === quiz.questions.length
  const restart = () => onUpdate({ ...game, currentStudent: null, completedQuestionIds: [] })

  return <><PageHeader eyebrow="Classroom game" title={quiz.title} text={`${game.completedQuestionIds.length} of ${quiz.questions.length} questions completed. Progress is saved automatically.`} />
    <div className="grid gap-6 pb-16 lg:grid-cols-[.72fr_1.28fr]">
      <section className="card text-center lg:sticky lg:top-6 lg:self-start">
        <p className="text-sm font-extrabold uppercase tracking-[.18em] text-ink/45">Current student</p>
        <div className="relative mx-auto mt-7 h-48 w-48">
          <motion.div animate={{ rotate: rotation }} transition={{ duration: 1.7, ease: [0.12, 0.72, 0.18, 1] }} className="wheel h-full w-full">
            <Users size={45} /><span className="text-sm font-black">JOY</span>
          </motion.div>
          <span className="wheel-pointer" />
        </div>
        <AnimatePresence mode="wait"><motion.div key={isSpinning ? 'spinning' : game.currentStudent ?? 'none'} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 min-h-16">
          {isSpinning ? <p className="text-xl font-black text-coral">Round and round…</p> : game.currentStudent ? <><p className="text-sm font-bold text-ink/45">It’s your turn</p><p className="text-3xl font-black text-coral">Student #{game.currentStudent} 🎉</p></> : <p className="text-xl font-black text-ink/45">Not selected yet</p>}
        </motion.div></AnimatePresence>
        <button className="btn-primary mt-4 w-full justify-center" onClick={spin} disabled={isSpinning}><RotateCw className={isSpinning ? 'animate-spin' : ''} size={20} /> {isSpinning ? 'Spinning…' : 'Spin the wheel'}</button>
        <div className="mt-6 flex flex-wrap justify-center gap-2"><button className="btn-quiet text-sm" onClick={() => setSoundEnabled(value => !value)} aria-pressed={soundEnabled}>{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Sound {soundEnabled ? 'on' : 'off'}</button><button className="btn-quiet text-sm" onClick={onSetup}><Pencil size={16} /> Setup</button><button className="btn-quiet text-sm text-red-600" onClick={onEnd}><X size={16} /> End</button></div>
      </section>
      <section className="card">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow !mb-2">Question board</p><h2 className="text-3xl font-black">Choose a hidden card</h2></div><span className="rounded-full bg-[#f7f2e9] px-4 py-2 text-sm font-bold">{quiz.questions.length - game.completedQuestionIds.length} remaining</span></div>
        {complete ? <div className="celebration-panel mt-10"><Confetti /><motion.div initial={{ scale: .7, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: .55 }} className="relative"><Trophy className="mx-auto fill-[#ffd86f] text-[#d79a12]" size={64} /><h3 className="mt-4 text-4xl font-black">Quiz completed! 🎉</h3><p className="mt-3 text-lg text-ink/60">Great job, everyone! Give yourselves a big round of applause.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button className="btn-primary" onClick={() => soundEnabled && playQuizCelebration()}><Volume2 size={18} /> Play applause</button><button className="btn-secondary" onClick={restart}><RotateCcw size={18} /> Restart game</button><button className="btn-quiet" onClick={onEnd}>Dashboard</button></div></motion.div></div> : <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{quiz.questions.map((question, index) => { const used = game.completedQuestionIds.includes(question.id); return <motion.button layout key={question.id} whileHover={used ? undefined : { y: -5, rotate: -1 }} whileTap={used ? undefined : { scale: .96 }} disabled={used} onClick={() => chooseCard(question)} className={`question-card ${used ? 'used' : ''}`}><span className="card-shine" />{used ? <><Check size={30} /><span className="text-sm">Completed</span></> : <><CircleHelp size={30} /><span className="text-3xl">{index + 1}</span></>}</motion.button> })}</div>}
      </section>
    </div>
    <AnimatePresence>{activeQuestion && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="question-title"><motion.section initial={{ opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .97 }} className="question-modal">
      <div className="flex items-center justify-between"><span className="rounded-full bg-[#fff1ef] px-4 py-2 text-sm font-black text-coral">Student #{game.currentStudent ?? '—'}</span>{selectedAnswer === null && <button className="icon-btn" onClick={closeQuestion} aria-label="Close question"><X /></button>}</div>
      <h2 id="question-title" className="mt-7 text-2xl font-black leading-tight sm:text-4xl">{activeQuestion.question}</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">{activeQuestion.options.map((option, index) => { const correctOption = selectedAnswer !== null && index === activeQuestion.correctAnswer; const wrongChoice = selectedAnswer === index && index !== activeQuestion.correctAnswer; return <button disabled={selectedAnswer !== null} onClick={() => answer(index)} key={index} className={`answer-option ${correctOption ? 'correct' : ''} ${wrongChoice ? 'wrong' : ''}`}><span>{String.fromCharCode(65 + index)}</span>{option}{correctOption && <Check className="ml-auto" />}{wrongChoice && <X className="ml-auto" />}</button> })}</div>
      <AnimatePresence>{selectedAnswer !== null && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}><p className="text-2xl font-black">{isCorrect ? 'Excellent! Great job! 🌟' : 'Good try! Keep growing. 🌱'}</p>{!isCorrect && <p className="mt-2 font-bold">Correct answer: {String.fromCharCode(65 + activeQuestion.correctAnswer)}. {activeQuestion.options[activeQuestion.correctAnswer]}</p>}<p className="mt-3 text-ink/70">{activeQuestion.explanation}</p><button className="btn-secondary mt-6" onClick={closeQuestion}>Back to cards <ArrowLeft className="rotate-180" size={18} /></button></motion.div>}</AnimatePresence>
    </motion.section></motion.div>}</AnimatePresence>
  </>
}

const confettiColors = ['#ff8277', '#ffd86f', '#8ed9bd', '#75b9e6', '#a98bdd']
function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 42 }, (_, index) => <motion.i key={index} style={{ left: `${(index * 37) % 100}%`, background: confettiColors[index % confettiColors.length] }} initial={{ y: -60, rotate: 0, opacity: 1 }} animate={{ y: 420, rotate: 540 + index * 19, opacity: [1, 1, 0] }} transition={{ duration: 2.4 + (index % 5) * .22, delay: (index % 9) * .08, repeat: Infinity, repeatDelay: .6 }} />)}</div>
}
