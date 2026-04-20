'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShow]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition-all text-sm font-body"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Bon retour 👋</h1>
        <p className="text-dark-400 font-body">Connectez-vous à votre espace</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Adresse email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.com" className={inputCls} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-dark-300 font-body">Mot de passe</label>
            <Link href="/auth/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-body">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={`${inputCls} pr-12`}
            />
            <button type="button" onClick={() => setShow(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-900/30 text-sm font-body"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</> : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-dark-500 text-sm font-body">
        Pas encore de compte ?{' '}
        <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Créer un compte</Link>
      </p>
    </div>
  )
}
