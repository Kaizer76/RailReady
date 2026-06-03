# RAILREADY — Guide de déploiement V1 Bêta terrain
### Prêt pour partage aux collègues SNCF — Juin 2026

---

## CE QUI A ÉTÉ MODIFIÉ DANS CETTE SESSION

### Tâche 1 — Questionnaire V3 (27 questions)
**Fichier :** `src/app/(dashboard)/test-compatibilite/quiz/page.tsx`
- Remplacé les 14 questions V1 par les 27 questions V3 situationnelles
- Nouvelles dimensions : solitude, répétitivité, multitâche, travail de nuit, résistance physique, prise de décision, gestion de conflit, adaptation aux imprévus
- Suppression des questions à biais de désirabilité (sécurité, rigueur auto-déclarée)
- Chaque question a ses propres labels de réponse (pas une échelle générique)
- Durée estimée mise à jour : 10-12 minutes

**Fichier :** `src/app/(dashboard)/test-compatibilite/page.tsx`
- "14 questions" → "27 questions situationnelles"
- "5 minutes" → "10-12 minutes"
- Liste des dimensions mise à jour (13 dimensions V3)

### Tâche 2 — Fiches métiers nettoyées
**Fichier :** `src/data/metiers.ts`
- Suppression complète de toutes les sections `evolutions` (7 métiers)
- Suppression des mentions d'évolution de carrière dans les avantages
- Interface `Evolution` supprimée
- Les fiches restent factuelles, neutres, réalistes

**Fichier :** `src/app/(dashboard)/metiers/[slug]/page.tsx`
- Section "📈 Évolutions possibles" supprimée de l'affichage

### Tâche 3 — Système de feedback bêta
**Fichier :** `src/components/feedback/BetaFeedbackModal.tsx` (NOUVEAU)
- Modal 2 étapes : note + 5 questions ciblées + commentaire libre
- Q1 : Cohérence du résultat (oui/partiellement/non)
- Q2 : Informations inexactes (texte libre)
- Q3 : Informations manquantes (texte libre)
- Q4 : Métier actuel ou visé (liste + champ libre)
- Q5 : Accord pour être recontacté (checkbox)
- Commentaire libre obligatoire
- Intégré dans : résultats test, fin d'entretien IA, Mentor IA (après 5 échanges)

**Fichier :** `src/app/api/feedback/beta/route.ts` (NOUVEAU)
- POST : sauvegarde en base `beta_feedbacks`
- GET : lecture pour admin (filtrable par module)

### Tâche 4 — Base de données
**Fichier :** `supabase/migrations/010_beta_feedbacks.sql` (NOUVEAU)
- Table `beta_feedbacks` avec tous les champs requis
- RLS : insert pour tous authentifiés, lecture propriétaire + service_role
- Vues admin : `v_beta_stats` (par module) + `v_beta_stats_global`
- Index sur created_at, module, note

### Tâche 5 — Bannière bêta
**Fichier :** `src/components/layout/BetaBanner.tsx` (NOUVEAU)
- Texte : "Version bêta — Certaines informations peuvent évoluer grâce aux retours des cheminots et candidats."
- Dismissable (bouton ×)
- Affichée sur toutes les pages dashboard

**Fichier :** `src/app/(dashboard)/layout.tsx`
- Import et affichage de `BetaBanner` entre la navbar mobile et le contenu

### Tâche 6 — Dashboard admin
**Fichier :** `src/app/(dashboard)/admin/page.tsx` (NOUVEAU)
- Visible uniquement pour l'email fondateur (`saidanib76620@gmail.com`)
- Lien dans la Sidebar uniquement pour cet email
- Statistiques : total feedbacks, note moyenne, demandes de recontact
- Filtre par module
- Affichage de chaque feedback avec détails complets
- Export CSV (Excel compatible)

**Fichier :** `src/components/layout/Sidebar.tsx`
- Ajout du lien "Feedbacks bêta" conditionnel à l'email fondateur

---

## ÉTAPES DE DÉPLOIEMENT

### Étape 1 — Supabase : exécuter la migration 010

Dans le SQL Editor de votre projet Supabase, exécuter :
```
supabase/migrations/010_beta_feedbacks.sql
```

