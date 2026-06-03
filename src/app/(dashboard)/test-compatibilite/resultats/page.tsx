'use client'

// ============================================================
// RAILREADY — Page Résultats Test de Compatibilité
// /test-compatibilite/resultats
// ============================================================

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FeedbackWidget from '@/components/feedback/FeedbackWidget'
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

const NIVEAU_CONFIG = {
  fort: {
    label: 'Profil solide',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    barColor: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
  },
  moyen: {
    label: 'Profil à développer',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    barColor: 'bg-orange-400',
    badge: 'bg-orange-100 text-orange-700',
  },
  vigilance: {
    label: 'Point d\'attention',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    barColor: 'bg-red-400',
    badge: 'bg-red-100 text-red-700',
  },
}

function CompatBar({ score, niveau }: { score: number; niveau: 'fort' | 'moyen' | 'vigilance' }) {
  const color = NIVEAU_CONFIG[niveau].barColor
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-600 w-10 text-right">{score}%</span>
    </div>
  )
}

export default function ResultatsPage() {
  const router = useRouter()
  const [result, setResult] = useState<CompatibiliteResult | null>(null)
  const [betaModalOpen, setBetaModalOpen] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('compatibilite_result')
    if (!raw) {
      router.push('/test-compatibilite')
      return
    }
    setResult(JSON.parse(raw))
  }, [router])

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-3">⏳</div>
          <p>Chargement des résultats...</p>
        </div>
      </div>
    )
  }

  const niveauConfig = NIVEAU_CONFIG[result.niveauGlobal]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* En-tête résultats */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vos résultats</h1>
        <p className="text-gray-500">Test de compatibilité ferroviaire RailReady</p>
      </div>

      {/* Score global */}
      <div className={`rounded-2xl border-2 p-8 mb-8 text-center ${niveauConfig.bg} ${niveauConfig.border}`}>
        <div className="text-7xl font-black mb-2" style={{ color: result.niveauGlobal === 'fort' ? '#16a34a' : result.niveauGlobal === 'moyen' ? '#ea580c' : '#dc2626' }}>
          {result.scoreGlobal}
        </div>
        <div className="text-lg text-gray-500 mb-2">/ 100</div>
        <div className={`inline-block px-4 py-1.5 rounded-full font-semibold text-sm mb-4 ${niveauConfig.badge}`}>
          {niveauConfig.label}
        </div>
        <p className={`text-sm leading-relaxed max-w-lg mx-auto ${niveauConfig.color}`}>
          {result.messageGlobal}
        </p>
      </div>

      {/* Points forts / vigilance */}
      {(result.pointsForts.length > 0 || result.pointsVigilance.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {result.pointsForts.length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-100 p-5">
              <h3 className="font-semibold text-green-800 mb-3">✅ Vos points forts</h3>
              <ul className="space-y-2">
                {result.pointsForts.map((p, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="flex-shrink-0">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.pointsVigilance.length > 0 && (
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-5">
              <h3 className="font-semibold text-orange-800 mb-3">⚠️ Points de vigilance</h3>
              <ul className="space-y-2">
                {result.pointsVigilance.map((p, i) => (
                  <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                    <span className="flex-shrink-0">!</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Scores par dimension */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-5">Détail par dimension</h2>
        <div className="space-y-5">
          {[...result.dimensions]
            .sort((a, b) => b.score - a.score)
            .map((d, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{d.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NIVEAU_CONFIG[d.niveau].badge}`}>
                    {NIVEAU_CONFIG[d.niveau].label}
                  </span>
                </div>
                <CompatBar score={d.score} niveau={d.niveau} />
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {d.description}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Métiers recommandés */}
      {result.metiersRecommandes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-gray-900 mb-4 text-xl">
            🎯 Métiers les plus compatibles avec votre profil
          </h2>
          <div className="space-y-3">
            {result.metiersRecommandes.map((m, i) => (
              <Link
                key={m.slug}
                href={`/metiers/${m.slug}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">{m.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {i + 1}. {m.nom}
                    </span>
                    <span className="text-sm font-bold text-blue-600">{m.compatibilite}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${m.compatibilite}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{m.raison}</p>
                </div>
                <span className="text-gray-300 group-hover:text-blue-400 flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-500 border border-gray-200">
        {result.disclaimer}
      </div>

      {/* CTAs */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link
          href="/mentor"
          className="flex flex-col items-center gap-2 bg-gray-800 text-white rounded-xl p-4 hover:bg-gray-900 transition-colors text-center"
        >
          <span className="text-xl">💬</span>
          <span className="text-sm font-semibold">Parler au Mentor</span>
          <span className="text-xs text-gray-400">Discuter de mes résultats</span>
        </Link>
        <Link
          href="/entretien"
          className="flex flex-col items-center gap-2 bg-blue-600 text-white rounded-xl p-4 hover:bg-blue-700 transition-colors text-center"
        >
          <span className="text-xl">🎤</span>
          <span className="text-sm font-semibold">Simuler un entretien</span>
          <span className="text-xs text-blue-300">Pour le métier recommandé</span>
        </Link>
        <Link
          href="/metiers"
          className="flex flex-col items-center gap-2 bg-white text-gray-700 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors text-center"
        >
          <span className="text-xl">📋</span>
          <span className="text-sm font-semibold">Explorer les métiers</span>
          <span className="text-xs text-gray-400">Voir toutes les fiches</span>
        </Link>
      </div>

      {/* Feedback bêta détaillé */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🏗️</span>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Version bêta — votre avis compte</h3>
            <p className="text-sm text-amber-700 mb-3 leading-relaxed">
              Ce test est en cours d'amélioration. Si vous êtes cheminot(e) ou candidat(e) dans le ferroviaire,
              votre retour terrain est précieux pour calibrer les questions et les résultats.
            </p>
            <button
              onClick={() => setBetaModalOpen(true)}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
            >
              Donner mon retour terrain →
            </button>
          </div>
        </div>
      </div>

      {/* Modal feedback bêta */}
      <BetaFeedbackModal
        module="test_compatibilite"
        isOpen={betaModalOpen}
        onClose={() => setBetaModalOpen(false)}
        contexte={result ? `Score global: ${result.scoreGlobal}%` : undefined}
      />

      {/* Refaire le test */}
      <div className="text-center mt-6">
        <Link
          href="/test-compatibilite/quiz"
          className="text-sm text-gray-400 hover:text-blue-600 underline-offset-2 hover:underline"
        >
          Refaire le test
        </Link>
      </div>
    </div>
  )
}
