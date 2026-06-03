# RAILREADY — Plan de refonte V2 du test de compatibilité
### Juin 2026 | Plan technique détaillé | Aucun code produit

---

## OBJECTIFS DE LA REFONTE

| Objectif | V1 actuel | V2 cible |
|---|---|---|
| Nombre de questions | 14 | 22 |
| Nombre de dimensions | 8 | 10 (+4 nouvelles, -2 fusionnées) |
| Profil Vente→Conducteur | 59% (trompeur) | **38%** (réaliste) |
| ASCT vs Escale | 85% similaires | **86%** → à affiner en V2.1 |
| Conducteur vs Circulation | 78% similaires | **62%** ✅ |
| Conducteur vs Maintenance | 72% similaires | **66%** ✅ |
| Plancher sécurité artificiel | Oui (100% pour tous) | Supprimé |
| Algorithme bilatéral | Non | Oui (3 dimensions) |

---

## PARTIE 1 — CE QUI EST CONSERVÉ

### Architecture technique : inchangée

L'architecture suivante reste identique — aucune refactorisation de couche :

```
Frontend : src/app/(dashboard)/test-compatibilite/quiz/page.tsx
           src/app/(dashboard)/test-compatibilite/resultats/page.tsx
API      : src/app/api/compatibility/score/route.ts
Base     : table quiz_questions (Supabase)
           table user_quiz_sessions
```

### Ce qui reste dans le code

- Composant `QuizQuestion` (affichage question + contexte + échelle 1-5)
- Calcul du score par dimension `computeDimensionScore()` — formule pondérée identique
- Affichage des résultats (barres, niveaux fort/moyen/vigilance, top 3 métiers)
- Sauvegarde en base `user_quiz_sessions`
- Passage des réponses via `sessionStorage`

### Ce qui change en V2

- Les 22 questions (contenu et formulation)
- Les 10 profils de dimensions métier dans `METIER_PROFILS`
- La fonction `computeMetierCompatibilite()` — ajout de l'algorithme bilatéral
- `DIMENSION_CONFIG` — ajout des 4 nouvelles dimensions
- `quiz_questions` en base de données — 8 nouvelles lignes
- Suppression de `engagement_securite` comme dimension autonome
- Suppression du champ `poidsTotal` (dead code confirmé par audit)

---

## PARTIE 2 — LES 22 QUESTIONS V2

### Vue d'ensemble

| ID | Dimension | Poids | Statut | Formulation (résumé) |
|---|---|---|---|---|
| d1 | horaires_decales | 1.8 | Reformulée | Impact des décalages sur votre vie actuelle |
| d2 | horaires_decales | 1.5 | Nouvelle | Votre rythme naturel de sommeil |
| d3 | horaires_decales | 1.2 | Nouvelle | Travailler le 25 décembre / 1er janvier |
| b1 | relation_client | 2.0 | Reformulée | Aide instinctive à un inconnu stressé |
| b2 | relation_client | 1.5 | Nouvelle | Satisfaction : service humain vs problème technique |
| b3 | relation_client | 1.5 | Reformulée | Désamorcer un client agressif |
| e1 | rigueur | 1.5 | Reformulée | Raccourci procédure sous pression de temps |
| e2 | rigueur | 1.2 | Reformulée | Règle absurde : adapter ou remonter par les voies |
| i1 | aptitude_technique | 1.3 | Conservée | Panne : comprendre soi-même ou appeler |
| i2 | aptitude_technique | 1.2 | Conservée | Assimiler un système technique complexe |
| j1 | mobilite | 1.0 | Reformulée | Affectation à 150-300 km en début de carrière |
| a1 | **solitude** | 1.8 | **NOUVELLE** | 6 heures seul(e) — ressenti à la fin |
| a2 | **solitude** | 1.5 | **NOUVELLE** | Préférence solitude vs entourage au travail |
| c1 | **mode_decision** | 2.0 | **NOUVELLE** | Décision urgente : seul ou consulter l'équipe |
| c2 | **mode_decision** | 1.5 | **NOUVELLE** | Confort d'être l'unique décideur sur des enjeux importants |
| c3 | **mode_decision** | 1.5 | **NOUVELLE** | Gestion de 4 situations simultanées en évolution rapide |
| f1 | **resistance_physique** | 1.8 | **NOUVELLE** | Travail de nuit en extérieur, froid, pluie, bruit |
| f2 | **resistance_physique** | 1.3 | **NOUVELLE** | Activité physique dans votre quotidien actuel |
| g1 | **travail_nuit** | 1.5 | **NOUVELLE** | Performance sur tâche complexe à 3h du matin |
| g2 | **travail_nuit** | 1.2 | **NOUVELLE** | Majorité des services entre 22h et 6h |
| h1 | **repetitivite** | 1.5 | **NOUVELLE** | Même route, mêmes gestes, des centaines de fois |
| h2 | **repetitivite** | 1.2 | **NOUVELLE** | Maîtrise parfaite vs variété quotidienne |

