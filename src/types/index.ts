export type TransactionType = 'vente' | 'intervention' | 'abonnement'
export type PaymentMethod = 'cash' | 'wave' | 'orange_money' | 'free_money' | 'virement' | 'cheque' | 'autre'
export type TransactionStatus = 'payé' | 'en_attente' | 'partiel' | 'annulé'
export type TeamRole = 'owner' | 'member'
export type SuggestionCategory = 'bug' | 'suggestion' | 'question' | 'autre'
export type SuggestionStatus = 'nouveau' | 'en_cours' | 'résolu' | 'fermé'

export interface Profile {
  id: string
  full_name: string
  business_name: string
  phone?: string
  email?: string
  city?: string
  description?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  full_name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  client_id: string
  type: TransactionType
  amount: number
  description: string
  payment_method: PaymentMethod
  status: TransactionStatus
  transaction_date: string
  intervention_type?: string
  subscription_service?: string
  subscription_period?: string
  purchase_price?: number
  delivery_cost?: number
  subscription_setup_cost?: number
  subscription_monthly_cost?: number
  notes?: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface TeamMember {
  id: string
  owner_id: string
  member_id: string
  role: TeamRole
  created_at: string
  member_profile?: Profile
}

export interface TeamInvitation {
  id: string
  owner_id: string
  email: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  created_at: string
  expires_at: string
}

export interface FaqSuggestion {
  id: string
  user_id: string
  category: SuggestionCategory
  subject: string
  message: string
  status: SuggestionStatus
  admin_reply?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_transactions: number
  total_clients_avec_ventes: number
  revenus_confirmes: number
  revenus_total: number
  revenus_ventes: number
  revenus_interventions: number
  revenus_abonnements: number
  nb_ventes: number
  nb_interventions: number
  nb_abonnements: number
}

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  wave: 'Wave',
  orange_money: 'Orange Money',
  free_money: 'Free Money',
  virement: 'Virement bancaire',
  cheque: 'Chèque',
  autre: 'Autre',
}

export const TRANSACTION_TYPES: Record<TransactionType, string> = {
  vente: 'Vente',
  intervention: 'Intervention technique',
  abonnement: 'Abonnement',
}

export const INTERVENTION_TYPES = [
  'Caméra de surveillance',
  'Câblage réseau',
  'Installation réseau',
  'Maintenance informatique',
  'Dépannage informatique',
  'Installation logiciel',
  'Formation',
  'Autre intervention',
]

export const SUBSCRIPTION_SERVICES = [
  'IPTV',
  'Logiciel de gestion',
  'Antivirus',
  'Office 365',
  'Google Workspace',
  'Hébergement web',
  'Nom de domaine',
  'VPN',
  'Autre abonnement',
]

export const SUBSCRIPTION_PERIODS = [
  'Mensuel',
  'Trimestriel',
  'Semestriel',
  'Annuel',
]

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  'payé': 'Payé',
  'en_attente': 'En attente',
  'partiel': 'Partiel',
  'annulé': 'Annulé',
}

export const SUGGESTION_CATEGORIES: Record<SuggestionCategory, string> = {
  bug: 'Bug / Problème',
  suggestion: 'Suggestion d\'amélioration',
  question: 'Question',
  autre: 'Autre',
}

export const FAQ_ITEMS = [
  {
    q: 'Comment ajouter un nouveau client ?',
    a: 'Allez dans "Clients" → "Nouveau client". Vous pouvez aussi créer un client directement depuis le formulaire de nouvelle vente en cliquant sur "＋ Créer un nouveau client" dans la liste déroulante.',
  },
  {
    q: 'Comment enregistrer une vente ?',
    a: 'Cliquez sur "Nouvelle vente" dans la barre latérale. Choisissez le type (Vente, Intervention ou Abonnement), sélectionnez le client, remplissez les détails et sauvegardez.',
  },
  {
    q: 'Comment inviter un collaborateur à partager mon dashboard ?',
    a: 'Dans "Mon profil" → section "Mon équipe", entrez l\'email de votre collaborateur et cliquez sur "Inviter". Il recevra un email avec un lien d\'accès et verra les mêmes clients et transactions.',
  },
  {
    q: 'Quelle est la différence entre Vente, Intervention et Abonnement ?',
    a: 'Vente = produit vendu avec prix d\'achat et marge. Intervention = service technique ponctuel (caméra, câblage réseau) avec coût d\'inscription. Abonnement = service récurrent (IPTV, logiciel) avec coût d\'inscription et coût mensuel/annuel.',
  },
  {
    q: 'Comment réinitialiser mon mot de passe ?',
    a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?", entrez votre email et vous recevrez un lien de réinitialisation valable 1 heure.',
  },
  {
    q: 'Les données sont-elles sécurisées ?',
    a: 'Oui. Chaque utilisateur ne voit que ses propres données grâce au Row Level Security (RLS). Les mots de passe sont chiffrés et toutes les connexions sont sécurisées en HTTPS.',
  },
  {
    q: 'Puis-je accéder à l\'app depuis mon téléphone ?',
    a: 'Oui, SenkVente est entièrement responsive. Ouvrez simplement l\'URL dans le navigateur de votre téléphone. Vous pouvez aussi l\'ajouter à votre écran d\'accueil pour un accès rapide.',
  },
  {
    q: 'Comment voir l\'historique d\'un client spécifique ?',
    a: 'Allez dans "Clients", cliquez sur le nom du client. Vous verrez sa fiche complète avec tout l\'historique de ses transactions, le total de son chiffre d\'affaires et les montants en attente.',
  },
]
