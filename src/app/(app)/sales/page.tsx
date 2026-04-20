import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SalesTable from '@/components/sales/SalesTable'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default async function SalesPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; search?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let query = supabase
    .from('transactions')
    .select('*, client:clients(full_name, phone)')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: transactions } = await query

  const total = (transactions || [])
    .filter(t => t.status === 'payé')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Historique des transactions</h1>
          <p className="text-dark-400 text-sm mt-1 font-body">
            {(transactions || []).length} transaction{(transactions || []).length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/sales/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Nouvelle
        </Link>
      </div>

      <SalesTable
        transactions={transactions || []}
        totalRevenue={total}
        filters={searchParams}
      />
    </div>
  )
}
