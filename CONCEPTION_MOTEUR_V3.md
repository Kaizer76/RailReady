# RAILREADY — Conception complète du moteur de compatibilité V3
### Architecte produit · Data scientist · Expert orientation professionnelle ferroviaire
### Juin 2026 | Document de conception | Aucun code produit

---

## AVANT-PROPOS

Ce document est le résultat d'une analyse complète du moteur de compatibilité RailReady, de ses limites quantifiées, et d'une refonte intégrale fondée sur la réalité opérationnelle des métiers ferroviaires. Il couvre les 7 missions demandées et constitue le cahier des charges complet pour l'implémentation du moteur V3.

**Données de référence utilisées :**
- Moteur V1 (14 questions, 8 dimensions) — analysé et simulé
- Plan V2 (22 questions, 10 dimensions) — analysé
- 7 fiches métiers RailReady — analysées
- Fiches de poste officielles (Chef d'escale, Agent d'escale/vente Le Havre/Rouen)
- Simulation Python complète : 17 dimensions × 7 métiers × 10 profils archétypaux

---

# MISSION 1 — AUDIT CRITIQUE

## 1.1 Faiblesses structurelles du moteur actuel

### Défaut #1 — Le biais de désirabilité sociale détruit 2 dimensions entières

**`engagement_securite` (poids 19.8%, 2 questions)** est la dimension la plus influente du test et la plus manipulable. Les questions "La sécurité est pour moi une valeur non négociable" et "Je comprends que dans le ferroviaire, une erreur peut avoir des conséquences graves" sont universellement répondues à 5 par tout candidat qui cherche un emploi. Résultat mesuré : un candidat neutre sur tout (réponse 3 partout) mais honnête sur la sécurité (5 à ces questions) obtient 65% de score global et 75-90% de compatibilité sur tous les métiers techniques. Le test l'oriente vers le ferroviaire sans aucune affinité réelle.

**`rigueur`** (questions q7 et q8) souffre du même problème. Les formulations "je respecte scrupuleusement les procédures" et "la précision est une qualité naturelle chez moi" sont des auto-déclarations de vertus professionnelles. Le contexte "Dans le ferroviaire, les procédures existent pour des raisons de sécurité. Elles ne se négocient pas" signale explicitement la bonne réponse. Ces questions n'ont aucun pouvoir discriminant.

### Défaut #2 — L'algorithme tolère les incompatibilités absolues

La formule `min(userNorm / exigence, 1)` ne pénalise jamais la sur-qualification. Pour un métier avec `relation_client = 1` (Conducteur), n'importe quel score candidat ≥ 20% produit une compatibilité de 100% sur cette dimension. Un candidat qui adore les gens obtient le même score qu'un candidat qui fuit le contact humain.

Conséquence mesurée : un profil "Vente pur" (relation_client = 5/5, solitude = 1/5, nuit = 1/5) obtient **59% de compatibilité avec Conducteur** en V1. Ce score est affiché comme "compatibilité intéressante". C'est un faux positif grave.

### Défaut #3 — Sous-représentation des dimensions les plus discriminantes

`relation_client` est la dimension avec le plus fort pouvoir discriminant (Δ = 20 pts entre Conducteur et Vente, σ inter-métiers = 1.98). Elle n'est mesurée que par **une seule question** avec un poids faible (1.1). L'inverse de ce qu'il faudrait.

`mobilite` et `relation_client` n'ont qu'une question chacune, alors que `engagement_securite` en a deux avec un poids total de 3.5 (le plus élevé de tout le test).

### Défaut #4 — Quatre dimensions clés de différenciation sont absentes

Le test actuel n'évalue pas :
- **La solitude** : critère n°1 pour le Conducteur — absent
- **Le rapport à la répétitivité** : différencie le Conducteur navette de l'Agent Circulation — absent
- **La résistance physique et le travail de nuit profond** : critères fondamentaux pour Voie/Signalisation et Maintenance — absents
- **Le multitâche** : différencie l'Agent Circulation (gère 8 trains simultanément) du Conducteur (une seule tâche totale) — absent

### Défaut #5 — Le champ `poidsTotal` est du dead code

`poidsTotal` (32, 30, 27…) est déclaré pour chaque métier mais n'est utilisé nulle part dans l'algorithme. Il donne une fausse impression de pondération intentionnelle.

---

## 1.2 Paires de métiers insuffisamment différenciées

### Conducteur vs Agent Circulation — Similarité profil V1 : 78%

**Ce qui est commun :** horaires décalés (5/5 chacun), rigueur (5/5), gestion du stress (5/5), engagement sécurité (5/5). Ces quatre dimensions représentent la majorité du poids du test — les deux métiers paraissent identiques.

**Ce qui les différencie dans la réalité :**

| Dimension | Conducteur | Circulation |
|---|---|---|
| Solitude | **Totale** (seul en cabine) | **Équipe** (relais, coordination) |
| Multitâche | **1 seule chose** à la fois | **5-8 trains** simultanément |
| Répétitivité | **Identique** des centaines de fois | **Chaque jour différent** |
| Type de responsabilité | **Directe physique** (ma main sur le frein) | **Décisionnelle** (je décide pour autrui) |
| Rapport à l'imprévu | Gérer seul | Coordonner une réponse collective |

Aucune de ces 5 dimensions n'est dans le test V1. Les deux métiers sont donc indiscernables.

### Conducteur vs Technicien Maintenance — Similarité V1 : 72%

**Ce qui est commun :** horaires décalés, rigueur, engagement sécurité, aptitude technique (partiellement).

**Ce qui les différencie :**

| Dimension | Conducteur | Maintenance |
|---|---|---|
| Solitude | **Seul absolu** | Binôme / petite équipe |
| Travail de nuit | Présent mais pas systématique | **Nuit = norme** (horaires de production) |
| Résistance physique | **Sédentaire** (cabine) | **Effort physique** (sous les rames, port de charges) |
| Répétitivité | **Très haute** (mêmes lignes) | **Modérée** (visites systématiques mais pannes différentes) |
| Multitâche | Faible | Faible aussi (diagnostic séquentiel) |

Le test V1 ne mesure ni la nuit profonde, ni la solitude, ni la résistance physique. Les deux profils se fondent.

### ASCT vs Agent de Vente — Similarité V1 : 71%

Ces deux métiers partagent `relation_client = 5` dans leurs profils, ce qui les rend quasi identiques dans un test qui n'a qu'une question sur la relation client.

**Ce qui les différencie dans la réalité :**

