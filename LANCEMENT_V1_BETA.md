# RAILREADY — Guide de Lancement V1 Bêta
### Instructions pour démarrer la plateforme

---

## PRÉREQUIS

- Node.js 18+ installé
- Compte Supabase (gratuit sur supabase.com)
- Clé API OpenAI (plateforme.openai.com)

---

## INSTALLATION EN 5 ÉTAPES

### Étape 1 — Installer les dépendances

```bash
cd RailReady
npm install
```

### Étape 2 — Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Puis remplir `.env.local` avec :
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Étape 3 — Créer le projet Supabase

1. Aller sur https://supabase.com/dashboard
2. Créer un nouveau projet (choisir région **EU West** pour le RGPD)
3. Dans l'onglet **SQL Editor**, exécuter les migrations dans l'ordre :
   - `supabase/migrations/001_init_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions.sql`
   - `supabase/migrations/004_seed_data.sql`
   - `supabase/migrations/005_new_metiers_v1.sql`
   - `supabase/migrations/006_feedback_sessions.sql`

### Étape 4 — Lancer le serveur de développement

```bash
npm run dev
```

La plateforme est accessible sur : **http://localhost:3000**

### Étape 5 — Créer le premier compte

1. Ouvrir http://localhost:3000
2. Cliquer **"Commencer gratuitement"**
3. Créer un compte avec votre email
4. Vous êtes connecté — la plateforme est prête

---

## STRUCTURE COMPLÈTE DU PROJET

```
RailReady/
├── src/
│   ├── app/
│   │   ├── page.tsx                          ✅ Landing page
│   │   ├── layout.tsx                        ✅ Root layout
│   │   ├── globals.css                       ✅ Styles globaux
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                    ✅ Layout auth
│   │   │   ├── login/page.tsx                ✅ Connexion
│   │   │   ├── register/page.tsx             ✅ Inscription
│   │   │   └── callback/route.ts             ✅ OAuth callback
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                    ✅ Layout avec sidebar
│   │   │   ├── dashboard/page.tsx            ✅ Tableau de bord
│   │   │   ├── metiers/
│   │   │   │   ├── page.tsx                  ✅ Liste des 7 métiers
│   │   │   │   └── [slug]/page.tsx           ✅ Fiche détaillée
│   │   │   ├── test-compatibilite/
│   │   │   │   ├── page.tsx                  ✅ Intro du test
│   │   │   │   ├── quiz/page.tsx             ✅ 14 questions
│   │   │   │   └── resultats/page.tsx        ✅ Résultats + feedback
│   │   │   ├── mentor/page.tsx               ✅ Chat Mentor IA
│   │   │   ├── entretien/
│   │   │   │   ├── page.tsx                  ✅ Choix du métier/niveau
│   │   │   │   └── session/page.tsx          ✅ Interface chat + évaluation
│   │   │   └── profil/page.tsx               ✅ Profil utilisateur
│   │   │
│   │   ├── a-propos/page.tsx                 ✅ À propos (À PERSONNALISER)
│   │   │
│   │   └── api/
│   │       ├── agents/
│   │       │   ├── mentor/route.ts           ✅ API Mentor (streaming)
│   │       │   └── recrutement/route.ts      ✅ API Entretien (streaming)
│   │       └── compatibility/
│   │           └── score/route.ts            ✅ API Scoring quiz
│   │
│   ├── agents/
│   │   ├── base-agent.ts                     ✅ Classe abstraite IA
│   │   ├── mentor-agent.ts                   ✅ Mentor Ferroviaire
│   │   ├── recrutement-agent.ts              ✅ Simulateur (7 métiers)
│   │   └── coach-agent.ts                    ✅ Coach formation
│   │
│   ├── data/
│   │   └── metiers.ts                        ✅ 7 fiches complètes
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                   ✅ Navigation desktop
│   │   │   └── MobileNav.tsx                 ✅ Navigation mobile
│   │   └── feedback/
│   │       └── FeedbackWidget.tsx            ✅ Feedback utilisateurs
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                     ✅ Client browser
│   │   │   └── server.ts                     ✅ Client serveur
│   │   └── utils/cn.ts                       ✅ Utilitaires CSS
│   │
│   └── middleware.ts                         ✅ Auth middleware
│
├── supabase/migrations/
│   ├── 001_init_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_functions.sql
│   ├── 004_seed_data.sql
│   ├── 005_new_metiers_v1.sql
│   └── 006_feedback_sessions.sql             ✅ NOUVEAU
│
├── package.json                              ✅ NOUVEAU
├── next.config.ts                            ✅ NOUVEAU
├── tailwind.config.ts                        ✅ NOUVEAU
├── tsconfig.json                             ✅ NOUVEAU
└── .env.example                              ✅ MIS À JOUR
```

