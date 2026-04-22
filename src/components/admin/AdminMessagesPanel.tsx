'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUGGESTION_CATEGORIES, type SuggestionStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Search, Filter, Send, Loader2, CheckCircle2, Clock, AlertCircle, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  category: string
  subject: string
  message: string
  status: SuggestionStatus
  admin_reply?: string
  created_at: string
  user?: { full_name: string; email?: string; business_name?: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  nouveau:   { label: 'Nouveau',   color: 'text-amber-400',  bg: 'bg-amber-900/30 border-amber-700/50',   icon: AlertCircle },
  en_cours:  { label: 'En cours',  color: 'text-blue-400',   bg: 'bg-blue-900/30 border-blue-700/50',     icon: Clock },
  résolu:    { label: 'Résolu',    color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-700/50', icon: CheckCircle2 },
  fermé:     { label: 'Fermé',     color: 'text-slate-500',  bg: 'bg-slate-800 border-slate-700',         icon: X },
}

const CAT_COLORS: Record<string, string> = {
  bug: 'text-red-400 bg-red-900/30',
  suggestion: 'text-blue-400 bg-blue-900/30',
  question: 'text-purple-400 bg-purple-900/30',
  autre: 'text-slate-400 bg-slate-800',
}

export default function AdminMessagesPanel({ suggestions }: { suggestions: Suggestion[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Suggestion | null>(null)
  const [reply, setReply] = useState('')
  const [newStatus, setNewStatus] = useState<SuggestionStatus>('en_cours')
  const [saving, setSaving] = useState(false)

  const filtered = suggestions.filter(s => {
    const matchSearch = !search || s.subject.toLowerCase().includes(search.toLowerCase()) ||
      s.message.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleOpen = (s: Suggestion) => {
    setSelected(s)
    setReply(s.admin_reply || '')
    setNewStatus(s.status)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('faq_suggestions').update({
      status: newStatus,
      admin_reply: reply || null,
    }).eq('id', selected.id)
    setSaving(false)
    setSelected(null)
    router.refresh()
  }

  const counts = {
    all: suggestions.length,
    nouveau: suggestions.filter(s => s.status === 'nouveau').length,
    en_cours: suggestions.filter(s => s.status === 'en_cours').length,
    résolu: suggestions.filter(s => s.status === 'résolu').length,
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Messages & FAQ</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-body">{suggestions.length} messages reçus des utilisateurs</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { v: 'all', l: `Tous (${counts.all})` },
          { v: 'nouveau', l: `Nouveaux (${counts.nouveau})` },
          { v: 'en_cours', l: `En cours (${counts.en_cours})` },
          { v: 'résolu', l: `Résolus (${counts.résolu})` },
        ].map(tab => (
          <button key={tab.v} onClick={() => setStatusFilter(tab.v)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-body',
              statusFilter === tab.v
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent'
            )}>
            {tab.l}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="pl-8 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 text-xs font-body focus:outline-none focus:border-slate-600 w-48" />
        </div>
      </div>

      {/* Messages list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl py-12 text-center text-slate-600 text-sm font-body">
            Aucun message trouvé
          </div>
        ) : filtered.map(s => {
          const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG.nouveau
          const StatusIcon = sc.icon
          return (
            <button key={s.id} onClick={() => handleOpen(s)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 text-left transition-all group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full font-body', CAT_COLORS[s.category] || CAT_COLORS.autre)}>
                      {SUGGESTION_CATEGORIES[s.category as keyof typeof SUGGESTION_CATEGORIES] || s.category}
                    </span>
                    <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border font-body', sc.bg, sc.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </span>
                    <span className="text-xs text-slate-600 font-body ml-auto">
                      {new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 font-body mb-0.5">{s.subject}</p>
                  <p className="text-xs text-slate-500 font-body truncate">{s.message}</p>
                  {s.user && (
                    <p className="text-xs text-slate-600 font-body mt-1">
                      De : {s.user.full_name} {s.user.email ? `· ${s.user.email}` : ''}
                    </p>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 -rotate-90 mt-1" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Message detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg animate-fade-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <p className="font-semibold text-slate-200 font-body">{selected.subject}</p>
                <p className="text-xs text-slate-500 font-body mt-0.5">
                  {selected.user?.full_name} · {formatDate(selected.created_at)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Original message */}
              <div>
                <p className="text-xs text-slate-500 font-body mb-2 font-medium uppercase tracking-wide">Message</p>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-300 font-body leading-relaxed">{selected.message}</p>
                </div>
              </div>

              {/* Status update */}
              <div>
                <p className="text-xs text-slate-500 font-body mb-2 font-medium uppercase tracking-wide">Statut</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(STATUS_CONFIG) as [SuggestionStatus, any][]).map(([k, v]) => (
                    <button key={k} onClick={() => setNewStatus(k)}
                      className={cn('py-2 px-2 rounded-lg text-xs font-medium transition-all font-body border',
                        newStatus === k ? `${v.bg} ${v.color}` : 'border-slate-800 text-slate-600 hover:border-slate-700'
                      )}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply */}
              <div>
                <p className="text-xs text-slate-500 font-body mb-2 font-medium uppercase tracking-wide">Réponse admin</p>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4}
                  placeholder="Répondez à cet utilisateur... (optionnel)"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm font-body resize-none" />
                <p className="text-xs text-slate-600 font-body mt-1">La réponse sera visible par l&apos;utilisateur dans son espace.</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 rounded-xl text-sm font-medium font-body transition-all">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all font-body">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Enregistrer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
