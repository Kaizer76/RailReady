import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from './SignOutButton'
import DeleteAccountButton from './DeleteAccountButton'
import ProfilForm from './ProfilForm'

export const metadata = { title: 'Mon profil — RailReady' }

export default async function ProfilPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const prenom = user.user_metadata?.prenom || '—'
  const email = user.email || '—'
  const createdAt = new Date(user.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Profil étendu
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      {/* Carte identité */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg">
            {prenom[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{prenom}</h2>
            <p className="text-gray-500 text-sm">{email}</p>
            <p className="text-xs text-gray-400 mt-1">Membre depuis le {createdAt}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-blue-700">{quizCount || 0}</div>
            <div className="text-xs text-blue-600 mt-0.5">Tests</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-purple-700">{entretienCount || 0}</div>
            <div className="text-xs text-purple-600 mt-0.5">Entretiens</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-green-700">0</div>
            <div className="text-xs text-green-600 mt-0.5">Exercices</div>
          </div>
        </div>
      </div>

      {/* Profil candidat avancé */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-1">Mon profil candidat</h3>
        <p className="text-xs text-gray-400 mb-5">
          Ces informations personnalisent votre expérience : entretien IA, recommandations, test de compatibilité.
        </p>
        <ProfilForm
          userId={user.id}
          userEmail={user.email ?? undefined}
          initialData={{
            age: profileData?.age ?? null,
            niveau_etudes: profileData?.niveau_etudes ?? '',
            diplome: profileData?.diplome ?? '',
            experience_annees: profileData?.experience_annees ?? null,
            experience_description: profileData?.experience_description ?? '',
            metier_vise: profileData?.metier_vise ?? '',
            region: profileData?.region ?? '',
            disponibilite: profileData?.disponibilite ?? '',
          }}
        />
      </div>

      {/* Zone sécurité */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Compte</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <SignOutButton />
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}
