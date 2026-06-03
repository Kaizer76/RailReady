'use client'

// ============================================================
// RAILREADY — Bannière Version Bêta
// Visible sur toutes les pages du dashboard
// ============================================================

import { useState } from 'react'

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3 flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-amber-600 text-sm flex-shrink-0">🏗️</span>
        <p className="text-xs text-amber-800 leading-snug">
          <span className="font-semibold">Version bêta</span> — Certaines informations peuvent évoluer grâce aux retours des cheminots et candidats.
          <span className="hidden sm:inline"> Votre avis compte pour améliorer RailReady.</span>
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-700 flex-shrink-0 text-lg leading-none transition-colors"
        aria-label="Fermer la bannière"
      >
        ×
      </button>
    </div>
  )
}
