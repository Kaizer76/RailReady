'use client'

// ============================================================
// RAILREADY — Dashboard Admin Feedbacks Bêta
// /admin — Accès réservé au fondateur
// ============================================================

import { useEffect, useState } from 'react'

interface Feedback {
  id: string
  created_at: string
  module: string
  note: number
  coherent: string | null
  metier_actuel: string | null
  recontact: boolean
  commentaire: string
  info_inexacte: string | null
  info_manquante: string | null
  email: string | null
  contexte: string | null
}

const MODULE_LABELS: Record<string, string> = {
  test_compatibilite: 'Test compatibilité',
  entretien_ia: 'Entretien IA',
  mentor_ia: 'Mentor IA',
}

const NOTE_EMOJIS = ['', '😞', '😕', '😐', '🙂', '😊']

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [stats, setStats] = useState({ total: 0, avg: 0, recontact: 0 })

  useEffect(() => {
    async function load() {
      try {
        const url = filter === 'all'
          ? '/api/feedback/beta?limit=100'
          : `/api/feedback/beta?module=${filter}&limit=100`
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        const list: Feedback[] = data.feedbacks || []
        setFeedbacks(list)
        setStats({
          total: list.length,
          avg: list.length > 0 ? Math.round(list.reduce((a, f) => a + f.note, 0) / list.length * 10) / 10 : 0,
          recontact: list.filter(f => f.recontact).length,
        })
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [filter])

  function exportCSV() {
    const headers = ['Date', 'Module', 'Note', 'Cohérent', 'Métier', 'Recontact', 'Commentaire', 'Info inexacte', 'Info manquante', 'Email', 'Contexte']
    const rows = feedbacks.map(f => [
      new Date(f.created_at).toLocaleDateString('fr-FR'),
      MODULE_LABELS[f.module] || f.module,
      f.note,
      f.coherent || '',
      f.metier_actuel || '',
      f.recontact ? 'Oui' : 'Non',
      `"${(f.commentaire || '').replace(/"/g, '""')}"`,
      `"${(f.info_inexacte || '').replace(/"/g, '""')}"`,
      `"${(f.info_manquante || '').replace(/"/g, '""')}"`,
      f.email || '',
      f.contexte || '',
    ])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `railready-feedbacks-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedbacks bêta</h1>
          <p className="text-gray-500 text-sm mt-1">Retours terrain des testeurs RailReady</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={feedbacks.length === 0}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          ⬇ Exporter CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-black text-blue-700">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">Feedbacks reçus</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-black text-blue-700">
            {stats.avg > 0 ? `${stats.avg}/5` : '—'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Note moyenne</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-black text-orange-600">{stats.recontact}</div>
          <div className="text-sm text-gray-500 mt-1">À recontacter</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { val: 'all', label: 'Tous' },
          { val: 'test_compatibilite', label: 'Test compat.' },
          { val: 'entretien_ia', label: 'Entretien IA' },
          { val: 'mentor_ia', label: 'Mentor IA' },
        ].map(f => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.val
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste feedbacks */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>Aucun feedback pour l'instant.</p>
          <p className="text-sm mt-1">Les retours apparaîtront ici après les premiers tests terrain.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(f => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg">{NOTE_EMOJIS[f.note]}</span>
                  <span className="font-bold text-gray-900">{f.note}/5</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {MODULE_LABELS[f.module] || f.module}
                  </span>
                  {f.metier_actuel && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {f.metier_actuel}
                    </span>
                  )}
                  {f.coherent && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      f.coherent === 'oui' ? 'bg-green-100 text-green-700' :
                      f.coherent === 'non' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      Cohérent: {f.coherent}
                    </span>
                  )}
                  {f.recontact && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      📧 À recontacter
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(f.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Commentaire principal */}
              <p className="text-sm text-gray-800 leading-relaxed mb-3 bg-gray-50 rounded-lg p-3">
                "{f.commentaire}"
              </p>

              {/* Détails */}
              <div className="space-y-1.5">
                {f.info_inexacte && (
                  <div className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                    <span className="font-semibold">⚠ Inexact :</span> {f.info_inexacte}
                  </div>
                )}
                {f.info_manquante && (
                  <div className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                    <span className="font-semibold">➕ Manquant :</span> {f.info_manquante}
                  </div>
                )}
                {f.email && f.recontact && (
                  <div className="text-xs text-gray-500">
                    📧 <a href={`mailto:${f.email}`} className="text-blue-600 hover:underline">{f.email}</a>
                  </div>
                )}
                {f.contexte && (
                  <div className="text-xs text-gray-400">Contexte : {f.contexte}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
