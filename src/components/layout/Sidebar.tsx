'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'Tableau de bord' },
  { href: '/metiers', icon: '📋', label: 'Métiers' },
  { href: '/test-compatibilite', icon: '🧭', label: 'Test de compatibilité' },
  { href: '/entretien', icon: '🎤', label: 'Simulateur d\'entretien' },
  { href: '/mentor', icon: '💬', label: 'Mentor Ferroviaire' },
]

const NAV_BOTTOM = [
  { href: '/profil', icon: '👤', label: 'Mon profil' },
  { href: '/a-propos', icon: 'ℹ️', label: 'À propos' },
]

const ADMIN_EMAIL = 'saidanib76620@gmail.com'

interface Props {
  prenom: string
  userEmail: string
}

export default function Sidebar({ prenom, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🚆</span>
          <span className="font-bold text-lg text-gray-900">RailReady</span>
        </Link>
        <div className="mt-1">
          <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
            Version bêta
          </span>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {prenom[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">Bonjour, {prenom} !</div>
            <div className="text-xs text-gray-400 truncate">{userEmail}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        {NAV_BOTTOM.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
              isActive(item.href)
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {userEmail === ADMIN_EMAIL && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
              isActive('/admin')
                ? 'bg-amber-100 text-amber-900 font-medium'
                : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            <span className="text-base">📊</span>
            <span>Feedbacks bêta</span>
          </Link>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span className="text-base">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-400 leading-relaxed">
          Plateforme indépendante · Non affiliée à la SNCF
        </div>
      </div>
    </aside>
  )
}
