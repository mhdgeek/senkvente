'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUGGESTION_CATEGORIES, type SuggestionStatus } from '@/types'
import { cn } from '@/lib/utils'
import {
  MessageSquare, Search, Send, Loader2, CheckCircle2,
  Clock, AlertCircle, X, ChevronRight
} from 'lucide-react'

interface Suggestion {
  id: string
  category: string
  subject: string
  message: string
  status: SuggestionStatus
  admin_reply?: string
  created_at: string
  user_id: string
  user?: { full_name: string; email?: string; business_name?: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  nouveau:   { label: 'Nouveau',  color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  en_cours:  { label: 'En cours', color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  résolu:    { label: 'Résolu',   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  fermé:     { label: 'Fermé',    color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200' },
}

const CAT_COLORS: Record<string, string> = {
  bug:        'text-red-400 bg-red-900/30',
  suggestion: 'text-blue-400 bg-blue-900/30',
  question:   'text-purple-400 bg-purple-900/30',
  autre:      'text-slate-400 bg-slate-800',
}

export default function AdminMessagesPanel({ suggestions }: { suggestions: Suggestion[] }) {
  const router = useRouter()
  const [search, setSearch]       = useState('')
  const [statusFilter, setFilter] = useState('all')
  const [selected, setSelected]   = useState<Suggestion | null>(null)
  const [reply, setReply]         = useState('')
  const [newStatus, setNewStatus] = useState<SuggestionStatus>('en_cours')
  const [saving, setSaving]       = useState(false)

  const filtered = suggestions.filter(s => {
    const matchSearch = !search ||
      s.subject.toLowerCase().includes(search.toLowerCase()) ||
      s.message.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all:      suggestions.length,
    nouveau:  suggestions.filter(s => s.status === 'nouveau').length,
    en_cours: suggestions.filter(s => s.status === 'en_cours').length,
    résolu:   suggestions.filter(s => s.status === 'résolu').length,
  }

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

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Messages & FAQ</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-body">
          {suggestions.length} message{suggestions.length > 1 ? 's' : ''} reçu{suggestions.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { v: 'all',     l: `Tous (${counts.all})` },
          { v: 'nouveau', l: `Nouveaux (${counts.nouveau})` },
          { v: 'en_cours',l: `En cours (${counts.en_cours})` },
          { v: 'résolu',  l: `Résolus (${counts.résolu})` },
        ].map(tab => (
          <button key={tab.v} onClick={() => setFilter(tab.v)}
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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="pl-8 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 text-xs font-body focus:outline-none focus:border-slate-600 w-48" />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 text-center">
          <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-body">
            {suggestions.length === 0 ? 'Aucun message reçu pour le moment' : 'Aucun résultat pour cette recherche'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => {
            const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG.nouveau
            return (
              <button key={s.id} onClick={() => handleOpen(s)}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 text-left transition-all group">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full font-body', CAT_COLORS[s.category] || CAT_COLORS.autre)}>
                        {SUGGESTION_CATEGORIES[s.category as keyof typeof SUGGESTION_CATEGORIES] || s.category}
                      </span>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border font-body', sc.bg, sc.color)}>
                        {sc.label}
                      </span>
                      <span className="text-xs text-slate-600 font-body ml-auto">
                        {new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 font-body mb-0.5">{s.subject}</p>
                    <p className="text-xs text-slate-500 font-body truncate">{s.message}</p>
                    {s.user && (
                      <p className="text-xs text-slate-600 font-body mt-1">
                        De : <span className="text-slate-400">{s.user.full_name}</span>
                        {s.user.email && <span> · {s.user.email}</span>}
                      </p>
                    )}
                    {!s.user && (
                      <p className="text-xs text-slate-700 font-body mt-1">Utilisateur inconnu</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg animate-fade-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <p className="font-semibold text-slate-200 font-body">{selected.subject}</p>
                <p className="text-xs text-slate-500 font-body mt-0.5">
                  {selected.user?.full_name || 'Utilisateur'} ·{' '}
                  {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Message original */}
              <div>
                <p className="text-xs text-slate-500 font-body mb-2 font-medium uppercase tracking-wide">Message</p>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-300 font-body leading-relaxed">{selected.message}</p>
                </div>
              </div>

              {/* Statut */}
              <div>
                <p className="text-xs text-slate-500 font-body mb-2 font-medium uppercase tracking-wide">Statut</p>
                <div className="grid grid-cols-4 gap-2">
                  {(['nouveau', 'en_cours', 'résolu', 'fermé'] as SuggestionStatus[]).map(k => {
                    const sc = STATUS_CONFIG[k]
                    return (
                      <button key={k} onClick={() => setNewStatus(k)}
                        className={cn('py-2 px-2 rounded-lg text-xs font-medium transition-all font-body border',
                          newStatus === k
                            ? `${sc.bg} ${sc.color}`
                            : 'border-slate-800 text-slate-600 hover:border-slate-700'
                        )}>
                        {sc.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Réponse admin */}
              <div>
                <p className="text-xs text-slate-500 font-body mb-2 font-medium uppercase tracking-wide">Réponse admin</p>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                  placeholder="Répondez à cet utilisateur... (optionnel)"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm font-body resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-sm font-medium font-body transition-all">
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
