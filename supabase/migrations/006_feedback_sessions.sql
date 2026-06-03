-- ============================================================
-- RAILREADY — Migration 006: Feedbacks + Sessions IA
-- ============================================================

-- Table feedbacks utilisateurs
CREATE TABLE IF NOT EXISTS feedbacks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module      TEXT NOT NULL CHECK (module IN ('entretien', 'mentor', 'test_compatibilite', 'fiche_metier')),
  contexte    TEXT,           -- nom du métier, question, etc.
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS feedbacks
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_feedback" ON feedbacks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "service_role_read_feedbacks" ON feedbacks
  FOR SELECT TO service_role USING (true);


-- Table sessions IA (entretiens)
CREATE TABLE IF NOT EXISTS ai_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type  TEXT NOT NULL DEFAULT 'recrutement',
  poste       TEXT,
  niveau      TEXT DEFAULT 'debutant',
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  score       SMALLINT,
  feedback    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS sessions IA
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_ai_sessions" ON ai_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id);


-- Table messages IA (si pas déjà existante)
CREATE TABLE IF NOT EXISTS ai_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_ai_messages" ON ai_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_sessions s
      WHERE s.id = ai_messages.session_id
      AND s.user_id = auth.uid()
    )
  );


-- Fonction finaliser session entretien
CREATE OR REPLACE FUNCTION finaliser_session_entretien(
  p_session_id UUID,
  p_score      SMALLINT,
  p_feedback   TEXT
) RETURNS void AS $$
BEGIN
  UPDATE ai_sessions
  SET
    status       = 'completed',
    score        = p_score,
    feedback     = p_feedback,
    completed_at = NOW()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Vue résumé sessions pour le dashboard
CREATE OR REPLACE VIEW v_user_sessions_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'completed') AS entretiens_completes,
  AVG(score) FILTER (WHERE score IS NOT NULL) AS score_moyen,
  MAX(created_at) AS derniere_session
FROM ai_sessions
GROUP BY user_id;

GRANT SELECT ON v_user_sessions_summary TO authenticated;
