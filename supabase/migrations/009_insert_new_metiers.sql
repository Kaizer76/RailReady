-- ============================================================
-- RAILREADY — Migration 009 : INSERT des 3 métiers manquants
--
-- ⚠️  PRÉREQUIS : Migration 008 doit avoir été exécutée ET committée
--     avant cette migration. Les valeurs 'commercial' et 'infrastructure'
--     doivent être présentes dans l'ENUM metier_category.
--
-- Vérification préalable (optionnelle) :
--   SELECT enumlabel FROM pg_enum
--   JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
--   WHERE pg_type.typname = 'metier_category';
--   → Doit lister 'commercial' et 'infrastructure'
-- ============================================================

-- Vérification de précondition : s'assurer que les valeurs ENUM existent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'metier_category' AND e.enumlabel = 'commercial'
  ) THEN
    RAISE EXCEPTION '009 — Prérequis non satisfait : valeur ''commercial'' absente de l''ENUM metier_category. Exécuter 008 d''abord.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'metier_category' AND e.enumlabel = 'infrastructure'
  ) THEN
    RAISE EXCEPTION '009 — Prérequis non satisfait : valeur ''infrastructure'' absente de l''ENUM metier_category. Exécuter 008 d''abord.';
  END IF;
END $$;


-- ============================================================
-- INSERT des 3 métiers avec ON CONFLICT DO UPDATE (idempotent)
-- ============================================================

INSERT INTO metiers (
  slug, name, category, short_desc, full_desc,
  missions, avantages, contraintes, qualites,
  salaire_min, salaire_max, formation_duree, evolution, is_active
) VALUES

-- ────────────────────────────────────────
-- Agent de Vente
-- ────────────────────────────────────────
(
  'agent-vente',
  'Agent de Vente Ferroviaire',
  'commercial',
  'Vendre et informer en gare : titres de transport, offres tarifaires, gestion des réclamations.',
  'L''agent de vente travaille en gare ou boutique ferroviaire. Il renseigne et oriente les voyageurs, vend les titres de transport, gère les échanges et réclamations. Premier interlocuteur lors des perturbations, il doit allier sens commercial et résistance au stress relationnel.',
  '["Vendre et émettre des titres de transport (guichet, mobile)","Informer les voyageurs sur les offres, tarifs et itinéraires","Gérer les échanges, remboursements et réclamations","Orienter les voyageurs à mobilité réduite ou en difficulté","Tenir la caisse et assurer la traçabilité des transactions","Vendre des services additionnels (abonnements, cartes de fidélité)","Participer à la gestion des flux lors des perturbations"]'::JSONB,
  '["Métier de contact humain varié","Travail en équipe avec ambiance solidaire","Horaires moins décalés que la conduite ou circulation","Avantages transport entreprise","Formation aux outils de vente","Évolutions commerciales possibles"]'::JSONB,
  '["Position debout ou semi-debout prolongée","Pression lors des perturbations — voyageurs mécontents","Objectifs commerciaux à atteindre","Gestion quotidienne de l''insatisfaction","Week-ends et certains jours fériés travaillés"]'::JSONB,
  '["Sens commercial","Patience","Résistance au stress","Rigueur administrative","Adaptabilité aux outils numériques"]'::JSONB,
  1650, 2500,
  '2 à 4 mois de formation interne',
  'Référent technique vente, Manager de boutique, Poste au siège commercial',
  true
),

-- ────────────────────────────────────────
-- Agent d''Escale
-- ────────────────────────────────────────
(
  'agent-escale',
  'Agent d''Escale / Agent de Gare',
  'commercial',
  'Assurer les opérations en gare : quais, information voyageurs, PMR, coordination des départs.',
  'L''agent d''escale assure les opérations terrain en gare. Coordination des départs et arrivées, assistance aux personnes à mobilité réduite (PMR), gestion des perturbations, information voyageurs. En gare de taille intermédiaire, le poste est souvent polycompétent (escale + vente) — une réalité à anticiper lors de la candidature.',
  '["Assurer les opérations de départ et d''arrivée des trains sur les quais","Accueillir, informer et orienter les voyageurs en gare","Prendre en charge et accompagner les PMR et groupes","Coordonner avec le conducteur et le chef de bord","Effectuer les visites à l''arrivée et avant départ des rames","Gérer les perturbations et informer les voyageurs en temps réel","Assurer la sûreté et la sécurité sur les quais, veille incendie","Dans les postes polycompétents : assurer aussi la vente de titres en mobilité"]'::JSONB,
  '["Métier de terrain dynamique — pas de bureau fixe","Diversité réelle des missions au quotidien","Fort sentiment d''utilité avec les PMR","Travail en équipe solidaire","Avantages transport pour soi et sa famille","Évolution vers chef d''escale ou responsable de gare"]'::JSONB,
  '["Exposition aux intempéries sur les quais","Gestion de voyageurs mécontents lors des perturbations","Horaires tôt le matin ou tard le soir","Charge physique (marche, port)","Responsabilité PMR non négociable"]'::JSONB,
  '["Réactivité et sens de l''organisation","Sens du service et de l''aide à autrui","Communication claire sous pression","Calme en situation de perturbation","Adaptabilité aux outils numériques métier"]'::JSONB,
  1650, 2500,
  '2 à 4 mois de formation interne + tutorat en gare',
  'Chef d''escale, Responsable de gare, Formateur opérationnel',
  true
),

