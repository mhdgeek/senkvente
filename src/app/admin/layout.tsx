import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

function isAdmin(session: any): boolean {
  if (!session?.user) return false
  return (
    session.user.app_metadata?.role === 'admin' ||
    session.user.user_metadata?.role === 'admin'
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !isAdmin(session)) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, business_name')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <AdminSidebar profile={profile} adminEmail={session.user.email || ''} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin topbar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 lg:px-8 py-3.5 flex items-center justify-between shrink-0">
          <div className="pl-10 lg:pl-0">
            <p className="text-sm font-medium text-slate-200 font-body">
              Espace Administration
            </p>
            <p className="text-xs text-slate-500 font-body">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-body">Système opérationnel</span>
            </div>
            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold font-display">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 lg:p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
