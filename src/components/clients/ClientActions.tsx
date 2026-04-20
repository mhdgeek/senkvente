'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'
import { Pencil, Trash2, Loader2, X, Check } from 'lucide-react'

export default function ClientActions({ client }: { client: Client }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: client.full_name,
    phone: client.phone || '',
    email: client.email || '',
    city: client.city || '',
    address: client.address || '',
    notes: client.notes || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('clients').update(form).eq('id', client.id)
    setLoading(false)
    setEditOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('clients').delete().eq('id', client.id)
    router.push('/clients')
  }

  const cities = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Mbour', 'Rufisque', 'Diourbel', 'Tambacounda', 'Autre']

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setEditOpen(true)} className="btn-secondary">
          <Pencil className="w-4 h-4" /> Modifier
        </button>
        <button onClick={() => setDeleteConfirm(true)} className="btn-danger">
          <Trash2 className="w-4 h-4" /> Supprimer
        </button>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-up">
            <div className="flex items-center justify-between p-5 border-b border-dark-100">
              <h2 className="font-display font-bold text-dark-900 text-lg">Modifier le client</h2>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-100 text-dark-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nom complet *</label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} required className="input" />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Ville</label>
                  <select name="city" value={form.city} onChange={handleChange} className="input">
                    <option value="">Choisir</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Adresse</label>
                <input name="address" value={form.address} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-up p-6">
            <h2 className="font-display font-bold text-dark-900 text-lg mb-2">Supprimer ce client ?</h2>
            <p className="text-dark-500 text-sm font-body mb-5">
              Cette action est irréversible. Les transactions liées seront conservées mais sans client associé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 btn-danger justify-center bg-red-600 text-white hover:bg-red-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
