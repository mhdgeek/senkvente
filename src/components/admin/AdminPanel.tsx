'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCFA, formatDate, getInitials } from '@/lib/utils'
import {
  Users, ShoppingBag, TrendingUp, Activity,
  Search, Mail, RefreshCw, Loader2, CheckCircle2,
  ShieldCheck, AlertCircle, Eye, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  totalUsers: number
  totalClients: number
  totalTransactions: number
  totalRevenue: number
}

interface UserRow {
  id: string
  full_name: string
  business_name: string
  phone?: string
  city?: string
  email?: string
  created_at: string
}

interface Props {
  stats: Stats
  users: UserRow[]
}

export default function AdminPanel({ stats, users }: Props) {
  const [search, setSearch]           = useState('')
  const [sending, setSending]         = useState<string | null>(null)
  const [sentMap, setSentMap]         = useState<Record<string, boolean>>({})
  const [errorMap, setErrorMap]       = useState<Record<string, string>>({})
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  const filtered = users.filter(u => {
    const s = search.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(s) ||
      u.business_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.city?.toLowerCase().includes(s)
    )
  })

  const handleResetPassword = async (user: UserRow) => {
    if (!user.email) {
      setErrorMap(p => ({ ...p, [user.id]: "Pas d'email pour cet utilisateur." }))
      return
    }
    setSending(user.id)
    setErrorMap(p => ({ ...p, [user.id]: '' }))

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setErrorMap(p => ({ ...p, [user.id]: 'Erreur lors de l\'envoi.' }))
    } else {
      setSentMap(p => ({ ...p, [user.id]: true }))
      setTimeout(() => setSentMap(p => ({ ...p, [user.id]: false })), 4000)
    }
    setSending(null)
  }

  const statCards = [
    { label: 'Utilisateurs inscrits', value: stats.totalUsers, icon: Users,        bg: 'bg-blue-50',    ic: 'text-blue-600' },
    { label: 'Clients enregistrés',   value: stats.totalClients, icon: Users,      bg: 'bg-purple-50',  ic: 'text-purple-600' },
    { label: 'Transactions totales',  value: stats.totalTransactions, icon: ShoppingBag, bg: 'bg-brand-50', ic: 'text-brand-600' },
    { label: 'Revenus plateforme',    value: formatCFA(stats.totalRevenue), icon: TrendingUp, bg: 'bg-emerald-50', ic: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="text-dark-400 text-sm font-body mt-0.5">Gestion globale de la plateforme SenkVente</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-dark-500 font-body font-medium">{c.label}</p>
              <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center`}>
                <c.icon className={`w-4 h-4 ${c.ic}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-dark-950 font-display">
              {typeof c.value === 'number' ? c.value.toLocaleString('fr-FR') : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="section-title">Utilisateurs ({filtered.length})</h2>
              <p className="text-xs text-dark-400 font-body mt-0.5">Gérez les comptes et réinitialisez les mots de passe</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="input pl-9 w-64"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-dark-400 text-sm font-body">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-100">
                <tr>
                  <th className="table-head">Utilisateur</th>
                  <th className="table-head">Business</th>
                  <th className="table-head">Contact</th>
                  <th className="table-head">Ville</th>
                  <th className="table-head">Inscrit le</th>
                  <th className="table-head text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center text-xs font-bold font-display shrink-0">
                          {getInitials(user.full_name || '?')}
                        </div>
                        <div>
                          <p className="font-medium text-dark-900 text-sm font-body">{user.full_name || '—'}</p>
                          {user.email && <p className="text-xs text-dark-400 font-body">{user.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-dark-700 font-body">{user.business_name || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-dark-500 font-body text-xs">{user.phone || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-dark-500 font-body text-xs">{user.city || '—'}</span>
                    </td>
                    <td className="table-cell text-dark-400 text-xs whitespace-nowrap font-body">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-2">
                        {/* View details */}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Voir les détails"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset password */}
                        <button
                          onClick={() => handleResetPassword(user)}
                          disabled={sending === user.id || !user.email}
                          title={user.email ? 'Envoyer un lien de réinitialisation' : 'Pas d\'email disponible'}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-body',
                            sentMap[user.id]
                              ? 'bg-emerald-50 text-emerald-700'
                              : !user.email
                                ? 'bg-dark-100 text-dark-300 cursor-not-allowed'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          )}
                        >
                          {sending === user.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : sentMap[user.id]
                              ? <CheckCircle2 className="w-3 h-3" />
                              : <Mail className="w-3 h-3" />
                          }
                          {sending === user.id ? 'Envoi...' : sentMap[user.id] ? 'Envoyé !' : 'Reset mdp'}
                        </button>

                        {/* Error */}
                        {errorMap[user.id] && (
                          <span className="text-xs text-red-500 font-body">{errorMap[user.id]}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 font-body">Données sensibles</p>
          <p className="text-xs text-amber-700 font-body mt-0.5">
            Cette page est accessible uniquement aux administrateurs. Le bouton &quot;Reset mdp&quot; envoie un email de réinitialisation 
            sécurisé à l&apos;utilisateur. Aucun mot de passe n&apos;est visible ni modifiable directement.
          </p>
        </div>
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 p-4 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', minHeight: '100vh' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedUser(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between p-5 border-b border-dark-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center font-bold font-display">
                  {getInitials(selectedUser.full_name || '?')}
                </div>
                <div>
                  <p className="font-semibold text-dark-900 font-body">{selectedUser.full_name}</p>
                  <p className="text-xs text-dark-400 font-body">{selectedUser.business_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-100 text-dark-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Email',       value: selectedUser.email },
                { label: 'Téléphone',   value: selectedUser.phone },
                { label: 'Ville',       value: selectedUser.city },
                { label: 'Inscrit le',  value: formatDate(selectedUser.created_at) },
                { label: 'ID',          value: selectedUser.id, mono: true },
              ].map(row => row.value ? (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0">
                  <span className="text-xs text-dark-400 font-body">{row.label}</span>
                  <span className={cn('text-sm font-body text-dark-800', row.mono ? 'font-mono text-xs' : '')}>{row.value}</span>
                </div>
              ) : null)}
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => { handleResetPassword(selectedUser); setSelectedUser(null) }}
                disabled={!selectedUser.email}
                className="w-full btn-primary justify-center"
              >
                <Mail className="w-4 h-4" />
                Envoyer un lien de réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
