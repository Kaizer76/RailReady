'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'Accueil' },
  { href: '/metiers', icon: '📋', label: 'Métiers' },
  { href: '/test-compatibilite', icon: '🧭', label: 'Test' },
  { href: '/entretien', icon: '🎤', label: 'Entretien' },
  { href: '/mentor', icon: '💬', label: 'Mentor' },
]

export default function MobileNav({ prenom }: { prenom: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Header mobile */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🚆</span>
          <span className="font-bold text-gray-900">RailReady</span>
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="font-semibold text-gray-900">Bonjour, {prenom} !</div>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <nav className="space-y-1 mb-8">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-100 pt-4 space-y-1">
              <Link href="/profil" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                <span>👤</span> Mon profil
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50"
              >
                <span>🚪</span> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-all ${
              isActive(item.href) ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="mt-0.5">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
