// ============================================================
// RAILREADY — Données complètes des métiers ferroviaires
// Source : informations publiques reformulées + expertise terrain
// ⚠️ ZONES MARQUÉES [À VALIDER] = vérification fondateur requise
// ============================================================

export interface FicheMetier {
  slug: string
  nom: string
  categorie: 'conduite' | 'circulation' | 'commercial' | 'maintenance' | 'infrastructure'
  emoji: string
  accroche: string
  description: string
  missions: string[]
  journee_type: JourneeType
  horaires: HorairesInfo
  avantages: string[]
  contraintes: string[]
  difficultes: string[]
  qualites_recherchees: QualiteRequise[]
  erreurs_frequentes: string[]
  idees_recues: IdeReçue[]
  conseils_terrain: string[]
  salaire: SalaireInfo
  formation: FormationInfo
  metiers_proches: string[]
  // Score de compatibilité par dimension (0-5 = peu requis → indispensable)
  profil_ideal: ProfilDimension
}

interface JourneeType {
  intro: string
  etapes: { heure: string; description: string }[]
  note: string
}

interface HorairesInfo {
  type: string
  details: string
  roulement: string
  astreintes: boolean
  note_validation?: string
}

interface QualiteRequise {
  qualite: string
  pourquoi: string
}

interface IdeReçue {
  idee: string
  realite: string
}


interface SalaireInfo {
  brut_debutant: string
  brut_experimente: string
  primes: string[]
  avantages_nature: string[]
  note_validation: string
}

interface FormationInfo {
  niveau_requis: string
  duree: string
  lieu: string
  contenu_general: string[]
  note: string
}

interface ProfilDimension {
  horaires_decales: number    // 1-5
  gestion_stress: number
  autonomie: number
  relation_client: number
  rigueur: number
  mobilite: number
  aptitude_technique: number
  engagement_securite: number
}

// ============================================================
// 1. CONDUCTEUR DE TRAIN
// ============================================================

const conducteurDeTrain: FicheMetier = {
  slug: 'conducteur-de-train',
  nom: 'Conducteur de Train',
  categorie: 'conduite',
  emoji: '🚆',
  accroche: 'Le maître à bord de la cabine. Seul responsable de son train, garant de la sécurité de tous.',

  description: `Le conducteur de train conduit des engins de traction (TGV, TER, Intercités, trains de fret) sur des lignes définies. Il est seul en cabine pendant l'essentiel de son service, responsable de la ponctualité et surtout de la sécurité des voyageurs et des marchandises qu'il transporte. C'est un métier d'une exigence rare : chaque trajet engage sa vigilance totale, sa maîtrise du stress et sa capacité à gérer l'imprévu seul.`,

  missions: [
    'Prendre en charge et vérifier l\'engin de traction avant le départ',
    'Conduire le train en respectant les signaux et la vitesse réglementaire',
    'Adapter sa conduite aux conditions (météo, incident voie, freinage)',
    'Gérer les incidents techniques en autonomie depuis la cabine',
    'Communiquer avec les agents circulation et le poste de commandement',
    'Rédiger les comptes rendus de fin de service',
    'Respecter les temps de repos réglementaires entre les prises de service',
  ],

  journee_type: {
    intro: 'Il n\'existe pas de journée "type" en conduite — c\'est précisément ce qui définit le métier. Voici un exemple de prise de service en roulement TER.',
    etapes: [
      { heure: '04h45', description: 'Prise de service au technicentre. Consultation de la feuille de route, vérification des documents de bord.' },
      { heure: '05h00', description: 'Visite de l\'engin : tour extérieur, vérification des niveaux, test des équipements de sécurité.' },
      { heure: '05h30', description: 'Mise en voie. Contact radio avec le régulateur. Départ à l\'heure.' },
      { heure: '05h30 → 09h15', description: 'Conduite sur 3 allers-retours de navette régionale. Gestion d\'un signal d\'alerte franchissement à vitesse réduite.' },
      { heure: '09h30', description: 'Pause réglementaire dans une gare intermédiaire. Repas froid apporté de chez soi.' },
      { heure: '10h00', description: 'Reprise pour un dernier aller. Voyageur malaise à bord → coordination avec le chef de bord et arrêt en gare.' },
      { heure: '12h15', description: 'Remise de l\'engin au technicentre. Compte rendu d\'incident. Fin de service.' },
    ],
    note: '⚠️ [À VALIDER] Les horaires et séquences varient fortement selon le type de traction (TGV, TER, fret), la taille du dépôt et le roulement attribué.',
  },

  horaires: {
    type: 'Roulement posté',
    details: 'Nuits, week-ends et jours fériés font partie intégrante du métier. Le conducteur travaille en moyenne 5 jours sur 7 mais jamais aux mêmes heures. Les repos compensatoires sont prévus par convention collective.',
    roulement: 'Alternance de prises de service le matin, l\'après-midi et la nuit. Les roulements sont généralement établis plusieurs semaines à l\'avance.',
    astreintes: false,
    note_validation: '⚠️ [À VALIDER] La fréquence des nuits et les conditions de repos varient selon les accords locaux et le type de service (voyageurs vs fret).',
  },

  avantages: [
    'Emploi stable, CDI quasi systématique après formation',
    'Autonomie totale en cabine — on est son propre patron pendant le service',
    'Avantages sociaux significatifs (transport gratuit pour soi et sa famille)',
    'Prime de roulement qui valorise les contraintes horaires',
    'Fierté et reconnaissance sociale du métier',
    'Retraite anticipée par rapport au régime général',
    'Formation entièrement financée par l\'employeur',
    'Faible pression hiérarchique pendant le service',
  ],

  contraintes: [
    'Isolement total en cabine — on passe ses journées seul',
    'Horaires décalés qui impactent la vie familiale et sociale',
    'Vigilance permanente requise : impossible de décrocher mentalement',
    'Risque psychologique lié aux accidents (personnes sur la voie)',
    'Remise en question médicale périodique — une inaptitude peut stopper la carrière',
    'Mobilité géographique parfois imposée selon les affectations',
    'Dépendance aux grèves et mouvements sociaux pour le service',
  ],

  difficultes: [
    'La solitude de la cabine est difficile pour les personnes qui ont besoin de lien social au travail',
    'La gestion psychologique d\'un accident de personne est une réalité sous-estimée par les candidats',
    'La désynchronisation du rythme circadien liée aux nuits et aux levers ultra-matinaux est physiologiquement éprouvante',
    'L\'incertitude des repos compensatoires rend la planification personnelle complexe',
    'La vigilance sans relâche pendant plusieurs heures est une forme de charge mentale invisible',
  ],

  qualites_recherchees: [
    { qualite: 'Sang-froid', pourquoi: 'Toute décision en cabine engage la sécurité. L\'urgence ne tolère pas la panique.' },
    { qualite: 'Rigueur absolue', pourquoi: 'Les procédures existent pour une raison. Les contourner n\'est pas une option.' },
    { qualite: 'Résistance à la solitude', pourquoi: 'On passe des heures seul. C\'est une qualité, pas un défaut — mais elle doit être réelle.' },
    { qualite: 'Sens des responsabilités', pourquoi: 'Des centaines de vies dépendent de chaque décision de conduite.' },
    { qualite: 'Capacité d\'anticipation', pourquoi: 'Lire la voie en avance, anticiper les freinages, prévoir l\'imprévu.' },
    { qualite: 'Adaptabilité aux horaires décalés', pourquoi: 'Sans organisation personnelle solide, le roulement épuise rapidement.' },
  ],

  erreurs_frequentes: [
    'Idéaliser le métier sans avoir mesuré la réalité des nuits et du travail solitaire',
    'Ne pas avoir réfléchi à l\'impact des horaires sur son couple ou ses enfants',
    'Sous-estimer les exigences psychotechniques — les tests éliminent une part significative des candidats',
    'Mentionner une passion pour les trains comme principale motivation (insuffisant sans projet professionnel structuré)',
    'Ignorer la dimension médicale — certaines pathologies sont rédhibitoires',
    'Confondre "aimer les trains" et "être fait pour conduire des trains"',
  ],

  idees_recues: [
    {
      idee: '"C\'est un métier sympa, on voyage toute la journée"',
      realite: 'On fait souvent les mêmes lignes, seul dans une cabine. Ce n\'est pas du tourisme.',
    },
    {
      idee: '"C\'est facile, le train se conduit tout seul"',
      realite: 'Les systèmes d\'aide à la conduite existent mais la vigilance du conducteur reste centrale. La gestion des anomalies est entièrement humaine.',
    },
    {
      idee: '"On gagne bien sa vie dès le départ"',
      realite: 'Le salaire de base en début de carrière est modeste. Les primes de roulement améliorent significativement la rémunération, mais elles compensent des contraintes réelles.',
    },
    {
      idee: '"On est libre, pas de chef sur le dos"',
      realite: 'L\'autonomie en cabine est réelle, mais le cadre réglementaire est extrêmement strict. Toute déviation est tracée et peut être sanctionnée.',
    },
  ],

  conseils_terrain: [
    'Parlez à des conducteurs en poste avant de postuler — pas à des forums, à des vraies personnes.',
    'Anticipez l\'impact sur votre vie de famille : discutez-en avec votre entourage avant de vous lancer.',
    'Préparez sérieusement les tests psychotechniques — ils ne s\'improvisent pas.',
    'Lors de l\'entretien, montrez que vous avez compris la réalité du roulement, pas juste l\'attrait du métier.',
    'La santé est un capital : une bonne condition physique et psychologique est un atout durable.',
    '⚠️ [À VALIDER] Les conditions d\'accès et les tests spécifiques peuvent varier selon l\'opérateur (SNCF, Keolis, Transdev).',
  ],


  salaire: {
    brut_debutant: '1 900 € - 2 200 € brut/mois (hors primes)',
    brut_experimente: '2 800 € - 3 500 € brut/mois (avec primes de roulement)',
    primes: ['Prime de roulement', 'Prime de nuit', 'Indemnités de repas hors résidence', 'Prime de traction (selon type d\'engin)'],
    avantages_nature: ['Billet de train gratuit (titulaire + famille)', 'Aide au logement', 'Mutuelle avantageuse', 'Régime de retraite spécifique'],
    note_validation: '⚠️ [À VALIDER] Les montants indiqués sont des estimations basées sur des sources publiques (juin 2026). Les grilles exactes varient selon l\'opérateur, le type de traction et l\'ancienneté.',
  },

  formation: {
    niveau_requis: 'Bac (toutes filières) ou équivalent. Certains recrutements CAP/BEP selon l\'opérateur.',
    duree: '6 à 12 mois selon l\'opérateur et le type de traction',
    lieu: 'Centres de formation internes (SNCF Académie ou centres équivalents chez d\'autres opérateurs)',
    contenu_general: [
      'Réglementation ferroviaire générale',
      'Connaissance des engins de traction',
      'Signalisation et règles de circulation',
      'Conduite accompagnée puis autonome',
      'Gestion des situations anormales (cadre général)',
    ],
    note: '⚠️ [À VALIDER] La structure et la durée exacte de la formation varient selon l\'opérateur. RailReady ne reproduit pas le contenu des formations officielles.',
  },

  metiers_proches: ['agent-circulation', 'technicien-maintenance', 'controleur-asct'],

  profil_ideal: {
    horaires_decales: 5,
    gestion_stress: 5,
    autonomie: 5,
    relation_client: 1,
    rigueur: 5,
    mobilite: 3,
    aptitude_technique: 3,
    engagement_securite: 5,
  },
}

