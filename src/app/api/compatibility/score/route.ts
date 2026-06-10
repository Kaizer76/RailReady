// ============================================================
// RAILREADY — API Scoring Test de Compatibilité V4
// POST /api/compatibility/score
//
// Architecture :
//   1. Reçoit les réponses brutes du quiz (14 dimensions)
//   2. Agrège en 7 dimensions ferroviaires composites
//   3. Calcule la compatibilité avec chaque métier (7 métiers)
//   4. Retourne classement + points forts / vigilances
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// ============================================================
// TYPES
// ============================================================

interface QuizAnswer {
  questionId: string
  dimension: string
  weight: number
  value: number // 1-5
}

interface DimensionScore {
  dimension: string
  label: string
  score: number       // 0-100
  niveau: 'fort' | 'moyen' | 'vigilance'
  description: string
}

interface MetierMatch {
  slug: string
  nom: string
  emoji: string
  compatibilite: number // 0-100
  raison: string
}

interface CompatibiliteResult {
  scoreGlobal: number
  niveauGlobal: 'fort' | 'moyen' | 'vigilance'
  dimensions: DimensionScore[]
  pointsForts: string[]
  pointsVigilance: string[]
  metiersRecommandes: MetierMatch[]
  messageGlobal: string
  disclaimer: string
}

// ============================================================
// AGRÉGATION : DIMENSIONS QUIZ → DIMENSIONS FERROVIAIRES
//
// 14 dimensions quiz → 7 dimensions ferroviaires composites
// Chaque dimension composite est une moyenne pondérée des
// sous-dimensions quiz qui la constituent.
// ============================================================

