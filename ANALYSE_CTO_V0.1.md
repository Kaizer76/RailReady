# RailReady — Analyse CTO : Réduction au MVP V0.1
### Objectif : 50 premiers utilisateurs — 1 développeur — 30 jours maximum

> Date d'analyse : 2026-06-02
> Verdict principal : **L'architecture V1 est celle d'un produit à 500 utilisateurs, pas à 50.
> Il faut couper 60% du scope sans perdre la valeur core.**

---

## PARTIE 1 — DIAGNOSTIC : CE QUI A ÉTÉ SURDIMENSIONNÉ

L'architecture initiale contient plusieurs sur-ingénieries critiques pour un MVP solo :

| Problème identifié | Impact temps | Décision |
|---|---|---|
| 5 agents IA distincts | +10 jours | → 1 seul agent (recrutement) |
| Claude API en parallèle d'OpenAI | +3 jours + coût double | → Supprimer Claude API en V0 |
| n8n self-hosted sur Railway | +2 jours d'infra | → Supprimer, email manuel via Resend |
| Zustand stores + SWR + React Query | +2 jours | → useState + Supabase client suffit |
| Tests E2E Playwright | +2 jours | → Tests manuels en V0 |
| Dashboard avec widgets complexes | +3 jours | → 1 page profil simple |
| Radar chart Recharts + animations | +1 jour | → Score textuel + barre simple |
| Rate limiting Upstash Redis | +1 jour | → Vérification DB suffisante en V0 |
| 3 plans tarifaires (Free/Starter/Pro) | Confusion UX | → 1 seul plan payant |
| OAuth Google | +0.5 jour | → Optionnel, email/mdp suffit |

**Total estimé récupéré : 24–28 jours de développement éliminés.**

---

## PARTIE 2 — FONCTIONNALITÉS : INDISPENSABLE vs À REPORTER

### ✅ INDISPENSABLE — Bloc V0.1 (ce qui crée la valeur pour les 50 premiers)

Ces 5 blocs constituent le produit minimum différenciant. Sans l'un d'eux, RailReady n'est qu'un site vitrine.

**1. Landing page + Inscription email**
*Pourquoi indispensable :* Sans acquisition, aucun utilisateur. Sans inscription, aucune donnée.
- Page d'accueil avec proposition de valeur (3 phrases max)
- Formulaire inscription email/mdp
- Page de confirmation

**2. Test de compatibilité (14 questions)**
*Pourquoi indispensable :* C'est le premier outil à valeur immédiate — gratuit, engageant, partageable. Il qualifie le besoin de l'utilisateur ET lui donne envie d'aller plus loin.
- Quiz linéaire 14 questions (déjà en base)
- Score sur 100 avec 3 niveaux de résultat (Faible/Moyen/Fort)
- Recommandation de métier textuelle (pas de graphe)
- Résultat sauvegardé dans Supabase

**3. Fiches métiers (4 métiers)**
*Pourquoi indispensable :* SEO organique dès J+30. Valeur informative qui retient l'utilisateur. Contexte pour les deux autres fonctionnalités.
- 4 pages statiques (conducteur, circulation, contrôleur, maintenance)
- Contenu complet issu du seed SQL
- Pas de système de filtrage ni de recherche en V0

**4. Simulateur d'entretien IA (1 agent, 1 métier)**
*Pourquoi indispensable :* C'est la fonctionnalité différenciante irremplaçable. Aucun concurrent ne la propose avec ce niveau de personnalisation. C'est aussi le seul motif de paiement en V0.
- 1 agent recrutement (conducteur de train en priorité, le plus recherché)
- Interface chat simple (pas d'avatar, pas d'animation de frappe)
- Streaming GPT-4o
- Évaluation textuelle finale (pas de JSON structuré en V0)
- **Limité à 1 session gratuite** puis paiement

**5. Paiement Stripe (1 plan uniquement)**
*Pourquoi indispensable :* Valider la volonté de payer est la seule preuve de marché qui compte. 1 vente > 1000 inscrits gratuits.
- 1 plan : "Accès complet" à 14,90€/mois
- Checkout Stripe en 1 clic
- Webhook simple (activated/canceled)
- Accès illimité au simulateur + 4 métiers en entretien

---

### ❌ À REPORTER — Post-validation marché (V0.2 et au-delà)

