// ============================================================
// RAILREADY — API Scoring Test de Compatibilité
// POST /api/compatibility/score
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
  rawScore: number    // score brut pondéré
  maxScore: number    // score max possible
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
// CONFIGURATION DES DIMENSIONS
// ============================================================

const DIMENSION_CONFIG: Record<string, { label: string; descriptions: Record<string, string> }> = {
  horaires_decales: {
    label: 'Tolérance aux horaires décalés',
    descriptions: {
      fort: 'Vous semblez à l\'aise avec les contraintes horaires du secteur ferroviaire. Travailler la nuit, le week-end et les jours fériés ne vous semble pas être un obstacle majeur.',
      moyen: 'Vous avez une certaine tolérance aux horaires décalés, mais il sera important de bien mesurer l\'impact réel sur votre vie personnelle avant de vous engager.',
      vigilance: 'Les horaires décalés représentent un point d\'attention important. Dans les métiers ferroviaires, c\'est une réalité quasi-universelle. Réfléchissez à l\'impact concret sur votre quotidien.',
    },
  },
  gestion_stress: {
    label: 'Gestion du stress et des situations d\'urgence',
    descriptions: {
      fort: 'Vous semblez avoir une bonne maîtrise de vos réactions face au stress et aux imprévus. Cette qualité est précieuse dans tous les métiers ferroviaires.',
      moyen: 'Votre gestion du stress semble correcte mais peut être travaillée. Les métiers ferroviaires exposent régulièrement à des situations de pression.',
      vigilance: 'La gestion du stress est un point sur lequel vous devrez travailler. Les métiers ferroviaires, notamment la conduite et la circulation, exigent une réactivité et un sang-froid constants.',
    },
  },
  autonomie: {
    label: 'Autonomie et prise de décision',
    descriptions: {
      fort: 'Vous êtes à l\'aise pour travailler de manière autonome et prendre des décisions sans supervision. C\'est essentiel notamment pour les conducteurs et les techniciens.',
      moyen: 'Vous avez un niveau d\'autonomie satisfaisant. Certains postes (conduite, maintenance de nuit) demanderont un renforcement de cette capacité.',
      vigilance: 'Votre niveau d\'autonomie mérite d\'être développé. De nombreux postes ferroviaires nécessitent de travailler seul et de prendre des décisions importantes sans soutien immédiat.',
    },
  },
  relation_client: {
    label: 'Aisance relationnelle et service client',
    descriptions: {
      fort: 'Vous êtes à l\'aise avec le contact humain et la gestion des situations relationnelles, y compris les conflits. Les métiers commerciaux et d\'escale vous correspondent bien.',
      moyen: 'Votre aisance relationnelle est correcte. Elle peut être développée, notamment pour les postes exposés à la clientèle.',
      vigilance: 'Le contact avec le public peut être un défi. Cela ne disqualifie pas les métiers non exposés à la clientèle (conduite, maintenance, infrastructure).',
    },
  },
  rigueur: {
    label: 'Rigueur et respect des procédures',
    descriptions: {
      fort: 'Votre rigueur et votre respect des procédures sont des atouts majeurs dans le ferroviaire, où les règles existent pour des raisons de sécurité.',
      moyen: 'Vous avez un niveau de rigueur correct. Le ferroviaire demande cependant une application très stricte des procédures — c\'est un axe à renforcer.',
      vigilance: 'La rigueur procédurale est une exigence non négociable dans le ferroviaire. C\'est un point sur lequel vous devrez apporter des preuves concrètes en entretien.',
    },
  },
  mobilite: {
    label: 'Mobilité géographique',
    descriptions: {
      fort: 'Vous êtes prêt(e) à bouger si le poste l\'exige. C\'est un atout dans un secteur où les affectations géographiques ne sont pas toujours négociables.',
      moyen: 'Votre mobilité est partielle. Certains postes en grandes villes offrent plus de stabilité géographique.',
      vigilance: 'La mobilité géographique peut être requise, notamment en début de carrière. Anticipez cela dans votre projet professionnel.',
    },
  },
  aptitude_technique: {
    label: 'Appétence et aptitude technique',
    descriptions: {
      fort: 'Vous avez une bonne aisance avec les systèmes techniques. Cela vous ouvre les portes de la maintenance, de la voie/signalisation et, en partie, de la conduite.',
      moyen: 'Vous avez des bases techniques suffisantes pour de nombreux postes. La formation interne développera le reste.',
      vigilance: 'L\'appétence technique est faible. Ce n\'est pas rédhibitoire pour les métiers commerciaux, mais ce sera un point à travailler pour les métiers techniques.',
    },
  },
  engagement_securite: {
    label: 'Engagement pour la sécurité',
    descriptions: {
      fort: 'La sécurité est clairement une valeur centrale pour vous. C\'est la qualité la plus importante dans tous les métiers ferroviaires, sans exception.',
      moyen: 'Votre engagement pour la sécurité est correct. C\'est un axe à approfondir — dans le ferroviaire, la sécurité n\'est jamais négociable.',
      vigilance: 'L\'engagement pour la sécurité doit être renforcé. C\'est la dimension la plus critique dans le secteur ferroviaire. Sans conviction profonde sur ce point, les entretiens seront difficiles.',
    },
  },
}

