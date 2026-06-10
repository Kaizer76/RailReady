import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMetierBySlug, METIERS } from '@/data/metiers'
import MetierTabs from './MetierTabs'

export function generateStaticParams() {
  return METIERS.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const metier = getMetierBySlug(params.slug)
  if (!metier) return {}
  return {
    title: `${metier.nom} — Fiche métier RailReady`,
    description: metier.accroche,
  }
}

const CATEGORIE_COLORS: Record<string, string> = {
  conduite: 'bg-blue-100 text-blue-700',
  circulation: 'bg-purple-100 text-purple-700',
  commercial: 'bg-green-100 text-green-700',
  maintenance: 'bg-orange-100 text-orange-700',
  infrastructure: 'bg-red-100 text-red-700',
}

export default function MetierDetailPage({ params }: { params: { slug: string } }) {
  const metier = getMetierBySlug(params.slug)
  if (!metier) notFound()

  const categorieCls = CATEGORIE_COLORS[metier.categorie] || 'bg-gray-100 text-gray-700'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Fil d'Ariane */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/metiers" className="hover:text-blue-600 transition-colors">Métiers</Link>
        <span>›</span>
        <span className="text-gray-700">{metier.nom}</span>
      </nav>

      {/* En-tête */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
            {metier.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{metier.nom}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${categorieCls}`}>
                {metier.categorie}
              </span>
            </div>
            <p className="text-gray-500 italic text-sm">&ldquo;{metier.accroche}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Navigation onglets + contenu */}
      <MetierTabs metier={metier} />
    </div>
  )
}
