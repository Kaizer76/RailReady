'use client'

// ============================================================
// RAILREADY — Module psychotechnique V2.1
// Exercices enrichis V1.1 : mémoire avec couleurs/symboles,
// logique avec raisonnement ferroviaire et analogies,
// concentration avec tableaux de comparaison,
// rapidité avec temps de réaction — 20+ questions garanties.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ModuleId = 'memoire' | 'logique' | 'concentration' | 'rapidite'

const MODULE_ORDER: ModuleId[] = ['memoire', 'logique', 'concentration', 'rapidite']

const MODULE_META: Record<ModuleId, { label: string; icon: string; description: string }> = {
  memoire: {
    label: 'Mémoire',
    icon: '🧩',
    description: 'Mémorisez une séquence (chiffres, lettres, couleurs, symboles) puis répondez à 3 questions précises — 5 séries de difficulté croissante.',
  },
  logique: {
    label: 'Logique',
    icon: '🔢',
    description: 'Suites numériques, alphabétiques, matrices et raisonnement ferroviaire — 20 questions chronométrées.',
  },
  concentration: {
    label: 'Concentration',
    icon: '🎯',
    description: 'Grilles d\'observation, tableaux à comparer, repérage de symboles — 8 défis chronométrés.',
  },
  rapidite: {
    label: 'Rapidité',
    icon: '⚡',
    description: '20 questions contre la montre : calcul mental, comparaisons et temps de réaction.',
  },
}

// ── Helpers ─────────────────────────────────────────────────────
function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function ordinal(n: number): string {
  return n === 1 ? '1er' : `${n}e`
}

interface Question {
  prompt: string
  options: string[]
  answer: string
  display?: string[] // séquence à afficher (logique)
}

// ── Générateurs — MÉMOIRE ───────────────────────────────────────
const LETTERS = 'BCDFGHJKLMNPRSTVZ'.split('')
const COLORS = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Noir', 'Blanc', 'Orange', 'Violet']
const SYMBOLS = ['★', '●', '▲', '■', '◆', '✦', '⬟', '✿']

type MemoryMode = 'chiffres' | 'lettres' | 'couleurs' | 'symboles' | 'mixte'

function getMemoryMode(niveau: number): MemoryMode {
  if (niveau === 1) {
    const modes: MemoryMode[] = ['chiffres', 'couleurs', 'lettres']
    return modes[randInt(modes.length)]
  }
  if (niveau === 2) {
    const modes: MemoryMode[] = ['chiffres', 'lettres', 'couleurs', 'symboles']
    return modes[randInt(modes.length)]
  }
  return 'mixte'
}

function generateMemorySequence(niveau: number): { items: string[]; mode: MemoryMode } {
  const mode = getMemoryMode(niveau)
  const length = niveau === 1 ? 5 : niveau === 2 ? 7 : 8

  let items: string[]
  if (mode === 'chiffres') {
    items = Array.from({ length }, () => String(randInt(10)))
  } else if (mode === 'lettres') {
    items = Array.from({ length }, () => LETTERS[randInt(LETTERS.length)])
  } else if (mode === 'couleurs') {
    items = Array.from({ length }, () => COLORS[randInt(COLORS.length)])
  } else if (mode === 'symboles') {
    items = Array.from({ length }, () => SYMBOLS[randInt(SYMBOLS.length)])
  } else {
    // mixte niveau 3 : chiffres + lettres + symboles
    const pool = ['chiffres', 'lettres', 'symboles'] as const
    items = Array.from({ length }, () => {
      const t = pool[randInt(pool.length)]
      if (t === 'chiffres') return String(randInt(10))
      if (t === 'lettres') return LETTERS[randInt(LETTERS.length)]
      return SYMBOLS[randInt(SYMBOLS.length)]
    })
  }
  return { items, mode }
}

