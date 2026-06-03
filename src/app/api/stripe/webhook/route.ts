// ============================================================
// RAILREADY — Stripe Webhook (DÉSACTIVÉ en V1 Bêta)
// Stripe hors scope de la phase bêta.
// Ce fichier est un placeholder — ne pas supprimer (Next.js routing).
// ============================================================

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Stripe non configuré en V1 Bêta' },
    { status: 501 }
  )
}
