-- ============================================================
-- RAILREADY — Migration 010 : Table beta_feedbacks
-- Collecte des retours terrain pour la phase bêta
-- ============================================================

CREATE TABLE IF NOT EXISTS beta_feedbacks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Identification
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email           TEXT,                        -- email si l'utilisateur accepte d'être recontacté

  -- Module évalué
  module          TEXT NOT NULL CHECK (module IN (
    'test_compatibilite',
    'entretien_ia',
    'mentor_ia'
  )),
  contexte        TEXT,                        -- ex: "Conducteur de Train", "score: 72%"

  -- Note globale
  note            SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),

  -- Questions bêta
  coherent        TEXT CHECK (coherent IN ('oui', 'non', 'partiellement')),
  info_inexacte   TEXT,                        -- Q2: informations inexactes
  info_manquante  TEXT,                        -- Q3: informations manquantes
  metier_actuel   TEXT,                        -- Q4: métier exercé ou visé
  recontact       BOOLEAN DEFAULT false,       -- Q5: accord pour être recontacté

  -- Commentaire libre
  commentaire     TEXT NOT NULL
);

-- Index pour les requêtes admin
CREATE INDEX idx_beta_feedbacks_created ON beta_feedbacks(created_at DESC);
CREATE INDEX idx_beta_feedbacks_module  ON beta_feedbacks(module);
CREATE INDEX idx_beta_feedbacks_note    ON beta_feedbacks(note);

-- RLS
ALTER TABLE beta_feedbacks ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur authentifié peut insérer son feedback
CREATE POLICY "beta_feedbacks: insert authentifié"
  ON beta_feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Lecture réservée au service_role (admin) via API
CREATE POLICY "beta_feedbacks: lecture service_role"
  ON beta_feedbacks FOR SELECT
  TO service_role
  USING (true);

-- Un utilisateur peut lire ses propres feedbacks
CREATE POLICY "beta_feedbacks: lecture propriétaire"
  ON beta_feedbacks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- VUE ADMIN — Agrégats pour le dashboard
-- ============================================================

CREATE OR REPLACE VIEW v_beta_stats AS
SELECT
  module,
  COUNT(*)                                          AS total_feedbacks,
  ROUND(AVG(note)::NUMERIC, 2)                     AS note_moyenne,
  COUNT(*) FILTER (WHERE note >= 4)                AS avis_positifs,
  COUNT(*) FILTER (WHERE note <= 2)                AS avis_negatifs,
  COUNT(*) FILTER (WHERE recontact = true)         AS demandes_recontact,
  COUNT(*) FILTER (WHERE coherent = 'oui')         AS resultat_coherent,
  COUNT(*) FILTER (WHERE coherent = 'non')         AS resultat_non_coherent,
  COUNT(*) FILTER (WHERE coherent = 'partiellement') AS resultat_partiel,
  MAX(created_at)                                  AS dernier_feedback
FROM beta_feedbacks
GROUP BY module;

-- Vue globale (tous modules confondus)
CREATE OR REPLACE VIEW v_beta_stats_global AS
SELECT
  COUNT(*)                                          AS total_feedbacks,
  ROUND(AVG(note)::NUMERIC, 2)                     AS note_moyenne_globale,
  COUNT(DISTINCT user_id)                          AS utilisateurs_uniques,
  COUNT(*) FILTER (WHERE recontact = true)         AS demandes_recontact,
  MIN(created_at)                                  AS premier_feedback,
  MAX(created_at)                                  AS dernier_feedback
FROM beta_feedbacks;

GRANT SELECT ON v_beta_stats TO service_role;
GRANT SELECT ON v_beta_stats_global TO service_role;
