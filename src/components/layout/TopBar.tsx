import Link from 'next/link'
import type { Profile } from '@/types'
import { PlusCircle } from 'lucide-react'

export default function TopBar({ profile }: { profile: Profile | null }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <header className="bg-white border-b border-dark-100 px-6 lg:px-8 py-4 flex items-center justify-between shrink-0">
      <div className="pl-10 lg:pl-0">
        <p className="text-sm text-dark-400 font-body">
          {greeting},{' '}
          <span className="font-semibold text-dark-800">
            {profile?.full_name?.split(' ')[0] || 'là'}
          </span>
        </p>
        <p className="text-xs text-dark-300 font-body">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      <Link href="/sales/new" className="btn-primary">
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Nouvelle vente</span>
        <span className="sm:hidden">Ajouter</span>
      </Link>
    </header>
  )
}
