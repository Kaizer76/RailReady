-- Migration 012 — Compatibilité API V4 pour user_quiz_sessions
-- Le schéma original utilisait test_id NOT NULL + score_global + score_details
-- L'API V4 (sans compatibility_tests) utilise score + results JSONB
-- Cette migration rend le schéma compatible sans casser l'existant

-- 1. Rendre test_id nullable (plus de dépendance à compatibility_tests)
ALTER TABLE user_quiz_sessions
  ALTER COLUMN test_id DROP NOT NULL;

-- 2. Ajouter les colonnes utilisées par l'API V4
ALTER TABLE user_quiz_sessions
  ADD COLUMN IF NOT EXISTS score INTEGER,
  ADD COLUMN IF NOT EXISTS results JSONB;

-- 3. Index pour les requêtes dashboard (score non-null = session complétée)
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_score
  ON user_quiz_sessions(user_id, score)
  WHERE score IS NOT NULL;

-- Note: score_global et score_details restent pour compatibilité ascendante