**Total : 22 questions | Poids total : 32.5 | 10 dimensions**

---

### Formulations complètes des 22 questions

#### DIMENSION D — Horaires décalés (3 questions)

**D1** *(poids 1.8 — remplace q1 "à l'aise pour travailler la nuit")*
> Travailler régulièrement la nuit, le week-end et les jours fériés aurait un impact sur votre vie actuelle :
> 1 — Très important : conjoint, enfants, contraintes personnelles fortes
> 5 — Minimal : ma situation personnelle s'y adapte facilement
>
> *Contexte : "Pensez à votre situation concrète aujourd'hui, pas à un idéal."*

**D2** *(poids 1.5 — nouvelle)*
> Votre rythme naturel de sommeil :
> 1 — Je me lève difficilement avant 8h et m'endors difficilement après minuit
> 5 — Je m'adapte facilement à n'importe quel rythme de sommeil
>
> *Contexte : "Sans jugement — certains sont naturellement du soir, d'autres du matin."*

**D3** *(poids 1.2 — nouvelle)*
> Si votre poste exige de travailler le 25 décembre ou le 1er janvier certaines années :
> 1 — C'est pour moi un frein important que j'accepterais difficilement
> 5 — C'est une contrainte que j'assume pleinement comme faisant partie du métier
>
> *Contexte : "Dans le ferroviaire, les fêtes ne suspendent pas le réseau."*

---

#### DIMENSION B — Contact humain et service (3 questions)

**B1** *(poids 2.0 — remplace q10 "courtois face aux agressifs")*
> Un inconnu visiblement stressé vous demande de l'aide dans un endroit public. Votre réaction instinctive :
> 1 — Je préfère rediriger vers quelqu'un de mieux placé pour l'aider
> 5 — Je prends naturellement le temps de comprendre et d'aider
>
> *Contexte : "Il n'y a pas de bonne ou mauvaise réponse — c'est une question de tempérament."*

**B2** *(poids 1.5 — nouvelle)*
> À la fin d'une journée de service, ce qui vous donnerait le plus de satisfaction :
> 1 — Avoir résolu un problème technique complexe ou accompli une tâche précise
> 5 — Avoir aidé ou orienté une dizaine de personnes dans leur journée
>
> *Contexte : "Les deux sont valorisants — mais lequel vous correspond vraiment ?"*

**B3** *(poids 1.5 — reformule q10)*
> Face à un client agressif qui a tort et refuse de l'admettre, votre réaction naturelle :
> 1 — Je cherche à me retirer rapidement de la situation pour éviter l'escalade
> 5 — Je maintiens le dialogue calmement jusqu'à trouver une issue
>
> *Contexte : "Les agents au contact du public font face à ces situations régulièrement."*

---

#### DIMENSION E — Rigueur procédurale (2 questions, situationnelles)

**E1** *(poids 1.5 — remplace q7 biaisée)*
> Vous êtes pressé(e) et il vous reste une vérification de routine à faire avant de terminer. Un raccourci existe, sans risque apparent. Vous :
> 1 — Utilisez le raccourci — le contexte justifie la flexibilité
> 5 — Appliquez la procédure complète — toujours, quelle que soit la pression
>
> *Contexte : "Ce scénario arrive dans tous les métiers ferroviaires."*

