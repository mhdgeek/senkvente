import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCFA, getInitials } from '@/lib/utils'
import { UserPlus, Phone, Mail, ChevronRight } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: clients } = await supabase
    .from('clients')
    .select(`
      *,
      transactions(amount, status, type)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const clientsWithStats = (clients || []).map(c => {
    const txs = c.transactions || []
    const totalRevenue = txs
      .filter((t: any) => t.status === 'payé')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    return { ...c, totalRevenue, nbTransactions: txs.length }
  })

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-dark-400 text-sm mt-1 font-body">
            {clientsWithStats.length} client{clientsWithStats.length > 1 ? 's' : ''} enregistré{clientsWithStats.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Nouveau client
        </Link>
      </div>

      {clientsWithStats.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-16 h-16 bg-dark-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-dark-400" />
          </div>
          <h3 className="font-display font-semibold text-dark-800 text-lg mb-2">Aucun client</h3>
          <p className="text-dark-400 text-sm font-body mb-6">Commencez par ajouter votre premier client</p>
          <Link href="/clients/new" className="btn-primary mx-auto">
            Ajouter un client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientsWithStats.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="card p-5 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center font-bold text-sm font-display shrink-0">
                  {getInitials(client.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-dark-900 font-body truncate group-hover:text-brand-600 transition-colors">
                      {client.full_name}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-dark-300 group-hover:text-brand-500 transition-colors shrink-0" />
                  </div>
                  {client.city && (
                    <p className="text-xs text-dark-400 font-body mt-0.5">{client.city}</p>
                  )}
                  <div className="mt-3 space-y-1">
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-dark-500 font-body">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-xs text-dark-500 font-body">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-dark-400 font-body">{client.nbTransactions} transaction{client.nbTransactions > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dark-900 font-display">{formatCFA(client.totalRevenue)}</p>
                  <p className="text-xs text-dark-400 font-body">C.A. total</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
