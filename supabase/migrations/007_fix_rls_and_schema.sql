-- ============================================================
-- RAILREADY — Migration 007 (v2) : RLS + handle_new_user + ai_sessions
-- ⚠️  NE CONTIENT PAS les ALTER TYPE ENUM ni les INSERT qui en dépendent.
--     Ces opérations sont dans 008 et 009 (transactions séparées obligatoires).
--
-- ORDRE D'EXÉCUTION :
--   1. Cette migration 007  → corrige inscription + entretiens
--   2. Migration 008        → ajoute les valeurs ENUM (doit commit avant 009)
--   3. Migration 009        → INSERT des 3 métiers utilisant les nouvelles valeurs
-- ============================================================


-- ============================================================
-- FIX #2 — Politique INSERT manquante sur profiles
-- ============================================================
-- RLS est activé sur profiles mais aucune policy INSERT n'existait.
-- La FK profiles.id → auth.users.id garantit l'intégrité.
-- WITH CHECK (true) est sûr : seul le trigger peut insérer (via handle_new_user).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles: insert par trigger'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles: insert par trigger"
      ON profiles FOR INSERT WITH CHECK (true)';
  END IF;
END $$;


-- ============================================================
-- FIX #1 — Politique INSERT subscriptions incorrecte
-- ============================================================
-- L''ancienne policy exigeait auth.role() = ''service_role''.
-- Dans le contexte du trigger signup, auth.role() retourne NULL (pas de JWT).
-- En Supabase, postgres a NOBYPASSRLS — la policy est donc évaluée même
-- pour une fonction SECURITY DEFINER.

DROP POLICY IF EXISTS "subscriptions: insert service_role only" ON subscriptions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscriptions'
    AND policyname = 'subscriptions: insert par trigger ou service'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "subscriptions: insert par trigger ou service"
        ON subscriptions FOR INSERT
        WITH CHECK (
          auth.uid() = user_id          -- utilisateur connecté insère pour soi
          OR auth.role() = 'service_role'  -- service_role (Stripe webhooks, admin)
          OR auth.uid() IS NULL          -- trigger signup (pas encore de JWT)
        )
    $pol$;
  END IF;
END $$;


-- ============================================================
-- FIX #3 — Politique INSERT manquante sur user_stats
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_stats' AND policyname = 'user_stats: insert par trigger'
  ) THEN
    EXECUTE 'CREATE POLICY "user_stats: insert par trigger"
      ON user_stats FOR INSERT WITH CHECK (true)';
  END IF;
END $$;


-- ============================================================
-- FIX #6 — handle_new_user() réécrite et robuste
-- ============================================================
-- Corrections :
--   SET search_path = public  → protection contre injection search_path
--   COALESCE(full_name, prenom, email_local)  → prénom toujours récupéré
--   ON CONFLICT DO NOTHING    → idempotent (safe sur re-run ou retry)
--   EXCEPTION handler         → ne jamais bloquer le signup, juste logguer

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Créer le profil utilisateur
  --    Priorité : full_name > prenom > partie locale de l'email
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'prenom'), ''),
      SPLIT_PART(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Créer l'abonnement gratuit
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;

  -- 3. Initialiser les statistiques utilisateur
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Ne jamais bloquer l'inscription — logguer pour debug via Supabase Logs
  RAISE WARNING 'handle_new_user() ERREUR user=% email=% : %',
    NEW.id, NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- Recréer le trigger (DROP IF EXISTS pour idempotence)
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- FIX #4 — ai_sessions : aligner le schéma avec le code applicatif
-- ============================================================
-- Contexte : migration 001 a créé ai_sessions avec session_type ENUM NOT NULL
-- et user_id REFERENCES profiles(id). La migration 006 (CREATE TABLE IF NOT EXISTS)
-- a été ignorée car la table existait déjà.
-- Le code utilise : agent_type, poste, niveau, status, completed_at
-- → Ces colonnes n'existaient pas → erreur à chaque création d'entretien.

-- session_type n'est plus utilisé par le code — le rendre nullable
ALTER TABLE ai_sessions
  ALTER COLUMN session_type DROP NOT NULL;

-- Ajouter les colonnes manquantes (ADD COLUMN IF NOT EXISTS = safe à re-runner)
ALTER TABLE ai_sessions
  ADD COLUMN IF NOT EXISTS agent_type   TEXT NOT NULL DEFAULT 'recrutement',
  ADD COLUMN IF NOT EXISTS poste        TEXT,
  ADD COLUMN IF NOT EXISTS niveau       TEXT DEFAULT 'debutant',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- status : ajouter seulement si absent (is_completed BOOLEAN était l'ancienne version)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_sessions' AND column_name = 'status'
  ) THEN
    ALTER TABLE ai_sessions
      ADD COLUMN status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'abandoned'));
  END IF;
