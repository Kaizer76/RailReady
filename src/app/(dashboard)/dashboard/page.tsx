import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { METIERS } from '@/data/metiers'

interface EntretienSession {
  id: string
  poste: string | null
  score: number | null
  created_at: string
}

export const metadata = { title: 'Tableau de bord' }

async function getUserData(userId: string) {
  const supabase = createServerClient()

  // Sessions quiz
  const { data: quizSessions } = await supabase
    .from('user_quiz_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)

  // Sessions entretien
  const { data: entretienSessions } = await supabase
    .from('ai_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    lastQuiz: quizSessions?.[0] || null,
    entretienSessions: entretienSessions || [],
  }
}

const ACTIONS_RAPIDES = [
  {
    href: '/test-compatibilite',
    icon: '🧭',
    label: 'Faire le test de compatibilité',
    desc: '14 questions · 5 minutes',
    color: 'bg-blue-700 hover:bg-blue-800 text-white',
  },
  {
    href: '/entretien',
    icon: '🎤',
    label: 'Simuler un entretien',
    desc: '7 métiers disponibles',
    color: 'bg-gray-800 hover:bg-gray-900 text-white',
  },
  {
    href: '/mentor',
    icon: '💬',
    label: 'Parler au Mentor',
    desc: 'Orientation · Conseils terrain',
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  {
    href: '/metiers',
    icon: '📋',
    label: 'Explorer les métiers',
    desc: '7 fiches détaillées',
    color: 'bg-white hover:border-blue-300 text-gray-800 border border-gray-200',
  },
]

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const prenom = user?.user_metadata?.prenom || 'Candidat'
  const { lastQuiz, entretienSessions } = await getUserData(user!.id)

  const score = lastQuiz?.score
  const hasQuiz = score !== null && score !== undefined
  const nbEntretiens = entretienSessions.length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {prenom} 👋
        </h1>
        <p className="text-gray-500 mt-1">Votre espace de préparation ferroviaire</p>
      </div>

      {/* Bannière de bienvenue si nouveau */}
      {!hasQuiz && nbEntretiens === 0 && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">🚆</span>
            <div>
              <h2 className="font-bold text-lg mb-1">Bienvenue sur RailReady !</h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-4">
                Commencez par le test de compatibilité pour découvrir les métiers qui vous correspondent.
                Ça prend 5 minutes et vous aurez immédiatement une vision claire de votre profil.
              </p>
              <Link href="/test-compatibilite" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                Commencer le test →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className={`text-3xl font-black mb-1 ${hasQuiz ? 'text-blue-700' : 'text-gray-300'}`}>
            {hasQuiz ? `${score}/100` : '—'}
          </div>
          <div className="text-sm text-gray-500">Score compatibilité</div>
          {hasQuiz && (
            <Link href="/test-compatibilite/resultats" className="text-xs text-blue-600 mt-1 hover:underline block">
              Voir les résultats →
            </Link>
          )}
        </div>

        <div className="card p-5">
          <div className={`text-3xl font-black mb-1 ${nbEntretiens > 0 ? 'text-blue-700' : 'text-gray-300'}`}>
            {nbEntretiens}
          </div>
          <div className="text-sm text-gray-500">Entretiens simulés</div>
          {nbEntretiens > 0 && (
            <Link href="/entretien/historique" className="text-xs text-blue-600 mt-1 hover:underline block">
              Voir l'historique →
            </Link>
          )}
        </div>

        <div className="card p-5 col-span-2 md:col-span-1">
          <div className="text-3xl font-black text-blue-700 mb-1">{METIERS.length}</div>
          <div className="text-sm text-gray-500">Métiers disponibles</div>
          <Link href="/metiers" className="text-xs text-blue-600 mt-1 hover:underline block">
            Explorer les fiches →
          </Link>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACTIONS_RAPIDES.map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${a.color}`}
            >
              <span className="text-2xl flex-shrink-0">{a.icon}</span>
              <div>
                <div className="font-semibold text-sm">{a.label}</div>
                <div className="text-xs opacity-75 mt-0.5">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Derniers entretiens */}
      {nbEntretiens > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Derniers entretiens simulés</h2>
          <div className="space-y-3">
            {entretienSessions.slice(0, 3).map((s: EntretienSession, i: number) => (
              <div key={i} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  🎤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {s.poste || 'Entretien ferroviaire'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </div>
                </div>
                {s.score !== null && (
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-blue-700">{s.score}/100</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métiers en avant */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4">Découvrir les métiers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METIERS.slice(0, 4).map(m => (
            <Link
              key={m.slug}
              href={`/metiers/${m.slug}`}
              className="card p-4 text-center hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-xs font-medium text-gray-700 group-hover:text-blue-700 transition-colors leading-snug">
                {m.nom}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link href="/metiers" className="text-sm text-blue-700 hover:underline">
            Voir les 7 métiers →
          </Link>
        </div>
      </div>
    </div>
  )
}
