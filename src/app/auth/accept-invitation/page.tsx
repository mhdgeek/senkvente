'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, Users, LogIn, UserPlus } from 'lucide-react'

type Status = 'loading' | 'needs_login' | 'accepting' | 'done' | 'error'

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Aucun token dans le lien.')
      return
    }
    run()
  }, [token])

  const run = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setStatus('needs_login'); return }
    await accept(supabase, session.user.id)
  }

  const accept = async (supabase: any, userId: string) => {
    setStatus('accepting')

    // Query 1 — fetch invitation only (no JOIN, avoids foreign key issue)
    const { data: inv, error: invErr } = await supabase
      .from('team_invitations')
      .select('id, owner_id, email, status, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (invErr) {
      setStatus('error')
      setError('Erreur lecture invitation : ' + invErr.message)
      return
    }

    if (!inv) {
      setStatus('error')
      setError('Invitation introuvable. Utilisez le lien complet de votre email.')
      return
    }

    // Query 2 — fetch owner profile separately
    const { data: owner } = await supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', inv.owner_id)
      .single()

    const resolvedOwnerName = owner?.full_name || 'votre collaborateur'
    const resolvedBusinessName = owner?.business_name || 'le business'

    console.log('Invitation:', { status: inv.status, owner: resolvedOwnerName })

    // Already accepted — redirect directly
    if (inv.status === 'accepted') {
      setOwnerName(resolvedOwnerName)
      setBusinessName(resolvedBusinessName)
      setStatus('done')
      setTimeout(() => router.push('/dashboard'), 2000)
      return
    }

    if (inv.status !== 'pending') {
      setStatus('error')
      setError('Cette invitation a le statut "' + inv.status + '" et ne peut plus etre utilisee.')
      return
    }

    if (new Date(inv.expires_at) < new Date()) {
      setStatus('error')
      setError('Cette invitation a expire. Demandez-en une nouvelle.')
      return
    }

    if (inv.owner_id === userId) {
      setStatus('error')
      setError('Vous ne pouvez pas rejoindre votre propre equipe.')
      return
    }

    setOwnerName(resolvedOwnerName)
    setBusinessName(resolvedBusinessName)

    // Add to team
    const { error: teamErr } = await supabase
      .from('business_teams')
      .upsert(
        { owner_id: inv.owner_id, member_id: userId, role: 'member' },
        { onConflict: 'owner_id,member_id' }
      )

    if (teamErr) {
      setStatus('error')
      setError("Erreur ajout equipe : " + teamErr.message)
      return
    }

    // Mark as accepted
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
          {status === 'accepting' ? 'Acceptation en cours...' : 'Verification du lien...'}
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
          Invitation acceptee !
        </h1>
        <p className="text-dark-400 text-sm font-body mb-2">
          Vous avez rejoint l&apos;equipe de{' '}
          <strong className="text-white">{ownerName}</strong>.
        </p>
        <p className="text-dark-400 text-sm font-body mb-6">
          Acces au dashboard de{' '}
          <strong className="text-white">{businessName}</strong> active.
        </p>
        <p className="text-dark-500 text-xs font-body">Redirection automatique...</p>
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
        <h1 className="font-display text-2xl font-bold text-white mb-3">
          Probleme avec l&apos;invitation
        </h1>
        <p className="text-dark-400 text-sm font-body mb-6">{error}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all text-sm font-body"
        >
          Retour au dashboard
        </Link>
      </div>
    )
  }

  // ── Needs login ──
  const currentUrl = '/auth/accept-invitation?token=' + token

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Users className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">
          Vous avez ete invite !
        </h1>
        <p className="text-dark-400 text-sm font-body leading-relaxed">
          Connectez-vous ou creez un compte pour rejoindre l&apos;equipe.
        </p>
      </div>
      <div className="space-y-3">
        <Link
          href={'/auth/login?redirect=' + encodeURIComponent(currentUrl)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all text-sm font-body"
        >
          <LogIn className="w-4 h-4" />
          J&apos;ai deja un compte &mdash; Se connecter
        </Link>
        <Link
          href={'/auth/signup?redirect=' + encodeURIComponent(currentUrl)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all text-sm font-body"
        >
          <UserPlus className="w-4 h-4" />
          Je n&apos;ai pas de compte &mdash; Creer un compte
        </Link>
      </div>
      <p className="mt-5 text-center text-dark-600 text-xs font-body">
        Apres connexion, vous serez redirige pour accepter l&apos;invitation.
      </p>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-10">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm font-body">Chargement...</p>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}
