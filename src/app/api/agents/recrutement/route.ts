import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { recrutementAgent } from '@/agents/recrutement-agent'
import type { AgentMessage } from '@/agents/base-agent'
import type { CandidatProfil } from '@/agents/recrutement-agent'

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

    if (isOpening && config) {
      // Récupérer le profil candidat pour personnalisation
      const { data: profileData } = await supabase
        .from('profiles')
        .select('age, niveau_etudes, diplome, experience_annees, experience_description, region, disponibilite')
        .eq('id', user.id)
        .single()

      const profil: CandidatProfil = {
        prenom: user.user_metadata?.prenom || undefined,
        age: profileData?.age ?? null,
        niveau_etudes: profileData?.niveau_etudes ?? undefined,
        diplome: profileData?.diplome ?? undefined,
        experience_annees: profileData?.experience_annees ?? null,
        experience_description: profileData?.experience_description ?? undefined,
        region: profileData?.region ?? undefined,
        disponibilite: profileData?.disponibilite ?? undefined,
      }

      // Contexte profil injecté dans le system prompt (messages côté recruteur)
      const candidatContext = recrutementAgent.buildCandidatContext({
        poste: config.poste,
        slug: config.slug,
        niveau: config.niveau as 'debutant' | 'intermediaire' | 'avance',
        profil,
      })

      const opening = recrutementAgent.getOpeningMessage({
        poste: config.poste,
        slug: config.slug,
        niveau: config.niveau as 'debutant' | 'intermediaire' | 'avance',
        profil,
      })

      await supabase.from('ai_sessions').upsert({
        id: sessionId,
        user_id: user.id,
        agent_type: 'recrutement',
        poste: config.poste,
        niveau: config.niveau,
        status: 'active',
        metadata: { candidatContext },
      }, { onConflict: 'id', ignoreDuplicates: true })

      return NextResponse.json({ opening, candidatContext })
    }

    if (isFinal) {
      const evaluation = await recrutementAgent.generateFinalEvaluation(messages)
      try {
        const parsed = JSON.parse(evaluation)
        await supabase.rpc('finaliser_session_entretien', {
          p_session_id: sessionId,
          p_score: parsed.score_global,
          p_feedback: parsed.feedback_global,
        })
      } catch { /* non bloquant */ }
      return NextResponse.json({ evaluation })
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user') {
      await supabase.from('ai_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: lastMessage.content,
      })
    }

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
