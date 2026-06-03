// ============================================================
// RAILREADY — API Route: Agent Recrutement (streaming)
// POST /api/agents/recrutement
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { recrutementAgent } from '@/agents/recrutement-agent'
import type { AgentMessage } from '@/agents/base-agent'

// runtime = 'nodejs' (défaut) — obligatoire car createServerClient() utilise next/headers (cookies)
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { messages, sessionId, isFinal, isOpening, config } = body as {
      messages: AgentMessage[]
      sessionId: string
      isFinal?: boolean
      isOpening?: boolean
      config?: { slug: string; niveau: string; poste: string }
    }

    // Mode message d'ouverture
    if (isOpening && config) {
      const opening = recrutementAgent.getOpeningMessage({
        poste: config.poste,
        slug: config.slug,
        niveau: config.niveau as 'debutant' | 'intermediaire' | 'avance',
      })
      // Créer la session en base (upsert — évite les doublons sans .onConflict inexistant en v2)
      await supabase.from('ai_sessions').upsert({
        id: sessionId,
        user_id: user.id,
        agent_type: 'recrutement',
        poste: config.poste,
        niveau: config.niveau,
        status: 'active',
      }, { onConflict: 'id', ignoreDuplicates: true })
      return NextResponse.json({ opening })
    }

    // Mode évaluation finale
    if (isFinal) {
      const evaluation = await recrutementAgent.generateFinalEvaluation(messages)

      // Parser et sauvegarder le score
      try {
        const parsed = JSON.parse(evaluation)
        await supabase.rpc('finaliser_session_entretien', {
          p_session_id: sessionId,
          p_score: parsed.score_global,
          p_feedback: parsed.feedback_global,
        })
      } catch { /* parsing error non bloquant */ }

      return NextResponse.json({ evaluation })
    }

    // Sauvegarder le message utilisateur
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user') {
      await supabase.from('ai_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: lastMessage.content,
      })
    }

    // Streamer la réponse de l'agent
    const stream = await recrutementAgent.streamResponse(messages)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[Agent Recrutement]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
