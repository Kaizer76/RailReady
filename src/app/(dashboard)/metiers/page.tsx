'use client'

// ============================================================
// RAILREADY — Page Liste des Métiers
// /metiers
// ============================================================

import Link from 'next/link'
import { METIERS } from '@/data/metiers'

const CATEGORIE_LABELS: Record<string, { label: string; color: string }> = {
  conduite: { label: 'Conduite', color: 'bg-blue-100 text-blue-800' },
  circulation: { label: 'Circulation', color: 'bg-purple-100 text-purple-800' },
  commercial: { label: 'Commercial', color: 'bg-green-100 text-green-800' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  infrastructure: { label: 'Infrastructure', color: 'bg-stone-100 text-stone-800' },
}

export default function MetiersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Les métiers ferroviaires
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Explorez les 7 métiers présentés par RailReady. Pour chaque fiche : réalités du terrain,
          journée type, contraintes, qualités recherchées et conseils pour réussir votre candidature.
        </p>
        <p className="mt-3 text-sm text-gray-400">
          Informations indicatives basées sur des sources publiques — juin 2026.
        </p>
      </div>

      {/* Grille des métiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {METIERS.map((metier) => {
          const catConfig = CATEGORIE_LABELS[metier.categorie]
          return (
            <Link
              key={metier.slug}
              href={`/metiers/${metier.slug}`}
              className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Header carte */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{metier.emoji}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${catConfig.color}`}>
                    {catConfig.label}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {metier.nom}
                </h2>
                <p className="text-sm text-gray-500 mt-1 italic leading-snug">
                  "{metier.accroche}"
                </p>
              </div>

              {/* Infos clés */}
              <div className="px-5 pb-4 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>⏰</span>
                  <span>{metier.horaires.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>💰</span>
                  <span>{metier.salaire.brut_debutant}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🎓</span>
                  <span>{metier.formation.niveau_requis.split('.')[0]}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Voir la fiche complète →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* CTA bas de page */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Vous ne savez pas encore quel métier vous correspond ?
        </h3>
        <p className="text-gray-600 mb-4">
          Le test de compatibilité RailReady analyse votre profil sur 8 dimensions et vous recommande
          les métiers les plus adaptés à votre façon d'être.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/test-compatibilite"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Faire le test de compatibilité
          </Link>
          <Link
            href="/mentor"
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg font-medium border border-gray-200 hover:border-blue-300 transition-colors"
          >
            💬 Parler au Mentor
          </Link>
        </div>
      </div>
    </div>
  )
}
