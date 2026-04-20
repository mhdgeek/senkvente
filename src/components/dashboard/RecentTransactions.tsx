import Link from 'next/link'
import { formatCFA, formatDateShort } from '@/lib/utils'
import { PAYMENT_METHODS, STATUS_LABELS } from '@/types'
import type { Transaction } from '@/types'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  transactions: (Transaction & { client?: { full_name: string } })[]
}

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    vente: 'badge-vente',
    intervention: 'badge-intervention',
    abonnement: 'badge-abonnement',
  }
  const labels: Record<string, string> = {
    vente: 'Vente',
    intervention: 'Intervention',
    abonnement: 'Abonnement',
  }
  return { cls: map[type] || 'badge', label: labels[type] || type }
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

export default function RecentTransactions({ transactions }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-100">
        <h3 className="section-title">Transactions récentes</h3>
        <Link href="/sales" className="text-sm text-brand-600 hover:text-brand-700 font-medium font-body flex items-center gap-1">
          Tout voir <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-dark-400 text-sm font-body">Aucune transaction pour le moment</p>
          <Link href="/sales/new" className="btn-primary mt-4 mx-auto w-fit">
            Enregistrer une vente
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                <th className="table-head">Client</th>
                <th className="table-head">Type</th>
                <th className="table-head">Description</th>
                <th className="table-head">Paiement</th>
                <th className="table-head">Statut</th>
                <th className="table-head text-right">Montant</th>
                <th className="table-head">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const { cls, label } = typeBadge(t.type)
                return (
                  <tr key={t.id} className="table-row">
                    <td className="table-cell">
                      <Link href={`/clients/${t.client_id}`} className="font-medium text-dark-900 hover:text-brand-600 transition-colors">
                        {t.client?.full_name || '—'}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <span className={cls}>{label}</span>
                    </td>
                    <td className="table-cell max-w-[180px]">
                      <span className="truncate block text-dark-600">{t.description}</span>
                    </td>
                    <td className="table-cell text-dark-500">
                      {PAYMENT_METHODS[t.payment_method]}
                    </td>
                    <td className="table-cell">
                      <span className={statusBadge(t.status)}>
                        {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="table-cell text-right font-semibold text-dark-900 font-display">
                      {formatCFA(Number(t.amount))}
                    </td>
                    <td className="table-cell text-dark-400 whitespace-nowrap">
                      {formatDateShort(t.transaction_date)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