Ces fonctionnalités sont réelles mais prématurées. Les builder maintenant serait construire sur des hypothèses non validées.

| Fonctionnalité | Pourquoi reporter | Quand la débloquer |
|---|---|---|
| Agent Coach Formation | Demande 3+ modules rédigés (30h de contenu) + interface dédiée | Quand 20 users demandent explicitement "comment se former" |
| QCM interactifs | Dépend du Coach, sans lui inutile | Après V0.2 |
| Agents spécialisés (Circulation, Contrôleur, Maintenance) | 1 agent validé suffit pour prouver le concept | Après 30 paiements sur conducteur |
| Dashboard avec statistiques | Complexe, peu de données en V0 | Après 100 sessions |
| Tableau de progression | Idem — rien à montrer sans historique riche | Après V0.2 |
| OAuth Google | Friction réduite mais 2 jours de dev | Quand le taux d'abandon inscription > 40% |
| n8n / automatisations email | Emails manuels via Resend suffisent pour 50 users | Après 200 inscrits |
| Blog SEO | Important long terme, mais 0 impact J+30 | Après stabilisation produit |
| Abonnement annuel | Confusion pricing | Après 50 abonnés mensuels |
| Plan "Gratuit" avec 3 sessions/mois | Trop généreux — réduit l'urgence de payer | Tester freemium vs paywall strict d'abord |
| Radar chart / visualisations | Jolie mais sans valeur fonctionnelle ajoutée | Jamais peut-être |
| Mobile natif | Next.js responsive suffit | Si trafic mobile > 60% |

---

## PARTIE 3 — COÛTS MENSUELS ESTIMÉS

### V0.1 — Phase lancement (0–50 utilisateurs, ~10 actifs/mois)

| Service | Plan | Coût/mois | Notes |
|---|---|---|---|
| Vercel | Hobby | **0€** | Suffisant jusqu'à ~50k req/mois |
| Supabase | Free | **0€** | 500 MB DB, 50k auth users — largement suffisant |
| OpenAI API | Pay-as-you-go | **~15–30€** | GPT-4o : ~0,01$/1k tokens. 50 sessions × 3000 tokens = ~1,5M tokens = ~15$ |
| Stripe | % transaction | **~3% des revenus** | Pas de coût fixe si < 1M€ |
| Resend | Free | **0€** | 3 000 emails/mois gratuit |
| Domaine railready.fr | Annuel | **~1€/mois** | ~12€/an |
| **TOTAL FIXE** | | **~16–31€/mois** | Hors revenus Stripe |

**Break-even financier : 2 abonnés à 14,90€ couvrent l'infra.**

### V0.2 — Phase croissance (50–200 utilisateurs)

| Service | Upgrade | Coût/mois |
|---|---|---|
| Vercel | Pro (si dépassement) | 20€ |
| Supabase | Pro | 25€ |
| OpenAI API | Volume estimé × 10 | ~150–300€ |
| Resend | Free → Starter | 0–20€ |
| **TOTAL estimé** | | **~200–370€/mois** |

**Break-even : 25 abonnés à 14,90€ = 372€ → couvre l'infra à partir de ~25 clients payants.**

### ⚠️ Point d'attention coûts IA

GPT-4o est le principal levier de coût variable. Avec un prompt système de ~1500 tokens + 20 échanges × ~200 tokens/message = ~6000 tokens/session. À $0.015/1k tokens input + $0.06/1k tokens output, **une session coûte environ 0,35–0,50€**. À 14,90€/abonnement, la marge brute sur l'IA est de ~97%. Viable.

**Optimisation recommandée dès V0** : utiliser `gpt-4o-mini` pour les messages de coaching (3x moins cher), garder `gpt-4o` uniquement pour l'évaluation finale.

---

## PARTIE 4 — RISQUES JURIDIQUES VIS-À-VIS DE LA SNCF

### 4.1 Statut juridique de RailReady

RailReady est une **plateforme indépendante d'information et de préparation**. Elle ne prétend pas être affiliée à la SNCF. Ce positionnement est correct mais insuffisant sans précautions contractuelles.

### 4.2 Risques identifiés

