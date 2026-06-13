'use client'

// ============================================================
// RAILREADY — Espace Nouveaux Arrivants V1.0
// Vocabulaire ferroviaire, vie en roulement, culture sécurité,
// conseils de terrain — pour les nouveaux embauchés et
// candidats entrant en formation.
// ============================================================

import { useState } from 'react'

// ── Types ───────────────────────────────────────────────────
interface VocabEntry {
  term: string
  definition: string
  category: 'exploitation' | 'securite' | 'technique' | 'rh'
}

interface Section {
  id: string
  label: string
  icon: string
}

// ── Données ─────────────────────────────────────────────────
const SECTIONS: Section[] = [
  { id: 'vocabulaire', label: 'Vocabulaire ferroviaire', icon: '📚' },
  { id: 'roulement', label: 'Vie en roulement', icon: '🔄' },
  { id: 'securite', label: 'Culture sécurité', icon: '🛡️' },
  { id: 'conseils', label: 'Conseils de terrain', icon: '💡' },
]

const VOCAB: VocabEntry[] = [
  // Exploitation
  { term: 'Roulement', definition: 'Organisation du travail en cycles : succession de services de jour, nuit, repos — propre aux métiers ferroviaires en traction et circulation.', category: 'exploitation' },
  { term: 'Service', definition: 'Période de travail d\'un agent, délimitée par une prise et une fin de service. Peut comporter plusieurs missions (trajets).', category: 'exploitation' },
  { term: 'Mission', definition: 'Trajet assuré par un conducteur ou une rame entre deux terminus. Chaque mission a un numéro de train et un sillon horaire.', category: 'exploitation' },
  { term: 'Sillon', definition: 'Créneau horaire réservé sur le réseau ferré pour la circulation d\'un train entre deux points. Attribué par SNCF Réseau.', category: 'exploitation' },
  { term: 'Relève', definition: 'Passage de consignes entre deux agents qui se succèdent sur le même poste ou la même mission. Moment crucial pour la continuité du service.', category: 'exploitation' },
  { term: 'TR (Train Retardé)', definition: 'Situation où un train accuse un retard sur son horaire théorique. Déclenche des procédures de régulation et d\'information voyageurs.', category: 'exploitation' },
  { term: 'Régulateur', definition: 'Agent de circulation chargé de coordonner les trains sur un axe ou une zone, en temps réel, depuis un poste de commandement.', category: 'exploitation' },
  { term: 'PCO', definition: 'Poste de Commandement Opérationnel. Centre névralgique de la gestion des circulations sur un secteur géographique.', category: 'exploitation' },
  { term: 'Cabine de conduite', definition: 'Espace de travail du conducteur, en tête ou en queue de rame. Contient les commandes de traction, freinage, signalisation et communication.', category: 'exploitation' },
  { term: 'UTO', definition: 'Unité de Traction Opérationnelle. Structure locale qui gère les conducteurs et le matériel roulant sur un secteur.', category: 'exploitation' },
  { term: 'Terminus', definition: 'Gare en bout de ligne où le train fait demi-tour (ou se retourne). Les conducteurs effectuent les retournements et préparations.', category: 'exploitation' },
  { term: 'Décalé (horaire)', definition: 'Désigne tout service hors des heures standard (nuits, week-ends, jours fériés). Central dans les métiers ferroviaires, compensé par des majorations.', category: 'exploitation' },
  // Sécurité
  { term: 'Signalisation ferroviaire', definition: 'Ensemble des signaux au sol (carré, sémaphore, avertissement…) et en cabine (KVB, TVM) qui régulent la circulation des trains.', category: 'securite' },
  { term: 'KVB', definition: 'Contrôle de Vitesse par Balises. Système de sécurité français qui vérifie que le train respecte les limitations de vitesse et les signaux. Freine automatiquement en cas d\'écart.', category: 'securite' },
  { term: 'TVM', definition: 'Transmission Voie-Machine. Signalisation en cabine sur LGV (TGV) : les informations de cantonnement apparaissent directement en cabine sans signal au sol.', category: 'securite' },
  { term: 'Signal carré', definition: 'Signal rouge fixe : arrêt absolu obligatoire. Le franchir sans autorisation est une faute grave appelée "franchissement de carré".', category: 'securite' },
  { term: 'COGC', definition: 'Centre Opérationnel de Gestion des Circulations. Coordonne les secours, les incidents et la gestion de crise sur un territoire ferroviaire.', category: 'securite' },
  { term: 'REX', definition: 'Retour d\'EXpérience. Analyse post-incident ou post-accident visant à identifier les causes et améliorer les procédures. Culture de sécurité.', category: 'securite' },
  { term: 'Incident de sécurité', definition: 'Tout événement pouvant compromettre la sécurité des circulations ou des personnes. Doit être déclaré et traité selon des procédures précises.', category: 'securite' },
  { term: 'GCP', definition: 'Gestion de la Crise et des Perturbations. Dispositif activé lors d\'incidents majeurs pour coordonner les actions de tous les acteurs.', category: 'securite' },
  // Technique
  { term: 'AGC', definition: 'Autorail Grande Capacité. Famille de trains régionaux bimodes (diesel/électrique) très répandus en France dans les Intercités et TER.', category: 'technique' },
  { term: 'Pantographe', definition: 'Dispositif articulé sur le toit du train qui capte le courant électrique de la caténaire (fil aérien). Son bon état conditionne la traction.', category: 'technique' },
  { term: 'Caténaire', definition: 'Fil électrique suspendu au-dessus des voies qui alimente les trains en courant (25 000 V sur LGV, 1 500 V continu sur réseau classique).', category: 'technique' },
  { term: 'Coupure de traction', definition: 'Interruption temporaire de l\'alimentation électrique, notamment pour des travaux ou des incidents sur la caténaire.', category: 'technique' },
  { term: 'Bogie', definition: 'Ensemble de roues et d\'essieux sur lequel repose la caisse d\'un wagon ou d\'une voiture. Sa maintenance est critique pour la sécurité de roulement.', category: 'technique' },
  // RH / Formation
  { term: 'EF', definition: 'Entreprise Ferroviaire. Toute société opérant des trains sur le réseau (SNCF Voyageurs, FRET SNCF, opérateurs privés comme Transdev, Trenitalia…).', category: 'rh' },
  { term: 'GI', definition: 'Gestionnaire d\'Infrastructure. En France, c\'est SNCF Réseau qui gère et entretient les voies, la signalisation, les gares et les installations.', category: 'rh' },
  { term: 'Habilitation', definition: 'Autorisation officielle délivrée après formation et examens, permettant à un agent d\'exercer une fonction précise (ex : conduire un type de matériel).', category: 'rh' },
  { term: 'Aptitude médicale', definition: 'Validation médicale périodique obligatoire pour les métiers de sécurité (conducteur, agent circulation). Porte sur la vision, l\'audition, les facultés cognitives.', category: 'rh' },
  { term: 'Période probatoire', definition: 'Phase suivant la formation initiale où l\'agent exerce sous supervision ou avec un accompagnement renforcé, avant validation définitive de ses compétences.', category: 'rh' },
  { term: 'DIF / CPF', definition: 'Dispositifs de formation continue permettant aux agents ferroviaires d\'acquérir de nouvelles compétences ou de changer d\'orientation en cours de carrière.', category: 'rh' },
]