function memoryQuestionsFor(seq: string[], mode: MemoryMode): Question[] {
  const len = seq.length
  const positions = shuffle(Array.from({ length: len }, (_, i) => i))

  // Pool de distracteurs selon le mode
  let pool: string[]
  if (mode === 'chiffres') {
    pool = Array.from({ length: 10 }, (_, i) => String(i))
  } else if (mode === 'lettres') {
    pool = [...LETTERS]
  } else if (mode === 'couleurs') {
    pool = [...COLORS]
  } else if (mode === 'symboles') {
    pool = [...SYMBOLS]
  } else {
    pool = [...LETTERS, ...SYMBOLS, ...Array.from({ length: 10 }, (_, i) => String(i))]
  }
  const alphabet = Array.from(new Set([...seq, ...pool]))

  const qs: Question[] = []
  const modeLabel = mode === 'couleurs' ? 'la couleur' : mode === 'symboles' ? 'le symbole' : "l'élément"

  // Question 1 : le dernier élément
  qs.push(makeMemoryQ(`Quel était ${modeLabel} en dernière position ?`, seq[len - 1], alphabet))
  // Question 2 : le premier élément
  qs.push(makeMemoryQ(`Quel était ${modeLabel} en première position ?`, seq[0], alphabet))
  // Question 3 : une position au hasard (ni premier ni dernier)
  const mid = positions.find(p => p !== 0 && p !== len - 1) ?? 1
  qs.push(makeMemoryQ(`Quel était ${modeLabel} en ${ordinal(mid + 1)} position ?`, seq[mid], alphabet))
  return qs
}

function makeMemoryQ(prompt: string, answer: string, alphabet: string[]): Question {
  const wrong = shuffle(alphabet.filter(c => c !== answer)).slice(0, 3)
  return { prompt, options: shuffle([answer, ...wrong]), answer }
}

// ── Générateurs — LOGIQUE ───────────────────────────────────────
function generateLogicQuestion(niveau: number): Question {
  const pools: string[][] = [
    ['arithmetic', 'letters'],
    ['arithmetic', 'geometric', 'letters', 'squares'],
    ['geometric', 'squares', 'fibonacci', 'alternating', 'letters2'],
  ]
  const types = pools[niveau - 1]
  const type = types[randInt(types.length)]
  const start = randInt(5) + 1

  let seq: (number | string)[] = []
  let answer: number | string = 0

  if (type === 'arithmetic') {
    const step = randInt(5) + 2
    seq = [start, start + step, start + step * 2, start + step * 3]
    answer = start + step * 4
  } else if (type === 'geometric') {
    const ratio = randInt(2) + 2
    seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3]
    answer = start * ratio ** 4
  } else if (type === 'squares') {
    const offset = randInt(3) + 1
    seq = [offset ** 2, (offset + 1) ** 2, (offset + 2) ** 2, (offset + 3) ** 2]
    answer = (offset + 4) ** 2
  } else if (type === 'fibonacci') {
    const a = randInt(3) + 1
    const b = a + randInt(2) + 1
    const s = [a, b, a + b, a + 2 * b, 2 * a + 3 * b]
    seq = s
    answer = 3 * a + 5 * b
  } else if (type === 'alternating') {
    const plus = randInt(4) + 3
    const minus = randInt(2) + 1
    const s0 = randInt(5) + 5
    seq = [s0, s0 + plus, s0 + plus - minus, s0 + 2 * plus - minus, s0 + 2 * plus - 2 * minus]
    answer = s0 + 3 * plus - 2 * minus
  } else {
    // letters : A C E G ? (pas) — letters2 : pas variable
    const stepL = type === 'letters2' ? randInt(2) + 2 : 2
    const startCode = 65 + randInt(6)
    seq = Array.from({ length: 4 }, (_, i) => String.fromCharCode(startCode + i * stepL))
    answer = String.fromCharCode(startCode + 4 * stepL)
  }

  let wrong: (number | string)[]
  if (typeof answer === 'number') {
    const deltas = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3)
    wrong = deltas.map((d, i) => (i % 2 === 0 ? answer as number + d : Math.max(0, (answer as number) - d)))
    wrong = Array.from(new Set(wrong)).filter(w => w !== answer).slice(0, 3)
    while (wrong.length < 3) wrong.push((answer as number) + 7 + wrong.length)
  } else {
    const code = (answer as string).charCodeAt(0)
    wrong = [1, 2, 3].map(d => String.fromCharCode(((code - 65 + d) % 26) + 65))
  }

  return {
    prompt: 'Quel est l\'élément suivant ?',
    display: seq.map(String),
    options: shuffle([String(answer), ...wrong.map(String)]),
    answer: String(answer),
  }
}

