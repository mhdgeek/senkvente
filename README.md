# SenkVente 🇸🇳
**Application SaaS de gestion de ventes pour petits business au Sénégal**

> Gérez vos clients, ventes, interventions techniques et abonnements — depuis n'importe où.

---

## Architecture du projet

```
senkvente/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Pages protégées (layout avec sidebar)
│   │   │   ├── dashboard/page.tsx    # Dashboard + statistiques
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx          # Liste des clients
│   │   │   │   ├── new/page.tsx      # Créer un client
│   │   │   │   └── [id]/page.tsx     # Détail + historique client
│   │   │   ├── sales/
│   │   │   │   ├── page.tsx          # Historique des transactions
│   │   │   │   └── new/page.tsx      # Nouvelle transaction
│   │   │   └── profile/page.tsx      # Profil business
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # Connexion
│   │   │   └── signup/page.tsx       # Inscription
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Design system CSS
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Navigation latérale
│   │   │   └── TopBar.tsx            # Barre du haut
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx        # Cartes de statistiques
│   │   │   ├── RevenueChart.tsx      # Graphique revenus (Recharts)
│   │   │   ├── TypeBreakdown.tsx     # Répartition par type
│   │   │   └── RecentTransactions.tsx
│   │   ├── clients/
│   │   │   └── ClientActions.tsx     # Modifier / Supprimer client
│   │   ├── sales/
│   │   │   └── SalesTable.tsx        # Tableau avec filtres
│   │   └── profile/
│   │       └── ProfileForm.tsx       # Formulaire profil
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Client navigateur
│   │   │   └── server.ts             # Client serveur (SSR)
│   │   └── utils.ts                  # Helpers (formatCFA, etc.)
│   ├── types/index.ts                # TypeScript types
│   └── middleware.ts                 # Auth middleware Next.js
├── supabase-schema.sql               # Schéma SQL complet
├── .env.local.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Déploiement étape par étape

### Étape 1 : Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Choisir une région proche (ex: Frankfurt `eu-central-1`)
3. Une fois le projet créé, aller dans **SQL Editor**
4. Coller et exécuter tout le contenu de `supabase-schema.sql`
5. Aller dans **Settings > API** et copier :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Étape 2 : Configurer l'auth Supabase

Dans Supabase → **Authentication > Settings** :
- Activer **Email** comme provider
- Désactiver "Confirm email" pour le développement (optionnel)
- Ajouter votre domaine Vercel dans **Redirect URLs** : `https://votre-app.vercel.app/**`

### Étape 3 : Déployer sur Vercel

#### Option A — Via GitHub (recommandé)

```bash
# 1. Initialiser le projet localement
cd senkvente
npm install

# 2. Créer un repo GitHub et pusher
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-user/senkvente.git
git push -u origin main
```

3. Sur [vercel.com](https://vercel.com) → **New Project** → Importer depuis GitHub
4. Dans **Environment Variables**, ajouter :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. Cliquer **Deploy** ✅

#### Option B — Via CLI Vercel

```bash
npm install -g vercel
cd senkvente
npm install
vercel
# Suivre les instructions, puis :
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

### Étape 4 : Test en local

```bash
cp .env.local.example .env.local
# Remplir les variables dans .env.local

npm install
npm run dev
# Ouvrir http://localhost:3000
```

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router) |
| Language | TypeScript |
| Style | Tailwind CSS |
| Auth + DB | Supabase (PostgreSQL + Row Level Security) |
| Charts | Recharts |
| Icons | Lucide React |
| Déploiement | Vercel |
| Polices | Syne (display) + DM Sans (body) |

---

## Fonctionnalités

- ✅ **Auth** — Signup / Login sécurisé via Supabase Auth
- ✅ **Profil business** — Nom, ville, description, téléphone
- ✅ **Clients CRUD** — Création, liste, détail, modification, suppression
- ✅ **Transactions** — Vente / Intervention technique / Abonnement
- ✅ **Modes de paiement** — Cash, Wave, Orange Money, Free Money, Virement, Chèque
- ✅ **Statuts** — Payé, En attente, Partiel, Annulé
- ✅ **Dashboard** — Revenus, nb clients, graphique mensuel, répartition par type
- ✅ **Historique** — Filtres par type/statut, recherche, suppression
- ✅ **Historique par client** — Vue complète des transactions d'un client
- ✅ **RLS** — Chaque utilisateur ne voit que ses propres données
- ✅ **Responsive** — Mobile, tablette, desktop

---

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Chaque requête est filtrée par `auth.uid()` côté base de données
- Middleware Next.js protège toutes les routes `/dashboard`, `/clients`, `/sales`, `/profile`
- Les mots de passe sont gérés par Supabase Auth (bcrypt)

---

*Fait pour les entrepreneurs au Sénégal 🇸🇳*
