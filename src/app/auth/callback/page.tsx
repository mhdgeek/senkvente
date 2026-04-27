'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// This page receives the redirect from Supabase after email link verification
// Supabase redirects here with #access_token=xxx&type=recovery in the hash
// We extract it, create the session, then redirect to the right page

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Parse hash fragment
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken  = params.get('access_token')
    const refreshToken = params.get('refresh_token') || ''
    const type         = params.get('type')
    const errorCode    = params.get('error_code')
    const errorDesc    = params.get('error_description')

    console.log('Callback params:', { type, accessToken: !!accessToken, errorCode, errorDesc })

    // Handle errors from Supabase
    if (errorCode || errorDesc) {
      console.error('Supabase error:', errorCode, errorDesc)
      router.push('/auth/reset-password?error=' + encodeURIComponent(errorDesc || errorCode || 'unknown'))
      return
    }

    if (!accessToken) {
      // No hash — check query params (some Supabase versions use query params)
      const searchParams = new URLSearchParams(window.location.search)
      const tokenHash = searchParams.get('token_hash')
      const qType     = searchParams.get('type')

      if (tokenHash) {
        supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
          .then(({ error }) => {
            if (error) {
              router.push('/auth/reset-password?error=expired')
            } else {
              router.push('/auth/reset-password?verified=1')
            }
          })
        return
      }

      // Nothing found
      router.push('/auth/reset-password?error=no_token')
      return
    }

    // Set session from access_token in hash
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          console.error('setSession error:', error)
          router.push('/auth/reset-password?error=expired')
          return
        }

        // Route based on type
        if (type === 'recovery') {
          router.push('/auth/reset-password?verified=1')
        } else if (type === 'signup' || type === 'email') {
          router.push('/dashboard')
        } else if (type === 'invite') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      })
  }, [])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm font-body">Authentification en cours...</p>
      </div>
    </div>
  )
}