// ============================================================
// 2. AGENT CIRCULATION
// ============================================================

const agentCirculation: FicheMetier = {
  slug: 'agent-circulation',
  nom: 'Agent Circulation',
  categorie: 'circulation',
  emoji: '🔀',
  accroche: 'Le chef d\'orchestre invisible. Il n\'est pas dans le train, mais c\'est lui qui décide où il va.',

  description: `L'agent circulation (aussi appelé régulateur selon les contextes) gère les circulations ferroviaires depuis un poste d'aiguillage ou un Poste de Commandement Centralisé (PCC). Il est l'interface entre les conducteurs, les équipes terrain et la direction du trafic. Son rôle est de garantir la fluidité et la sécurité du réseau en temps réel, de gérer les perturbations, et de prendre des décisions rapides qui peuvent impacter des centaines de voyageurs.`,

  missions: [
    'Gérer les aiguillages et autoriser les mouvements de trains depuis le poste',
    'Suivre en temps réel la position des trains sur le réseau',
    'Coordonner les circulations pour éviter les conflits sur voie',
    'Gérer les incidents et perturbations (pannes, retards, obstacles)',
    'Communiquer avec les conducteurs, chefs de gare et équipes de maintenance',
    'Tenir les registres de circulation et documenter les incidents',
    'Alerter la hiérarchie en cas de situation dégradée',
  ],

  journee_type: {
    intro: 'Une journée type en poste d\'aiguillage — poste de taille intermédiaire sur une ligne régionale.',
    etapes: [
      { heure: '06h00', description: 'Prise de poste. Passation avec l\'équipe de nuit : situation du trafic, incidents en cours, travaux prévus.' },
      { heure: '06h15', description: 'Début de la période de pointe matinale. Gestion intensive des circulations : trains de navette, trains longue distance, mouvements de matériel.' },
      { heure: '08h30', description: 'Incident : une aiguille défaillante bloque un itinéraire. Coordination avec la maintenance, communication aux conducteurs impactés, gestion des retards en cascade.' },
      { heure: '09h45', description: 'Résolution de l\'incident. Reprise normale. Rédaction du compte rendu d\'anomalie.' },
      { heure: '11h00', description: 'Trafic plus calme. Supervision des travaux de voie sur un canton adjacent. Gestion des circulations en voie unique.' },
      { heure: '13h00', description: 'Relève de poste. Passation complète à l\'équipe suivante. Fin de service.' },
    ],
    note: '⚠️ [À VALIDER] La structure des postes (aiguillage local vs PCC centralisé) varie fortement. Les postes PCC ont un fonctionnement très différent des postes traditionnels.',
  },

  horaires: {
    type: 'Travail posté 3x8',
    details: 'Le réseau ferroviaire fonctionne 24h/24. L\'agent circulation travaille en rotation matin/après-midi/nuit, y compris les week-ends et jours fériés. Le rythme est exigeant mais prévisible une fois le roulement établi.',
    roulement: 'Roulement sur cycle (exemple : 2 matins, 2 après-midi, 2 nuits, puis repos). Les détails varient selon le poste et les accords locaux.',
    astreintes: false,
    note_validation: '⚠️ [À VALIDER] Les modalités exactes de roulement varient selon le poste et l\'opérateur.',
  },

  avantages: [
    'Poste stratégique au cœur du réseau — on a une vision globale',
    'Travail en équipe avec une vraie cohésion de groupe',
    'Chaque journée est différente — pas de routine',
    'Formation solide et complète financée par l\'employeur',
    'Rémunération valorisée par les primes de poste',
    'Sentiment fort d\'utilité et de responsabilité',
  ],

  contraintes: [
    'Stress intense lors des perturbations — les décisions ont des conséquences immédiates',
    'Concentration permanente requise : une erreur d\'inattention peut être grave',
    'Travail posté avec toutes ses conséquences sur le rythme de vie',
    'Environnement parfois bruyant et visuellement surchargé (écrans, tableaux)',
    'Responsabilité sécuritaire élevée et permanente',
    'Charge mentale forte en heures de pointe',
  ],

  difficultes: [
    'Gérer plusieurs situations critiques simultanément sans perdre sa lucidité',
    'Accepter de travailler pendant que les autres dorment ou fêtent',
    'La pression des décisions rapides qui engagent la sécurité',
    'La charge mentale invisible qui s\'accumule sur les postes de nuit',
    'La frustration quand une perturbation impacte des milliers de voyageurs malgré tous les efforts',
  ],

  qualites_recherchees: [
    { qualite: 'Gestion du stress', pourquoi: 'Les incidents arrivent sans prévenir. Il faut décider vite et bien.' },
    { qualite: 'Rigueur procédurale', pourquoi: 'Les procédures sont non négociables en environnement de sécurité.' },
    { qualite: 'Communication claire', pourquoi: 'Les échanges radio doivent être précis et sans ambiguïté.' },
    { qualite: 'Vision spatiale', pourquoi: 'Comprendre la topologie du réseau et anticiper les conflits de circulation.' },
    { qualite: 'Réactivité', pourquoi: 'Les décisions se prennent en secondes, pas en minutes.' },
    { qualite: 'Esprit d\'équipe', pourquoi: 'Le travail en relais nécessite une vraie coordination et confiance mutuelle.' },
  ],

  erreurs_frequentes: [
    'Confondre le métier avec celui de conducteur — l\'agent circulation ne conduit pas',
    'Sous-estimer la charge cognitive du poste (gérer simultanément plusieurs circulations)',
    'Ne pas avoir réfléchi à sa tolérance au travail de nuit sur le long terme',
    'Arriver en entretien sans savoir ce qu\'est concrètement un PCC ou un poste d\'aiguillage',
    'Mettre en avant uniquement "j\'aime les trains" sans parler de gestion du stress et de rigueur',
  ],

  idees_recues: [
    {
      idee: '"C\'est moins bien que conducteur, c\'est juste un travail de bureau"',
      realite: 'C\'est l\'un des postes les plus stratégiques du ferroviaire. La responsabilité est au moins aussi importante que celle du conducteur.',
    },
    {
      idee: '"Les trains circulent tout seuls grâce aux systèmes informatiques"',
      realite: 'L\'informatique aide, mais l\'humain reste décisionnaire, surtout en situation dégradée.',
    },
    {
      idee: '"C\'est un travail tranquille, assis derrière des écrans"',
      realite: 'En heure de pointe ou en gestion de crise, la pression est intense. Le calme apparent cache une vigilance de tous les instants.',
    },
  ],

  conseils_terrain: [
    'Renseignez-vous sur la différence entre poste d\'aiguillage local et PCC — ce sont deux univers différents.',
    'Montrez en entretien que vous comprenez la notion de sécurité comme valeur non négociable.',
    'La capacité à communiquer de manière claire et concise est testée — entraînez-vous.',
    'Le travail en équipe est fondamental — valorisez vos expériences de coordination.',
    '⚠️ [À VALIDER] Les conditions d\'accès au poste (concours, tests, niveau requis) peuvent évoluer selon les opérateurs.',
  ],


  salaire: {
    brut_debutant: '1 900 € - 2 200 € brut/mois (hors primes)',
    brut_experimente: '2 600 € - 3 200 € brut/mois (avec primes de poste)',
    primes: ['Prime de poste (nuit, dimanche, férié)', 'Prime de sujétion', 'Indemnités de repas'],
    avantages_nature: ['Transport gratuit', 'Mutuelle', 'Aide logement'],
    note_validation: '⚠️ [À VALIDER] Montants indicatifs basés sur sources publiques (juin 2026). À vérifier selon l\'opérateur et l\'ancienneté.',
  },

  formation: {
    niveau_requis: 'Bac ou équivalent. Certains opérateurs recrutent à Bac+2.',
    duree: '6 à 9 mois de formation interne',
    lieu: 'Centres de formation spécialisés, puis stage en poste accompagné',
    contenu_general: [
      'Réglementation des circulations ferroviaires (principes généraux)',
      'Signalisation et cantonnement (notions de base publiques)',
      'Outils de régulation et de supervision',
      'Gestion des situations perturbées',
      'Communication professionnelle radio',
    ],
    note: '⚠️ [À VALIDER] RailReady ne reproduit pas le contenu des formations officielles. Les éléments ci-dessus sont des notions générales publiques.',
  },

  metiers_proches: ['conducteur-de-train', 'manager-operationnel'],

  profil_ideal: {
    horaires_decales: 5,
    gestion_stress: 5,
    autonomie: 3,
    relation_client: 1,
    rigueur: 5,
    mobilite: 2,
    aptitude_technique: 4,
    engagement_securite: 5,
  },
}

