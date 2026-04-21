import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeamManager from '@/components/team/TeamManager'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  // Load team members + pending invitations
  const [{ data: members }, { data: invitations }, { data: profile }] = await Promise.all([
    supabase
      .from('business_teams')
      .select('*, member_profile:profiles!business_teams_member_id_fkey(full_name, email, business_name)')
      .eq('owner_id', session.user.id),
    supabase
      .from('team_invitations')
      .select('*')
      .eq('owner_id', session.user.id)
      .eq('status', 'pending'),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single(),
  ])

  return (
    <TeamManager
      members={members || []}
      invitations={invitations || []}
      profile={profile}
      ownerId={session.user.id}
      ownerEmail={session.user.email || ''}
    />
  )
}
