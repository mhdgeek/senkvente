import Link from 'next/link'
import { formatCFA, formatDateShort } from '@/lib/utils'
import { PAYMENT_METHODS, STATUS_LABELS } from '@/types'
import type { Transaction } from '@/types'
import { ArrowRight, ShoppingBag, Wrench, RefreshCw } from 'lucide-react'

interface Props {
  transactions: (Transaction & { client?: { full_name: string } })[]
}

const TYPE_CONFIG: Record<string, { label: string; cls: string; icon: any; iconBg: string; iconColor: string }> = {
  vente:        { label: 'Vente',        cls: 'badge-vente',        icon: ShoppingBag, iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
  intervention: { label: 'Intervention', cls: 'badge-intervention', icon: Wrench,      iconBg: 'bg-purple-50',  iconColor: 'text-purple-600' },
  abonnement:   { label: 'Abonnement',   cls: 'badge-abonnement',   icon: RefreshCw,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
}

const STATUS_CONFIG: Record<string, { cls: string }> = {
  'payé':       { cls: 'bg-emerald-50 text-emerald-700' },
  'en_attente': { cls: 'bg-amber-50 text-amber-700' },
  'partiel':    { cls: 'bg-orange-50 text-orange-700' },
  'annulé':     { cls: 'bg-red-50 text-red-700' },
}

export default function RecentTransactions({ transactions }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-dark-100">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-dark-900 font-display">Transactions récentes</h3>
          <p className="text-xs text-dark-400 font-body mt-0.5 hidden sm:block">{transactions.length} dernières opérations</p>
        </div>
        <Link href="/sales" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium font-body transition-colors">
          <span className="hidden sm:inline">Tout voir</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 sm:py-16 text-center px-4">
          <div className="w-12 h-12 bg-dark-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-5 h-5 text-dark-300" />
          </div>
          <p className="text-dark-400 text-sm font-body mb-4">Aucune transaction pour le moment</p>
          <Link href="/sales/new" className="btn-primary mx-auto w-fit">
            Enregistrer une vente
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table — hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-100">
                <tr>
                  <th className="table-head">Client</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Description</th>
                  <th className="table-head hidden lg:table-cell">Paiement</th>
                  <th className="table-head">Statut</th>
                  <th className="table-head text-right">Montant</th>
                  <th className="table-head hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const tc = TYPE_CONFIG[t.type] || TYPE_CONFIG.vente
                  const sc = STATUS_CONFIG[t.status] || { cls: 'bg-dark-50 text-dark-500' }
                  const TypeIcon = tc.icon
                  return (
                    <tr key={t.id} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                      <td className="table-cell">
                        <Link href={`/clients/${t.client_id}`} className="font-semibold text-dark-900 hover:text-brand-600 transition-colors text-sm">
                          {t.client?.full_name || '—'}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-6 h-6 ${tc.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                            <TypeIcon className={`w-3 h-3 ${tc.iconColor}`} />
                          </div>
                          <span className="text-xs text-dark-600 font-body hidden xl:inline">{tc.label}</span>
                        </div>
                      </td>
                      <td className="table-cell max-w-[160px]">
                        <span className="truncate block text-dark-600 text-xs">{t.description}</span>
                      </td>
                      <td className="table-cell text-dark-500 text-xs hidden lg:table-cell">
                        {PAYMENT_METHODS[t.payment_method]}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>
                          {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="table-cell text-right font-bold text-dark-900 font-display text-sm whitespace-nowrap">
                        {formatCFA(Number(t.amount))}
                      </td>
                      <td className="table-cell text-dark-400 whitespace-nowrap text-xs hidden lg:table-cell">
                        {formatDateShort(t.transaction_date)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list — shown on mobile only */}
          <div className="md:hidden divide-y divide-dark-50">
            {transactions.map((t) => {
              const tc = TYPE_CONFIG[t.type] || TYPE_CONFIG.vente
              const sc = STATUS_CONFIG[t.status] || { cls: 'bg-dark-50 text-dark-500' }
              const TypeIcon = tc.icon
              return (
                <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 ${tc.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <TypeIcon className={`w-4 h-4 ${tc.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/clients/${t.client_id}`} className="font-semibold text-dark-900 text-sm truncate">
                        {t.client?.full_name || '—'}
                      </Link>
                      <span className="font-bold text-dark-900 font-display text-sm shrink-0">
                        {formatCFA(Number(t.amount))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-dark-500 truncate">{t.description}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${sc.cls}`}>
                        {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>
                    <p className="text-xs text-dark-300 mt-0.5">{formatDateShort(t.transaction_date)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
