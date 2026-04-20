import Link from 'next/link'
import { TrendingUp, Users, FileText, Shield, Zap, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(249,115,22,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(249,115,22,0.05),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">SenkVente</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-dark-300 hover:text-white transition-colors px-4 py-2">
            Connexion
          </Link>
          <Link href="/auth/signup" className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-brand-900/30">
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-300 text-sm font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          Fait pour les entrepreneurs sénégalais
        </div>
        
        <h1 className="font-display text-5xl lg:text-7xl font-bold text-white max-w-4xl mx-auto leading-tight mb-6">
          Gérez vos ventes{' '}
          <span className="text-brand-400">simplement</span>
        </h1>
        
        <p className="text-dark-300 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Suivez vos clients, enregistrez vos ventes, interventions techniques et abonnements. 
          Visualisez votre chiffre d&apos;affaires en temps réel.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-brand-900/30 text-base">
            Créer mon compte gratuit
            <TrendingUp className="w-4 h-4" />
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium rounded-2xl transition-all text-base">
            J&apos;ai déjà un compte
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-12 pb-28">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Users,
                title: 'Gestion clients',
                desc: 'Créez et gérez votre portefeuille clients. Consultez l\'historique de chaque client en un clic.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10 border-blue-500/20',
              },
              {
                icon: FileText,
                title: 'Ventes & Interventions',
                desc: 'Enregistrez vos ventes, interventions techniques (caméras, réseaux) et abonnements logiciels.',
                color: 'text-brand-400',
                bg: 'bg-brand-500/10 border-brand-500/20',
              },
              {
                icon: TrendingUp,
                title: 'Dashboard analytique',
                desc: 'Visualisez vos revenus, suivez vos performances et analysez votre activité mois par mois.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
            ].map((f, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${f.bg} backdrop-blur-sm`}>
                <div className={`w-10 h-10 rounded-xl ${f.bg} border flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-16 pt-10 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 text-dark-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Données sécurisées
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Accessible partout
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Paiement Wave & Orange Money
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