// ============================================================
// 3. ASCT / CONTRÔLEUR (Agent Commercial Trains)
// ============================================================

const controleurASCT: FicheMetier = {
  slug: 'controleur-asct',
  nom: 'Contrôleur / Agent Commercial Trains (ASCT)',
  categorie: 'commercial',
  emoji: '🎫',
  accroche: 'L\'ambassadeur du voyage. Premier contact, dernier recours. Il doit tout gérer avec le sourire.',

  description: `L'Agent Commercial Trains (ASCT), anciennement appelé contrôleur, est le visage de l'entreprise à bord des trains. Il accueille les voyageurs, contrôle les titres de transport, gère les litiges et conflits, assure la sûreté à bord et vend ou régularise les billets. Il travaille souvent en autonomie à bord ou en duo selon les lignes. C'est un métier de contact intense qui demande une solide résistance au stress relationnel.`,

  missions: [
    'Accueillir et informer les voyageurs à bord',
    'Contrôler et valider les titres de transport',
    'Régulariser les situations irrégulières (vente à bord, PV)',
    'Gérer les conflits et situations difficiles avec calme',
    'Assurer la sûreté à bord et faire respecter le règlement',
    'Coordonner avec le conducteur pour les annonces et incidents',
    'Gérer les situations d\'urgence médicale ou de sécurité',
    'Préparer et transmettre les rapports de service',
  ],

  journee_type: {
    intro: 'Exemple de service en train régional (TER) — service long avec plusieurs rotations.',
    etapes: [
      { heure: '06h30', description: 'Prise de service en gare. Récupération des documents de bord, coordination avec le conducteur.' },
      { heure: '06h50', description: 'Ouverture des portes et accueil des voyageurs. Annonces de départ.' },
      { heure: '07h00 → 09h30', description: 'Contrôle systématique dans toutes les voitures. Régularisation de 4 voyageurs sans titre. Gestion d\'une altercation entre passagers.' },
      { heure: '09h45', description: 'Arrivée terminus. Court battement. Re-départ en sens inverse.' },
      { heure: '10h00 → 12h15', description: 'Voyage retour. Voyageur malaise → coordination avec conducteur, arrêt non prévu, SAMU contacté.' },
      { heure: '12h30', description: 'Pause repas en gare. 45 minutes réglementaires.' },
      { heure: '13h15', description: 'Reprise pour deux nouvelles rotations. Un voyageur agressif refusant de payer — procédure de signalement.' },
      { heure: '17h00', description: 'Fin de service. Remise de rapport, dépôt des fonds.' },
    ],
    note: '⚠️ [À VALIDER] Les services varient énormément selon le type de train (TGV, TER, Intercités), le nombre d\'agents à bord et la politique de l\'opérateur.',
  },

  horaires: {
    type: 'Roulement posté',
    details: 'Nuits, week-ends et jours fériés font partie du roulement. Les services peuvent être fractionnés sur la journée avec des coupures.',
    roulement: 'Service linéaire ou en rotation selon les tournées. Les agents peuvent avoir des débuts de service très tôt le matin ou des fins très tardives.',
    astreintes: false,
    note_validation: '⚠️ [À VALIDER] Les conditions de roulement et les coupures varient selon la convention collective applicable.',
  },

  avantages: [
    'Contact humain riche et varié — chaque journée est différente',
    'Autonomie à bord — on gère son service avec peu de supervision directe',
    'Avantages transport pour soi et sa famille',
    'Sentiment d\'utilité immédiate pour les voyageurs',
    'Postes accessibles sans diplôme bac+5 — la personnalité prime',
  ],

  contraintes: [
    'Confrontation quotidienne à la fraude et parfois à l\'agressivité',
    'Service debout pendant de longues heures — fatigue physique réelle',
    'Gestion de situations de crise sans filet (urgences médicales, conflits)',
    'Pression des objectifs de contrôle et de régularisation',
    'Horaires décalés et coupures dans la journée',
    'Responsabilité sûreté à bord en autonomie',
  ],

  difficultes: [
    'Maintenir son calme et sa bienveillance face à des voyageurs agressifs ou de mauvaise foi',
    'Supporter la répétitivité des litiges tout en restant professionnel',
    'Gérer seul une urgence médicale ou une altercation sérieuse à bord',
    'La fatigue physique de rester debout de longues heures dans un espace mobile',
    'L\'isolement relatif à bord sur les longues missions sans partenaire',
  ],

  qualites_recherchees: [
    { qualite: 'Aisance relationnelle', pourquoi: 'On parle à des dizaines de personnes par service, dans des contextes parfois tendus.' },
    { qualite: 'Sang-froid', pourquoi: 'Les situations imprévues (conflits, urgences) demandent une réaction calme et efficace.' },
    { qualite: 'Empathie', pourquoi: 'Comprendre la situation d\'un voyageur perdu, stressé ou en difficulté.' },
    { qualite: 'Fermeté bienveillante', pourquoi: 'Faire respecter les règles sans être autoritaire ni laxiste.' },
    { qualite: 'Résistance physique', pourquoi: 'Rester debout, marcher, porter des équipements pendant des heures.' },
    { qualite: 'Adaptabilité', pourquoi: 'Chaque service apporte son lot d\'imprévus — il faut improviser avec méthode.' },
  ],

  erreurs_frequentes: [
    'Penser que le rôle se limite au "punch de billet" — c\'est une vision très réductrice',
    'Sous-estimer la dureté psychologique de la confrontation quotidienne à la fraude et à l\'agressivité',
    'Ne pas avoir réfléchi à sa propre réaction face à un voyageur violent',
    'Mettre en avant uniquement l\'amour du voyage — l\'entretien attend du concret',
    'Oublier de mentionner ses expériences de gestion de conflits ou de service client',
  ],

  idees_recues: [
    {
      idee: '"C\'est un boulot pénible de puncher des billets toute la journée"',
      realite: 'Le contrôle est une partie du métier. L\'ASCT gère aussi des urgences, assure la relation client, vend des titres et fait de la médiation.',
    },
    {
      idee: '"Avec les contrôleurs automatiques, ce métier va disparaître"',
      realite: 'Les portiques et valideurs existent, mais la présence humaine à bord reste essentielle pour la sûreté, l\'assistance et la relation client complexe.',
    },
    {
      idee: '"On voyage tout le temps, c\'est génial"',
      realite: 'On refait souvent les mêmes tronçons. Et être dans un train professionnel n\'a rien d\'une excursion touristique.',
    },
  ],

  conseils_terrain: [
    'Préparez des exemples concrets de situations où vous avez géré un conflit ou une tension — les recruteurs les cherchent.',
    'Montrez que vous comprenez la notion d\'autorité calme : ni soumission, ni agressivité.',
    'Si vous avez une expérience en service client (commerce, hôtellerie, sécurité), valorisez-la.',
    'La présentation physique et la posture comptent — vous représentez l\'entreprise à bord.',
    '⚠️ [À VALIDER] Les critères de recrutement et les tests spécifiques varient selon l\'opérateur.',
  ],


  salaire: {
    brut_debutant: '1 700 € - 1 950 € brut/mois (hors primes)',
    brut_experimente: '2 200 € - 2 800 € brut/mois (avec primes)',
    primes: ['Prime de dimanche / nuit', 'Prime de sûreté', 'Indemnités de repas hors résidence'],
    avantages_nature: ['Transport gratuit', 'Mutuelle', 'Aide logement'],
    note_validation: '⚠️ [À VALIDER] Montants indicatifs (juin 2026). Les grilles varient selon l\'opérateur et la convention collective.',
  },

  formation: {
    niveau_requis: 'Bac ou équivalent. CAP/BEP avec expérience accepté selon les opérateurs.',
    duree: '3 à 6 mois de formation initiale',
    lieu: 'Centre de formation de l\'opérateur + stages pratiques à bord',
    contenu_general: [
      'Réglementation voyageurs et titres de transport',
      'Gestion de la relation client',
      'Sûreté à bord — notions générales',
      'Procédures d\'urgence génériques',
      'Communication professionnelle',
    ],
    note: '⚠️ [À VALIDER] Le contenu et la durée varient selon l\'opérateur. RailReady ne reproduit pas les programmes officiels.',
  },

  metiers_proches: ['agent-escale', 'agent-vente'],

  profil_ideal: {
    horaires_decales: 4,
    gestion_stress: 4,
    autonomie: 3,
    relation_client: 5,
    rigueur: 3,
    mobilite: 3,
    aptitude_technique: 2,
    engagement_securite: 3,
  },
}