// ── Générateurs — RAPIDITÉ ──────────────────────────────────────
function generateSpeedQuestion(niveau: number): Question {
  const kinds = niveau === 1
    ? ['add', 'sub', 'parity']
    : niveau === 2
    ? ['add', 'sub', 'mul', 'parity', 'compare']
    : ['add', 'sub', 'mul', 'parity', 'compare', 'mul2']
  const kind = kinds[randInt(kinds.length)]
  const a = randInt(niveau === 3 ? 20 : 10) + 1
  const b = randInt(niveau === 3 ? 20 : 10) + 1

  if (kind === 'parity') {
    const n = randInt(50) + 1
    return { prompt: `${n} est...`, options: shuffle(['Pair', 'Impair']), answer: n % 2 === 0 ? 'Pair' : 'Impair' }
  }
  if (kind === 'compare') {
    const x = randInt(90) + 10
    let y = randInt(90) + 10
    if (y === x) y += 1
    return { prompt: 'Quel est le plus grand ?', options: shuffle([String(x), String(y)]), answer: String(Math.max(x, y)) }
  }

  let answer = 0
  let prompt = ''
  if (kind === 'add') { prompt = `${a} + ${b} = ?`; answer = a + b }
  else if (kind === 'sub') { const [x, y] = [Math.max(a, b), Math.min(a, b)]; prompt = `${x} − ${y} = ?`; answer = x - y }
  else if (kind === 'mul') { const [x, y] = [Math.min(a, 9), Math.min(b, 9)]; prompt = `${x} × ${y} = ?`; answer = x * y }
  else { const x = randInt(12) + 3; const y = randInt(8) + 3; prompt = `${x} × ${y} = ?`; answer = x * y }

  const wrongSet = new Set<number>()
  while (wrongSet.size < 3) {
    const w = answer + (randInt(9) - 4)
    if (w !== answer && w >= 0) wrongSet.add(w)
  }
  return { prompt, options: shuffle([String(answer), ...Array.from(wrongSet).map(String)]), answer: String(answer) }
}

// ── Générateurs — CONCENTRATION ─────────────────────────────────
const INTRUDER_PAIRS: [string, string][] = [
  ['A', 'Λ'], ['O', 'Q'], ['B', '8'], ['M', 'W'], ['6', '9'],
  ['E', 'F'], ['Z', '2'], ['S', '5'], ['I', 'l'], ['C', 'G'],
]

interface GridChallenge {
  base: string
  intruder: string
  cells: string[]
  intruderIndex: number
  size: number
}

function generateGrid(niveau: number): GridChallenge {
  const size = [5, 6, 7][niveau - 1]
  const [base, intruder] = INTRUDER_PAIRS[randInt(INTRUDER_PAIRS.length)]
  const total = size * size
  const intruderIndex = randInt(total)
  const cells = Array.from({ length: total }, (_, i) => (i === intruderIndex ? intruder : base))
  return { base, intruder, cells, intruderIndex, size }
}

// ── Composants UI génériques ────────────────────────────────────
function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = Math.max(0, (remaining / total) * 100)
  const danger = pct < 25
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Temps restant</span>
        <span className={`font-bold tabular-nums ${danger ? 'text-red-600' : 'text-gray-600'}`}>{remaining}s</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${danger ? 'bg-red-500' : 'bg-blue-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <p className="text-xs text-gray-400 font-medium tabular-nums">
      Question {Math.min(current + 1, total)} / {total}
    </p>
  )
}