// ============================================================
// PROFILS DES MÉTIERS (exigences par dimension, 1-5)
// ============================================================

const METIER_PROFILS: Record<string, {
  nom: string
  emoji: string
  profil: Record<string, number>
  poidsTotal: number
}> = {
  'conducteur-de-train': {
    nom: 'Conducteur de Train',
    emoji: '🚆',
    profil: {
      horaires_decales: 5,
      gestion_stress: 5,
      autonomie: 5,
      relation_client: 1,
      rigueur: 5,
      mobilite: 3,
      aptitude_technique: 3,
      engagement_securite: 5,
    },
    poidsTotal: 32,
  },
  'agent-circulation': {
    nom: 'Agent Circulation',
    emoji: '🔀',
    profil: {
      horaires_decales: 5,
      gestion_stress: 5,
      autonomie: 3,
      relation_client: 1,
      rigueur: 5,
      mobilite: 2,
      aptitude_technique: 4,
      engagement_securite: 5,
    },
    poidsTotal: 30,
  },
  'controleur-asct': {
    nom: 'Contrôleur / ASCT',
    emoji: '🎫',
    profil: {
      horaires_decales: 4,
      gestion_stress: 4,
      autonomie: 3,
      relation_client: 5,
      rigueur: 3,
      mobilite: 3,
      aptitude_technique: 2,
      engagement_securite: 3,
    },
    poidsTotal: 27,
  },
  'agent-vente': {
    nom: 'Agent de Vente',
    emoji: '🎟️',
    profil: {
      horaires_decales: 3,
      gestion_stress: 3,
      autonomie: 2,
      relation_client: 5,
      rigueur: 3,
      mobilite: 1,
      aptitude_technique: 2,
      engagement_securite: 1,
    },
    poidsTotal: 20,
  },
  'agent-escale': {
    nom: 'Agent d\'Escale',
    emoji: '🏢',
    profil: {
      horaires_decales: 4,
      gestion_stress: 3,
      autonomie: 3,
      relation_client: 5,
      rigueur: 3,
      mobilite: 2,
      aptitude_technique: 2,
      engagement_securite: 2,
    },
    poidsTotal: 24,
  },
  'technicien-maintenance': {
    nom: 'Technicien Maintenance',
    emoji: '🔧',
    profil: {
      horaires_decales: 5,
      gestion_stress: 3,
      autonomie: 4,
      relation_client: 1,
      rigueur: 5,
      mobilite: 2,
      aptitude_technique: 5,
      engagement_securite: 5,
    },
    poidsTotal: 30,
  },
  'technicien-voie-signalisation': {
    nom: 'Technicien Voie / Signalisation',
    emoji: '🛤️',
    profil: {
      horaires_decales: 5,
      gestion_stress: 3,
      autonomie: 3,
      relation_client: 1,
      rigueur: 5,
      mobilite: 4,
      aptitude_technique: 5,
      engagement_securite: 5,
    },
    poidsTotal: 31,
  },
}

// ============================================================
// ALGORITHME DE SCORING
// ============================================================

function computeDimensionScore(
  dimension: string,
  answers: QuizAnswer[]
): DimensionScore {
  const dimAnswers = answers.filter(a => a.dimension === dimension)
  if (dimAnswers.length === 0) {
    return {
      dimension,
      label: DIMENSION_CONFIG[dimension]?.label || dimension,
      score: 0,
      rawScore: 0,
      maxScore: 0,
      niveau: 'vigilance',
      description: '',
    }
  }

  // Score pondéré : somme(value * weight) / somme(max_value * weight)
  const rawScore = dimAnswers.reduce((acc, a) => acc + a.value * a.weight, 0)
  const maxScore = dimAnswers.reduce((acc, a) => acc + 5 * a.weight, 0)
  const score = Math.round((rawScore / maxScore) * 100)

  const niveau: 'fort' | 'moyen' | 'vigilance' =
    score >= 70 ? 'fort' : score >= 45 ? 'moyen' : 'vigilance'

  const config = DIMENSION_CONFIG[dimension]
  const description = config?.descriptions[niveau] || ''

  return {
    dimension,
    label: config?.label || dimension,
    score,
    rawScore,
    maxScore,
    niveau,
    description,
  }
}

function computeMetierCompatibilite(
  userScores: Record<string, number>,
  metierSlug: string
): number {
  const metier = METIER_PROFILS[metierSlug]
  if (!metier) return 0

  let totalPondere = 0
  let maxPondere = 0

  for (const [dim, exigence] of Object.entries(metier.profil)) {
    const userScore = userScores[dim] || 0
    // L'exigence pondère l'importance de la dimension pour ce métier
    const poids = exigence
    // Score utilisateur normalisé sur 100 → converti en 1-5 pour comparaison
    const userNorm = (userScore / 100) * 5

    // Compatibilité = min(userNorm, exigence) / exigence — plafonné à 1
    const compat = Math.min(userNorm / exigence, 1)

    totalPondere += compat * poids
    maxPondere += poids
  }

  return Math.round((totalPondere / maxPondere) * 100)
}

