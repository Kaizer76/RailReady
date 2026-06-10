-- ============================================================
-- Migration 014 — Harmonisation metier_vise : libellés → slugs
-- Source unique de vérité : src/data/metiers.ts (slugs)
-- Couvre toutes les variantes de libellés historiquement utilisées
-- (ancien formulaire Profil + variantes de casse)
-- ============================================================

UPDATE profiles SET metier_vise = 'conducteur-de-train'
WHERE metier_vise IN ('Conducteur de train', 'Conducteur de Train');

UPDATE profiles SET metier_vise = 'agent-circulation'
WHERE metier_vise IN ('Agent circulation', 'Agent Circulation');

UPDATE profiles SET metier_vise = 'controleur-asct'
WHERE metier_vise IN (
  'Contrôleur / ASCT', 'Contrôleur', 'ASCT / Contrôleur',
  'Agent Commercial Trains (ASCT)', 'Contrôleur / Agent Commercial Trains (ASCT)'
);

UPDATE profiles SET metier_vise = 'agent-vente'
WHERE metier_vise IN ('Agent de Vente', 'Agent de vente', 'Agent de Vente Ferroviaire');

UPDATE profiles SET metier_vise = 'agent-escale'
WHERE metier_vise IN ('Agent Escale', 'Agent d''Escale', 'Agent d''Escale / Agent de Gare');

UPDATE profiles SET metier_vise = 'technicien-maintenance'
WHERE metier_vise IN ('Technicien Maintenance', 'Technicien de Maintenance Ferroviaire');

UPDATE profiles SET metier_vise = 'technicien-voie-signalisation'
WHERE metier_vise IN ('Agent Voie / Signalisation', 'Technicien Voie / Signalisation');

-- Sécurité : toute valeur restante qui n'est pas un slug connu est remise à NULL
-- (évite des comparaisons cassées silencieuses dans l'app)
UPDATE profiles SET metier_vise = NULL
WHERE metier_vise IS NOT NULL
  AND metier_vise NOT IN (
    'conducteur-de-train', 'agent-circulation', 'controleur-asct',
    'agent-vente', 'agent-escale', 'technicien-maintenance',
    'technicien-voie-signalisation'
  );
