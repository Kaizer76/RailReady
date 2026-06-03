-- ============================================================
-- RAILREADY — Migration 005: Ajout des 3 métiers manquants
-- + Extension du schéma pour les nouvelles sections V1
-- ============================================================

-- ============================================================
-- PARTIE 1 : Extension du schéma table métiers
-- ============================================================

-- Ajout des colonnes manquantes pour les nouvelles sections de fiches
ALTER TABLE metiers
  ADD COLUMN IF NOT EXISTS journee_type        JSONB,
  ADD COLUMN IF NOT EXISTS difficultes         JSONB,
  ADD COLUMN IF NOT EXISTS qualites_detail     JSONB,
  ADD COLUMN IF NOT EXISTS erreurs_frequentes  JSONB,
  ADD COLUMN IF NOT EXISTS idees_recues        JSONB,
  ADD COLUMN IF NOT EXISTS conseils_terrain    JSONB,
  ADD COLUMN IF NOT EXISTS horaires_type       TEXT,
  ADD COLUMN IF NOT EXISTS horaires_details    TEXT,
  ADD COLUMN IF NOT EXISTS horaires_roulement  TEXT,
  ADD COLUMN IF NOT EXISTS astreintes          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS salaire_primes      JSONB,
  ADD COLUMN IF NOT EXISTS salaire_avantages   JSONB,
  ADD COLUMN IF NOT EXISTS formation_lieu      TEXT,
  ADD COLUMN IF NOT EXISTS formation_contenu   JSONB,
  ADD COLUMN IF NOT EXISTS profil_ideal        JSONB,
  ADD COLUMN IF NOT EXISTS metiers_proches     JSONB,
  ADD COLUMN IF NOT EXISTS accroche            TEXT,
  ADD COLUMN IF NOT EXISTS emoji               VARCHAR(10);


-- ============================================================
-- PARTIE 2 : Ajout des 3 métiers manquants en base
-- ============================================================

INSERT INTO metiers (
  slug, name, category, accroche, emoji,
  short_desc, full_desc,
  missions, avantages, contraintes, qualites,
  salaire_min, salaire_max,
  formation_duree, evolution
) VALUES

-- ────────────────────────────────────────
-- AGENT DE VENTE
-- ────────────────────────────────────────
(
  'agent-vente',
  'Agent de Vente Ferroviaire',
  'commercial',
  'Le premier contact du voyageur avec le réseau. Il vend, informe, oriente.',
  '🎟️',
  'Vendre et informer en gare ou en boutique ferroviaire, gérer les réclamations et orienter les voyageurs.',
  'L''agent de vente travaille en gare ou en boutique ferroviaire. Il renseigne les voyageurs sur les offres, vend les titres de transport, gère les échanges et remboursements, et oriente les clients. Il est souvent en première ligne lors des perturbations, quand les voyageurs sont stressés, en retard ou mécontents.',
  '["Vendre et émettre des titres de transport","Informer les voyageurs sur les offres et itinéraires","Gérer les échanges, remboursements et réclamations","Orienter et accompagner les voyageurs à mobilité réduite","Participer à la gestion des flux lors des perturbations","Tenir sa caisse et assurer la traçabilité des transactions","Vendre des services additionnels (abonnements, cartes)"]'::JSONB,
  '["Métier de contact humain varié","Travail en équipe solidaire","Horaires plus prévisibles que la conduite ou la circulation","Avantages transport entreprise","Formation aux outils de vente","Passerelle vers des évolutions commerciales"]'::JSONB,
  '["Debout ou semi-debout prolongé","Pression lors des perturbations","Objectifs commerciaux à atteindre","Gestion quotidienne de l''insatisfaction","Week-ends et jours fériés travaillés"]'::JSONB,
  '["Sens commercial","Patience","Résistance au stress","Rigueur administrative","Adaptabilité"]'::JSONB,
  1650, 2500,
  '2 à 4 mois de formation interne',
  'Référent technique vente, Manager de boutique, Poste au siège commercial'
),

-- ────────────────────────────────────────
-- AGENT D'ESCALE
-- ────────────────────────────────────────
(
  'agent-escale',
  'Agent d''Escale / Agent de Gare',
  'commercial',
  'Le pivot de la gare. Il fait tourner les opérations et assure que chaque voyageur embarque.',
  '🏢',
  'Assurer les opérations en gare : gestion des quais, information voyageurs, coordination des départs et arrivées, assistance aux PMR.',
  'L''agent d''escale assure les opérations en gare : gestion des quais, information voyageurs, coordination des départs et arrivées, assistance aux personnes à mobilité réduite (PMR), gestion des situations perturbées. Il est le chef d''orchestre terrain de la gare.',
  '["Assurer les opérations de départ et d''arrivée des trains","Accueillir et orienter les voyageurs en gare","Prendre en charge et accompagner les PMR","Coordonner avec le conducteur et le chef de bord","Gérer les perturbations et informer les voyageurs","Assurer la sûreté et la sécurité sur les quais","Collaborer avec les équipes techniques lors d''incidents"]'::JSONB,
  '["Métier de terrain dynamique","Diversité des missions","Fort sentiment d''utilité avec les PMR","Travail en équipe solidaire","Avantages transport","Évolution possible vers chef d''escale"]'::JSONB,
  '["Exposition aux intempéries sur les quais","Gestion de voyageurs mécontents lors des perturbations","Horaires très tôt ou tard","Pression physique (marche, port)","Responsabilité PMR élevée"]'::JSONB,
  '["Réactivité","Sens du service","Communication","Calme sous pression","Sens de l''organisation"]'::JSONB,
  1650, 2500,
  '2 à 4 mois de formation + tutorat en gare',
  'Chef d''escale, Responsable de gare, Formateur opérationnel'
),

