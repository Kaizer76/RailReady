'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal'

interface DimensionScore {
  dimension: string
  label: string
  score: number
  niveau: 'fort' | 'moyen' | 'vigilance'
  description: string
}

interface MetierMatch {
  slug: string
  nom: string
  emoji: string
  compatibilite: number
  raison: string
}

interface CompatibiliteResult {
  scoreGlobal: number
  niveauGlobal: 'fort' | 'moyen' | 'vigilance'
  dimensions: DimensionScore[]
  pointsForts: string[]
  pointsVigilance: string[]
  metiersRecommandes: MetierMatch[]
  messageGlobal: string
  disclaimer: string
}

const NIVEAU = {
  fort: {
    label: 'Profil solide',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: '✔',
  },
  moyen: {
    label: 'Profil à développer',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    bar: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    icon: '~',
  },
  vigilance: {
    label: "Point d'attention",
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-400',
    badge: 'bg-red-100 text-red-600',
    icon: '⚠',
  },
}

function ScoreRing({ score, niveau }: { score: number; niveau: 'fort' | 'moyen' | 'vigilance' }) {
  const color = niveau === 'fort' ? '#10b981' : niveau === 'moyen' ? '#f59e0b' : '#ef4444'
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

function DimBar({ score, niveau }: { score: number; niveau: 'fort' | 'moyen' | 'vigilance' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${NIVEAU[niveau].bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-500 w-8 text-right">{score}%</span>
    </div>
  )
}

function MetierBar({ pct, rank }: { pct: number; rank: number }) {
  const color = rank === 1 ? 'bg-blue-600' : rank === 2 ? 'bg-blue-400' : rank === 3 ? 'bg-blue-300' : 'bg-gray-200'
  return (
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function ResultatsPage() {
  const router = useRouter()
  const [result, setResult] = useState<CompatibiliteResult | null>(null)
  const [betaOpen, setBetaOpen] = useState(false)
  const [tab, setTab] = useState<'metiers' | 'dimensions'>('metiers')

  useEffect(() => {
    const raw = sessionStorage.getItem('compatibilite_result')
    if (!raw) { router.push('/test-compatibilite'); return }
    setResult(JSON.parse(raw))
  }, [router])

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Chargement des résultats...</p>
        </div>
      </div>
    )
  }

  const nv = NIVEAU[result.niveauGlobal]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8 space-y-6">

      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Vos résultats</h1>
        <p className="text-gray-500 text-sm mt-1">Test de compatibilité ferroviaire · RailReady</p>
      </div>

      {/* Score global */}
      <div className={`rounded-2xl border-2 p-8 ${nv.bg} ${nv.border}`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <ScoreRing score={result.scoreGlobal} niveau={result.niveauGlobal} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-3 ${nv.badge}`}>
              <span>{nv.icon}</span>
              <span>{nv.label}</span>
            </div>
            <p className={`text-sm leading-relaxed ${nv.color}`}>{result.messageGlobal}</p>

            {/* Forces & Vigilances inline */}
            <div className="mt-4 flex flex-wrap gap-2">
              {result.pointsForts.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                  ✔ {p}
                </span>
              ))}
              {result.pointsVigilance.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  ⚠ {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setTab('metiers')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'metiers' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Classement des métiers
        </button>
        <button
          onClick={() => setTab('dimensions')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'dimensions' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Détail par dimension
        </button>
      </div>

      {/* Classement métiers */}
      {tab === 'metiers' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 px-1">
            Classement de compatibilité avec votre profil — du plus au moins compatible
          </p>
          {result.metiersRecommandes.map((m, i) => (
            <Link
              key={m.slug}
              href={`/metiers/${m.slug}`}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                i === 0
                  ? 'border-blue-200 bg-blue-50 hover:border-blue-400'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              {/* Rang */}
              <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? 'bg-blue-700 text-white' : i === 1 ? 'bg-blue-100 text-blue-700' : i === 2 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {i + 1}
              </div>

              {/* Emoji métier */}
              <span className="text-2xl flex-shrink-0">{m.emoji}</span>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`font-semibold text-sm ${i === 0 ? 'text-blue-900' : 'text-gray-900'} group-hover:text-blue-700 transition-colors`}>
                    {m.nom}
                  </span>
                  <span className={`text-sm font-bold ml-auto flex-shrink-0 ${i === 0 ? 'text-blue-700' : 'text-gray-600'}`}>
                    {m.compatibilite}%
                  </span>
                </div>
                <MetierBar pct={m.compatibilite} rank={i + 1} />
                {i < 3 && (
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{m.raison}</p>
                )}
              </div>

              <span className="text-gray-300 group-hover:text-blue-400 flex-shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}

      {/* Détail dimensions */}
      {tab === 'dimensions' && (
        <div className="card p-6 space-y-5">
          {[...result.dimensions].sort((a, b) => b.score - a.score).map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-800">{d.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${NIVEAU[d.niveau].badge}`}>
                  {NIVEAU[d.niveau].label}
                </span>
              </div>
              <DimBar score={d.score} niveau={d.niveau} />
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{d.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/mentor" className="flex flex-col items-center gap-2 bg-gray-800 text-white rounded-2xl p-5 hover:bg-gray-900 transition-colors text-center">
          <span className="text-2xl">💬</span>
          <span className="text-sm font-semibold">Parler au Mentor</span>
          <span className="text-xs text-gray-400">Discuter de mes résultats</span>
        </Link>
        <Link
          href={`/entretien?metier=${result.metiersRecommandes[0]?.slug || ''}`}
          className="flex flex-col items-center gap-2 bg-blue-700 text-white rounded-2xl p-5 hover:bg-blue-800 transition-colors text-center"
        >
          <span className="text-2xl">🎤</span>
          <span className="text-sm font-semibold">Simuler un entretien</span>
          <span className="text-xs text-blue-300">Pour le métier recommandé</span>
        </Link>
        <Link href="/psychotechnique" className="flex flex-col items-center gap-2 bg-white text-gray-700 rounded-2xl p-5 border border-gray-200 hover:border-blue-300 transition-colors text-center">
          <span className="text-2xl">🧠</span>
          <span className="text-sm font-semibold">S'entraîner</span>
          <span className="text-xs text-gray-400">Exercices psychotechniques</span>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-400 leading-relaxed">
        {result.disclaimer}
      </div>

      {/* Feedback bêta */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🏗️</span>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1 text-sm">Version bêta</h3>
            <p className="text-xs text-amber-700 mb-3">
              Votre retour aide à calibrer le test. Si vous êtes cheminot(e) ou candidat(e), dites-nous ce qui ne correspond pas.
            </p>
            <button
              onClick={() => setBetaOpen(true)}
              className="text-xs bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Donner mon retour terrain
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/test-compatibilite/quiz" className="text-sm text-gray-400 hover:text-blue-600 hover:underline">
          Refaire le test →
        </Link>
      </div>

      <BetaFeedbackModal
        module="test_compatibilite"
        isOpen={betaOpen}
        onClose={() => setBetaOpen(false)}
        contexte={`Score global: ${result.scoreGlobal}%`}
      />
    </div>
  )
}