**E2** *(poids 1.2 — remplace q8 biaisée)*
> Une règle vous semble inadaptée dans un contexte précis. Votre réaction :
> 1 — Je l'adapte à ma façon si le bon sens le justifie clairement
> 5 — Je l'applique et remonte ma remarque par les voies officielles
>
> *Contexte : "Dans le ferroviaire, les procédures existent pour des raisons souvent invisibles depuis le terrain."*

---

#### DIMENSION I — Aptitude technique (2 questions — conservées, reformulées)

**I1** *(poids 1.3 — remplace q11)*
> Face à un équipement qui tombe en panne, votre réaction instinctive :
> 1 — J'appelle quelqu'un qui s'y connaît
> 5 — Je veux comprendre pourquoi ça ne fonctionne pas et tenter de résoudre moi-même
>
> *Contexte : "Maintenance, conduite, voie — la curiosité technique est un atout."*

**I2** *(poids 1.2 — remplace q12)*
> Apprendre le fonctionnement d'un système complexe (électronique, hydraulique, signalisation) :
> 1 — C'est laborieux — je préfère me concentrer sur l'utilisation, pas la compréhension
> 5 — C'est quelque chose que j'aborde avec curiosité
>
> *Contexte : "Pas besoin d'être ingénieur — mais l'appétence fait la différence."*

---

#### DIMENSION J — Mobilité géographique (1 question — reformulée)

**J1** *(poids 1.0 — remplace q9)*
> Si votre premier poste vous était affecté dans une ville différente de la vôtre, à 150-300 km :
> 1 — C'est un obstacle majeur que je ne pourrais pas accepter
> 5 — Je l'accepte pleinement comme une étape normale d'une carrière ferroviaire
>
> *Contexte : "Les affectations initiales ne sont pas toujours négociables."*

---

#### DIMENSION A — Rapport à la solitude (2 questions — NOUVELLES)

**A1** *(poids 1.8)*
> Vous avez passé 6 heures seul(e), sans pouvoir appeler quelqu'un ni changer d'environnement. Comment vous sentez-vous à la fin ?
> 1 — Épuisé(e) et irritable — j'avais vraiment besoin d'interaction
> 5 — Reposé(e) et efficace — ces heures m'ont appartenu
>
> *Contexte : "Un conducteur de train passe l'essentiel de son service en cabine, seul."*

**A2** *(poids 1.5)*
> Dans votre quotidien professionnel idéal, vous travailleriez :
> 1 — En équipe, dans un environnement social, toujours entouré(e)
> 5 — Principalement seul(e), avec quelques échanges ponctuels bien définis
>
> *Contexte : "Aucune des deux préférences n'est meilleure — elles correspondent à des métiers différents."*

---

#### DIMENSION C — Mode de décision et multi-tâches (3 questions — NOUVELLES)

**C1** *(poids 2.0)*
> Une décision urgente doit être prise, avec des conséquences importantes. Vous préférez :
> 1 — Consulter rapidement un collègue ou supérieur avant d'agir
> 5 — Décider seul(e) sur la base de votre analyse — l'attente a un coût
>
> *Contexte : "La conduite exige des décisions solitaires immédiates. La circulation exige coordination."*

**C2** *(poids 1.5)*
> Quelle phrase décrit le mieux votre rapport à la responsabilité ?
> 1 — Je préfère que les décisions cruciales soient prises collectivement ou validées
> 5 — Je me sens à l'aise d'être l'unique décideur sur des enjeux importants
>
> *Contexte : "Responsabilité de coordination vs responsabilité directe — deux cultures très différentes."*

**C3** *(poids 1.5)*
> Vous gérez 4 situations qui évoluent simultanément et demandent toutes de l'attention. Vous :
> 1 — Trouvez ça épuisant — je suis plus efficace en me concentrant sur une chose à la fois
> 5 — Vous sentez dans votre élément — la multi-gestion m'active et me stimule
>
> *Contexte : "Un agent circulation peut gérer 8 trains simultanément. Un conducteur : un seul."*

---

#### DIMENSION F — Résistance physique et conditions difficiles (2 questions — NOUVELLES)

