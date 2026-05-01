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

  // Fetch suggestions WITHOUT join (avoids foreign key issues)
  const { data: suggestions, error } = await supabase
    .from('faq_suggestions')
    .select('id, category, subject, message, status, admin_reply, created_at, user_id')
    .order('created_at', { ascending: false })

  console.log('Suggestions fetch:', { count: suggestions?.length, error })

  // Fetch user profiles separately
  const userIds = Array.from(new Set((suggestions || []).map((s: any) => s.user_id).filter(Boolean)))
  let userProfiles: any[] = []
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, business_name')
      .in('id', userIds)
    userProfiles = profiles || []
  }

  // Attach profiles to suggestions
  const suggestionsWithUsers = (suggestions || []).map(s => ({
    ...s,
    user: userProfiles.find(p => p.id === s.user_id) || null,
  }))

  return <AdminMessagesPanel suggestions={suggestionsWithUsers} />
}