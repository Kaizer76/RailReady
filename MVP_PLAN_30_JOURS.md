# RailReady — Plan de Développement MVP 30 Jours

> Objectif: Produit utilisable, déployé, et capable de générer les premières ventes avant J+30.

---

## SEMAINE 1 (J1–J7) — Fondations & Infrastructure

### Objectifs
- Environnement de développement opérationnel
- Base de données déployée avec RLS
- Auth fonctionnelle (email + Google)
- Landing page en ligne

### Tâches

**J1–J2 : Setup projet**
- [ ] Initialiser Next.js 14 avec TypeScript + Tailwind + shadcn/ui
- [ ] Configurer Supabase (nouveau projet, exécuter migrations 001→004)
- [ ] Configurer variables d'environnement (.env.local)
- [ ] Mettre en place ESLint, Prettier, husky pre-commit
- [ ] Créer dépôt GitHub + déploiement Vercel (preview auto sur PR)

**J3–J4 : Authentification**
- [ ] Implémenter Supabase Auth (email/mdp + magic link)
- [ ] OAuth Google
- [ ] Middleware Next.js pour protéger les routes dashboard
- [ ] Pages /login, /register, /callback
- [ ] Création automatique profil + subscription + stats (trigger SQL OK)

**J5–J6 : Landing page**
- [ ] Hero section avec proposition de valeur claire
- [ ] Section "3 étapes" (découvrir → tester → se préparer)
- [ ] Présentation des 4 métiers phares
- [ ] Section témoignages (placeholder réaliste)
- [ ] CTA Inscription + pricing preview
- [ ] SEO meta tags (title, description, og:image)

**J7 : Infrastructure**
- [ ] Déployer n8n sur Railway (plan gratuit → prod)
- [ ] Configurer webhook Supabase → n8n (nouveau utilisateur)
- [ ] Tester workflow onboarding email de bout en bout
- [ ] Configurer Resend (domaine railready.fr)

**Livrable J7**: Site en ligne sur railready.fr, inscription fonctionnelle, email de bienvenue reçu.

---

## SEMAINE 2 (J8–J14) — Fonctionnalités Core MVP

### Objectifs
- Test de compatibilité complet et fonctionnel
- Fiches métiers détaillées
- Dashboard utilisateur de base

### Tâches

**J8–J9 : Fiches métiers**
- [ ] Page /metiers avec grid des 4 métiers
- [ ] Composant MetierCard avec score de compatibilité estimé
- [ ] Page /metiers/[slug] avec contenu complet
- [ ] ISR (revalidate 24h) pour les fiches métiers
- [ ] Responsive mobile

**J10–J12 : Test de compatibilité**
- [ ] Interface quiz pas-à-pas (une question à la fois)
- [ ] Barre de progression animée
- [ ] Echelle visuelle 1→5 avec icônes expressives
- [ ] Sauvegarde des réponses en temps réel (Supabase)
- [ ] Appel à la fonction SQL `calculer_score_compatibilite`
- [ ] Page résultats avec:
  - Score global sur 100 avec jauge visuelle
  - Radar chart par dimension (Recharts)
  - Recommandation de métiers correspondants
  - CTA "Simuler un entretien" ou "Commencer la formation"

**J13–J14 : Dashboard utilisateur**
- [ ] Layout sidebar responsive
- [ ] Page dashboard avec widgets:
  - Résumé du profil
  - Score de compatibilité (si test fait)
  - Progression formations
  - Historique sessions entretien
  - Objectifs de la semaine

**Livrable J14**: Test de compatibilité complet, résultats personnalisés, dashboard visible.

---

## SEMAINE 3 (J15–J21) — Agents IA & Monétisation

### Objectifs
- Agent entretien fonctionnel avec streaming
- Agent coach formation
- Stripe opérationnel (paiement réel)

### Tâches

**J15–J17 : Agent Recrutement (simulateur entretien)**
- [ ] Intégrer OpenAI GPT-4o avec streaming (SSE)
- [ ] Interface chat complète (ChatInterface.tsx)
  - Messages streamés caractère par caractère
  - Avatar recruteur
  - Indicateur de frappe
  - Scroll automatique
- [ ] Sélection poste + niveau avant démarrage
- [ ] Message d'ouverture personnalisé
- [ ] Bouton "Terminer l'entretien" → évaluation IA
- [ ] Page résultats avec score + feedback détaillé + axes d'amélioration
- [ ] Sauvegarde session + messages dans Supabase
- [ ] Limite 3 sessions/mois pour plan gratuit

**J18–J19 : Agent Coach Formation**
- [ ] Interface chat coach (même composant, personnalité différente)
- [ ] 3 premiers modules de formation rédigés:
  - "Introduction au réseau ferroviaire français"
  - "La signalisation ferroviaire — bases"
  - "Comprendre le métier de conducteur de train"