---

## ZONES À VALIDER AVANT LE PREMIER TEST

### 🔴 PRIORITÉ 1 — Avant de montrer à des collègues

| Fichier | Action |
|---|---|
| `src/app/a-propos/page.tsx` | Remplacer TOUS les `⚠️ [À VALIDER]` par vos vraies infos |
| `src/data/metiers.ts` | Vérifier les salaires, horaires, durées formation |
| `src/app/a-propos/page.tsx` | Ajouter votre photo, votre prénom/nom, votre email de contact |

### 🟡 PRIORITÉ 2 — Dans les jours suivants

| Zone | Action |
|---|---|
| Toutes les fiches métiers | Vérifier les "⚠️ [À VALIDER]" avec votre expérience |
| Simulateur d'entretien | Tester chaque métier et corriger les questions peu réalistes |
| Mentor Ferroviaire | Tester avec 10 vraies questions de candidats |

---

## FLUX UTILISATEUR COMPLET

```
Landing page (/)
  → Inscription (/register)
    → Tableau de bord (/dashboard)
      ├── Test de compatibilité (/test-compatibilite)
      │     → Quiz (14 questions)
      │     → Résultats (score + métiers recommandés + feedback)
      │
      ├── Fiches métiers (/metiers)
      │     → Détail métier (/metiers/[slug])
      │     → CTA : Simuler un entretien
      │
      ├── Simulateur d'entretien (/entretien)
      │     → Choix métier + niveau
      │     → Session chat (streaming IA)
      │     → Rapport d'évaluation (JSON structuré)
      │     → Feedback widget
      │
      └── Mentor Ferroviaire (/mentor)
            → Chat streaming
            → Questions suggérées
```

---

## NOTES IMPORTANTES POUR LA BÊTA

### Ce qui est opérationnel ✅
- Inscription / connexion / déconnexion
- Navigation complète desktop et mobile
- Test de compatibilité 14 questions → scoring → résultats
- 7 fiches métiers complètes avec toutes les sections
- Mentor Ferroviaire (chat streaming)
- Simulateur d'entretien 7 métiers (chat streaming + évaluation JSON)
- Feedback widget après test et entretien
- Tableau de bord avec stats utilisateur

### Ce qui nécessite les clés API ⚠️
- Le Mentor IA (OpenAI GPT-4o)
- Le simulateur d'entretien (OpenAI GPT-4o)
- Sans clé OpenAI, les pages chat s'affichent mais les réponses IA échouent

### Ce qui n'est pas développé (hors scope bêta) ❌
- Paiement / abonnement
- B2B / espace recruteur
- Emails automatiques
- Blog / SEO articles

---

## DÉPLOIEMENT EN LIGNE (optionnel)

Pour rendre RailReady accessible à vos collègues sans qu'ils aient besoin d'installer Node.js :

1. Créer un compte sur https://vercel.com (gratuit)
2. Importer le projet depuis GitHub
3. Ajouter les variables d'environnement dans les paramètres Vercel
4. Déployer — vous obtenez une URL en https://railready-xxx.vercel.app

---

*Guide rédigé le : Juin 2026*
*Version : V1 Bêta*
