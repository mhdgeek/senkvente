import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

function isAdmin(session: any): boolean {
  if (!session?.user) return false
  return session.user.app_metadata?.role === 'admin' || session.user.user_metadata?.role === 'admin'
}

export default async function AdminIndexPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session || !isAdmin(session)) redirect('/auth/login')

  const [
    { data: allProfiles },
    { data: allClients },
    { data: allTransactions },
    { data: paidTransactions },
    { data: recentSignups },
    { data: suggestions },
  ] = await Promise.all([
    supabase.from('profiles').select('id, created_at, city'),
    supabase.from('clients').select('id, created_at'),
    supabase.from('transactions').select('id, type, created_at, amount, status'),
    supabase.from('transactions').select('amount, type, created_at').eq('status', 'payé'),
    supabase.from('profiles').select('id, full_name, business_name, city, created_at, email').order('created_at', { ascending: false }).limit(5),
    supabase.from('faq_suggestions').select('id, status, category, created_at').order('created_at', { ascending: false }),
  ])

  const totalRevenue = (paidTransactions || []).reduce((s, t) => s + Number(t.amount), 0)

  // Monthly signups (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlySignups: Record<string, number> = {}
  const monthlyRevenue: Record<string, number> = {};
  (allProfiles || []).forEach(p => {
    const d = new Date(p.created_at)
    if (d >= sixMonthsAgo) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlySignups[key] = (monthlySignups[key] || 0) + 1
    }
  });
  (paidTransactions || []).forEach(t => {
    const d = new Date(t.created_at)
    if (d >= sixMonthsAgo) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(t.amount)
    }
  })

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      month: d.toLocaleDateString('fr-FR', { month: 'short' }),
      signups: monthlySignups[key] || 0,
      revenue: monthlyRevenue[key] || 0,
    }
  })

  // Type breakdown
  const typeBreakdown = {
    vente: (allTransactions || []).filter(t => t.type === 'vente').length,
    intervention: (allTransactions || []).filter(t => t.type === 'intervention').length,
    abonnement: (allTransactions || []).filter(t => t.type === 'abonnement').length,
  }

  // City breakdown
  const cityMap: Record<string, number> = {}
  ;(allProfiles || []).forEach(p => {
    if (p.city) cityMap[p.city] = (cityMap[p.city] || 0) + 1
  })
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Suggestions stats
  const suggestionStats = {
    total: (suggestions || []).length,
    nouveau: (suggestions || []).filter(s => s.status === 'nouveau').length,
    en_cours: (suggestions || []).filter(s => s.status === 'en_cours').length,
    résolu: (suggestions || []).filter(s => s.status === 'résolu').length,
  }

  return (
    <AdminDashboard
      stats={{
        totalUsers: allProfiles?.length || 0,
        totalClients: allClients?.length || 0,
        totalTransactions: allTransactions?.length || 0,
        totalRevenue,
        newUsersThisMonth: monthlySignups[`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`] || 0,
        pendingMessages: suggestionStats.nouveau,
      }}
      months={months}
      typeBreakdown={typeBreakdown}
      topCities={topCities}
      recentSignups={recentSignups || []}
      suggestionStats={suggestionStats}
    />
  )
}
