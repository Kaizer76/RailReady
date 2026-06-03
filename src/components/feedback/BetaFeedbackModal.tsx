'use client'

// ============================================================
// RAILREADY — Modal Feedback Bêta
// Collecte détaillée après chaque module pour validation terrain
// ============================================================

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type FeedbackModule = 'test_compatibilite' | 'entretien_ia' | 'mentor_ia'

interface Props {
  module: FeedbackModule
  isOpen: boolean
  onClose: () => void
  contexte?: string // métier visé, score obtenu, etc.
}

const MODULE_LABELS: Record<FeedbackModule, string> = {
  test_compatibilite: 'test de compatibilité',
  entretien_ia: 'simulation d\'entretien',
  mentor_ia: 'conversation avec le Mentor',
}

const METIERS_OPTIONS = [
  'Conducteur de Train',
  'Agent Circulation',
  'ASCT / Contrôleur',
  'Agent de Vente',
  'Agent d\'Escale',
  'Technicien Maintenance',
  'Technicien Voie / Signalisation',
  'Autre (précisez)',
  'Je ne suis pas encore dans le ferroviaire',
]

type Step = 'rating' | 'questions' | 'done'

export default function BetaFeedbackModal({ module, isOpen, onClose, contexte }: Props) {
  const [step, setStep] = useState<Step>('rating')
  const [rating, setRating] = useState<number | null>(null)
  const [form, setForm] = useState({
    coherent: '' as 'oui' | 'non' | 'partiellement' | '',
    info_inexacte: '',
    info_manquante: '',
    metier_actuel: '',
    metier_custom: '',
    recontact: false,
    commentaire: '',
  })
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  function handleFormChange(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        module,
        note: rating,
        coherent: form.coherent || null,
        info_inexacte: form.info_inexacte.trim() || null,
        info_manquante: form.info_manquante.trim() || null,
        metier_actuel: form.metier_actuel === 'Autre (précisez)'
          ? form.metier_custom.trim()
          : form.metier_actuel || null,
        recontact: form.recontact,
        commentaire: form.commentaire.trim() || null,
        contexte: contexte || null,
        user_id: user?.id || null,
        email: user?.email || null,
      }

      const res = await fetch('/api/feedback/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()
      setStep('done')
    } catch {
      alert('Erreur lors de l\'envoi. Votre feedback n\'a pas été enregistré.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Votre retour terrain</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sur votre {MODULE_LABELS[module]} — Version bêta RailReady
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* ÉTAPE 1 — Note */}
        {step === 'rating' && (
          <div className="p-5">
            <p className="font-semibold text-gray-900 mb-4 text-center">
              Comment évaluez-vous ce module ?
            </p>
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`w-12 h-12 rounded-xl text-xl font-bold transition-all border-2 ${
                    rating === n
                      ? 'bg-yellow-400 border-yellow-400 scale-110 shadow-sm'
                      : rating && n <= rating
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'bg-white border-gray-200 hover:border-yellow-300 text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating && (
              <div className="text-center text-sm text-gray-500 mb-4">
                {['', 'Décevant', 'Insuffisant', 'Correct', 'Bien', 'Excellent !'][rating]}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Passer
              </button>
              <button
                onClick={() => rating && setStep('questions')}
                disabled={!rating}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  rating
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Questions détaillées */}
        {step === 'questions' && (
          <div className="p-5 space-y-5">

            {/* Q1 — Cohérence */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                1. Le résultat vous semble-t-il cohérent avec votre profil réel ?
              </label>
              <div className="flex gap-2">
                {(['oui', 'partiellement', 'non'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => handleFormChange('coherent', v)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all capitalize ${
                      form.coherent === v
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 — Infos inexactes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                2. Quelles informations vous paraissent inexactes ou mal formulées ?
              </label>
              <textarea
                value={form.info_inexacte}
                onChange={e => handleFormChange('info_inexacte', e.target.value)}
                placeholder="Ex: La description du roulement conducteur n'est pas représentative..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>

            {/* Q3 — Infos manquantes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                3. Quelles informations manquent selon vous ?
              </label>
              <textarea
                value={form.info_manquante}
                onChange={e => handleFormChange('info_manquante', e.target.value)}
                placeholder="Ex: Rien sur les conditions de travail en grandes gares..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>

            {/* Q4 — Métier actuel */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                4. Quel métier ferroviaire exercez-vous ou visez-vous actuellement ?
              </label>
              <select
                value={form.metier_actuel}
                onChange={e => handleFormChange('metier_actuel', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Choisir...</option>
                {METIERS_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {form.metier_actuel === 'Autre (précisez)' && (
                <input
                  type="text"
                  value={form.metier_custom}
                  onChange={e => handleFormChange('metier_custom', e.target.value)}
                  placeholder="Précisez votre métier..."
                  className="mt-2 w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Q5 — Recontact */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.recontact}
                    onChange={e => handleFormChange('recontact', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => handleFormChange('recontact', !form.recontact)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                      form.recontact ? 'bg-blue-700 border-blue-700' : 'border-gray-300'
                    }`}
                  >
                    {form.recontact && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    5. Souhaitez-vous être recontacté pour améliorer RailReady ?
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Votre email sera partagé uniquement avec le fondateur de RailReady. Jamais revendu.
                  </p>
                </div>
              </label>
            </div>

            {/* Commentaire libre */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Commentaire libre <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.commentaire}
                onChange={e => handleFormChange('commentaire', e.target.value)}
                placeholder="Tout ce que vous voulez partager sur votre expérience, les points forts, les problèmes rencontrés..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('rating')}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.commentaire.trim()}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  form.commentaire.trim() && !submitting
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Envoi...' : 'Envoyer mon feedback →'}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Confirmation */}
        {step === 'done' && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🙏</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Merci pour votre retour !</h3>
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
              Votre feedback est précieux pour améliorer RailReady. Chaque retour terrain
              compte pour que la plateforme soit vraiment utile aux candidats ferroviaires.
            </p>
            {form.recontact && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-3 mb-4">
                Le fondateur de RailReady vous contactera à l'adresse de votre compte.
              </p>
            )}
            <button
              onClick={onClose}
              className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
