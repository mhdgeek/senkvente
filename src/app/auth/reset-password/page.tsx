'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, CheckCircle2, Lock, XCircle } from 'lucide-react'

function ResetPasswordContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [ready, setReady]       = useState(false)
  const [invalid, setInvalid]   = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const tokenHash = searchParams.get('token_hash')
    const type      = searchParams.get('type')

    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => { error ? setInvalid(true) : setReady(true) })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setReady(true)
    })

    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setReady(true) })

    const timeout = setTimeout(() => setInvalid(true), 5000)
    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (password.length < 8)  { setError("Minimum 8 caractères requis."); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError("Le lien a expiré. Faites une nouvelle demande."); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition-all text-sm font-body"

  if (done) return (
    <div className="text-center">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Mot de passe mis à jour !</h1>
      <p className="text-dark-400 text-sm font-body">Redirection vers votre espace...</p>
    </div>
  )

  if (invalid) return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5"><XCircle className="w-8 h-8 text-red-400" /></div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Lien invalide ou expiré</h1>
      <p className="text-dark-400 text-sm font-body mb-5">Ce lien a expiré ou a déjà été utilisé.</p>
      <a href="/auth/forgot-password" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all text-sm font-body">
        Faire une nouvelle demande
      </a>
    </div>
  )

  if (!ready) return (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
      <p className="text-dark-400 text-sm font-body">Vérification du lien...</p>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4"><Lock className="w-6 h-6 text-brand-400" /></div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Nouveau mot de passe</h1>
        <p className="text-dark-400 font-body text-sm">Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-body">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Nouveau mot de passe</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Minimum 8 caractères" className={`${inputCls} pr-12`} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Confirmer le mot de passe</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" className={inputCls} />
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm font-body mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mise à jour...</> : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