-- ────────────────────────────────────────
-- TECHNICIEN VOIE / SIGNALISATION
-- ────────────────────────────────────────
(
  'technicien-voie-signalisation',
  'Technicien Voie / Signalisation',
  'infrastructure',
  'Il travaille la nuit sur des voies dangereuses pour que les trains roulent en sécurité.',
  '🛤️',
  'Entretenir et réparer les voies ferrées et équipements de signalisation, principalement de nuit lors des fenêtres travaux.',
  'Le technicien voie / signalisation travaille sur l''infrastructure ferroviaire : rails, traverses, aiguilles, appareils de voie et équipements de signalisation. Il intervient principalement la nuit dans des plages de travaux pour assurer l''entretien et la mise en service des équipements.',
  '["Entretenir et réparer les voies (rails, traverses, ballast)","Maintenir les appareils de voie (aiguilles, jonctions)","Contrôler et entretenir les équipements de signalisation","Intervenir en astreinte sur les incidents d''infrastructure","Respecter les protocoles de sécurité lors des interventions sur voie","Rédiger les rapports d''intervention","Participer aux chantiers de renouvellement de voie"]'::JSONB,
  '["Métier essentiel et concret","Fort esprit de corps","Primes de nuit et d''astreinte significatives","Emploi stable dans un secteur qui investit","Évolution vers chef de chantier ou responsable","Diversité des interventions"]'::JSONB,
  '["Travail de nuit en extérieur par tous les temps","Risque ferroviaire — proximité des voies","Port de charges lourdes","Astreintes fréquentes","Pression des délais de restitution de voie"]'::JSONB,
  '["Robustesse physique","Culture sécurité irréprochable","Esprit d''équipe","Rigueur","Résistance aux conditions difficiles"]'::JSONB,
  1900, 3200,
  'CAP/BEP/BAC PRO technique + 3 à 6 mois de formation ferroviaire',
  'Chef de chantier, Responsable de district, Expert signalisation, Ingénieur infrastructure'
)

ON CONFLICT (slug) DO UPDATE SET
  name       = EXCLUDED.name,
  accroche   = EXCLUDED.accroche,
  emoji      = EXCLUDED.emoji,
  short_desc = EXCLUDED.short_desc,
  full_desc  = EXCLUDED.full_desc;


-- ============================================================
-- PARTIE 3 : Mise à jour des emojis et accroches pour les métiers existants
-- ============================================================

UPDATE metiers SET
  emoji = '🚆',
  accroche = 'Le maître à bord de la cabine. Seul responsable de son train, garant de la sécurité de tous.'
WHERE slug = 'conducteur-de-train';

UPDATE metiers SET
  emoji = '🔀',
  accroche = 'Le chef d''orchestre invisible. Il n''est pas dans le train, mais c''est lui qui décide où il va.'
WHERE slug = 'agent-circulation';

UPDATE metiers SET
  emoji = '🎫',
  accroche = 'L''ambassadeur du voyage. Premier contact, dernier recours. Il doit tout gérer avec le sourire.'
WHERE slug = 'controleur-train';

UPDATE metiers SET
  emoji = '🔧',
  accroche = 'Les trains partent parce qu''ils ont travaillé la nuit. Ils sont les garants invisibles de la sécurité.'
WHERE slug = 'technicien-maintenance';


-- ============================================================
-- PARTIE 4 : Ajout des questions de compatibilité supplémentaires
-- (Dimensions mobilite et relation_client avec une question chacune)
-- ============================================================

-- Note : les 14 questions existantes couvrent déjà les 8 dimensions.
-- Cette section est réservée pour ajout futur de questions supplémentaires.
-- Les questions actuelles sont suffisantes pour le MVP V1.


-- ============================================================
-- PARTIE 5 : Vue utile pour le frontend
-- ============================================================

CREATE OR REPLACE VIEW metiers_summary AS
SELECT
  slug,
  name,
  category,
  COALESCE(emoji, '🚆') as emoji,
  COALESCE(accroche, short_desc) as accroche,
  short_desc,
  salaire_min,
  salaire_max,
  formation_duree,
  COALESCE(horaires_type, 'Travail posté') as horaires_type
FROM metiers
ORDER BY
  CASE category
    WHEN 'conduite' THEN 1
    WHEN 'circulation' THEN 2
    WHEN 'commercial' THEN 3
    WHEN 'maintenance' THEN 4
    WHEN 'infrastructure' THEN 5
    ELSE 6
  END,
  name;

-- Accès lecture pour les utilisateurs authentifiés
GRANT SELECT ON metiers_summary TO authenticated;
GRANT SELECT ON metiers_summary TO anon;
