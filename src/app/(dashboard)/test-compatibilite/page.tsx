'use client'

// ============================================================
// RAILREADY — Page Intro Test de Compatibilité
// /test-compatibilite
// ============================================================

import Link from 'next/link'

// Dimensions V3 — 14 dimensions situationnelles
const DIMENSIONS = [
  { emoji: '🧍', label: 'Rapport à la solitude' },
  { emoji: '🤝', label: 'Contact humain et service' },
  { emoji: '⚡', label: 'Gestion simultanée et multitâche' },
  { emoji: '🔄', label: 'Répétitivité et maîtrise' },
  { emoji: '🌙', label: 'Travail de nuit profond' },
  { emoji: '📅', label: 'Horaires décalés' },
  { emoji: '💪', label: 'Résistance physique et conditions difficiles' },
  { emoji: '⚖️', label: 'Prise de décision autonome' },
  { emoji: '🎯', label: 'Autorité et gestion de conflit' },
  { emoji: '🔩', label: 'Aptitude technique' },
  { emoji: '🌀', label: 'Adaptation aux imprévus' },
  { emoji: '🧘', label: 'Gestion du stress' },
  { emoji: '📍', label: 'Mobilité géographique' },
]

export default function TestCompatibilitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* En-tête */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Test de compatibilité ferroviaire
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          27 questions situationnelles. 13 dimensions. Une vision honnête de votre profil — et des métiers ferroviaires qui vous correspondent vraiment.
        </p>
      </div>

      {/* Ce que le test évalue */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Ce que ce test évalue :</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIMENSIONS.map((d, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-lg">{d.emoji}</span>
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ce que vous obtiendrez */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">À la fin du test :</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 flex-shrink-0">✓</span>
            Un <strong>score global</strong> et un profil par dimension
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 flex-shrink-0">✓</span>
            Vos <strong>points forts</strong> pour le secteur ferroviaire
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 flex-shrink-0">✓</span>
            Vos <strong>points de vigilance</strong> à travailler
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 flex-shrink-0">✓</span>
            Les <strong>3 métiers les plus compatibles</strong> avec votre profil
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-500 border border-gray-200">
        <strong>Important :</strong> Ce test est un outil d'orientation et de réflexion personnelle.
        Ce n'est pas un test de recrutement officiel. Les termes "apte" ou "inapte" n'y figurent
        jamais. Seul le processus de sélection des opérateurs ferroviaires détermine votre aptitude
        réelle à un poste.
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/test-compatibilite/quiz"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Commencer le test →
        </Link>
        <p className="text-sm text-gray-400 mt-3">
          10 à 12 minutes · Résultats immédiats · Sauvegardé dans votre profil
        </p>
      </div>
    </div>
  )
}
