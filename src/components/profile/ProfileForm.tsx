'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { Loader2, Check } from 'lucide-react'

export default function ProfileForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    business_name: profile?.business_name || '',
    phone: profile?.phone || '',
    city: profile?.city || 'Dakar',
    description: profile?.description || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').upsert({ id: userId, ...form })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  const cities = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Mbour', 'Rufisque', 'Diourbel', 'Tambacounda', 'Autre']

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nom complet *</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} required className="input" />
        </div>
        <div>
          <label className="label">Téléphone</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+221 77 000 0000" className="input" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nom du business *</label>
          <input name="business_name" value={form.business_name} onChange={handleChange} required className="input" />
        </div>
        <div>
          <label className="label">Ville</label>
          <select name="city" value={form.city} onChange={handleChange} className="input">
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description de votre activité</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Décrivez votre activité principale, vos services..."
          className="input resize-none"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-36 justify-center">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
            : saved
              ? <><Check className="w-4 h-4" /> Enregistré !</>
              : 'Sauvegarder'
          }
        </button>
      </div>
    </form>
  )
}
