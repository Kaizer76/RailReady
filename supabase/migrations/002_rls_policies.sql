-- ============================================================
-- RAILREADY — Migration 002: Row Level Security
-- ============================================================

-- Activer RLS sur toutes les tables utilisateur
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Tables publiques (lecture seule, pas de RLS stricte)
ALTER TABLE metiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE qcm_questions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

CREATE POLICY "profiles: lecture par propriétaire"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: mise à jour par propriétaire"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE POLICY "subscriptions: lecture par propriétaire"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Les mises à jour viennent uniquement du service_role (webhook Stripe)
CREATE POLICY "subscriptions: update service_role only"
  ON subscriptions FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "subscriptions: insert service_role only"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- USER QUIZ SESSIONS
-- ============================================================

CREATE POLICY "quiz_sessions: CRUD par propriétaire"
  ON user_quiz_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AI SESSIONS
-- ============================================================

CREATE POLICY "ai_sessions: CRUD par propriétaire"
  ON ai_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AI MESSAGES
-- ============================================================

CREATE POLICY "ai_messages: lecture par propriétaire via session"
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_sessions
      WHERE ai_sessions.id = ai_messages.session_id
      AND ai_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "ai_messages: insert par propriétaire via session"
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_sessions
      WHERE ai_sessions.id = ai_messages.session_id
      AND ai_sessions.user_id = auth.uid()
    )
  );

-- ============================================================
-- USER MODULE PROGRESS
-- ============================================================

CREATE POLICY "user_module_progress: CRUD par propriétaire"
  ON user_module_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- USER STATS
-- ============================================================

CREATE POLICY "user_stats: lecture par propriétaire"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_stats: update service_role uniquement"
  ON user_stats FOR UPDATE
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLES PUBLIQUES (lecture pour tous les authentifiés)
-- ============================================================

CREATE POLICY "metiers: lecture publique"
  ON metiers FOR SELECT
  USING (is_active = true);

CREATE POLICY "compatibility_tests: lecture authentifiée"
  ON compatibility_tests FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "quiz_questions: lecture authentifiée"
  ON quiz_questions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "formation_modules: lecture selon abonnement"
  ON formation_modules FOR SELECT
  USING (
    is_active = true AND (
      is_premium = false
      OR EXISTS (
        SELECT 1 FROM subscriptions
        WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.plan IN ('starter', 'pro')
        AND subscriptions.status = 'active'
      )
    )
  );

CREATE POLICY "qcm_questions: lecture via module accessible"
  ON qcm_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM formation_modules
      WHERE formation_modules.id = qcm_questions.module_id
      AND formation_modules.is_active = true
      AND (
        formation_modules.is_premium = false
        OR EXISTS (
          SELECT 1 FROM subscriptions
          WHERE subscriptions.user_id = auth.uid()
          AND subscriptions.plan IN ('starter', 'pro')
          AND subscriptions.status = 'active'
        )
      )
    )
  );
