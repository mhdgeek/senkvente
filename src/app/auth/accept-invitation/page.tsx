'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, Users, LogIn, UserPlus } from 'lucide-react'

type Status = 'loading' | 'needs_login' | 'accepting' | 'done' | 'error'

function AcceptInvitationContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [status, setStatus]             = useState<Status>('loading')
  const [error, setError]               = useState('')
  const [ownerName, setOwnerName]       = useState('')
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError("Aucun token d'invitation dans l'URL.")
      return
    }
    run()
  }, [token])

  const run = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setStatus('needs_login')
      return
    }

    await accept(supabase, session.user.id)
  }

  const accept = async (supabase: any, userId: string) => {
    setStatus('accepting')

    // Use service-level read — select without RLS filter on user
    // The token itself is the secret, anyone with it can read
    const { data: inv, error: invErr } = await supabase
      .from('team_invitations')
      .select(`
        id,
        owner_id,
        email,
        status,
        expires_at,
        owner:profiles!team_invitations_owner_id_fkey(full_name, business_name)
      `)
      .eq('token', token)
      .maybeSingle()  // returns null instead of error if not found

    // Debug: log what we got
    console.log('Invitation lookup:', { inv, invErr, token })

    if (invErr) {
      setStatus('error')
      setError(`Erreur de lecture : ${invErr.message}`)
      return
    }

    if (!inv) {
      setStatus('error')
      setError("Invitation introuvable. Vérifiez que le lien est complet et n'a pas été modifié.")
      return
    }

    if (inv.status !== 'pending') {
      if (inv.status === 'accepted') {
        // Already accepted — just go to dashboard
        setOwnerName(inv.owner?.full_name || 'votre collaborateur')
        setBusinessName(inv.owner?.business_name || 'le business')
        setStatus('done')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }
      setStatus('error')
      setError(`Cette invitation est "${inv.status}". Elle ne peut plus être utilisée.`)
      return
    }

    if (new Date(inv.expires_at) < new Date()) {
      setStatus('error')
      setError("Cette invitation a expiré (7 jours). Demandez-en une nouvelle.")
      return
    }

    if (inv.owner_id === userId) {
      setStatus('error')
      setError("Vous ne pouvez pas rejoindre votre propre équipe.")
      return
    }

    setOwnerName(inv.owner?.full_name || 'votre collaborateur')
    setBusinessName(inv.owner?.business_name || 'le business')

    // Add to team
    const { error: teamErr } = await supabase
      .from('business_teams')
      .upsert(
        { owner_id: inv.owner_id, member_id: userId, role: 'member' },
        { onConflict: 'owner_id,member_id' }
      )

    if (teamErr) {
      setStatus('error')
      setError(`Erreur lors de l'ajout à l'équipe : ${teamErr.message}`)
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

  if (status === 'loading' || status === 'accepting') {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm font-body">
          {status === 'accepting' ? "Acceptation en cours..." : "Vérification du lien..."}
        </p>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Invitation acceptée ! 🎉</h1>
        <p className="text-dark-400 text-sm font-body mb-2">
          Vous avez rejoint l&apos;équipe de <strong className="text-white">{ownerName}</strong>.
        </p>
        <p className="text-dark-400 text-sm font-body mb-6">
          Accès au dashboard de <strong className="text-white">{businessName}</strong> activé.
        </p>
        <p className="text-dark-500 text-xs font-body">Redirection automatique...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Problème avec l&apos;invitation</h1>
        <p className="text-dark-400 text-sm font-body mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all text-sm font-body">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  // needs_login
  const currentUrl = `/auth/accept-invitation?token=${token}`
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Users className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Vous avez été invité !</h1>
        <p className="text-dark-400 text-sm font-body leading-relaxed">
          Connectez-vous ou créez un compte pour rejoindre l&apos;équipe.
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

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm font-body">Chargement...</p>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, Users, LogIn, UserPlus } from 'lucide-react'

type Status = 'loading' | 'needs_login' | 'accepting' | 'done' | 'error'

function AcceptInvitationContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [status, setStatus]             = useState<Status>('loading')
  const [error, setError]               = useState('')
  const [ownerName, setOwnerName]       = useState('')
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError("Aucun token d'invitation dans l'URL.")
      return
    }
    run()
  }, [token])

  const run = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setStatus('needs_login')
      return
    }

    await accept(supabase, session.user.id)
  }

  const accept = async (supabase: any, userId: string) => {
    setStatus('accepting')

    // Use service-level read — select without RLS filter on user
    // The token itself is the secret, anyone with it can read
    const { data: inv, error: invErr } = await supabase
      .from('team_invitations')
      .select(`
        id,
        owner_id,
        email,
        status,
        expires_at,
        owner:profiles!team_invitations_owner_id_fkey(full_name, business_name)
      `)
      .eq('token', token)
      .maybeSingle()  // returns null instead of error if not found

    // Debug: log what we got
    console.log('Invitation lookup:', { inv, invErr, token })

    if (invErr) {
      setStatus('error')
      setError(`Erreur de lecture : ${invErr.message}`)
      return
    }

    if (!inv) {
      setStatus('error')
      setError("Invitation introuvable. Vérifiez que le lien est complet et n'a pas été modifié.")
      return
    }

    if (inv.status !== 'pending') {
      if (inv.status === 'accepted') {
        // Already accepted — just go to dashboard
        setOwnerName(inv.owner?.full_name || 'votre collaborateur')
        setBusinessName(inv.owner?.business_name || 'le business')
        setStatus('done')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }
      setStatus('error')
      setError(`Cette invitation est "${inv.status}". Elle ne peut plus être utilisée.`)
      return
    }

    if (new Date(inv.expires_at) < new Date()) {
      setStatus('error')
      setError("Cette invitation a expiré (7 jours). Demandez-en une nouvelle.")
      return
    }

    if (inv.owner_id === userId) {
      setStatus('error')
      setError("Vous ne pouvez pas rejoindre votre propre équipe.")
      return
    }

    setOwnerName(inv.owner?.full_name || 'votre collaborateur')
    setBusinessName(inv.owner?.business_name || 'le business')

    // Add to team
    const { error: teamErr } = await supabase
      .from('business_teams')
      .upsert(
        { owner_id: inv.owner_id, member_id: userId, role: 'member' },
        { onConflict: 'owner_id,member_id' }
      )

    if (teamErr) {
      setStatus('error')
      setError(`Erreur lors de l'ajout à l'équipe : ${teamErr.message}`)
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

  if (status === 'loading' || status === 'accepting') {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm font-body">
          {status === 'accepting' ? "Acceptation en cours..." : "Vérification du lien..."}
        </p>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Invitation acceptée ! 🎉</h1>
        <p className="text-dark-400 text-sm font-body mb-2">
          Vous avez rejoint l&apos;équipe de <strong className="text-white">{ownerName}</strong>.
        </p>
        <p className="text-dark-400 text-sm font-body mb-6">
          Accès au dashboard de <strong className="text-white">{businessName}</strong> activé.
        </p>
        <p className="text-dark-500 text-xs font-body">Redirection automatique...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Problème avec l&apos;invitation</h1>
        <p className="text-dark-400 text-sm font-body mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all text-sm font-body">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  // needs_login
  const currentUrl = `/auth/accept-invitation?token=${token}`
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Users className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Vous avez été invité !</h1>
        <p className="text-dark-400 text-sm font-body leading-relaxed">
          Connectez-vous ou créez un compte pour rejoindre l&apos;équipe.
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

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm font-body">Chargement...</p>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}