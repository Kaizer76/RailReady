'use client'

import { useState } from 'react'
import Link from 'next/link'

const MODULES = [
  {
    id: 'memoire',
    icon: '🧩',
    label: 'Mémorisation',
    description: 'Mémorisez des séquences de chiffres, de lettres ou de formes.',
    niveaux: 3,
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-700',
    btnColor: 'bg-blue-700 hover:bg-blue-800',
  },
  {
    id: 'logique',
    icon: '🔢',
    label: 'Suites logiques',
    description: 'Trouvez le prochain élément dans une suite numérique ou alphabétique.',
    niveaux: 3,
    color: 'bg-purple-50 border-purple-200',
    accent: 'text-purple-700',
    btnColor: 'bg-purple-700 hover:bg-purple-800',
  },
  {
    id: 'concentration',
    icon: '🎯',
    label: 'Concentration',
    description: 'Repérez les différences et les erreurs dans une grille de symboles.',
    niveaux: 3,
    color: 'bg-green-50 border-green-200',
    accent: 'text-green-700',
    btnColor: 'bg-green-700 hover:bg-green-800',
  },
  {
    id: 'rapidite',
    icon: '⚡',
    label: 'Rapidité',
    description: 'Répondez le plus vite possible à des questions simples.',
    niveaux: 3,
    color: 'bg-orange-50 border-orange-200',
    accent: 'text-orange-700',
    btnColor: 'bg-orange-600 hover:bg-orange-700',
  },
]

