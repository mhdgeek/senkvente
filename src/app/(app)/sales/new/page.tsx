'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Client, TransactionType, PaymentMethod, TransactionStatus } from '@/types'
import { PAYMENT_METHODS, INTERVENTION_TYPES, SUBSCRIPTION_SERVICES, SUBSCRIPTION_PERIODS } from '@/types'
import { ArrowLeft, Loader2, ShoppingBag, Wrench, RefreshCw, CheckCircle2, UserPlus, X, TrendingUp, TrendingDown, Truck, CreditCard, Calendar } from 'lucide-react'
import { cn, formatCFA } from '@/lib/utils'

const TYPE_CONFIG = [
  {
    value: 'vente' as TransactionType,
    label: 'Vente',
    desc: "Produit ou service",
    icon: ShoppingBag,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50',
  },
  {
    value: 'intervention' as TransactionType,
    label: 'Intervention',
    desc: 'Caméra, câblage, réseau...',
    icon: Wrench,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    activeBorder: 'border-purple-500',
    activeBg: 'bg-purple-50',
  },
  {
    value: 'abonnement' as TransactionType,
    label: 'Abonnement',
    desc: 'IPTV, logiciel, hébergement...',
    icon: RefreshCw,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-50',
  },
]

const CITIES = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Mbour', 'Rufisque', 'Diourbel', 'Tambacounda', 'Autre']

function NewSaleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams.get('client_id')

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewClient, setShowNewClient] = useState(false)
  const [clientLoading, setClientLoading] = useState(false)
  const [newClient, setNewClient] = useState({ full_name: '', phone: '', city: '' })

  const [form, setForm] = useState({
    client_id: preselectedClientId || '',
    type: 'vente' as TransactionType,
    description: '',
    payment_method: 'cash' as PaymentMethod,
    status: 'payé' as TransactionStatus,
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
    // Vente fields
    amount: '',
    purchase_price: '',
    delivery_cost: '',
    // Intervention fields
    intervention_type: '',
    intervention_setup_cost: '',
    // Abonnement fields
    subscription_service: '',
    subscription_period: 'Mensuel',
    subscription_setup_cost: '',
    subscription_monthly_cost: '',
  })

  const fetchClients = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('clients').select('*').order('full_name')
    setClients(data || [])
  }

  useEffect(() => { fetchClients() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleTypeSelect = (type: TransactionType) => {
    setForm(prev => ({ ...prev, type, intervention_type: '', subscription_service: '' }))
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.full_name.trim()) return
    setClientLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setClientLoading(false); return }
    // Use effectiveOwnerId so client is created under the owner's account
    const { data: teamData } = await supabase
      .from('business_teams')
      .select('owner_id')
      .eq('member_id', user.id)
      .maybeSingle()
    const effectiveUserId = teamData?.owner_id || user.id
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...newClient, user_id: effectiveUserId })
      .select('*')
      .single()
    if (!error && data) {
      await fetchClients()
      setForm(prev => ({ ...prev, client_id: data.id }))
      setShowNewClient(false)
      setNewClient({ full_name: '', phone: '', city: '' })
    }
    setClientLoading(false)
  }

  // Computed values for vente
  const salePrice    = Number(form.amount) || 0
  const costPrice    = Number(form.purchase_price) || 0
  const deliveryCost = Number(form.delivery_cost) || 0
  const margin       = salePrice - costPrice - deliveryCost
  const marginPct    = salePrice > 0 ? Math.round((margin / salePrice) * 100) : 0
  const showMargin   = form.type === 'vente' && salePrice > 0 && (costPrice > 0 || deliveryCost > 0)

  // Amount to save depends on type
  const getAmount = () => {
    if (form.type === 'vente') return salePrice
    if (form.type === 'intervention') return Number(form.intervention_setup_cost) || 0
    if (form.type === 'abonnement') {
      const setup = Number(form.subscription_setup_cost) || 0
      const monthly = Number(form.subscription_monthly_cost) || 0
      return setup + monthly
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id) { setError("Veuillez sélectionner un client."); return }
    const amount = getAmount()
    if (amount <= 0) { setError("Veuillez renseigner au moins un montant."); return }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Resolve effective owner for team members
    const { data: teamData } = await supabase
      .from('business_teams')
      .select('owner_id')
      .eq('member_id', user.id)
      .maybeSingle()
    const effectiveUserId = teamData?.owner_id || user.id

    const payload: Record<string, any> = {
      user_id: effectiveUserId,
      client_id: form.client_id,
      type: form.type,
      amount,
      description: form.description,
      payment_method: form.payment_method,
      status: form.status,
      transaction_date: form.transaction_date,
      notes: form.notes,
    }

    if (form.type === 'vente') {
      payload.purchase_price  = costPrice || null
      payload.delivery_cost   = deliveryCost || null
    }

    if (form.type === 'intervention') {
      payload.intervention_type        = form.intervention_type
      payload.subscription_setup_cost  = Number(form.intervention_setup_cost) || null
    }

    if (form.type === 'abonnement') {
      payload.subscription_service      = form.subscription_service
      payload.subscription_period       = form.subscription_period
      payload.subscription_setup_cost   = Number(form.subscription_setup_cost) || null
      payload.subscription_monthly_cost = Number(form.subscription_monthly_cost) || null
    }

    const { error: insertError } = await supabase.from('transactions').insert(payload)

    if (insertError) {
      setError("Erreur lors de l'enregistrement.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => { router.push('/sales'); router.refresh() }, 1500)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-up">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-dark-900 mb-2">Transaction enregistrée !</h2>
        <p className="text-dark-400 font-body">Redirection en cours...</p>
      </div>
    )
  }

  const selectedType = TYPE_CONFIG.find(t => t.value === form.type)!
  const selectedClientName = clients.find(c => c.id === form.client_id)?.full_name

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="mb-6">
        <Link href="/sales" className="btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <h1 className="page-title">Nouvelle transaction</h1>
        <p className="text-dark-400 text-sm mt-1 font-body">Vente · Intervention · Abonnement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-body">{error}</div>
        )}

        {/* Type */}
        <div className="card p-4 sm:p-5">
          <label className="label mb-3">Type de transaction *</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {TYPE_CONFIG.map(tc => (
              <button key={tc.value} type="button" onClick={() => handleTypeSelect(tc.value)}
                className={cn('p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all duration-150',
                  form.type === tc.value ? `${tc.activeBorder} ${tc.activeBg}` : 'border-dark-200 hover:border-dark-300 bg-white'
                )}>
                <div className={cn('w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mb-1.5 sm:mb-2', tc.bg)}>
                  <tc.icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', tc.color)} />
                </div>
                <p className={cn('text-xs font-semibold font-body', form.type === tc.value ? tc.color : 'text-dark-700')}>{tc.label}</p>
                <p className="text-xs text-dark-400 mt-0.5 font-body leading-tight hidden sm:block">{tc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Client + Date */}
        <div className="card p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Client *</label>
              <select name="client_id" value={form.client_id}
                onChange={e => {
                  if (e.target.value === '__new__') { setShowNewClient(true); setForm(p => ({ ...p, client_id: '' })) }
                  else handleChange(e)
                }} required className="input">
                <option value="">— Sélectionner un client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
                <option disabled>──────────────</option>
                <option value="__new__">＋ Créer un nouveau client</option>
              </select>
              {selectedClientName && (
                <p className="text-xs text-emerald-600 mt-1 font-body flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {selectedClientName}
                </p>
              )}
            </div>
            <div>
              <label className="label">Date *</label>
              <input name="transaction_date" type="date" value={form.transaction_date} onChange={handleChange} required className="input" />
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={2}
              placeholder={
                form.type === 'intervention' ? "Ex: Installation 4 caméras IP extérieures, configuration NVR..." :
                form.type === 'abonnement' ? "Ex: Abonnement IPTV 200 chaînes HD, accès immédiat..." :
                "Ex: Vente ordinateur portable HP Core i5 8Go RAM..."
              } className="input resize-none" />
          </div>

          {/* Intervention sub-type */}
          {form.type === 'intervention' && (
            <div>
              <label className="label">Type d&apos;intervention</label>
              <select name="intervention_type" value={form.intervention_type} onChange={handleChange} className="input">
                <option value="">Choisir le type</option>
                {INTERVENTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {/* Abonnement sub-fields */}
          {form.type === 'abonnement' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Service</label>
                <select name="subscription_service" value={form.subscription_service} onChange={handleChange} className="input">
                  <option value="">Choisir</option>
                  {SUBSCRIPTION_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Période</label>
                <select name="subscription_period" value={form.subscription_period} onChange={handleChange} className="input">
                  {SUBSCRIPTION_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── VENTE : Prix d'achat + vente + livraison ── */}
        {form.type === 'vente' && (
          <div className="card p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="section-title text-base mb-0.5">Prix &amp; Coûts</h3>
              <p className="text-xs text-dark-400 font-body">Renseignez les coûts pour calculer votre marge nette</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Prix de vente *
                </label>
                <div className="relative">
                  <input name="amount" type="number" value={form.amount} onChange={handleChange} required min="1" placeholder="50 000" className="input pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs">FCFA</span>
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Prix d&apos;achat
                </label>
                <div className="relative">
                  <input name="purchase_price" type="number" value={form.purchase_price} onChange={handleChange} min="0" placeholder="35 000" className="input pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs">FCFA</span>
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" /> Livraison
                </label>
                <div className="relative">
                  <input name="delivery_cost" type="number" value={form.delivery_cost} onChange={handleChange} min="0" placeholder="0" className="input pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs">FCFA</span>
                </div>
              </div>
            </div>
            {showMargin && (
              <div className={cn('flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border',
                margin >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100')}>
                <div>
                  <p className="text-xs text-dark-500 font-body mb-0.5">Marge nette</p>
                  <p className={cn('text-xl font-bold font-display', margin >= 0 ? 'text-emerald-700' : 'text-red-700')}>{formatCFA(margin)}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 font-body mb-0.5">Taux</p>
                  <p className={cn('text-xl font-bold font-display', marginPct >= 0 ? 'text-emerald-700' : 'text-red-700')}>{marginPct}%</p>
                </div>
                <div className="text-xs text-dark-400 font-body space-y-0.5">
                  <p>Vente : {formatCFA(salePrice)}</p>
                  {costPrice > 0 && <p>Achat : − {formatCFA(costPrice)}</p>}
                  {deliveryCost > 0 && <p>Livraison : − {formatCFA(deliveryCost)}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── INTERVENTION : Coût d'inscription seulement ── */}
        {form.type === 'intervention' && (
          <div className="card p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="section-title text-base mb-0.5">Coût de l&apos;intervention</h3>
              <p className="text-xs text-dark-400 font-body">Montant facturé au client pour cette intervention</p>
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Coût de l&apos;intervention *
              </label>
              <div className="relative max-w-xs">
                <input name="intervention_setup_cost" type="number" value={form.intervention_setup_cost}
                  onChange={handleChange} required min="1" placeholder="75 000" className="input pr-16" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs">FCFA</span>
              </div>
              <p className="text-xs text-dark-400 mt-1.5 font-body">
                Inclut main d&apos;œuvre, matériel et déplacement
              </p>
            </div>
          </div>
        )}

        {/* ── ABONNEMENT : Coût inscription + coût récurrent ── */}
        {form.type === 'abonnement' && (
          <div className="card p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="section-title text-base mb-0.5">Coûts de l&apos;abonnement</h3>
              <p className="text-xs text-dark-400 font-body">Renseignez les frais d&apos;inscription et le tarif récurrent</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Coût d&apos;inscription
                </label>
                <div className="relative">
                  <input name="subscription_setup_cost" type="number" value={form.subscription_setup_cost}
                    onChange={handleChange} min="0" placeholder="5 000" className="input pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs">FCFA</span>
                </div>
                <p className="text-xs text-dark-400 mt-1 font-body">Frais d&apos;activation unique</p>
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> Coût {form.subscription_period?.toLowerCase() || 'récurrent'} *
                </label>
                <div className="relative">
                  <input name="subscription_monthly_cost" type="number" value={form.subscription_monthly_cost}
                    onChange={handleChange} required min="1" placeholder="12 000" className="input pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs">FCFA</span>
                </div>
                <p className="text-xs text-dark-400 mt-1 font-body">Montant par période</p>
              </div>
            </div>

            {/* Total abonnement preview */}
            {(Number(form.subscription_setup_cost) > 0 || Number(form.subscription_monthly_cost) > 0) && (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-sm font-body text-emerald-700">Total encaissé aujourd&apos;hui</p>
                <p className="text-lg font-bold font-display text-emerald-700">
                  {formatCFA((Number(form.subscription_setup_cost) || 0) + (Number(form.subscription_monthly_cost) || 0))}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Paiement */}
        <div className="card p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mode de paiement *</label>
              <select name="payment_method" value={form.payment_method} onChange={handleChange} className="input">
                {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Statut *</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'payé',       label: 'Payé',       cls: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
                  { value: 'en_attente', label: 'En attente', cls: 'border-amber-300 bg-amber-50 text-amber-700' },
                  { value: 'partiel',    label: 'Partiel',    cls: 'border-orange-300 bg-orange-50 text-orange-700' },
                  { value: 'annulé',     label: 'Annulé',     cls: 'border-red-300 bg-red-50 text-red-700' },
                ].map(s => (
                  <button key={s.value} type="button"
                    onClick={() => setForm(p => ({ ...p, status: s.value as TransactionStatus }))}
                    className={cn('py-2 px-3 text-xs font-medium rounded-lg border-2 transition-all font-body',
                      form.status === s.value ? s.cls : 'border-dark-200 text-dark-500 hover:border-dark-300 bg-white'
                    )}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              placeholder="Informations complémentaires..." className="input resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/sales" className="btn-secondary flex-1 justify-center">Annuler</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
              : <><selectedType.icon className="w-4 h-4" /> Enregistrer</>
            }
          </button>
        </div>
      </form>

      {/* New client modal */}
      {showNewClient && (
        <div className="fixed inset-0 z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNewClient(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between p-5 border-b border-dark-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" />
                <h2 className="font-display font-bold text-dark-900 text-base">Nouveau client</h2>
              </div>
              <button type="button" onClick={() => setShowNewClient(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-100 text-dark-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="p-5 space-y-4">
              <p className="text-xs text-dark-400 font-body">Créé et sélectionné automatiquement pour cette transaction.</p>
              <div>
                <label className="label">Nom complet *</label>
                <input type="text" value={newClient.full_name}
                  onChange={e => setNewClient(p => ({ ...p, full_name: e.target.value }))}
                  required placeholder="Moussa Diallo" className="input" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Téléphone</label>
                  <input type="tel" value={newClient.phone}
                    onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+221 77 000 0000" className="input" />
                </div>
                <div>
                  <label className="label">Ville</label>
                  <select value={newClient.city} onChange={e => setNewClient(p => ({ ...p, city: e.target.value }))} className="input">
                    <option value="">Choisir</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowNewClient(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
                <button type="submit" disabled={clientLoading} className="btn-primary flex-1 justify-center">
                  {clientLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Créer &amp; sélectionner</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewSalePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    }>
      <NewSaleContent />
    </Suspense>
  )
}
