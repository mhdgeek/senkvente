-- ============================================================
-- SENKVENTE - Schéma Supabase complet
-- Application de gestion de ventes pour petits business au Sénégal
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (profil utilisateur/business)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  city TEXT DEFAULT 'Dakar',
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par user
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_full_name ON clients(user_id, full_name);

-- ============================================================
-- TABLE: transactions (ventes, interventions, abonnements)
-- ============================================================
CREATE TYPE transaction_type AS ENUM ('vente', 'intervention', 'abonnement');
CREATE TYPE payment_method AS ENUM ('cash', 'wave', 'orange_money', 'free_money', 'virement', 'cheque', 'autre');
CREATE TYPE transaction_status AS ENUM ('payé', 'en_attente', 'partiel', 'annulé');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  type transaction_type NOT NULL DEFAULT 'vente',
  amount NUMERIC(12, 0) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  status transaction_status NOT NULL DEFAULT 'payé',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Champs spécifiques interventions
  intervention_type TEXT, -- ex: "Caméra surveillance", "Câblage réseau"
  -- Champs spécifiques abonnements
  subscription_service TEXT, -- ex: "IPTV", "Logiciel X"
  subscription_period TEXT, -- ex: "Mensuel", "Annuel"
  -- Méta
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(user_id, type);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: clients
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE USING (auth.uid() = user_id);

-- Policies: transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS: updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: Créer profil automatiquement après signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, business_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nouvel utilisateur'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mon Business')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- VIEWS: Dashboard stats
-- ============================================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  t.user_id,
  COUNT(DISTINCT t.id) AS total_transactions,
  COUNT(DISTINCT t.client_id) AS total_clients_avec_ventes,
  SUM(t.amount) FILTER (WHERE t.status = 'payé') AS revenus_confirmes,
  SUM(t.amount) AS revenus_total,
  SUM(t.amount) FILTER (WHERE t.type = 'vente' AND t.status = 'payé') AS revenus_ventes,
  SUM(t.amount) FILTER (WHERE t.type = 'intervention' AND t.status = 'payé') AS revenus_interventions,
  SUM(t.amount) FILTER (WHERE t.type = 'abonnement' AND t.status = 'payé') AS revenus_abonnements,
  COUNT(t.id) FILTER (WHERE t.type = 'vente') AS nb_ventes,
  COUNT(t.id) FILTER (WHERE t.type = 'intervention') AS nb_interventions,
  COUNT(t.id) FILTER (WHERE t.type = 'abonnement') AS nb_abonnements
FROM transactions t
GROUP BY t.user_id;

-- Accès à la vue via RLS
CREATE OR REPLACE VIEW my_dashboard_stats AS
SELECT * FROM dashboard_stats WHERE user_id = auth.uid();