**F1** *(poids 1.8)*
> Travailler régulièrement de nuit, en extérieur, dans le froid ou la pluie, sur des chantiers physiques vous semble :
> 1 — Un facteur rédhibitoire — je ne me vois pas dans ces conditions durablement
> 5 — Une condition de travail que j'accepte pleinement et pour laquelle je suis physiquement apte
>
> *Contexte : "Les techniciens voie/signalisation travaillent la nuit, en extérieur, par tous les temps."*

**F2** *(poids 1.3)*
> En dehors du travail, votre rapport à l'effort physique :
> 1 — Je préfère largement les activités sédentaires
> 5 — L'activité physique fait naturellement partie de mon quotidien
>
> *Contexte : "Porter du matériel lourd, adopter des positions contraintes pendant des heures — c'est le terrain voie."*

---

#### DIMENSION G — Travail de nuit profond (2 questions — NOUVELLES)

**G1** *(poids 1.5)*
> Votre capacité à maintenir votre performance sur une tâche complexe à 3h du matin :
> 1 — Je suis nettement moins efficace et plus sujet(te) aux erreurs
> 5 — Je peux maintenir ma concentration et ma rigueur même profondément dans la nuit
>
> *Contexte : "Les technicentres libèrent les rames avant les premiers trains — les nuits sont longues."*

**G2** *(poids 1.2)*
> Travailler principalement la nuit (majorité de vos services entre 22h et 6h) :
> 1 — Est un frein majeur que j'aurais du mal à tenir sur le long terme
> 5 — Est une modalité que j'ai testée ou que j'assume sans difficulté anticipée
>
> *Contexte : "Distinct des 'horaires décalés' en général — ici on parle de nuits comme norme, pas exception."*

---

#### DIMENSION H — Rapport à la répétitivité (2 questions — NOUVELLES)

**H1** *(poids 1.5)*
> Faire la même route, avec les mêmes gestes, des centaines de fois dans l'année, en maintenant le même niveau de vigilance :
> 1 — Je ne saurais pas tenir — j'ai besoin de variété pour rester motivé(e)
> 5 — C'est dans ce type d'exercice que j'excelle — la maîtrise par répétition me convient
>
> *Contexte : "Un conducteur TER sur une navette régionale fait parfois le même aller-retour des années durant."*

**H2** *(poids 1.2)*
> Ce qui vous motive le plus dans un travail sur le long terme :
> 1 — La variété, les imprévus, chaque journée différente de la précédente
> 5 — La maîtrise parfaite d'un domaine précis, même si le quotidien est similaire
>
> *Contexte : "Pas de jugement de valeur — les deux tempéraments ont leur métier idéal dans le ferroviaire."*

---

## PARTIE 3 — LES NOUVEAUX PROFILS MÉTIERS (10 dimensions)

### Tableau des exigences par métier (1=faible, 5=indispensable)

| Dimension | Conducteur | Circulation | ASCT | Vente | Escale | Maintenance | Voie/Sig |
|---|---|---|---|---|---|---|---|
| **horaires_decales** | 5 | 5 | 4 | 3 | 4 | 5 | 5 |
| **relation_client** | 1 | 2 | 5 | 5 | 5 | 1 | 1 |
| **rigueur** | 5 | 5 | 3 | 3 | 3 | 5 | 5 |
| **aptitude_technique** | 3 | 4 | 2 | 2 | 2 | 5 | 5 |
| **mobilite** | 3 | 2 | 3 | 1 | 2 | 2 | 4 |
| **solitude** | **5** | **2** | **2** | **1** | **2** | **3** | **3** |
| **mode_decision** | **5** | **4** | **3** | **2** | **3** | **4** | **3** |
| **resistance_physique** | **2** | **1** | **2** | **1** | **3** | **4** | **5** |
| **travail_nuit** | **4** | **4** | **3** | **1** | **3** | **5** | **5** |
| **repetitivite** | **5** | **2** | **3** | **3** | **2** | **3** | **3** |

### Note de validation terrain ⚠️

Les cases en **gras** sont les nouvelles dimensions. Les valeurs ci-dessus sont des estimations basées sur la réalité des métiers telle que documentée dans `src/data/metiers.ts` et les fiches de poste disponibles. **Elles doivent être validées par le fondateur** avant déploiement — notamment :

