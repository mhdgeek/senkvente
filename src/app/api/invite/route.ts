import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, token, ownerName, businessName } = await req.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email et token requis' }, { status: 400 })
    }

    // Admin client — utilise la service role key (jamais exposée au client)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const appUrl    = process.env.NEXT_PUBLIC_APP_URL || 'https://senkvente.vercel.app'
    const acceptUrl = `${appUrl}/auth/accept-invitation?token=${token}`

    // inviteUserByEmail utilise le Gmail SMTP configuré dans Supabase
    // et le template "Invite user" de Authentication → Email Templates
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: acceptUrl,
      data: {
        invited_by:    ownerName,
        business_name: businessName,
      },
    })

    if (error) {
      // Si l'utilisateur existe déjà dans Supabase Auth,
      // on retourne success quand même — il recevra le lien via accept-invitation
      if (
        error.message.toLowerCase().includes('already') ||
        error.message.toLowerCase().includes('registered')
      ) {
        return NextResponse.json({ success: true, already_exists: true })
      }
      console.error('inviteUserByEmail error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('API invite error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
