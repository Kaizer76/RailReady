// ============================================================
// RAILREADY — API Route: Mentor Ferroviaire (streaming)
// POST /api/agents/mentor
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { mentorAgent } from '@/agents/mentor-agent'
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
    const { messages, context } = body as {
      messages: AgentMessage[]
      context?: {
        metiersVus?: string[]
        testFait?: boolean
        prenom?: string
      }
    }

    if (!messages || messages.length === 0) {
      // Retourner le message d'accueil si pas de messages
      const welcome = mentorAgent.getWelcomeMessage(context)
      return NextResponse.json({ message: welcome })
    }

    // Streamer la réponse du Mentor
    const stream = await mentorAgent.streamResponse(messages)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[Mentor Agent]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
