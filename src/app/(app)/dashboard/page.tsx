import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsCards from '@/components/dashboard/StatsCards'
import RevenueChart from '@/components/dashboard/RevenueChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import TypeBreakdown from '@/components/dashboard/TypeBreakdown'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const [{ data: transactions }, { data: clients }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, client:clients(full_name, phone)')
      .eq('user_id', session.user.id)
      .order('transaction_date', { ascending: false })
      .limit(200),
    supabase
      .from('clients')
      .select('id')
      .eq('user_id', session.user.id),
  ])

  const txList = transactions || []
  const paid = txList.filter(t => t.status === 'payé')

  const stats = {
    totalRevenue:        paid.reduce((s, t) => s + Number(t.amount), 0),
    totalTransactions:   txList.length,
    totalClients:        clients?.length || 0,
    pendingRevenue:      txList.filter(t => t.status === 'en_attente').reduce((s, t) => s + Number(t.amount), 0),
    revenueVente:        paid.filter(t => t.type === 'vente').reduce((s, t) => s + Number(t.amount), 0),
    revenueIntervention: paid.filter(t => t.type === 'intervention').reduce((s, t) => s + Number(t.amount), 0),
    revenueAbonnement:   paid.filter(t => t.type === 'abonnement').reduce((s, t) => s + Number(t.amount), 0),
    nbVentes:        txList.filter(t => t.type === 'vente').length,
    nbInterventions: txList.filter(t => t.type === 'intervention').length,
    nbAbonnements:   txList.filter(t => t.type === 'abonnement').length,
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1 font-body">Vue d&apos;ensemble de votre activité</p>
      </div>
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RevenueChart transactions={txList} /></div>
        <TypeBreakdown stats={stats} />
      </div>
      <RecentTransactions transactions={txList.slice(0, 8)} />
    </div>
  )
}