**RISQUE ÉLEVÉ — Marque et dénomination**
- Le nom "RailReady" ne contient pas de terme SNCF, TGV ou autre marque déposée : ✅ safe
- **Attention** : toute utilisation du logo SNCF, des couleurs corporate (rouge/blanc), du logo TGV, OUIGO, TER dans les visuels constitue une contrefaçon de marque. **Même "pour illustrer".**
- **Action requise** : utiliser exclusivement des illustrations génériques (train abstrait, pictogramme). Jamais de logo SNCF.

**RISQUE ÉLEVÉ — Reproduction de contenus officiels**
- Les questions d'examen SNCF (test psychotechnique, test aptitude conducteur) sont confidentielles et potentiellement protégées par le droit d'auteur
- Reproduire même partiellement le "référentiel de compétences conducteur" publié par l'EPSF (Établissement Public de Sécurité Ferroviaire) sans autorisation = risque réel
- **Action requise** : tous les contenus pédagogiques doivent être rédigés de zéro avec des mots différents, pas résumés/paraphrasés depuis des docs officiels

**RISQUE MOYEN — Promesses excessives**
- Tout texte du type "Garantit l'embauche", "Identique aux vrais tests SNCF", "Préparation officielle" constitue une publicité mensongère (art. L121-2 Code de la consommation)
- **Action requise** : utiliser systématiquement "simulation réaliste", "inspiré des pratiques du secteur", "préparation indépendante"

**RISQUE FAIBLE MAIS RÉEL — Dénigrement concurrentiel**
- Comparer défavorablement RailReady aux offres de formation SNCF (comme "SNCF Académie") sans données vérifiables = risque de dénigrement
- **Action requise** : ne jamais citer la concurrence par nom dans les comparatifs marketing

**RISQUE FAIBLE — Information fausse sur les conditions d'emploi**
- Publier des salaires ou conditions incorrects (hors date, inexacts) engage la responsabilité du site pour information trompeuse
- **Action requise** : dater toutes les informations sur les salaires, mentionner les sources ("selon les grilles publiques de branche"), prévoir mise à jour annuelle

### 4.3 Protections minimales à mettre en place avant le lancement

```
Documents légaux OBLIGATOIRES (délai : avant toute inscription) :
├── Mentions légales (éditeur, hébergeur, responsable publication)
├── CGU (Conditions Générales d'Utilisation)
│   └── Clause : "RailReady n'est pas affilié à la SNCF ni à aucun opérateur ferroviaire"
│   └── Clause : "Les simulations sont des outils pédagogiques, pas des tests officiels"
│   └── Clause : "Les résultats n'engagent pas les employeurs du secteur"
├── CGV (Conditions Générales de Vente) + politique de remboursement
│   └── Droit de rétractation 14 jours (obligatoire en B2C UE)
└── Politique de confidentialité RGPD (voir Partie 5)
```

**Coût : 300–800€ via un avocat spécialisé, ou utiliser des modèles de CGU/CGV d'un service comme Iubenda (~9€/mois) en V0.**

---

## PARTIE 5 — RISQUES RGPD

### 5.1 Données collectées et leur classification

| Donnée | Sensibilité | Base légale requise |
|---|---|---|
| Email + nom | Personnelle | Consentement au signup |
| Messages d'entretien IA | Potentiellement sensible (révèle comportements, niveau scolaire) | Consentement explicite |
| Score de compatibilité | Non sensible | Contrat (service) |
| Historique de sessions | Personnel | Contrat (service) |
| Données de paiement | Financière (traitée par Stripe, pas stockée) | Contrat |

### 5.2 Risques RGPD identifiés

**RISQUE ÉLEVÉ — Sous-traitants hors UE sans garanties**
- OpenAI traite les messages utilisateurs sur des serveurs américains. En V0, les messages d'entretien contiennent du contenu personnel (réponses comportementales, situations professionnelles).
- OpenAI signe des DPA (Data Processing Agreements) compatibles RGPD — **à signer impérativement avant le lancement.**
- Supabase est hébergeable en région UE (eu-west-1) — **à configurer lors de la création du projet Supabase.**
- Vercel propose des régions EU — **à activer.**

**RISQUE ÉLEVÉ — Absence de politique de confidentialité détaillée**
- Le RGPD exige d'informer les utilisateurs sur : qui traite quoi, dans quel but, pour combien de temps, avec quels sous-traitants.
- Sans cette page, amende CNIL possible (même pour petite structure).

