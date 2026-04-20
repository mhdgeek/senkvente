import Link from 'next/link'
import type { Profile } from '@/types'
import { PlusCircle, Bell } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export default function TopBar({ profile }: { profile: Profile | null }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <header className="bg-white border-b border-dark-100 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between shrink-0 gap-3">
      {/* Left — greeting */}
      <div className="pl-10 lg:pl-0 min-w-0">
        <p className="text-sm font-body text-dark-500 truncate">
          {greeting},{' '}
          <span className="font-semibold text-dark-900">
            {profile?.full_name?.split(' ')[0] || 'là'}
          </span>
        </p>
        <p className="text-xs text-dark-300 font-body hidden sm:block capitalize">{date}</p>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Business badge — hidden on small screens */}
        {profile?.business_name && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-50 rounded-xl border border-dark-100">
            <div className="w-5 h-5 bg-gradient-to-br from-brand-400 to-brand-600 rounded-md flex items-center justify-center text-white text-xs font-bold font-display">
              {getInitials(profile.business_name)}
            </div>
            <span className="text-xs font-medium text-dark-700 font-body max-w-[120px] truncate">
              {profile.business_name}
            </span>
          </div>
        )}

        {/* New sale CTA */}
        <Link href="/sales/new" className="btn-primary text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5">
          <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline sm:inline">Nouvelle vente</span>
          <span className="xs:hidden sm:hidden">+</span>
        </Link>
      </div>
    </header>
  )
}
