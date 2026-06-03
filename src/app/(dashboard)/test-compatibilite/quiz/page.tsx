'use client'

// ============================================================
// RAILREADY — Quiz Test de Compatibilité V3
// 27 questions situationnelles | Sans biais de désirabilité
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