Vérifier que la table `beta_feedbacks` est créée :
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'beta_feedbacks';
```

### Étape 2 — Variables d'environnement Vercel

Vérifier que ces variables sont configurées dans Vercel > Settings > Environment Variables :
```
NEXT_PUBLIC_SUPABASE_URL       ← URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY  ← Clé anon publique
SUPABASE_SERVICE_ROLE_KEY      ← Clé service role (secrète)
OPENAI_API_KEY                 ← Clé OpenAI GPT-4o
NEXT_PUBLIC_APP_URL            ← https://votre-domaine.vercel.app
```

### Étape 3 — Déploiement Vercel

```bash
# Option A : Via GitHub (recommandé)
git add .
git commit -m "V1 Bêta — 27 questions V3, feedback terrain, bannière bêta"
git push origin main
# → Vercel déploie automatiquement

# Option B : Via CLI Vercel
npx vercel --prod
```

### Étape 4 — Vérifications avant partage

Ouvrir l'URL de production et vérifier :

- [ ] La page d'accueil s'affiche correctement
- [ ] L'inscription fonctionne (créer un compte test)
- [ ] La bannière bêta s'affiche sur le dashboard
- [ ] Le test de compatibilité affiche bien "27 questions"
- [ ] Les 27 questions ont des labels de réponse propres (pas "Pas du tout d'accord")
- [ ] Les fiches métiers n'ont plus de section "Évolutions possibles"
- [ ] Le modal feedback bêta s'ouvre après le test de compatibilité
- [ ] Le feedback s'enregistre (vérifier dans `beta_feedbacks` Supabase)
- [ ] Le dashboard admin (`/admin`) est visible avec votre email
- [ ] L'export CSV fonctionne

### Étape 5 — Paramétrage Supabase Auth

Dans Supabase > Authentication > Settings :
- **Email Confirmations** : désactiver pour la bêta (permet la connexion directe)
- **Site URL** : mettre votre URL Vercel (ex: https://railready-xxx.vercel.app)
- **Redirect URLs** : ajouter votre URL Vercel + `http://localhost:3000`

---

## MESSAGE DE PARTAGE AUX COLLÈGUES

Voici un message type à envoyer à vos collègues pour les tests terrain :

---

Salut [prénom],

Je développe une plateforme pour aider les candidats à se préparer aux métiers ferroviaires — **RailReady**.

C'est en version bêta et j'ai besoin de retours terrain d'agents SNCF pour valider que les informations sont réalistes.

🔗 Lien : [URL à remplir]

Tu peux :
- Faire le **test de compatibilité** (27 questions, 10 min)
- Explorer les **fiches métiers** de ton poste
- Donner ton avis via le bouton feedback

Ton avis m'aidera à corriger ce qui ne correspond pas à la réalité du terrain.

Merci d'avance !

---

## SUIVI DES FEEDBACKS

Une fois les premiers feedbacks reçus, les consulter sur `/admin` :
1. Note moyenne globale
2. Feedbacks "Résultat non cohérent" à traiter en priorité
3. Section "Info inexacte" → corriger dans `src/data/metiers.ts`
4. Section "Info manquante" → planifier pour V2
5. Personnes à recontacter → les rappeler pour entretien qualitatif

---

## FICHIERS MODIFIÉS — RÉCAPITULATIF COMPLET

| Fichier | Action | Impact |
|---|---|---|
| `quiz/page.tsx` | MODIFIÉ | 27 questions V3 |
| `test-compatibilite/page.tsx` | MODIFIÉ | Textes mis à jour |
| `src/data/metiers.ts` | MODIFIÉ | Sections evolutions supprimées |
| `metiers/[slug]/page.tsx` | MODIFIÉ | Section évolutions supprimée |
| `BetaFeedbackModal.tsx` | CRÉÉ | Modal feedback complet |
| `BetaBanner.tsx` | CRÉÉ | Bannière version bêta |
| `admin/page.tsx` | CRÉÉ | Dashboard feedbacks |
| `api/feedback/beta/route.ts` | CRÉÉ | API feedback |
| `(dashboard)/layout.tsx` | MODIFIÉ | Bannière ajoutée |
| `Sidebar.tsx` | MODIFIÉ | Lien admin conditionnel |
| `mentor/page.tsx` | MODIFIÉ | BetaFeedbackModal intégré |
| `entretien/session/page.tsx` | MODIFIÉ | BetaFeedbackModal intégré |
| `resultats/page.tsx` | MODIFIÉ | BetaFeedbackModal intégré |
| `010_beta_feedbacks.sql` | CRÉÉ | Table + vues Supabase |

---

*Rapport de déploiement — Juin 2026 — RailReady V1 Bêta*
