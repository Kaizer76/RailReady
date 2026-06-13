-- ============================================================
-- Migration 015 — Compteur d'utilisation quotidienne Mentor IA
-- Table mentor_daily_usage : un enregistrement par user par jour.
-- Permet de limiter les échanges en tier gratuit (free: 5/jour).
-- Architecture prête pour le plan premium (unlimited).
-- ============================================================

CREATE TABLE IF NOT EXISTS mentor_daily_usage (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day         DATE NOT NULL DEFAULT CURRENT_DATE,
  count       INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT mentor_daily_usage_user_day UNIQUE (user_id, day)
);

-- Index pour les lookups rapides par user + date
CREATE INDEX IF NOT EXISTS idx_mentor_daily_usage_user_day
  ON mentor_daily_usage(user_id, day);

-- RLS : chaque utilisateur ne voit et ne modifie que ses propres lignes
ALTER TABLE mentor_daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_daily_usage_select_own" ON mentor_daily_usage;
CREATE POLICY "mentor_daily_usage_select_own" ON mentor_daily_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentor_daily_usage_insert_own" ON mentor_daily_usage;
CREATE POLICY "mentor_daily_usage_insert_own" ON mentor_daily_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentor_daily_usage_update_own" ON mentor_daily_usage;
CREATE POLICY "mentor_daily_usage_update_own" ON mentor_daily_usage
  FOR UPDATE USING (auth.uid() = user_id);
