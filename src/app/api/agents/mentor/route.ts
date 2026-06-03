import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { mentorAgent } from '@/agents/mentor-agent'
import type { AgentMessage } from '@/agents/base-agent'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const body = await req.json()
    const { messages, context } = body as {
      messages: AgentMessage[]
      context?: { metiersVus?: string[]; testFait?: boolean; prenom?: string }
    }

    if (!messages || messages.length === 0) {
      const welcome = mentorAgent.getWelcomeMessage(context)
      return NextResponse.json({ message: welcome })
    }

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