const DIMENSION_AGGREGATION: Record<string, {
  label: string
  sources: Record<string, number> // quiz_dimension → poids
  descriptions: Record<string, string>
}> = {

  vigilance: {
    label: 'Vigilance et attention soutenue',
    sources: {
      travail_nuit: 1.0,    // performance à 3h du matin
      solitude: 0.7,         // isolement sans stimulation sociale
      repetitivite: 0.6,     // maintien du niveau sur tâches monotones
    },
    descriptions: {
      fort: 'Votre capacité à maintenir une vigilance soutenue — même la nuit, seul(e), sur des tâches répétitives — est un atout majeur dans le ferroviaire. Conducteur et agent de circulation requièrent précisément cette qualité.',
      moyen: 'Votre vigilance est correcte mais pourrait être mise à l\'épreuve dans les conditions les plus exigeantes (3h du matin, 8h de nuit seul en cabine). C\'est un point à évaluer honnêtement avant de postuler aux métiers de conduite.',
      vigilance: 'Le maintien d\'une vigilance soutenue dans des conditions de fatigue ou de monotonie représente un défi pour vous. Ce n\'est pas éliminatoire pour tous les métiers, mais c\'est un point critique pour conducteur et agent de circulation.',
    },
  },

  securite_procedures: {
    label: 'Sécurité et rigueur procédurale',
    sources: {
      repetitivite: 1.0,         // exécution rigoureuse et répétée des procédures
      autorite: 0.9,              // faire respecter les règles même face à la résistance
      adaptation_imprevus: 0.7,   // maintien du cadre de sécurité même en situation dégradée
    },
    descriptions: {
      fort: 'La sécurité et les procédures sont clairement des valeurs centrales. Dans le ferroviaire, où chaque règle existe pour une raison de sécurité, c\'est la qualité la plus importante. Vous serez crédible en entretien sur ce point.',
      moyen: 'Vous respectez les procédures mais leur caractère non négociable doit être pleinement intégré. Dans le ferroviaire, il n\'existe pas de "petite dérogation" : les règles s\'appliquent dans tous les cas.',
      vigilance: 'La rigueur procédurale est une exigence non négociable dans le secteur ferroviaire. Sans conviction profonde sur ce point — et sans exemples concrets à citer — les entretiens seront difficiles. C\'est le critère le plus discriminant.',
    },
  },

  communication: {
    label: 'Communication et gestion relationnelle',
    sources: {
      relation_client: 1.0,   // contact humain, service
      gestion_conflit: 1.0,   // désamorçage, assertivité
      autorite: 0.5,           // faire passer un message difficile
    },
    descriptions: {
      fort: 'Vous êtes à l\'aise dans la communication — tant pour le service client que pour les situations de tension. Les métiers en contact direct avec les voyageurs (contrôleur, agent de vente, escale) vous correspondent bien.',
      moyen: 'Votre communication est correcte. Pour les métiers exposés aux voyageurs, il sera utile de travailler spécifiquement les situations conflictuelles et la communication sous pression.',
      vigilance: 'La communication relationnelle est un point d\'attention. Ce n\'est pas rédhibitoire pour les métiers techniques ou de conduite, mais c\'est un critère important pour les postes en contact client.',
    },
  },

  gestion_stress: {
    label: 'Gestion du stress et des urgences',
    sources: {
      gestion_stress: 1.0,         // pression et responsabilité directe
      prise_decision: 0.9,          // décision urgente sans consultation
      adaptation_imprevus: 0.8,     // réaction face à l\'inattendu
    },
    descriptions: {
      fort: 'Vous performez sous pression, prenez des décisions rapides et vous adaptez à l\'imprévu. Ces qualités sont au cœur des métiers opérationnels ferroviaires — conducteur, régulateur, ASCT.',
      moyen: 'Votre gestion du stress est correcte mais peut être travaillée. Les situations d\'urgence sont fréquentes dans le ferroviaire — en formation, vous serez régulièrement mis en situation de pression.',
      vigilance: 'La gestion du stress et des urgences est un point de vigilance important. La formation ferroviaire comprend des mises en situation éprouvantes. C\'est un aspect à travailler activement avant de postuler.',
    },
  },

  concentration: {
    label: 'Concentration et travail en profondeur',
    sources: {
      solitude: 1.0,       // travail isolé sans stimulation sociale
      repetitivite: 0.9,   // maîtrise par la répétition
      multitache: 0.6,     // focus vs dispersion (corrélation partielle)
    },
    descriptions: {
      fort: 'Vous êtes capable de maintenir une concentration élevée sur des tâches précises, seul(e), sans vous disperser. C\'est une qualité indispensable pour la conduite et la maintenance.',
      moyen: 'Votre concentration est satisfaisante mais pourra être testée dans les conditions réelles du ferroviaire (monotonie, isolement). Des stratégies personnelles de maintien de l\'attention sont utiles.',
      vigilance: 'La concentration soutenue représente un défi. C\'est un point critique pour les métiers de conduite et de maintenance, où la moindre déconcentration peut avoir des conséquences graves.',
    },
  },

  responsabilite: {
    label: 'Sens des responsabilités et autonomie',
    sources: {
      prise_decision: 1.0,   // décision solitaire et assumée
      autorite: 0.8,          // application de règles, leadership fonctionnel
      gestion_stress: 0.6,    // assumer une décision sous pression
    },
    descriptions: {
      fort: 'Vous assumez vos décisions, agissez de manière autonome et n\'avez pas besoin de validation externe pour avancer. Cette autonomie et ce sens des responsabilités sont essentiels dans les métiers ferroviaires.',
      moyen: 'Votre sens des responsabilités est bon. En situation réelle — notamment les premières semaines seul(e) en service — il sera important de renforcer votre capacité à assumer des décisions sans soutien immédiat.',
      vigilance: 'L\'autonomie et la prise de responsabilité représentent un défi. De nombreux postes ferroviaires requièrent d\'agir seul(e), sans possibilité de validation immédiate. C\'est un point à développer.',
    },
  },

  horaires_decales: {
    label: 'Tolérance aux contraintes horaires',
    sources: {
      horaires_decales: 1.0,       // nuits, week-ends, fériés — impact vie perso
      travail_nuit: 1.0,            // performance et acceptation du travail nocturne
      resistance_physique: 0.5,     // endurance physique dans les conditions difficiles
    },
    descriptions: {
      fort: 'Vous semblez compatible avec les contraintes horaires du ferroviaire : nuits, week-ends, fériés. Votre situation personnelle et votre tempérament s\'y prêtent. C\'est un point fondamental.',
      moyen: 'Les contraintes horaires sont une réalité que vous acceptez mais dont l\'impact à long terme mérite d\'être anticipé. Pensez à l\'impact concret sur votre vie de famille, vos projets personnels, votre santé sur 5 ou 10 ans.',
      vigilance: 'Les horaires décalés représentent un obstacle important à prendre au sérieux. Dans le ferroviaire, c\'est une contrainte quasi-universelle et durable. Une évaluation honnête de votre situation personnelle est indispensable avant de postuler.',
    },
  },

  aptitude_technique: {
    label: 'Aptitude et appétence technique',
    sources: {
      aptitude_technique: 1.0,
    },
    descriptions: {
      fort: 'Votre aisance et votre curiosité techniques vous ouvrent de nombreuses portes dans le ferroviaire : maintenance, voie/signalisation, conduite. La technicité ne vous fait pas peur, c\'est un vrai atout.',
      moyen: 'Votre rapport à la technique est suffisant pour de nombreux postes. La formation interne développera les compétences spécifiques. Pour les métiers de maintenance, un effort d\'apprentissage supplémentaire sera attendu.',
      vigilance: 'L\'aptitude technique est faible. Ce n\'est pas éliminatoire pour les métiers de contact client, mais c\'est un point à anticiper pour les entretiens en maintenance ou conduite.',
    },
  },

  mobilite: {
    label: 'Mobilité géographique',
    sources: {
      mobilite: 1.0,
    },
    descriptions: {
      fort: 'Vous êtes prêt(e) à vous déplacer si le poste l\'exige. C\'est un atout dans un secteur où les affectations initiales ne sont pas toujours négociables.',
      moyen: 'Votre mobilité est partielle. Ciblez en priorité les bassins d\'emploi proches de votre lieu de vie pour maximiser vos chances d\'obtenir une affectation compatible.',
      vigilance: 'La mobilité géographique peut être requise, notamment en début de carrière. Anticipez cela dans votre projet professionnel et discutez de vos contraintes lors des entretiens.',
    },
  },
}

