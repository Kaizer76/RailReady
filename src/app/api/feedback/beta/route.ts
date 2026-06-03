// ============================================================
// RAILREADY — API Feedback Bêta
// POST /api/feedback/beta
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const {
      module, note, coherent, info_inexacte, info_manquante,
      metier_actuel, recontact, commentaire, contexte,
      user_id, email,
    } = body

    // Validation minimale
    if (!module || !note || note < 1 || note > 5) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    if (!commentaire?.trim()) {
      return NextResponse.json({ error: 'Commentaire obligatoire' }, { status: 400 })
    }

    const { error } = await supabase.from('beta_feedbacks').insert({
      module,
      note,
      coherent: coherent || null,
      info_inexacte: info_inexacte || null,
      info_manquante: info_manquante || null,
      metier_actuel: metier_actuel || null,
      recontact: recontact || false,
      commentaire: commentaire.trim(),
      contexte: contexte || null,
      user_id: user_id || null,
      email: email || null,
    })

    if (error) {
      console.error('[Beta Feedback]', error)
      return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Beta Feedback]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// Lecture des feedbacks pour admin
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Seul le fondateur peut lire les feedbacks (protection minimale bêta)
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const module = searchParams.get('module')

    let query = supabase
      .from('beta_feedbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (module) query = query.eq('module', module)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ feedbacks: data })
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