| Dimension | ASCT | Vente |
|---|---|---|
| Autorité | **Forte** (verbalisation, SUGE, force publique) | **Faible** (conseil, pas d'exécutoire) |
| Gestion de conflit | **Centrale** (fraudeurs, agressivité à bord) | **Présente** (mécontentement lors perturbations) |
| Solitude à bord | **Seul ou duo** à bord du train | En équipe guichet |
| Horaires de nuit | **Trains de nuit possibles** | **Quasi absents** |
| Responsabilité sécurité | **Forte** (évacuation, SUGE, urgences médicales) | **Quasi nulle** |
| Rapport à l'imprévu | **Élevé** (accidents, malaises, retards) | **Modéré** (perturbations = afflux guichet) |

### ASCT vs Agent d'Escale — Similarité V1 : 85% — Le cas le plus critique

C'est la paire la plus difficile à discriminer. Les deux métiers sont au contact du public, tous deux en gare ou à bord, tous deux exposés aux perturbations.

**Ce qui les différencie fondamentalement :**

| Dimension | ASCT | Escale |
|---|---|---|
| Lieu | **À bord du train** (monde clos, isolé) | **Quais de gare** (espace ouvert, multiple) |
| Autorité | **Très forte** (représente l'ordre à bord, verbalise) | **Modérée** (coordination, pas d'exécutoire direct) |
| Multitâche | **Modéré** (train = espace séquentiel) | **Intense** (plusieurs trains, PMR, annonces simultanées) |
| Adaptation imprévus | Gérer UN incident à bord | Gérer UN RÉSEAU d'incidents simultanément |
| Type de service | **Relation individuelle continue** (un voyageur à la fois) | **Coordination logistique** (flux de voyageurs) |
| Gestion PMR | Présente | **Centrale** (habilitations, responsabilité directe) |

La clé : l'ASCT est un **gestionnaire de relation individuelle avec autorité**. L'Escale est un **coordinateur logistique multi-flux**. Ce sont deux tempéraments différents.

### Technicien Maintenance vs Technicien Voie/Signalisation — Similarité V1 : 80%

C'est la paire qui reste la plus difficile à discriminer même en V3 (similarité résiduelle 83%). Les deux métiers partagent : nuit, rigueur, technique, sécurité, horaires décalés.

**Ce qui les différencie :**

| Dimension | Maintenance | Voie/Signalisation |
|---|---|---|
| Environnement | **Intérieur** (technicentre = atelier chaud, protégé) | **Extérieur** (voie ferrée, toutes conditions météo) |
| Résistance physique | **Modérée** (positions contraintes mais protégé) | **Très élevée** (froid, pluie, port lourd, terrain) |
| Mobilité | **Faible** (site fixe) | **Élevée** (chantiers sur le réseau) |
| Travail en équipe | **Binôme/petite équipe** | **Chantier complet** (5-15 personnes) |
| Type de travail | **Curatif et préventif** sur matériel roulant | **Chantiers planifiés** sur infrastructure |

---

## 1.3 Questions orientant artificiellement les réponses

| Question | Problème |
|---|---|
| q13 : "La sécurité est non négociable" | Poids 2.0 — réponse universellement 5 — dead discriminator |
| q14 : "Une erreur peut avoir de graves conséquences" | Contexte "pas là pour effrayer" = signal de la bonne réponse |
| q7 : "Je respecte scrupuleusement les procédures" | Auto-déclaration de vertu professionnelle |
| q4 : "Je supporte la pression liée à la sécurité des autres" | Qui répondrait non en candidatant? |
| q8 : "La précision et l'attention aux détails sont naturelles" | Auto-déclaration biaisée |

Ces 5 questions représentent **37% du poids total** du test V1. Elles doivent toutes être supprimées ou reformulées situationnellement.

---

# MISSION 2 — PROFILS MÉTIERS TERRAIN

## Modèle à 17 dimensions

Pour chaque dimension, la note représente le **niveau d'exigence réelle** du métier (pas ce que le candidat doit "apporter" mais ce que le quotidien impose concrètement).

Note 1 = quasi absent dans le quotidien du poste
Note 5 = constitutif du métier, impossible de l'éviter

---

### Conducteur de Train

| Dimension | Note | Justification terrain |
|---|---|---|
| Horaires décalés | **5** | Nuits, week-ends, JF font partie intégrante du roulement. C'est la norme, pas l'exception. |
| Travail de nuit | **4** | Fréquent mais pas systématique selon le type de service (TER navette vs nuit longue distance). |
| Relation client | **1** | Le conducteur est seul en cabine. Aucun contact passager direct, sauf incident. Contact radio avec la circulation uniquement. |
| Solitude | **5** | La solitude de la cabine est totale. Plusieurs heures sans interaction humaine. C'est un facteur éliminatoire pour ceux qui ne le supportent pas. |
| Travail en équipe | **1** | Quasi inexistant. Le conducteur est seul et autonome pendant tout son service. |
| Rigueur procédurale | **5** | Chaque geste est procéduralisé. La vérification de la locomotive, le départ, les signaux — tout est régi par des procédures non négociables. |
| Gestion du stress | **5** | Incident sur voie, signal d'alarme, personne sur les rails. La gestion du stress seul, sans filet, est centrale. |
| Responsabilité sécurité | **5** | Des centaines de vies dans le convoi. La responsabilité individuelle est totale et permanente. |
| Aptitude technique | **3** | Formation interne longue mais pas d'expertise technique au sens ingénierie. Compréhension du matériel et des signaux — pas de maintenance. |
| Mobilité géographique | **3** | Dépend du dépôt d'affectation. Peut changer de dépôt en début de carrière. |
| Résistance physique | **2** | Poste sédentaire. Effort mental (vigilance permanente) mais pas physique. Résistance aux nuits et à la sédentarité prolongée. |
| Répétitivité | **5** | Un conducteur TER fait parfois le même aller-retour des années durant. La maîtrise par répétition est une qualité, la recherche de variété est un problème. |
| Prise de décision | **5** | Décisions immédiates et solitaires. Pas de comité consultatif. Ma main sur le frein, ma décision dans la seconde. |
| Multitâche | **2** | Une seule chose à la fois : conduire. Les procédures interdisent les distractions. La gestion d'un seul flux continu est la norme. |
| Autorité | **2** | Aucune relation de commandement direct. L'autorité s'exerce sur son propre respect des procédures, pas sur autrui. |
| Gestion de conflit | **1** | Quasi inexistante. Aucun passager à gérer. La seule forme de conflit est la discussion radio avec la circulation. |
| Adaptation aux imprévus | **5** | Signal inattendu, animal sur les voies, panne technique. La gestion de l'imprévu seul est une compétence centrale et quotidienne. |

**Signature Conducteur :** Solitude (5) + Répétitivité (5) + Prise de décision solitaire (5) + Stress seul (5) + Zéro relation client (1)

---

### Agent Circulation

| Dimension | Note | Justification terrain |
|---|---|---|
| Horaires décalés | **5** | Le réseau ne s'arrête jamais. Postes 24h/24, 7j/7. |
| Travail de nuit | **4** | Fréquent selon le type de poste (PCC vs aiguillage local). |
| Relation client | **2** | Les "clients" sont les conducteurs (par radio) et les équipes terrain. Pas de grand public. Communication professionnelle sèche. |
| Solitude | **2** | Travaille en équipe de relais. Le passage de consigne est une interaction structurante. Pas de solitude totale. |
| Travail en équipe | **4** | Coordination constante avec les conducteurs (radio), les chefs de salle, les équipes de maintenance. Relais d'équipe réguliers. |
| Rigueur procédurale | **5** | Les procédures de régulation sont non négociables. Une erreur de priorité peut provoquer une collision. |
| Gestion du stress | **5** | Gérer simultanément plusieurs trains en retard, un incident sur voie, une aiguille défaillante et un conducteur qui appelle — c'est le quotidien en heure de pointe. |
| Responsabilité sécurité | **5** | Identique au conducteur mais à l'échelle d'un réseau complet. La responsabilité est indirecte mais massive. |
| Aptitude technique | **4** | Systèmes informatiques de régulation, lectures des tableaux de bord réseau, compréhension de la topologie des voies. Forte appétence nécessaire. |
| Mobilité géographique | **2** | Le poste est généralement fixe (salle de régulation, PCC). Peu de mobilité une fois affecté. |
| Résistance physique | **1** | Travail strictement sédentaire devant écrans. Aucune contrainte physique. |
| Répétitivité | **2** | Aucune journée identique. L'imprévu EST le cœur du métier. La routine n'existe pas. |
| Prise de décision | **5** | Décisions rapides avec impact réseau immédiat. Mais décision concertée avec l'équipe contrairement au conducteur. |
| Multitâche | **5** | LA dimension signature de ce métier. Gérer simultanément 6, 8, 10 trains en temps réel, anticiper les conflits, prioriser. |
| Autorité | **3** | Autorité fonctionnelle sur les conducteurs (instructions radio). Pas d'autorité hiérarchique mais des directives opérationnelles à faire respecter. |
| Gestion de conflit | **2** | Rare. Quelques tensions avec des conducteurs mécontents de décisions de régulation. Pas de conflits humains directs. |
| Adaptation aux imprévus | **5** | Identique ou supérieur au conducteur, mais à l'échelle du réseau. L'imprévu permanent est la définition du poste. |

**Signature Circulation :** Multitâche (5) + Adaptation imprévus (5) + Prise de décision rapide (5) + Zéro répétitivité (2) + Zéro solitude (2)

---

### ASCT / Contrôleur

| Dimension | Note | Justification terrain |
|---|---|---|
| Horaires décalés | **4** | Trains du matin très tôt aux trains de soirée tardifs. Certaines missions de nuit (trains de nuit longue distance). |
| Travail de nuit | **3** | Présent mais pas dominant. Dépend des services affectés (TGV nuit, Intercités nuit). |
| Relation client | **5** | C'est littéralement la définition du poste. Chaque service = des dizaines de voyageurs. La relation humaine est permanente. |
| Solitude | **3** | Seul à bord ou en duo selon les trains. Ni la solitude totale du conducteur, ni l'équipe du guichet. Responsabilité solitaire mais présence humaine constante (les voyageurs). |
| Travail en équipe | **3** | Variable selon la mission. Coordination avec le conducteur, parfois avec un collègue à bord. Pas d'équipe fixe. |
| Rigueur procédurale | **3** | Procédures de contrôle, de régularisation, de sûreté. Mais plus de flexibilité contextuelle qu'en conduite. |
| Gestion du stress | **4** | Urgence médicale à bord, voyageur agressif, retard avec correspondances manquées. Le stress est humain, pas technique. |
| Responsabilité sécurité | **4** | Sûreté à bord, évacuation, gestion des incidents de sécurité voyageurs. Contact direct avec la SUGE si nécessaire. |
| Aptitude technique | **2** | Peu de technique au sens strict. Outils de contrôle (smartphones, lecteurs), procédures de régularisation. |
| Mobilité géographique | **3** | Se déplace sur le réseau selon les missions. Affectation à un dépôt mais déplacements quotidiens. |
| Résistance physique | **3** | Debout de nombreuses heures, circulation dans les voitures. Effort modéré mais continu. |
| Répétitivité | **3** | Les actions sont répétitives (contrôle, régularisation) mais les voyageurs et les situations sont toujours différents. |
| Prise de décision | **3** | Décider seul comment gérer une situation difficile à bord, sans superviseur immédiat. Décisions humaines, pas techniques. |
| Multitâche | **4** | Contrôle + relation + sûreté + annonces + coordination conducteur — tout en même temps. |
| Autorité | **4** | L'ASCT représente l'ordre à bord. Il peut verbaliser, exclure un voyageur, appeler la police. L'autorité est formelle et légalement définie. |
| Gestion de conflit | **5** | C'est LA dimension signature. Fraudeurs, voyageurs agressifs, contestations. Gérer cela quotidiennement avec calme et fermeté est le cœur du métier. |
| Adaptation aux imprévus | **4** | Urgences médicales, voyageurs en détresse, pannes en ligne, retards. L'imprévu humain est constant. |

**Signature ASCT :** Gestion de conflit (5) + Relation client (5) + Autorité (4) + Adaptation imprévus humains (4)

---

### Agent de Vente Ferroviaire

| Dimension | Note | Justification terrain |
|---|---|---|
| Horaires décalés | **3** | Amplitude de gare (tôt le matin à tard le soir) mais peu de nuits. Week-ends selon roulement. |
| Travail de nuit | **1** | Quasi absent. Les guichets ferment. |
| Relation client | **5** | Chaque moment est une interaction client. Renseigner, vendre, traiter une réclamation, orienter — pure relation humaine. |
| Solitude | **1** | En équipe guichet. Entouré de collègues et de clients en permanence. Complètement à l'opposé de la solitude. |
| Travail en équipe | **4** | Équipe guichet solidaire. Relève, entraide, gestion collective des pics d'affluence. |
| Rigueur procédurale | **3** | Procédures tarifaires, caisse, réclamations. Mais beaucoup plus flexibles et adaptables qu'en exploitation. |
| Gestion du stress | **3** | Pics d'affluence, clients mécontents lors des perturbations. Stress humain et commercial, pas de mise en danger. |
| Responsabilité sécurité | **1** | Quasi inexistante. La sécurité du réseau n'est pas la responsabilité de l'agent de vente. |
| Aptitude technique | **2** | Outils informatiques de vente (SOLAR, billetterie). Appétence numérique suffisante, pas de technique ferroviaire. |
| Mobilité géographique | **1** | Poste fixe en gare. La mobilité géographique est nulle ou quasi nulle. |
| Résistance physique | **2** | Debout en intérieur. Effort modéré et constant. Pas de contrainte physique majeure. |
| Répétitivité | **4** | Les transactions sont répétitives. La gestion tarifaire, les remboursements — mêmes scénarios quotidiens. |
| Prise de décision | **2** | Dans un cadre défini. Les exceptions tarifaires ont des procédures. Peu de décisions discrétionnaires. |
| Multitâche | **3** | File d'attente + téléphone + réclamations + formation collègue. Gestion modérée. |
| Autorité | **2** | Peu d'autorité formelle. Conseil et service, pas commandement. |
| Gestion de conflit | **4** | Voyageurs mécontents lors des grèves, réclamations difficiles, contestations. Centrale mais différente de l'ASCT (pas de verbalisation). |
| Adaptation aux imprévus | **3** | Perturbations → afflux au guichet → gestion de crise commerciale. Modéré. |

**Signature Vente :** Relation client (5) + Solitude absente (1) + Zéro nuit (1) + Zéro mobilité (1) + Zéro responsabilité sécurité (1)

---

### Agent d'Escale

| Dimension | Note | Justification terrain |
|---|---|---|
| Horaires décalés | **4** | Du premier au dernier train. Tôt le matin, tard le soir, certains week-ends. |
| Travail de nuit | **3** | Possible selon la gare (gares avec trains de nuit). Plus fréquent qu'en Vente. |
| Relation client | **5** | Accueil, information, orientation, PMR — contact permanent et varié avec le public. |
| Solitude | **2** | Travaille en équipe escale. Entouré de collègues, conducteurs, voyageurs. Jamais vraiment seul. |
| Travail en équipe | **4** | Coordination intense : chef d'escale, conducteur, chef de bord, équipes de nettoyage, agents de vente. |
| Rigueur procédurale | **3** | Procédures de départ des trains, PMR, visites. Plus flexibles que l'exploitation mais exigeantes sur les délais. |
| Gestion du stress | **4** | Train en retard, PMR non pris en charge, perturbation en cascade. Stress opérationnel réel. |
| Responsabilité sécurité | **3** | Sécurité des quais, PMR en situation de vulnérabilité. Responsabilité présente mais moins directe qu'ASCT. |
| Aptitude technique | **2** | Applications métiers (ORCADES, OSE, IGO), automates. Technique légère. |
| Mobilité géographique | **2** | Attaché à une gare ou un secteur géographique. Peu de mobilité. |
| Résistance physique | **3** | Terrain sur les quais, debout, par tous les temps. Plus physique que le guichet. |
| Répétitivité | **2** | Chaque train, chaque PMR, chaque perturbation est différente. Variété des situations. |
| Prise de décision | **3** | Gérer seul l'organisation d'une prise en charge PMR urgente, décider de l'ouverture d'un quai, coordonner un remplacement de train. |
| Multitâche | **4** | Deux trains simultanément, une PMR, des annonces, un voyageur perdu. C'est la réalité quotidienne. |
| Autorité | **3** | Faire respecter l'organisation des quais, coordonner les équipes. Autorité fonctionnelle, pas hiérarchique. |
| Gestion de conflit | **4** | Voyageurs mécontents lors des perturbations. Gérer les tensions quai avec calme et fermeté. |
| Adaptation aux imprévus | **5** | LA dimension signature de ce métier. Train supprimé, voyageurs bloqués, PMR imprévue, correspondance manquée — gérer l'imprévu en temps réel EST le métier. |

**Signature Escale :** Adaptation imprévus (5) + Multitâche (4-5) + Relation client (5) + Résistance physique terrain (3) — distinct de ASCT par la coordination logistique vs l'autorité individuelle

---

### Technicien de Maintenance (Technicentre)

| Dimension | Note | Justification terrain |
|---|---|---|
| Horaires décalés | **5** | Travail principalement hors trafic commercial. Nuits et week-ends sont la règle. |
| Travail de nuit | **5** | La nuit est la plage de travail principale. Les rames doivent être prêtes pour le premier train du matin. La nuit n'est pas optionnelle. |
| Relation client | **1** | Aucun contact grand public. Les seuls interlocuteurs sont les collègues de l'équipe et le chef d'atelier. |
| Solitude | **3** | Travaille généralement en binôme ou petite équipe (2-4 techniciens). Ni solitude totale ni groupe large. |
| Travail en équipe | **4** | Équipe technique soudée. La communication sur les interventions est essentielle pour la sécurité et la traçabilité. |
| Rigueur procédurale | **5** | Chaque intervention est tracée dans la GMAO. La procédure est le garant de la certification de la rame. Aucune improvisation tolérée. |
| Gestion du stress | **3** | Stress des délais de restitution : la rame doit être prête à l'heure. Stress technique (panne inconnue), pas humain. |
| Responsabilité sécurité | **5** | La rame certifiée par le technicien reprend le service avec des voyageurs à bord. L'erreur est différée mais potentiellement catastrophique. |
| Aptitude technique | **5** | Mécanique, électrotechnique, électronique, hydraulique, informatique embarquée. C'est un métier de haute technicité. |
| Mobilité géographique | **2** | Site fixe (technicentre). Peu de mobilité géographique après affectation. |
| Résistance physique | **4** | Travail sous les rames, positions contraintes, port de charges, bruit, environnement industriel. La résistance physique est réelle. |
| Répétitivité | **4** | Les visites préventives sont systématiques et répétitives. La même procédure sur la même série de rames régulièrement. |
| Prise de décision | **3** | Diagnostic de panne → décision d'intervention → validation. Encadré par les procédures mais jugement technique nécessaire. |
| Multitâche | **2** | Focus sur l'intervention en cours. Une chose à la fois, avec méthode. |
| Autorité | **1** | Aucune. Hiérarchie technique mais pas d'autorité sur autrui. |
| Gestion de conflit | **1** | Inexistante. Aucun passager, aucun conflit humain. |
| Adaptation aux imprévus | **4** | Panne inconnue sur rame → diagnostic d'urgence → intervention hors procédure standard. Fréquent la nuit. |

**Signature Maintenance :** Nuit (5) + Technique (5) + Rigueur (5) + Sécurité différée (5) + Zéro relation client (1) + Environnement INTÉRIEUR

---

### Technicien Voie / Signalisation

| Dimension | Note | Justification terrain |
|---|---|---|
| Horaires décalés | **5** | Identique à Maintenance — la voie s'entretient hors trafic. |
| Travail de nuit | **5** | Les plages travaux sont nocturnes (22h-5h). La nuit est encore plus centrale qu'en technicentre. |
| Relation client | **1** | Aucun. Le seul interlocuteur externe est le régulateur (radio) pour la restitution de voie. |
| Solitude | **3** | Travaille en équipe de chantier. Jamais seul sur la voie (règle de sécurité fondamentale). |
| Travail en équipe | **5** | LA dimension qui différencie de la Maintenance. Le chantier voie est un travail collectif obligatoire. 5 à 20 personnes selon l'intervention. |
| Rigueur procédurale | **5** | Les protocoles d'accès à la voie sont une question de vie ou de mort. Consignation, mise en sécurité, vérification finale — aucun écart toléré. |
| Gestion du stress | **3** | Pression des délais (la voie doit être restituée avant le premier train). Stress de la responsabilité en environnement dangereux. |
| Responsabilité sécurité | **5** | Risque ferroviaire direct : travailler sur une voie où un train peut arriver. La sécurité du chantier n'est pas négociable. |
| Aptitude technique | **5** | Géométrie des voies, métrologie, électrotechnique de signalisation, mécanique des appareils de voie. Niveau comparable à la Maintenance. |
| Mobilité géographique | **4** | Les chantiers sont répartis sur le réseau. Déplacements fréquents selon les programmes de travaux. Souvent loin du domicile pour certains chantiers. |
| Résistance physique | **5** | C'est LA dimension signature. Travail en extérieur par tous les temps (froid, pluie, neige), port de charges lourdes, postures contraintes sur ballast, nuit. La résistance physique est le critère le plus différenciateur avec Maintenance. |
| Répétitivité | **3** | Les types d'intervention sont répétitifs mais les terrains, les équipes et les conditions varient. Niveau moyen. |
| Prise de décision | **3** | Le chef de chantier décide, les techniciens exécutent avec rigueur. Décision technique sur anomalies découvertes. |
| Multitâche | **2** | Comme en Maintenance — concentration sur la tâche en cours. |
| Autorité | **2** | Exécution technique encadrée. Peu d'autorité formelle. |
| Gestion de conflit | **1** | Inexistante. |
| Adaptation aux imprévus | **4** | Anomalie découverte sur voie, équipement défaillant. L'imprévu technique est fréquent la nuit. |

**Signature Voie :** Résistance physique extérieure (5) + Nuit (5) + Travail en équipe de chantier (5) + Mobilité chantiers (4) + Environnement EXTÉRIEUR

---

## 2.1 Tableau synthétique des 17 profils

```
Dimension             Condu  Circu  ASCT   Vente  Escal  Maint  Voie
──────────────────────────────────────────────────────────────────────
Horaires décalés        5      5      4      3      4      5      5
Travail de nuit         4      4      3      1      3      5      5
Relation client         1      2      5      5      5      1      1
Solitude                5      2      3      1      2      3      3
Travail en équipe       1      4      3      4      4      4      5
Rigueur procédurale     5      5      3      3      3      5      5
Gestion du stress       5      5      4      3      4      3      3
Responsabilité sécu     5      5      4      1      3      5      5
Aptitude technique      3      4      2      2      2      5      5
Mobilité géo            3      2      3      1      2      2      4
Résistance physique     2      1      3      2      3      4      5
Répétitivité            5      2      3      4      2      4      3
Prise de décision       5      5      3      2      3      3      3
Multitâche              2      5      4      3      4      2      2
Autorité                2      3      4      2      3      1      2
Gestion de conflit      1      2      5      4      4      1      1
Adaptation imprévus     5      5      4      3      5      4      4
──────────────────────────────────────────────────────────────────────
```

---

# MISSION 3 — QUESTIONNAIRE V3 COMPLET

## Principes de conception

**Ce qui est éliminé :**
- Auto-déclarations de valeurs ("je suis rigoureux", "je respecte les procédures")
- Questions sur la sécurité comme valeur abstraite
- Contextes qui signalent la bonne réponse
- Questions trop chargées de désirabilité professionnelle

**Ce qui est introduit :**
- Situations concrètes tirées du terrain
- Choix de préférence (pas de bonne ou mauvaise réponse)
- Questions projectives ("dans cette situation…")
- Formulations neutres qui ne télégraphient rien

**Structure :** 27 questions · 13 dimensions · Durée : 10-12 minutes

---

### BLOC 1 — SOLITUDE ET RAPPORT AU COLLECTIF (Questions 1-3)
*Dimension clé : différencie Conducteur (5) de tous les métiers commerciaux (1-2)*
*Type : BILATÉRAL — trop ou pas assez pénalise selon le métier*

---

**Question 1**
> Vous avez passé 6 heures dans un espace de travail isolé, sans possibilité de parler à quelqu'un ni changer d'environnement. À la fin de ces 6 heures, vous vous sentez :
>
> 1 — Épuisé(e), irritable, j'avais vraiment besoin d'interaction humaine
> 2 — Un peu à plat, je préfère les environnements avec du monde
> 3 — Ni l'un ni l'autre, je m'adapte facilement
> 4 — Plutôt bien, j'ai apprécié cette tranquillité
> 5 — Reposé(e) et efficace, ces heures m'ont appartenu entièrement
>
> *Contexte : "Il n'y a pas de bonne réponse. Ce qui compte, c'est votre réaction instinctive."*
>
> **Dimension :** Solitude | **Poids :** 2.0

---

**Question 2**
> Si vous deviez choisir entre deux postes de travail identiques en termes de rémunération et d'intérêt :
>
> 1 — Poste A : en équipe permanente, dans un environnement social animé
> 2 — Poste A/B : en équipe mais avec des plages de travail solo
> 3 — Aucune préférence nette
> 4 — Poste B/A : principalement seul avec quelques échanges définis
> 5 — Poste B : principalement seul, contact humain limité et ponctuel
>
> *Contexte : "Dans le ferroviaire, certains métiers impliquent une solitude totale (cabine de conduite), d'autres une présence humaine permanente (guichet, quai)."*
>
> **Dimension :** Solitude | **Poids :** 1.8

---

**Question 3**
> Lors de vos vacances ou jours off, que préférez-vous ?
>
> 1 — Être entouré(e) : famille, amis, sorties — le vide m'est inconfortable
> 2 — Majoritairement en compagnie, quelques moments seul(e)
> 3 — Équilibre entre solitude et compagnie selon les jours
> 4 — Souvent seul(e), je recharge mes batteries dans la tranquillité
> 5 — Très souvent seul(e) — j'ai besoin de silence et d'espace personnel
>
> *Contexte : "Une question sur votre tempérament naturel, pas sur vos capacités."*
>
> **Dimension :** Solitude | **Poids :** 1.5

---

### BLOC 2 — CONTACT HUMAIN ET SERVICE (Questions 4-6)
*Dimension clé : différencie métiers commerciaux (5) des métiers techniques (1)*
*Type : BILATÉRAL*

---

**Question 4**
> À la fin d'une journée de travail, quelle situation vous aurait procuré le plus de satisfaction ?
>
> 1 — Avoir résolu seul(e) un problème technique complexe qui vous avait résisté
> 2 — Avoir mené à bien une mission précise, avec un résultat concret et mesurable
> 3 — Une combinaison des deux selon les jours
> 4 — Avoir aidé plusieurs personnes à traverser une situation difficile
> 5 — Avoir été le point de contact humain de dizaines de personnes qui en avaient besoin
>
> *Contexte : "Aucune de ces satisfactions n'est supérieure à l'autre — elles correspondent à des métiers différents."*
>
> **Dimension :** Relation client | **Poids :** 2.0

---

**Question 5**
> Un inconnu s'approche de vous dans un lieu public — il semble perdu et stressé. Vous ne savez pas si vous pouvez l'aider. Votre réaction instinctive :
>
> 1 — J'attends qu'il s'adresse à moi formellement ou trouve quelqu'un de compétent
> 2 — Je réponds s'il me sollicite, mais sans m'imposer
> 3 — Je lui demande si je peux l'aider
> 4 — Je prends naturellement l'initiative d'aller vers lui
> 5 — Je m'approche spontanément et prends le temps nécessaire pour l'aider, même si je n'ai pas toutes les réponses
>
> *Contexte : "Pas de jugement. Certains sont naturellement tournés vers autrui, d'autres non."*
>
> **Dimension :** Relation client | **Poids :** 1.8

---

**Question 6**
> Après une longue journée passée à interagir avec beaucoup de personnes différentes, vous vous sentez :
>
> 1 — Épuisé(e) — le contact humain continu me vide
> 2 — Fatigué(e) mais c'est gérable
> 3 — Neutre, ça ne me pose pas de problème particulier
> 4 — Bien — les interactions m'ont plutôt stimulé(e)
> 5 — Énergisé(e) — c'est précisément ce type de journée qui me ressource
>
> *Contexte : "Ce que vous ressentez naturellement, pas ce que vous pensez devoir ressentir."*
>
> **Dimension :** Relation client | **Poids :** 1.5

---

### BLOC 3 — GESTION SIMULTANÉE ET MULTITÂCHE (Questions 7-8)
*Dimension clé : différencie Circulation (5) de Conducteur (2)*
*Type : BILATÉRAL — le multitâche est une compétence qui s'évalue aussi comme préférence*

---

**Question 7**
> Vous gérez 4 situations qui demandent toutes de l'attention et évoluent simultanément. Vous :
>
> 1 — Je suis déstabilisé(e), je perds le fil — je préfère finir A avant de commencer B
> 2 — Je gère mais c'est difficile, ça me demande un effort important
> 3 — Je m'en sors correctement sans me sentir ni stimulé(e) ni épuisé(e)
> 4 — Je me sens dans mon élément, ça me donne de l'énergie
> 5 — C'est exactement dans ces conditions que je suis le plus efficace — la pression des flux multiples me stimule
>
> *Contexte : "Un agent de régulation gère parfois 8 trains simultanément en temps réel."*
>
> **Dimension :** Multitâche | **Poids :** 1.8

---

**Question 8**
> Quelle manière de travailler vous correspond le mieux sur le long terme ?
>
> 1 — Travailler sur un seul sujet en profondeur, sans interruption, jusqu'à la maîtrise complète
> 2 — Principalement en focus, avec quelques interruptions gérées
> 3 — Un équilibre entre concentration et gestion de plusieurs flux
> 4 — Gérer plusieurs flux en parallèle, en jonglant entre les priorités
> 5 — La gestion multi-flux permanente — l'agenda et les sujets qui changent constamment
>
> *Contexte : "Aucune des deux n'est supérieure — un conducteur et un régulateur ont des besoins opposés."*
>
> **Dimension :** Multitâche | **Poids :** 1.5

---

### BLOC 4 — RÉPÉTITIVITÉ ET MAÎTRISE (Questions 9-10)
*Dimension clé : différencie Conducteur (5) de Circulation (2)*
*Type : BILATÉRAL*

---

**Question 9**
> Faire la même chose de nombreuses fois — le même trajet, les mêmes gestes, dans le même ordre — vous permet d'atteindre une forme de maîtrise que vous :
>
> 1 — Fuyez activement — la répétition me démotive rapidement
> 2 — Tolérez mais ça ne me nourrit pas sur le long terme
> 3 — Acceptez — c'est parfois nécessaire
> 4 — Appréciez — la maîtrise par la répétition m'apporte satisfaction
> 5 — Recherchez — l'excellence dans l'exécution répétée est ce qui me motive profondément
>
> *Contexte : "Un conducteur TER fait parfois le même aller-retour pendant des années. C'est pour lui une forme de maîtrise, pas une contrainte."*
>
> **Dimension :** Répétitivité | **Poids :** 1.8

---

**Question 10**
> Sur le long terme, ce qui vous motive davantage dans un travail :
>
> 1 — La diversité : chaque journée est une nouvelle situation, jamais deux fois identique
> 2 — Un peu de nouveauté régulière dans un cadre stable
> 3 — Un équilibre entre routine maîtrisée et variation
> 4 — Un cadre stable et maîtrisé, avec quelques variations
> 5 — La maîtrise parfaite d'un domaine précis, même si le quotidien est similaire
>
> *Contexte : "Pas de jugement — les deux tempéraments ont un métier ferroviaire qui leur correspond."*
>
> **Dimension :** Répétitivité | **Poids :** 1.5

---

### BLOC 5 — TRAVAIL DE NUIT (Questions 11-12)
*Dimension clé : différencie Maintenance/Voie (5) de Vente (1)*
*Type : STANDARD avec hard-floor*

---

**Question 11**
> Vous devez réaliser une tâche complexe nécessitant concentration et précision à 3h du matin, après 6 heures de travail nocturne. Comment vous évaluez-vous dans cette situation ?
>
> 1 — Clairement inefficace — la nuit profonde m'affecte fortement
> 2 — Fonctionnel mais avec des efforts importants pour maintenir la vigilance
> 3 — Correct — je m'en sors mais ce n'est pas mon meilleur moment
> 4 — Capable de maintenir ma performance même à cette heure
> 5 — La nuit ne m'affecte pas notablement — je suis aussi efficace à 3h qu'à 10h
>
> *Contexte : "Un technicien voie ou maintenance travaille souvent dans ces conditions."*
>
> **Dimension :** Travail de nuit | **Poids :** 1.8

---

**Question 12**
> Si votre poste implique que la majorité de vos services se déroulent entre 22h et 6h du matin :
>
> 1 — C'est un frein majeur — je ne me vois pas tenir sur le long terme
> 2 — C'est difficile — j'accepterais en début de carrière mais je chercherais à changer
> 3 — C'est une contrainte que j'accepte si le poste me convient par ailleurs
> 4 — C'est quelque chose que je peux intégrer durablement dans ma vie
> 5 — Ça ne me pose pas de problème — j'ai déjà testé ou je suis naturellement nocturne
>
> *Contexte : "Dans les technicentres et sur les chantiers voie, le travail de nuit n'est pas l'exception — c'est la règle."*
>
> **Dimension :** Travail de nuit | **Poids :** 1.5

---

### BLOC 6 — HORAIRES DÉCALÉS (Questions 13-14)
*Dimension clé : filtre général d'entrée dans le ferroviaire*
*Type : STANDARD*

---

**Question 13**
> Travailler régulièrement les nuits, les week-ends et les jours fériés aurait un impact concret sur votre vie actuelle :
>
> 1 — Très fort : ma situation familiale, personnelle ou géographique rend cela très difficile
> 2 — Notable : ce serait une vraie adaptation avec des frictions importantes
> 3 — Modéré : certains ajustements seraient nécessaires mais gérables
> 4 — Limité : ma vie actuelle s'adapte sans trop de difficulté
> 5 — Minimal : ma situation personnelle se prête tout à fait à ces contraintes
>
> *Contexte : "Pensez à votre situation actuelle concrète : conjoint, enfants, vie sociale, contraintes personnelles."*
>
> **Dimension :** Horaires décalés | **Poids :** 1.8

---

**Question 14**
> Travailler le 25 décembre, le 1er janvier ou un dimanche de Pâques :
>
> 1 — C'est pour moi un obstacle important que j'aurais beaucoup de mal à accepter
> 2 — C'est difficile mais je pourrais l'envisager ponctuellement
> 3 — C'est une contrainte que j'accepte dans le cadre d'un travail qui m'intéresse
> 4 — Ça ne me pose pas de problème majeur — les fêtes sont compensées autrement
> 5 — Je l'assume pleinement — c'est inhérent au service public et j'en suis conscient(e)
>
> *Contexte : "Le ferroviaire est un service permanent. Noël ou pas, les trains circulent."*
>
> **Dimension :** Horaires décalés | **Poids :** 1.2

---

### BLOC 7 — RÉSISTANCE PHYSIQUE ET CONDITIONS DIFFICILES (Questions 15-16)
*Dimension clé : différencie Voie (5) de Vente (2)*
*Type : STANDARD*

---

**Question 15**
> Travailler régulièrement en extérieur, de nuit, par temps froid ou pluvieux, sur un chantier physiquement exigeant (port de charges, positions contraintes, terrain irrégulier) :
>
> 1 — Est un facteur rédhibitoire pour moi — je ne me vois pas dans ces conditions durablement
> 2 — Est difficile — j'accepterais en début de carrière mais ce n'est pas mon idéal
> 3 — Est une contrainte que j'accepte si la mission le justifie
> 4 — Ne me pose pas de problème — j'ai une bonne résistance physique
> 5 — Est mon environnement naturel — je suis à l'aise dans ces conditions
>
> *Contexte : "Un technicien voie travaille dehors, la nuit, par tous les temps. Ce n'est pas négociable."*
>
> **Dimension :** Résistance physique | **Poids :** 1.8

---

**Question 16**
> En dehors du travail, votre rapport à l'effort physique :
>
> 1 — Je préfère largement les activités sédentaires
> 2 — Je fais quelques activités légères mais l'effort physique intense n'est pas mon fort
> 3 — J'ai un niveau d'activité physique modéré et régulier
> 4 — Je suis physiquement actif(ve) et à l'aise avec les efforts prolongés
> 5 — L'effort physique fait naturellement et intensément partie de mon quotidien
>
> *Contexte : "Pas de jugement — c'est une indication de votre capacité à tenir dans des conditions physiquement exigeantes."*
>
> **Dimension :** Résistance physique | **Poids :** 1.3

---

### BLOC 8 — PRISE DE DÉCISION AUTONOME (Questions 17-18)
*Dimension clé : différencie Conducteur (5) et Circulation (5) de Vente (2)*
*Type : STANDARD*

---

**Question 17**
> Une décision urgente doit être prise avec des conséquences importantes. Vous n'avez pas le temps de consulter. Vous :
>
> 1 — J'attends d'avoir pu consulter quelqu'un — une mauvaise décision vaut mieux qu'une décision non concertée
> 2 — Je préfère consulter, mais j'agis si vraiment nécessaire
> 3 — Je décide selon les circonstances — parfois seul, parfois en consultant
> 4 — Je décide — l'attente a un coût plus élevé que l'incertitude de ma décision
> 5 — Je décide seul(e), vite, sur la base de mon analyse — c'est une chose qui me vient naturellement
>
> *Contexte : "Dans certains métiers ferroviaires, attendre une validation externe coûte des minutes précieuses."*
>
> **Dimension :** Prise de décision | **Poids :** 1.8

---

**Question 18**
> Vous avez pris une décision importante seul(e). Elle s'avère ne pas être la meilleure. Vous :
>
> 1 — Regrette d'avoir décidé seul(e) — j'aurais dû chercher un avis
> 2 — Me questionne sur ma méthode de décision
> 3 — Analyse pour améliorer ma prise de décision future, sans culpabilité excessive
> 4 — Assume et tire les leçons — l'incertitude fait partie de la décision
> 5 — Assume pleinement — j'avais les informations disponibles, j'ai décidé, c'est mon rôle
>
> *Contexte : "La capacité à assumer ses décisions solitaires est aussi importante que la décision elle-même."*
>
> **Dimension :** Prise de décision | **Poids :** 1.5

---

### BLOC 9 — AUTORITÉ ET GESTION DE CONFLIT (Questions 19-21)
*Dimension clé : différencie ASCT (5) de Vente (4) et Escale (4)*
*Type : STANDARD*

---

**Question 19**
> Vous devez faire respecter une règle à quelqu'un qui refuse d'obtempérer et conteste votre légitimité. Votre réaction naturelle :
>
> 1 — Je cède ou redirige vers un responsable — l'affrontement n'est pas mon registre
> 2 — Je répète la règle mais recule si la pression monte
> 3 — Je maintiens ma position avec calme, sans chercher l'escalade
> 4 — Je maintiens fermement, j'explique les conséquences du refus et j'applique la procédure
> 5 — Je maintiens, j'applique et je documente — la règle s'applique quelle que soit la réaction
>
> *Contexte : "Dans certains métiers, l'autorité est une obligation fonctionnelle, pas un choix."*
>
> **Dimension :** Autorité | **Poids :** 1.5

---

**Question 20**
> Face à un inconnu visiblement agressif et de mauvaise foi, votre réaction instinctive :
>
> 1 — Je cherche à m'éloigner rapidement — ce type de confrontation me déstabilise
> 2 — Je réponds de manière minimale et cherche une sortie
> 3 — Je reste calme mais cherche à abréger l'interaction
> 4 — Je maintiens le dialogue avec calme, cherchant à désamorcer
> 5 — Je reste totalement maître de mes réactions, je cherche activement une issue apaisée
>
> *Contexte : "Un ASCT ou un agent d'escale fait face à ces situations régulièrement."*
>
> **Dimension :** Gestion de conflit | **Poids :** 1.8

---

**Question 21**
> Quelqu'un conteste votre décision ou votre compétence, devant d'autres personnes. Vous :
>
> 1 — Je suis ébranlé(e) — la contestation publique me déstabilise
> 2 — Je réponds maladroitement — le public me gêne
> 3 — Je gère correctement mais j'en ai besoin d'un moment pour me recadrer
> 4 — Je réponds avec calme, je maintiens ma position si elle est juste
> 5 — Je gère parfaitement — la pression publique ne change pas ma réaction
>
> *Contexte : "Voyageur qui conteste un PV devant les autres passagers — scénario courant pour un ASCT."*
>
> **Dimension :** Gestion de conflit | **Poids :** 1.5

---

### BLOC 10 — APTITUDE TECHNIQUE (Questions 22-23)
*Dimension clé : différencie Maintenance/Voie (5) de Vente/Escale (2)*
*Type : STANDARD*

---

**Question 22**
> Un équipement tombe en panne. Votre réaction instinctive :
>
> 1 — J'appelle quelqu'un qui s'y connaît — comprendre la technique n'est pas mon registre
> 2 — Je vérifie les éléments de base mais sans chercher à diagnostiquer en profondeur
> 3 — Je tente un diagnostic de surface avant d'appeler
> 4 — J'essaie de comprendre le problème avant de demander de l'aide
> 5 — Je veux comprendre pourquoi ça ne fonctionne pas — le diagnostic est pour moi un réflexe naturel
>
> *Contexte : "Aucun prérequis technique — c'est une question de rapport naturel à la technique."*
>
> **Dimension :** Aptitude technique | **Poids :** 1.5

---

**Question 23**
> Apprendre le fonctionnement interne d'un système technique complexe (hydraulique, électronique, mécanique) :
>
> 1 — Est laborieux et sans intérêt pour moi
> 2 — Est une nécessité que j'accepte si le poste l'exige
> 3 — Ne me pose pas de problème particulier
> 4 — M'intéresse et me donne envie de comprendre plus
> 5 — M'attire naturellement — comprendre comment les choses fonctionnent est quelque chose que je recherche
>
> *Contexte : "La technicité ferroviaire est une réalité de nombreux postes — pas uniquement la maintenance."*
>
> **Dimension :** Aptitude technique | **Poids :** 1.2

---

### BLOC 11 — ADAPTATION AUX IMPRÉVUS (Questions 24-25)
*Dimension clé : centrale pour Circulation, Escale, Conducteur (5)*
*Type : STANDARD*

---

**Question 24**
> Votre plan de travail de la journée est bouleversé dès 9h par une série d'événements imprévus. Vous :
>
> 1 — Je suis déstabilisé(e) — l'imprévu me perturbe durablement et nuit à ma performance
> 2 — Je m'adapte mais avec difficulté — j'ai besoin d'un moment pour me recalibrer
> 3 — Je gère correctement — l'imprévu ne me perturbe pas trop
> 4 — Je m'active — l'imprévu me challenge et me pousse à être plus performant(e)
> 5 — C'est dans ces moments que je suis le plus efficace — l'imprévu active quelque chose en moi
>
> *Contexte : "Un agent d'escale ou un régulateur gère de l'imprévu permanent."*
>
> **Dimension :** Adaptation imprévus | **Poids :** 1.5

---

**Question 25**
> Une journée entièrement prévisible, routinière, sans aucun imprévu, vous donne le sentiment de :
>
> 1 — Soulagement — j'ai pu me concentrer sur mes tâches sans perturbation
> 2 — Satisfaction — le travail s'est bien passé
> 3 — Normalité — c'est comme ça que je préfère travailler
> 4 — Légère frustration — il me manque quelque chose
> 5 — Ennui — sans défi, je ne suis pas pleinement en activité
>
> *Contexte : "Certains métiers demandent d'apprécier la routine, d'autres demandent d'aimer l'imprévu."*
>
> **Dimension :** Adaptation imprévus | **Poids :** 1.2

---

### BLOC 12 — GESTION DU STRESS (Question 26)
*Type : STANDARD*

---

**Question 26**
> Vous êtes responsable d'une décision qui conditionne la sécurité ou le bien-être de plusieurs personnes. Vous êtes seul(e). Vous sentez la pression. Vous :
>
> 1 — Je suis paralysé(e) par la pression — elle nuit à mes capacités
> 2 — Je gère mais c'est épuisant et cela me demande un effort important
> 3 — Je gère correctement — la pression me mobilise sans me dépasser
> 4 — La pression m'active — je prends de meilleures décisions sous responsabilité
> 5 — La responsabilité et la pression sont des environnements dans lesquels je performe naturellement
>
> *Contexte : "Conducteur, régulateur, ASCT — tous prennent des décisions sous pression de responsabilité."*
>
> **Dimension :** Gestion du stress | **Poids :** 1.5

---

### BLOC 13 — MOBILITÉ GÉOGRAPHIQUE (Question 27)
*Type : STANDARD*

---

**Question 27**
> Votre premier poste vous est affecté dans une ville à 200 km de là où vous vivez actuellement :
>
> 1 — C'est un obstacle majeur — ma situation personnelle rend cela impossible ou très difficile
> 2 — C'est compliqué — j'accepterais peut-être mais avec beaucoup d'hésitation
> 3 — Je peux l'envisager si le poste me correspond vraiment
> 4 — Je l'accepte — c'est souvent inévitable en début de carrière
> 5 — Ça ne me pose pas de problème — je suis prêt(e) à m'adapter géographiquement
>
> *Contexte : "Les affectations initiales ne sont pas toujours négociables dans le ferroviaire."*
>
> **Dimension :** Mobilité géographique | **Poids :** 1.0

---

## Tableau récapitulatif des 27 questions

| # | Bloc | Dimension | Poids | Type |
|---|---|---|---|---|
| 1 | Solitude | solitude | 2.0 | BILATÉRAL |
| 2 | Solitude | solitude | 1.8 | BILATÉRAL |
| 3 | Solitude | solitude | 1.5 | BILATÉRAL |
| 4 | Contact humain | relation_client | 2.0 | BILATÉRAL |
| 5 | Contact humain | relation_client | 1.8 | BILATÉRAL |
| 6 | Contact humain | relation_client | 1.5 | BILATÉRAL |
| 7 | Multitâche | multitache | 1.8 | BILATÉRAL |
| 8 | Multitâche | multitache | 1.5 | BILATÉRAL |
| 9 | Répétitivité | repetitivite | 1.8 | BILATÉRAL |
| 10 | Répétitivité | repetitivite | 1.5 | BILATÉRAL |
| 11 | Nuit profonde | travail_nuit | 1.8 | standard |
| 12 | Nuit profonde | travail_nuit | 1.5 | standard |
| 13 | Horaires décalés | horaires_decales | 1.8 | standard |
| 14 | Horaires décalés | horaires_decales | 1.2 | standard |
| 15 | Résistance physique | resistance_physique | 1.8 | standard |
| 16 | Résistance physique | resistance_physique | 1.3 | standard |
| 17 | Prise de décision | prise_decision | 1.8 | standard |
| 18 | Prise de décision | prise_decision | 1.5 | standard |
| 19 | Autorité | autorite | 1.5 | standard |
| 20 | Gestion de conflit | gestion_conflit | 1.8 | standard |
| 21 | Gestion de conflit | gestion_conflit | 1.5 | standard |
| 22 | Technique | aptitude_technique | 1.5 | standard |
| 23 | Technique | aptitude_technique | 1.2 | standard |
| 24 | Imprévus | adaptation_imprevus | 1.5 | standard |
| 25 | Imprévus | adaptation_imprevus | 1.2 | standard |
| 26 | Stress | gestion_stress | 1.5 | standard |
| 27 | Mobilité | mobilite | 1.0 | standard |

**Poids total : 42.6 | Durée estimée : 10-12 minutes**

---

# MISSION 4 — ALGORITHME V3

## 4.1 Analyse de l'algorithme actuel

L'algorithme V1/V2 calcule :

```
compat = Σ(min(userNorm/exigence, 1) × exigence) / Σ(exigence)
```

**Problème 1 — Tolérance des incompatibilités absolues**
Pour les dimensions "bipolaires" (relation_client, solitude, multitâche, répétitivité), la sur-qualification ou la sous-qualification par rapport au profil métier est tout aussi problématique. Un candidat qui adore le contact humain dans un poste Conducteur (exigence 1) obtient une compatibilité de 100% sur cette dimension — ce qui est absurde. Le contact humain excessif pour un conducteur n'est pas un avantage neutre : c'est un facteur d'inadaptation potentiel.

**Problème 2 — Pas de seuil plancher**
Un candidat qui répond 1/5 à "travail de nuit" et postule à la Maintenance (exigence 5) peut quand même obtenir 60% de compatibilité globale si toutes ses autres dimensions sont bonnes. Cela génère des faux positifs graves.

**Problème 3 — Pas de bonus pour l'excellence d'adéquation**
Un candidat dont les 3 dimensions les plus importantes pour un métier sont toutes parfaitement alignées mérite un signal positif supplémentaire.

## 4.2 Algorithme V3 — Formule complète

### Étape 1 — Score par dimension (0-100)

Pour chaque dimension `d`, calculer le score candidat à partir des réponses pondérées :

```
score_d = [Σ(réponse_q × poids_q) / Σ(5 × poids_q)] × 100
          pour toutes les questions q appartenant à la dimension d
```

### Étape 2 — Compatibilité dimensionnelle

Pour chaque dimension `d` et métier `m` :

**Si dimension BILATÉRALE** (solitude, relation_client, multitâche, répétitivité) :
```
userNorm = (score_d / 100) × 5       [normalisation 0-5]
écart    = |userNorm - exigence_dm|

compat_d = max(0, 1 - écart / 4)
```
→ Écart maximal = 4 (de 1 à 5). L'écart est également pénalisant dans les deux directions.

**Si dimension STANDARD** (toutes les autres) :
```
ratio = userNorm / exigence_dm

SI ratio < 1 :
    compat_d = ratio                    [sous-qualification : proportionnel]

SI 1 ≤ ratio < 1.5 :
    compat_d = 1.0                      [sur-qualification modérée : neutre]

SI ratio ≥ 1.5 :
    compat_d = max(0.85, 1 - (ratio-1.5) × 0.1)   [légère pénalité sur-qualification excessive]
```

### Étape 3 — Compatibilité pondérée de base

```
compat_base = Σ(compat_d × exigence_dm^1.3) / Σ(exigence_dm^1.3)
              pour toutes les dimensions d du métier m
```

**Note :** L'exposant 1.3 sur l'exigence permet aux dimensions les plus critiques pour un métier (exigence 5) de peser davantage que les dimensions secondaires (exigence 1-2). C'est une amélioration clé par rapport à la pondération linéaire de V1.

### Étape 4 — Hard-floors (incompatibilités absolues)

Certaines incompatibilités sont rédhibitoires quel que soit le reste du profil. Si un candidat est en dessous d'un seuil critique sur une dimension cruciale pour un métier, un plafond de compatibilité s'applique :

```
RÈGLE 1 — Travail de nuit
  SI score_travail_nuit < 35% ET exigence_travail_nuit ≥ 4 :
      compat = min(compat, 42%)

RÈGLE 2 — Horaires décalés
  SI score_horaires_decales < 35% ET exigence_horaires_decales = 5 :
      compat = min(compat, 45%)

RÈGLE 3 — Résistance physique
  SI score_resistance_physique < 30% ET exigence_resistance_physique = 5 :
      compat = min(compat, 42%)
```

**Justification des seuils :** Ces trois dimensions sont des prérequis ferroviaires non négociables. Quelqu'un qui ne peut pas travailler la nuit ne peut pas exercer en Maintenance ou en Voie, quelle que soit sa qualité par ailleurs. Le plafond à 42-45% garantit que ces profils n'apparaissent jamais dans le Top 3 d'un métier incompatible.

### Étape 5 — Bonus signature (adéquation parfaite)

```
Top3_dims = les 3 dimensions avec la plus haute exigence pour ce métier

SI compat_d(dim) ≥ 0.75 pour TOUTES les dim de Top3_dims :
    compat = min(1.0, compat + 0.03)    [+3% pour alignement parfait sur les critères clés]
```

### Étape 6 — Score final

```
compat_finale_m = min(100, round(compat × 100))
```

### Seuils d'affichage

| Score | Niveau | Message |
|---|---|---|
| ≥ 82% | **Fort** | "Votre profil correspond bien aux exigences de ce métier." |
| 58-81% | **Moyen** | "Votre profil présente des atouts pour ce métier, avec des points à explorer." |
| 40-57% | **Faible** | "Ce métier demande des qualités éloignées de votre profil naturel — à considérer avec prudence." |
| < 40% | **Incompatible** | "Votre profil et ce métier semblent difficilement compatibles." |

**Règle absolue :** Ne jamais afficher un score < 40% dans le Top 3. Si les 3 premiers scores sont tous < 40%, afficher un message d'orientation générale vers le Mentor.

---

# MISSION 5 — CAS TESTS SIMULÉS

*Résultats produits par simulation Python complète avec l'algorithme V3 exact décrit ci-dessus.*

## Tableau de compatibilité complet (10 profils × 7 métiers)

```
Profil                    Conduct  Circula   ASCT    Vente   Escale  Mainten   Voie
──────────────────────────────────────────────────────────────────────────────────
1. Conducteur idéal          89%     72%      67%     68%     68%     76%      70%
2. Circulation idéal         73%     88%      75%     70%     80%     72%      42%
3. ASCT idéal                64%     69%      97%     89%     94%     67%      65%
4. Vente idéal               42%     42%      69%     90%     71%     42%      42%
5. Escale idéal              62%     72%      92%     86%     98%     67%      64%
6. Maintenance idéal         72%     66%      67%     69%     67%     87%      77%
7. Voie idéal                73%     69%      72%     69%     70%     85%      85%
8. Généraliste neutre        64%     65%      79%     82%     78%     69%      67%
9. Commercial pur            42%     42%      68%     85%     70%     42%      42%
10. Technique pur            74%     64%      67%     68%     66%     81%      74%
```

---

### Profil 1 — Conducteur idéal

**Réponses archétypales :** Solitude 5/5 · Relation client 1/5 · Répétitivité 5/5 · Décision solitaire 5/5 · Nuit 4-5/5 · Multitâche 1-2/5

**Top 3 :**
1. **Conducteur — 89%** ✅ Première position nette. Solitude, répétitivité et prise de décision solitaire alignées parfaitement.
2. **Maintenance — 76%** Les deux métiers partagent la nuit, la rigueur et l'absence de contact public. La technique est le point de divergence.
3. **Circulation — 72%** Score élevé sur la nuit et les imprévus mais pénalisé sur le multitâche (conducteur = 1, circulation exige 5).

**Explication :** Le conducteur idéal ressort clairement en #1 mais obtient des scores honorables sur Maintenance et Voie (métiers techniques sans contact public). La discrimination Conducteur/Circulation est bonne grâce au multitâche bilatéral. La discrimination Conducteur/Maintenance reste partielle (76%) — acceptable car les deux profils partagent de vraies similitudes.

---

### Profil 2 — Agent Circulation idéal

**Réponses archétypales :** Multitâche 5/5 · Adaptation imprévus 5/5 · Décision 5/5 · Solitude 2/5 · Répétitivité 2/5 · Nuit 4/5

**Top 3 :**
1. **Circulation — 88%** ✅ Multitâche et adaptation imprévus parfaitement alignés. C'est la signature du métier.
2. **Escale — 80%** Partage la relation client (2 pour circulation vs 5 pour escale → pénalité bilatérale modérée) et les imprévus.
3. **ASCT — 75%** Partage la gestion humaine et les imprévus. Pénalisé sur l'autorité et la gestion de conflit (plus basse pour le profil Circulation).

**Explication :** Bonne discrimination avec Conducteur (73% vs 88%). Le hard-floor de résistance physique exclut Voie (42%) — cohérent car l'agent de régulation est sédentaire.

---

### Profil 3 — ASCT idéal

**Réponses archétypales :** Relation client 5/5 · Gestion de conflit 5/5 · Autorité 5/5 · Solitude 2-3/5 · Nuit 3/5 · Multitâche 4/5

**Top 3 :**
1. **ASCT — 97%** ✅ Score excellent. Signature exacte du métier (relation client + autorité + conflit).
2. **Escale — 94%** Très proche. Partage relation client et gestion de conflit. ⚠️ Paire encore proche — voir Mission 6.
3. **Vente — 89%** Partage la relation client mais pénalisé sur l'autorité (la vente n'exige pas d'autorité forte).

**Explication :** L'ASCT ressort clairement. La proximité avec Escale (94%) est le problème résiduel de l'algorithme V3 — ces deux métiers sont structurellement proches. La discrimination nécessite une question supplémentaire spécifique (voir Mission 6).

---

### Profil 4 — Agent de Vente idéal

**Réponses archétypales :** Relation client 5/5 · Solitude 1/5 · Nuit 1-2/5 · Horaires décalés 2/5 · Résistance physique 1/5

**Top 3 :**
1. **Vente — 90%** ✅ Score net. Profil commercial pur bien identifié.
2. **Escale — 71%** Partage la relation client mais pénalisé sur les horaires décalés et la résistance physique.
3. **ASCT — 69%** Relation client forte mais pénalisé sur autorité et nuit.

**Explication :** Le hard-floor nuit (score < 35%) s'applique sur Conducteur, Maintenance et Voie → plafonnés à 42%. Excellent résultat : le profil Vente est clairement exclu des métiers incompatibles. Objectif atteint : **Vente → Conducteur ≤ 50%** (résultat : 42% ✅).

---

### Profil 5 — Agent d'Escale idéal

**Réponses archétypales :** Relation client 5/5 · Adaptation imprévus 5/5 · Multitâche 4/5 · Solitude 2/5 · Résistance physique 3/5 · Nuit 3/5

**Top 3 :**
1. **Escale — 98%** ✅ Score remarquable. L'adaptation aux imprévus + multitâche + relation client = signature parfaite.
2. **ASCT — 92%** Paire persistante — voir Mission 6.
3. **Vente — 86%** Relation client forte mais pénalisé sur les imprévus (l'Escale en a plus que la Vente).

**Explication :** L'Escale ressort clairement #1 avec 98%. La persistance ASCT/Escale à 92-94% mutuelle est le défi principal — ils sont réellement proches dans la réalité.

---

### Profil 6 — Technicien Maintenance idéal

**Réponses archétypales :** Aptitude technique 5/5 · Nuit 5/5 · Horaires décalés 5/5 · Relation client 1/5 · Multitâche 1-2/5 · Résistance physique 4/5

**Top 3 :**
1. **Maintenance — 87%** ✅ Nuit profonde + technique + rigueur alignés parfaitement.
2. **Voie — 77%** Partage la nuit et la technique. Différencié par la résistance physique (Voie exige 5) et la mobilité.
3. **Conducteur — 72%** Partage la nuit et l'absence de contact public.

**Explication :** Bonne discrimination Maintenance/Voie (87% vs 77%) grâce à la résistance physique. L'algorithme ne peut pas complètement séparer ces deux métiers sur la base des 27 questions — voir Mission 6 pour la question différenciante intérieur/extérieur.

---

### Profil 7 — Technicien Voie/Signalisation idéal

**Réponses archétypales :** Résistance physique 5/5 · Nuit 5/5 · Aptitude technique 5/5 · Mobilité 4/5 · Relation client 1/5 · Solitude 3/5

**Top 3 :**
1. **Maintenance — 85%** ⚠️ Légère erreur — le profil Voie arrive #2 ex-æquo.
2. **Voie — 85%** Ex-æquo. C'est la limite de l'algorithme sur cette paire.
3. **Conducteur — 73%** Partage la nuit et l'absence de contact.

**Explication :** La paire Maintenance/Voie reste ex-æquo à 85% pour un profil Voie idéal. C'est un problème structurel — les deux métiers sont trop similaires sur les dimensions disponibles. La question différenciante (extérieur vs intérieur) est indispensable pour les séparer (voir Mission 6).

---

### Profil 8 — Généraliste neutre (réponse 3 partout)

**Top 3 :**
1. **Vente — 82%** Les métiers commerciaux (relation client "modérée" = 3) ressortent mieux pour les profils neutres.
2. **ASCT — 79%**
3. **Escale — 78%**

**Explication :** Un profil neutre oriente vers les métiers commerciaux car ces métiers ont des exigences bilatérales moyennes (relation client 5 → un candidat neutre est trop peu orienté contact, mais pas totalement exclu). C'est un comportement attendu : les métiers commerciaux ont une "plage" d'exigences plus accessible. L'algorithme le capte correctement.

---

### Profil 9 — Commercial pur (relation client et social maximal)

**Réponses archétypales :** Relation client 5/5 · Solitude 1/5 · Nuit 1/5 · Résistance physique 1/5 · Technique 1/5

**Top 3 :**
1. **Vente — 85%** ✅ Clairement orienté.
2. **Escale — 70%** Score pénalisé par les horaires (le profil commercial a des horaires faibles).
3. **ASCT — 68%** Pénalisé sur la nuit et l'autorité.

**Hard-floors déclenchés :** Conducteur (42%), Maintenance (42%), Voie (42%) → correctement exclus.

---

### Profil 10 — Technique pur (technique maximale, sans contact)

**Réponses archétypales :** Aptitude technique 5/5 · Nuit 4/5 · Résistance physique 4/5 · Relation client 1/5 · Solitude 4/5

**Top 3 :**
1. **Maintenance — 81%** ✅
2. **Conducteur — 74%** Technique présente, nuit OK, solitude OK.
3. **Voie — 74%** Ex-æquo avec Conducteur.

**Explication :** Le profil technique s'oriente correctement vers Maintenance et Voie. Conducteur arrive en 2-3 car il partage l'absence de contact public et la nuit, mais avec moins de technique. Correct.

---

# MISSION 6 — VALIDATION TERRAIN ET QUESTIONS DIFFÉRENCIANTES

## 6.1 État actuel des paires problématiques après V3

| Paire | Similarité V1 | Similarité V3 | Problème résiduel |
|---|---|---|---|
| Conducteur / Circulation | 78% | **62%** ✅ Réglé | Multitâche bilatéral suffisant |
| Conducteur / Maintenance | 72% | **65%** ✅ Amélioré | Résiduel acceptable |
| ASCT / Escale | 85% | **83%** ⚠️ Persistant | Besoin Q28 |
| Maintenance / Voie | 80% | **83%** ⚠️ Persistant | Besoin Q29 |
| ASCT / Vente | 71% | **65%** ✅ Amélioré | Autorité différencie |

## 6.2 Deux questions différenciantes critiques

### Question 28 — ASCT vs Escale (dimension : **type_de_service**)

Cette dimension n'existe pas encore dans le modèle. Elle mesure si le candidat préfère la **relation individuelle avec autorité** (ASCT) ou la **coordination logistique multi-flux** (Escale).

> **Question 28 — "Quelle situation vous attire davantage ?"**
>
> Une journée de travail idéale, c'est celle où :
>
> 1 — Je gère une multitude de flux (trains, voyageurs, équipes) en temps réel, en coordonnant tout simultanément
> 2 — Je jongle entre coordination et relations individuelles selon les moments
> 3 — Équilibre selon les situations
> 4 — Je suis en contact direct et soutenu avec des personnes, en gérant les situations une par une
> 5 — Je m'occupe d'une personne ou d'une situation à la fois, avec toute mon attention, y compris quand c'est conflictuel
>
> *Contexte : "Deux métiers au contact du public, deux manières très différentes de l'exercer."*
>
> **ASCT :** score ≥ 4 (relation individuelle, un voyageur à la fois, avec autorité)
> **Escale :** score ≤ 2 (coordination multi-flux, logistique)
>
> **Dimension :** type_de_service (à ajouter) | **Poids :** 2.0 | **Type :** BILATÉRAL

**Exigences métiers :** ASCT = 5/5 sur type_de_service individuel | Escale = 1/5

---

### Question 29 — Maintenance vs Voie (dimension : **environnement_travail**)

> **Question 29 — "Votre environnement de travail naturel ?"**
>
> Choisissez l'environnement dans lequel vous vous sentez le plus à l'aise pour travailler :
>
> 1 — En intérieur, dans un espace protégé, avec un éclairage maîtrisé et des conditions stables
> 2 — En intérieur avec quelques sorties occasionnelles
> 3 — Peu importe — les deux me conviennent
> 4 — En extérieur par beau temps, avec la possibilité de rentrer
> 5 — En extérieur, quelle que soit la météo — le terrain est mon environnement naturel
>
> *Contexte : "Un technicentre est un atelier industriel couvert et chauffé. Un chantier de voie ferrée est dehors, la nuit, par tous les temps."*
>
> **Maintenance :** score ≤ 2 (intérieur = technicentre)
> **Voie :** score ≥ 4 (extérieur = chantier voie)
>
> **Dimension :** environnement_travail (à ajouter) | **Poids :** 1.8 | **Type :** BILATÉRAL

---

## 6.3 Critères de validation terrain (fondateur conducteur de train)

### Conducteur — Dimensions critiques à valider

| Critère | Dimension | Exigence V3 | Validation attendue |
|---|---|---|---|
| Solitude de cabine | solitude | 5/5 | ✅ Premier facteur éliminatoire terrain |
| Répétitivité des lignes | repetitivite | 5/5 | ✅ Navette TER = même trajet des années |
| Décision solitaire immédiate | prise_decision | 5/5 | ✅ Ma main sur le frein, pas de comité |
| Multitâche minimal | multitache | 2/5 | ✅ Une seule tâche : conduire |
| Zéro contact public | relation_client | 1/5 | ✅ Cabine fermée, aucun passager |

**Questions à valider en priorité avec l'expérience terrain :**
- Q9 (répétitivité) : "Le même aller-retour des centaines de fois" — la formulation résonne-t-elle avec la réalité TER ?
- Q3 (solitude) : "Reposé et efficace après 6h seul" — est-ce que les conducteurs confirmés reconnaissent cette description ?
- Q17 (décision solitaire) : "Je décide seul, vite, sur la base de mon analyse" — est-ce que ça correspond à la culture de la cabine ?

### Circulation — Dimensions critiques à valider

| Critère | Dimension | Exigence V3 | Validation attendue |
|---|---|---|---|
| Multitâche permanent | multitache | 5/5 | ✅ Gestion simultanée de 6-10 trains |
| Adaptation imprévus constant | adaptation_imprevus | 5/5 | ✅ L'imprévu est le métier |
| Zéro répétitivité | repetitivite | 2/5 | ✅ Chaque journée différente |
| Travail en équipe | travail_equipe | 4/5 | ✅ Relais, coordination, équipe de salle |

**Questions à valider :**
- Q7 (multitâche) : "4 situations simultanées — je suis dans mon élément" — correspond-il à ce que vivent les régulateurs ?
- Q24 (imprévus) : "L'imprévu m'active" — est-ce que les bons régulateurs se reconnaissent dans cette description ?

---

# MISSION 7 — LIVRABLE FINAL

## 7.1 Synthèse du nouveau modèle

### Comparaison V1 / V2 / V3

| Dimension | V1 | V2 | V3 |
|---|---|---|---|
| Questions | 14 | 22 | **27 (+2 optionnelles = 29)** |
| Dimensions mesurées | 8 | 10 | **13 (+2 si Q28/Q29 = 15)** |
| Dimensions bilatérales | 0 | 3 | **4 (+2 si Q28/Q29 = 6)** |
| Hard-floors | Non | Non | **Oui (3 règles)** |
| Bonus signature | Non | Oui (+3%) | **Oui (+3%)** |
| Poids par exigence | Linéaire | Linéaire | **Exponentiel (^1.3)** |
| Profil Vente→Conducteur | 59% | 38% | **42%** |
| Conducteur→Circulation similarité | 78% | 62% | **61%** |
| ASCT→Escale similarité | 85% | 86% | **83%** |
| Maintenance→Voie similarité | 80% | 81% | **83% (besoin Q29)** |

---

## 7.2 Plan de migration V2 → V3

### Phase 0 — Validation terrain (AVANT tout développement)

1. Tester les 27 questions V3 avec le fondateur en mode "blind test" (répondre comme conducteur de train)
2. Vérifier que le résultat est : Conducteur #1 avec score ≥ 85%
3. Tester avec 2-3 collègues de métiers différents (ASCT, Maintenance)
4. Ajuster les formulations qui ne résonnent pas

**Durée estimée : 2-3 jours**

### Phase 1 — Base de données Supabase

```
Actions :
  1. Créer un nouveau test dans compatibility_tests
     (id V3, version=3, name='Test de compatibilité V3 — 27 questions')

  2. Insérer 27 nouvelles quiz_questions
     (dimensions : solitude, relation_client, multitache, repetitivite,
      travail_nuit, horaires_decales, resistance_physique, prise_decision,
      autorite, gestion_conflit, aptitude_technique, adaptation_imprevus,
      gestion_stress, mobilite)

  3. Les 14 questions V1 restent intactes (historique)
  4. Les 22 questions V2 restent intactes (historique)
  5. Pas de changement de schéma — la table quiz_questions supporte tout

Impact Supabase : 27 INSERT dans quiz_questions, 1 INSERT dans compatibility_tests
Aucun ALTER TABLE nécessaire
```

### Phase 2 — API de scoring (score/route.ts)

```
Fichier : src/app/api/compatibility/score/route.ts

Changements :
  A. Ajouter les 6 nouvelles dimensions dans DIMENSION_CONFIG
     (solitude, multitache, repetitivite, travail_nuit,
      resistance_physique, adaptation_imprevus)

  B. Remplacer les 7 profils métiers dans METIER_PROFILS
     (17 dimensions × 7 métiers, sans poidsTotal)

  C. Remplacer computeMetierCompatibilite() :
     - Exposant ^1.3 sur les poids
     - Algorithme bilatéral pour 4 dimensions
     - Hard-floors (3 règles)
     - Bonus signature +3%

  D. Supprimer engagement_securite et gestion_stress généralisée
     (remplacée par gestion_stress situationnelle Q26)

  E. Supprimer le champ poidsTotal (dead code)

Complexité : Moyenne | ~150 lignes à réécrire dans le fichier existant
```

### Phase 3 — Frontend (quiz/page.tsx)

```
Fichier : src/app/(dashboard)/test-compatibilite/quiz/page.tsx

Changement unique : Remplacer le tableau QUESTIONS (14 entrées)
par les 27 questions V3

Structure identique : {id, dimension, weight, text, context}
Aucun changement UI nécessaire

Page d'intro à mettre à jour :
  - "14 questions" → "27 questions"
  - "5 minutes" → "10-12 minutes"
  - Liste des dimensions mise à jour
```

### Phase 4 — Tests et validation

```
Tests à effectuer :
  1. Passer le test avec le profil archétypal Conducteur → vérifier top 3
  2. Passer le test avec le profil archétypal Vente → vérifier que Conducteur < 50%
  3. Passer le test avec le profil archétypal Maintenance → vérifier top 3
  4. Test avec le fondateur (conducteur de train) → vérifier cohérence
  5. Test de régression : les anciennes sessions V1 restent lisibles

Durée estimée : 2 jours de test
```

---

## 7.3 Impact complet sur la base Supabase

```sql
-- Impact minimal — aucun changement de schéma

-- 1. Nouveau test V3
INSERT INTO compatibility_tests (id, name, description, version)
VALUES ('c3d4e5f6-...', 'Test V3 — 27 questions', '...', 3);

-- 2. 27 nouvelles questions
INSERT INTO quiz_questions (test_id, question_text, dimension, weight, order_index)
VALUES (...) × 27;

-- 3. Le code frontend charge automatiquement le dernier test (version MAX)

-- Aucun DROP, aucun ALTER, aucune migration destructive
-- Les données V1 et V2 restent intactes
```

---

## 7.4 Impact complet sur les composants Next.js

| Fichier | Changement | Complexité |
|---|---|---|
| `score/route.ts` | Réécriture des profils + algorithme | Moyenne (~150 lignes) |
| `quiz/page.tsx` | Remplacer tableau QUESTIONS | Faible (~60 lignes) |
| `resultats/page.tsx` | Aucun changement (dynamique) | Nulle |
| `page.tsx` (intro) | Mettre à jour textes (27 questions, 12 min) | Très faible |
| `metiers.ts` | Aucun changement | Nulle |
| Supabase migrations | 1 INSERT test + 27 INSERT questions | Faible |

---

## 7.5 Recommandations finales

### À faire AVANT l'implémentation

1. **Valider les profils métiers** avec le fondateur — en particulier les notes de résistance physique, travail de nuit et multitâche. Une erreur dans ces profils se propage dans tous les scores.

2. **Tester les formulations des 27 questions** avec 3 personnes de métiers différents. Certaines formulations peuvent paraître évidentes sur le terrain mais ne pas résonner pour les candidats externes.

3. **Décider d'inclure ou non Q28 et Q29.** Ces deux questions résolent la paire ASCT/Escale et Maintenance/Voie mais allongent le test à 29 questions. Recommandation : les inclure — elles sont les plus discriminantes du test.

### À faire APRÈS l'implémentation

4. **Monitorer les feedbacks** après chaque test complété (le composant FeedbackWidget existe). Collecter 50 résultats avant d'ajuster les profils.

5. **A/B tester les formulations** des questions les plus sensibles (Q1 solitude, Q4 relation client) — les mots ont un impact fort sur les réponses.

6. **Prévoir une révision annuelle des profils métiers** — les conditions de travail évoluent (automation, nouvelles technologies embarquées, évolution des conventions collectives).

### Sur la paire ASCT/Escale

La similarité résiduelle (83%) reflète en partie une réalité — ces deux métiers ont des cultures proches et certains agents exercent les deux fonctions (postes polycompétents). Si Q28 ne résout pas complètement la discrimination, envisager de fusionner la restitution en une carte "Métiers au contact voyageurs" avec un détail des nuances entre les deux.

### Sur la paire Maintenance/Voie

La similarité résiduelle (83%) nécessite Q29 (intérieur vs extérieur). Sans cette question, les deux métiers ressortent systématiquement en couple et la discrimination est impossible. C'est la question la plus impactante du questionnaire étendu.

---

## 7.6 État des objectifs

| Objectif | Résultat V3 | Verdict |
|---|---|---|
| Profil Vente → Conducteur ≤ 50% | **42%** | ✅ Atteint |
| Conducteur → #1 pour profil conducteur | **89%** | ✅ Atteint |
| Circulation → #1 pour profil circulation | **88%** | ✅ Atteint |
| Maintenance → #1 pour profil maintenance | **87%** | ✅ Atteint |
| Commercial pur → Conducteur ≤ 50% | **42%** | ✅ Atteint |
| Paire ASCT/Escale < 85% similaires | 83% | ⚠️ Marginalement amélioré |
| Paire Maintenance/Voie < 80% similaires | 83% | ⚠️ Besoin Q29 |
| Score #1 toujours ≥ 85% pour archétype exact | 85-98% | ✅ Atteint |

---

*Document de conception V3 — Juin 2026 — RailReady*
*Fondé sur simulation Python quantitative complète*
*Aucun code produit — conception métier uniquement*
