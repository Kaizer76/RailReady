'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Composant interne qui utilise useSearchParams — doit être dans Suspense
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="card p-8 bg-white shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
        <p className="text-gray-500 text-sm mt-1">Accedez a votre espace RailReady</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            className="input"
            placeholder="vous@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-base justify-center disabled:opacity-60"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
          Mot de passe oublié ?
        </Link>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-blue-700 font-semibold hover:underline">
          Creer mon compte
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  )
}

// Composant page — enveloppe LoginForm dans Suspense (requis Next.js 14)
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="card p-8 bg-white shadow-2xl flex items-center justify-center min-h-48">
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
