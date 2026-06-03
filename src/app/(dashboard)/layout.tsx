import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import BetaBanner from '@/components/layout/BetaBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const prenom = user.user_metadata?.prenom || user.email?.split('@')[0] || 'Candidat'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar prenom={prenom} userEmail={user.email || ''} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav prenom={prenom} />
        <BetaBanner />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
