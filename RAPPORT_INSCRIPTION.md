# RAILREADY — Rapport : Correction de l'erreur d'inscription
### Date : Juin 2026 | Statut : Corrigé

---

## CAUSES IDENTIFIÉES

### CAUSE #1 — CRITIQUE : RLS bloque l'INSERT dans `subscriptions`
**Fichier :** `supabase/migrations/002_rls_policies.sql` ligne 48  
**Problème :** La politique INSERT exigeait `auth.role() = 'service_role'`. Dans le contexte d'un trigger `AFTER INSERT ON auth.users`, aucun JWT n'est encore établi : `auth.role()` retourne NULL, pas `'service_role'`. En Supabase, le rôle `postgres` a `NOBYPASSRLS` activé par défaut — les fonctions `SECURITY DEFINER` respectent toujours les politiques RLS.  
**Résultat :** L'INSERT dans `subscriptions` échoue → le trigger échoue → Supabase Auth retourne HTTP 500.

### CAUSE #2 — CRITIQUE : Aucune politique INSERT sur `profiles`
**Fichier :** `supabase/migrations/002_rls_policies.sql`  
**Problème :** RLS est activé sur `profiles` (ligne 6) mais seules les politiques SELECT et UPDATE sont définies. Avec RLS sans politique INSERT, tout INSERT est bloqué.  
**Résultat :** Le premier INSERT du trigger (profil) échoue avant même d'atteindre subscriptions.

### CAUSE #3 — CRITIQUE : Aucune politique INSERT sur `user_stats`
**Fichier :** `supabase/migrations/002_rls_policies.sql`  
**Problème :** Même situation — RLS activé, uniquement SELECT et UPDATE définis, pas d'INSERT.  
**Résultat :** Si profiles et subscriptions passaient, user_stats bloquerait à son tour.

