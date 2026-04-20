'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('clients').insert({
      ...form,
      user_id: user.id,
    })

    if (error) {
      setError("Erreur lors de la création du client.")
      setLoading(false)
      return
    }

    router.push('/clients')
    router.refresh()
  }

  const cities = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Mbour', 'Rufisque', 'Diourbel', 'Tambacounda', 'Autre']

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="mb-6">
        <Link href="/clients" className="btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux clients
        </Link>
        <h1 className="page-title">Nouveau client</h1>
        <p className="text-dark-400 text-sm mt-1 font-body">Ajoutez un client à votre base</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-body">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nom complet *</label>
            <input name="full_name" type="text" value={form.full_name} onChange={handleChange} required placeholder="Moussa Diallo" className="input" />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+221 77 000 0000" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="client@email.com" className="input" />
          </div>
          <div>
            <label className="label">Ville</label>
            <select name="city" value={form.city} onChange={handleChange} className="input">
              <option value="">Choisir une ville</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Adresse</label>
          <input name="address" type="text" value={form.address} onChange={handleChange} placeholder="Quartier, rue..." className="input" />
        </div>

        <div>
          <label className="label">Notes internes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Informations utiles sur ce client..."
            className="input resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/clients" className="btn-secondary flex-1 justify-center">
            Annuler
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</> : <><UserPlus className="w-4 h-4" /> Créer le client</>}
          </button>
        </div>
      </form>
    </div>
  )
}
