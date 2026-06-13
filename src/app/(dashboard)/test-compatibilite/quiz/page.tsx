'use client'

// ============================================================
// RAILREADY — Quiz Test de Compatibilité V1.1
// 47 questions situationnelles | Sans biais de désirabilité
// 20 nouvelles questions discriminantes ajoutées en V1.1
// ============================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUESTIONS = [
  { id: 's1', dimension: 'solitude', weight: 2.0,
    text: "Vous avez passé 6 heures dans un espace de travail isolé, sans possibilité de parler à quelqu'un ni changer d'environnement. À la fin de ces 6 heures, vous vous sentez :",
    context: "Pas de bonne ou mauvaise réponse — nous cherchons votre réaction instinctive. Différents métiers ferroviaires correspondent à des tempéraments différents.",
    echelle: ["Épuisé(e), irritable — j'avais vraiment besoin d'interaction humaine","Un peu à plat, je préfère les environnements avec du monde","Ni l'un ni l'autre, je m'adapte facilement","Plutôt bien, j'ai apprécié cette tranquillité","Reposé(e) et efficace, ces heures m'ont appartenu entièrement"] },

  { id: 's2', dimension: 'solitude', weight: 1.8,
    text: "Si vous deviez choisir entre deux postes identiques en rémunération et intérêt, lequel choisiriez-vous ?",
    context: "Un conducteur de train passe l'essentiel de son service seul en cabine. Un agent de vente est entouré de collègues et de voyageurs toute la journée.",
    echelle: ["Poste A : en équipe permanente, dans un environnement social animé","Principalement en équipe avec des plages solo","Aucune préférence nette selon les jours","Principalement seul(e) avec quelques échanges ponctuels","Poste B : principalement seul(e), contact humain limité et bien défini"] },

  { id: 's3', dimension: 'solitude', weight: 1.5,
    text: "Lors de vos vacances ou jours off, vous préférez naturellement :",
    context: "Une question sur votre tempérament naturel, pas sur vos capacités sociales.",
    echelle: ["Être entouré(e) : famille, amis, sorties — le vide m'est inconfortable","Majoritairement en compagnie, quelques moments seul(e)","Équilibre entre solitude et compagnie selon les jours","Souvent seul(e), je recharge mes batteries dans la tranquillité","Très souvent seul(e) — j'ai besoin de silence et d'espace personnel"] },

  { id: 'rc1', dimension: 'relation_client', weight: 2.0,
    text: "À la fin d'une journée de travail, quelle situation vous aurait procuré le plus de satisfaction ?",
    context: "Aucune de ces satisfactions n'est supérieure à l'autre — elles correspondent à des métiers différents.",
    echelle: ["Avoir résolu seul(e) un problème technique complexe qui m'avait résisté","Avoir mené à bien une mission précise avec un résultat concret","Une combinaison des deux selon les jours","Avoir aidé plusieurs personnes à traverser une situation difficile","Avoir été le point de contact humain de dizaines de personnes qui en avaient besoin"] },

  { id: 'rc2', dimension: 'relation_client', weight: 1.8,
    text: "Un inconnu s'approche de vous dans un lieu public — il semble perdu et stressé. Votre réaction instinctive :",
    context: "Pas de jugement. Certains sont naturellement tournés vers autrui, d'autres non.",
    echelle: ["J'attends qu'il s'adresse à moi formellement ou trouve quelqu'un de compétent","Je réponds s'il me sollicite, mais sans m'imposer","Je lui demande si je peux l'aider","Je prends naturellement l'initiative d'aller vers lui","Je m'approche spontanément et prends le temps nécessaire, même sans toutes les réponses"] },

  { id: 'rc3', dimension: 'relation_client', weight: 1.5,
    text: "Après une longue journée passée à interagir avec beaucoup de personnes différentes, vous vous sentez :",
    context: "Ce que vous ressentez naturellement, pas ce que vous pensez devoir ressentir.",
    echelle: ["Épuisé(e) — le contact humain continu me vide","Fatigué(e) mais c'est gérable","Neutre, ça ne me pose pas de problème particulier","Bien — les interactions m'ont plutôt stimulé(e)","Énergisé(e) — c'est précisément ce type de journée qui me ressource"] },

  { id: 'mt1', dimension: 'multitache', weight: 1.8,
    text: "Vous gérez 4 situations qui demandent toutes de l'attention et évoluent simultanément. Vous :",
    context: "Un agent de régulation ferroviaire gère parfois 8 trains en temps réel. Un conducteur se concentre sur une seule chose : conduire.",
    echelle: ["Suis déstabilisé(e), je perds le fil — je préfère finir A avant de commencer B","Gère mais c'est difficile, ça demande un effort important","M'en sors correctement sans être ni stimulé(e) ni épuisé(e)","Me sens dans mon élément, ça me donne de l'énergie","C'est dans ces conditions que je suis le plus efficace — les flux multiples me stimulent"] },

  { id: 'mt2', dimension: 'multitache', weight: 1.5,
    text: "Quelle manière de travailler vous correspond le mieux sur le long terme ?",
    context: "Aucune n'est supérieure — un conducteur et un régulateur ont des besoins opposés, et les deux ont leur place.",
    echelle: ["Travailler sur un seul sujet en profondeur, sans interruption, jusqu'à la maîtrise complète","Principalement en focus, avec quelques interruptions gérées","Un équilibre entre concentration et gestion de plusieurs flux","Gérer plusieurs flux en parallèle, en jonglant entre les priorités","La gestion multi-flux permanente — les sujets qui changent constamment"] },

  { id: 'rp1', dimension: 'repetitivite', weight: 1.8,
    text: "Faire la même chose de nombreuses fois — le même trajet, les mêmes gestes, dans le même ordre — vous permet d'atteindre une forme de maîtrise que vous :",
    context: "Un conducteur TER fait parfois le même aller-retour pendant des années. C'est pour lui une forme de maîtrise, pas une contrainte.",
    echelle: ["Fuyez activement — la répétition me démotive rapidement","Tolérez mais ça ne me nourrit pas sur le long terme","Acceptez — c'est parfois nécessaire","Appréciez — la maîtrise par la répétition m'apporte satisfaction","Recherchez — l'excellence dans l'exécution répétée est ce qui me motive profondément"] },

  { id: 'rp2', dimension: 'repetitivite', weight: 1.5,
    text: "Sur le long terme, ce qui vous motive davantage dans un travail :",
    context: "Pas de jugement — les deux tempéraments ont un métier ferroviaire qui leur correspond.",
    echelle: ["La diversité : chaque journée est une nouvelle situation, jamais deux fois identique","Un peu de nouveauté régulière dans un cadre stable","Un équilibre entre routine maîtrisée et variation","Un cadre stable et maîtrisé, avec quelques variations","La maîtrise parfaite d'un domaine précis, même si le quotidien est similaire"] },

  { id: 'tn1', dimension: 'travail_nuit', weight: 1.8,
    text: "Vous devez réaliser une tâche complexe nécessitant concentration et précision à 3h du matin, après 6 heures de travail nocturne. Comment vous évaluez-vous ?",
    context: "Dans les technicentres et sur les chantiers voie, travailler à 3h du matin est la norme, pas l'exception.",
    echelle: ["Clairement inefficace — la nuit profonde m'affecte fortement","Fonctionnel(le) mais avec des efforts importants pour maintenir la vigilance","Correct(e) — je m'en sors mais ce n'est pas mon meilleur moment","Capable de maintenir ma performance même à cette heure","La nuit ne m'affecte pas notablement — je suis aussi efficace à 3h qu'à 10h"] },

  { id: 'tn2', dimension: 'travail_nuit', weight: 1.5,
    text: "Si votre poste implique que la majorité de vos services se déroulent entre 22h et 6h du matin :",
    context: "Dans les technicentres et sur les voies, le travail de nuit n'est pas l'exception — c'est la règle.",
    echelle: ["C'est un frein majeur — je ne me vois pas tenir sur le long terme","C'est difficile — j'accepterais en début de carrière mais je chercherais à changer","C'est une contrainte que j'accepte si le poste me convient par ailleurs","C'est quelque chose que je peux intégrer durablement dans ma vie","Ça ne me pose pas de problème — j'ai déjà testé ou je suis naturellement nocturne"] },

  { id: 'hd1', dimension: 'horaires_decales', weight: 1.8,
    text: "Travailler régulièrement les nuits, les week-ends et les jours fériés aurait un impact concret sur votre vie actuelle :",
    context: "Pensez à votre situation concrète aujourd'hui : conjoint, enfants, vie sociale, contraintes personnelles.",
    echelle: ["Très fort : ma situation familiale ou personnelle rend cela très difficile","Notable : ce serait une vraie adaptation avec des frictions importantes","Modéré : certains ajustements seraient nécessaires mais gérables","Limité : ma vie actuelle s'adapte sans trop de difficulté","Minimal : ma situation personnelle se prête tout à fait à ces contraintes"] },

  { id: 'hd2', dimension: 'horaires_decales', weight: 1.2,
    text: "Travailler le 25 décembre, le 1er janvier ou un dimanche de Pâques :",
    context: "Le ferroviaire est un service permanent. Noël ou pas, les trains circulent et les équipes assurent.",
    echelle: ["C'est pour moi un obstacle important que j'aurais beaucoup de mal à accepter","C'est difficile mais je pourrais l'envisager ponctuellement","C'est une contrainte que j'accepte dans le cadre d'un travail qui m'intéresse","Ça ne me pose pas de problème majeur — les fêtes sont compensées autrement","Je l'assume pleinement — c'est inhérent au service public et j'en suis conscient(e)"] },

  { id: 'rph1', dimension: 'resistance_physique', weight: 1.8,
    text: "Travailler régulièrement en extérieur, de nuit, par temps froid ou pluvieux, sur un chantier physiquement exigeant (port de charges, positions contraintes, terrain irrégulier) :",
    context: "Un technicien voie travaille dehors, la nuit, par tous les temps. Ce n'est pas négociable.",
    echelle: ["Est un facteur rédhibitoire — je ne me vois pas dans ces conditions durablement","Est difficile — j'accepterais en début de carrière mais ce n'est pas mon idéal","Est une contrainte que j'accepte si la mission le justifie","Ne me pose pas de problème — j'ai une bonne résistance physique","Est mon environnement naturel — je suis à l'aise dans ces conditions"] },

  { id: 'rph2', dimension: 'resistance_physique', weight: 1.3,
    text: "En dehors du travail, votre rapport à l'effort physique :",
    context: "Pas de jugement — c'est une indication de votre capacité à tenir dans des conditions physiquement exigeantes.",
    echelle: ["Je préfère largement les activités sédentaires","Je fais quelques activités légères mais l'effort intense n'est pas mon fort","J'ai un niveau d'activité physique modéré et régulier","Je suis physiquement actif(ve) et à l'aise avec les efforts prolongés","L'effort physique fait naturellement et intensément partie de mon quotidien"] },

  { id: 'pd1', dimension: 'prise_decision', weight: 1.8,
    text: "Une décision urgente doit être prise avec des conséquences importantes. Vous n'avez pas le temps de consulter. Vous :",
    context: "Dans certains métiers ferroviaires, attendre une validation externe coûte des minutes précieuses.",
    echelle: ["J'attends d'avoir pu consulter — une décision concertée vaut toujours mieux","Je préfère consulter, mais j'agis si vraiment nécessaire","Je décide selon les circonstances","Je décide — l'attente a un coût plus élevé que l'incertitude de ma décision","Je décide seul(e), vite, sur la base de mon analyse — c'est naturel pour moi"] },

  { id: 'pd2', dimension: 'prise_decision', weight: 1.5,
    text: "Vous avez pris une décision importante seul(e). Elle s'avère ne pas être la meilleure. Vous :",
    context: "La capacité à assumer ses décisions solitaires est aussi importante que la décision elle-même.",
    echelle: ["Regrette d'avoir décidé seul(e) — j'aurais dû chercher un avis","Me questionne sur ma méthode de décision","Analyse pour m'améliorer, sans culpabilité excessive","Assume et tire les leçons — l'incertitude fait partie de la décision","Assume pleinement — j'avais les informations disponibles, j'ai décidé, c'est mon rôle"] },

  { id: 'au1', dimension: 'autorite', weight: 1.5,
    text: "Vous devez faire respecter une règle à quelqu'un qui refuse d'obtempérer et conteste votre légitimité. Votre réaction naturelle :",
    context: "Dans certains métiers, l'autorité est une obligation fonctionnelle, pas un choix.",
    echelle: ["Je cède ou redirige vers un responsable — l'affrontement n'est pas mon registre","Je répète la règle mais recule si la pression monte","Je maintiens ma position avec calme, sans chercher l'escalade","Je maintiens fermement, j'explique les conséquences du refus et applique la procédure","Je maintiens, j'applique et je documente — la règle s'applique quelle que soit la réaction"] },

  { id: 'gc1', dimension: 'gestion_conflit', weight: 1.8,
    text: "Face à un inconnu visiblement agressif et de mauvaise foi, votre réaction instinctive :",
    context: "Un contrôleur ou agent d'escale fait face à ces situations régulièrement dans son service.",
    echelle: ["Je cherche à m'éloigner rapidement — ce type de confrontation me déstabilise","Je réponds de manière minimale et cherche une sortie","Je reste calme mais cherche à abréger l'interaction","Je maintiens le dialogue avec calme, cherchant à désamorcer","Je reste totalement maître de mes réactions, je cherche activement une issue apaisée"] },

  { id: 'gc2', dimension: 'gestion_conflit', weight: 1.5,
    text: "Quelqu'un conteste votre décision ou votre compétence, devant d'autres personnes. Vous :",
    context: "Un voyageur qui conteste un contrôle devant les autres passagers — scénario courant pour un ASCT.",
    echelle: ["Suis ébranlé(e) — la contestation publique me déstabilise","Réponds maladroitement — le public me gêne","Gère correctement mais j'ai besoin d'un moment pour me recadrer ensuite","Réponds avec calme, maintiens ma position si elle est juste","Gère parfaitement — la pression publique ne change pas ma réaction"] },

  { id: 'at1', dimension: 'aptitude_technique', weight: 1.5,
    text: "Un équipement tombe en panne. Votre réaction instinctive :",
    context: "Aucun prérequis technique — c'est une question de rapport naturel à la technique.",
    echelle: ["J'appelle quelqu'un qui s'y connaît — comprendre la technique n'est pas mon registre","Je vérifie les éléments de base mais sans chercher à diagnostiquer en profondeur","Je tente un diagnostic de surface avant d'appeler","J'essaie de comprendre le problème avant de demander de l'aide","Je veux comprendre pourquoi ça ne fonctionne pas — le diagnostic est pour moi un réflexe naturel"] },

  { id: 'at2', dimension: 'aptitude_technique', weight: 1.2,
    text: "Apprendre le fonctionnement interne d'un système technique complexe (hydraulique, électronique, mécanique) :",
    context: "La technicité ferroviaire est une réalité de nombreux postes — pas uniquement la maintenance.",
    echelle: ["Est laborieux et sans intérêt pour moi","Est une nécessité que j'accepte si le poste l'exige","Ne me pose pas de problème particulier","M'intéresse et me donne envie de comprendre plus","M'attire naturellement — comprendre comment les choses fonctionnent est quelque chose que je recherche"] },

  { id: 'ai1', dimension: 'adaptation_imprevus', weight: 1.5,
    text: "Votre plan de travail de la journée est bouleversé dès 9h par une série d'événements imprévus. Vous :",
    context: "Un agent d'escale ou un régulateur ferroviaire gère de l'imprévu permanent — c'est la définition du poste.",
    echelle: ["Suis déstabilisé(e) — l'imprévu me perturbe durablement et nuit à ma performance","M'adapte mais avec difficulté — j'ai besoin d'un moment pour me recalibrer","Gère correctement — l'imprévu ne me perturbe pas trop","M'active — l'imprévu me challenge et me pousse à être plus performant(e)","C'est dans ces moments que je suis le plus efficace — l'imprévu active quelque chose en moi"] },

  { id: 'ai2', dimension: 'adaptation_imprevus', weight: 1.2,
    text: "Une journée entièrement prévisible, routinière, sans aucun imprévu, vous donne le sentiment de :",
    context: "Certains métiers demandent d'apprécier la routine, d'autres demandent d'aimer l'imprévu.",
    echelle: ["Soulagement — j'ai pu me concentrer sur mes tâches sans perturbation","Satisfaction — le travail s'est bien passé","Normalité — c'est comme ça que je préfère travailler","Légère frustration — il me manque quelque chose","Ennui — sans défi, je ne suis pas pleinement en activité"] },

  { id: 'gs1', dimension: 'gestion_stress', weight: 1.5,
    text: "Vous êtes responsable d'une décision qui conditionne la sécurité ou le bien-être de plusieurs personnes. Vous êtes seul(e). Vous sentez la pression. Vous :",
    context: "Conducteur, régulateur, ASCT — tous prennent des décisions sous pression de responsabilité.",
    echelle: ["Suis paralysé(e) par la pression — elle nuit à mes capacités","Gère mais c'est épuisant et cela me demande un effort important","Gère correctement — la pression me mobilise sans me dépasser","La pression m'active — je prends de meilleures décisions sous responsabilité","La responsabilité et la pression sont des environnements dans lesquels je performe naturellement"] },

  { id: 'mob1', dimension: 'mobilite', weight: 1.0,
    text: "Votre premier poste vous est affecté dans une ville à 200 km de là où vous vivez actuellement :",
    context: "Les affectations initiales ne sont pas toujours négociables dans le ferroviaire.",
    echelle: ["C'est un obstacle majeur — ma situation personnelle rend cela impossible ou très difficile","C'est compliqué — j'accepterais peut-être mais avec beaucoup d'hésitation","Je peux l'envisager si le poste me correspond vraiment","Je l'accepte — c'est souvent inévitable en début de carrière","Ça ne me pose pas de problème — je suis prêt(e) à m'adapter géographiquement"] },

  // ── V1.1 : 20 nouvelles questions discriminantes ──────────────

  // SOLITUDE RENFORCÉE (s4, s5) — discrimination Conducteur vs ASCT
  { id: 's4', dimension: 'solitude', weight: 2.0,
    text: "Imaginez une semaine de travail où vous n'avez aucune interaction sociale significative avec des collègues. Votre ressenti dominant serait :",
    context: "Un conducteur de train peut passer l'essentiel de sa semaine sans croiser ses collègues, uniquement par téléphone ou radio.",
    echelle: ["Un ressenti négatif fort — l'isolement me pèserait rapidement et durablement","Un peu difficile — le lien social avec les collègues me manquerait","Neutre — j'ai d'autres sources de liens en dehors du travail","Plutôt bien — chaque jour m'appartient sans avoir à gérer les dynamiques de groupe","Parfaitement à l'aise — cette autonomie relationnelle est ce que je recherche"] },

  { id: 's5', dimension: 'solitude', weight: 1.8,
    text: "Sur une journée de 8 heures, quelle proportion de temps passé seul(e) vous semblerait idéale pour travailler efficacement ?",
    context: "La proportion varie énormément selon les métiers : 95% seul en cabine de conduite vs 10% seul en poste de vente.",
    echelle: ["Moins de 20% — j'ai besoin de présence humaine continue pour rester motivé(e)","Entre 20% et 40% — quelques plages solo suffisent","Entre 40% et 60% — un équilibre entre présence et solitude","Entre 60% et 80% — je suis plus efficace avec de l'espace","Plus de 80% — j'ai besoin de longues plages de travail solitaire"] },

  // AUTONOMIE / PRISE DE DÉCISION (pd3, pd4)
  { id: 'pd3', dimension: 'prise_decision', weight: 1.8,
    text: "Vous n'avez pas reçu d'instructions claires pour une situation inhabituelle. Votre hiérarchie est injoignable. Vous :",
    context: "Dans le ferroviaire, attendre des instructions peut avoir des conséquences réelles sur la circulation.",
    echelle: ["Attends absolument d'avoir pu joindre quelqu'un de compétent avant d'agir","Essaie longtemps de joindre quelqu'un, puis agis en dernier recours","Évalue rapidement la situation et agis si l'urgence le justifie","Prends une décision raisonnée sur la base de ma formation et mon expérience","Agis immédiatement sur la base de mon analyse — la réactivité prime"] },

  { id: 'pd4', dimension: 'prise_decision', weight: 1.5,
    text: "Dans votre idéal professionnel, la validation de vos décisions par un supérieur :",
    context: "Certains métiers demandent une autonomie quasi-totale au quotidien. D'autres fonctionnent en équipe avec validation.",
    echelle: ["Est rassurante et nécessaire — j'aime savoir que mes décisions sont vérifiées","Est appréciée pour les décisions importantes","Est utile parfois mais je suis capable d'agir seul(e)","Est rarement nécessaire — j'ai confiance en mon jugement","N'est pas ma priorité — l'autonomie décisionnelle est ce que je recherche"] },

  // APTITUDE TECHNIQUE (at3, at4)
  { id: 'at3', dimension: 'aptitude_technique', weight: 1.8,
    text: "Face à une procédure technique longue et précise (10 étapes, dans l'ordre, sans erreur possible), vous :",
    context: "Les conducteurs et techniciens suivent quotidiennement des procédures techniques séquentielles de ce type.",
    echelle: ["Suis facilement déstabilisé(e) par les procédures longues — le risque d'oubli me stress","Suis les procédures correctement mais avec effort et vérifications multiples","Les suis sans difficulté particulière","Les applique avec rigueur et naturel — la séquence me sécurise","Les procédures précises sont mon environnement naturel — j'aime leur logique implacable"] },

  { id: 'at4', dimension: 'aptitude_technique', weight: 1.5,
    text: "On vous explique le fonctionnement d'un système technique complexe (pneumatique de freinage, logique de signalisation...). Votre réaction :",
    context: "La conduite et la maintenance impliquent de comprendre des systèmes techniques interdépendants.",
    echelle: ["C'est laborieux — je retiens mal les explications techniques abstraites","J'écoute attentivement mais certains aspects m'échappent","Je comprends l'essentiel avec une explication claire","Je comprends vite et cherche à approfondir","J'adore ça — comprendre un système complet m'absorbe complètement"] },

  // SÉCURITÉ / RIGUEUR (rp3, rp4)
  { id: 'rp3', dimension: 'repetitivite', weight: 2.0,
    text: "Dans votre travail, un oubli ou une déviation à la procédure peut avoir des conséquences graves. Dans ce contexte, la vérification systématique avant chaque action :",
    context: "Dans le ferroviaire, la rigueur procédurale n'est pas un choix — c'est une obligation de sécurité.",
    echelle: ["Me pèse — les vérifications constantes brisent mon rythme naturel","Est une contrainte que j'accepte car c'est le règlement","Ne me pose pas de problème particulier","Est un réflexe naturel que j'applique sans y penser","Est pour moi la base du sérieux professionnel — je ne comprends pas comment on peut s'en passer"] },

  { id: 'rp4', dimension: 'repetitivite', weight: 1.5,
    text: "Vous avez déjà réalisé cette procédure 500 fois. Ce matin, vous la refaites une fois de plus. Votre vigilance :",
    context: "La routine peut créer un relâchement dangereux. Certains personnels maintiennent une vigilance intacte après des années.",
    echelle: ["A tendance à baisser — la répétition émousse naturellement mon attention","Peut fléchir légèrement sur les tâches très répétées","Se maintient correctement avec un effort de concentration","Reste stable — je me rappelle l'enjeu à chaque fois","Est identique à la première fois — la routine ne m'endort pas, elle me professionnalise"] },

  // GESTION DU STRESS (gs2, gs3, gs4)
  { id: 'gs2', dimension: 'gestion_stress', weight: 1.8,
    text: "Un incident se produit. Vous devez simultanément : alerter, appliquer une procédure d'urgence et communiquer avec plusieurs interlocuteurs. Vous :",
    context: "Ce type de situation se produit en conduite ou en poste de régulation. La capacité à gérer la simultanéité sous stress est discriminante.",
    echelle: ["Suis submergé(e) — je perds mes moyens face à la multiplicité des actions simultanées","Gère difficilement — il m'arrive d'oublier un élément sous pression","Me structure rapidement et agis de manière priorisée","Gère efficacement — la pression multiple m'active","C'est précisément dans ce type de situation que je suis le plus performant(e)"] },

  { id: 'gs3', dimension: 'gestion_stress', weight: 1.5,
    text: "Les jours où rien ne se passe, où votre vigilance n'est sollicitée par aucun incident, vous :",
    context: "Le ferroviaire oscille entre longues plages de calme et situations d'urgence soudaines — les deux doivent être gérées.",
    echelle: ["Vous relaxez pleinement — les journées calmes sont les meilleures","Maintenez une vigilance suffisante tout en relâchant un peu la pression","Maintenez votre niveau d'attention standard","Restez sur le qui-vive malgré le calme apparent — l'imprévu peut survenir à tout moment","Maintenez une vigilance maximale constante — le calme ne signifie pas l'absence de risque"] },

  { id: 'gs4', dimension: 'gestion_stress', weight: 1.2,
    text: "Après un incident sérieux que vous avez géré seul(e), les heures qui suivent, vous :",
    context: "La capacité à récupérer mentalement après un incident est importante pour la continuité du service.",
    echelle: ["Ressentez un choc prolongé — l'incident continue à m'impacter plusieurs heures","Avez besoin d'un moment pour décompresser avant de reprendre normalement","Récupérez assez rapidement et reprenez votre activité","Reprenez presque immédiatement — l'adrénaline retombe vite","Êtes pratiquement dans votre état normal — la gestion d'incident fait partie du travail"] },

  // RELATIONNEL CLIENT (rc4, rc5)
  { id: 'rc4', dimension: 'relation_client', weight: 1.8,
    text: "Vous expliquez pour la 50ème fois de la journée la même information à un voyageur perdu. Votre ton et votre patience :",
    context: "Un agent d'escale ou un contrôleur répond des dizaines de fois par jour aux mêmes questions sans pouvoir le montrer.",
    echelle: ["Sont nettement altérés — la répétition m'impatiente et ça se sent","Sont maintenus par effort — je dois me contrôler pour rester agréable","Sont constants — la répétition ne m'affecte pas particulièrement","Sont identiques à la première fois — chaque voyageur mérite la même attention","Sont même meilleurs — chaque échange humain m'apporte quelque chose"] },

  { id: 'rc5', dimension: 'relation_client', weight: 1.5,
    text: "Un voyageur vous sollicite avec une demande impossible à satisfaire (train annulé sans solution de remplacement immédiate). Vous :",
    context: "La capacité à gérer des situations sans solution parfaite en gardant le lien humain est centrale pour les métiers de contact.",
    echelle: ["Avez du mal à gérer la frustration du voyageur et votre propre malaise","Gérez mais c'est un exercice difficile qui vous coûte de l'énergie","Gérez correctement en expliquant la situation","Gérez avec empathie en cherchant des alternatives même partielles","Trouvez naturellement les mots pour maintenir le lien malgré l'absence de solution"] },

  // GESTION DES CONFLITS (gc3, gc4)
  { id: 'gc3', dimension: 'gestion_conflit', weight: 1.8,
    text: "Un groupe de voyageurs s'emballe collectivement après une annonce difficile (retard majeur, suppression de train). Vous êtes seul(e) face à eux. Vous :",
    context: "Les incidents en service exposent le personnel à des tensions collectives. La capacité à gérer une foule hostile est rare.",
    echelle: ["Cherchez immédiatement du renfort — je ne me sens pas capable de gérer seul(e)","Tentez de calmer mais la situation collective me dépasse","Gérez en établissant un dialogue clair et ferme","Gérez en prenant le leadership de la situation pour la désamorcer","Vous sentez dans votre élément — la gestion de tensions collectives m'active"] },

  { id: 'gc4', dimension: 'gestion_conflit', weight: 1.3,
    text: "Après un conflit professionnel difficile (voyageur agressif, situation tendue), votre gestion émotionnelle :",
    context: "La résilience émotionnelle après un conflit conditionne la capacité à continuer son service normalement.",
    echelle: ["Est très longue — le conflit continue à m'impacter et perturbe la suite de mon service","Nécessite du temps — j'ai besoin d'un moment de décompression","Est correcte — je retrouve mon équilibre relativement vite","Est rapide — je coupe mentalement après le conflit","Est immédiate — je passe à la suite sans traîner l'épisode"] },

  // AUTORITÉ (au2, au3)
  { id: 'au2', dimension: 'autorite', weight: 1.8,
    text: "Vous devez refuser catégoriquement quelque chose à un voyageur qui insiste et élève la voix devant d'autres personnes. Vous :",
    context: "Les métiers en contact direct impliquent régulièrement de maintenir une décision ferme face à une pression sociale.",
    echelle: ["Cédez ou faites une exception pour éviter la confrontation publique","Maintenez votre position mais cherchez une issue rapide pour clore l'échange","Maintenez calmement, expliquez les règles et restez disponible au dialogue","Maintenez fermement en utilisant la procédure comme cadre et appliquant les conséquences","Maintenez, documentez et appliquez — la règle ne négocie pas, quelle que soit la pression"] },

  { id: 'au3', dimension: 'autorite', weight: 1.5,
    text: "Exercer une forme d'autorité fonctionnelle (faire respecter une règle, contrôler, sanctionner) dans votre activité professionnelle :",
    context: "Contrôleurs, agents d'escale, chefs de bord : l'autorité fonctionnelle est une dimension centrale de ces postes.",
    echelle: ["Me met mal à l'aise — je préfère nettement les postes sans dimension d'autorité","Est quelque chose que j'accepte si le poste l'exige, sans l'apprécier particulièrement","Est une dimension neutre — ni cherchée ni redoutée","Est quelque chose que je maîtrise et qui ne me pose aucun problème","Est une dimension que j'apprécie activement dans un travail — la clarté de l'autorité fonctionnelle me convient"] },

  // MULTITÂCHE (mt3)
  { id: 'mt3', dimension: 'multitache', weight: 1.5,
    text: "Comparer les deux scénarios : A) surveiller 8 paramètres en temps réel sur écrans multiples / B) conduire sur une voie unique en concentrant toute votre attention. Lequel vous attire le plus ?",
    context: "Agent de régulation vs conducteur de train : deux métiers ferroviaires radicalement opposés sur la gestion de l'attention.",
    echelle: ["Clairement B — la concentration totale sur une tâche unique est ce que je recherche","Plutôt B mais A ne m'est pas inaccessible","Aucune préférence nette — les deux m'attirent","Plutôt A mais B me serait accessible","Clairement A — la supervision multi-flux permanente est stimulante"] },

  // ADAPTATION AUX IMPRÉVUS (ai3, ai4)
  { id: 'ai3', dimension: 'adaptation_imprevus', weight: 1.5,
    text: "Vous aimeriez que votre journée de travail ressemble à :",
    context: "Certains postes ferroviaires sont ultra-prévisibles (trajet défini à l'avance), d'autres sont totalement imprévisibles (gestion d'incidents).",
    echelle: ["Un plan précis et respecté — chaque heure définie à l'avance, peu de surprises","Principalement structuré avec quelques variations mineures","Un équilibre entre routines stables et situations variées","Principalement dynamique avec quelques points fixes","Une succession de situations différentes, sans programme figé — l'adaptabilité permanente m'énergise"] },

  { id: 'ai4', dimension: 'adaptation_imprevus', weight: 1.2,
    text: "Face à une situation ferroviaire inédite (panne rare, incident inhabituel), pour laquelle vous n'avez pas de procédure préétablie, vous :",
    context: "Les incidents rares testent la capacité à raisonner hors procédure tout en restant dans le cadre de sécurité.",
    echelle: ["Suis très déstabilisé(e) — le hors-procédure m'angoisse","Cherche activement quelqu'un qui a la procédure ou l'expérience","Raisonne à partir de ma formation et des principes de sécurité","Analyse rapidement les paramètres disponibles et agis avec méthode","Suis dans mon élément — le raisonnement sous incertitude est ce qui me stimule le plus"] },
]

