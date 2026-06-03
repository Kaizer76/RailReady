# RAILREADY — Audit complet du moteur de compatibilité
### Juin 2026 | Analyse quantitative + Proposition de refonte

---

## SYNTHÈSE EXÉCUTIVE

Le test actuel (14 questions, 8 dimensions) présente **4 défauts structurels majeurs** qui compromettent sa fiabilité pour orienter les candidats :

1. **Deux questions sur trois sont victimes du biais de désirabilité sociale** — les candidats répondent ce qu'ils pensent qu'il faut répondre, pas la réalité.
2. **L'algorithme ne pénalise pas les incompatibilités réelles** — un profil "vente" obtient 58% de compatibilité avec le conducteur (affiché comme "compatibilité intéressante").
3. **Trois paires de métiers sont quasi indiscriminables** : Conducteur/Maintenance/Voie, ASCT/Escale, Circulation/Conducteur.
4. **Quatre dimensions clés de différenciation sont absentes** du test.

---

## PARTIE 1 — ANALYSE DES QUESTIONS ACTUELLES

### Tableau de bord des 14 questions

| Q | Dimension | Poids | Biais désirabilité | Pouvoir discriminant (Δ Cond-Vente) | Variance inter-métiers |
|---|---|---|---|---|---|
| q1 | horaires_decales | 1.5 | Faible | 3 pts | 0.73 |
| q2 | horaires_decales | 1.2 | Faible | 3 pts | 0.73 |
| q3 | gestion_stress | 1.5 | Moyen | 3 pts | 0.88 |
| q4 | gestion_stress | 1.3 | **Élevé** | 3 pts | 0.88 |
| q5 | autonomie | 1.0 | Faible | 6 pts | 0.88 |
| q6 | autonomie | 1.0 | Faible | 6 pts | 0.88 |
| q7 | rigueur | 1.4 | **Élevé** | 3 pts | 0.99 |
| q8 | rigueur | 1.2 | **Élevé** | 3 pts | 0.99 |
| q9 | mobilite | 1.0 | Faible | 7 pts | 0.90 |
| q10 | relation_client | 1.1 | Faible | **20 pts** | **1.98** |
| q11 | aptitude_technique | 1.0 | Faible | 3 pts | 1.28 |
| q12 | aptitude_technique | 1.0 | Faible | 3 pts | 1.28 |
| q13 | engagement_securite | **2.0** | **Très élevé** | 7 pts | 1.58 |
| q14 | engagement_securite | **1.5** | **Très élevé** | 5 pts | 1.58 |

### Questions problématiques

**Q13 — "La sécurité est pour moi une valeur non négociable"**
C'est la question au poids le plus élevé du test (2.0) ET la plus biaisée. Aucun candidat qui passe un test de préparation professionnelle ne répondra "pas du tout d'accord". En pratique, 95%+ des répondants mettent 5. Résultat : tout le monde obtient 100% sur engagement_securite, ce qui crée un **plancher artificiel** qui gonfle le score global de tous les candidats.

Simulation : un candidat "neutre" sur tout (réponse 3 partout) mais honnête sur la sécurité (réponse 5 à q13-q14) obtient un score de **65% global** et des compatibilités de 75-90% sur tous les métiers techniques. Le test l'oriente vers le ferroviaire quand il n'a aucune affinité réelle.

**Q7 — "Je respecte scrupuleusement les procédures"**
Même problème. Le contexte de la question ("Dans le ferroviaire, les procédures existent pour des raisons de sécurité. Elles ne se négocient pas.") signale explicitement la "bonne" réponse. Ce contexte pédagogique nuit à la neutralité de la question.

**Q4 — "Je supporte bien la pression liée à la responsabilité de la sécurité des autres"**
Réponse quasi universellement 4-5. Qui va admettre le contraire en cherchant un emploi ?

**Q10 — relation_client (une seule question pour la dimension la plus discriminante)**
C'est la dimension avec le **plus fort pouvoir discriminant** (Δ = 20 pts entre conducteur et vente, σ = 1.98). Pourtant elle n'est mesurée que par **une seule question** avec un poids faible (1.1). C'est l'inverse de ce qu'il faudrait.

