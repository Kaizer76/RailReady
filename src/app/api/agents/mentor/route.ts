import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { mentorAgent } from '@/agents/mentor-agent'
import type { AgentMessage } from '@/agents/base-agent'

export const dynamic = 'force-dynamic'

// ── Limites par tier ─────────────────────────────────────────────
const DAILY_LIMIT_FREE = 5
// const DAILY_LIMIT_PREMIUM = Infinity  // débloqué quand Stripe actif

async function getDailyUsage(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const { data } = await supabase
    .from('mentor_daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('day', today)
    .single()
  return data?.count ?? 0
}

async function incrementDailyUsage(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.rpc('increment_mentor_count', { p_user_id: userId, p_day: today })
  if (error) console.error('[Mentor] RPC increment error:', error.message)
}

// ── Handler principal ─────────────────────────────────────────────
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

    // Message de bienvenue (pas un vrai échange — pas de décompte)
    if (!messages || messages.length === 0) {
      const welcome = mentorAgent.getWelcomeMessage(context)
      return NextResponse.json({ message: welcome })
    }

    // ── Vérification de la limite quotidienne (tier free) ──
    const usage = await getDailyUsage(supabase, user.id)
    if (usage >= DAILY_LIMIT_FREE) {
      return NextResponse.json(
        {
          error: 'daily_limit_reached',
          message: `Vous avez atteint votre limite de ${DAILY_LIMIT_FREE} questions par jour. Revenez demain ou passez en offre Premium pour un accès illimité.`,
          usage,
          limit: DAILY_LIMIT_FREE,
        },
        { status: 429 }
      )
    }

    // ── Traitement de la requête ──
    const stream = await mentorAgent.streamResponse(messages)

    // Incrémenter le compteur (en arrière-plan, ne bloque pas le stream)
    incrementDailyUsage(supabase, user.id).catch(err =>
      console.error('[Mentor] increment usage error:', err)
    )

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Mentor-Usage': String(usage + 1),
        'X-Mentor-Limit': String(DAILY_LIMIT_FREE),
      },
    })
  } catch (error) {
    console.error('[Mentor Agent]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
