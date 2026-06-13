-- ============================================================
-- Migration 016 — Fonction RPC d'incrément atomique Mentor
-- increment_mentor_count : incrémente le compteur du jour en
-- une seule opération SQL atomique (évite les race conditions).
-- ============================================================

CREATE OR REPLACE FUNCTION increment_mentor_count(p_user_id UUID, p_day DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO mentor_daily_usage (user_id, day, count, updated_at)
  VALUES (p_user_id, p_day, 1, now())
  ON CONFLICT (user_id, day)
  DO UPDATE SET
    count      = mentor_daily_usage.count + 1,
    updated_at = now();
END;
$$;

-- Seul l'utilisateur authentifié peut appeler cette fonction sur son propre user_id
REVOKE ALL ON FUNCTION increment_mentor_count(UUID, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_mentor_count(UUID, DATE) TO authenticated;
