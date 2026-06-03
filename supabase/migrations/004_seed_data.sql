-- ============================================================
-- RAILREADY — Migration 004: Données initiales
-- Métiers ferroviaires + Test de compatibilité global
-- ============================================================

-- ============================================================
-- MÉTIERS FERROVIAIRES
-- ============================================================

INSERT INTO metiers (slug, name, category, short_desc, full_desc, missions, avantages, contraintes, qualites, salaire_min, salaire_max, formation_duree, evolution) VALUES

('conducteur-de-train', 'Conducteur de Train', 'conduite',
'Pilotez des trains de voyageurs ou de marchandises en toute sécurité sur le réseau ferroviaire.',
'Le conducteur de train est le garant de la sécurité des voyageurs et du bon acheminement des trains. Il assure la conduite des engins de traction (TGV, TER, Intercités, fret) sur des lignes dédiées, en respectant les règles de sécurité ferroviaire et les horaires. C''est un métier exigeant alliant technique, responsabilité et gestion du stress.',
'["Préparer et vérifier la locomotive avant départ","Conduire selon les signaux et la réglementation","Gérer les incidents techniques en autonomie","Communiquer avec le Poste de Commandement","Rédiger des rapports de conduite"]'::JSONB,
'["Emploi stable et sécurisé","Avantages SNCF (transport gratuit, aide logement)","Prime de roulement significative","Autonomie dans son travail","Fierté du métier","Retraite anticipée possible"]'::JSONB,
'["Horaires décalés (nuits, week-ends, jours fériés)","Isolement en cabine","Forte responsabilité psychologique","Risque d''incident sur voie","Mobilité géographique imposée","Remise en cause médicale régulière"]'::JSONB,
'["Sang-froid et maîtrise du stress","Rigueur et précision","Sens des responsabilités","Bonne condition physique et psychologique","Concentration prolongée","Autonomie"]'::JSONB,
2200, 3500,
'6 à 12 mois (formation SNCF)',
'Instructeur, Agent de formation, Poste RH, Management opérationnel'),

('agent-circulation', 'Agent Circulation', 'circulation',
'Réglez la circulation des trains depuis les postes d''aiguillage et centres de commandement.',
'L''agent circulation (ou régulateur) est le chef d''orchestre du réseau ferroviaire. Il gère les circulations en temps réel depuis un poste d''aiguillage ou un Poste de Commandement Centralisé (PCC). Il garantit la fluidité du trafic, gère les incidents et assure la coordination entre les différents acteurs de la chaîne ferroviaire.',
'["Gérer les aiguillages et signaux","Coordonner les circulations en temps réel","Gérer les perturbations et incidents","Communiquer avec les conducteurs et équipes","Respecter les procédures de sécurité","Tenir les registres de circulation"]'::JSONB,
'["Poste stratégique et valorisant","Travail en équipe","Bonne rémunération","Formation solide fournie","Évolutions vers management possible","Sens aigu des responsabilités développé"]'::JSONB,
'["Travail posté (3x8, nuits, WE)","Stress lié aux décisions rapides","Concentration permanente","Environnement technique exigeant","Responsabilité sécurité élevée"]'::JSONB,
'["Réactivité et décision rapide","Gestion du stress","Rigueur procédurale","Communication claire","Vision spatiale du réseau","Polyvalence"]'::JSONB,
2100, 3200,
'6 à 9 mois (formation interne)',
'Chef de salle, Régulateur senior, Manager d''équipe, Directeur de ligne'),

('controleur-train', 'Contrôleur / Agent Commercial Trains', 'controle',
'Accueillez et accompagnez les voyageurs, gérez la relation client à bord des trains.',
'L''agent commercial trains (anciennement contrôleur) est l''ambassadeur de la SNCF auprès des voyageurs. Il assure l''accueil, l''information, le contrôle des titres de transport et la gestion des situations difficiles à bord. Il est le premier recours en cas d''incident ou de litige et représente l''image de l''entreprise.',
'["Accueillir et informer les voyageurs","Contrôler les titres de transport","Gérer les conflits et situations difficiles","Assurer la sûreté à bord","Vendre et régulariser les titres","Coordonner avec le conducteur","Gérer les retards et annonces"]'::JSONB,
'["Contact humain varié et enrichissant","Connaissance du réseau","Avantages SNCF","Dynamisme du poste","Sens du service développé","Possibilités d''évolution"]'::JSONB,
'["Confrontation fréquente aux fraudeurs","Gestion de l''agressivité","Horaires décalés","Debout toute la journée","Solitude relative à bord","Responsabilité sûreté"]'::JSONB,
'["Aisance relationnelle","Sang-froid face aux conflits","Empathie et diplomatie","Autorité naturelle","Résistance physique","Sens du service client"]'::JSONB,
1900, 2800,
'3 à 6 mois',
'Chef de bord, Manager station, Formateur, Poste commercial'),