// ============================================================
// 4. AGENT DE VENTE
// ============================================================

const agentVente: FicheMetier = {
  slug: 'agent-vente',
  nom: 'Agent de Vente Ferroviaire',
  categorie: 'commercial',
  emoji: '🎟️',
  accroche: 'Le premier contact du voyageur avec le réseau. Il vend, informe, oriente — et gère les situations difficiles en gare.',

  description: `L'agent de vente travaille en gare ou en boutique ferroviaire. Il renseigne les voyageurs sur les offres, vend les titres de transport, gère les échanges et remboursements, et oriente les clients. Il est souvent en première ligne lors des perturbations, quand les voyageurs sont stressés, en retard ou mécontents. Le métier mêle compétences commerciales, gestion de la relation client et maîtrise des outils de billetterie.`,

  missions: [
    'Vendre et émettre des titres de transport (guichet, boutique, téléphone)',
    'Informer les voyageurs sur les offres, tarifs et itinéraires',
    'Gérer les échanges, remboursements et réclamations',
    'Orienter et accompagner les voyageurs à mobilité réduite ou en difficulté',
    'Participer à la gestion des flux en gare lors des perturbations',
    'Tenir sa caisse et assurer la traçabilité des transactions',
    'Vendre des services additionnels (réservations, abonnements, cartes de fidélité)',
  ],

  journee_type: {
    intro: 'Une journée type en boutique voyageurs en gare moyenne.',
    etapes: [
      { heure: '07h30', description: 'Prise de service. Ouverture de la caisse, vérification des stocks de documents.' },
      { heure: '08h00', description: 'Ouverture du guichet. Affluence matinale — voyageurs pressés, abonnés, questions rapides.' },
      { heure: '10h00', description: 'Creux d\'activité. Traitement des réclamations en attente, formation sur un nouvel outil tarifaire.' },
      { heure: '11h30', description: 'Pic pré-déjeuner. Plusieurs voyageurs demandent des échanges suite à une annulation de train.' },
      { heure: '12h00', description: 'Pause déjeuner tournante.' },
      { heure: '13h00', description: 'Reprise. Accompagnement d\'un voyageur étranger ne parlant pas français — gestion avec patience et ressources disponibles.' },
      { heure: '15h00', description: 'Pic de l\'après-midi. Ventes pour les départs du soir.' },
      { heure: '17h00', description: 'Clôture de caisse. Remontée des anomalies de la journée. Fin de service.' },
    ],
    note: '⚠️ [À VALIDER] Les horaires, le type de poste (guichet, boutique, agence) et les missions varient selon la gare et l\'organisation locale.',
  },

  horaires: {
    type: 'Horaires décalés — amplitude gare',
    details: 'Les gares fonctionnent de très tôt le matin à tard le soir. Les agents de vente travaillent en rotation matin/après-midi/soirée. Les week-ends et certains jours fériés sont travaillés.',
    roulement: 'Rotation hebdomadaire selon planning. Peu ou pas de nuits complètes selon le type de poste.',
    astreintes: false,
    note_validation: '⚠️ [À VALIDER] Les amplitudes horaires varient beaucoup selon la taille de la gare et son activité.',
  },

  avantages: [
    'Métier de contact humain avec une diversité de profils de voyageurs',
    'Travail en équipe avec une ambiance souvent solidaire',
    'Horaires plus prévisibles que les métiers de conduite ou de circulation',
    'Avantages transport entreprise',
    'Formation aux outils de vente et à la relation client',
  ],

  contraintes: [
    'Position debout ou semi-debout prolongée',
    'Pression lors des perturbations — les voyageurs en colère se dirigent d\'abord vers le guichet',
    'Objectifs commerciaux à atteindre',
    'Gestion quotidienne de l\'insatisfaction et des réclamations',
    'Travail les week-ends et jours fériés',
  ],

  difficultes: [
    'Absorber la colère des voyageurs lors des grèves ou retards importants — sans en être responsable',
    'Maintenir une attitude commerciale positive en fin de journée chargée',
    'Gérer simultanément la file d\'attente et les demandes téléphoniques',
  ],

  qualites_recherchees: [
    { qualite: 'Sens commercial', pourquoi: 'Proposer le bon titre, valoriser les offres, fidéliser.' },
    { qualite: 'Patience', pourquoi: 'Les voyageurs ne connaissent pas les tarifs. Expliquer clairement sans s\'impatienter.' },
    { qualite: 'Résistance au stress', pourquoi: 'Les perturbations génèrent des pics d\'affluence et de tension.' },
    { qualite: 'Rigueur administrative', pourquoi: 'La caisse doit être juste. Les transactions doivent être correctement enregistrées.' },
    { qualite: 'Adaptabilité', pourquoi: 'Les outils, les offres et les situations changent en permanence.' },
  ],

  erreurs_frequentes: [
    'Penser que le poste est purement administratif — la dimension relationnelle est centrale',
    'Ne pas valoriser ses expériences de vente ou de service client en dehors du ferroviaire',
    'Oublier de mentionner sa capacité à gérer des situations de tension',
    'Sous-estimer la complexité des systèmes tarifaires ferroviaires',
  ],

  idees_recues: [
    {
      idee: '"C\'est un boulot de guichetier, pas très valorisant"',
      realite: 'L\'agent de vente est souvent le seul interlocuteur humain disponible pour des voyageurs perdus. Son rôle est bien plus large que la simple transaction.',
    },
    {
      idee: '"Avec les applis, les guichetiers vont disparaître"',
      realite: 'La vente digitale s\'est développée, mais la présence humaine reste essentielle pour les situations complexes, les voyageurs peu autonomes et les perturbations.',
    },
  ],

  conseils_terrain: [
    'Valorisez toute expérience de vente, de caisse ou de service client — même hors ferroviaire.',
    'Montrez que vous savez gérer des situations conflictuelles avec calme.',
    'Soyez à l\'aise avec les outils numériques — les systèmes de vente sont informatisés.',
    '⚠️ [À VALIDER] Les conditions de recrutement et les formations associées varient selon l\'opérateur.',
  ],


  salaire: {
    brut_debutant: '1 650 € - 1 900 € brut/mois',
    brut_experimente: '2 000 € - 2 500 € brut/mois',
    primes: ['Prime d\'objectifs commerciaux', 'Prime de week-end', 'Indemnités de repas'],
    avantages_nature: ['Transport gratuit', 'Mutuelle', 'Aide logement'],
    note_validation: '⚠️ [À VALIDER] Montants indicatifs (juin 2026). Variable selon l\'opérateur.',
  },

  formation: {
    niveau_requis: 'Bac commercial ou équivalent. BTS MUC/NDRC apprécié.',
    duree: '2 à 4 mois de formation interne',
    lieu: 'Centre de formation + tuteur en poste',
    contenu_general: [
      'Offres et produits tarifaires',
      'Outils de vente et de billetterie',
      'Relation client et gestion des réclamations',
      'Procédures de caisse',
    ],
    note: '⚠️ [À VALIDER] Les formations varient selon l\'opérateur.',
  },

  metiers_proches: ['agent-escale', 'controleur-asct'],

  profil_ideal: {
    horaires_decales: 3,
    gestion_stress: 3,
    autonomie: 2,
    relation_client: 5,
    rigueur: 3,
    mobilite: 1,
    aptitude_technique: 2,
    engagement_securite: 1,
  },
}

