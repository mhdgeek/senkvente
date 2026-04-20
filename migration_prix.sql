-- Migration: ajout prix d'achat et frais de livraison sur les transactions
-- À exécuter dans Supabase SQL Editor

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(12, 0) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_cost  NUMERIC(12, 0) DEFAULT 0;

-- Colonne calculée virtuelle pour la marge nette (optionnel, pour référence)
-- marge = amount - purchase_price - delivery_cost
-- (calculée côté application, pas besoin de colonne générée)

COMMENT ON COLUMN transactions.purchase_price IS 'Prix d''achat du produit/service (coût)';
COMMENT ON COLUMN transactions.delivery_cost  IS 'Frais de livraison éventuels';
COMMENT ON COLUMN transactions.amount         IS 'Prix de vente (montant encaissé du client)';
