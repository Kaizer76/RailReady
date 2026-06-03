# RailReady — Architecture Technique Complète

> Version: 1.0 | Date: 2026-06-02 | Statut: MVP

---

## 1. STACK TECHNIQUE

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | Next.js 14 (App Router) | SSR/SSG, SEO, file-based routing |
| Styling | Tailwind CSS + shadcn/ui | Rapidité, composants accessibles |
| Backend | Supabase (PostgreSQL 15) | Auth, DB, Storage, Realtime intégrés |
| Auth | Supabase Auth + OAuth Google | Email/mdp + social login |
| IA principale | OpenAI GPT-4o | Agents, coaching, simulation entretien |
| IA secondaire | Claude claude-sonnet-4-6 (Anthropic) | Analyse de réponses, feedback nuancé |
| Paiement | Stripe + Stripe Webhooks | Abonnements récurrents |
| Automatisation | n8n (self-hosted sur Railway) | Onboarding, emails, notifications |
| Emails | Resend | Transactionnel fiable |
| CDN/Assets | Supabase Storage + Vercel Edge | Images, documents |
| Monitoring | Sentry + Vercel Analytics | Erreurs + usage |
| Hébergement | Vercel (frontend) + Railway (n8n) | Zero-config deploy |

---

## 2. ARBORESCENCE DU PROJET

```
railready/
├── .env.local                     # Variables d'environnement (jamais committé)
├── .env.example                   # Template des variables
├── next.config.ts                 # Config Next.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── supabase/
│   ├── config.toml                # Config Supabase CLI
│   ├── seed.sql                   # Données de démarrage (métiers, questions)
│   └── migrations/
│       ├── 001_init_schema.sql    # Tables core
│       ├── 002_rls_policies.sql   # Row Level Security
│       ├── 003_functions.sql      # Fonctions PG utilitaires
│       └── 004_seed_data.sql      # Métiers + questions initiales
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout + providers
│   │   ├── page.tsx               # Landing page
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── callback/route.ts  # OAuth callback
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Sidebar + nav authentifiée
│   │   │   ├── dashboard/page.tsx # Tableau de bord utilisateur
│   │   │   │
│   │   │   ├── metiers/
│   │   │   │   ├── page.tsx       # Liste des métiers
│   │   │   │   └── [slug]/page.tsx# Fiche métier détaillée
│   │   │   │
│   │   │   ├── test-compatibilite/
│   │   │   │   ├── page.tsx       # Intro + démarrage test
│   │   │   │   ├── quiz/page.tsx  # Questionnaire pas à pas
│   │   │   │   └── resultats/page.tsx # Score + recommandations
│   │   │   │
│   │   │   ├── entretien/
│   │   │   │   ├── page.tsx       # Choix du poste + niveau
│   │   │   │   ├── session/page.tsx # Interface de simulation live
│   │   │   │   └── historique/page.tsx # Résultats passés
│   │   │   │
│   │   │   ├── formation/
│   │   │   │   ├── page.tsx       # Modules de formation disponibles
│   │   │   │   ├── [module]/page.tsx # Module de cours
│   │   │   │   └── qcm/page.tsx   # QCM interactif
│   │   │   │
│   │   │   └── profil/
│   │   │       ├── page.tsx       # Profil + progression
│   │   │       └── abonnement/page.tsx # Gestion Stripe
│   │   │
│   │   └── api/
│   │       ├── agents/
│   │       │   ├── conducteur/route.ts
│   │       │   ├── circulation/route.ts
│   │       │   ├── controleur/route.ts
│   │       │   ├── recrutement/route.ts
│   │       │   └── coach/route.ts
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts
│   │       │   └── webhook/route.ts
│   │       └── compatibility/
│   │           └── score/route.ts
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── metiers/
│   │   │   ├── MetierCard.tsx
│   │   │   └── MetierDetail.tsx
│   │   ├── quiz/
│   │   │   ├── QuizQuestion.tsx
│   │   │   ├── QuizProgress.tsx
│   │   │   └── QuizResults.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx  # Interface agent IA réutilisable
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── formation/
│   │   │   ├── ModuleCard.tsx
│   │   │   └── QCMQuestion.tsx
│   │   └── dashboard/
│   │       ├── ProgressWidget.tsx
│   │       └── StatsCard.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Client browser
│   │   │   ├── server.ts          # Client server-side
│   │   │   └── middleware.ts      # Auth middleware
│   │   ├── openai/
│   │   │   ├── client.ts
│   │   │   └── streaming.ts       # Streaming responses
│   │   ├── anthropic/
│   │   │   └── client.ts
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── plans.ts           # Définition des plans
│   │   └── utils/
│   │       ├── cn.ts              # classNames utility
│   │       └── format.ts
│   │
│   ├── agents/                    # Logique des agents IA
│   │   ├── base-agent.ts          # Classe abstraite commune
│   │   ├── conducteur-agent.ts
│   │   ├── circulation-agent.ts
│   │   ├── controleur-agent.ts
│   │   ├── recrutement-agent.ts
│   │   └── coach-agent.ts
│   │
│   ├── hooks/
│   │   ├── useUser.ts
│   │   ├── useSubscription.ts
│   │   ├── useAgent.ts            # Hook streaming IA
│   │   └── useQuiz.ts
│   │
│   ├── stores/                    # Zustand state management
│   │   ├── userStore.ts
│   │   ├── quizStore.ts
│   │   └── chatStore.ts
│   │
│   └── types/
│       ├── database.types.ts      # Types générés par Supabase CLI
│       ├── agents.ts
│       └── stripe.ts
│
└── n8n/
    └── workflows/
        ├── onboarding-welcome.json
        ├── quiz-completed.json
        ├── entretien-completed.json
        ├── subscription-created.json
        └── weekly-digest.json
```

---

## 3. VARIABLES D'ENVIRONNEMENT REQUISES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://railready.fr
```

---

## 4. PLANS TARIFAIRES (STRIPE)

| Plan | Prix | Fonctionnalités |
|------|------|-----------------|
| **Gratuit** | 0€ | Test compatibilité, 2 fiches métiers, 3 simulations/mois |
| **Starter** | 9,90€/mois | Tout gratuit + simulations illimitées, coach IA basique |
| **Pro** | 19,90€/mois | Tout Starter + tous modules formation, feedback détaillé IA |
| **Annuel Pro** | 149€/an | Pro annuel (-37%) |

---

## 5. SÉCURITÉ & CONFORMITÉ

- **RLS activée sur toutes les tables** — chaque utilisateur ne voit que ses données
- **Middleware auth** sur toutes les routes `/dashboard/*`
- **Webhook Stripe signé** — vérification signature HMAC
- **Rate limiting** sur toutes les routes `/api/agents/*` via Upstash Redis
- **Pas de données SNCF confidentielles** — contenu 100% original et public
- **RGPD** — suppression compte + données sur demande, consentement email

---

## 6. PERFORMANCE & SCALABILITÉ

- **Streaming** sur tous les agents IA (ReadableStream → Server-Sent Events)
- **Incremental Static Regeneration** sur les fiches métiers (revalidate 24h)
- **Optimistic updates** sur le dashboard avec SWR/React Query
- **Connection pooling** Supabase via pgBouncer (inclus dans Supabase)
- **Edge Functions** pour les webhooks Stripe (latence minimale)
```
