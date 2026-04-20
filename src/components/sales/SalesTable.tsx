'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { Transaction } from '@/types'
import { PAYMENT_METHODS, STATUS_LABELS } from '@/types'
import { formatCFA, formatDateShort, cn } from '@/lib/utils'
import Link from 'next/link'
import { Search, Filter, Trash2, Loader2 } from 'lucide-react'

interface Props {
  transactions: (Transaction & { client?: { full_name: string; phone?: string } })[]
  totalRevenue: number
  filters: { type?: string; status?: string; search?: string }
}

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

export default function SalesTable({ transactions, totalRevenue, filters }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(filters.search || '')
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all')
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const applyFilters = (newType?: string, newStatus?: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (newType && newType !== 'all') params.set('type', newType)
    if (newStatus && newStatus !== 'all') params.set('status', newStatus)
    router.push(`/sales?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette transaction ?')) return
    setDeletingId(id)
    const supabase = createSupabaseClient()
    await supabase.from('transactions').delete().eq('id', id)
    setDeletingId(null)
    router.refresh()
  }

  const filtered = transactions.filter(t => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      t.client?.full_name.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      String(t.amount).includes(s)
    )
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters(typeFilter, statusFilter)}
              placeholder="Rechercher client, description..."
              className="input pl-9"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5 bg-dark-100 rounded-xl p-1">
            {[
              { v: 'all', l: 'Tous' },
              { v: 'vente', l: 'Ventes' },
              { v: 'intervention', l: 'Interventions' },
              { v: 'abonnement', l: 'Abonnements' },
            ].map(o => (
              <button
                key={o.v}
                onClick={() => { setTypeFilter(o.v); applyFilters(o.v, statusFilter) }}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all font-body',
                  typeFilter === o.v ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'
                )}
              >
                {o.l}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); applyFilters(typeFilter, e.target.value) }}
            className="input w-auto"
          >
            <option value="all">Tous statuts</option>
            <option value="payé">Payé</option>
            <option value="en_attente">En attente</option>
            <option value="partiel">Partiel</option>
            <option value="annulé">Annulé</option>
          </select>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-dark-100">
          <p className="text-xs text-dark-400 font-body">
            <span className="font-semibold text-dark-700">{filtered.length}</span> résultat{filtered.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-dark-400 font-body">
            Total encaissé: <span className="font-semibold text-emerald-700">{formatCFA(totalRevenue)}</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-dark-400 text-sm font-body mb-4">Aucune transaction trouvée</p>
            <Link href="/sales/new" className="btn-primary mx-auto">
              Enregistrer une transaction
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-100">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Client</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Description</th>
                  <th className="table-head">Paiement</th>
                  <th className="table-head">Statut</th>
                  <th className="table-head text-right">Montant</th>
                  <th className="table-head w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const { cls, label } = typeBadge(t.type)
                  return (
                    <tr key={t.id} className="table-row">
                      <td className="table-cell whitespace-nowrap text-dark-500 text-xs">
                        {formatDateShort(t.transaction_date)}
                      </td>
                      <td className="table-cell">
                        <Link href={`/clients/${t.client_id}`} className="font-medium text-dark-800 hover:text-brand-600 transition-colors text-sm">
                          {t.client?.full_name || '—'}
                        </Link>
                        {t.client?.phone && (
                          <p className="text-xs text-dark-400">{t.client.phone}</p>
                        )}
                      </td>
                      <td className="table-cell"><span className={cls}>{label}</span></td>
                      <td className="table-cell max-w-[200px]">
                        <p className="truncate text-dark-700 text-sm">{t.description}</p>
                        {t.intervention_type && <p className="text-xs text-dark-400">{t.intervention_type}</p>}
                        {t.subscription_service && <p className="text-xs text-dark-400">{t.subscription_service} · {t.subscription_period}</p>}
                      </td>
                      <td className="table-cell text-dark-500 text-xs whitespace-nowrap">
                        {PAYMENT_METHODS[t.payment_method]}
                      </td>
                      <td className="table-cell">
                        <span className={statusBadge(t.status)}>
                          {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="table-cell text-right font-bold font-display text-dark-900 whitespace-nowrap">
                        {formatCFA(Number(t.amount))}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          {deletingId === t.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
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
