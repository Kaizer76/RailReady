import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// ============================================================
// CALLBACK AUTH — gère les deux formats de liens Supabase :
// 1. PKCE flow      : ?code=xxx           → exchangeCodeForSession
// 2. Token hash     : ?token_hash=xxx&type=signup|recovery → verifyOtp
// + gestion des erreurs renvoyées par Supabase (?error=...)
// ============================================================

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'
  const errorParam = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  console.log('[AuthCallback] hit', {
    origin,
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
    type,
    errorParam,
    errorCode,
  })

  const isRecovery = type === 'recovery'
  const safeNext = next.startsWith('/') ? next : '/dashboard'

  // 0. Supabase a renvoyé une erreur (lien expiré, déjà utilisé...)
  if (errorParam || errorCode) {
    console.error('[AuthCallback] Supabase error:', errorParam, errorCode, errorDescription)
    if (isRecovery || errorCode === 'otp_expired') {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
    }
    return NextResponse.redirect(`${origin}/login?error=link_invalid`)
  }

  const supabase = createServerClient()

  // 1. Flow PKCE (?code=)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('[AuthCallback] PKCE exchange OK, redirect →', isRecovery ? '/auth/reset-password' : safeNext)
      return NextResponse.redirect(
        isRecovery ? `${origin}/auth/reset-password` : `${origin}${safeNext}`
      )
    }
    console.error('[AuthCallback] exchangeCodeForSession failed:', error.message)
    if (isRecovery) {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
    }
    return NextResponse.redirect(`${origin}/login?error=callback_error`)
  }

  // 2. Flow token_hash (?token_hash=&type=) — format par défaut des
  //    templates email Supabase ({{ .TokenHash }})
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    })
    if (!error) {
      console.log('[AuthCallback] verifyOtp OK, type =', type)
      return NextResponse.redirect(
        isRecovery ? `${origin}/auth/reset-password` : `${origin}${safeNext}`
      )
    }
    console.error('[AuthCallback] verifyOtp failed:', error.message)
    if (isRecovery) {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
    }
    return NextResponse.redirect(`${origin}/login?error=link_invalid`)
  }

  // 3. Aucun paramètre exploitable
  console.error('[AuthCallback] no code / token_hash in URL')
  return NextResponse.redirect(`${origin}/login?error=callback_error`)
}