// ============================================================
// 5. AGENT D'ESCALE
// ============================================================

const agentEscale: FicheMetier = {
  slug: 'agent-escale',
  nom: 'Agent d\'Escale / Agent de Gare',
  categorie: 'commercial',
  emoji: '🏢',
  accroche: 'Le pivot de la gare. Il fait tourner les opérations et assure que chaque voyageur embarque au bon endroit, au bon moment.',

  description: `L'agent d'escale assure les opérations en gare : gestion des quais, information voyageurs, coordination des départs et arrivées, assistance aux personnes à mobilité réduite (PMR), gestion des situations perturbées. Il est le chef d'orchestre terrain de la gare, en liaison constante avec les conducteurs, les agents de vente, les équipes de sûreté et les agents de circulation. C'est un métier de terrain, au contact du public, physique et opérationnel.

Dans de nombreuses gares de taille intermédiaire, le poste est polycompétent : l'agent gère à la fois les opérations escale sur les quais et les missions commerciales de vente. Cette double casquette est courante et doit être anticipée.`,

  missions: [
    'Assurer les opérations de départ et d\'arrivée des trains sur les quais',
    'Accueillir, informer et orienter les voyageurs en gare',
    'Prendre en charge et accompagner les PMR (personnes à mobilité réduite) et les groupes',
    'Coordonner avec le conducteur et le chef de bord pour les départs',
    'Effectuer les visites à l\'arrivée et les visites avant départ des rames',
    'Gérer les perturbations et informer les voyageurs en temps réel via les outils de sonorisation',
    'Assurer la sûreté et la sécurité sur les quais, veille incendie et sécurité des équipements',
    'Dans les postes polycompétents : assurer également la vente des titres de transport en mobilité',
    'Surveiller et maintenir la disponibilité des automates de vente et distributeurs',
    'Participer à la gestion des situations de crise et coordonner avec les services compétents',
  ],

  journee_type: {
    intro: 'Exemple d\'une journée en gare de taille intermédiaire, service du matin.',
    etapes: [
      { heure: '05h30', description: 'Prise de service. Ouverture de la gare. Vérification des affichages et du bon fonctionnement des équipements.' },
      { heure: '06h00', description: 'Premier train. Coordination avec le conducteur, ouverture des portes, assistance PMR préalablement réservée.' },
      { heure: '06h30 → 09h00', description: 'Pic de la matinée : succession de trains, voyageurs pressés, annonces en cas de retard, gestion d\'une correspondance manquée.' },
      { heure: '09h30', description: 'Période plus calme. Traitement des situations en suspens. Formation d\'un nouveau collègue sur la procédure PMR.' },
      { heure: '11h00', description: 'Incident : train supprimé. Information des voyageurs sur les alternatives, coordination avec la salle de gestion du trafic.' },
      { heure: '13h00', description: 'Relève. Passation au collègue de l\'après-midi. Fin de service.' },
    ],
    note: '⚠️ [À VALIDER] L\'organisation varie fortement selon la taille de la gare (petite halte vs grande gare), l\'effectif disponible et les missions attribuées.',
  },

  horaires: {
    type: 'Travail posté 2x8 ou 3x8, 7 jours sur 7',
    details: 'Les gares fonctionnent du premier au dernier train. Les agents d\'escale travaillent en tableau de service, incluant les week-ends et jours fériés. Le port de la tenue commerciale complète (tenue NOMAD chez certains opérateurs) est obligatoire, avec badge nominatif.',
    roulement: 'Roulement en 2x8 ou 3x8 selon la gare. Le dimanche et les jours fériés font partie du roulement standard. ⚠️ [À VALIDER] La fréquence exacte varie selon la taille de la gare.',
    astreintes: false,
    note_validation: '⚠️ [À VALIDER] L\'amplitude horaire, le roulement exact et les conditions spécifiques varient selon la gare et l\'opérateur.',
  },

  avantages: [
    'Métier de terrain dynamique — on ne reste pas assis derrière un bureau',
    'Diversité réelle des missions au quotidien (quai, vente, PMR, sûreté)',
    'Sentiment d\'utilité fort, notamment dans l\'accompagnement des personnes vulnérables',
    'Travail en équipe avec une vraie solidarité de corps de métier',
    'Avantages transport pour soi et sa famille',
    'Polyvalence qui développe une vraie expertise multi-métiers',
  ],

  contraintes: [
    'Exposition aux intempéries sur les quais',
    'Gestion de voyageurs mécontents lors des perturbations',
    'Horaires très tôt le matin ou tard le soir',
    'Pression physique (marche, port de charges légères)',
    'Responsabilité PMR — erreur non permise',
  ],

  difficultes: [
    'Gérer simultanément plusieurs trains et plusieurs demandes de voyageurs',
    'Maintenir son calme lors des perturbations majeures (grèves, incidents réseau)',
    'La frustration de ne pas toujours avoir les informations que les voyageurs attendent',
    'La charge physique d\'une journée sur les quais par tous les temps',
  ],

  qualites_recherchees: [
    { qualite: 'Réactivité', pourquoi: 'Les départs se jouent à la minute. Il faut agir vite.' },
    { qualite: 'Sens du service', pourquoi: 'Aider un voyageur en difficulté, ça ne se fait pas à moitié.' },
    { qualite: 'Communication', pourquoi: 'Les annonces, les coordinations, les explications — tout passe par la parole.' },
    { qualite: 'Calme sous pression', pourquoi: 'Les perturbations génèrent de l\'anxiété chez les voyageurs. L\'agent doit rester le point fixe.' },
    { qualite: 'Sens de l\'organisation', pourquoi: 'Plusieurs trains, plusieurs PMR, plusieurs équipes — tout doit s\'articuler.' },
  ],

  erreurs_frequentes: [
    'Penser que le métier est simple parce qu\'il ne requiert pas de diplôme élevé',
    'Ne pas mentionner ses expériences d\'assistance à des personnes vulnérables',
    'Sous-estimer la dimension physique et météo du travail sur quai',
  ],

  idees_recues: [
    {
      idee: '"C\'est juste annoncer les trains dans un micro"',
      realite: 'Les annonces sont une petite partie du métier. La coordination opérationnelle et l\'assistance humaine sont au cœur du poste.',
    },
    {
      idee: '"C\'est un poste de second rang dans la hiérarchie ferroviaire"',
      realite: 'L\'agent d\'escale est un acteur clé de la chaîne opérationnelle. Sans lui, les trains ne partent pas dans de bonnes conditions.',
    },
  ],

  conseils_terrain: [
    'Valorisez toute expérience d\'assistance aux personnes, de gestion de foule ou de service client en situation de tension.',
    'Le poste est souvent polycompétent (escale + vente) dans les gares de taille intermédiaire — préparez-vous à cette réalité.',
    'La tenue et la présentation sont importantes : vous représentez l\'entreprise auprès du public à chaque instant.',
    'Montrez que vous êtes à l\'aise avec les outils numériques — les agents utilisent des applications métier pour la saisie des présences, les informations voyageurs et la gestion des PMR.',
    'Préparez des exemples concrets de situations difficiles gérées calmement — les recruteurs cherchent spécifiquement ça.',
    'La prise en charge des PMR (personnes à mobilité réduite) est une mission centrale et réglementée — renseignez-vous sur ce qu\'elle implique concrètement.',
    '⚠️ [À VALIDER] Les missions exactes, les outils et les compétences prioritaires varient selon la taille de la gare et l\'opérateur.',
  ],


  salaire: {
    brut_debutant: '1 650 € - 1 900 € brut/mois',
    brut_experimente: '2 000 € - 2 500 € brut/mois',
    primes: ['Prime de dimanche / férié', 'Prime de poste', 'Indemnités de repas'],
    avantages_nature: ['Transport gratuit', 'Mutuelle'],
    note_validation: '⚠️ [À VALIDER] Montants indicatifs (juin 2026).',
  },

  formation: {
    niveau_requis: 'Bac ou équivalent. BEP/CAP avec expérience accepté.',
    duree: '2 à 4 mois',
    lieu: 'Formation interne + tutorat en gare',
    contenu_general: [
      'Connaissance du réseau et des produits voyageurs',
      'Procédures d\'escale et de gestion des quais',
      'Assistance PMR',
      'Communication professionnelle',
    ],
    note: '⚠️ [À VALIDER] Contenu variable selon l\'opérateur.',
  },

  metiers_proches: ['agent-vente', 'controleur-asct'],

  profil_ideal: {
    horaires_decales: 4,
    gestion_stress: 3,
    autonomie: 3,
    relation_client: 5,
    rigueur: 3,
    mobilite: 2,
    aptitude_technique: 2,
    engagement_securite: 2,
  },
}

