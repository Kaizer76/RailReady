'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getSiteURL } from '@/lib/utils/site-url'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Affiche un message si on arrive ici suite à un lien expiré (?error=expired)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'expired') {
      setErrorMsg('Votre lien de réinitialisation a expiré ou a déjà été utilisé. Demandez un nouveau lien ci-dessous.')
      setStatus('error')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()
    const redirectTo = `${getSiteURL()}/callback?type=recovery`
    console.log('[ForgotPassword] resetPasswordForEmail redirectTo =', redirectTo)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      setErrorMsg('Une erreur est survenue. Vérifiez votre adresse email.')
      setStatus('error')
      return
    }

    setStatus('sent')
  }

  return (
    <div className="card p-8 bg-white shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
        <p className="text-gray-500 text-sm mt-1">
          {status === 'sent'
            ? 'Email envoyé !'
            : 'Entrez votre email pour recevoir un lien de réinitialisation.'}
        </p>
      </div>

      {status === 'sent' ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-green-700 font-medium text-sm">
              ✓ Un email vous a été envoyé à <strong>{email}</strong>
            </p>
            <p className="text-green-600 text-xs mt-1">
              Cliquez sur le lien dans cet email pour réinitialiser votre mot de passe.
            </p>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Vérifiez vos spams si vous ne trouvez pas l'email.
          </p>
          <Link href="/login" className="btn-primary w-full justify-center py-3 text-base">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              className="input"
              placeholder="vous@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          {status === 'error' && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-primary py-3 text-base justify-center disabled:opacity-60"
          >
            {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
