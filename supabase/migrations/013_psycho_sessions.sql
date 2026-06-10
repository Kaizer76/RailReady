-- ============================================================
-- Migration 013 — Historique des tests psychotechniques
-- Table psycho_sessions : un enregistrement par module complété
-- ============================================================

CREATE TABLE IF NOT EXISTS psycho_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('memoire', 'logique', 'concentration', 'rapidite')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  niveau INTEGER NOT NULL DEFAULT 1 CHECK (niveau BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour historique / progression / statistiques par utilisateur
CREATE INDEX IF NOT EXISTS idx_psycho_sessions_user
  ON psycho_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_psycho_sessions_user_module
  ON psycho_sessions(user_id, module, created_at DESC);

-- RLS : chaque utilisateur ne voit et n'écrit que ses propres sessions
ALTER TABLE psycho_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "psycho_sessions_select_own" ON psycho_sessions;
CREATE POLICY "psycho_sessions_select_own" ON psycho_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "psycho_sessions_insert_own" ON psycho_sessions;
CREATE POLICY "psycho_sessions_insert_own" ON psycho_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "psycho_sessions_delete_own" ON psycho_sessions;
CREATE POLICY "psycho_sessions_delete_own" ON psycho_sessions
  FOR DELETE USING (auth.uid() = user_id);