export default function QuizPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const question = QUESTIONS[current]
  const progress = Math.round((current / QUESTIONS.length) * 100)
  const isLast = current === QUESTIONS.length - 1

  useEffect(() => {
    setSelected(answers[question.id] ?? null)
  }, [current, question.id, answers])

  function handleSelect(value: number) { setSelected(value) }

  function handleNext() {
    if (selected === null) return
    const newAnswers = { ...answers, [question.id]: selected }
    setAnswers(newAnswers)
    if (isLast) handleSubmit(newAnswers)
    else setCurrent(c => c + 1)
  }

  function handlePrev() {
    if (current > 0) setCurrent(c => c - 1)
  }

  async function handleSubmit(finalAnswers: Record<string, number>) {
    setIsSubmitting(true)
    try {
      const formattedAnswers = QUESTIONS.map(q => ({
        questionId: q.id,
        dimension: q.dimension,
        weight: q.weight,
        value: finalAnswers[q.id] || 3,
      }))
      const sessionId = crypto.randomUUID()
      const res = await fetch('/api/compatibility/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers, sessionId }),
      })
      if (!res.ok) throw new Error('Erreur API')
      const result = await res.json()
      sessionStorage.setItem('compatibilite_result', JSON.stringify(result))
      router.push('/test-compatibilite/resultats')
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      alert('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Progression */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {current + 1} / {QUESTIONS.length}</span>
          <span>{progress}% complété</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
          {question.dimension.replace(/_/g, ' ')}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-snug">
          {question.text}
        </h2>
        {question.context && (
          <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">
            💡 {question.context}
          </p>
        )}
      </div>

      {/* Réponses avec labels propres à la question */}
      <div className="space-y-2.5 mb-6">
        {question.echelle.map((label, idx) => {
          const value = idx + 1
          return (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                selected === value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                selected === value
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {value}
              </div>
              <span className={`text-sm leading-snug ${selected === value ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button onClick={handlePrev} disabled={current === 0}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition-colors">
          ← Précédent
        </button>
        <button onClick={handleNext} disabled={selected === null || isSubmitting}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            selected !== null ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}>
          {isSubmitting ? 'Calcul en cours...' : isLast ? 'Voir mes résultats →' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}