// ============================================================
// 6. TECHNICIEN MAINTENANCE (TECHNICENTRE)
// ============================================================

const technicienMaintenance: FicheMetier = {
  slug: 'technicien-maintenance',
  nom: 'Technicien de Maintenance Ferroviaire',
  categorie: 'maintenance',
  emoji: '🔧',
  accroche: 'Les trains partent parce qu\'ils ont travaillé la nuit. Ils sont les garants invisibles de la sécurité.',

  description: `Le technicien de maintenance ferroviaire assure l'entretien préventif et curatif du matériel roulant (locomotives, rames, TGV, wagons) dans les technicentres. Il travaille principalement de nuit pour ne pas perturber le trafic diurne. C'est un métier très technique, exigeant des compétences en mécanique, électrotechnique et électronique, dans un environnement industriel strict. La sécurité est omniprésente : chaque intervention doit être tracée et validée.`,

  missions: [
    'Réaliser les visites d\'entretien périodiques (préventif)',
    'Diagnostiquer les pannes et anomalies signalées',
    'Effectuer les réparations et remises en état',
    'Contrôler la conformité après intervention',
    'Rédiger les rapports d\'intervention dans le système de GMAO',
    'Respecter strictement les procédures de sécurité lors des travaux',
    'Participer aux astreintes en cas d\'incident grave',
  ],

  journee_type: {
    intro: 'Exemple d\'une prise de service de nuit dans un technicentre.',
    etapes: [
      { heure: '21h00', description: 'Prise de service. Réunion d\'équipe : attribution des rames à traiter, état des travaux en cours, consignes de sécurité.' },
      { heure: '21h30', description: 'Réception de la première rame rentrée de service. Visite systématique selon le tableau de bord des maintenances dues.' },
      { heure: '23h00', description: 'Diagnostic d\'une anomalie signalée par le conducteur : vibration anormale sur un bogie. Tests, mesures, consultation du dossier technique.' },
      { heure: '01h00', description: 'Intervention corrective. Travail en binôme sous la rame, positions contraintes, bruit et éclairage artificiel.' },
      { heure: '03h30', description: 'Contrôle final de conformité. Validation dans la GMAO. La rame est libérée pour le service du lendemain matin.' },
      { heure: '04h30', description: 'Traitement d\'une seconde rame selon le planning préventif. Pas d\'anomalie détectée.' },
      { heure: '06h00', description: 'Fin de service. Passation à l\'équipe du matin. Rapport de nuit.' },
    ],
    note: '⚠️ [À VALIDER] Les horaires et l\'organisation varient selon le type de matériel (TGV, TER, fret) et le technicentre.',
  },

  horaires: {
    type: 'Travail posté — prédominance des nuits',
    details: 'La maintenance se fait principalement hors période de trafic. Les nuits sont fréquentes, les week-ends aussi. Des astreintes peuvent exister selon le poste.',
    roulement: 'Roulement 2x8 ou 3x8 selon le technicentre. Les nuits représentent souvent une part importante du planning.',
    astreintes: true,
    note_validation: '⚠️ [À VALIDER] L\'organisation précise varie selon le site et les conventions collectives.',
  },

  avantages: [
    'Métier technique valorisant avec des responsabilités concrètes',
    'Travail en équipe soudée avec une vraie culture du métier',
    'Salaire amélioré par les primes de nuit significatives',
    'Accès à des équipements de pointe (TGV, matériel roulant récent)',
    'Formation continue sur les nouvelles technologies ferroviaires',
    'Emploi stable dans un secteur en transformation',
    'Autonomie dans l\'exécution des interventions',
  ],

  contraintes: [
    'Travail de nuit fréquent avec impact sur le rythme de vie',
    'Environnement physiquement exigeant (port de charges, positions contraintes)',
    'Bruit, huile, poussière — environnement industriel',
    'Pression des délais : la rame doit être prête pour le premier train',
    'Astreintes possibles en cas d\'incident grave',
    'Rigueur documentaire absolue — chaque intervention doit être tracée',
  ],

  difficultes: [
    'Inverser son rythme jour/nuit sur le long terme est physiologiquement difficile',
    'La pression de libérer la rame à temps, même sur des pannes complexes',
    'Travailler dans des positions inconfortables pendant des heures',
    'La documentation et la traçabilité administrative peuvent être fastidieuses',
  ],

  qualites_recherchees: [
    { qualite: 'Compétences techniques', pourquoi: 'Mécanique, électrotechnique, hydraulique — il faut maîtriser les bases.' },
    { qualite: 'Rigueur procédurale', pourquoi: 'En maintenance ferroviaire, les procédures sont des gardes-fous sécuritaires.' },
    { qualite: 'Esprit d\'analyse', pourquoi: 'Diagnostiquer une panne, c\'est méthodique. Les symptômes peuvent être trompeurs.' },
    { qualite: 'Résistance physique', pourquoi: 'Travailler sous une rame, dans le froid, la nuit, n\'est pas anodin.' },
    { qualite: 'Travail en équipe', pourquoi: 'Les interventions complexes se font en binôme ou en équipe. La communication est vitale.' },
  ],

  erreurs_frequentes: [
    'Penser que la passion pour les trains suffit — ce sont des compétences techniques concrètes qui sont évaluées',
    'Ne pas mentionner des expériences techniques même dans d\'autres secteurs',
    'Sous-estimer la rigueur documentaire attendue',
    'Oublier de parler de sa résistance aux nuits et à l\'environnement industriel',
  ],

  idees_recues: [
    {
      idee: '"C\'est un boulot de mécano, pas très qualifié"',
      realite: 'La maintenance ferroviaire intègre de l\'électronique, de l\'informatique embarquée, de la métrologie. C\'est un métier hautement technique.',
    },
    {
      idee: '"On travaille toujours la nuit, c\'est invivable"',
      realite: 'Les horaires sont contraignants mais organisés. Avec le temps, beaucoup de techniciens s\'y adaptent et apprécient le calme des nuits en technicentre.',
    },
  ],

  conseils_terrain: [
    'Avoir un CAP/BEP ou BTS dans un domaine technique est un vrai atout.',
    'Mettez en avant votre rapport à la rigueur et à la sécurité — ce sont les valeurs centrales.',
    'Si vous avez fait de la maintenance dans un autre secteur, valorisez-le fortement.',
    '⚠️ [À VALIDER] Les niveaux de qualification exigés varient selon le poste et l\'opérateur.',
  ],


  salaire: {
    brut_debutant: '1 900 € - 2 200 € brut/mois (hors primes)',
    brut_experimente: '2 500 € - 3 500 € brut/mois (avec primes de nuit)',
    primes: ['Prime de nuit (majoration significative)', 'Prime d\'astreinte', 'Prime de dimanche / férié'],
    avantages_nature: ['Transport gratuit', 'Mutuelle', 'Équipements de protection fournis'],
    note_validation: '⚠️ [À VALIDER] Montants indicatifs (juin 2026). Les primes de nuit peuvent représenter 20-40% du salaire brut.',
  },

  formation: {
    niveau_requis: 'CAP/BEP technique minimum. BTS Maintenance Industrielle / Électrotechnique très apprécié.',
    duree: '3 à 6 mois de formation interne spécifique ferroviaire',
    lieu: 'Technicentre + centres de formation spécialisés',
    contenu_general: [
      'Systèmes mécaniques et électriques du matériel ferroviaire (notions)',
      'Procédures de maintenance préventive (principes généraux)',
      'Sécurité en environnement ferroviaire',
      'Utilisation des outils de GMAO',
    ],
    note: '⚠️ [À VALIDER] RailReady n\'enseigne pas les procédures techniques internes. Ce contenu est indicatif.',
  },

  metiers_proches: ['technicien-voie-signalisation'],

  profil_ideal: {
    horaires_decales: 5,
    gestion_stress: 3,
    autonomie: 4,
    relation_client: 1,
    rigueur: 5,
    mobilite: 2,
    aptitude_technique: 5,
    engagement_securite: 5,
  },
}

