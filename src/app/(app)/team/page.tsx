import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeamManager from '@/components/team/TeamManager'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const ownerId = session.user.id

  // Query 1: team members (no JOIN)
  const { data: members } = await supabase
    .from('business_teams')
    .select('id, owner_id, member_id, role, created_at')
    .eq('owner_id', ownerId)

  // Query 2: fetch member profiles separately
  const memberIds = (members || []).map(m => m.member_id)
  let memberProfiles: any[] = []
  if (memberIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, business_name')
      .in('id', memberIds)
    memberProfiles = profiles || []
  }

  // Attach profiles to members
  const membersWithProfiles = (members || []).map(m => ({
    ...m,
    member_profile: memberProfiles.find(p => p.id === m.member_id) || null,
  }))

  // Query 3: pending invitations
  const { data: invitations } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('status', 'pending')

  // Query 4: owner profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', ownerId)
    .single()

  return (
    <TeamManager
      members={membersWithProfiles}
      invitations={invitations || []}
      profile={profile}
      ownerId={ownerId}
      ownerEmail={session.user.email || ''}
    />
  )
}