// ============================================================
// PROFILS DES MÉTIERS
// Exigences par dimension composite (1-5, 5 = très important)
// ============================================================

const METIER_PROFILS: Record<string, {
  nom: string
  emoji: string
  profil: Record<string, number>
}> = {
  'conducteur-de-train': {
    nom: 'Conducteur de Train',
    emoji: '🚆',
    profil: {
      vigilance: 5,
      securite_procedures: 5,
      communication: 1,
      gestion_stress: 5,
      concentration: 5,
      responsabilite: 5,
      horaires_decales: 5,
      aptitude_technique: 3,
      mobilite: 3,
    },
  },
  'agent-circulation': {
    nom: 'Agent de Circulation',
    emoji: '🔀',
    profil: {
      vigilance: 5,
      securite_procedures: 5,
      communication: 3,
      gestion_stress: 5,
      concentration: 4,
      responsabilite: 5,
      horaires_decales: 5,
      aptitude_technique: 4,
      mobilite: 2,
    },
  },
  'controleur-asct': {
    nom: 'Contrôleur / ASCT',
    emoji: '🎫',
    profil: {
      vigilance: 3,
      securite_procedures: 3,
      communication: 5,
      gestion_stress: 4,
      concentration: 2,
      responsabilite: 3,
      horaires_decales: 4,
      aptitude_technique: 2,
      mobilite: 3,
    },
  },
  'agent-vente': {
    nom: 'Agent de Vente',
    emoji: '🎟️',
    profil: {
      vigilance: 2,
      securite_procedures: 2,
      communication: 5,
      gestion_stress: 3,
      concentration: 2,
      responsabilite: 2,
      horaires_decales: 3,
      aptitude_technique: 2,
      mobilite: 1,
    },
  },
  'agent-escale': {
    nom: "Agent d'Escale",
    emoji: '🏢',
    profil: {
      vigilance: 3,
      securite_procedures: 3,
      communication: 5,
      gestion_stress: 4,
      concentration: 2,
      responsabilite: 3,
      horaires_decales: 4,
      aptitude_technique: 2,
      mobilite: 2,
    },
  },
  'technicien-maintenance': {
    nom: 'Technicien Maintenance',
    emoji: '🔧',
    profil: {
      vigilance: 4,
      securite_procedures: 5,
      communication: 2,
      gestion_stress: 3,
      concentration: 4,
      responsabilite: 4,
      horaires_decales: 5,
      aptitude_technique: 5,
      mobilite: 2,
    },
  },
  'technicien-voie-signalisation': {
    nom: 'Technicien Voie / Signalisation',
    emoji: '🛤️',
    profil: {
      vigilance: 4,
      securite_procedures: 5,
      communication: 2,
      gestion_stress: 3,
      concentration: 4,
      responsabilite: 4,
      horaires_decales: 5,
      aptitude_technique: 5,
      mobilite: 4,
    },
  },
}

