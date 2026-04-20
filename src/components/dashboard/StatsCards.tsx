import { formatCFA } from '@/lib/utils'
import { TrendingUp, Users, FileText, Clock, ArrowUpRight } from 'lucide-react'

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
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-500',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-100',
      sub: 'Paiements reçus',
      trend: '+12%',
    },
    {
      label: 'Total clients',
      value: stats.totalClients.toString(),
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-500',
      lightBg: 'bg-blue-50',
      border: 'border-blue-100',
      sub: 'Dans votre base',
      trend: null,
    },
    {
      label: 'Transactions',
      value: stats.totalTransactions.toString(),
      icon: FileText,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-500',
      gradient: 'from-orange-500 to-brand-500',
      lightBg: 'bg-orange-50',
      border: 'border-orange-100',
      sub: 'Ventes · Interventions · Abos',
      trend: null,
    },
    {
      label: 'En attente',
      value: formatCFA(stats.pendingRevenue),
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-500',
      gradient: 'from-amber-400 to-orange-400',
      lightBg: 'bg-amber-50',
      border: 'border-amber-100',
      sub: 'À encaisser',
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`relative bg-white rounded-2xl border ${card.border} p-4 sm:p-5 overflow-hidden group hover:shadow-md transition-all duration-200`}
        >
          {/* Subtle gradient blob */}
          <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full group-hover:opacity-10 transition-opacity`} />

          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 ${card.lightBg} rounded-xl flex items-center justify-center shrink-0`}>
              <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconColor}`} />
            </div>
            {card.trend && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </span>
            )}
          </div>

          <p className="text-lg sm:text-2xl font-bold text-dark-950 font-display leading-tight mb-0.5 truncate">
            {card.value}
          </p>
          <p className="text-xs text-dark-400 font-body font-medium truncate">{card.label}</p>
          <p className="text-xs text-dark-300 font-body mt-0.5 hidden sm:block truncate">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