('technicien-maintenance', 'Technicien de Maintenance Ferroviaire', 'maintenance',
'Maintenez et réparez les trains et infrastructures pour garantir la sécurité du réseau.',
'Le technicien de maintenance ferroviaire assure l''entretien préventif et curatif du matériel roulant (locomotives, wagons, TGV) et/ou des infrastructures (voies, caténaires, signalisation). Il travaille souvent de nuit pour ne pas interrompre le trafic. C''est un métier très technique qui requiert des compétences en mécanique, électrotechnique et électronique.',
'["Effectuer les visites d''entretien périodiques","Diagnostiquer les pannes","Réaliser les réparations","Rédiger les rapports d''intervention","Respecter les procédures de sécurité","Former les équipes junior"]'::JSONB,
'["Poste technique valorisant","Travail en équipe soudée","Salaire attractif avec primes de nuit","Équipements de pointe","Formation continue","Stabilité de l''emploi"]'::JSONB,
'["Travail en horaires décalés (nuits++)","Port de charges et contraintes physiques","Environnement bruyant et exposé","Astreintes possibles","Zones de travail contraignantes"]'::JSONB,
'["Compétences techniques (méca/élec)","Rigueur et méthode","Travail en équipe","Réactivité face aux pannes","Résistance physique","Respect strict des procédures"]'::JSONB,
2300, 3800,
'BTS / BAC PRO + formation interne 3-6 mois',
'Chef d''équipe, Responsable atelier, Ingénieur méthodes, Expert technique');


-- ============================================================
-- TEST DE COMPATIBILITÉ GLOBAL
-- ============================================================

INSERT INTO compatibility_tests (id, name, description, is_global)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Test de compatibilité métiers ferroviaires',
  'Évaluez votre compatibilité avec les métiers du secteur ferroviaire sur 7 dimensions clés.',
  true
);

-- ============================================================
-- QUESTIONS DU TEST (sur une échelle de 1 à 5)
-- ============================================================

INSERT INTO quiz_questions (test_id, question_text, question_type, dimension, weight, order_index) VALUES

-- Dimension: horaires_decales
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je suis à l''aise pour travailler la nuit, le week-end ou les jours fériés de manière régulière.',
'scale', 'horaires_decales', 1.5, 1),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Les horaires irréguliers n''ont pas d''impact négatif majeur sur ma vie personnelle et familiale.',
'scale', 'horaires_decales', 1.2, 2),

-- Dimension: gestion_stress
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Quand une situation d''urgence survient, je reste calme et je prends des décisions rapidement.',
'scale', 'gestion_stress', 1.5, 3),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je supporte bien la pression liée à la responsabilité de la sécurité des autres.',
'scale', 'gestion_stress', 1.3, 4),

-- Dimension: autonomie
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je me sens à l''aise pour travailler seul(e) pendant de longues périodes sans supervision directe.',
'scale', 'autonomie', 1.0, 5),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je prends facilement des initiatives et des décisions de manière indépendante.',
'scale', 'autonomie', 1.0, 6),

-- Dimension: rigueur
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je respecte scrupuleusement les procédures et règles, même quand cela semble fastidieux.',
'scale', 'rigueur', 1.4, 7),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'La précision et l''attention aux détails sont des qualités naturelles chez moi.',
'scale', 'rigueur', 1.2, 8),

-- Dimension: mobilite
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je suis prêt(e) à changer de lieu de travail ou de résidence si le poste l''exige.',
'scale', 'mobilite', 1.0, 9),

-- Dimension: relation_client
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je reste courtois(e) et professionnel(le) même face à des personnes agressives ou difficiles.',
'scale', 'relation_client', 1.1, 10),

-- Dimension: aptitude_technique
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'J''apprécie apprendre et comprendre le fonctionnement technique des équipements.',
'scale', 'aptitude_technique', 1.0, 11),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je n''ai pas de difficulté à assimiler des procédures complexes ou des réglementations détaillées.',
'scale', 'aptitude_technique', 1.0, 12),

-- Dimension: engagement_securite
('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'La sécurité est pour moi une valeur non négociable, même sous pression de délai ou d''imprévu.',
'scale', 'engagement_securite', 2.0, 13),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
'Je comprends que dans le ferroviaire, une erreur peut avoir des conséquences graves et j''y suis préparé(e) psychologiquement.',
'scale', 'engagement_securite', 1.5, 14);
