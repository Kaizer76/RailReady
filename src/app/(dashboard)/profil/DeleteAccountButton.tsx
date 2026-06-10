'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountButton() {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'confirm1' | 'confirm2' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleDelete() {
    setStep('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')

      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=1')
    } catch {
      setErrorMsg("Une erreur est survenue. Veuillez réessayer.")
      setStep('error')
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm1')}
        className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
      >
        Supprimer mon compte
      </button>
    )
  }

  if (step === 'confirm1') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-red-800">
          ⚠ Êtes-vous sûr de vouloir supprimer votre compte ?
        </p>
        <p className="text-xs text-red-600">
          Cette action est irréversible. Toutes vos données (tests, entretiens, historique) seront définitivement supprimées.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('idle')}
            className="btn-secondary text-xs py-2 px-4"
          >
            Annuler
          </button>
          <button
            onClick={() => setStep('confirm2')}
            className="bg-red-600 text-white text-xs font-semibold py-2 px-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            Oui, je veux supprimer mon compte
          </button>
        </div>
      </div>
    )
  }

  if (step === 'confirm2') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-bold text-red-800">
          Confirmation finale
        </p>
        <p className="text-xs text-red-600">
          Cette action <strong>ne peut pas être annulée</strong>. Votre compte et toutes vos données seront supprimés immédiatement.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('idle')}
            className="btn-secondary text-xs py-2 px-4"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-red-800 transition-colors"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    )
  }

  if (step === 'loading') {
    return (
      <div className="text-sm text-gray-500">Suppression en cours...</div>
    )
  }

  if (step === 'error') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">{errorMsg}</p>
        <button onClick={() => setStep('idle')} className="text-xs text-gray-500 hover:underline">
          Retour
        </button>
      </div>
    )
  }

  return null
}
