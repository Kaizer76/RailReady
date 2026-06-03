'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-colors"
    >
      Se déconnecter
    </button>
  )
}
