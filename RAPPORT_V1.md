# RAILREADY — Rapport de Développement V1
### Date : Juin 2026 | Statut : Livré pour validation terrain

---

## RÉSUMÉ EXÉCUTIF

Ce rapport documente l'ensemble des fichiers créés et modifiés lors du lancement de développement V1 de RailReady.

**Total fichiers créés :** 12 nouveaux fichiers  
**Total fichiers modifiés :** 1 (recrutement-agent.ts)  
**Zones à valider par le fondateur :** signalées `⚠️ [À VALIDER]` dans chaque fichier concerné  

---

## 1. FICHIERS CRÉÉS / MODIFIÉS

### 1.1 Données métiers

**`src/data/metiers.ts`** *(NOUVEAU)*

Fichier central de données pour les 7 métiers ferroviaires. Chaque fiche contient :
- Présentation générale + accroche terrain
- Liste complète des missions
- Journée type détaillée avec timeline horaire
- Informations horaires (type, roulement, astreintes)
- Avantages et contraintes
- Difficultés réelles (ce que les candidats sous-estiment)
- Qualités recherchées avec justification terrain
- Idées reçues vs réalité (format binaire)
- Erreurs fréquentes des candidats
- Conseils terrain
- Évolutions possibles avec délais approximatifs
- Données salariales (brut débutant / expérimenté + primes + avantages nature)
- Informations formation (niveau requis, durée, lieu, contenu général)
- Profil idéal par dimension (scores 1-5 par dimension de compatibilité)

**7 métiers documentés :**
1. Conducteur de Train (`conducteur-de-train`)
2. Agent Circulation (`agent-circulation`)
3. Contrôleur / ASCT (`controleur-asct`)
4. Agent de Vente (`agent-vente`)
5. Agent d'Escale (`agent-escale`)
6. Technicien Maintenance (`technicien-maintenance`)
7. Technicien Voie / Signalisation (`technicien-voie-signalisation`)

---

### 1.2 Agents IA

**`src/agents/mentor-agent.ts`** *(NOUVEAU)*

Le Mentor Ferroviaire — agent central de RailReady.

Caractéristiques du prompt système :
- Rôle et posture clairement définis (mentor terrain, pas encyclopédiste)
- 4 missions : orienter, informer, préparer, rassurer
- Style conversationnel : collègue expérimenté, direct et honnête
- Guide d'orientation par dimensions (solitude, stress, technique, etc.)
- Tableau de correspondance profil → métier recommandé
- Gestion des situations délicates (candidat découragé, reconversion, idéalisation)
- **Interdictions absolues documentées et explicites** (procédures, signalisation, sécurité technique, affiliation SNCF)
- Messages d'accueil contextuels (selon si test fait, métiers vus, etc.)

Modèle : `gpt-4o` | Température : 0.75 | MaxTokens : 1200

---

**`src/agents/recrutement-agent.ts`** *(MODIFIÉ — v1 → v2)*

Simulateur d'entretien étendu de 3 à **7 métiers**.

Ajouts par rapport à la version précédente :
- Banque de questions complète pour **Agent de Vente**, **Agent d'Escale**, **Technicien Maintenance**, **Technicien Voie/Signalisation**
- Structure d'entretien formalisée en 8 étapes
- Questions de mise en situation spécifiques par métier
- Nouveau format d'évaluation JSON enrichi : `reponses_faibles` + `prochaines_etapes`
- Classe `RecrutementAgent` avec méthode `parseEvaluation()`
- Métadonnées par métier (durée, focus) pour personnaliser l'accueil
- Types TypeScript complets (`EvaluationFinale`, `ScoreLabel`, etc.)

---

### 1.3 API Routes

**`src/app/api/agents/mentor/route.ts`** *(NOUVEAU)*

