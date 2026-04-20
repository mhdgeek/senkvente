'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getMonthlyData, formatCFA } from '@/lib/utils'
import { useState } from 'react'
import { BarChart2, TrendingUp } from 'lucide-react'

interface Props {
  transactions: Array<{ transaction_date: string; amount: number; status: string }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-dark-100 rounded-xl shadow-lg px-4 py-3 text-left">
        <p className="text-xs text-dark-400 font-body mb-1 capitalize">{label}</p>
        <p className="text-sm font-bold text-dark-900 font-display">{formatCFA(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ transactions }: Props) {
  const data = getMonthlyData(transactions)
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  const total = data.reduce((s, d) => s + d.amount, 0)
  const best  = data.reduce((prev, cur) => cur.amount > prev.amount ? cur : prev, data[0] || { month: '—', amount: 0 })

  return (
    <div className="bg-white rounded-2xl border border-dark-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-dark-900 font-display">Revenus mensuels</h3>
          <p className="text-xs text-dark-400 font-body mt-0.5">6 derniers mois · {formatCFA(total)}</p>
        </div>
        <div className="flex items-center gap-1 bg-dark-100 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-white shadow-sm text-brand-600' : 'text-dark-400 hover:text-dark-600'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-brand-600' : 'text-dark-400 hover:text-dark-600'}`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-40 sm:h-52 flex flex-col items-center justify-center text-dark-300 gap-2">
          <BarChart2 className="w-8 h-8 opacity-30" />
          <p className="text-sm font-body">Aucune donnée disponible</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f4f1" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#aaa59b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#aaa59b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#ea580c" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#ea580c', strokeWidth: 2, r: 3, stroke: 'white' }} activeDot={{ r: 5, fill: '#ea580c', stroke: 'white', strokeWidth: 2 }} />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f4f1" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#aaa59b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#aaa59b', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#ea580c" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Best month pill */}
          {best.amount > 0 && (
            <div className="mt-3 pt-3 border-t border-dark-50 flex items-center justify-between text-xs font-body text-dark-400">
              <span>Meilleur mois</span>
              <span className="font-semibold text-dark-700">{best.month} · {formatCFA(best.amount)}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
