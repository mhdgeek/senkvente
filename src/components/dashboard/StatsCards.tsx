import { formatCFA } from '@/lib/utils'
import { TrendingUp, Users, FileText, Clock } from 'lucide-react'

interface Props {
  stats: {
    totalRevenue: number
    totalTransactions: number
    totalClients: number
    pendingRevenue: number
  }
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Revenus confirmés',
      value: formatCFA(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      sub: 'Paiements reçus',
    },
    {
      label: 'Total clients',
      value: stats.totalClients.toString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      sub: 'Dans votre base',
    },
    {
      label: 'Transactions',
      value: stats.totalTransactions.toString(),
      icon: FileText,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      border: 'border-brand-100',
      sub: 'Ventes, interventions, abos',
    },
    {
      label: 'En attente',
      value: formatCFA(stats.pendingRevenue),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      sub: 'À encaisser',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`card p-5 border ${card.border}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-dark-500 font-body font-medium">{card.label}</p>
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-dark-950 font-display mb-1">{card.value}</p>
          <p className="text-xs text-dark-400 font-body">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
