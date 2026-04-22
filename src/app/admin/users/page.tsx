import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminUsersPanel from '@/components/admin/AdminUsersPanel'

export const dynamic = 'force-dynamic'

function isAdmin(session: any): boolean {
  if (!session?.user) return false
  return session.user.app_metadata?.role === 'admin' || session.user.user_metadata?.role === 'admin'
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session || !isAdmin(session)) redirect('/auth/login')

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Per-user stats
  const { data: clientCounts } = await supabase
    .from('clients')
    .select('user_id')

  const { data: txCounts } = await supabase
    .from('transactions')
    .select('user_id, amount, status')

  const clientMap: Record<string, number> = {}
  const txMap: Record<string, number> = {}
  const revenueMap: Record<string, number> = {}

  ;(clientCounts || []).forEach((c: any) => {
    clientMap[c.user_id] = (clientMap[c.user_id] || 0) + 1
  })
  ;(txCounts || []).forEach((t: any) => {
    txMap[t.user_id] = (txMap[t.user_id] || 0) + 1
    if (t.status === 'payé') revenueMap[t.user_id] = (revenueMap[t.user_id] || 0) + Number(t.amount)
  })

  const usersWithStats = (users || []).map(u => ({
    ...u,
    nbClients: clientMap[u.id] || 0,
    nbTransactions: txMap[u.id] || 0,
    totalRevenue: revenueMap[u.id] || 0,
  }))

  return <AdminUsersPanel users={usersWithStats} />
}
