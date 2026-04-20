-- ============================================================
-- ADMIN SETUP v2 — À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Ajouter la colonne role dans profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 2. Mettre à jour la policy RLS pour que les admins puissent
--    lire tous les profils (nécessaire pour la page admin)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 3. Promouvoir terangabizsn@gmail.com en admin
--    (d'abord on trouve l'id, puis on met à jour profiles)
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'terangabizsn@gmail.com'
);

-- 4. Vérification — doit retourner role = 'admin'
SELECT p.id, u.email, p.role
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'terangabizsn@gmail.com';

-- ============================================================
-- Pour révoquer le rôle admin plus tard :
-- UPDATE profiles SET role = 'user'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'terangabizsn@gmail.com');
-- ============================================================

-- ============================================================
-- Mettre à jour le trigger pour inclure role = 'user' par défaut
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nouvel utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mon Business'),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