**RISQUE MOYEN — Durée de conservation des données**
- Les messages d'entretien IA n'ont pas de durée de vie définie dans l'architecture actuelle.
- **Action requise** : définir une rétention de 12 mois maximum pour les sessions IA, supprimer automatiquement les messages via un job CRON Supabase.

**RISQUE MOYEN — Droit à l'effacement non implémenté**
- L'architecture prévoit "suppression compte + données sur demande" mais aucun bouton/workflow n'est codé.
- **Action requise** : bouton "Supprimer mon compte" en V0 qui déclenche un DELETE CASCADE sur le profil (déjà prévu dans le schéma SQL via ON DELETE CASCADE — bien).

**RISQUE FAIBLE — Cookies et tracking**
- Vercel Analytics utilise des cookies.
- **Action requise** : bannière cookie minimale en V0 (un simple composant, pas besoin d'un CMP complexe pour < 50 users).

### 5.3 Checklist RGPD minimum pour le lancement

- [ ] Politique de confidentialité publiée (page /privacy)
- [ ] DPA signé avec OpenAI (gratuit, en ligne)
- [ ] Supabase créé en région EU
- [ ] Vercel région EU
- [ ] Bouton "Supprimer mon compte" fonctionnel
- [ ] Email de confirmation de suppression
- [ ] Définir rétention données : sessions IA = 12 mois, profil = durée abonnement + 6 mois
- [ ] Pas d'email marketing sans double opt-in explicite

---

## PARTIE 6 — RISQUES LIÉS AUX CONTENUS FERROVIAIRES

### 6.1 Risque de désinformation sécuritaire

**RISQUE ÉLEVÉ — Procédures de sécurité inventées**
Le risque le plus grave : si l'agent IA génère une procédure de sécurité incorrecte (ex: "en cas d'obstacle sur la voie, freinez à X m"), un candidat pourrait l'intégrer comme vraie et causer un accident une fois en poste.

**Mitigation impérative** :
- Prompt système avec instruction stricte : *"Ne jamais décrire de procédures d'urgence précises. En cas de question sur les procédures, renvoyer vers la formation officielle."*
- Disclaimer visible dans l'interface : *"Les simulations RailReady sont des outils de préparation comportementale. Les procédures techniques réelles sont enseignées exclusivement par les organismes de formation agréés."*
- Le prompt actuel (recrutement-agent.ts) est bon sur ce point mais doit être durci sur les questions techniques.

### 6.2 Risque de simulation non représentative

**RISQUE MOYEN — Donner de faux espoirs ou décourager injustement**
Un score de 45/100 au test de compatibilité pourrait décourager un candidat viable, ou un 90/100 surconfier quelqu'un qui n'est pas adapté.

**Mitigation** :
- Ajouter systématiquement : *"Ce test est un outil de réflexion, pas un test de recrutement officiel. Seul un médecin du travail et les tests psychotechniques SNCF déterminent l'aptitude réelle."*
- Ne jamais utiliser les termes "apte" / "inapte" dans les résultats.

### 6.3 Risque de contenu périmé

**RISQUE FAIBLE MAIS PROGRESSIF**
Les conditions, salaires, procédures de recrutement évoluent. Un contenu exact en 2026 peut être trompeur en 2027.

**Mitigation** :
- Dater tous les contenus ("Informations mises à jour en juin 2026")
- Prévoir une révision semestrielle du contenu des fiches métiers
- Mention systématique : "Informations indicatives — se référer aux offres d'emploi officielles"

---

## PARTIE 7 — MVP V0.1 : PLAN RÉALISTE SOLO 30 JOURS

### Périmètre final V0.1 — Ce qui sera livré

```
railready-v0.1/
├── Landing page                    ← 2 jours
├── Auth email/mdp (Supabase)       ← 1 jour
├── 4 fiches métiers statiques      ← 2 jours (contenu + pages)
├── Test compatibilité 14 questions ← 3 jours
│   └── Score + résultat textuel
├── Simulateur entretien IA         ← 5 jours
│   └── 1 agent (conducteur) + GPT-4o
│   └── Interface chat streaming
│   └── Évaluation texte finale
├── Paiement Stripe (1 plan)        ← 2 jours
│   └── 14,90€/mois
│   └── Webhook + accès débloqué
├── Profil utilisateur simple       ← 1 jour
│   └── Mes résultats + mon abonnement
├── Mentions légales + CGU + RGPD  ← 1 jour
└── Déploiement + DNS              ← 0.5 jour

TOTAL : ~17–18 jours de développement effectif
```

**Ce qui N'EST PAS dans V0.1 :**
- Coach IA / Formation / QCM
- Agents spécialisés (circulation, contrôle, maintenance)
- Dashboard statistiques
- n8n / automatisations
- Blog / SEO articles
- OAuth Google
- Tests E2E
- Animations / Framer Motion

### Planning jour par jour

| Jours | Bloc | Livrable concret |
|---|---|---|
| J1–J2 | Setup + Auth | Next.js + Supabase + login/register fonctionnel en local |
| J3–J4 | Landing page | railready.fr en ligne avec formulaire inscription |
| J5–J6 | Fiches métiers | 4 pages /metiers/[slug] avec contenu complet |
| J7–J9 | Test compatibilité | Quiz 14 questions → score → résultat textuel |
| J10–J14 | Agent entretien IA | Chat streaming + 1 session gratuite + paywall |
| J15–J16 | Stripe | Checkout + webhook + accès débloqué après paiement |
| J17 | Page profil | Résultats quiz + abonnement actif/inactif |
| J18 | Légal + RGPD | CGU + Privacy + bouton suppression compte |
| J19 | Tests manuels | Parcours complet inscription → paiement → entretien |
| J20 | Déploiement | DNS + SSL + Supabase EU + prod |
| J21–J25 | **BUFFER** | Bugs, polish UX, contenu fiches métiers |
| J26–J27 | Acquisition | Posts LinkedIn, Reddit r/SNCF, cheminotcommunity |
| J28–J30 | Observation | Analyser comportement des 10 premiers users, pivoter si besoin |

### Stack V0.1 réduite

| Supprimé | Remplacé par |
|---|---|
| Claude API (Anthropic) | GPT-4o uniquement |
| n8n | Resend direct depuis l'API route signup |
| Zustand | useState local + Supabase realtime |
| Recharts (radar) | Texte + une div avec CSS pour barre de score |
| Playwright E2E | Tests manuels sur 3 parcours critiques |
| Upstash Redis (rate limit) | Vérification en DB (check_session_limit déjà codé) |
| 3 plans tarifaires | 1 plan à 14,90€/mois |

### Budget V0.1

| Poste | Montant |
|---|---|
| Domaine railready.fr | 12€/an |
| OpenAI (50 sessions test) | ~20€ |
| Iubenda CGU/CGV | 9€/mois |
| **Total lancement** | **~41€** |

---

## PARTIE 8 — CRITÈRES DE VALIDATION AVANT DE PASSER EN V0.2

Ne pas construire V0.2 avant d'avoir validé ces 4 signaux :

| Signal | Seuil minimum | Méthode de mesure |
|---|---|---|
| **Rétention** | 30% des inscrits reviennent J+7 | Supabase last_seen_at |
| **Engagement** | 50% des inscrits font le test compatibilité | user_quiz_sessions.status = completed |
| **Monétisation** | Au moins 5 paiements réels | Stripe Dashboard |
| **Feedback** | 10 retours qualitatifs collectés | Email direct / Tally form |

**Si l'un de ces seuils n'est pas atteint à J+45**, il faut d'abord comprendre pourquoi avant de coder la prochaine fonctionnalité. La réponse n'est presque jamais "ajouter une feature" — elle est dans le positionnement, le message ou le canal d'acquisition.

---

## RÉSUMÉ EXÉCUTIF

| Dimension | V1 initiale | V0.1 recommandée |
|---|---|---|
| Fonctionnalités | 8 blocs | 5 blocs |
| Agents IA | 5 | 1 |
| Durée estimée (solo) | 30+ jours réels | 18–20 jours |
| Coût mensuel infra | ~60–80€ | ~16–30€ |
| Risque juridique | Non adressé | Adressé (légal minimum) |
| Risque RGPD | Partiel | Couvert (checklist complète) |
| Premier paiement possible | J+21 | **J+16** |
| Validation marché | Hypothétique | Mesurable à J+45 |
