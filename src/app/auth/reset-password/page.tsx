'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'expired'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Vérifie qu'on a une session valide (lien de reset).
    // On écoute aussi onAuthStateChange : la session peut arriver de façon
    // asynchrone (event PASSWORD_RECOVERY / SIGNED_IN) juste après le montage.
    const supabase = createClient()
    let resolved = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ResetPassword] auth event:', event, 'session:', !!session)
      if (session && !resolved) {
        resolved = true
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      console.log('[ResetPassword] initial getSession:', !!data.session)
      if (data.session && !resolved) {
        resolved = true
        setReady(true)
      }
    })

    // Délai de grâce de 2,5 s avant de déclarer le lien expiré
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('[ResetPassword] no session after grace period → expired')
        setStatus('expired')
      }
    }, 2500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirm) {
      setErrorMsg('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMsg("Erreur lors de la mise à jour. Le lien est peut-être expiré.")
      setStatus('error')
      return
    }

    setStatus('success')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="card p-8 bg-white shadow-2xl max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Lien expiré</h1>
          <p className="text-gray-500 text-sm mb-6">
            Ce lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande.
          </p>
          <a href="/forgot-password" className="btn-primary w-full justify-center py-3">
            Nouvelle demande
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card p-8 bg-white shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-gray-500 text-sm mt-1">Choisissez un mot de passe sécurisé</p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-green-700 font-medium">✓ Mot de passe mis à jour avec succès !</p>
              <p className="text-green-600 text-xs mt-1">Redirection vers le tableau de bord...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!ready && (
              <div className="text-center text-gray-400 text-sm py-4">Vérification du lien...</div>
            )}
            {ready && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-primary py-3 text-base justify-center disabled:opacity-60"
                >
                  {status === 'loading' ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
