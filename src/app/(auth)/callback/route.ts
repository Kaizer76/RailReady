import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const type = searchParams.get('type')

  if (code) {
    const supabase = createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      const redirectTo = next.startsWith('/') ? next : '/dashboard'
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }

    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_error`)
}
