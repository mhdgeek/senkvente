'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCFA, formatDate, getInitials } from '@/lib/utils'
import { Search, Mail, Loader2, CheckCircle2, Users, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserWithStats {
  id: string
  full_name: string
  business_name: string
  email?: string
  phone?: string
  city?: string
  created_at: string
  nbClients: number
  nbTransactions: number
  totalRevenue: number
}

export default function AdminUsersPanel({ users }: { users: UserWithStats[] }) {
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState<string | null>(null)
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<UserWithStats | null>(null)

  const filtered = users.filter(u => {
    const s = search.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(s) ||
      u.business_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.city?.toLowerCase().includes(s)
    )
  })

  const handleReset = async (user: UserWithStats) => {
    if (!user.email) return
    setSending(user.id)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setSentMap(p => ({ ...p, [user.id]: true }))
    setSending(null)
    setTimeout(() => setSentMap(p => ({ ...p, [user.id]: false })), 4000)
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-body">{users.length} comptes inscrits</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm font-body w-56" />
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total inscrits', value: users.length },
          { label: 'Total clients', value: users.reduce((s, u) => s + u.nbClients, 0) },
          { label: 'Total transactions', value: users.reduce((s, u) => s + u.nbTransactions, 0) },
        ].map((c, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-body mb-1">{c.label}</p>
            <p className="text-xl font-bold text-white font-display">{c.value.toLocaleString('fr-FR')}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-600 text-sm font-body">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800">
                <tr>
                  {['Utilisateur', 'Ville', 'Clients', 'Transactions', 'C.A. total', 'Inscrit le', ''].map((h, i) => (
                    <th key={i} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4 bg-slate-800/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-900/50 text-purple-300 rounded-lg flex items-center justify-center text-xs font-bold font-display shrink-0">
                          {getInitials(user.full_name || '?')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 font-body">{user.full_name || '—'}</p>
                          <p className="text-xs text-slate-600 font-body truncate max-w-[140px]">{user.email || user.business_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-body">{user.city || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-slate-300 font-display">{user.nbClients}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-slate-300 font-display">{user.nbTransactions}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-emerald-400 font-display">{formatCFA(user.totalRevenue)}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-body whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(user)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-950/40 transition-all">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleReset(user)} disabled={sending === user.id || !user.email}
                          className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all font-body',
                            sentMap[user.id] ? 'bg-emerald-900/40 text-emerald-400' :
                            !user.email ? 'opacity-30 cursor-not-allowed text-slate-600' :
                            'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50'
                          )}>
                          {sending === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                           sentMap[user.id] ? <CheckCircle2 className="w-3 h-3" /> :
                           <Mail className="w-3 h-3" />}
                          {sending === user.id ? 'Envoi...' : sentMap[user.id] ? 'Envoyé' : 'Reset'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', minHeight: '100vh' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-900/50 text-purple-300 rounded-xl flex items-center justify-center font-bold font-display">
                  {getInitials(selected.full_name || '?')}
                </div>
                <div>
                  <p className="font-semibold text-slate-200 font-body">{selected.full_name}</p>
                  <p className="text-xs text-slate-500 font-body">{selected.business_name}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              {[
                { l: 'Email',        v: selected.email },
                { l: 'Téléphone',    v: selected.phone },
                { l: 'Ville',        v: selected.city },
                { l: 'Clients',      v: String(selected.nbClients) },
                { l: 'Transactions', v: String(selected.nbTransactions) },
                { l: 'C.A. total',   v: formatCFA(selected.totalRevenue) },
                { l: 'Inscrit le',   v: formatDate(selected.created_at) },
              ].map(r => r.v && r.v !== '0' && r.v !== '0 FCFA' ? (
                <div key={r.l} className="flex justify-between py-2 border-b border-slate-800 last:border-0">
                  <span className="text-xs text-slate-500 font-body">{r.l}</span>
                  <span className="text-sm text-slate-200 font-body font-medium">{r.v}</span>
                </div>
              ) : null)}
            </div>
            <div className="p-5 pt-0">
              <button onClick={() => { handleReset(selected); setSelected(null) }} disabled={!selected.email}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all font-body">
                <Mail className="w-4 h-4" /> Envoyer reset mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
