-- Migration 011 — Profil candidat étendu
-- Ajout des champs avancés au profil utilisateur

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age BETWEEN 16 AND 80),
  ADD COLUMN IF NOT EXISTS niveau_etudes TEXT,
  ADD COLUMN IF NOT EXISTS diplome TEXT,
  ADD COLUMN IF NOT EXISTS experience_annees INTEGER CHECK (experience_annees >= 0),
  ADD COLUMN IF NOT EXISTS experience_description TEXT,
  ADD COLUMN IF NOT EXISTS metier_vise TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS disponibilite TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index pour les recherches par métier visé (usage futur admin/stats)
CREATE INDEX IF NOT EXISTS profiles_metier_vise_idx ON profiles(metier_vise);
CREATE INDEX IF NOT EXISTS profiles_region_idx ON profiles(region);