-- ────────────────────────────────────────
-- Technicien Voie / Signalisation
-- ────────────────────────────────────────
(
  'technicien-voie-signalisation',
  'Technicien Voie / Signalisation',
  'infrastructure',
  'Entretenir et réparer les voies ferrées et équipements de signalisation, principalement de nuit.',
  'Le technicien voie/signalisation intervient sur l''infrastructure ferroviaire : rails, traverses, aiguilles, appareils de voie, et équipements de signalisation. Il travaille principalement la nuit lors des fenêtres de travaux (interruptions de trafic). Métier physique, en extérieur, avec une culture sécurité absolue et non négociable.',
  '["Entretenir et réparer les voies (rails, traverses, ballast)","Maintenir les appareils de voie (aiguilles, jonctions)","Contrôler et entretenir les équipements de signalisation","Intervenir en astreinte sur les incidents d''infrastructure","Respecter les protocoles de sécurité lors des interventions sur voie","Rédiger les rapports d''intervention","Participer aux chantiers de renouvellement de voie"]'::JSONB,
  '["Métier essentiel et concret — on voit le résultat de son travail","Fort esprit de corps de métier","Primes de nuit et d''astreinte significatives","Emploi stable dans un secteur qui investit massivement","Évolution vers chef de chantier ou responsable de secteur","Diversité des interventions (voie, signalisation, génie civil)"]'::JSONB,
  '["Travail de nuit en extérieur par tous les temps","Risque ferroviaire — la proximité des voies est dangereuse","Port de charges lourdes et positions contraintes","Astreintes fréquentes pour les urgences d''infrastructure","Pression des délais de restitution de la voie au trafic"]'::JSONB,
  '["Robustesse physique et résistance aux conditions difficiles","Culture sécurité irréprochable — valeur non négociable","Esprit d''équipe et coordination sur chantier","Rigueur procédurale absolue","Adaptabilité aux conditions de terrain variables"]'::JSONB,
  1900, 3200,
  'CAP/BEP technique minimum + 3 à 6 mois de formation ferroviaire spécifique',
  'Chef de chantier, Responsable de district/secteur, Expert technique signalisation',
  true
)

ON CONFLICT (slug) DO UPDATE SET
  name           = EXCLUDED.name,
  category       = EXCLUDED.category,
  short_desc     = EXCLUDED.short_desc,
  full_desc      = EXCLUDED.full_desc,
  missions       = EXCLUDED.missions,
  avantages      = EXCLUDED.avantages,
  contraintes    = EXCLUDED.contraintes,
  qualites       = EXCLUDED.qualites,
  salaire_min    = EXCLUDED.salaire_min,
  salaire_max    = EXCLUDED.salaire_max,
  formation_duree = EXCLUDED.formation_duree,
  evolution      = EXCLUDED.evolution,
  is_active      = EXCLUDED.is_active;


-- ============================================================
-- Vérification finale
-- ============================================================

DO $$
DECLARE
  metier_count INT;
BEGIN
  SELECT COUNT(*) INTO metier_count
  FROM metiers
  WHERE slug IN ('agent-vente', 'agent-escale', 'technicien-voie-signalisation')
    AND is_active = true;

  IF metier_count < 3 THEN
    RAISE EXCEPTION '009 — Seulement % métier(s) insérés sur 3 attendus.', metier_count;
  END IF;

  RAISE NOTICE '009 — ✅ % métiers insérés/mis à jour avec succès.', metier_count;

  SELECT COUNT(*) INTO metier_count FROM metiers WHERE is_active = true;
  RAISE NOTICE '009 — Total métiers actifs en base : %', metier_count;
END $$;
