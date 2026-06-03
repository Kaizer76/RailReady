'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { METIERS } from '@/data/metiers'

export default function EntretienPage() {
  const router = useRouter()
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [niveau, setNiveau] = useState<'debutant' | 'intermediaire' | 'avance'>('debutant')

  function handleStart() {
    if (!selectedSlug) return
    const params = new URLSearchParams({ poste: selectedSlug, niveau })
    router.push(`/entretien/session?${params.toString()}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulateur d'entretien</h1>
        <p className="text-gray-500">
          Choisissez le poste et votre niveau, puis entraînez-vous face à un recruteur IA.
          Vous recevrez un rapport détaillé à la fin.
        </p>
      </div>

      {/* Sélection du métier */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">1. Choisissez le poste</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {METIERS.map(m => (
            <button
              key={m.slug}
              onClick={() => setSelectedSlug(m.slug)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                selectedSlug === m.slug
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{m.emoji}</span>
              <div>
                <div className={`font-semibold text-sm ${selectedSlug === m.slug ? 'text-blue-800' : 'text-gray-900'}`}>
                  {m.nom}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">
                  {m.accroche}
                </div>
              </div>
              {selectedSlug === m.slug && (
                <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection du niveau */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">2. Votre niveau</h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { val: 'debutant', label: 'Débutant', desc: 'Sans expérience ferroviaire' },
            { val: 'intermediaire', label: 'Intermédiaire', desc: 'Quelques connaissances du secteur' },
            { val: 'avance', label: 'Avancé', desc: 'Expérience terrain ou reconversion ciblée' },
          ] as const).map(n => (
            <button
              key={n.val}
              onClick={() => setNiveau(n.val)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                niveau === n.val
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`font-semibold text-sm mb-1 ${niveau === n.val ? 'text-blue-800' : 'text-gray-800'}`}>
                {n.label}
              </div>
              <div className="text-xs text-gray-400 leading-snug">{n.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Informations */}
      <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Déroulement de la simulation</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">1.</span>Le recruteur IA vous accueille et vous demande de vous présenter</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">2.</span>Il pose des questions sur vos motivations, votre connaissance du métier et votre comportement</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">3.</span>Il vous soumet une mise en situation réaliste</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">4.</span>À la fin, tapez <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">/fin</code> pour obtenir votre rapport complet</li>
        </ul>
        <p className="text-xs text-gray-400 mt-3 italic">
          Simulation pédagogique basée sur les pratiques du secteur. Ne reproduit pas de sujets d'examen officiels.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        disabled={!selectedSlug}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          selectedSlug
            ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {selectedSlug
          ? `Démarrer l'entretien — ${METIERS.find(m => m.slug === selectedSlug)?.nom}`
          : 'Sélectionnez un poste pour continuer'}
      </button>
    </div>
  )
}
