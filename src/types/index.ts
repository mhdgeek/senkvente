export type TransactionType = 'vente' | 'intervention' | 'abonnement'
export type PaymentMethod = 'cash' | 'wave' | 'orange_money' | 'free_money' | 'virement' | 'cheque' | 'autre'
export type TransactionStatus = 'payé' | 'en_attente' | 'partiel' | 'annulé'

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
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  client?: Client
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
