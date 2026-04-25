import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsCards from '@/components/dashboard/StatsCards'
import RevenueChart from '@/components/dashboard/RevenueChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import TypeBreakdown from '@/components/dashboard/TypeBreakdown'
import Link from 'next/link'
import { PlusCircle, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const myId = session.user.id

  // Check if I am a member of someone else's team
  const { data: teamMembership } = await supabase
    .from('business_teams')
    .select('owner_id')
    .eq('member_id', myId)
    .maybeSingle()

  // The effective owner: either myself, or the owner I belong to
  const effectiveOwnerId = teamMembership?.owner_id || myId
  const isTeamMember = !!teamMembership

  const [{ data: transactions }, { data: clients }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, client:clients(full_name, phone)')
      .eq('user_id', effectiveOwnerId)
      .order('transaction_date', { ascending: false })
      .limit(200),
    supabase
      .from('clients')
      .select('id')
      .eq('user_id', effectiveOwnerId),
  ])

  const txList = transactions || []
  const paid   = txList.filter(t => t.status === 'payé')

  const stats = {
    totalRevenue:        paid.reduce((s, t) => s + Number(t.amount), 0),
    totalTransactions:   txList.length,
    totalClients:        clients?.length || 0,
    pendingRevenue:      txList.filter(t => t.status === 'en_attente').reduce((s, t) => s + Number(t.amount), 0),
    revenueVente:        paid.filter(t => t.type === 'vente').reduce((s, t) => s + Number(t.amount), 0),
    revenueIntervention: paid.filter(t => t.type === 'intervention').reduce((s, t) => s + Number(t.amount), 0),
    revenueAbonnement:   paid.filter(t => t.type === 'abonnement').reduce((s, t) => s + Number(t.amount), 0),
    nbVentes:            txList.filter(t => t.type === 'vente').length,
    nbInterventions:     txList.filter(t => t.type === 'intervention').length,
    nbAbonnements:       txList.filter(t => t.type === 'abonnement').length,
  }

  const isEmpty = txList.length === 0

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-950 font-display">Dashboard</h1>
          <p className="text-dark-400 text-xs sm:text-sm mt-0.5 font-body">
            {isTeamMember
              ? 'Vous consultez le dashboard partagé de votre équipe'
              : "Vue d'ensemble de votre activité"
            }
          </p>
        </div>
        {isEmpty && (
          <div className="flex items-center gap-2">
            <Link href="/clients/new" className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajouter client</span>
            </Link>
            <Link href="/sales/new" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4">
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1ère vente</span>
            </Link>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-8 h-8 text-brand-500" />
          </div>
          <h2 className="font-display font-bold text-dark-900 text-lg mb-2">Commencez dès maintenant</h2>
          <p className="text-dark-400 text-sm font-body mb-6 max-w-sm mx-auto">
            Ajoutez votre premier client et enregistrez votre première transaction pour voir vos statistiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/clients/new" className="btn-secondary justify-center">
              <Users className="w-4 h-4" /> Ajouter un client
            </Link>
            <Link href="/sales/new" className="btn-primary justify-center">
              <PlusCircle className="w-4 h-4" /> Enregistrer une vente
            </Link>
          </div>
        </div>
      ) : (
        <>
          <StatsCards stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <RevenueChart transactions={txList} />
            </div>
            <TypeBreakdown stats={stats} />
          </div>
          <RecentTransactions transactions={txList.slice(0, 8)} />
        </>
      )}
    </div>
  )
}
