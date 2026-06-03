// ============================================================
// RAILREADY — Page Fiche Métier Détaillée
// /metiers/[slug]
// ============================================================

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMetierBySlug, METIERS } from '@/data/metiers'

// SSG — génère toutes les pages à la compilation
export function generateStaticParams() {
  return METIERS.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const metier = getMetierBySlug(params.slug)
  if (!metier) return {}
  return {
    title: `${metier.nom} — RailReady`,
    description: metier.accroche,
  }
}

interface Props {
  params: { slug: string }
}

function ScoreBadge({ niveau }: { niveau: 'fort' | 'moyen' | 'faible' }) {
  const config = {
    fort: { label: 'Indispensable', color: 'bg-red-100 text-red-700' },
    moyen: { label: 'Important', color: 'bg-orange-100 text-orange-700' },
    faible: { label: 'Secondaire', color: 'bg-gray-100 text-gray-600' },
  }[niveau]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

function DimensionBar({ score, label }: { score: number; label: string }) {
  const color = score >= 4 ? 'bg-red-500' : score >= 3 ? 'bg-orange-400' : 'bg-gray-300'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-500 w-8 text-right">{score}/5</span>
    </div>
  )
}

const DIMENSION_LABELS: Record<string, string> = {
  horaires_decales: 'Horaires décalés',
  gestion_stress: 'Gestion du stress',
  autonomie: 'Autonomie',
  relation_client: 'Relation client',
  rigueur: 'Rigueur',
  mobilite: 'Mobilité',
  aptitude_technique: 'Aptitude technique',
  engagement_securite: 'Sécurité',
}