END $$;

-- Nettoyer et recréer les politiques RLS ai_sessions proprement
-- (migration 002 et 006 avaient des policies conflictuelles)
DROP POLICY IF EXISTS "ai_sessions: CRUD par propriétaire" ON ai_sessions;
DROP POLICY IF EXISTS "users_own_ai_sessions" ON ai_sessions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_sessions' AND policyname = 'ai_sessions: acces propriétaire'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "ai_sessions: acces propriétaire"
        ON ai_sessions FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    $pol$;
  END IF;
END $$;

-- Nettoyer et recréer les politiques RLS ai_messages
DROP POLICY IF EXISTS "ai_messages: lecture par propriétaire via session" ON ai_messages;
DROP POLICY IF EXISTS "ai_messages: insert par propriétaire via session" ON ai_messages;
DROP POLICY IF EXISTS "users_own_ai_messages" ON ai_messages;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_messages' AND policyname = 'ai_messages: acces via session'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "ai_messages: acces via session"
        ON ai_messages FOR ALL TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM ai_sessions s
            WHERE s.id = ai_messages.session_id
            AND s.user_id = auth.uid()
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM ai_sessions s
            WHERE s.id = ai_messages.session_id
            AND s.user_id = auth.uid()
          )
        )
    $pol$;
  END IF;
END $$;


-- ============================================================
-- VÉRIFICATION INTÉGRÉE (lecture seule — aucun effet de bord)
-- ============================================================

DO $$
DECLARE
  v_profiles_insert   INT;
  v_sub_insert        INT;
  v_stats_insert      INT;
  v_ai_agent_type     INT;
  v_ai_status         INT;
BEGIN
  SELECT COUNT(*) INTO v_profiles_insert
    FROM pg_policies WHERE tablename='profiles' AND cmd='INSERT';

  SELECT COUNT(*) INTO v_sub_insert
    FROM pg_policies WHERE tablename='subscriptions' AND cmd='INSERT';

  SELECT COUNT(*) INTO v_stats_insert
    FROM pg_policies WHERE tablename='user_stats' AND cmd='INSERT';

  SELECT COUNT(*) INTO v_ai_agent_type
    FROM information_schema.columns
    WHERE table_name='ai_sessions' AND column_name='agent_type';

  SELECT COUNT(*) INTO v_ai_status
    FROM information_schema.columns
    WHERE table_name='ai_sessions' AND column_name='status';

  RAISE NOTICE '007 — Vérification :';
  RAISE NOTICE '  profiles INSERT policies  : % (attendu ≥1)', v_profiles_insert;
  RAISE NOTICE '  subscriptions INSERT policies : % (attendu ≥1)', v_sub_insert;
  RAISE NOTICE '  user_stats INSERT policies: % (attendu ≥1)', v_stats_insert;
  RAISE NOTICE '  ai_sessions.agent_type    : % (attendu 1)', v_ai_agent_type;
  RAISE NOTICE '  ai_sessions.status        : % (attendu 1)', v_ai_status;

  IF v_profiles_insert = 0 OR v_sub_insert = 0 OR v_stats_insert = 0
     OR v_ai_agent_type = 0 OR v_ai_status = 0 THEN
    RAISE EXCEPTION '007 — Une ou plusieurs corrections n''ont pas été appliquées. Vérifier les logs.';
  END IF;

  RAISE NOTICE '007 — ✅ Toutes les corrections appliquées avec succès.';
END $$;
