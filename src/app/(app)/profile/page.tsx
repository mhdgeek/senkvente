import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'
import { UserCircle } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="page-title">Mon profil</h1>
        <p className="text-dark-400 text-sm mt-1 font-body">Gérez les informations de votre business</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-100">
          <div className="w-16 h-16 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center">
            <UserCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-bold text-dark-900 text-xl">
              {profile?.business_name || 'Mon Business'}
            </h2>
            <p className="text-dark-400 text-sm font-body">{user.email}</p>
          </div>
        </div>

        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </div>
  )
}