export default function MetierDetailPage({ params }: Props) {
  const metier = getMetierBySlug(params.slug)
  if (!metier) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/metiers" className="hover:text-blue-600">Métiers</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{metier.nom}</span>
      </nav>

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{metier.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{metier.nom}</h1>
            <p className="text-gray-500 mt-1 italic">"{metier.accroche}"</p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">{metier.description}</p>
      </div>

      {/* Avertissement données à valider */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
        <strong>Note RailReady :</strong> Certaines informations de cette fiche sont signalées{' '}
        <em>[À VALIDER]</em>. Elles sont basées sur des sources publiques et seront affinées par
        l'expérience terrain du fondateur. Les informations salariales sont indicatives (juin 2026).
      </div>

      <div className="space-y-10">
        {/* Missions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Missions</h2>
          <ul className="space-y-2">
            {metier.missions.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">▸</span>
                {m}
              </li>
            ))}
          </ul>
        </section>

        {/* Journée type */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">📅 Journée type</h2>
          <p className="text-gray-600 mb-4 italic">{metier.journee_type.intro}</p>
          <div className="space-y-3">
            {metier.journee_type.etapes.map((etape, i) => (
              <div key={i} className="flex gap-4">
                <span className="font-mono text-sm text-blue-600 w-20 flex-shrink-0 pt-0.5">
                  {etape.heure}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{etape.description}</p>
              </div>
            ))}
          </div>
          {metier.journee_type.note && (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 rounded p-3">
              {metier.journee_type.note}
            </p>
          )}
        </section>

        {/* Horaires */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">⏰ Horaires et roulement</h2>
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <div>
              <span className="font-medium text-gray-700">Type : </span>
              <span className="text-gray-600">{metier.horaires.type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Détail : </span>
              <span className="text-gray-600">{metier.horaires.details}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Roulement : </span>
              <span className="text-gray-600">{metier.horaires.roulement}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Astreintes : </span>
              <span className={metier.horaires.astreintes ? 'text-orange-600 font-medium' : 'text-green-600'}>
                {metier.horaires.astreintes ? 'Oui, possibles' : 'Non'}
              </span>
            </div>
            {metier.horaires.note_validation && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded p-2 mt-2">
                {metier.horaires.note_validation}
              </p>
            )}
          </div>
        </section>

        {/* Avantages / Contraintes */}
        <section className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">✅ Avantages</h2>
            <ul className="space-y-2">
              {metier.avantages.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-green-500 flex-shrink-0 mt-0.5">+</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Contraintes</h2>
            <ul className="space-y-2">
              {metier.contraintes.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-orange-500 flex-shrink-0 mt-0.5">—</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Difficultés réelles */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🧠 Difficultés réelles du métier</h2>
          <p className="text-sm text-gray-500 mb-3 italic">Ce que les candidats sous-estiment souvent.</p>
          <ul className="space-y-3">
            {metier.difficultes.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                {d}
              </li>
            ))}
          </ul>
        </section>

        {/* Qualités recherchées */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🌟 Qualités recherchées</h2>
          <div className="grid gap-3">
            {metier.qualites_recherchees.map((q, i) => (
              <div key={i} className="bg-blue-50 rounded-lg p-4">
                <div className="font-semibold text-blue-900 mb-1">{q.qualite}</div>
                <p className="text-sm text-blue-700">{q.pourquoi}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Idées reçues */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Idées reçues vs réalité</h2>
          <div className="space-y-4">
            {metier.idees_recues.map((ir, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 flex items-start gap-2">
                  <span>❌</span>
                  <span>"{ir.idee}"</span>
                </div>
                <div className="bg-white px-4 py-3 text-sm text-gray-700 flex items-start gap-2">
                  <span>✅</span>
                  <span>{ir.realite}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Erreurs fréquentes */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚫 Erreurs fréquentes des candidats</h2>
          <ul className="space-y-2">
            {metier.erreurs_frequentes.map((e, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
                {e}
              </li>
            ))}
          </ul>
        </section>

        {/* Conseils terrain */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Conseils terrain</h2>
          <ul className="space-y-3">
            {metier.conseils_terrain.map((c, i) => (
              <li key={i} className={`text-sm leading-relaxed ${c.includes('[À VALIDER]') ? 'text-amber-700 bg-amber-50 rounded p-3' : 'text-gray-700 flex items-start gap-2'}`}>
                {!c.includes('[À VALIDER]') && <span className="text-blue-500 flex-shrink-0 mt-0.5">→</span>}
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Profil idéal */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Profil requis</h2>
          <p className="text-sm text-gray-500 mb-4">Niveau d'exigence par dimension (5 = indispensable)</p>
          <div className="space-y-3">
            {Object.entries(metier.profil_ideal)
              .sort(([, a], [, b]) => b - a)
              .map(([dim, score]) => (
                <DimensionBar
                  key={dim}
                  score={score}
                  label={DIMENSION_LABELS[dim] || dim}
                />
              ))}
          </div>
        </section>

        {/* Salaire */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Rémunération</h2>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Débutant</div>
                <div className="font-semibold text-gray-900">{metier.salaire.brut_debutant}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Expérimenté</div>
                <div className="font-semibold text-gray-900">{metier.salaire.brut_experimente}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Primes possibles</div>
              <div className="flex flex-wrap gap-2">
                {metier.salaire.primes.map((p, i) => (
                  <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Avantages en nature</div>
              <div className="flex flex-wrap gap-2">
                {metier.salaire.avantages_nature.map((a, i) => (
                  <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
              {metier.salaire.note_validation}
            </p>
          </div>
        </section>

        {/* Formation */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎓 Formation</h2>
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <div>
              <span className="font-medium text-gray-700">Niveau requis : </span>
              <span className="text-gray-600">{metier.formation.niveau_requis}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Durée : </span>
              <span className="text-gray-600">{metier.formation.duree}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Lieu : </span>
              <span className="text-gray-600">{metier.formation.lieu}</span>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
              {metier.formation.note}
            </p>
          </div>
        </section>

      </div>

      {/* CTA */}
      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        <Link
          href={`/entretien?poste=${metier.slug}`}
          className="flex flex-col items-center gap-2 bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition-colors text-center"
        >
          <span className="text-2xl">🎤</span>
          <span className="font-semibold">Simuler un entretien</span>
          <span className="text-sm text-blue-200">Pour le poste de {metier.nom}</span>
        </Link>
        <Link
          href="/mentor"
          className="flex flex-col items-center gap-2 bg-gray-800 text-white rounded-xl p-6 hover:bg-gray-900 transition-colors text-center"
        >
          <span className="text-2xl">💬</span>
          <span className="font-semibold">Parler au Mentor</span>
          <span className="text-sm text-gray-400">Poser vos questions sur ce métier</span>
        </Link>
      </div>

      {/* Retour */}
      <div className="mt-8 text-center">
        <Link href="/metiers" className="text-gray-500 hover:text-blue-600 text-sm">
          ← Retour à tous les métiers
        </Link>
      </div>
    </div>
  )
}
