import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SenkVente – Gestion de ventes pour petits business',
  description: 'Application de gestion de ventes, clients et interventions pour les entrepreneurs au Sénégal.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  )
}
