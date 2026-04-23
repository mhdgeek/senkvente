'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

function SignupContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/dashboard'

  const [formData, setFormData] = useState({ full_name: '', business_name: '', email: '', password: '', phone: '', city: 'Dakar' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.full_name, business_name: formData.business_name } },
    })
    if (signupError) {
      setError(signupError.message === 'User already registered' ? 'Cet email est déjà utilisé.' : signupError.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').update({ phone: formData.phone, city: formData.city }).eq('id', data.user.id)
    }
    router.push(redirectTo)
    router.refresh()
  }

  const cities = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Mbour', 'Rufisque', 'Diourbel', 'Tambacounda', 'Autre']
  const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all text-sm font-body"

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Créer mon compte</h1>
        <p className="text-dark-400 font-body">Gérez vos ventes dès aujourd&apos;hui</p>
      </div>
      <form onSubmit={handleSignup} className="space-y-4">
        {error && <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Nom complet *</label>
            <input name="full_name" type="text" value={formData.full_name} onChange={handleChange} required placeholder="Amadou Diallo" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Téléphone</label>
            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+221 77 000 0000" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Nom de votre business *</label>
          <input name="business_name" type="text" value={formData.business_name} onChange={handleChange} required placeholder="Tech Services Diallo" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Ville</label>
          <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2.5 bg-dark-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all text-sm font-body">
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Email *</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="vous@exemple.com" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5 font-body">Mot de passe *</label>
          <div className="relative">
            <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required minLength={8} placeholder="Minimum 8 caractères" className={`${inputCls} pr-12`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-900/30 text-sm font-body mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création du compte...</> : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-dark-500 text-sm font-body">
        Déjà un compte ?{' '}
        <Link href={`/auth/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center"><Loader2 className="w-6 h-6 text-brand-400 animate-spin mx-auto" /></div>}>
      <SignupContent />
    </Suspense>
  )
}