const CATEGORY_LABELS: Record<VocabEntry['category'], string> = {
  exploitation: 'Exploitation',
  securite: 'Sécurité',
  technique: 'Technique',
  rh: 'RH / Formation',
}

const CATEGORY_COLORS: Record<VocabEntry['category'], string> = {
  exploitation: 'bg-blue-50 text-blue-700 border-blue-200',
  securite: 'bg-red-50 text-red-700 border-red-200',
  technique: 'bg-amber-50 text-amber-700 border-amber-200',
  rh: 'bg-green-50 text-green-700 border-green-200',
}

const ROULEMENT_ITEMS = [
  {
    title: 'Le principe du roulement',
    icon: '🔄',
    content: 'Le roulement est l\'ADN des métiers ferroviaires. Vos horaires changent chaque semaine selon un cycle planifié à l\'avance (en général 4 à 8 semaines). Vous travaillez des matins, des après-midis, des nuits, des week-ends et des jours fériés — pas de semaine standard.',
  },
  {
    title: 'Les amplitudes et les repos',
    icon: '⏰',
    content: 'L\'amplitude d\'un service (du début à la fin) peut atteindre 9h à 10h30 selon les conventions. Entre deux services, un repos minimum légal s\'applique. Les nuits et les dimanches sont majorés financièrement.',
  },
  {
    title: 'La mobilité géographique',
    icon: '🗺️',
    content: 'Selon le métier et le secteur, vous pouvez être affecté à un dépôt ou une gare principale, mais vos services peuvent vous emmener dans des villes parfois éloignées avec des déplacements et nuitées hors domicile ("couchettes").',
  },
  {
    title: 'Les avantages pratiques',
    icon: '🎁',
    content: 'La carte de circulation permet de voyager gratuitement (ou quasi) sur tout le réseau SNCF, souvent étendue aux proches. D\'autres avantages existent selon les accords d\'entreprise (mutuelle, restauration, logement…).',
  },
  {
    title: 'La vie sociale à adapter',
    icon: '👨‍👩‍👧',
    content: 'Les horaires décalés impactent la vie familiale et sociale. Les agents les plus épanouis dans ces métiers ont appris à organiser leur vie autour du roulement plutôt que de le subir : planification avancée, entourage compréhensif, activités flexibles.',
  },
  {
    title: 'La fatigue et la récupération',
    icon: '😴',
    content: 'La vigilance est la compétence clé des métiers de sécurité ferroviaire. Maintenir un bon rythme de sommeil malgré les horaires variables est essentiel. Beaucoup d\'agents développent des rituels de récupération (sieste stratégique, routine de coucher).',
  },
]