- `resistance_physique` pour Conducteur (2 ou 3 ?)
- `repetitivite` pour ASCT (3 est-il juste — les bords de train varient-ils assez ?)
- `travail_nuit` pour Agent Circulation (4 — les postes de nuit sont-ils systématiques ?)

### Signatures distinctives par métier

```
Conducteur   = solitude(5) + repetitivite(5) + mode_decision(5) + horaires(5)
               → "Seul, répétitif, décideur solitaire, sans contact"

Circulation  = mode_decision C3(5=multi-tâches) + rigueur(5) + horaires(5) + solitude(2)
               → "Multi-tâches, coordination, équipe, rigueur"

ASCT         = relation_client(5) + horaires(4) + solitude(2)
               → "Contact humain ++, service, ni trop seul ni trop technique"

Vente        = relation_client(5) + horaires(3) + solitude(1) + nuit(1)
               → "Contact ++, horaires les plus doux, pas de nuit, pas de solitude"

Escale       = relation_client(5) + horaires(4) + resistance_physique(3)
               → "Contact ++, physique modéré, terrain de gare"

Maintenance  = travail_nuit(5) + aptitude_technique(5) + rigueur(5) + horaires(5)
               → "Nuit ++, technique ++, rigueur, physique modéré"

Voie/Sig     = resistance_physique(5) + travail_nuit(5) + aptitude_technique(5) + mobilite(4)
               → "Terrain physique extérieur, nuit, technique, mobilité"
```

---

## PARTIE 4 — MODIFICATION DE L'ALGORITHME DE SCORING

### Algorithme actuel (V1) — à remplacer partiellement

```typescript
// Problème : ne pénalise jamais la sur-qualification
const compat = Math.min(userNorm / exigence, 1)
```

### Algorithme V2 — bilatéral sur 3 dimensions

Trois dimensions fonctionnent comme des **axes de personnalité** où être à l'opposé de l'exigence est tout aussi problématique qu'être en dessous :

- **`solitude`** : un candidat qui aime la solitude (5/5) ne convient pas à Vente (exige 1) — et vice versa
- **`relation_client`** : un candidat qui fuit le contact (1/5) ne convient pas à ASCT (exige 5)
- **`repetitivite`** : un candidat qui a besoin de variété (1/5) ne convient pas à Conducteur navette (exige 5)

Pour ces 3 dimensions, la formule change :

```typescript
// Algorithme bilatéral : pénalise l'écart dans les deux sens
// ecart max = 4 (de 1/5 à 5/5)
const ecart = Math.abs(userNorm - exigence)
const compat = Math.max(0, 1 - ecart / 4)
```

Pour toutes les autres dimensions, la formule actuelle `min(userNorm/exigence, 1)` est conservée — elle reste adaptée pour les dimensions continues (rigueur, technique, horaires).

### Impact mesurable de ce changement

| Profil → Métier | V1 | V2 | Verdict |
|---|---|---|---|
| Vente → Conducteur | 59% | **38%** | ✅ Réaliste |
| Vente → Vente | 95% | **92%** | ✅ Stable |
| Conducteur → ASCT | 85% | **75%** | ✅ Meilleur |
| Conducteur → Conducteur | 100% | **97%** | ✅ Stable |
| Généraliste → Conducteur | 75% | **67%** | ✅ Plus strict |

### Suppression de `engagement_securite` comme dimension autonome

La dimension `engagement_securite` est supprimée. Elle est absorbée par :
- La question **E1** (rigueur situationnelle — raccourci procédure)
- La question **E2** (rigueur situationnelle — règle absurde)
- Le **contexte pédagogique** des questions (qui rappelle les enjeux sécurité sans biaiser la réponse)

La sécurité reste présente dans le contenu — elle n'est plus un vecteur de score biaisé.

### Suppression du champ `poidsTotal`

Le champ `poidsTotal` dans `METIER_PROFILS` est du dead code confirmé. Il ne doit pas être maintenu dans V2.

---

## PARTIE 5 — SCORES THÉORIQUES V2

Résultats de simulation avec 6 profils archétypaux sur les 7 métiers :

