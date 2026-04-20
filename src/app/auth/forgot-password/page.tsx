'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      setError("Erreur lors de l'envoi. Vérifiez l'adresse email.")
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition-all text-sm font-body"

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Email envoyé !</h1>
        <p className="text-dark-400 font-body text-sm leading-relaxed mb-6">
          Un lien de réinitialisation a été envoyé à <span className="text-white font-medium">{email}</span>. 
          Vérifiez votre boîte de réception (et vos spams).
        </p>
        <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors font-body">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-dark-500 hover:text-dark-300 text-sm mb-6 transition-colors font-body">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </Link>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
        <p className="text-dark-400 font-body text-sm">
          Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-body">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Adresse email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-600" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
              className={`${inputCls} pl-11`}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm font-body"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</> : 'Envoyer le lien de réinitialisation'}
        </button>
      </form>
    </div>
  )
}