const SECURITE_ITEMS = [
  {
    title: 'La sécurité avant tout',
    icon: '🛡️',
    content: 'Le secteur ferroviaire fonctionne avec une culture de sécurité très structurée. Chaque agent, quel que soit son niveau, est légitimé à arrêter une opération s\'il a un doute sur la sécurité. Ce droit — et ce devoir — s\'appelle le "droit de retrait" ou "stop safety".',
  },
  {
    title: 'Le signalement systématique',
    icon: '📋',
    content: 'Tout incident, même mineur, doit être signalé. Non pour blâmer l\'agent, mais pour comprendre et améliorer. Le Retour d\'EXpérience (REX) est au cœur de la culture ferroviaire : on apprend des événements, des presqu\'accidents et des anomalies.',
  },
  {
    title: 'Les procédures ne se discutent pas',
    icon: '📌',
    content: 'En sécurité ferroviaire, les procédures sont des règles absolues, pas des recommandations. Elles ont été conçues à partir de décennies d\'expérience et d\'incidents. Suivre la procédure, même quand ça semble "excessif", est la norme professionnelle.',
  },
  {
    title: 'La vigilance active',
    icon: '👁️',
    content: 'La vigilance ne signifie pas juste "être éveillé". C\'est une posture active : anticiper, vérifier, confirmer. Les conducteurs utilisent des techniques comme la "vérification à haute voix" (annoncer ce qu\'on voit) pour maintenir leur niveau de vigilance sur des trajets répétitifs.',
  },
  {
    title: 'L\'aptitude médicale régulière',
    icon: '🏥',
    content: 'Les agents en poste de sécurité passent des visites médicales régulières (annuelles ou bisannuelles selon le poste). Vision, audition, vigilance, santé cardiovasculaire et absence de traitements incompatibles sont vérifiés. Pas d\'aptitude = pas de conduite.',
  },
  {
    title: 'La chaîne de sécurité humaine',
    icon: '🔗',
    content: 'Chaque agent est un maillon d\'une chaîne. Le conducteur, l\'agent circulation, le régulateur, le gestionnaire d\'infrastructure — tous doivent se faire confiance et communiquer avec précision. Une communication floue peut avoir des conséquences graves.',
  },
]

const CONSEILS_ITEMS = [
  {
    title: 'Votre première année est décisive',
    icon: '🏁',
    content: 'La période de formation et les premiers mois en poste forgent vos automatismes pour toute la carrière. Soyez exigeant avec vous-même dès le début. Les erreurs de vigilance ou de procédure prises pendant cette phase sont difficiles à déconstruire.',
  },
  {
    title: 'Posez des questions, sans gêne',
    icon: '🙋',
    content: 'Dans le ferroviaire, la culture de la question est valorisée. Il vaut mieux demander "je ne suis pas sûr" que d\'agir avec un doute. Les agents expérimentés savent que les nouvelles recrues apportent aussi un regard neuf et des questions utiles.',
  },
  {
    title: 'Le tuteur est une ressource, pas un examinateur',
    icon: '🤝',
    content: 'Votre tuteur (ou référent) a été choisi pour sa pédagogie, pas uniquement pour ses compétences techniques. Créez une vraie relation de confiance. Partagez vos doutes. Profitez de cette relation — elle prend fin à la fin de votre période probatoire.',
  },
  {
    title: 'Prenez soin de votre sommeil',
    icon: '🌙',
    content: 'Cela semble banal, mais c\'est la priorité numéro 1. Un conducteur ou agent circulation fatigué est un risque pour lui, son train et ses passagers. Apprenez vite à gérer votre sommeil : horaires décalés, siestes, chambre obscure, coupure des écrans.',
  },
  {
    title: 'Construisez votre réseau interne',
    icon: '🌐',
    content: 'Le réseau de collègues de confiance est un capital précieux. Trouvez des agents plus expérimentés qui partagent leur expérience terrain. Les échanges informels transmettent souvent des savoirs que la formation ne couvre pas.',
  },
  {
    title: 'Comprenez la logique économique',
    icon: '📊',
    content: 'Le ferroviaire est un secteur industriel avec ses contraintes économiques. Comprendre les enjeux (ponctualité, productivité, coûts de maintenance) vous aide à être un meilleur professionnel et à anticiper les évolutions du secteur.',
  },
  {
    title: 'Préparez votre évolution dès le début',
    icon: '🚀',
    content: 'Beaucoup d\'agents ferroviaires évoluent significativement au cours de leur carrière : changement de métier, d\'entreprise, de poste. Certains passent conducteur, agent circulation, puis régulateur ou formateur. Pensez-y dès maintenant.',
  },
  {
    title: 'Les idées reçues à abandonner',
    icon: '❌',
    content: '"Le ferroviaire c\'est stable et tranquille" → C\'est un secteur en transformation rapide (libéralisation, numérique, nouvelles mobilités). "C\'est un travail de fonctionnaire" → Depuis 2020, les nouvelles embauches se font sous statut de droit privé dans la majorité des EF.',
  },
]

