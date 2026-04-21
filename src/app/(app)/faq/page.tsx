'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FAQ_ITEMS, SUGGESTION_CATEGORIES, type SuggestionCategory } from '@/types'
import { ChevronDown, ChevronUp, Send, CheckCircle2, Loader2, MessageSquare, HelpCircle, Lightbulb, Bug, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<SuggestionCategory, any> = {
  suggestion: Lightbulb,
  bug: Bug,
  question: HelpCircle,
  autre: MessageSquare,
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [form, setForm] = useState({ category: 'suggestion' as SuggestionCategory, subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Vous devez être connecté."); setLoading(false); return }

    const { error: insertError } = await supabase.from('faq_suggestions').insert({
      user_id: user.id,
      category: form.category,
      subject: form.subject,
      message: form.message,
    })

    if (insertError) {
      setError("Erreur lors de l'envoi. Réessayez.")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
    setForm({ category: 'suggestion', subject: '', message: '' })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="page-title">Aide &amp; Suggestions</h1>
        <p className="text-dark-400 text-sm mt-1 font-body">
          Questions fréquentes et formulaire de suggestion
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h2 className="section-title flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-500" />
          Questions fréquentes
        </h2>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white border border-dark-100 rounded-2xl overflow-hidden hover:border-dark-200 transition-colors">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              >
                <span className="font-medium text-dark-900 font-body text-sm sm:text-base">{item.q}</span>
                {openIndex === i
                  ? <ChevronUp className="w-4 h-4 text-brand-500 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-dark-400 shrink-0" />
                }
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 border-t border-dark-50">
                  <p className="text-dark-600 text-sm font-body leading-relaxed pt-3">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suggestion form */}
      <div className="bg-white border border-dark-100 rounded-2xl p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="section-title flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            Envoyer une suggestion
          </h2>
          <p className="text-dark-400 text-sm font-body">
            Un bug, une idée, une question ? Partagez-le avec nous.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-display font-bold text-dark-900 text-lg mb-2">Message envoyé !</h3>
            <p className="text-dark-400 text-sm font-body mb-4">
              Merci pour votre retour. Nous vous répondrons par email.
            </p>
            <button onClick={() => setSent(false)} className="btn-secondary">
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-body">{error}</div>
            )}

            {/* Category selector */}
            <div>
              <label className="label">Type de message *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.entries(SUGGESTION_CATEGORIES) as [SuggestionCategory, string][]).map(([key, label]) => {
                  const Icon = CATEGORY_ICONS[key]
                  return (
                    <button key={key} type="button"
                      onClick={() => setForm(p => ({ ...p, category: key }))}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all font-body',
                        form.category === key
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-dark-200 text-dark-600 hover:border-dark-300 bg-white'
                      )}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate text-xs">{label.split(' ')[0]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="label">Sujet *</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                required
                placeholder="Ex: Ajouter un export PDF des ventes"
                className="input"
              />
            </div>

            <div>
              <label className="label">Message *</label>
              <textarea
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                required
                rows={4}
                placeholder="Décrivez votre suggestion, bug ou question en détail..."
                className="input resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</>
                  : <><Send className="w-4 h-4" /> Envoyer le message</>
                }
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Contact info */}
      <div className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-100 rounded-2xl">
        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-900 font-body">Besoin d&apos;aide urgente ?</p>
          <p className="text-xs text-brand-700 font-body">
            Contactez-nous directement à <span className="font-semibold">terangabizsn@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}
