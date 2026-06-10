# RAPPORT DE LIVRAISON — RailReady V2 (10 juin 2026)

Refonte complète : auth emails fiabilisée, fiches métiers nettoyées, thème rouge ferroviaire, vrais tests psychotechniques avec historique Supabase, dashboard enrichi.

---

## 1. Vérifications exécutées

| Commande | Résultat |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erreur |
| `npm run lint` | ✅ 0 erreur · 3 warnings préexistants (police custom layout.tsx, `<img>` dans Sidebar/MobileNav) |
| `npm run build` | ⚠️ Non exécutable dans l'environnement de travail (binaire SWC Linux indisponible, registre npm bloqué). **À exécuter sur ta machine avant déploiement** : `npm run build` |

---

## 2. PRIORITÉ 1 — Emails auth

### Corrections code
- **`src/lib/utils/site-url.ts`** (nouveau) : `getSiteURL()` — priorité à `NEXT_PUBLIC_APP_URL` (si ≠ localhost), puis `window.location.origin`, puis `VERCEL_URL`. **Plus aucun lien localhost possible en production.**
- **`callback/route.ts`** : gère désormais les **2 formats** de liens Supabase (`?code=` PKCE **et** `?token_hash=&type=` via `verifyOtp`), plus les erreurs renvoyées par Supabase (`?error=`, `otp_expired` → redirection propre vers `/forgot-password?error=expired`). Logs `[AuthCallback]` ajoutés.
- **`register/page.tsx`** : `emailRedirectTo` via `getSiteURL()` + log `[Register]`.
- **`forgot-password/page.tsx`** : `redirectTo` via `getSiteURL()` + affichage d'un message clair si lien expiré + log `[ForgotPassword]`.
- **`auth/reset-password/page.tsx`** : suppression de la race condition — écoute `onAuthStateChange` + délai de grâce de 2,5 s avant de déclarer le lien expiré. Logs `[ResetPassword]`.
- **middleware.ts** : vérifié, aucun blocage des routes `/callback` et `/auth/reset-password` — inchangé.

### ⚙️ Configuration Supabase REQUISE (Dashboard → Authentication → URL Configuration)
Projet : **RailReady** (`jljzzlevaeprdsvuafgp`)

| Champ | Valeur |
|---|---|
| **Site URL** | `https://VOTRE-DOMAINE-PROD` (ex : `https://railready.vercel.app`) — **jamais localhost** |
| **Redirect URLs** | `https://VOTRE-DOMAINE-PROD/callback` |
| | `https://VOTRE-DOMAINE-PROD/callback?type=recovery` |
| | `https://VOTRE-DOMAINE-PROD/auth/reset-password` |
| | `https://VOTRE-DOMAINE-PROD/**` (recommandé) |
| | `http://localhost:3000/callback` (dev) |
| | `http://localhost:3000/**` (dev) |
| | `https://*.vercel.app/**` (si previews Vercel utilisées) |

### ⚙️ Variables d'environnement Vercel REQUISES
```
NEXT_PUBLIC_APP_URL=https://VOTRE-DOMAINE-PROD   ← CRITIQUE (actuellement localhost:3000 en local, à définir sur Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://jljzzlevaeprdsvuafgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```
**C'est l'absence de `NEXT_PUBLIC_APP_URL` en prod + le Site URL Supabase resté sur localhost qui causaient les liens cassés.**

---

## 3. PRIORITÉS 2-4 — Fiches métiers
- ❌ Toutes les mentions `[À VALIDER]` supprimées (~30 occurrences dans `metiers.ts` + page À propos).
- ✅ Disclaimer unique par fiche : *« Les informations sont fournies à titre indicatif et peuvent évoluer selon les opérateurs ferroviaires. »* (constante `DISCLAIMER_METIER`, affichée une fois en bas de chaque fiche).
- ❌ Journées types avec horaires (04h45, 05h00...) supprimées sur les 7 métiers → remplacées par **« Exemple de missions »** (prise de service, préparation matériel, contrôle documentaire, communication opérationnelle, surveillance sécurité, gestion incidents, clôture du service — adapté à chaque métier).
- ❌ Avantages en nature supprimés partout (billets gratuits, aide logement, mutuelle, retraite, avantages famille) — y compris dans les listes « Avantages ». Onglet Salaire = **« Rémunération indicative »** uniquement (débutant / expérimenté).

