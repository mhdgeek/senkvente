import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPanel from '@/components/admin/AdminPanel'

export const dynamic = 'force-dynamic'

function isAdmin(session: any): boolean {
  if (!session?.user) return false
  return (
    session.user.app_metadata?.role === 'admin' ||
    session.user.user_metadata?.role === 'admin'
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !isAdmin(session)) redirect('/dashboard')

  const [
    { data: allProfiles },
    { data: allClients },
    { data: allTransactions },
    { data: revenueData },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('id'),
    supabase.from('clients').select('id'),
    supabase.from('transactions').select('id'),
    supabase.from('transactions').select('amount').eq('status', 'payé'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
  ])

  const totalRevenue = (revenueData || []).reduce((s, t) => s + Number(t.amount), 0)

  return (
    <AdminPanel
      stats={{
        totalUsers:        allProfiles?.length || 0,
        totalClients:      allClients?.length || 0,
        totalTransactions: allTransactions?.length || 0,
        totalRevenue,
      }}
      users={recentUsers || []}
    />
  )
}