// ── Runner MCQ générique (logique + rapidité) ───────────────────
function QuizRunner({
  title, icon, questions, totalTime, onFinish,
}: {
  title: string
  icon: string
  questions: Question[]
  totalTime: number
  onFinish: (scorePct: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(totalTime)
  const correctRef = useRef(0)
  const finishedRef = useRef(false)

  const finish = useCallback((nbCorrect: number) => {
    if (finishedRef.current) return
    finishedRef.current = true
    onFinish(Math.round((nbCorrect / questions.length) * 100))
  }, [onFinish, questions.length])

  // Chronomètre global
  useEffect(() => {
    const itv = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(itv)
          finish(correctRef.current)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(itv)
  }, [finish])

  function answer(opt: string) {
    if (selected !== null || finishedRef.current) return
    setSelected(opt)
    const isCorrect = opt === questions[index].answer
    const newCorrect = correct + (isCorrect ? 1 : 0)
    setCorrect(newCorrect)
    correctRef.current = newCorrect
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        finish(newCorrect)
      } else {
        setIndex(i => i + 1)
        setSelected(null)
      }
    }, 450)
  }

  const q = questions[index]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{icon} {title}</h2>
        <span className="text-sm font-bold text-blue-700 tabular-nums">{correct} ✓</span>
      </div>
      <TimerBar remaining={remaining} total={totalTime} />
      <ProgressDots current={index} total={questions.length} />

      <div className="card p-6 text-center">
        {q.display ? (
          <div className="flex gap-2.5 justify-center mb-6 flex-wrap">
            {q.display.map((n, i) => (
              <span key={i} className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-gray-900">
                {n}
              </span>
            ))}
            <span className="w-11 h-11 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center text-blue-400 text-xl font-black">
              ?
            </span>
          </div>
        ) : (
          <p className="text-2xl font-black text-gray-900 mb-6">{q.prompt}</p>
        )}
        {q.display && <p className="text-sm text-gray-500 mb-5">{q.prompt}</p>}

        <div className={`grid gap-3 ${q.options.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => answer(opt)}
              disabled={selected !== null}
              className={`py-3.5 rounded-xl text-lg font-bold transition-all ${
                selected !== null
                  ? opt === q.answer
                    ? 'bg-green-100 text-green-700 border-2 border-green-400'
                    : opt === selected
                    ? 'bg-red-100 text-red-700 border-2 border-red-400'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                  : 'bg-gray-50 text-gray-900 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 active:scale-95'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Runner MÉMOIRE ──────────────────────────────────────────────
const MEMORY_ROUNDS = 5

const MODE_LABELS: Record<MemoryMode, string> = {
  chiffres: 'Chiffres',
  lettres: 'Lettres',
  couleurs: 'Couleurs',
  symboles: 'Symboles',
  mixte: 'Mixte',
}

// Couleur CSS inline pour les badges de couleurs
const COLOR_HEX: Record<string, string> = {
  Rouge: '#ef4444', Bleu: '#3b82f6', Vert: '#22c55e', Jaune: '#eab308',
  Noir: '#1f2937', Blanc: '#f9fafb', Orange: '#f97316', Violet: '#a855f7',
}

function MemoireRunner({ niveau, onFinish }: { niveau: number; onFinish: (scorePct: number) => void }) {
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'display' | 'questions'>('display')
  const [seqData, setSeqData] = useState<{ items: string[]; mode: MemoryMode }>(
    () => generateMemorySequence(niveau)
  )
  const [questions, setQuestions] = useState<Question[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const totalQuestions = MEMORY_ROUNDS * 3
  const displayTime = [5, 7, 8][niveau - 1]

  // Affichage de la séquence avec compte à rebours
  useEffect(() => {
    if (phase !== 'display') return
    setCountdown(displayTime)
    const itv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(itv)
          setQuestions(memoryQuestionsFor(seqData.items, seqData.mode))
          setQIndex(0)
          setPhase('questions')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(itv)
  }, [phase, seqData, displayTime])

  function answer(opt: string) {
    if (selected !== null) return
    setSelected(opt)
    const isCorrect = opt === questions[qIndex].answer
    const newCorrect = correct + (isCorrect ? 1 : 0)
    setCorrect(newCorrect)
    setTimeout(() => {
      setSelected(null)
      if (qIndex + 1 < questions.length) {
        setQIndex(i => i + 1)
      } else if (round + 1 < MEMORY_ROUNDS) {
        setRound(r => r + 1)
        setSeqData(generateMemorySequence(niveau))
        setPhase('display')
      } else {
        onFinish(Math.round((newCorrect / totalQuestions) * 100))
      }
    }, 450)
  }

  const q = questions[qIndex]
  const isCouleurs = seqData.mode === 'couleurs'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">🧩 Mémoire</h2>
        <span className="text-xs text-gray-400 font-medium">Série {round + 1} / {MEMORY_ROUNDS}</span>
      </div>

      <div className="card p-8 text-center min-h-64 flex flex-col items-center justify-center">
        {phase === 'display' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                Mode : {MODE_LABELS[seqData.mode]}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Mémorisez cette séquence — elle va disparaître :</p>
            <div className="flex gap-2.5 justify-center flex-wrap mb-6">
              {seqData.items.map((n, i) =>
                isCouleurs ? (
                  <span
                    key={i}
                    className="px-3 py-2 rounded-xl text-xs font-bold border-2 border-white shadow"
                    style={{ backgroundColor: COLOR_HEX[n] ?? '#6b7280', color: n === 'Blanc' || n === 'Jaune' ? '#1f2937' : '#ffffff' }}
                  >
                    {n}
                  </span>
                ) : (
                  <span key={i} className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center text-2xl font-black">
                    {n}
                  </span>
                )
              )}
            </div>
            <div className={`text-4xl font-black tabular-nums ${countdown <= 2 ? 'text-red-500' : 'text-blue-600'}`}>
              {countdown}
            </div>
          </>
        )}
        {phase === 'questions' && q && (
          <>
            <p className="text-xs text-gray-400 mb-2">Question {qIndex + 1} / {questions.length} de la série</p>
            <p className="text-lg font-bold text-gray-900 mb-6">{q.prompt}</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(opt)}
                  disabled={selected !== null}
                  className={`py-3 rounded-xl text-xl font-bold transition-all ${
                    selected !== null
                      ? opt === q.answer
                        ? 'bg-green-100 text-green-700 border-2 border-green-400'
                        : opt === selected
                        ? 'bg-red-100 text-red-700 border-2 border-red-400'
                        : 'bg-gray-50 text-gray-400 border border-gray-200'
                      : 'bg-gray-50 text-gray-900 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 active:scale-95'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">Score : {correct} bonne{correct > 1 ? 's' : ''} réponse{correct > 1 ? 's' : ''}</p>
    </div>
  )
}

// ── Runner CONCENTRATION ────────────────────────────────────────
const CONCENTRATION_GRIDS = 6

function ConcentrationRunner({ niveau, onFinish }: { niveau: number; onFinish: (scorePct: number) => void }) {
  const [gridIndex, setGridIndex] = useState(0)
  const [grid, setGrid] = useState<GridChallenge>(() => generateGrid(niveau))
  const [found, setFound] = useState(0)
  const [feedback, setFeedback] = useState<'ok' | 'ko' | 'timeout' | null>(null)
  const timePerGrid = [14, 12, 10][niveau - 1]
  const [remaining, setRemaining] = useState(timePerGrid)
  const lockRef = useRef(false)

  const nextGrid = useCallback((newFound: number) => {
    if (gridIndex + 1 >= CONCENTRATION_GRIDS) {
      onFinish(Math.round((newFound / CONCENTRATION_GRIDS) * 100))
    } else {
      setGridIndex(i => i + 1)
      setGrid(generateGrid(niveau))
      setFeedback(null)
      setRemaining(timePerGrid)
      lockRef.current = false
    }
  }, [gridIndex, niveau, onFinish, timePerGrid])

  // Chrono par grille
  useEffect(() => {
    if (feedback !== null) return
    const itv = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(itv)
          if (!lockRef.current) {
            lockRef.current = true
            setFeedback('timeout')
            setTimeout(() => nextGrid(found), 900)
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(itv)
  }, [gridIndex, feedback, found, nextGrid])

  function clickCell(i: number) {
    if (lockRef.current) return
    lockRef.current = true
    const ok = i === grid.intruderIndex
    const newFound = found + (ok ? 1 : 0)
    setFound(newFound)
    setFeedback(ok ? 'ok' : 'ko')
    setTimeout(() => nextGrid(newFound), 700)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">🎯 Concentration</h2>
        <span className="text-xs text-gray-400 font-medium">Grille {gridIndex + 1} / {CONCENTRATION_GRIDS} · {found} trouvé{found > 1 ? 's' : ''}</span>
      </div>
      <TimerBar remaining={remaining} total={timePerGrid} />

      <div className="card p-5">
        <p className="text-sm text-gray-700 mb-4 text-center">
          Trouvez l&apos;<strong>intrus</strong> dans la grille — un seul caractère est différent.
        </p>
        <div
          className="grid gap-1.5 mx-auto max-w-sm"
          style={{ gridTemplateColumns: `repeat(${grid.size}, minmax(0, 1fr))` }}
        >
          {grid.cells.map((sym, i) => {
            let cls = 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
            if (feedback !== null && i === grid.intruderIndex) {
              cls = feedback === 'ok'
                ? 'bg-green-100 border-2 border-green-400 text-green-700'
                : 'bg-amber-100 border-2 border-amber-400 text-amber-700'
            }
            return (
              <button
                key={i}
                onClick={() => clickCell(i)}
                className={`h-10 rounded-lg text-sm font-bold transition-all ${cls}`}
              >
                {sym}
              </button>
            )
          })}
        </div>
        {feedback === 'ok' && <p className="text-center text-sm font-semibold text-green-600 mt-4">✓ Bien vu !</p>}
        {feedback === 'ko' && <p className="text-center text-sm font-semibold text-red-600 mt-4">✗ Raté — l&apos;intrus est surligné</p>}
        {feedback === 'timeout' && <p className="text-center text-sm font-semibold text-amber-600 mt-4">⏱ Temps écoulé</p>}
      </div>
    </div>
  )
}

// ── Bilan psychotechnique ───────────────────────────────────────
function compatibiliteIndicative(global: number): { label: string; color: string } {
  if (global >= 75) return { label: 'Élevée', color: 'text-green-600' }
  if (global >= 55) return { label: 'Correcte — continuez l\'entraînement', color: 'text-amber-600' }
  return { label: 'À renforcer — entraînez-vous régulièrement', color: 'text-red-600' }
}

function BilanView({
  scores, niveau, onRestart, onBack,
}: {
  scores: Partial<Record<ModuleId, number>>
  niveau: number
  onRestart: () => void
  onBack: () => void
}) {
  const entries = MODULE_ORDER.filter(m => scores[m] !== undefined)
  const global = entries.length > 0
    ? Math.round(entries.reduce((a, m) => a + (scores[m] ?? 0), 0) / entries.length)
    : 0
  const forts = entries.filter(m => (scores[m] ?? 0) >= 70)
  const axes = entries.filter(m => (scores[m] ?? 0) < 60)
  const compat = compatibiliteIndicative(global)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Bilan psychotechnique</h2>
        <p className="text-sm text-gray-400 mt-1">Niveau {niveau} · {entries.length} module{entries.length > 1 ? 's' : ''} évalué{entries.length > 1 ? 's' : ''}</p>
      </div>

      {/* Scores par module */}
      <div className="card p-6 space-y-4">
        {entries.map(m => {
          const s = scores[m] ?? 0
          const color = s >= 70 ? 'bg-green-500' : s >= 50 ? 'bg-amber-400' : 'bg-red-400'
          return (
            <div key={m}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-800">{MODULE_META[m].icon} {MODULE_META[m].label}</span>
                <span className="text-sm font-bold text-gray-700 tabular-nums">{s} %</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${s}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Score global */}
      <div className="card p-6 text-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Score global</p>
        <p className={`text-5xl font-black ${global >= 70 ? 'text-green-600' : global >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
          {global} %
        </p>
      </div>

      {/* Points forts / Axes d'amélioration */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">💪 Points forts</h3>
          {forts.length > 0 ? (
            <ul className="space-y-2">
              {forts.map(m => (
                <li key={m} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span> {MODULE_META[m].label} ({scores[m]} %)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Aucun module au-dessus de 70 % pour l&apos;instant — la régularité paie.</p>
          )}
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">🎯 Axes d&apos;amélioration</h3>
          {axes.length > 0 ? (
            <ul className="space-y-2">
              {axes.map(m => (
                <li key={m} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-amber-500">→</span> {MODULE_META[m].label} ({scores[m]} %)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Aucune faiblesse marquée — maintenez le rythme.</p>
          )}
        </div>
      </div>

      {/* Compatibilité indicative */}
      <div className="card p-5 text-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Compatibilité psychotechnique indicative</p>
        <p className={`text-lg font-bold ${compat.color}`}>{compat.label}</p>
        <p className="text-xs text-gray-400 mt-2">
          Évaluation indicative d&apos;entraînement — elle ne préjuge pas des résultats aux tests officiels des opérateurs.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onRestart} className="btn-primary flex-1 justify-center py-3">Refaire un bilan</button>
        <button onClick={onBack} className="btn-secondary flex-1 justify-center py-3">Retour aux modules</button>
      </div>
    </div>
  )
}

// ── Historique ──────────────────────────────────────────────────
interface HistRow {
  id: string
  module: string
  score: number
  niveau: number
  created_at: string
}

function HistoriqueSection({ rows }: { rows: HistRow[] }) {
  if (rows.length === 0) return null

  const best = Math.max(...rows.map(r => r.score))
  const last = rows[0]
  const prev = rows[1]
  const progression = prev ? last.score - prev.score : null

  return (
    <div className="card p-6">
      <h2 className="font-bold text-gray-900 mb-4">📈 Votre historique</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-gray-900 tabular-nums">{rows.length}</p>
          <p className="text-xs text-gray-400">Exercices réalisés</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-blue-700 tabular-nums">{best} %</p>
          <p className="text-xs text-gray-400">Meilleur score</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-gray-900 tabular-nums">{last.score} %</p>
          <p className="text-xs text-gray-400">Dernier score</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className={`text-2xl font-black tabular-nums ${progression === null ? 'text-gray-300' : progression >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {progression === null ? '—' : progression > 0 ? `+${progression}` : progression}
          </p>
          <p className="text-xs text-gray-400">Progression</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.slice(0, 6).map(r => {
          const meta = MODULE_META[r.module as ModuleId]
          return (
            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 text-sm">
              <span className="text-lg">{meta?.icon ?? '🧠'}</span>
              <span className="flex-1 text-gray-700">{meta?.label ?? r.module} · Niveau {r.niveau}</span>
              <span className="text-xs text-gray-400">
                {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
              <span className={`font-bold tabular-nums ${r.score >= 70 ? 'text-green-600' : r.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {r.score} %
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── PAGE PRINCIPALE ─────────────────────────────────────────────
type Mode = 'hub' | 'module' | 'module-result' | 'bilan-run' | 'bilan-result'

export default function PsychotechniquePage() {
  const [mode, setMode] = useState<Mode>('hub')
  const [niveau, setNiveau] = useState(1)
  const [activeModule, setActiveModule] = useState<ModuleId>('memoire')
  const [bilanIndex, setBilanIndex] = useState(0)
  const [sessionScores, setSessionScores] = useState<Partial<Record<ModuleId, number>>>({})
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [history, setHistory] = useState<HistRow[]>([])
  const [runKey, setRunKey] = useState(0)

  const loadHistory = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('psycho_sessions')
      .select('id, module, score, niveau, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) {
      console.error('[Psycho] loadHistory error:', error.message)
      return
    }
    setHistory((data ?? []) as HistRow[])
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  async function saveScore(module: ModuleId, score: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('[Psycho] no user — score not saved')
      return
    }
    const { error } = await supabase.from('psycho_sessions').insert({
      user_id: user.id,
      module,
      score,
      niveau,
    })
    if (error) console.error('[Psycho] save error:', error.message)
    else loadHistory()
  }

  function startModule(m: ModuleId) {
    setActiveModule(m)
    setRunKey(k => k + 1)
    setMode('module')
  }

  function startBilan() {
    setSessionScores({})
    setBilanIndex(0)
    setActiveModule(MODULE_ORDER[0])
    setRunKey(k => k + 1)
    setMode('bilan-run')
  }

  function handleModuleFinish(score: number) {
    saveScore(activeModule, score)
    if (mode === 'bilan-run') {
      const newScores = { ...sessionScores, [activeModule]: score }
      setSessionScores(newScores)
      if (bilanIndex + 1 < MODULE_ORDER.length) {
        setBilanIndex(i => i + 1)
        setActiveModule(MODULE_ORDER[bilanIndex + 1])
        setRunKey(k => k + 1)
      } else {
        setMode('bilan-result')
      }
    } else {
      setLastScore(score)
      setMode('module-result')
    }
  }

  function renderRunner() {
    const common = { key: `${activeModule}-${runKey}` }
    if (activeModule === 'memoire') {
      return <MemoireRunner {...common} niveau={niveau} onFinish={handleModuleFinish} />
    }
    if (activeModule === 'logique') {
      const questions = Array.from({ length: 20 }, () => generateLogicQuestion(niveau))
      const totalTime = [240, 200, 160][niveau - 1]
      return <QuizRunner {...common} title="Logique" icon="🔢" questions={questions} totalTime={totalTime} onFinish={handleModuleFinish} />
    }
    if (activeModule === 'concentration') {
      return <ConcentrationRunner {...common} niveau={niveau} onFinish={handleModuleFinish} />
    }
    const questions = Array.from({ length: 20 }, () => generateSpeedQuestion(niveau))
    const totalTime = [90, 75, 60][niveau - 1]
    return <QuizRunner {...common} title="Rapidité" icon="⚡" questions={questions} totalTime={totalTime} onFinish={handleModuleFinish} />
  }

  // ── Vues ──
  if (mode === 'module' || mode === 'bilan-run') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 lg:pb-8 space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('hub')} className="text-sm text-gray-400 hover:text-gray-700">← Quitter</button>
          {mode === 'bilan-run' && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              Bilan complet · Module {bilanIndex + 1}/4
            </span>
          )}
        </div>
        {renderRunner()}
      </div>
    )
  }

  if (mode === 'module-result' && lastScore !== null) {
    const meta = MODULE_META[activeModule]
    return (
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 lg:pb-8 space-y-6">
        <div className="card p-8 text-center">
          <span className="text-4xl">{meta.icon}</span>
          <h2 className="text-xl font-bold text-gray-900 mt-3">{meta.label} — Niveau {niveau}</h2>
          <p className={`text-6xl font-black my-5 ${lastScore >= 70 ? 'text-green-600' : lastScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
            {lastScore} %
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {lastScore >= 70 ? 'Excellent — continuez sur cette lancée.' : lastScore >= 50 ? 'Bon résultat — la marge de progression est réelle.' : 'L\'entraînement régulier fait toute la différence.'}
          </p>
          <p className="text-xs text-gray-400 mb-6">Score enregistré dans votre historique.</p>
          <div className="flex gap-3">
            <button onClick={() => startModule(activeModule)} className="btn-primary flex-1 justify-center">Recommencer</button>
            <button onClick={() => setMode('hub')} className="btn-secondary flex-1 justify-center">Retour</button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'bilan-result') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 lg:pb-8">
        <BilanView
          scores={sessionScores}
          niveau={niveau}
          onRestart={startBilan}
          onBack={() => setMode('hub')}
        />
      </div>
    )
  }

  // ── HUB ──
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tests psychotechniques</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Exercices interactifs chronométrés · score calculé · progression enregistrée.
        </p>
      </div>

      {/* Sélecteur de niveau global */}
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm font-semibold text-gray-700">Niveau de difficulté</p>
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setNiveau(n)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                niveau === n
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              Niveau {n}
            </button>
          ))}
        </div>
      </div>

      {/* Bilan complet CTA */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white">
        <h2 className="font-bold text-lg mb-1">🏁 Bilan psychotechnique complet</h2>
        <p className="text-blue-200 text-sm mb-4">
          Enchaînez les 4 modules au niveau {niveau} et obtenez votre bilan : scores par module,
          score global, points forts, axes d&apos;amélioration et compatibilité indicative.
        </p>
        <button
          onClick={startBilan}
          className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors"
        >
          Lancer le bilan complet →
        </button>
      </div>

      {/* Modules individuels */}
      <div className="grid sm:grid-cols-2 gap-4">
        {MODULE_ORDER.map(m => {
          const meta = MODULE_META[m]
          const lastForModule = history.find(h => h.module === m)
          return (
            <div key={m} className="card p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{meta.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{meta.label}</h3>
                  {lastForModule && (
                    <p className="text-xs text-gray-400">Dernier score : <span className="font-semibold text-gray-600">{lastForModule.score} %</span></p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-1">{meta.description}</p>
              <button
                onClick={() => startModule(m)}
                className="btn-primary w-full justify-center"
              >
                Commencer →
              </button>
            </div>
          )
        })}
      </div>

      {/* Historique */}
      <HistoriqueSection rows={history} />

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Note RailReady :</strong> ces exercices sont inspirés des typologies de tests psychotechniques
        rencontrés en recrutement ferroviaire. Ils ne reproduisent pas les sujets réels ou confidentiels des opérateurs.
      </div>

      <div className="card p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Testez-vous en conditions réelles</p>
          <p className="text-xs text-gray-400 mt-0.5">Simulez un entretien complet avec notre recruteur IA</p>
        </div>
        <Link href="/entretien" className="btn-primary text-sm py-2 flex-shrink-0">
          Entretien IA →
        </Link>
      </div>
    </div>
  )
}