## 4. PRIORITÉ 5 — Thème rouge
- Variables CSS : `--primary: #c62828`, `--primary-dark: #8e0000`, `--secondary: #1f2937`, `--background: #f8fafc`.
- **Stratégie : remap de la palette `blue` de Tailwind vers une rampe rouge douce** (`tailwind.config.ts`) → toute l'application (boutons, liens, badges, gradients, landing) bascule au rouge sans modifier ~25 fichiers, **zéro risque de régression de mise en page**. `blue-700` → `#c62828`, `blue-800` → `#8e0000` (hover).
- `globals.css` : gradients, watermark, hover KPI passés au rouge. Contraste AA conservé (#c62828 sur blanc ≈ 5,9:1).

## 5. PRIORITÉS 6-8 — Tests psychotechniques
Refonte totale de `psychotechnique/page.tsx` :
- **Mémoire** : 3 séries — séquence affichée puis masquée (N1 : 5 chiffres / N2 : 7 / N3 : 8 alphanumériques), questions « Quel était le 3e élément ? », « le dernier ? »... Score calculé.
- **Logique** : 10 questions chronométrées (120/100/80 s) — suites arithmétiques, géométriques (2 4 8 16), carrés (1 4 9 16), lettres (A C E G), Fibonacci, alternées.
- **Concentration** : 6 grilles chronométrées (5×5 → 7×7) — trouver l'intrus (A/Λ, O/Q, 6/9...).
- **Rapidité** : 20 questions, chrono global (90/75/60 s) — calcul mental + reconnaissance rapide.
- **Bilan complet** (P7) : enchaîne les 4 modules → scores par module en %, score global, points forts, axes d'amélioration, **compatibilité psychotechnique indicative**.
- **Historique** (P8) : table `psycho_sessions` (id, user_id, module, score, niveau, created_at) **créée et appliquée** sur le projet Supabase, avec RLS (chaque utilisateur ne voit que ses données) + index. Chaque exercice terminé est sauvegardé ; la page affiche exercices réalisés, meilleur score, dernier score, progression.

Migration : `supabase/migrations/013_psycho_sessions.sql` — **déjà appliquée en production Supabase** ✅

## 6. PRIORITÉS 9-10 — Dashboard
- Conservés : score compatibilité, métier recommandé, système d'étapes, entretiens.
- Ajoutés (section « Psychotechnique ») : **dernier score, progression, meilleur score, nombre total d'exercices** (requête `psycho_sessions`).
- **Points forts / À travailler** : nouvelles cartes alimentées par les `results` du test de compatibilité (`pointsForts` / `pointsVigilance`, fallback sur les dimensions les plus fortes/faibles) — plus rien de statique.

---

## 7. Fichiers modifiés

**Nouveaux**
- `src/lib/utils/site-url.ts`
- `supabase/migrations/013_psycho_sessions.sql`
- `.eslintrc.json` (config lint manquante — `next/core-web-vitals`, règle apostrophes FR désactivée)

**Modifiés**
- `src/app/(auth)/callback/route.ts`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/data/metiers.ts`
- `src/app/(dashboard)/metiers/[slug]/MetierTabs.tsx`
- `src/app/a-propos/page.tsx`
- `tailwind.config.ts`
- `src/app/globals.css`
- `src/app/(dashboard)/psychotechnique/page.tsx` (refonte complète)
- `src/app/(dashboard)/dashboard/page.tsx`

## 8. Commandes Git
```bash
git add -A
git commit -m "V2: auth emails fiabilisée, thème rouge, vrais tests psychotechniques + historique, dashboard enrichi, fiches métiers nettoyées"
git push origin main
```

## 9. Checklist avant déploiement
1. `npm run build` en local (non exécutable dans mon environnement — voir §1).
2. Définir `NEXT_PUBLIC_APP_URL` sur Vercel (Production).
3. Configurer Supabase Auth → URL Configuration (tableau §2).
4. Tester : inscription → email reçu → lien → `/dashboard` ; mot de passe oublié → lien → `/auth/reset-password`.

## 10. Risques / points d'attention
- **Palette** : la rampe `blue` Tailwind est remappée vers le rouge — tout nouveau composant utilisant `blue-*` sera rouge (voulu). Les états d'erreur utilisent la rampe `red-*` standard, légèrement plus vive que le rouge primaire : distinction acceptable mais à surveiller.
- **Anciennes données** : les champs supprimés de `metiers.ts` (`journee_type`, `avantages_nature`, `primes`, notes) n'étaient utilisés que par `MetierTabs` — vérifié, aucune autre référence.
- **`next.config.ts`** : fichier mort (Next 14 ne lit que `next.config.js`) — peut être supprimé.
- **Migration 013** : idempotente (`IF NOT EXISTS`), déjà appliquée ; le fichier reste dans `supabase/migrations/` pour la traçabilité.
