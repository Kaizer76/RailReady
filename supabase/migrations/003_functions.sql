-- ============================================================
-- RAILREADY — Migration 003: Fonctions utilitaires
-- ============================================================

-- ============================================================
-- FONCTION: calculer_score_compatibilite
-- Calcule le score de compatibilité à partir des réponses
-- ============================================================

CREATE OR REPLACE FUNCTION calculer_score_compatibilite(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_answers JSONB;
  v_questions RECORD;
  v_score_global DECIMAL := 0;
  v_score_details JSONB := '{}'::JSONB;
  v_dimension_scores JSONB := '{}'::JSONB;
  v_dimension_weights JSONB := '{}'::JSONB;
  v_total_weight DECIMAL := 0;
BEGIN
  -- Récupérer les réponses
  SELECT answers INTO v_answers
  FROM user_quiz_sessions
  WHERE id = p_session_id;

  -- Agréger par dimension
  FOR v_questions IN
    SELECT q.id, q.dimension, q.weight,
           (v_answers ->> q.id::text)::DECIMAL AS answer_value
    FROM quiz_questions q
    JOIN compatibility_tests ct ON ct.id = q.test_id
    JOIN user_quiz_sessions uqs ON uqs.test_id = ct.id
    WHERE uqs.id = p_session_id
  LOOP
    IF v_questions.answer_value IS NOT NULL THEN
      -- Accumule score pondéré par dimension
      v_score_details = jsonb_set(
        v_score_details,
        ARRAY[v_questions.dimension],
        COALESCE((v_score_details ->> v_questions.dimension)::DECIMAL, 0)
          + (v_questions.answer_value * v_questions.weight)
      );
      v_score_global := v_score_global + (v_questions.answer_value * v_questions.weight);
      v_total_weight := v_total_weight + v_questions.weight;
    END IF;
  END LOOP;

  -- Normaliser sur 100
  IF v_total_weight > 0 THEN
    v_score_global := ROUND((v_score_global / v_total_weight) * 20, 2);
  END IF;

  -- Mettre à jour la session
  UPDATE user_quiz_sessions
  SET score_global = v_score_global,
      score_details = v_score_details,
      status = 'completed',
      completed_at = NOW()
  WHERE id = p_session_id;

  -- Mettre à jour user_stats
  UPDATE user_stats
  SET quiz_completed = true,
      updated_at = NOW()
  WHERE user_id = (SELECT user_id FROM user_quiz_sessions WHERE id = p_session_id);

  RETURN jsonb_build_object(
    'score_global', v_score_global,
    'score_details', v_score_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FONCTION: finaliser_session_entretien
-- Met à jour stats après une simulation d'entretien
-- ============================================================

CREATE OR REPLACE FUNCTION finaliser_session_entretien(
  p_session_id UUID,
  p_score DECIMAL,
  p_feedback TEXT
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM ai_sessions WHERE id = p_session_id;

  -- Mettre à jour la session
  UPDATE ai_sessions
  SET score = p_score,
      feedback = p_feedback,
      is_completed = true,
      updated_at = NOW()
  WHERE id = p_session_id;

  -- Mettre à jour les stats
  UPDATE user_stats
  SET total_sessions = total_sessions + 1,
      avg_entretien_score = (
        COALESCE(avg_entretien_score, 0) * total_sessions + p_score
      ) / (total_sessions + 1),
      best_entretien_score = GREATEST(COALESCE(best_entretien_score, 0), p_score),
      last_session_at = NOW(),
      updated_at = NOW()
  WHERE user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FONCTION: get_user_dashboard
-- Données complètes pour le tableau de bord (une seule requête)
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', row_to_json(p.*),
    'subscription', row_to_json(s.*),
    'stats', row_to_json(us.*),
    'recent_sessions', (
      SELECT jsonb_agg(row_to_json(sess.*) ORDER BY sess.created_at DESC)
      FROM (
        SELECT id, session_type, score, is_completed, created_at
        FROM ai_sessions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) sess
    ),
    'module_progress', (
      SELECT jsonb_agg(row_to_json(mp.*))
      FROM user_module_progress mp
      WHERE mp.user_id = p_user_id
    )
  )
  INTO v_result
  FROM profiles p
  LEFT JOIN subscriptions s ON s.user_id = p.id
  LEFT JOIN user_stats us ON us.user_id = p.id
  WHERE p.id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FONCTION: check_session_limit
-- Vérifie si l'utilisateur peut créer une nouvelle session
-- (limite plan gratuit: 3/mois)
-- ============================================================

CREATE OR REPLACE FUNCTION check_session_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan subscription_plan;
  v_sessions_this_month INTEGER;
BEGIN
  SELECT plan INTO v_plan
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  -- Plans payants = illimité
  IF v_plan IN ('starter', 'pro') THEN
    RETURN true;
  END IF;

  -- Plan gratuit: max 3 sessions/mois
  SELECT COUNT(*) INTO v_sessions_this_month
  FROM ai_sessions
  WHERE user_id = p_user_id
  AND created_at >= date_trunc('month', NOW());

  RETURN v_sessions_this_month < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
