-- ============================================================
-- RAILREADY — Migration 001: Schéma initial
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- recherche fulltext

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE metier_category AS ENUM ('conduite', 'circulation', 'controle', 'maintenance', 'gestion');
CREATE TYPE difficulty_level AS ENUM ('debutant', 'intermediaire', 'avance');
CREATE TYPE session_type AS ENUM ('entretien_conducteur', 'entretien_circulation', 'entretien_controleur', 'entretien_maintenance', 'coaching');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- ============================================================
-- TABLE: profiles
-- Extension de auth.users de Supabase
-- ============================================================

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  target_metier   TEXT,                          -- métier cible choisi
  experience_level difficulty_level DEFAULT 'debutant',
  location        TEXT,                          -- ville / région
  is_onboarded    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: subscriptions
-- ============================================================

CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id       TEXT,
  plan                  subscription_plan DEFAULT 'free',
  status                subscription_status DEFAULT 'active',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ============================================================
-- TABLE: metiers
-- Catalogue des métiers ferroviaires
-- ============================================================

CREATE TABLE metiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  category        metier_category NOT NULL,
  short_desc      TEXT NOT NULL,
  full_desc       TEXT NOT NULL,
  missions        JSONB DEFAULT '[]',           -- tableau de strings
  avantages       JSONB DEFAULT '[]',
  contraintes     JSONB DEFAULT '[]',
  qualites        JSONB DEFAULT '[]',
  salaire_min     INTEGER,                      -- en euros brut/mois
  salaire_max     INTEGER,
  formation_duree TEXT,                          -- ex: "6 à 12 mois"
  evolution       TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metiers_category ON metiers(category);
CREATE INDEX idx_metiers_slug ON metiers(slug);

-- ============================================================
-- TABLE: compatibility_tests
-- Configuration des questionnaires de compatibilité
-- ============================================================

CREATE TABLE compatibility_tests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metier_id   UUID REFERENCES metiers(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  is_global   BOOLEAN DEFAULT true,             -- test générique ou spécifique à un métier
  version     INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: quiz_questions
-- Questions du test de compatibilité
-- ============================================================

CREATE TABLE quiz_questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id         UUID NOT NULL REFERENCES compatibility_tests(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  question_type   TEXT DEFAULT 'scale',         -- 'scale' | 'multiple_choice' | 'boolean'
  options         JSONB,                         -- pour multiple_choice
  dimension       TEXT NOT NULL,                 -- ex: 'horaires_decales', 'stress', 'autonomie'
  weight          DECIMAL(3,2) DEFAULT 1.0,      -- pondération dans le score
  order_index     INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_test ON quiz_questions(test_id);

-- ============================================================
-- TABLE: user_quiz_sessions
-- Sessions de test d'un utilisateur
-- ============================================================

CREATE TABLE user_quiz_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id         UUID NOT NULL REFERENCES compatibility_tests(id),
  status          TEXT DEFAULT 'in_progress',    -- 'in_progress' | 'completed'
  answers         JSONB DEFAULT '{}',            -- { question_id: answer_value }
  score_global    DECIMAL(5,2),                  -- sur 100
  score_details   JSONB DEFAULT '{}',            -- { dimension: score }
  recommendation  TEXT,                           -- résumé IA personnalisé
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_quiz_sessions_user ON user_quiz_sessions(user_id);
CREATE INDEX idx_user_quiz_sessions_status ON user_quiz_sessions(status);

-- ============================================================
-- TABLE: ai_sessions
-- Sessions de conversation avec les agents IA
-- ============================================================

CREATE TABLE ai_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type    session_type NOT NULL,
  metier_id       UUID REFERENCES metiers(id) ON DELETE SET NULL,
  title           TEXT,                          -- titre généré automatiquement
  score           DECIMAL(5,2),                  -- note finale entretien (sur 100)
  feedback        TEXT,                          -- feedback global IA post-session
  is_completed    BOOLEAN DEFAULT false,
  duration_seconds INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX idx_ai_sessions_type ON ai_sessions(session_type);

-- ============================================================
-- TABLE: ai_messages
-- Messages d'une session IA
-- ============================================================

CREATE TABLE ai_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role            message_role NOT NULL,
  content         TEXT NOT NULL,
  token_count     INTEGER,                        -- pour tracking coûts
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_session ON ai_messages(session_id);

-- ============================================================
-- TABLE: formation_modules
-- Modules de formation disponibles
-- ============================================================

CREATE TABLE formation_modules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metier_id       UUID REFERENCES metiers(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  content         TEXT NOT NULL,                 -- Markdown
  difficulty      difficulty_level DEFAULT 'debutant',
  duration_min    INTEGER,                        -- durée estimée en minutes
  order_index     INTEGER DEFAULT 0,
  is_premium      BOOLEAN DEFAULT false,          -- réservé plan payant
  is_active       BOOLEAN DEFAULT true,
  tags            JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_formation_modules_metier ON formation_modules(metier_id);

-- ============================================================
-- TABLE: qcm_questions
-- Questions QCM pour la formation
-- ============================================================

CREATE TABLE qcm_questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id       UUID NOT NULL REFERENCES formation_modules(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  options         JSONB NOT NULL,                -- [{ text: string, is_correct: boolean }]
  explanation     TEXT,                           -- explication après réponse
  difficulty      difficulty_level DEFAULT 'debutant',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qcm_questions_module ON qcm_questions(module_id);

-- ============================================================
-- TABLE: user_module_progress
-- Progression d'un utilisateur dans les modules
-- ============================================================

CREATE TABLE user_module_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id       UUID NOT NULL REFERENCES formation_modules(id) ON DELETE CASCADE,
  is_completed    BOOLEAN DEFAULT false,
  score_qcm       DECIMAL(5,2),                  -- score QCM du module
  last_position   INTEGER DEFAULT 0,             -- position dans le contenu
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);

-- ============================================================
-- TABLE: user_stats
-- Vue agrégée des statistiques utilisateur (dénormalisée)
-- ============================================================

CREATE TABLE user_stats (
  user_id                   UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_sessions            INTEGER DEFAULT 0,
  avg_entretien_score       DECIMAL(5,2),
  best_entretien_score      DECIMAL(5,2),
  modules_completed         INTEGER DEFAULT 0,
  quiz_completed            BOOLEAN DEFAULT false,
  last_session_at           TIMESTAMPTZ,
  streak_days               INTEGER DEFAULT 0,
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ai_sessions_updated_at
  BEFORE UPDATE ON ai_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_module_progress_updated_at
  BEFORE UPDATE ON user_module_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: création automatique profile + stats + subscription
-- au sign-up Supabase Auth
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
