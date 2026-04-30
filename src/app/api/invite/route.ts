import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { email, token, ownerName, businessName } = await req.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email et token requis' }, { status: 400 })
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_PASS

    if (!gmailUser || !gmailPass) {
      return NextResponse.json(
        { error: 'Variables GMAIL_USER et GMAIL_PASS manquantes dans Vercel' },
        { status: 500 }
      )
    }

    const appUrl    = process.env.NEXT_PUBLIC_APP_URL || 'https://senkvente.vercel.app'
    const acceptUrl = `${appUrl}/auth/accept-invitation?token=${token}`

    const transporter = nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    await transporter.sendMail({
      from:    `"SenkVente" <${gmailUser}>`,
      to:      email,
      subject: `Vous êtes invité à rejoindre ${businessName} sur SenkVente`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f5f4f1;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f4f1;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <tr>
          <td align="center" style="padding-bottom:28px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background-color:#ea580c;border-radius:12px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;line-height:40px;">S</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="font-size:22px;font-weight:700;color:#1a1816;">SenkVente</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#ffffff;border-radius:20px;border:1px solid #e2e0dc;padding:40px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <div style="width:56px;height:56px;background-color:#fff7ed;border-radius:16px;display:inline-block;text-align:center;line-height:56px;font-size:28px;">🤝</div>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:12px;">
                  <h1 style="margin:0;font-size:24px;font-weight:700;color:#1a1816;">Vous êtes invité !</h1>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <p style="margin:0;font-size:15px;color:#8a8478;line-height:1.6;">
                    <strong style="color:#1a1816;">${ownerName}</strong> vous invite à rejoindre
                    <strong style="color:#1a1816;">${businessName}</strong> sur SenkVente
                    pour gérer ensemble clients, ventes et interventions.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${acceptUrl}"
                     style="display:inline-block;background-color:#ea580c;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;">
                    Accepter l'invitation
                  </a>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f8f8f7;border-radius:12px;padding:16px 20px;">
                  <p style="margin:0;font-size:13px;color:#8a8478;line-height:1.6;">
                    ✅ Accès au dashboard partagé<br/>
                    ✅ Voir et ajouter des clients<br/>
                    ✅ Enregistrer des ventes et interventions
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:24px;">
                  <p style="margin:0;font-size:12px;color:#aaa59b;text-align:center;">
                    Si le bouton ne fonctionne pas :<br/>
                    <span style="color:#ea580c;word-break:break-all;">${acceptUrl}</span>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding-top:24px;">
            <p style="margin:0;font-size:12px;color:#ccc8c1;line-height:1.8;">
              © 2026 SenkVente · Conçu au Sénégal 🇸🇳<br/>
              Si vous n'attendiez pas cette invitation, ignorez cet email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Invite email error:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}