// ============================================================
// FONCTIONS DE CALCUL
// ============================================================

/**
 * Calcule le score brut d'une dimension quiz (0-100)
 * à partir des réponses brutes (valeurs 1-5, pondérées).
 */
function computeRawQuizDimension(
  quizDimension: string,
  answers: QuizAnswer[]
): { score: number; hasData: boolean } {
  const dimAnswers = answers.filter(a => a.dimension === quizDimension)
  if (dimAnswers.length === 0) return { score: 0, hasData: false }

  const rawScore = dimAnswers.reduce((acc, a) => acc + a.value * a.weight, 0)
  const maxScore = dimAnswers.reduce((acc, a) => acc + 5 * a.weight, 0)
  return {
    score: maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0,
    hasData: true,
  }
}

/**
 * Agrège les scores quiz bruts en une dimension ferroviaire composite.
 * Retourne un score 0-100 pondéré selon la configuration.
 */
function computeCompositeDimension(
  dimensionKey: string,
  rawQuizScores: Record<string, { score: number; hasData: boolean }>
): DimensionScore {
  const config = DIMENSION_AGGREGATION[dimensionKey]
  if (!config) {
    return { dimension: dimensionKey, label: dimensionKey, score: 0, niveau: 'vigilance', description: '' }
  }

  let totalWeight = 0
  let weightedSum = 0

  for (const [quizDim, weight] of Object.entries(config.sources)) {
    const raw = rawQuizScores[quizDim]
    if (raw?.hasData) {
      weightedSum += raw.score * weight
      totalWeight += weight
    }
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  const niveau: 'fort' | 'moyen' | 'vigilance' =
    score >= 72 ? 'fort' : score >= 48 ? 'moyen' : 'vigilance'

  return {
    dimension: dimensionKey,
    label: config.label,
    score,
    niveau,
    description: config.descriptions[niveau],
  }
}

/**
 * Calcule le score de compatibilité candidat ↔ métier (0-100).
 * Formule : pour chaque dimension, on mesure l'écart entre le score
 * du candidat et l'exigence du métier, pondéré par l'importance.
 * Un candidat qui dépasse l'exigence n'est pas pénalisé.
 */
function computeMetierCompatibilite(
  dimensionScores: Record<string, number>,
  metierSlug: string
): number {
  const metier = METIER_PROFILS[metierSlug]
  if (!metier) return 0

  let totalPondere = 0
  let maxPondere = 0

  for (const [dim, exigence] of Object.entries(metier.profil)) {
    const userScore = dimensionScores[dim] ?? 0
    const poids = exigence
    // Convertit le score 0-100 en 1-5 pour comparaison avec exigence métier
    const userNorm = (userScore / 100) * 5
    const compat = Math.min(userNorm / Math.max(exigence, 1), 1)
    totalPondere += compat * poids
    maxPondere += poids
  }

  return maxPondere > 0 ? Math.round((totalPondere / maxPondere) * 100) : 0
}

// ============================================================
// POIDS GLOBAUX — Score de compatibilité global
// securite_procedures = 2.0 : critère non-négociable
// ============================================================
const globalWeights: Record<string, number> = {
  vigilance: 1.5,
  securite_procedures: 2.0,
  gestion_stress: 1.3,
  concentration: 1.2,
  responsabilite: 1.2,
  communication: 1.0,
  horaires_decales: 1.0,
  aptitude_technique: 0.8,
  mobilite: 0.5,
}

// ============================================================
// POST HANDLER
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { answers, sessionId } = body as { answers: QuizAnswer[]; sessionId?: string }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Réponses manquantes' }, { status: 400 })
    }

    // 1. Scores bruts par dimension quiz
    const allQuizDimensions = [
      'horaires_decales', 'travail_nuit', 'solitude', 'repetitivite',
      'gestion_stress', 'prise_decision', 'adaptation_imprevus', 'multitache',
      'relation_client', 'gestion_conflit', 'autorite', 'aptitude_technique',
      'mobilite', 'resistance_physique',
    ]
    const rawQuizScores: Record<string, { score: number; hasData: boolean }> = {}
    for (const dim of allQuizDimensions) {
      rawQuizScores[dim] = computeRawQuizDimension(dim, answers)
    }

    // 2. Dimensions composites ferroviaires
    const dimensions: DimensionScore[] = Object.keys(DIMENSION_AGGREGATION).map(key =>
      computeCompositeDimension(key, rawQuizScores)
    )

    // 3. Score global pondéré
    const dimensionMap: Record<string, number> = {}
    for (const d of dimensions) dimensionMap[d.dimension] = d.score

    let weightedSum = 0
    let totalWeight = 0
    for (const [dim, weight] of Object.entries(globalWeights)) {
      if (dimensionMap[dim] !== undefined) {
        weightedSum += dimensionMap[dim] * weight
        totalWeight += weight
      }
    }
    const scoreGlobal = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
    const niveauGlobal: 'fort' | 'moyen' | 'vigilance' =
      scoreGlobal >= 72 ? 'fort' : scoreGlobal >= 48 ? 'moyen' : 'vigilance'

    // 4. Compatibilité par métier
    const metiersRecommandes: MetierMatch[] = Object.entries(METIER_PROFILS)
      .map(([slug, metierData]) => {
        const compatibilite = computeMetierCompatibilite(dimensionMap, slug)
        const topDim = Object.entries(metierData.profil)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([dim]) => DIMENSION_AGGREGATION[dim]?.label.split(' et ')[0] ?? dim)
          .join(', ')
        return {
          slug,
          nom: metierData.nom,
          emoji: metierData.emoji,
          compatibilite,
          raison: `Ce poste valorise particulièrement : ${topDim}.`,
        }
      })
      .sort((a, b) => b.compatibilite - a.compatibilite)

    // 5. Points forts et vigilances
    const sorted = [...dimensions].sort((a, b) => b.score - a.score)
    const pointsForts = sorted
      .filter(d => d.niveau === 'fort')
      .slice(0, 3)
      .map(d => d.label)
    const pointsVigilance = sorted
      .filter(d => d.niveau === 'vigilance')
      .slice(0, 3)
      .map(d => d.label)

    // 6. Message global
    const messageMap = {
      fort: 'Votre profil présente une belle compatibilité avec les exigences du secteur ferroviaire. Vous avez des bases solides pour vous y épanouir.',
      moyen: 'Votre profil montre un potentiel réel. Certains axes demandent attention, mais c\'est un parcours accessible avec de la préparation.',
      vigilance: 'Votre profil présente des points de vigilance importants à travailler avant de postuler. Cela ne signifie pas que c\'est impossible, mais une préparation sérieuse est indispensable.',
    }

    const result: CompatibiliteResult = {
      scoreGlobal,
      niveauGlobal,
      dimensions: sorted,
      pointsForts,
      pointsVigilance,
      metiersRecommandes,
      messageGlobal: messageMap[niveauGlobal],
      disclaimer: 'Ce test est un outil de préparation indépendant, non affilié à la SNCF ni à aucun opérateur ferroviaire. Il est basé sur des informations publiques et ne constitue pas une évaluation officielle.',
    }

    // 7. Sauvegarde en base
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user && sessionId) {
      const { error: upsertError } = await supabase
        .from('user_quiz_sessions')
        .upsert({
          id: sessionId,
          user_id: user.id,
          status: 'completed',
          score: scoreGlobal,
          results: result,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      if (upsertError) console.error('[score] upsert error:', JSON.stringify(upsertError))

      // Sauvegarde du métier recommandé dans le profil
      await supabase
        .from('profiles')
        .update({
          metier_vise: metiersRecommandes[0]?.slug ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/compatibility/score]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
