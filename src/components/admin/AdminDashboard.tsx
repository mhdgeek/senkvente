'use client'

import { formatCFA, formatDate, getInitials } from '@/lib/utils'
import { Users, ShoppingBag, TrendingUp, MessageSquare, UserPlus, Activity, MapPin, BarChart3 } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  stats: {
    totalUsers: number
    totalClients: number
    totalTransactions: number
    totalRevenue: number
    newUsersThisMonth: number
    pendingMessages: number
  }
  months: { month: string; signups: number; revenue: number }[]
  typeBreakdown: { vente: number; intervention: number; abonnement: number }
  topCities: [string, number][]
  recentSignups: { id: string; full_name: string; business_name: string; city?: string; created_at: string; email?: string }[]
  suggestionStats: { total: number; nouveau: number; en_cours: number; résolu: number }
}

const SlateTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {typeof p.value === 'number' && p.value > 1000 ? formatCFA(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard({ stats, months, typeBreakdown, topCities, recentSignups, suggestionStats }: Props) {
  const total = stats.totalTransactions || 1
  const typeItems = [
    { label: 'Ventes', value: typeBreakdown.vente, pct: Math.round((typeBreakdown.vente / total) * 100), color: '#3b82f6' },
    { label: 'Interventions', value: typeBreakdown.intervention, pct: Math.round((typeBreakdown.intervention / total) * 100), color: '#a855f7' },
    { label: 'Abonnements', value: typeBreakdown.abonnement, pct: Math.round((typeBreakdown.abonnement / total) * 100), color: '#10b981' },
  ]

  const statCards = [
    { label: 'Utilisateurs inscrits', value: stats.totalUsers, sub: `+${stats.newUsersThisMonth} ce mois`, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Clients enregistrés', value: stats.totalClients, sub: 'Sur toute la plateforme', icon: UserPlus, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Transactions totales', value: stats.totalTransactions, sub: 'Ventes + Interventions + Abos', icon: ShoppingBag, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    { label: 'Revenus plateforme', value: formatCFA(stats.totalRevenue), sub: 'Paiements confirmés', icon: TrendingUp, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    { label: 'Messages en attente', value: stats.pendingMessages, sub: `${suggestionStats.total} total reçus`, icon: MessageSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Taux de résolution', value: `${stats.pendingMessages > 0 || suggestionStats.résolu > 0 ? Math.round((suggestionStats.résolu / (suggestionStats.total || 1)) * 100) : 100}%`, sub: `${suggestionStats.résolu} résolus`, icon: Activity, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Vue d&apos;ensemble</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-body">Statistiques globales de la plateforme SenkVente</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((c, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-slate-500 font-body font-medium">{c.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white font-display mb-0.5">
              {typeof c.value === 'number' ? c.value.toLocaleString('fr-FR') : c.value}
            </p>
            <p className="text-xs text-slate-600 font-body">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Signups chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-body">Nouvelles inscriptions</h3>
            <span className="ml-auto text-xs text-slate-600 font-body">6 derniers mois</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={months} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<SlateTooltip />} />
              <Bar dataKey="signups" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-body">Revenus plateforme</h3>
            <span className="ml-auto text-xs text-slate-600 font-body">6 derniers mois</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={months} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<SlateTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2}
                fill="url(#revGrad)" dot={{ fill: '#a855f7', r: 3, stroke: '#0f172a', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Type breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-body">Types de transactions</h3>
          </div>
          <div className="space-y-4">
            {typeItems.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 font-body">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 font-display">{item.value.toLocaleString('fr-FR')}</span>
                    <span className="text-xs text-slate-600 font-body">{item.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Cities */}
          {topCities.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-xs text-slate-500 font-body font-medium">Top villes</p>
              </div>
              <div className="space-y-2">
                {topCities.map(([city, count], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-body">{city}</span>
                    <span className="text-xs font-semibold text-slate-300 font-display">{count} users</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent signups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-body">Dernières inscriptions</h3>
          </div>
          <div className="space-y-3">
            {recentSignups.length === 0 ? (
              <p className="text-slate-600 text-xs font-body">Aucune inscription récente</p>
            ) : recentSignups.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center text-xs font-bold font-display shrink-0">
                  {getInitials(user.full_name || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate font-body">{user.full_name || '—'}</p>
                  <p className="text-xs text-slate-600 truncate font-body">{user.business_name || user.email || '—'}</p>
                </div>
                <p className="text-xs text-slate-600 font-body whitespace-nowrap shrink-0">
                  {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Messages stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200 font-body">Messages FAQ</h3>
            </div>
            <a href="/admin/messages" className="text-xs text-purple-400 hover:text-purple-300 font-body transition-colors">
              Voir tout →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Total', value: suggestionStats.total, color: 'text-slate-300' },
              { label: 'En attente', value: suggestionStats.nouveau, color: 'text-amber-400' },
              { label: 'En cours', value: suggestionStats.en_cours, color: 'text-blue-400' },
              { label: 'Résolus', value: suggestionStats.résolu, color: 'text-emerald-400' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-500 font-body mb-0.5">{s.label}</p>
                <p className={`text-xl font-bold font-display ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-body mb-1.5">
              <span>Taux de résolution</span>
              <span>{suggestionStats.total > 0 ? Math.round((suggestionStats.résolu / suggestionStats.total) * 100) : 100}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                style={{ width: `${suggestionStats.total > 0 ? Math.round((suggestionStats.résolu / suggestionStats.total) * 100) : 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
