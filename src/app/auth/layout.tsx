import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-b from-dark-900 to-dark-950 border-r border-white/5 p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/40">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">SenkVente</span>
        </Link>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-4 font-body">SenkVente</p>
            <p className="text-dark-200 text-base leading-relaxed font-body">
              La solution tout-en-un pour les vendeurs et techniciens au Sénégal. Enregistrez vos ventes, suivez vos clients, gérez vos interventions et abonnements — depuis n&apos;importe quel appareil.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Ventes & Interventions', desc: 'Toutes vos transactions en un seul endroit' },
              { label: 'Suivi des revenus', desc: 'Dashboard et statistiques en temps réel' },
              { label: 'Gestion clients', desc: 'Historique complet par client' },
              { label: 'Multi-paiements', desc: 'Wave, Orange Money, Cash et plus' },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/4 border border-white/6">
                <p className="text-white text-xs font-medium font-body mb-0.5">{f.label}</p>
                <p className="text-dark-500 text-xs font-body leading-tight">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-y-2 text-dark-600 text-xs font-body">
            <span className="font-medium text-dark-500">© 2026 SenkVente</span>
            <div className="flex items-center gap-3">
              <span>Conçu au Sénégal 🇸🇳</span>
              <span className="w-1 h-1 rounded-full bg-dark-700 inline-block" />
              <span>Données sécurisées</span>
            </div>
          </div>
          <p className="text-dark-700 text-xs font-body mt-2">
            Tous droits réservés
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">SenkVente</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