// ── Page ────────────────────────────────────────────────────
export default function NouveauxArrivantsPage() {
  const [activeSection, setActiveSection] = useState<string>('vocabulaire')
  const [vocabFilter, setVocabFilter] = useState<VocabEntry['category'] | 'all'>('all')
  const [search, setSearch] = useState('')
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)

  const filteredVocab = VOCAB.filter(v => {
    const matchCat = vocabFilter === 'all' || v.category === vocabFilter
    const matchSearch = search.length < 2 || v.term.toLowerCase().includes(search.toLowerCase()) || v.definition.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8">

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          🚆 Espace Nouveaux Arrivants
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenue dans le ferroviaire</h1>
        <p className="text-gray-500 mt-1 text-sm leading-relaxed">
          Vocabulaire, vie en roulement, culture sécurité et conseils de terrain — tout ce qu&apos;il faut savoir pour bien démarrer.
        </p>
      </div>

      {/* Navigation sections */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeSection === s.id
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Section : Vocabulaire ── */}
      {activeSection === 'vocabulaire' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {VOCAB.length} termes clés du monde ferroviaire — maîtrisez le langage du terrain avant votre premier jour.
          </p>

          {/* Filtres */}
          <div className="flex gap-2 flex-wrap items-center">
            <input
              type="text"
              placeholder="Rechercher un terme…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'exploitation', 'securite', 'technique', 'rh'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setVocabFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    vocabFilter === cat
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'Tous' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des termes */}
          <div className="space-y-2">
            {filteredVocab.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Aucun terme ne correspond à votre recherche.</p>
            )}
            {filteredVocab.map(v => (
              <div key={v.term} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedTerm(expandedTerm === v.term ? null : v.term)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border flex-shrink-0 ${CATEGORY_COLORS[v.category]}`}>
                      {CATEGORY_LABELS[v.category]}
                    </span>
                    <span className="font-semibold text-gray-900 truncate">{v.term}</span>
                  </div>
                  <span className="text-gray-400 flex-shrink-0 text-sm">{expandedTerm === v.term ? '▲' : '▼'}</span>
                </button>
                {expandedTerm === v.term && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{v.definition}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section : Vie en roulement ── */}
      {activeSection === 'roulement' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
            Le roulement est la réalité quotidienne des métiers ferroviaires. Comprendre son fonctionnement avant d&apos;entrer en formation vous évitera bien des surprises.
          </div>
          {ROULEMENT_ITEMS.map((item, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Section : Culture sécurité ── */}
      {activeSection === 'securite' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-800">
            La sécurité ferroviaire n&apos;est pas une contrainte administrative — c&apos;est la culture et l&apos;identité du secteur. Elle s&apos;apprend, se pratique et se transmet au quotidien.
          </div>
          {SECURITE_ITEMS.map((item, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <strong>Note RailReady :</strong> Ces informations sont issues de connaissances publiques et de retours d&apos;expérience terrain reformulés. Elles ne reproduisent pas de procédures internes confidentielles des opérateurs ferroviaires.
          </div>
        </div>
      )}

      {/* ── Section : Conseils de terrain ── */}
      {activeSection === 'conseils' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-800">
            Ce que les formations ne vous diront pas toujours — mais que les agents expérimentés savent d&apos;expérience.
          </div>
          {CONSEILS_ITEMS.map((item, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA bas de page */}
      <div className="mt-8 card p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Prêt à passer à l&apos;action ?</p>
          <p className="text-xs text-gray-400 mt-0.5">Testez votre compatibilité avec les métiers ferroviaires</p>
        </div>
        <a href="/test-compatibilite" className="btn-primary text-sm py-2 flex-shrink-0">
          Test de compatibilité →
        </a>
      </div>
    </div>
  )
}