- [ ] QCM 10 questions par module
- [ ] Tracking progression utilisateur
- [ ] Composant QCMQuestion interactif

**J20–J21 : Stripe & Paiement**
- [ ] Créer produits/prix dans Stripe Dashboard
- [ ] Page /profil/abonnement avec plans tarifaires
- [ ] Checkout Stripe (redirect)
- [ ] Webhook handler complet (checkout.session.completed, subscription.updated/deleted)
- [ ] Mise à jour automatique subscription dans Supabase
- [ ] Gating des contenus premium selon plan
- [ ] Modale "Upgrade" contextuelle quand limite atteinte

**Livrable J21**: Premier paiement réel possible. Agent entretien et coach fonctionnels.

---

## SEMAINE 4 (J22–J30) — Polish, SEO & Lancement

### Objectifs
- Produit poli et sans bugs critiques
- SEO de base opérationnel
- Premiers utilisateurs réels

### Tâches

**J22–J24 : Polish UI/UX**
- [ ] Responsive parfait sur mobile (test sur iPhone + Android)
- [ ] Animations de transition (Framer Motion léger)
- [ ] Loading states sur tous les appels IA
- [ ] Error boundaries et messages d'erreur utiles
- [ ] Onboarding guidé pour les nouveaux utilisateurs (3 étapes)
- [ ] Accessibilité de base (alt, aria-labels, keyboard nav)
- [ ] Optimisation images (next/image)

**J25–J26 : SEO & Contenu**
- [ ] Sitemap.xml dynamique
- [ ] robots.txt
- [ ] Balises OG pour chaque page
- [ ] 2 articles blog SEO:
  - "Comment devenir conducteur de train en 2024"
  - "Métiers ferroviaires: salaires, avantages et conditions"
- [ ] Schema.org (Organisation, FAQPage)

**J27–J28 : Tests & Sécurité**
- [ ] Tests end-to-end critiques (Playwright):
  - Inscription → test compatibilité → résultats
  - Connexion → entretien IA → évaluation
  - Paiement Stripe (mode test)
- [ ] Audit Sentry (configurer error tracking)
- [ ] Vérifier RLS sur toutes les tables (essai avec compte test)
- [ ] Rate limiting sur routes IA (Upstash Redis ou Vercel KV)

**J29–J30 : Lancement**
- [ ] Vérification DNS railready.fr → Vercel
- [ ] SSL actif
- [ ] Supabase passer en plan Pro (performance)
- [ ] Mettre en place Vercel Analytics
- [ ] Posts de lancement:
  - LinkedIn (cibler RH ferroviaire, candidats)
  - Reddit r/SNCF, r/emploi
  - Forum cheminotcommunity.com
- [ ] Email de lancement aux bêta testeurs
- [ ] Configurer Google Search Console

**Livrable J30**: MVP en production avec premiers utilisateurs payants.

---

## MÉTRIQUES DE SUCCÈS MVP

| Métrique | Cible J+30 | Cible J+60 |
|----------|-----------|-----------|
| Utilisateurs inscrits | 100 | 500 |
| Tests de compatibilité complétés | 60 | 300 |
| Sessions entretien IA | 30 | 200 |
| Taux de conversion Free→Payant | 5% | 8% |
| MRR | 50€ | 400€ |
| NPS (si mesuré) | >30 | >40 |

---

## DÉPENDANCES EXTERNES À CONFIGURER AVANT J1

| Service | Action | Délai |
|---------|--------|-------|
| Supabase | Créer projet | 5 min |
| Vercel | Connecter GitHub repo | 10 min |
| OpenAI | Créer API key, définir budget max | 5 min |
| Anthropic | Créer API key | 5 min |
| Stripe | Créer compte, vérifier identité | 1-3 jours |
| Resend | Créer compte, vérifier domaine | 24h DNS |
| Railway | Créer compte pour n8n | 10 min |
| railready.fr | Acheter domaine | 24h DNS |

---

## RISQUES & MITIGATION

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Coût OpenAI trop élevé | Élevé | Budget cap $50/mois, cache des réponses courantes, prompt optimisé |
| Fraude Stripe | Moyen | Radar actif, verification email obligatoire avant paiement |
| Contenu non-conforme SNCF | Élevé | Mentions légales claires, prompt systèmes restrictifs, zéro copie de docs internes |
| SEO lent à décoller | Moyen | Contenu de qualité dès J1, partenariats forums ferroviaires |
| Taux de conversion faible | Moyen | A/B test pricing, trial 7 jours, money-back 30 jours |
