'use client'

// ============================================================
// RAILREADY — Composant Feedback
// Affiché après chaque module pour validation terrain
// ============================================================

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  module: 'entretien' | 'mentor' | 'test_compatibilite' | 'fiche_metier'
  contexte?: string // nom du métier, etc.
}

export default function FeedbackWidget({ module, contexte }: Props) {
  const [step, setStep] = useState<'idle' | 'rating' | 'comment' | 'done'>('idle')
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const MODULE_LABELS: Record<string, string> = {
    entretien: 'simulation d\'entretien',
    mentor: 'conversation avec le Mentor',
    test_compatibilite: 'test de compatibilité',
    fiche_metier: 'cette fiche métier',
  }

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      await supabase.from('feedbacks').insert({
        module,
        contexte: contexte || null,
        rating,
        comment: comment.trim() || null,
      })
    } catch { /* non bloquant */ }

    setStep('done')
    setSubmitting(false)
  }

  if (step === 'idle') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Que pensez-vous de cette {MODULE_LABELS[module]} ?
        </p>
        <button
          onClick={() => setStep('rating')}
          className="text-sm bg-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-800 transition-colors"
        >
          Donner mon avis
        </button>
        <p className="text-xs text-gray-400 mt-2">Vos retours améliorent RailReady</p>
      </div>
    )
  }

  if (step === 'rating') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <p className="text-sm font-medium text-gray-700 mb-4 text-center">
          Note de 1 à 5 étoiles
        </p>
        <div className="flex justify-center gap-3 mb-5">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`w-11 h-11 rounded-xl text-xl transition-all ${
                rating === n
                  ? 'bg-yellow-400 scale-110 shadow-sm'
                  : rating && n <= rating
                  ? 'bg-yellow-200'
                  : 'bg-white border border-gray-200 hover:border-yellow-300'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
        {rating && (
          <div className="space-y-3">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Un commentaire ? (facultatif) — ce qui était utile, ce qui manquait, des erreurs à corriger..."
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Envoi...' : 'Envoyer mon feedback'}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <div className="text-2xl mb-2">🙏</div>
        <p className="text-sm font-semibold text-green-800">Merci pour votre retour !</p>
        <p className="text-xs text-green-600 mt-1">
          Chaque feedback aide à améliorer RailReady pour les futurs candidats.
        </p>
      </div>
    )
  }

  return null
}
