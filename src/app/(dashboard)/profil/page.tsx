import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

export const metadata = { title: 'Mon profil' }

export default async function ProfilPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const prenom = user.user_metadata?.prenom || '—'
  const email = user.email || '—'
  const createdAt = new Date(user.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Stats
  const { count: quizCount } = await supabase
    .from('user_quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const { count: entretienCount } = await supabase
    .from('ai_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon profil</h1>

      {/* Infos compte */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {prenom[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{prenom}</h2>
            <p className="text-gray-500 text-sm">{email}</p>
            <p className="text-xs text-gray-400 mt-1">Membre depuis le {createdAt}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-blue-700">{quizCount || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Tests de compatibilité</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-blue-700">{entretienCount || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Entretiens simulés</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-8">
        <Link href="/test-compatibilite" className="card p-4 flex items-center gap-4 hover:border-blue-200 transition-all group">
          <span className="text-2xl">🧭</span>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Refaire le test de compatibilité</div>
            <div className="text-sm text-gray-400">Votre profil évolue, votre score aussi</div>
          </div>
          <span className="text-gray-300 group-hover:text-blue-400">→</span>
        </Link>

        <Link href="/entretien" className="card p-4 flex items-center gap-4 hover:border-blue-200 transition-all group">
          <span className="text-2xl">🎤</span>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Simuler un nouvel entretien</div>
            <div className="text-sm text-gray-400">7 métiers disponibles</div>
          </div>
          <span className="text-gray-300 group-hover:text-blue-400">→</span>
        </Link>
      </div>

      {/* Version bêta info */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-orange-800 mb-2">🚧 Version bêta</h3>
        <p className="text-sm text-orange-700 leading-relaxed">
          RailReady est en phase de validation. Vos retours sont précieux pour améliorer la plateforme.
          N'hésitez pas à utiliser les boutons de feedback après chaque module.
        </p>
      </div>

      {/* Déconnexion / Suppression */}
      <div className="card p-6 border-red-100">
        <h3 className="font-semibold text-gray-900 mb-4">Zone dangereuse</h3>
        <SignOutButton />
      </div>
    </div>
  )
}
