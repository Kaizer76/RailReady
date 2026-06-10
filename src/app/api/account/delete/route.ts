import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  await adminSupabase.from('user_quiz_sessions').delete().eq('user_id', user.id)
  await adminSupabase.from('ai_sessions').delete().eq('user_id', user.id)
  await adminSupabase.from('user_stats').delete().eq('user_id', user.id)
  await adminSupabase.from('beta_feedbacks').update({ user_id: null }).eq('user_id', user.id)
  await adminSupabase.from('profiles').delete().eq('id', user.id)

  const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