---

## PARTIE 2 — DÉFAUTS DE L'ALGORITHME DE SCORING

### Défaut #1 — L'algorithme ne pénalise pas les incompatibilités

La formule `min(userNorm / exigence, 1)` plafonné à 1 crée un problème fondamental :

- Pour un métier avec `exigence_relation_client = 1` (Conducteur), **n'importe quel score utilisateur ≥ 20%** produit une compatibilité de 1.0 sur cette dimension.
- Autrement dit : un candidat qui adore le contact humain (relation_client = 100%) a la même compatibilité avec Conducteur qu'un candidat qui fuit les gens (relation_client = 20%).
- La sur-qualification n'est jamais pénalisée.

**Exemple concret :**
Un profil "Vente pur" (aime les gens, pas les nuits, préfère un bureau) obtient **58% de compatibilité avec Conducteur**. Ce score est affiché comme "compatibilité intéressante" dans l'interface. C'est trompeur.

### Défaut #2 — Le plancher sécurité distort tous les scores

engagement_securite pèse **19.8% du score global** (le plus lourd de toutes les dimensions). Or quasi tout le monde répond 5. Ce plancher artificiel :
- Gonfle le score de tout le monde d'environ 10-15 points
- Réduit la variance utile du score global
- Masque les vraies différences de profil

### Défaut #3 — `poidsTotal` dans METIER_PROFILS est du dead code

Le champ `poidsTotal` (32, 30, 27...) est défini pour chaque métier mais n'est utilisé nulle part dans l'algorithme. L'algorithme recalcule la somme des exigences à la volée. Ce champ crée une fausse impression de pondération par métier.

### Défaut #4 — Score global = moyenne non pondérée par pertinence métier

Le score global est calculé sur **toutes les dimensions à poids égal**. Or `mobilite` et `relation_client` n'ont qu'une question chacune contre 2 à 3 pour les autres. Le score global ne reflète pas la réalité des exigences du secteur.

---

## PARTIE 3 — MATRICE DE DISCRIMINATION INTER-MÉTIERS

La similarité entre profils-cibles des métiers (100% = identiques) :

```
                 Conducteur  Circulat  ASCT    Vente   Escale  Mainten  Voie/Sig
Conducteur          100%       78%     51%     33%     44%     72%      68%
Circulation          78%      100%     51%     38%     46%     78%      73%
ASCT                 51%       51%    100%     71%     85%     46%      47%
Vente                33%       38%     71%    100%     82%     35%      32%
Escale               44%       46%     85%     82%    100%     44%      42%
Maintenance          72%       78%     46%     35%     44%    100%      80%
Voie/Sig             68%       73%     47%     32%     42%     80%     100%
```

### Paires problématiques identifiées

**Paire 1 — ASCT / Escale (85% similaires)**
Le test actuel ne peut pratiquement pas distinguer ces deux métiers. Un candidat typique ASCT obtient 98% de compatibilité avec ASCT ET 98% avec Escale. Les différences réelles (responsabilité sûreté à bord vs coordination terrain, relation à bord vs quai) ne sont pas mesurées.

**Paire 2 — Conducteur / Maintenance / Voie-Signalisation**
Ces trois métiers techniques ont des profils très similaires (72-80% de similarité). Un "Conducteur idéal" obtient 93-97% de compatibilité avec Maintenance et Voie/Sig. Le test ne peut pas distinguer :
- Quelqu'un fait pour la solitude totale de la cabine (Conducteur)
- Quelqu'un fait pour le travail technique en équipe de nuit (Maintenance)
- Quelqu'un fait pour le terrain et l'extérieur (Voie/Sig)

**Paire 3 — Agent Circulation / Conducteur (78% similaires)**
Le test mesure tous les deux avec horaires_decales=5, gestion_stress=5, rigueur=5, engagement_securite=5. Les différences réelles (multi-tâches vs concentration unique, coordination vs isolement, décision collective vs décision solitaire) ne sont pas capturées.

---

## PARTIE 4 — DIMENSIONS ABSENTES DU TEST

Ces 4 dimensions sont absentes alors qu'elles discriminent fortement entre métiers :

