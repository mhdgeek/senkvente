'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Users, PlusCircle, History, UserCircle,
  TrendingUp, LogOut, Menu, X, ShieldCheck
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clients',   icon: Users,           label: 'Clients' },
  { href: '/sales/new', icon: PlusCircle,      label: 'Nouvelle vente', highlight: true },
  { href: '/sales',     icon: History,         label: 'Historique' },
  { href: '/profile',   icon: UserCircle,      label: 'Mon profil' },
]

interface Props { profile: Profile | null; userRole?: string }

export default function Sidebar({ profile, userRole }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-dark-100">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm shadow-brand-200">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-dark-950 tracking-tight">SenkVente</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, highlight }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          if (highlight) {
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                prefetch={true}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body my-1 bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm shadow-brand-200 hover:shadow-md hover:from-brand-700 hover:to-brand-600 transition-all duration-150"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
              </Link>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              prefetch={true}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 font-body',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-dark-600 hover:bg-dark-100 hover:text-dark-900'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-600' : 'text-dark-400')} />
              {label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
            </Link>
          )
        })}

        {userRole === 'admin' && (
          <>
            <div className="mx-3 my-2 border-t border-dark-100" />
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              prefetch={true}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 font-body',
                pathname.startsWith('/admin')
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-dark-600 hover:bg-dark-100 hover:text-dark-900'
              )}
            >
              <ShieldCheck className={cn('w-4 h-4 shrink-0', pathname.startsWith('/admin') ? 'text-purple-600' : 'text-dark-400')} />
              Administration
              {pathname.startsWith('/admin') && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />}
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-dark-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 text-white rounded-xl flex items-center justify-center text-xs font-bold font-display shrink-0">
            {profile ? getInitials(profile.full_name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-900 truncate font-body">{profile?.business_name || 'Mon Business'}</p>
            <p className="text-xs text-dark-400 truncate font-body">{profile?.full_name || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-body"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-dark-100 flex-col">
        <NavContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 bg-white border border-dark-200 rounded-xl flex items-center justify-center shadow-sm"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
            <NavContent />
          </aside>
        </>
      )}
    </>
  )
}
