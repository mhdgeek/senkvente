'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { getInitials, formatDate } from '@/lib/utils'
import { Users, UserPlus, Mail, Trash2, Loader2, CheckCircle2, Clock, Crown, X, AlertCircle } from 'lucide-react'

interface Member {
  id: string
  owner_id: string
  member_id: string
  role: string
  created_at: string
  member_profile?: { full_name: string; email?: string; business_name?: string } | null
}

interface Invitation {
  id: string
  email: string
  status: string
  created_at: string
  expires_at: string
}

interface Props {
  members: Member[]
  invitations: Invitation[]
  profile: Profile | null
  ownerId: string
  ownerEmail: string
}

export default function TeamManager({ members, invitations, profile, ownerId, ownerEmail }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    if (email.toLowerCase() === ownerEmail.toLowerCase()) {
      setError("Vous ne pouvez pas vous inviter vous-même.")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Check if already a member
    const existing = members.find(m => m.member_profile?.email?.toLowerCase() === email.toLowerCase())
    if (existing) { setError("Cette personne fait déjà partie de votre équipe."); setLoading(false); return }

    // Create invitation
    const { error: invError } = await supabase
      .from('team_invitations')
      .insert({ owner_id: ownerId, email: email.trim().toLowerCase() })

    if (invError) {
      setError("Erreur lors de l'invitation. Réessayez.")
      setLoading(false)
      return
    }

    setSent(true)
    setEmail('')
    setLoading(false)
    setTimeout(() => { setSent(false); router.refresh() }, 3000)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Retirer ce membre de votre équipe ?")) return
    setRemovingId(memberId)
    const supabase = createClient()
    await supabase.from('business_teams').delete().eq('id', memberId)
    setRemovingId(null)
    router.refresh()
  }

  const handleCancelInvitation = async (invId: string) => {
    setCancellingId(invId)
    const supabase = createClient()
    await supabase.from('team_invitations').delete().eq('id', invId)
    setCancellingId(null)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="page-title">Mon équipe</h1>
        <p className="text-dark-400 text-sm mt-1 font-body">
          Invitez des collaborateurs à accéder à votre dashboard
        </p>
      </div>

      {/* How it works */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 sm:p-5">
        <h3 className="font-semibold text-brand-900 text-sm font-body mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-600" />
          Comment fonctionne le partage ?
        </h3>
        <ul className="space-y-1.5 text-xs text-brand-800 font-body">
          <li className="flex items-start gap-2"><span className="text-brand-500 mt-0.5">✓</span> Les membres voient les mêmes clients et transactions que vous</li>
          <li className="flex items-start gap-2"><span className="text-brand-500 mt-0.5">✓</span> Chaque ajout de client envoie une notification email à toute l&apos;équipe</li>
          <li className="flex items-start gap-2"><span className="text-brand-500 mt-0.5">✓</span> Seul le propriétaire peut inviter ou retirer des membres</li>
        </ul>
      </div>

      {/* Invite form */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Inviter un collaborateur</h2>
        <form onSubmit={handleInvite} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-body">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {sent && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-body">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Invitation envoyée ! Votre collaborateur recevra un email sous peu.
            </div>
          )}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="email@collaborateur.com"
                className="input pl-10"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary shrink-0">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><UserPlus className="w-4 h-4" /> Inviter</>
              }
            </button>
          </div>
          <p className="text-xs text-dark-400 font-body">
            L&apos;invitation est valable 7 jours. Si votre collaborateur n&apos;a pas de compte, il devra d&apos;abord s&apos;inscrire.
          </p>
        </form>
      </div>

      {/* Current owner */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-100">
          <h2 className="section-title">Membres actuels</h2>
        </div>
        <div className="divide-y divide-dark-50">
          {/* Owner always shown */}
          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-9 h-9 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center font-bold text-xs font-display shrink-0">
              {profile ? getInitials(profile.full_name) : 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-dark-900 text-sm font-body truncate">{profile?.full_name || 'Vous'}</p>
              <p className="text-xs text-dark-400 font-body truncate">{ownerEmail}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
              <Crown className="w-3 h-3" /> Propriétaire
            </span>
          </div>

          {members.length === 0 && invitations.length === 0 ? (
            <div className="px-5 py-8 text-center text-dark-400 text-sm font-body">
              Aucun membre pour l&apos;instant. Invitez un collaborateur ci-dessus.
            </div>
          ) : (
            <>
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xs font-display shrink-0">
                    {m.member_profile ? getInitials(m.member_profile.full_name) : 'M'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark-900 text-sm font-body truncate">
                      {m.member_profile?.full_name || 'Membre'}
                    </p>
                    <p className="text-xs text-dark-400 font-body truncate">{m.member_profile?.email || ''}</p>
                  </div>
                  <span className="text-xs text-dark-400 font-body hidden sm:inline shrink-0">
                    Depuis {formatDate(m.created_at)}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    disabled={removingId === m.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  >
                    {removingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-100">
            <h2 className="section-title flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Invitations en attente ({invitations.length})
            </h2>
          </div>
          <div className="divide-y divide-dark-50">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-900 text-sm font-body truncate">{inv.email}</p>
                  <p className="text-xs text-amber-600 font-body">En attente · expire le {formatDate(inv.expires_at)}</p>
                </div>
                <button
                  onClick={() => handleCancelInvitation(inv.id)}
                  disabled={cancellingId === inv.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                >
                  {cancellingId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
