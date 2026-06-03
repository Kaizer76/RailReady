-- ============================================================
-- RAILREADY — Migration 008 : Ajout valeurs ENUM metier_category
--
-- ⚠️  CONTRAINTE PostgreSQL CRITIQUE :
--     ALTER TYPE ... ADD VALUE ne peut pas être utilisé dans la même
--     transaction que les INSERT qui utilisent la nouvelle valeur.
--     Cette migration DOIT être committée AVANT d'exécuter 009.
--
-- ORDRE : 007 → [commit] → 008 → [commit] → 009
--
-- Dans Supabase SQL Editor : exécuter ce fichier seul, puis 009 séparément.
-- ============================================================

-- Ajouter 'commercial' à l'ENUM metier_category
-- IF NOT EXISTS évite l'erreur si déjà présent (idempotent)
ALTER TYPE metier_category ADD VALUE IF NOT EXISTS 'commercial';

-- Ajouter 'infrastructure' à l'ENUM metier_category
ALTER TYPE metier_category ADD VALUE IF NOT EXISTS 'infrastructure';

-- ============================================================
-- Note : pas de COMMIT explicite nécessaire dans Supabase SQL Editor.
-- Chaque "Run" est une transaction auto-committée.
-- Exécuter 009 dans un RUN SÉPARÉ après ce fichier.
-- ============================================================
