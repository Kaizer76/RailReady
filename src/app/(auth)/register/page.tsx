'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ prenom: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { prenom: form.prenom, full_name: form.prenom } },
    })

    if (error) {
      console.error('[Register] Supabase signUp error:', error.message)
      if (error.message === 'User already registered') {
        setError('Un compte existe deja avec cet email.')
      } else if (error.message?.includes('Database error')) {
        setError('Erreur base de donnees. Verifiez les migrations Supabase.')
      } else {
        setError(`Erreur : ${error.message}`)
      }
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (!signInError) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-8 bg-white shadow-2xl text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifiez votre email</h2>
        <p className="text-gray-500 text-sm mb-6">
          Un lien de confirmation a ete envoye a <strong>{form.email}</strong>.
        </p>
        <Link href="/login" className="btn-primary justify-center w-full">
          Aller a la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8 bg-white shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Creer mon compte</h1>
        <p className="text-gray-500 text-sm mt-1">
          Acces beta gratuit · Aucune carte bancaire
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom</label>
          <input
            type="text"
            name="prenom"
            className="input"
            placeholder="Votre prenom"
            value={form.prenom}
            onChange={handleChange}
            required
            autoComplete="given-name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            className="input"
            placeholder="vous@email.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
          <input
            type="password"
            name="password"
            className="input"
            placeholder="8 caracteres minimum"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
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
          {loading ? 'Creation du compte...' : 'Creer mon compte gratuitement'}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
        RailReady est une plateforme independante, non affiliee a la SNCF.
      </p>

      <div className="mt-5 text-center text-sm text-gray-500">
        Deja un compte ?{' '}
        <Link href="/login" className="text-blue-700 font-semibold hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  )
}
