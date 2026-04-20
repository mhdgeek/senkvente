import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCFA, formatDate, formatDateShort, getInitials } from '@/lib/utils'
import { PAYMENT_METHODS, STATUS_LABELS } from '@/types'
import ClientActions from '@/components/clients/ClientActions'
import { ArrowLeft, Phone, Mail, MapPin, FileText, PlusCircle, StickyNote } from 'lucide-react'

const typeBadge = (type: string) => {
  const map: Record<string, { cls: string; label: string }> = {
    vente: { cls: 'badge-vente', label: 'Vente' },
    intervention: { cls: 'badge-intervention', label: 'Intervention' },
    abonnement: { cls: 'badge-abonnement', label: 'Abonnement' },
  }
  return map[type] || { cls: 'badge', label: type }
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'payé': 'badge-paid',
    'en_attente': 'badge-pending',
    'partiel': 'badge-partial',
    'annulé': 'badge-cancelled',
  }
  return map[status] || 'badge'
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!client) notFound()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('client_id', params.id)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  const txList = transactions || []
  const totalRevenue = txList.filter(t => t.status === 'payé').reduce((sum, t) => sum + Number(t.amount), 0)
  const pending = txList.filter(t => t.status === 'en_attente').reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <Link href="/clients" className="btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux clients
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center text-lg font-bold font-display">
              {getInitials(client.full_name)}
            </div>
            <div>
              <h1 className="page-title">{client.full_name}</h1>
              <p className="text-dark-400 text-sm font-body mt-0.5">
                Client depuis le {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          <ClientActions client={client} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="card p-5 space-y-4">
          <h3 className="section-title">Informations</h3>
          <div className="space-y-3">
            {client.phone && (
              <div className="flex items-center gap-3 text-sm font-body">
                <div className="w-8 h-8 bg-dark-100 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-dark-500" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Téléphone</p>
                  <p className="text-dark-800 font-medium">{client.phone}</p>
                </div>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-3 text-sm font-body">
                <div className="w-8 h-8 bg-dark-100 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-dark-500" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Email</p>
                  <p className="text-dark-800 font-medium">{client.email}</p>
                </div>
              </div>
            )}
            {(client.city || client.address) && (
              <div className="flex items-center gap-3 text-sm font-body">
                <div className="w-8 h-8 bg-dark-100 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-dark-500" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Localisation</p>
                  <p className="text-dark-800 font-medium">{[client.address, client.city].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            )}
            {client.notes && (
              <div className="flex items-start gap-3 text-sm font-body">
                <div className="w-8 h-8 bg-dark-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <StickyNote className="w-3.5 h-3.5 text-dark-500" />
                </div>
                <div>
                  <p className="text-dark-400 text-xs">Notes</p>
                  <p className="text-dark-700">{client.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4 content-start">
          <div className="card p-4 text-center">
            <p className="text-xs text-dark-400 font-body mb-1">C.A. total</p>
            <p className="text-xl font-bold text-dark-950 font-display">{formatCFA(totalRevenue)}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-dark-400 font-body mb-1">Transactions</p>
            <p className="text-xl font-bold text-dark-950 font-display">{txList.length}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-dark-400 font-body mb-1">En attente</p>
            <p className="text-xl font-bold text-amber-600 font-display">{formatCFA(pending)}</p>
          </div>

          <div className="col-span-3 flex justify-end">
            <Link href={`/sales/new?client_id=${client.id}`} className="btn-primary">
              <PlusCircle className="w-4 h-4" />
              Nouvelle transaction
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-100">
          <FileText className="w-4 h-4 text-dark-400" />
          <h3 className="section-title">Historique des transactions</h3>
        </div>

        {txList.length === 0 ? (
          <div className="py-12 text-center text-dark-400 text-sm font-body">
            Aucune transaction pour ce client
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-100">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Description</th>
                  <th className="table-head">Paiement</th>
                  <th className="table-head">Statut</th>
                  <th className="table-head text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {txList.map(t => {
                  const { cls, label } = typeBadge(t.type)
                  return (
                    <tr key={t.id} className="table-row">
                      <td className="table-cell whitespace-nowrap text-dark-500">{formatDateShort(t.transaction_date)}</td>
                      <td className="table-cell"><span className={cls}>{label}</span></td>
                      <td className="table-cell max-w-[200px]">
                        <p className="truncate text-dark-700">{t.description}</p>
                        {t.intervention_type && <p className="text-xs text-dark-400">{t.intervention_type}</p>}
                        {t.subscription_service && <p className="text-xs text-dark-400">{t.subscription_service} · {t.subscription_period}</p>}
                      </td>
                      <td className="table-cell text-dark-500">{PAYMENT_METHODS[t.payment_method as keyof typeof PAYMENT_METHODS]}</td>
                      <td className="table-cell">
                        <span className={statusBadge(t.status)}>
                          {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="table-cell text-right font-bold font-display text-dark-900">
                        {formatCFA(Number(t.amount))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
