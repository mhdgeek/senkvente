import { formatCFA } from '@/lib/utils'
import { ShoppingBag, Wrench, RefreshCw } from 'lucide-react'

interface Props {
  stats: {
    revenueVente: number
    revenueIntervention: number
    revenueAbonnement: number
    nbVentes: number
    nbInterventions: number
    nbAbonnements: number
    totalRevenue: number
  }
}

export default function TypeBreakdown({ stats }: Props) {
  const total = stats.totalRevenue || 1
  const items = [
    {
      label: 'Ventes',
      amount: stats.revenueVente,
      count: stats.nbVentes,
      icon: ShoppingBag,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      pct: Math.round((stats.revenueVente / total) * 100),
    },
    {
      label: 'Interventions',
      amount: stats.revenueIntervention,
      count: stats.nbInterventions,
      icon: Wrench,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      bar: 'bg-gradient-to-r from-purple-500 to-pink-500',
      pct: Math.round((stats.revenueIntervention / total) * 100),
    },
    {
      label: 'Abonnements',
      amount: stats.revenueAbonnement,
      count: stats.nbAbonnements,
      icon: RefreshCw,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      pct: Math.round((stats.revenueAbonnement / total) * 100),
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-dark-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-dark-900 font-display">Par type</h3>
        <span className="text-xs text-dark-400 font-body bg-dark-50 px-2 py-1 rounded-lg">
          {stats.nbVentes + stats.nbInterventions + stats.nbAbonnements} ops
        </span>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-dark-800 font-body">{item.label}</span>
                  <span className={`text-xs font-bold font-display ${item.color}`}>{item.pct}%</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs font-bold text-dark-700 font-display truncate">{formatCFA(item.amount)}</p>
                  <p className="text-xs text-dark-400 font-body shrink-0">{item.count} op.</p>
                </div>
              </div>
            </div>
            <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.bar} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
