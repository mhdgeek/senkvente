'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, Users, LogIn, UserPlus } from 'lucide-react'

type Status = 'loading' | 'needs_login' | 'accepting' | 'done' | 'error'

export default function AcceptInvitationPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [status, setStatus]     = useState<Status>('loading')
  const [error, setError]       = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError("Lien d'invitation invalide ou manquant.")
      return
    }
    run()
  }, [token])

  const run = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Not logged in — show login/signup options
      // The token stays in the URL during the whole flow
      setStatus('needs_login')
      return
    }

    await accept(supabase, session.user.id)
  }

  const accept = async (supabase: any, userId: string) => {
    setStatus('accepting')

    // 1. Fetch invitation
    const { data: inv, error: invErr } = await supabase
      .from('team_invitations')
      .select('*, owner:profiles!team_invitations_owner_id_fkey(full_name, business_name)')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (invErr || !inv) {
      setStatus('error')
      setError("Cette invitation est invalide, déjà utilisée ou expirée.")
      return
    }

    if (new Date(inv.expires_at) < new Date()) {
      setStatus('error')
      setError("Cette invitation a expiré. Demandez à votre collaborateur d'en envoyer une nouvelle.")
      return
    }

    if (inv.owner_id === userId) {
      setStatus('error')
      setError("Vous ne pouvez pas rejoindre votre propre équipe.")
      return
    }

    setOwnerName(inv.owner?.full_name || 'votre collaborateur')
    setBusinessName(inv.owner?.business_name || 'le business')

    // 2. Add to team
    const { error: teamErr } = await supabase
      .from('business_teams')
      .upsert(
        { owner_id: inv.owner_id, member_id: userId, role: 'member' },
        { onConflict: 'owner_id,member_id' }
      )

    if (teamErr) {
      setStatus('error')
      setError("Erreur lors de l'acceptation. Réessayez.")
      return
    }

    // 3. Mark as accepted
    await supabase
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('token', token)

    setStatus('done')
    setTimeout(() => router.push('/dashboard'), 3000)
  }

  // ── Loading ──
  if (status === 'loading' || status === 'accepting') {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm font-body">
          {status === 'accepting' ? "Acceptation de l'invitation en cours..." : "Vérification du lien..."}
        </p>
      </div>
    )
  }

  // ── Success ──
  if (status === 'done') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">
          Invitation acceptée ! 🎉
        </h1>
        <p className="text-dark-400 text-sm font-body leading-relaxed mb-2">
          Vous avez rejoint l&apos;équipe de <strong className="text-white">{ownerName}</strong>.
        </p>
        <p className="text-dark-400 text-sm font-body mb-6">
          Vous pouvez maintenant accéder aux clients et transactions de <strong className="text-white">{businessName}</strong>.
        </p>
        <p className="text-dark-500 text-xs font-body">Redirection vers votre dashboard...</p>
      </div>
    )
  }

  // ── Error ──
  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Invitation invalide</h1>
        <p className="text-dark-400 text-sm font-body mb-6">{error}</p>
        <Link href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all text-sm font-body">
          Retour au dashboard
        </Link>
      </div>
    )
  }

  // ── Needs login ── (user not connected)
  // Keep token in redirect URL so it's available after login/signup
  const currentUrl = `/auth/accept-invitation?token=${token}`

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Users className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">
          Vous avez été invité !
        </h1>
        <p className="text-dark-400 text-sm font-body leading-relaxed">
          Connectez-vous ou créez un compte pour rejoindre l&apos;équipe et accéder au dashboard partagé.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(currentUrl)}`}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all text-sm font-body"
        >
          <LogIn className="w-4 h-4" />
          J&apos;ai déjà un compte — Se connecter
        </Link>

        <Link
          href={`/auth/signup?redirect=${encodeURIComponent(currentUrl)}`}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all text-sm font-body"
        >
          <UserPlus className="w-4 h-4" />
          Je n&apos;ai pas de compte — Créer un compte
        </Link>
      </div>

      <p className="mt-5 text-center text-dark-600 text-xs font-body">
        Après connexion, vous serez automatiquement redirigé pour accepter l&apos;invitation.
      </p>
    </div>
  )
}
