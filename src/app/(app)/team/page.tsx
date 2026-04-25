import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeamManager from '@/components/team/TeamManager'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  const myId = session.user.id

  // Check if I am a team member (not owner)
  const { data: teamMembership } = await supabase
    .from('business_teams')
    .select('owner_id')
    .eq('member_id', myId)
    .maybeSingle()

  // If I'm a member, I see the owner's team page view
  const ownerId = teamMembership?.owner_id || myId
  const isOwner = !teamMembership

  // Fetch members of MY team (as owner)
  const { data: members } = await supabase
    .from('business_teams')
    .select('id, owner_id, member_id, role, created_at')
    .eq('owner_id', ownerId)

  // Fetch member profiles separately
  const memberIds = (members || []).map(m => m.member_id)
  let memberProfiles: any[] = []
  if (memberIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, business_name')
      .in('id', memberIds)
    memberProfiles = profiles || []
  }

  const membersWithProfiles = (members || []).map(m => ({
    ...m,
    member_profile: memberProfiles.find(p => p.id === m.member_id) || null,
  }))

  // Pending invitations (only owner sees these)
  const { data: invitations } = isOwner
    ? await supabase
        .from('team_invitations')
        .select('*')
        .eq('owner_id', myId)
        .eq('status', 'pending')
    : { data: [] }

  // Owner profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', myId)
    .single()

  // Owner info (if I'm a member, fetch owner profile)
  let ownerProfile = null
  if (!isOwner) {
    const { data: op } = await supabase
      .from('profiles')
      .select('full_name, business_name, email')
      .eq('id', ownerId)
      .single()
    ownerProfile = op
  }

  return (
    <TeamManager
      members={membersWithProfiles}
      invitations={invitations || []}
      profile={profile}
      ownerId={isOwner ? myId : ownerId}
      ownerEmail={session.user.email || ''}
      isOwner={isOwner}
      ownerProfile={ownerProfile}
    />
  )
}
