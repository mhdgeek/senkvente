import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminMessagesPanel from '@/components/admin/AdminMessagesPanel'

export const dynamic = 'force-dynamic'

function isAdmin(session: any): boolean {
  if (!session?.user) return false
  return session.user.app_metadata?.role === 'admin' || session.user.user_metadata?.role === 'admin'
}

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session || !isAdmin(session)) redirect('/auth/login')

  const { data: suggestions } = await supabase
    .from('faq_suggestions')
    .select('*, user:profiles!faq_suggestions_user_id_fkey(full_name, email, business_name)')
    .order('created_at', { ascending: false })

  return <AdminMessagesPanel suggestions={suggestions || []} />
}