export default function PsychotechniquePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [niveau, setNiveau] = useState(1)

  if (activeModule) {
    return (
      <ExerciceModule
        moduleId={activeModule}
        niveau={niveau}
        onBack={() => setActiveModule(null)}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entraînement psychotechnique</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Préparez-vous aux tests de sélection ferroviaire. 4 modules · 3 niveaux chacun.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Note RailReady :</strong> Ces exercices sont inspirés des typologies de tests psychotechniques
        rencontrés en recrutement ferroviaire. Ils ne reproduisent pas les sujets réels ou confidentiels
        des opérateurs.
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {MODULES.map(mod => (
          <div key={mod.id} className={`rounded-2xl border p-5 ${mod.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{mod.icon}</span>
              <div>
                <h3 className={`font-bold ${mod.accent}`}>{mod.label}</h3>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3].map(n => (
                    <span
                      key={n}
                      className={`w-2 h-2 rounded-full ${
                        n <= mod.niveaux ? mod.accent.replace('text-', 'bg-') : 'bg-gray-200'
                      } opacity-60`}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{mod.niveaux} niveaux</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{mod.description}</p>

            {/* Sélection niveau */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setNiveau(n)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    niveau === n
                      ? `${mod.btnColor} text-white`
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Niveau {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveModule(mod.id)}
              className={`w-full text-white text-sm font-semibold py-2.5 rounded-xl transition-all ${mod.btnColor}`}
            >
              Commencer →
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Testez-vous en conditions réelles</p>
          <p className="text-xs text-gray-400 mt-0.5">Simulez un entretien complet avec notre recruteur IA</p>
        </div>
        <Link href="/entretien" className="btn-primary text-sm py-2">
          Entretien IA →
        </Link>
      </div>
    </div>
  )
}

// ============================================================
// COMPOSANT EXERCICE
// ============================================================

type ModuleId = 'memoire' | 'logique' | 'concentration' | 'rapidite'

function ExerciceModule({
  moduleId,
  niveau,
  onBack,
}: {
  moduleId: string
  niveau: number
  onBack: () => void
}) {
  switch (moduleId as ModuleId) {
    case 'memoire':
      return <ExerciceMemoire niveau={niveau} onBack={onBack} />
    case 'logique':
      return <ExerciceLogique niveau={niveau} onBack={onBack} />
    case 'concentration':
      return <ExerciceConcentration niveau={niveau} onBack={onBack} />
    case 'rapidite':
      return <ExerciceRapidite niveau={niveau} onBack={onBack} />
    default:
      return null
  }
}

// ============================================================
// EXERCICE — MÉMORISATION
// ============================================================

function ExerciceMemoire({ niveau, onBack }: { niveau: number; onBack: () => void }) {
  const lengths = [4, 6, 8]
  const seqLen = lengths[niveau - 1]
  const [phase, setPhase] = useState<'display' | 'input' | 'result'>('display')
  const [sequence, setSequence] = useState<number[]>(() =>
    Array.from({ length: seqLen }, () => Math.floor(Math.random() * 10))
  )
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)
  const displayTime = [3, 4, 5][niveau - 1]

  function start() {
    setTimeout(() => setPhase('input'), displayTime * 1000)
    setPhase('display')
  }

  function check() {
    const input = answer.replace(/\s/g, '').split('').map(Number)
    let correct = 0
    sequence.forEach((n, i) => {
      if (input[i] === n) correct++
    })
    setScore({ correct, total: sequence.length })
    setPhase('result')
  }

  function restart() {
    setSequence(Array.from({ length: seqLen }, () => Math.floor(Math.random() * 10)))
    setAnswer('')
    setScore(null)
    setPhase('display')
    setTimeout(() => setPhase('input'), displayTime * 1000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">
        ← Retour
      </button>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">🧩 Mémorisation</h2>
        <p className="text-sm text-gray-400 mt-1">Niveau {niveau} · {seqLen} chiffres · {displayTime}s d&apos;affichage</p>
      </div>

      <div className="card p-8 text-center min-h-48 flex flex-col items-center justify-center">
        {phase === 'display' && (
          <>
            <p className="text-xs text-gray-400 mb-4">Mémorisez cette séquence :</p>
            <div className="flex gap-3 justify-center">
              {sequence.map((n, i) => (
                <span key={i} className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center text-2xl font-black">
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">Disparaît dans {displayTime}s...</p>
          </>
        )}
        {phase === 'input' && (
          <>
            <p className="text-sm font-medium text-gray-700 mb-4">Entrez la séquence mémorisée :</p>
            <input
              type="text"
              className="input text-center text-2xl tracking-widest font-mono max-w-xs"
              placeholder={'_'.repeat(seqLen)}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              maxLength={seqLen}
              autoFocus
            />
            <button onClick={check} className="btn-primary mt-4">Valider</button>
          </>
        )}
        {phase === 'result' && score && (
          <>
            <div className={`text-6xl font-black mb-2 ${score.correct === score.total ? 'text-green-500' : score.correct > score.total / 2 ? 'text-amber-500' : 'text-red-500'}`}>
              {score.correct}/{score.total}
            </div>
            <p className="text-gray-500 text-sm mb-1">
              {score.correct === score.total ? 'Parfait !' : score.correct > score.total / 2 ? 'Bien !' : 'À retravailler'}
            </p>
            <p className="text-xs text-gray-400 mb-6">Séquence correcte : {sequence.join(' ')}</p>
            <div className="flex gap-3">
              <button onClick={restart} className="btn-primary">Nouvel exercice</button>
              <button onClick={onBack} className="btn-secondary">Retour</button>
            </div>
          </>
        )}
      </div>

      {phase === 'display' && (
        <button onClick={start} className="btn-primary w-full hidden">Commencer</button>
      )}
    </div>
  )
}

// ============================================================
// EXERCICE — SUITES LOGIQUES
// ============================================================

interface SuiteQuestion {
  sequence: (number | string)[]
  reponse: number | string
  options: (number | string)[]
  type: string
}

function generateSuite(niveau: number): SuiteQuestion {
  const types = niveau === 1
    ? ['arithmetic']
    : niveau === 2
    ? ['arithmetic', 'geometric']
    : ['arithmetic', 'geometric', 'fibonacci']

  const type = types[Math.floor(Math.random() * types.length)]
  const start = Math.floor(Math.random() * 5) + 1
  const step = Math.floor(Math.random() * 4) + 2
  let sequence: number[] = []
  let reponse: number = 0

  if (type === 'arithmetic') {
    sequence = [start, start + step, start + step * 2, start + step * 3, start + step * 4]
    reponse = start + step * 5
  } else if (type === 'geometric') {
    const ratio = Math.floor(Math.random() * 2) + 2
    sequence = [start, start * ratio, start * ratio ** 2, start * ratio ** 3, start * ratio ** 4]
    reponse = start * ratio ** 5
  } else {
    sequence = [1, 1, 2, 3, 5, 8]
    reponse = 13
  }

  const shown = sequence.slice(0, 5)
  const wrongOptions = [
    reponse + step,
    reponse - step,
    reponse + 1,
  ].filter(n => n !== reponse && n > 0)

  const options = [reponse, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5)

  return { sequence: shown, reponse, options, type }
}

function ExerciceLogique({ niveau, onBack }: { niveau: number; onBack: () => void }) {
  const [question, setQuestion] = useState<SuiteQuestion>(() => generateSuite(niveau))
  const [selected, setSelected] = useState<number | string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  function answer(opt: number | string) {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
    setStats(s => ({
      correct: s.correct + (opt === question.reponse ? 1 : 0),
      total: s.total + 1,
    }))
  }

  function next() {
    setQuestion(generateSuite(niveau))
    setSelected(null)
    setAnswered(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">← Retour</button>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🔢 Suites logiques</h2>
          <p className="text-sm text-gray-400">Niveau {niveau}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-blue-700">{stats.correct}/{stats.total}</div>
          <div className="text-xs text-gray-400">Score</div>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm text-gray-500 mb-4">Quel nombre vient ensuite dans cette suite ?</p>
        <div className="flex gap-3 justify-center mb-6 flex-wrap">
          {question.sequence.map((n, i) => (
            <span key={i} className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-gray-900">
              {n}
            </span>
          ))}
          <span className="w-12 h-12 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center text-blue-400 text-2xl font-black">
            ?
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => answer(opt)}
              disabled={answered}
              className={`py-3 rounded-xl text-lg font-bold transition-all ${
                answered
                  ? opt === question.reponse
                    ? 'bg-green-100 text-green-700 border-2 border-green-400'
                    : opt === selected
                    ? 'bg-red-100 text-red-700 border-2 border-red-400'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                  : 'bg-gray-50 text-gray-900 border border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {answered && (
          <div className="mt-4">
            <p className={`text-sm font-medium text-center mb-3 ${selected === question.reponse ? 'text-green-700' : 'text-red-600'}`}>
              {selected === question.reponse ? '✔ Correct !' : `✗ La bonne réponse était ${question.reponse}`}
            </p>
            <button onClick={next} className="btn-primary w-full">Suite →</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// EXERCICE — CONCENTRATION (Grille symboles)
// ============================================================

const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

function generateGrid(size: number, targetSymbol: string) {
  return Array.from({ length: size * size }, () =>
    Math.random() < 0.15 ? targetSymbol : SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))]
  )
}

function ExerciceConcentration({ niveau, onBack }: { niveau: number; onBack: () => void }) {
  const gridSize = [5, 6, 7][niveau - 1]
  const target = 'X'
  const [grid, setGrid] = useState<string[]>(() => generateGrid(gridSize, target))
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)

  const correctIndices = new Set(grid.map((s, i) => s === target ? i : -1).filter(i => i >= 0))

  function toggle(i: number) {
    if (checked) return
    setSelected(prev => {
      const n = new Set(prev)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })
  }

  function check() {
    setChecked(true)
  }

  function restart() {
    setGrid(generateGrid(gridSize, target))
    setSelected(new Set())
    setChecked(false)
  }

  const correct = Array.from(selected).filter(i => correctIndices.has(i)).length
  const missed = Array.from(correctIndices).filter(i => !selected.has(i)).length
  const false_pos = Array.from(selected).filter(i => !correctIndices.has(i)).length

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">← Retour</button>
      <div>
        <h2 className="text-xl font-bold text-gray-900">🎯 Concentration</h2>
        <p className="text-sm text-gray-400">Niveau {niveau} · Grille {gridSize}×{gridSize}</p>
      </div>

      <div className="card p-5">
        <p className="text-sm text-gray-700 mb-1">
          Cliquez sur toutes les cases contenant la lettre{' '}
          <strong className="text-blue-700 text-lg">X</strong>
        </p>
        <p className="text-xs text-gray-400 mb-5">Ne cliquez pas sur les autres lettres.</p>

        <div
          className="grid gap-1.5 mx-auto"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.map((sym, i) => {
            const isSelected = selected.has(i)
            const isCorrect = correctIndices.has(i)
            let cls = 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
            if (checked) {
              if (isCorrect && isSelected) cls = 'bg-green-100 border-green-400 text-green-700 border-2'
              else if (isCorrect && !isSelected) cls = 'bg-red-100 border-red-400 text-red-700 border-2'
              else if (!isCorrect && isSelected) cls = 'bg-orange-100 border-orange-400 text-orange-700 border-2'
              else cls = 'bg-gray-100 border-gray-200 text-gray-500'
            } else if (isSelected) {
              cls = 'bg-blue-600 border-blue-600 text-white border-2'
            }
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`h-10 rounded-lg text-sm font-bold transition-all ${cls}`}
              >
                {sym}
              </button>
            )
          })}
        </div>

        {!checked ? (
          <button onClick={check} className="btn-primary w-full mt-5">Vérifier</button>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-xl font-black text-green-600">{correct}</div>
                <div className="text-xs text-green-700">Trouvés</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <div className="text-xl font-black text-red-600">{missed}</div>
                <div className="text-xs text-red-700">Manqués</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="text-xl font-black text-orange-600">{false_pos}</div>
                <div className="text-xs text-orange-700">Erreurs</div>
              </div>
            </div>
            <button onClick={restart} className="btn-primary w-full">Nouvel exercice</button>
            <button onClick={onBack} className="btn-secondary w-full">Retour aux modules</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// EXERCICE — RAPIDITÉ
// ============================================================

interface RapiditeQuestion {
  question: string
  reponse: number | string
  options: (number | string)[]
}

function generateRapidite(niveau: number): RapiditeQuestion {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  const ops = niveau === 1 ? ['+', '-'] : niveau === 2 ? ['+', '-', '×'] : ['+', '-', '×', 'pair/impair']
  const op = ops[Math.floor(Math.random() * ops.length)]

  let question = ''
  let reponse: number | string = 0

  if (op === '+') {
    question = `${a} + ${b} = ?`
    reponse = a + b
  } else if (op === '-') {
    const [x, y] = [Math.max(a, b), Math.min(a, b)]
    question = `${x} - ${y} = ?`
    reponse = x - y
  } else if (op === '×') {
    const [x, y] = [Math.min(a, 5), Math.min(b, 5)]
    question = `${x} × ${y} = ?`
    reponse = x * y
  } else {
    const n = Math.floor(Math.random() * 20) + 1
    question = `${n} est ?`
    reponse = n % 2 === 0 ? 'Pair' : 'Impair'
  }

  const r = reponse as number
  const wrong = typeof r === 'number'
    ? [r + 1, r - 1, r + 2].filter(n => n !== r && n >= 0)
    : ['Pair', 'Impair'].filter(s => s !== reponse)

  const options = [reponse, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5)
  return { question, reponse, options }
}

function ExerciceRapidite({ niveau, onBack }: { niveau: number; onBack: () => void }) {
  const [question, setQuestion] = useState<RapiditeQuestion>(() => generateRapidite(niveau))
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState<number | string | null>(null)
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, bestStreak: 0 })

  function answer(opt: number | string) {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
    const isCorrect = opt === question.reponse
    setStats(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
      streak: isCorrect ? s.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(s.bestStreak, s.streak + 1) : s.bestStreak,
    }))
    setTimeout(() => {
      setQuestion(generateRapidite(niveau))
      setSelected(null)
      setAnswered(false)
    }, 600)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">← Retour</button>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">⚡ Rapidité</h2>
          <p className="text-sm text-gray-400">Niveau {niveau}</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-blue-700">{stats.correct}/{stats.total}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          {stats.streak > 1 && (
            <div className="text-center">
              <div className="text-2xl font-black text-orange-500">×{stats.streak}</div>
              <div className="text-xs text-gray-400">Série</div>
            </div>
          )}
        </div>
      </div>

      <div className="card p-8 text-center">
        <p className="text-3xl font-black text-gray-900 mb-8">{question.question}</p>
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => answer(opt)}
              disabled={answered}
              className={`py-4 text-xl font-bold rounded-xl transition-all ${
                answered
                  ? opt === question.reponse
                    ? 'bg-green-100 text-green-700 border-2 border-green-400'
                    : opt === selected
                    ? 'bg-red-100 text-red-700 border-2 border-red-400'
                    : 'bg-gray-50 text-gray-400'
                  : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-orange-50 hover:border-orange-400 active:scale-95'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="text-sm text-gray-400 hover:underline">
          Terminer et voir le score
        </button>
      </div>
    </div>
  )
}
