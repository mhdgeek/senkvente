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
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      bar: 'bg-blue-500',
      pct: Math.round((stats.revenueVente / total) * 100),
    },
    {
      label: 'Interventions',
      amount: stats.revenueIntervention,
      count: stats.nbInterventions,
      icon: Wrench,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      bar: 'bg-purple-500',
      pct: Math.round((stats.revenueIntervention / total) * 100),
    },
    {
      label: 'Abonnements',
      amount: stats.revenueAbonnement,
      count: stats.nbAbonnements,
      icon: RefreshCw,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      bar: 'bg-emerald-500',
      pct: Math.round((stats.revenueAbonnement / total) * 100),
    },
  ]

  return (
    <div className="card p-5">
      <h3 className="section-title mb-5">Par type</h3>
      <div className="space-y-5">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-dark-800 font-body">{item.label}</span>
                  <span className="text-xs text-dark-400 font-body">{item.count} op.</span>
                </div>
                <p className="text-sm font-bold text-dark-900 font-display">{formatCFA(item.amount)}</p>
              </div>
            </div>
            <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.bar} rounded-full transition-all duration-700`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
            <p className="text-xs text-dark-400 mt-1 font-body">{item.pct}% du total</p>
          </div>
        ))}
      </div>
    </div>
  )
}