function generateRaison(slug: string, score: number, userScores: Record<string, number>): string {
  const metier = METIER_PROFILS[slug]
  if (!metier) return ''

  // Identifier la dimension la plus forte et la plus faible du candidat pour ce métier
  const dims = Object.entries(metier.profil)
    .sort(([, a], [, b]) => b - a) // trier par importance pour ce métier
    .slice(0, 3)

  const forces = dims
    .filter(([dim]) => (userScores[dim] || 0) >= 65)
    .map(([dim]) => DIMENSION_CONFIG[dim]?.label)
    .filter(Boolean)
    .slice(0, 2)

  if (forces.length > 0) {
    return `Vos points forts en ${forces.join(' et ')} correspondent aux exigences de ce poste.`
  }

  if (score >= 60) {
    return 'Votre profil présente une compatibilité intéressante avec ce métier.'
  }

  return 'Ce métier demande des qualités sur lesquelles vous aurez des points à renforcer.'
}

// ============================================================
// HANDLER
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { answers, sessionId } = body as {
      answers: QuizAnswer[]
      sessionId: string
    }

    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'Aucune réponse fournie' }, { status: 400 })
    }

    // 1. Calculer les scores par dimension
    const dimensions = Object.keys(DIMENSION_CONFIG)
    const dimensionScores = dimensions.map(dim => computeDimensionScore(dim, answers))

    // 2. Score global (moyenne pondérée — engagement_securite a le plus de poids)
    const totalRaw = dimensionScores.reduce((acc, d) => acc + d.rawScore, 0)
    const totalMax = dimensionScores.reduce((acc, d) => acc + d.maxScore, 0)
    const scoreGlobal = totalMax > 0 ? Math.round((totalRaw / totalMax) * 100) : 0

    const niveauGlobal: 'fort' | 'moyen' | 'vigilance' =
      scoreGlobal >= 70 ? 'fort' : scoreGlobal >= 45 ? 'moyen' : 'vigilance'

    // 3. Points forts et points de vigilance
    const scoresByDim = Object.fromEntries(dimensionScores.map(d => [d.dimension, d.score]))
    const sorted = [...dimensionScores].sort((a, b) => b.score - a.score)
    const pointsForts = sorted
      .filter(d => d.niveau === 'fort')
      .slice(0, 3)
      .map(d => d.label)
    const pointsVigilance = sorted
      .filter(d => d.niveau === 'vigilance')
      .slice(0, 3)
      .map(d => d.label)

    // 4. Compatibilité métiers (top 3)
    const metiersCompatibilite = Object.keys(METIER_PROFILS)
      .map(slug => ({
        slug,
        nom: METIER_PROFILS[slug].nom,
        emoji: METIER_PROFILS[slug].emoji,
        compatibilite: computeMetierCompatibilite(scoresByDim, slug),
        raison: '',
      }))
      .sort((a, b) => b.compatibilite - a.compatibilite)
      .slice(0, 3)
      .map(m => ({
        ...m,
        raison: generateRaison(m.slug, m.compatibilite, scoresByDim),
      }))

    // 5. Message global
    const messageGlobal = {
      fort: 'Votre profil présente de solides atouts pour le secteur ferroviaire. Les dimensions clés de ce métier semblent correspondre à votre façon d\'être et de travailler.',
      moyen: 'Votre profil présente des bases intéressantes pour envisager une carrière dans le ferroviaire. Certains points méritent d\'être approfondis et préparés avant votre candidature.',
      vigilance: 'Ce test met en lumière des points sur lesquels vous aurez du travail à faire avant de vous lancer. Ce n\'est pas une contre-indication — c\'est une invitation à réfléchir honnêtement à ce qui vous convient vraiment.',
    }[niveauGlobal]

    const result: CompatibiliteResult = {
      scoreGlobal,
      niveauGlobal,
      dimensions: dimensionScores,
      pointsForts,
      pointsVigilance,
      metiersRecommandes: metiersCompatibilite,
      messageGlobal,
      disclaimer: 'Ce test est un outil de réflexion et d\'orientation, pas un test de recrutement officiel. Seuls les processus de sélection des opérateurs ferroviaires (tests psychotechniques, médicaux, entretiens) permettent d\'évaluer l\'aptitude réelle à un poste.',
    }

    // 6. Sauvegarder en base
    try {
      await supabase
        .from('user_quiz_sessions')
        .update({
          status: 'completed',
          score: scoreGlobal,
          results: result,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
    } catch (dbError) {
      console.error('[Score] Erreur sauvegarde DB:', dbError)
      // Non bloquant — on retourne quand même le résultat
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Compatibility Score]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