```
                    Conducteur  Circulation   ASCT    Vente   Escale  Maintenance  Voie/Sig
─────────────────────────────────────────────────────────────────────────────────────────
Conducteur idéal         97%        86%       75%      68%      72%       79%        75%
Circulation idéal        70%        96%       81%      80%      83%       81%        74%
ASCT idéal               59%        68%       97%      99%      92%       63%        62%
Vente idéal              38%        53%       71%      92%      70%       45%        43%
Maintenance idéal        78%        91%       80%      77%      81%       96%        89%
Voie/Sig idéal           79%        89%       83%      77%      81%       94%        97%
Généraliste (neutre)     67%        73%       87%      86%      84%       72%        71%
```

### Lecture des résultats

**✅ Améliorations confirmées par V2 :**
- Conducteur idéal → Conducteur = 97% (clair #1)
- Vente idéal → Conducteur = 38% (vs 59% en V1 — plus trompeur)
- Circulation idéal → Circulation = 96% (clair #1)
- Maintenance idéal → Maintenance = 96% (clair #1)
- Voie/Sig idéal → Voie/Sig = 97% (clair #1)

**⚠️ Zones encore imparfaites (à noter pour V2.1) :**
- ASCT idéal → ASCT (97%) ET Vente (99%) — l'ASCT et la Vente partagent une relation_client haute
  - Correction future : ajouter une question spécifique à la sûreté à bord et l'autorité
- Maintenance/Voie encore à 81% de similitude
  - Correction future : ajouter une question sur intérieur (technicentre) vs extérieur (chantier voie)
- Le "Généraliste neutre" obtient 84-87% sur ASCT/Escale/Vente
  - Ces métiers sont plus accessibles par nature — c'est cohérent

### Matrice de discrimination V2

```
                 Conducteur  Circulat  ASCT    Vente   Escale  Mainten  Voie/Sig
Conducteur          100%       62%     50%     35%     46%     66%      59%    ← mieux séparé
Circulation          62%      100%     62%     52%     61%     70%      60%    ← mieux séparé
ASCT                 50%       62%    100%     73%     86%!    49%      47%
Vente                35%       52%     73%    100%     71%     35%      30%
Escale               46%       61%     86%!    71%    100%     51%      48%
Maintenance          66%       70%     49%     35%     51%    100%      81%!
Voie/Sig             59%       60%     47%     30%     48%     81%!    100%

V1 (pour comparaison — paires problématiques) :
ASCT/Escale          85% → 86% (inchangé — voir V2.1)
Conducteur/Circulat  78% → 62% ✅ (-16 pts)
Conducteur/Mainten   72% → 66% ✅ (-6 pts)
Mainten/Voie         80% → 81% (stable)
```

---

## PARTIE 6 — IMPACT BASE DE DONNÉES

### Table `quiz_questions`

La table existante stocke les questions. Aucun changement de schéma nécessaire.

**Actions requises :**

```sql
-- 1. Désactiver (ne pas supprimer) les 14 questions V1
UPDATE quiz_questions
SET dimension = 'deprecated_' || dimension
WHERE test_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND order_index <= 14;

-- Ou plus proprement : créer un nouveau test_id pour V2
-- et laisser les données V1 intactes pour l'historique
```

**Recommandation : créer un nouveau `compatibility_tests` avec un nouvel UUID pour V2.** Les sessions V1 existantes restent valides et consultables. Les nouvelles sessions utilisent V2.

```sql
-- Nouveau test V2
INSERT INTO compatibility_tests (id, name, description, version)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',  -- nouvel UUID
  'Test de compatibilité V2 — 22 questions',
  'Version améliorée avec 10 dimensions et algorithme bilatéral.',
  2
);

-- 22 nouvelles questions à insérer avec order_index 1-22
-- dimensions : horaires_decales, relation_client, rigueur, aptitude_technique,
--              mobilite, solitude, mode_decision, resistance_physique,
--              travail_nuit, repetitivite
```

**Colonnes ajoutées pour V2 :** Aucune — la structure actuelle suffit. La dimension `solitude`, `mode_decision`, etc. sont des valeurs TEXT dans la colonne `dimension` existante.

### Table `user_quiz_sessions`

Aucun changement de schéma. Le champ `score` (score global) reste pertinent. Le champ `score_details` (JSONB) contiendra les 10 nouvelles dimensions — il est déjà flexible.

### Table `user_stats`

Aucun changement. Le champ `quiz_completed BOOLEAN` reste valide.

---

## PARTIE 7 — IMPACT FRONTEND

### `quiz/page.tsx`

**Un seul changement :** remplacer le tableau `QUESTIONS` (14 entrées) par les 22 questions V2.

La structure de chaque question reste identique :
```typescript
{
  id: 'a1',
  dimension: 'solitude',   // nouvelle valeur possible
  weight: 1.8,
  text: '...',
  context: '...',
}
```

**Aucun changement d'interface** — même progression, même échelle 1-5, même navigation.

**Durée estimée de passation :** 8-10 minutes (vs 5 pour V1) — à indiquer dans la page d'introduction.

**Page d'introduction `/test-compatibilite/page.tsx` :** mettre à jour :
- "14 questions" → "22 questions"
- "5 minutes" → "8 à 10 minutes"
- Ajouter les 4 nouvelles dimensions dans la liste présentée

### `resultats/page.tsx`

**Aucun changement de structure.** Les 10 dimensions s'affichent avec les mêmes barres et niveaux (fort/moyen/vigilance). L'affichage est déjà dynamique (`dimensionScores.map(...)`).

**À mettre à jour :** `DIMENSION_CONFIG` dans `score/route.ts` pour ajouter les descriptions des 4 nouvelles dimensions (textes fort/moyen/vigilance).

---

## PARTIE 8 — IMPACT API DE SCORING

### `src/app/api/compatibility/score/route.ts`

**3 modifications nécessaires :**

#### Modification 1 — Ajout des 4 nouvelles dimensions dans `DIMENSION_CONFIG`

```typescript
// Ajouter ces 4 entrées :
solitude: {
  label: 'Rapport à la solitude',
  descriptions: {
    fort: '...',   // aime travailler seul → métiers de cabine/technique
    moyen: '...',
    vigilance: '...',  // besoin de contact → métiers commerciaux
  },
},
mode_decision: {
  label: 'Mode de décision et multi-tâches',
  descriptions: { fort: '...', moyen: '...', vigilance: '...' },
},
resistance_physique: {
  label: 'Résistance physique et conditions difficiles',
  descriptions: { fort: '...', moyen: '...', vigilance: '...' },
},
travail_nuit: {
  label: 'Adaptation au travail de nuit',
  descriptions: { fort: '...', moyen: '...', vigilance: '...' },
},
repetitivite: {
  label: 'Rapport à la répétitivité',
  descriptions: {
    fort: '...',   // aime la maîtrise répétitive → Conducteur navette
    moyen: '...',
    vigilance: '...',  // besoin de variété → Circulation, Commercial
  },
},
```

**À supprimer :** `engagement_securite` de `DIMENSION_CONFIG`.

#### Modification 2 — Nouveaux profils dans `METIER_PROFILS`

Remplacer les 8 dimensions actuelles par les 10 dimensions V2 (cf. tableau Partie 3).
Supprimer le champ `poidsTotal` (dead code).

#### Modification 3 — Algorithme bilatéral dans `computeMetierCompatibilite`

```typescript
// Dimensions "bipolarisées" → l'écart dans les deux sens pénalise
const BILATERAL_DIMS = new Set(['solitude', 'relation_client', 'repetitivite'])

function computeMetierCompatibilite(userScores, metierSlug) {
  // ...
  for (const [dim, exigence] of Object.entries(metier.profil)) {
    const userNorm = (userScore / 100) * 5
    let compat: number

    if (BILATERAL_DIMS.has(dim)) {
      // Bilatéral : pénalise si trop différent dans les deux sens
      const ecart = Math.abs(userNorm - exigence)
      compat = Math.max(0, 1 - ecart / 4)
    } else {
      // Standard : plafonné à 1 (sur-qualification tolérée)
      compat = Math.min(userNorm / exigence, 1)
    }
    // ...
  }
}
```

---

## PARTIE 9 — MIGRATION V1 → V2

### Stratégie recommandée : migration transparente

**Ne pas casser les sessions V1 existantes.** Stratégie :

```
V1 actif (test_id: a1b2c3d4...)  →  Sessions historiques conservées
V2 actif (test_id: b2c3d4e5...)  →  Toutes les nouvelles sessions

Le frontend charge toujours le test_id le plus récent (version = MAX(version))
```

Cela permet :
- De consulter les résultats V1 passés dans le profil
- De refaire le test en V2 pour un résultat mis à jour
- De comparer les deux dans le dashboard (evolution du profil)

### Ordre d'exécution

```
Étape 1  SQL   : Insérer le nouveau test V2 dans compatibility_tests
Étape 2  SQL   : Insérer les 22 nouvelles quiz_questions (order 1-22)
Étape 3  Code  : Mettre à jour le tableau QUESTIONS dans quiz/page.tsx
Étape 4  Code  : Mettre à jour DIMENSION_CONFIG dans score/route.ts
Étape 5  Code  : Mettre à jour METIER_PROFILS dans score/route.ts
Étape 6  Code  : Ajouter l'algorithme bilatéral dans computeMetierCompatibilite
Étape 7  Code  : Mettre à jour la page d'introduction (22 questions, 8-10 min)
Étape 8  TEST  : Passer le test avec 5 profils types — vérifier les scores
Étape 9  VALID : Validation terrain par le fondateur (profils et questions)
```

---

## PARTIE 10 — CRITÈRES DE VALIDATION AVANT DÉPLOIEMENT

### Tests fonctionnels

| Test | Critère de succès |
|---|---|
| Profil Vente → Conducteur | Score ≤ 45% (non "compatibilité intéressante") |
| Profil Conducteur → Conducteur | Score ≥ 90% |
| Profil Maintenance → Voie/Sig | Score 80-90% (similaires mais distincts) |
| Profil Vente → Vente | Score ≥ 88% |
| Généraliste → Conducteur | Score ≤ 70% |
| Test complet durée | ≤ 12 minutes (abandon si plus) |

### Validation terrain (fondateur)

Avant de passer en production, valider avec 3-5 collègues ferroviaires réels :
1. Passer le test en aveugle (sans connaître les métiers cibles)
2. Comparer le résultat avec leur métier actuel
3. Collecter le feedback qualitatif sur les formulations

Questions spécifiques à valider :
- H1 (répétitivité navette) : est-ce que des conducteurs TGV se reconnaissent différemment des conducteurs TER ?
- G1 (3h du matin) : est-ce que la formulation résonne avec la réalité des mainteneurs ?
- C3 (multi-tâches) : est-ce que des agents circulation la trouvent pertinente ?
- F1 (extérieur froid/pluie) : est-ce que les agents voie trouvent que ça décrit leur réalité ?

---

## RÉCAPITULATIF DES CHANGEMENTS

### Ce qui change en V2

| Composant | V1 | V2 |
|---|---|---|
| Nombre de questions | 14 | 22 |
| Nombre de dimensions | 8 | 10 |
| Dimensions supprimées | `engagement_securite` → intégrée dans `rigueur` situationnelle | — |
| Dimensions ajoutées | — | `solitude`, `mode_decision`, `resistance_physique`, `travail_nuit`, `repetitivite` |
| Algorithme | Standard (min/exigence) | Standard + Bilatéral (3 dims) |
| Dead code supprimé | — | `poidsTotal` dans METIER_PROFILS |
| `DIMENSION_CONFIG` | 8 entrées | 10 entrées |
| `METIER_PROFILS` | 8 dimensions × 7 métiers | 10 dimensions × 7 métiers |
| Base de données | 1 test, 14 questions | 2 tests (V1 historique + V2), 36 questions |
| Durée test | ~5 min | ~8-10 min |
| Page intro | "14 questions, 5 min" | "22 questions, 8-10 min" |

### Ce qui ne change pas

- Architecture Next.js / Supabase
- Interface du quiz (même UX, même progression)
- Interface des résultats (barres + niveaux + top 3)
- API route `/api/compatibility/score`
- Formule de base `computeDimensionScore`
- Sauvegarde `user_quiz_sessions`
- Tout le reste de l'application

---

*Plan V2 — Juin 2026 — RailReady*
*Basé sur l'audit quantitatif AUDIT_MOTEUR_COMPATIBILITE.md*
*Simulation Python disponible sur demande*