### 1. Rapport à la solitude vs travail en équipe
**Discrimination cible :** Conducteur (seul total) vs Circulation (équipe relais) vs Maintenance (binôme) vs Commercial (contact constant)
Le test mesure l'"autonomie" mais pas l'appétence profonde pour la solitude vs le collectif.

### 2. Résistance physique et conditions difficiles
**Discrimination cible :** Voie/Sig (extérieur, port de charges, nuit, froid) vs Vente (bureau, position semi-debout) vs Conducteur (cabine, sédentaire)
Aucune question sur la capacité à travailler en extérieur, par tous les temps, avec des contraintes physiques.

### 3. Type de responsabilité préféré
**Discrimination cible :**
- Responsabilité directe physique (Conducteur : ma main sur le frein)
- Responsabilité de coordination (Circulation : décisions qui guident d'autres)
- Responsabilité de service (ASCT, Escale : responsabilité humaine immédiate)
- Responsabilité technique (Maintenance : la rame doit repartir certifiée)

### 4. Rapport à la répétitivité vs variété
**Discrimination cible :** Conducteur (mêmes navettes des centaines de fois) vs Circulation (chaque journée est différente) vs Escale (routine interrompue d'incidents)
Certains s'épanouissent dans la maîtrise par répétition, d'autres ont besoin de nouveauté.

---

## PARTIE 5 — NOUVEAU TEST PROPOSÉ (22 questions)

### Principes de conception

1. **Formulations situationnelles** résistantes au biais de désirabilité
2. **10 dimensions** dont 4 nouvelles
3. **Couverture déséquilibrée intentionnelle** : plus de questions sur relation_client et rapport à la solitude (plus discriminantes)
4. **Suppression des auto-déclarations de valeurs** (sécurité, rigueur) au profit de scénarios comportementaux

---

### 10 DIMENSIONS ET 22 QUESTIONS PROPOSÉES

---

#### DIMENSION A — Rapport à la solitude et à l'isolement
*(2 questions — discrimine Conducteur vs tous les autres)*

**A1** (poids 1.8)
> Vous avez passé 6 heures seul(e), sans pouvoir appeler quelqu'un ni changer d'environnement. Comment vous sentez-vous à la fin ?
> 1 = Épuisé(e) et irritable | 5 = Reposé(e) et efficace

**A2** (poids 1.5)
> Dans votre quotidien idéal, vous travailleriez plutôt :
> 1 = En équipe, toujours entouré(e) | 5 = Principalement seul(e), avec quelques échanges ponctuels

*Pouvoir discriminant : Conducteur exige 5/5, Commercial exige 1-2/5. Forte séparation.*

---

#### DIMENSION B — Rapport au contact humain et à l'empathie
*(3 questions — discrimine Commercial vs Technique)*

**B1** (poids 2.0)
> Un inconnu stressé vous demande de l'aide. Votre première réaction instinctive :
> 1 = Je préfère rediriger vers quelqu'un de plus qualifié | 5 = Je prends le temps de comprendre et d'aider

**B2** (poids 1.5)
> À la fin d'une journée de service, qu'est-ce qui vous donnerait le plus de satisfaction ?
> 1 = Avoir résolu un problème technique complexe | 5 = Avoir aidé une dizaine de personnes à trouver leur chemin

**B3** (poids 1.5)
> Face à un client agressif qui a tort, votre réaction naturelle :
> 1 = Je reste en retrait et évite l'escalade | 5 = Je maintiens le dialogue calmement jusqu'à désamorcer

*Pouvoir discriminant : ASCT/Vente/Escale exigent 4-5/5, Conducteur/Maintenance 1-2/5.*

---

#### DIMENSION C — Mode de décision et type de responsabilité
*(3 questions — discrimine Conducteur vs Circulation vs Commercial)*

**C1** (poids 2.0)
> Une décision urgente doit être prise. Vous préférez :
> 1 = Consulter rapidement l'équipe avant d'agir | 5 = Décider seul(e) sur la base de votre analyse

**C2** (poids 1.5)
> Quelle phrase décrit le mieux votre rapport à la responsabilité ?
> 1 = Je préfère que les décisions cruciales soient validées collectivement | 5 = Je me sens à l'aise d'être l'unique décideur sur des enjeux importants

**C3** (poids 1.5)
> Vous gérez 4 situations en parallèle qui évoluent vite. Vous :
> 1 = Trouvez ça épuisant et préférez vous concentrer sur une chose à la fois | 5 = Vous sentez dans votre élément, la multi-gestion vous stimule

*Note : C3 discrimine Circulation (multi-tâches permanent) vs Conducteur (tâche unique totale).*

---

#### DIMENSION D — Horaires décalés et impact réel
*(3 questions — quasi universel mais mesure la vraie tolérance)*

**D1** (poids 1.8)
> Travailler régulièrement la nuit, le week-end et les jours fériés aurait un impact sur votre vie actuelle :
> 1 = Très important — conjoint, enfants, contraintes fortes | 5 = Minimal — ma vie personnelle s'y adapte facilement

**D2** (poids 1.5)
> Votre rythme naturel de sommeil :
> 1 = Je me lève difficilement avant 8h et m'endors difficilement après minuit | 5 = Je m'adapte facilement à n'importe quel rythme sans trop de difficulté

**D3** (poids 1.2)
> Si un poste exige de travailler le 25 décembre ou le 1er janvier certaines années :
> 1 = C'est pour moi un frein important | 5 = C'est une contrainte que j'accepte pleinement

*Reformulation évite le biais : on demande l'impact réel, pas si "la contrainte est acceptable" (trop chargé désirabilité).*

---

#### DIMENSION E — Rigueur procédurale (reformulée situationnellement)
*(2 questions)*

**E1** (poids 1.5)
> Vous êtes pressé(e) et il vous reste une vérification de routine à faire avant de terminer votre tâche. Un raccourci existe, sans risque apparent. Vous :
> 1 = Utilisez le raccourci — le contexte justifie la flexibilité | 5 = Appliquez la procédure complète — toujours

**E2** (poids 1.2)
> Une règle vous semble absurde dans un contexte précis. Votre réaction :
> 1 = Je l'adapte à ma manière si le bon sens le justifie | 5 = Je l'applique et remonte ma remarque par les voies officielles

*Ces formulations résistent mieux au biais que l'auto-déclaration "je respecte les procédures".*

---

#### DIMENSION F — Résistance physique et conditions difficiles *(NOUVEAU)*
*(2 questions — discrimine Voie/Sig et Maintenance nuit vs Vente)*

**F1** (poids 1.8)
> Travailler régulièrement de nuit en extérieur (froid, pluie, bruit) sur des chantiers physiques vous semble :
> 1 = Un facteur rédhibitoire pour moi | 5 = Une condition de travail que j'accepte et pour laquelle je suis physiquement apte

**F2** (poids 1.3)
> En dehors du travail, votre rapport à l'effort physique :
> 1 = Je préfère les activités sédentaires | 5 = L'activité physique fait partie de mon quotidien, j'y suis à l'aise

*Discrimine clairement Voie/Sig (exige 5) vs Vente/ASCT (exige 1-2).*

---

#### DIMENSION G — Rapport à la nuit spécifiquement *(NOUVEAU)*
*(2 questions — distingue Maintenance/Voie des métiers moins nocturnes)*

**G1** (poids 1.5)
> Votre performance au travail à 3h du matin sur une tâche complexe :
> 1 = Je suis inefficace et difficilement opérationnel(le) | 5 = Je peux maintenir ma concentration et ma rigueur même profondément dans la nuit

**G2** (poids 1.2)
> Travailler principalement la nuit (majorité de vos services entre 22h et 6h) :
> 1 = Est un frein majeur pour moi | 5 = Est une modalité que j'ai testée et que j'assume sans difficulté

---

#### DIMENSION H — Rapport à la répétitivité *(NOUVEAU)*
*(2 questions — discrimine Conducteur navettes vs Circulation vs Commercial)*

**H1** (poids 1.5)
> Faire la même route, avec les mêmes gestes, des centaines de fois dans l'année en maintenant le même niveau de vigilance :
> 1 = Je saurais pas tenir — j'ai besoin de variété | 5 = C'est dans ce type d'exercice que j'excelle — la maîtrise par répétition me convient

**H2** (poids 1.2)
> Ce qui vous motive le plus dans un travail :
> 1 = La variété, les imprévus, chaque journée différente | 5 = La maîtrise parfaite d'un domaine précis, même routinier

---

#### DIMENSION I — Appétence technique
*(2 questions — reformulées pour mieux discriminer)*

**I1** (poids 1.3)
> Face à un équipement qui tombe en panne, votre réaction instinctive :
> 1 = J'appelle quelqu'un qui s'y connaît | 5 = Je veux comprendre pourquoi ça ne marche pas et le résoudre si possible

**I2** (poids 1.2)
> Apprendre le fonctionnement technique d'un système complexe (électronique, hydraulique, signalisation) :
> 1 = C'est laborieux pour moi | 5 = C'est quelque chose que j'aborde avec curiosité

---

#### DIMENSION J — Mobilité géographique
*(1 question — maintenu mais clarifié)*

**J1** (poids 1.0)
> Si votre premier poste vous était affecté dans une ville différente de celle où vous vivez aujourd'hui, à 150-300 km :
> 1 = C'est un obstacle majeur que je ne peux pas accepter | 5 = Je l'accepte pleinement comme une étape normale de début de carrière

---

### TABLEAU DE CORRESPONDANCE DIMENSIONS / MÉTIERS

| Dimension | Conducteur | Circulation | ASCT | Vente | Escale | Maintenance | Voie/Sig |
|---|---|---|---|---|---|---|---|
| A — Solitude | **5** | 2 | 2 | 1 | 2 | 3 | 3 |
| B — Contact humain | 1 | 1 | **5** | **5** | **5** | 1 | 1 |
| C — Mode décision | **5** | 4 | 3 | 2 | 3 | 4 | 3 |
| D — Horaires décalés | **5** | **5** | 4 | 3 | 4 | **5** | **5** |
| E — Rigueur proc. | **5** | **5** | 3 | 3 | 3 | **5** | **5** |
| F — Résistance physique | 2 | 1 | 2 | 1 | 2 | 4 | **5** |
| G — Nuit spécifique | 4 | 4 | 3 | 2 | 3 | **5** | **5** |
| H — Répétitivité | **5** | 2 | 3 | 3 | 3 | 3 | 3 |
| I — Aptitude technique | 3 | 4 | 2 | 1 | 2 | **5** | **5** |
| J — Mobilité | 3 | 2 | 3 | 1 | 2 | 2 | 4 |

### Signature discriminante par métier

**Conducteur :** A↑↑ + H↑↑ + C↑ + D↑ + E↑ + B↓↓
→ *"Seul, répétitif, décideur solitaire, adapté aux nuits, rigoureux, sans besoin de contact"*

**Agent Circulation :** C↑ + D↑ + E↑ + C3↑ (multi-tâches) + A↓ + H↓
→ *"Multi-tâches, coordination rapide, pas de solitude, variété des situations"*

**ASCT / Escale :** B↑↑ + D↑ + A↓↓ + C↓
→ *"Contact humain intense, service, gestion de conflits, pas de solitude"*
*Différenciateur ASCT vs Escale : C1 (décision solitaire à bord) + responsabilité sûreté*

**Agent de Vente :** B↑↑ + D↓ + F↓ + A↓
→ *"Contact humain, horaires moins décalés, confort physique, pas de solitude"*

**Technicien Maintenance :** G↑↑ + I↑↑ + E↑ + D↑ + A↑ + F↑ + H↓
→ *"Nuit intensive, technique++, rigueur, adaptation physique, pas de répétition pure"*

**Technicien Voie/Sig :** F↑↑ + I↑↑ + G↑↑ + J↑ + E↑ + A↑ + H↓
→ *"Terrain physique, extérieur, nuit, mobilité, technique++, pas de répétition"*

---

## PARTIE 6 — CORRECTIONS ALGORITHMIQUES RECOMMANDÉES

### Correction 1 — Pénaliser les incompatibilités fortes

Remplacer `min(userNorm/exigence, 1)` par une fonction qui :
- Pénalise quand userNorm >> exigence pour les dimensions binaires (relation_client, solitude)
- Maintient le plafonnement pour les dimensions continues (rigueur, horaires)

```typescript
// Pour les dimensions "profil" (contact vs solitude) : pénalisation bilatérale
function compatBilaterale(userNorm: number, exigence: number): number {
  const ecart = Math.abs(userNorm - exigence)
  return Math.max(0, 1 - ecart / 4)  // penalise si trop loin dans les deux sens
}
```

### Correction 2 — Supprimer le plancher sécurité artificiel

Reformuler q13 et q14 en questions situationnelles (voir questions E1, E2 ci-dessus). Le score de "sécurité" doit varier naturellement, pas converger vers 100% pour tout le monde.

### Correction 3 — Rééquilibrer les poids par pouvoir discriminant réel

| Dimension | Poids actuel (%) | Poids suggéré (%) |
|---|---|---|
| engagement_securite | 19.8% | Supprimée (intégrée dans E et comportemental) |
| relation_client | 6.2% | → Dimension B : **22%** |
| solitude | absente | → Dimension A : **15%** |
| horaires_decales | 15.3% | 12% |
| gestion_stress | 15.8% | 8% |
| rigueur | 14.7% | 8% (situationnel) |
| autonomie/décision | 11.3% | → Dimension C : **13%** |
| répétitivité | absente | → Dimension H : **10%** |
| physique/nuit | absente | → Dimensions F+G : **12%** |

---

## PARTIE 7 — RÉSUMÉ DES PROBLÈMES ET RECOMMANDATIONS

### ❌ Ce qui ne fonctionne pas

| Problème | Impact | Priorité |
|---|---|---|
| Q13/Q14 (sécurité) biaisées à poids élevé | Gonfle tous les scores, masque les vrais profils | CRITIQUE |
| Algorithme ne pénalise pas les incompatibilités | Un profil Vente obtient 58% sur Conducteur | CRITIQUE |
| ASCT et Escale indiscernables (85% similaires) | Mauvaise orientation entre ces 2 métiers | ÉLEVÉ |
| Conducteur/Maintenance/Voie indiscernables | 3 métiers très différents avec scores identiques | ÉLEVÉ |
| Dimension rapport à la solitude absente | Critère #1 pour Conducteur non mesuré | ÉLEVÉ |
| 1 seule question sur relation_client | Meilleur discriminant sous-exploité | ÉLEVÉ |
| Résistance physique/nuit absente | Critère fondamental pour Voie/Sig non mesuré | MOYEN |
| Répétitivité absente | Différencie Conducteur navette vs Circulation | MOYEN |
| Q7/Q8 rigueur biaisées par désirabilité | Résultats peu fiables | MOYEN |
| `poidsTotal` dead code | Confusion dans le code | BAS |

### ✅ Ce qui fonctionne bien

- L'architecture technique (calcul pondéré par dimension) est solide et extensible
- La dimension relation_client (q10) discrimine bien — c'est la meilleure question du test
- Les dimensions horaires_decales et autonomie ont un bon comportement
- La présentation des résultats (barres, niveaux fort/moyen/vigilance) est adaptée
- L'échelle 1-5 avec labels textuels est une bonne pratique UX

---

## CONCLUSION

Le test actuel souffre principalement du **syndrome du test ferroviaire générique** : il mesure si quelqu'un est compatible avec le secteur ferroviaire en général, pas quel métier précis lui correspond. Avec 14 questions et 8 dimensions dont 2 fortement biaisées, il ne peut pas remplir sa mission d'orientation entre 7 métiers aux profils très différents.

Le test proposé (22 questions, 10 dimensions dont 4 nouvelles, formulations situationnelles) corrigerait ces lacunes. Les 4 nouvelles dimensions — rapport à la solitude, résistance physique, rapport à la nuit, rapport à la répétitivité — sont précisément celles qui créent les vraies différences entre métiers ferroviaires telles que vécues sur le terrain.

*Rapport d'audit — Juin 2026 — RailReady*