Route POST `/api/agents/mentor` :
- Auth Supabase obligatoire
- Mode welcome (GET sans messages → retourne message d'accueil)
- Mode streaming SSE pour les échanges
- Support du contexte (métiers vus, test fait, prénom)

**`src/app/api/compatibility/score/route.ts`** *(NOUVEAU)*

Route POST `/api/compatibility/score` — Algorithme de scoring complet :

*Algorithme :*
- Score par dimension : `Σ(value × weight) / Σ(5 × weight) × 100`
- Score global : moyenne pondérée sur toutes les dimensions
- Niveaux : Fort (≥70) / Moyen (45-69) / Vigilance (<45)
- Compatibilité métier : calcul pondéré par les exigences du poste
  - `Σ[min(userNorm/exigence, 1) × exigence] / Σ[exigence] × 100`
- Top 3 métiers recommandés avec raison générée automatiquement
- Sauvegarde en base Supabase (non bloquante)

*Sortie :*
- `scoreGlobal` (0-100)
- `niveauGlobal` (fort/moyen/vigilance)
- `dimensions[]` avec description personnalisée
- `pointsForts[]` et `pointsVigilance[]`
- `metiersRecommandes[]` (top 3)
- `messageGlobal` contextuel
- `disclaimer` obligatoire

---

### 1.4 Pages Frontend

**`src/app/(dashboard)/metiers/page.tsx`** *(NOUVEAU)*

Liste des 7 métiers en grille :
- Cartes avec emoji, catégorie colorée, accroche
- Infos rapides (horaires, salaire débutant, niveau requis)
- CTA vers le test de compatibilité et le Mentor
- Données chargées depuis `src/data/metiers.ts` (pas de fetch API)

**`src/app/(dashboard)/metiers/[slug]/page.tsx`** *(NOUVEAU)*

Fiche métier complète avec ISR (generateStaticParams) :
- SEO automatique (generateMetadata)
- Toutes les sections de la fiche : missions, journée type, horaires, avantages/contraintes, difficultés, qualités, idées reçues, erreurs, conseils, profil (barres), salaire, formation, évolutions
- Zones `[À VALIDER]` en amber (visuellement distinctes)
- CTA : simuler un entretien + parler au Mentor
- Navigation fil d'Ariane

**`src/app/(dashboard)/test-compatibilite/page.tsx`** *(NOUVEAU)*

Page d'introduction au test :
- Présentation des 8 dimensions évaluées
- Liste des 4 éléments restitués
- Disclaimer prominent (pas un test officiel, pas de termes apte/inapte)
- CTA vers le quiz

**`src/app/(dashboard)/test-compatibilite/quiz/page.tsx`** *(NOUVEAU)*

Interface quiz — 14 questions :
- Barre de progression
- Contexte explicatif par question
- Échelle 1-5 avec labels textuels
- Navigation précédent/suivant
- Soumission async + stockage en sessionStorage
- Redirect vers résultats après soumission

**`src/app/(dashboard)/test-compatibilite/resultats/page.tsx`** *(NOUVEAU)*

Page résultats :
- Score global avec badge coloré (fort/moyen/vigilance)
- Points forts et points de vigilance
- Barres de progression par dimension avec description
- Top 3 métiers avec score de compatibilité et lien vers fiche
- Disclaimer (pas un test officiel)
- CTAs : Mentor / Simulateur / Explorer les métiers

**`src/app/(dashboard)/mentor/page.tsx`** *(NOUVEAU)*

Interface chat du Mentor Ferroviaire :
- Chargement du message d'accueil contextuel à l'initialisation
- Interface chat streaming (SSE)
- Bulles distinctes utilisateur/assistant
- Questions suggérées au premier contact
- Indicateurs de chargement animés
- Disclaimer permanent en bas

**`src/app/a-propos/page.tsx`** *(NOUVEAU)*

Page À Propos avec :
- Bannière d'indépendance (non-affiliation SNCF) en premier plan
- Présentation du fondateur avec expériences terrain (3 postes)
- Section "Pourquoi RailReady"
- Tableau "Ce que nous sommes / ne sommes pas"
- ⚠️ Toutes les informations personnelles marquées `[À VALIDER]` — à personnaliser

---

### 1.5 Base de données

**`supabase/migrations/005_new_metiers_v1.sql`** *(NOUVEAU)*

- Extension du schéma `metiers` : 15 nouvelles colonnes (journée_type, difficultés, profil_ideal, etc.)
- Insertion de 3 nouveaux métiers : agent-vente, agent-escale, technicien-voie-signalisation
- Mise à jour des emojis et accroches des 4 métiers existants
- Vue `metiers_summary` pour le frontend
- Gestion des conflits (`ON CONFLICT DO UPDATE`)

---

## 2. ZONES À VALIDER PAR LE FONDATEUR

Les zones suivantes sont marquées `⚠️ [À VALIDER]` dans les fichiers et nécessitent votre validation :

### Priorité HAUTE — Avant tout test utilisateur

| Zone | Fichier | Nature |
|---|---|---|
| **Votre identité sur la page À Propos** | `src/app/a-propos/page.tsx` | Prénom, nom, photo, textes personnels |
| **Description de vos expériences** | `src/app/a-propos/page.tsx` | Durées, contextes, formulations |
| **Contact email/réseau** | `src/app/a-propos/page.tsx` | À ajouter |

### Priorité HAUTE — Exactitude des informations métier

| Dimension | Fichier | Nature |
|---|---|---|
| **Salaires** (tous les métiers) | `src/data/metiers.ts` | Fourchettes brutes, primes — à vérifier avec réalité terrain 2026 |
| **Horaires de roulement** | `src/data/metiers.ts` | Modalités précises (cycles, nuits, astreintes) |
| **Durées de formation** | `src/data/metiers.ts` | Peuvent varier selon opérateur |
| **Journées type** | `src/data/metiers.ts` | Les exemples horaires sont plausibles mais indicatifs |

### Priorité MOYENNE — Enrichissement terrain

| Zone | À faire |
|---|---|
| **Difficultés réelles** (chaque métier) | Valider que les difficultés listées correspondent à votre vécu |
| **Conseils terrain** | Enrichir avec vos conseils personnels (actuellement 4-5 par métier) |
| **Idées reçues** | Ajouter celles que vous entendez le plus souvent |
| **Erreurs fréquentes en entretien** | Valider / enrichir avec vos observations |
| **Questions du simulateur** | Valider que les questions correspondent aux vrais entretiens du secteur |

### Priorité BASSE — Évolutif

| Zone | À faire |
|---|---|
| **Évolutions de carrière** | Délais approximatifs à ajuster si nécessaire |
| **Métiers proches** (liens entre fiches) | À enrichir selon votre expérience |
| **Niveaux requis formation** | CAP/Bac/Bac+2 — à vérifier selon les opérateurs actuels |

---

## 3. CE QUI RESTE À CONSTRUIRE

Ces éléments sont hors scope de cette session mais nécessaires avant le lancement :

### Indispensable avant le premier test

- [ ] **Next.js setup complet** — `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- [ ] **Supabase client** — `src/lib/supabase/client.ts` et `src/lib/supabase/server.ts`
- [ ] **Auth pages** — `/login`, `/register`, `/auth/callback`
- [ ] **Layout dashboard** — sidebar, navbar, footer
- [ ] **Landing page** — `src/app/page.tsx`
- [ ] **Page entretien IA** — `/entretien` avec choix du métier + interface chat
- [ ] **Variables d'environnement** — `.env.local` avec clés Supabase + OpenAI

### Recommandé avant le lancement public

- [ ] **Middleware auth** — protection des routes `/dashboard/*`
- [ ] **Mentions légales + CGU + Politique de confidentialité** — pages `/mentions-legales`, `/cgu`, `/privacy`
- [ ] **Page tableau de bord** — `/dashboard` avec progression, résultats, historique
- [ ] **Page profil** — `/profil` avec résultats sauvegardés

---

## 4. ARCHITECTURE DES DONNÉES — RÉSUMÉ

```
src/data/metiers.ts          ← Source de vérité pour le frontend (SSG)
supabase/migrations/004      ← Questions du quiz + 4 métiers (existant)
supabase/migrations/005      ← 3 nouveaux métiers + schéma étendu

API Routes:
  POST /api/agents/mentor    ← Mentor Ferroviaire (streaming)
  POST /api/agents/recrutement ← Simulateur d'entretien (streaming + évaluation)
  POST /api/compatibility/score ← Scoring quiz (calcul + sauvegarde DB)
```

---

## 5. DÉCISIONS TECHNIQUES PRISES

| Décision | Justification |
|---|---|
| **Données métiers en TypeScript** (pas seulement en SQL) | Permet le SSG (Static Site Generation) des fiches — meilleur SEO, pas de fetch API à la lecture |
| **SessionStorage pour les résultats quiz** | Évite de passer des données volumineuses dans l'URL, compatible avec une future sauvegarde DB |
| **Streaming SSE pour les agents IA** | Meilleure expérience utilisateur — réponse progressive |
| **Évaluation entretien en JSON structuré** | Permet d'afficher une page de résultats détaillée et sauvegardable |
| **Score compatibilité : algorithme pondéré** | L'engagement sécurité (weight 2.0) pèse plus lourd — cohérent avec les valeurs du secteur |
| **Pas de termes "apte/inapte"** | Conforme aux exigences légales et éthiques définies dans le brief |

---

## 6. RECOMMANDATIONS IMMÉDIATES

1. **Lire et valider la page À Propos** en priorité — c'est ce qui différencie RailReady de toute autre ressource
2. **Corriger les salaires** si les fourchettes ne correspondent pas à la réalité terrain 2026
3. **Enrichir 2-3 fiches métiers** avec vos anecdotes terrain avant de les montrer à vos collègues — l'authenticité est le cœur du projet
4. **Tester le Mentor** avec des questions réelles que vous avez entendues de la part de candidats
5. **Tester le Simulateur d'entretien** sur le poste de Conducteur et vérifier si les questions correspondent aux vrais entretiens

---

*Rapport généré le : Juin 2026*  
*Version : V1.0*  
*Statut : En attente de validation terrain par le fondateur*