### CAUSE #4 — GRAVE : Schéma `ai_sessions` incompatible avec le code
**Fichiers :** `migrations/001_init_schema.sql` vs `migrations/006_feedback_sessions.sql`  
**Problème :**  
- Migration 001 a créé `ai_sessions` avec `session_type session_type NOT NULL` (ENUM sans valeur par défaut) et `is_completed BOOLEAN`.  
- Migration 006 définissait un autre schéma (`agent_type`, `poste`, `niveau`, `status`) mais avec `CREATE TABLE IF NOT EXISTS` — donc ignorée, la table gardant le schéma de 001.  
- Le code API utilise les colonnes de 006 (qui n'existent pas) → erreur à chaque création de session d'entretien.

### CAUSE #5 — GRAVE : ENUM `metier_category` incomplet
**Fichier :** `supabase/migrations/005_new_metiers_v1.sql`  
**Problème :** L'ENUM de migration 001 contient : `('conduite','circulation','controle','maintenance','gestion')`. Migration 005 insère des métiers avec `category='commercial'` et `category='infrastructure'` — valeurs absentes → migration 005 échoue complètement, les 3 métiers ne sont pas en base.

### CAUSE #6 — FONCTIONNELLE : Prénom non enregistré
**Fichiers :** `register/page.tsx` + `migrations/001_init_schema.sql`  
**Problème :** Le formulaire envoie `data: { prenom: '...' }` mais `handle_new_user()` lisait uniquement `raw_user_meta_data->>'full_name'` → le prénom était toujours NULL dans `profiles.full_name`.

---

## CORRECTIONS APPORTÉES

### Fichier 1 — `supabase/migrations/007_fix_rls_and_schema.sql` (NOUVEAU)

Ce fichier corrige toutes les causes dans cet ordre :

**Fix #1, #2, #3 — Politiques RLS manquantes**
```sql
-- profiles: INSERT autorisé (FK vers auth.users protège l'intégrité)
CREATE POLICY "profiles: insert par trigger"
  ON profiles FOR INSERT WITH CHECK (true);

-- subscriptions: INSERT autorisé par trigger (auth.uid() IS NULL) + service_role
DROP POLICY "subscriptions: insert service_role only";
CREATE POLICY "subscriptions: insert par trigger ou service"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role' OR auth.uid() IS NULL);

-- user_stats: INSERT autorisé
CREATE POLICY "user_stats: insert par trigger"
  ON user_stats FOR INSERT WITH CHECK (true);
```

**Fix #4 — Schéma ai_sessions aligné avec le code**
```sql
ALTER TABLE ai_sessions ALTER COLUMN session_type DROP NOT NULL;
ALTER TABLE ai_sessions
  ADD COLUMN IF NOT EXISTS agent_type TEXT NOT NULL DEFAULT 'recrutement',
  ADD COLUMN IF NOT EXISTS poste TEXT,
  ADD COLUMN IF NOT EXISTS niveau TEXT DEFAULT 'debutant',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
```

**Fix #5 — ENUM + réinsertion des 3 métiers**
```sql
ALTER TYPE metier_category ADD VALUE IF NOT EXISTS 'commercial';
ALTER TYPE metier_category ADD VALUE IF NOT EXISTS 'infrastructure';
-- Puis INSERT des 3 métiers manquants avec ON CONFLICT DO UPDATE
```

**Fix #6 — handle_new_user() réécrite**
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
-- SET search_path = public (sécurité)
-- Lit prenom ET full_name avec COALESCE
-- ON CONFLICT DO NOTHING (idempotent)
-- EXCEPTION handler (ne jamais bloquer le signup)
```

---

### Fichier 2 — `src/app/(auth)/register/page.tsx` (MODIFIÉ)

**Changements :**
- `data: { prenom: form.prenom }` → `data: { prenom: form.prenom, full_name: form.prenom }` (compatibilité trigger)
- Message d'erreur générique → affiche le message Supabase réel (diagnostic en prod)
- `console.error()` avec les détails complets de l'erreur

---

## INSTRUCTIONS DE DÉPLOIEMENT

### Étape 1 — Exécuter la migration dans Supabase
Dans le SQL Editor de votre projet Supabase, exécuter en entier :
```
supabase/migrations/007_fix_rls_and_schema.sql
```

### Étape 2 — Vérification dans Supabase
Après la migration, vérifier dans l'interface :

**Authentication → Settings → Email :**
- "Enable email confirmations" → à désactiver pour la bêta (permet la connexion directe après inscription)

**Table Editor → profiles :**
- Doit être vide au départ
- Après un test d'inscription → doit contenir 1 ligne

**SQL Editor → test du trigger :**
```sql
-- Vérifier les politiques RLS sur profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Vérifier les politiques sur subscriptions
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'subscriptions';

-- Vérifier la fonction handle_new_user
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```

### Étape 3 — Test d'inscription
1. Ouvrir http://localhost:3000/register
2. Créer un compte avec un nouvel email
3. Vérifier dans Supabase :
   - `Authentication > Users` → 1 utilisateur créé
   - `Table Editor > profiles` → 1 ligne avec `full_name` = votre prénom
   - `Table Editor > subscriptions` → 1 ligne avec `plan = 'free'`
   - `Table Editor > user_stats` → 1 ligne avec les compteurs à 0

---

## RÉSULTAT ATTENDU APRÈS MIGRATION

| Étape | Avant correction | Après correction |
|---|---|---|
| signUp() | Erreur 500 | ✅ Succès |
| auth.users | Vide | ✅ 1 utilisateur |
| profiles | Vide | ✅ 1 profil (full_name = prénom) |
| subscriptions | Vide | ✅ plan = 'free', status = 'active' |
| user_stats | Vide | ✅ compteurs initialisés à 0 |
| Sessions entretien | Colonnes manquantes | ✅ Schéma aligné |
| Métiers (7) | 4 en base (3 manquants) | ✅ 7 en base |

---

## FICHIERS MODIFIÉS

| Fichier | Type | Changement |
|---|---|---|
| `supabase/migrations/007_fix_rls_and_schema.sql` | SQL nouveau | Toutes les corrections RLS + schéma |
| `src/app/(auth)/register/page.tsx` | TypeScript modifié | Logs réels + full_name dans data |