// ============================================================
// 7. TECHNICIEN VOIE / SIGNALISATION
// ============================================================

const technicienVoieSignalisation: FicheMetier = {
  slug: 'technicien-voie-signalisation',
  nom: 'Technicien Voie / Signalisation',
  categorie: 'infrastructure',
  emoji: '🛤️',
  accroche: 'Il travaille la nuit sur des voies dangereuses pour que les trains roulent en sécurité le lendemain.',

  description: `Le technicien voie / signalisation travaille sur l'infrastructure ferroviaire : rails, traverses, aiguilles, appareils de voie, mais aussi les équipements de signalisation (signaux, cabines, circuits de voie). Il intervient principalement la nuit dans des plages de travaux (coupures de courant, interruptions de trafic) pour assurer l'entretien et la mise en service des équipements. C'est un métier très physique, exposé aux risques (risque ferroviaire, risque électrique), qui demande une rigueur absolue en matière de sécurité.`,

  missions: [
    'Entretenir et réparer les voies (rails, traverses, ballast)',
    'Maintenir les appareils de voie (aiguilles, jonctions)',
    'Contrôler et entretenir les équipements de signalisation',
    'Intervenir en astreinte sur les incidents d\'infrastructure',
    'Respecter les protocoles de sécurité lors des interventions sur voie',
    'Rédiger les rapports d\'intervention',
    'Participer aux chantiers de renouvellement de voie',
  ],

  journee_type: {
    intro: 'Exemple d\'une nuit de travaux sur voie — plage horaire 22h-05h (hors trafic).',
    etapes: [
      { heure: '21h30', description: 'Réunion de sécurité avant travaux. Attribution des postes, vérification des équipements de protection (gilets, lampes). Consignation électrique vérifiée.' },
      { heure: '22h00', description: 'Début de la plage travaux. Accès à la voie après autorisation du régulateur. Mise en place des protections.' },
      { heure: '22h15 → 01h30', description: 'Interventions planifiées : remplacement de traverses défectueuses, resserrage de fixations, mesures géométriques.' },
      { heure: '01h30', description: 'Incident : aiguille défaillante sur un appareil de voie adjacent. Intervention d\'urgence pour remise en état avant reprise du trafic.' },
      { heure: '03h30', description: 'Fin des travaux. Vérification de la remise en configuration normale de la voie. Levée des protections.' },
      { heure: '04h00', description: 'Restitution de la voie au régulateur. Rédaction du rapport d\'intervention. Retour base.' },
      { heure: '05h00', description: 'Fin de service.' },
    ],
    note: '⚠️ [À VALIDER] Les horaires et l\'organisation des plages travaux varient selon les lignes, les régions et les types d\'interventions.',
  },

  horaires: {
    type: 'Prédominance des nuits et week-ends',
    details: 'Les interventions sur voie se font principalement la nuit et le week-end quand le trafic est réduit ou interrompu. Ce rythme est une contrainte forte du métier.',
    roulement: 'Alternance de semaines de nuit et de jours selon les chantiers. Astreintes fréquentes pour les urgences d\'infrastructure.',
    astreintes: true,
    note_validation: '⚠️ [À VALIDER] Le rythme exact varie selon la zone géographique, le type de ligne et l\'organisation locale.',
  },

  avantages: [
    'Métier essentiel et concret — on voit le résultat de son travail',
    'Travail en équipe avec une forte solidarité de corps de métier',
    'Primes de nuit et d\'astreinte significatives',
    'Emploi stable dans un secteur qui investit massivement',
    'Diversité des interventions (voie, signalisation, génie civil)',
  ],

  contraintes: [
    'Travail de nuit en extérieur par tous les temps',
    'Risque ferroviaire — la proximité des voies est intrinsèquement dangereuse',
    'Port de charges lourdes et positions contraintes',
    'Astreintes fréquentes pour les urgences d\'infrastructure',
    'Pression des délais : la voie doit être rendue avant le premier train',
  ],

  difficultes: [
    'Accepter les conditions d\'intervention (nuit, froid, pluie, bruit)',
    'Maintenir une vigilance de sécurité absolue même en fin de nuit, fatigué',
    'La pression du délai de restitution de la voie au trafic',
    'L\'isolement des chantiers en zones parfois peu accessibles',
  ],

  qualites_recherchees: [
    { qualite: 'Robustesse physique', pourquoi: 'Ce métier se fait debout, dehors, la nuit, avec des outils lourds.' },
    { qualite: 'Culture sécurité irréprochable', pourquoi: 'Sur une voie ferrée, une erreur peut être mortelle.' },
    { qualite: 'Esprit d\'équipe', pourquoi: 'Les chantiers se font en groupe. La coordination est vitale.' },
    { qualite: 'Rigueur', pourquoi: 'Chaque intervention doit être parfaitement documentée et conforme.' },
    { qualite: 'Résistance aux conditions difficiles', pourquoi: 'Froid, pluie, bruit, nuit — il faut tenir sur la durée.' },
  ],

  erreurs_frequentes: [
    'Sous-estimer la pénibilité physique et les conditions d\'intervention',
    'Ne pas avoir réfléchi à l\'impact des nuits et astreintes sur sa vie personnelle',
    'Confondre le métier de technicien voie avec celui de technicien maintenance matériel roulant',
    'Oublier de mentionner ses qualités physiques et sa tolérance aux conditions de terrain',
  ],

  idees_recues: [
    {
      idee: '"C\'est un métier de manœuvre, pas qualifié"',
      realite: 'La signalisation ferroviaire intègre de l\'électronique complexe. Et même la maintenance de voie requiert des compétences en géométrie, métrologie et procédures de sécurité élaborées.',
    },
    {
      idee: '"Travailler la nuit, c\'est pas grave, on s\'y habitue vite"',
      realite: 'L\'adaptation au travail nocturne est réelle mais prend du temps. Elle a des conséquences sur la santé et la vie sociale qu\'il faut anticiper honnêtement.',
    },
  ],

  conseils_terrain: [
    'Valorisez toute expérience de travaux en extérieur, en hauteur ou en conditions difficiles.',
    'Montrez que vous avez une vraie culture de la sécurité — donnez des exemples concrets.',
    'Si vous avez travaillé en BTP, travaux publics ou industrie, c\'est directement transférable.',
    '⚠️ [À VALIDER] Les conditions d\'accès et les habilitations requises varient selon les postes et les lignes.',
  ],


  salaire: {
    brut_debutant: '1 900 € - 2 200 € brut/mois (hors primes)',
    brut_experimente: '2 500 € - 3 200 € brut/mois (avec primes)',
    primes: ['Prime de nuit', 'Prime d\'astreinte', 'Prime de salissure', 'Prime de dimanche / férié'],
    avantages_nature: ['Transport gratuit', 'Mutuelle', 'Équipements fournis'],
    note_validation: '⚠️ [À VALIDER] Montants indicatifs (juin 2026).',
  },

  formation: {
    niveau_requis: 'CAP/BEP technique ou BAC PRO (travaux publics, électrotechnique). Formation interne sur les spécificités ferroviaires.',
    duree: '3 à 6 mois de formation ferroviaire spécifique',
    lieu: 'Centres de formation internes + chantiers école',
    contenu_general: [
      'Principes généraux de la voie ferrée',
      'Sécurité en environnement voie (règles d\'accès, protections)',
      'Outillage et équipements de mesure',
      'Notions de signalisation (principes publics)',
    ],
    note: '⚠️ [À VALIDER] RailReady n\'enseigne pas les procédures internes. Contenu indicatif uniquement.',
  },

  metiers_proches: ['technicien-maintenance'],

  profil_ideal: {
    horaires_decales: 5,
    gestion_stress: 3,
    autonomie: 3,
    relation_client: 1,
    rigueur: 5,
    mobilite: 4,
    aptitude_technique: 5,
    engagement_securite: 5,
  },
}

// ============================================================
// EXPORT — Collection complète
// ============================================================

export const METIERS: FicheMetier[] = [
  conducteurDeTrain,
  agentCirculation,
  controleurASCT,
  agentVente,
  agentEscale,
  technicienMaintenance,
  technicienVoieSignalisation,
]

export const getMetierBySlug = (slug: string): FicheMetier | undefined =>
  METIERS.find(m => m.slug === slug)

export const getMetiersByCategorie = (categorie: FicheMetier['categorie']): FicheMetier[] =>
  METIERS.filter(m => m.categorie === categorie)

// Correspondance slug → questions d'entretien
export const METIER_SLUGS: string[] = METIERS.map(m => m.slug)
export type MetierSlug = string
