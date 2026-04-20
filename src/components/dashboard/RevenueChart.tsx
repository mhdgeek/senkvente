'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getMonthlyData, formatCFA } from '@/lib/utils'

interface Props {
  transactions: Array<{ transaction_date: string; amount: number; status: string }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-dark-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs text-dark-400 font-body mb-1">{label}</p>
        <p className="text-sm font-bold text-dark-900 font-display">{formatCFA(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ transactions }: Props) {
  const data = getMonthlyData(transactions)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="section-title">Revenus mensuels</h3>
          <p className="text-xs text-dark-400 font-body mt-0.5">6 derniers mois</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-dark-300 text-sm font-body">
          Aucune donnée disponible
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0efed" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#8a8478', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8a8478', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#ea580c"
              strokeWidth={2.5}
              fill="url(#colorRevenue)"
              dot={{ fill: '#ea580c', strokeWidth: 2, r: 4, stroke: 'white' }}
              activeDot={{ r: 6, fill: '#ea580c', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
