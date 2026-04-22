'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, MessageSquare, LogOut,
  ShieldCheck, Menu, X, TrendingUp, ArrowUpRight
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Vue d\'ensemble', exact: true },
  { href: '/admin/users',     icon: Users,           label: 'Utilisateurs' },
  { href: '/admin/messages',  icon: MessageSquare,   label: 'Messages & FAQ' },
]

interface Props {
  profile: { full_name?: string; email?: string; business_name?: string } | null
  adminEmail: string
}

export default function AdminSidebar({ profile, adminEmail }: Props) {
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
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white tracking-tight">SenkVente</p>
            <p className="text-xs text-purple-400 font-body">Administration</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all font-body',
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}>
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-purple-400' : 'text-slate-500')} />
              {label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </Link>
          )
        })}

        {/* Back to app — for admin who also has a user account */}
        <div className="mx-3 my-2 border-t border-slate-800" />
        <Link href="/dashboard" onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all font-body">
          <TrendingUp className="w-4 h-4 shrink-0 text-slate-600" />
          Vue utilisateur
          <ArrowUpRight className="w-3 h-3 ml-auto text-slate-600" />
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold font-display shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate font-body">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate font-body">{adminEmail}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all font-body">
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex-col">
        <NavContent />
      </aside>

      <button
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center"
        onClick={() => setOpen(!open)}>
        {open ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
      </button>

      {open && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 shadow-2xl flex flex-col">
            <NavContent />
          </aside>
        </>
      )}
    </>
  )
}
