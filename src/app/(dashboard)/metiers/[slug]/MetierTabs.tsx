'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { FicheMetier } from '@/data/metiers'

const TABS = [
  { id: 'presentation', label: 'Présentation', icon: '📋' },
  { id: 'missions', label: 'Missions', icon: '🎯' },
  { id: 'competences', label: 'Compétences', icon: '💡' },
  { id: 'salaire', label: 'Salaire', icon: '💶' },
  { id: 'horaires', label: 'Horaires', icon: '⏰' },
  { id: 'formation', label: 'Formation', icon: '🎓' },
  { id: 'medical', label: 'Visite médicale', icon: '🏥' },
  { id: 'conseils', label: 'Conseils', icon: '💬' },
] as const

type TabId = typeof TABS[number]['id']

const DIMENSION_LABELS: Record<string, string> = {
  horaires_decales: 'Horaires décalés',
  gestion_stress: 'Gestion du stress',
  autonomie: 'Autonomie',
  relation_client: 'Relation client',
  rigueur: 'Rigueur & procédures',
  mobilite: 'Mobilité géographique',
  aptitude_technique: 'Aptitude technique',
  engagement_securite: 'Culture sécurité',
}

// Données médicales par métier
const MEDICAL_DATA: Record<string, {
  aptitudes: { label: string; detail: string; niveau: 'obligatoire' | 'important' | 'standard' }[]
  restrictions: string[]
  parcours: { etape: string; description: string }[]
  note: string
}> = {
  'conducteur-de-train': {
    aptitudes: [
      { label: 'Vision', detail: 'Acuité visuelle stricte, vision des couleurs (rouge/vert), pas de daltonisme', niveau: 'obligatoire' },
      { label: 'Audition', detail: 'Capacité auditive suffisante pour percevoir les signaux sonores', niveau: 'obligatoire' },
      { label: 'Vigilance', detail: 'Maintien de la concentration sur de longues durées sans fléchissement', niveau: 'obligatoire' },
      { label: 'Aptitude cardiovasculaire', detail: 'Bilan cardiaque requis, tension artérielle contrôlée', niveau: 'obligatoire' },
      { label: 'Santé psychologique', detail: 'Évaluation de la résistance au stress et de l\'équilibre psychologique', niveau: 'obligatoire' },
    ],
    restrictions: [
      'Pathologies cardiaques non contrôlées',
      'Épilepsie',
      'Diabète insulinodépendant non stabilisé',
      'Certains traitements psychotropes incompatibles avec la vigilance',
      'Consommation d\'alcool ou de substances psychoactives',
      'Déficience visuelle non corrigée',
    ],
    parcours: [
      { etape: 'Visite médicale initiale', description: 'Bilan complet auprès d\'un médecin agréé. Contrôle vision, audition, aptitudes cardiovasculaires et neurologiques.' },
      { etape: 'Évaluation psychologique', description: 'Tests psychotechniques et entretien avec un psychologue spécialisé sécurité ferroviaire.' },
      { etape: 'Tests de vigilance', description: 'Épreuves spécifiques mesurant la capacité de maintien de l\'attention.' },
      { etape: 'Visites de renouvellement', description: 'Contrôles périodiques obligatoires tout au long de la carrière (fréquence selon l\'âge et le poste).' },
    ],
    note: 'Les exigences médicales sont définies par la réglementation ferroviaire. Cette fiche est informative — seul un médecin agréé peut statuer sur l\'aptitude individuelle.',
  },
  'agent-circulation': {
    aptitudes: [
      { label: 'Vision', detail: 'Acuité visuelle et vision des couleurs requises', niveau: 'obligatoire' },
      { label: 'Audition', detail: 'Bonne audition pour la communication radio et téléphonique', niveau: 'obligatoire' },
      { label: 'Concentration', detail: 'Gestion simultanée de plusieurs circulations sans perte d\'attention', niveau: 'obligatoire' },
      { label: 'Santé cardiovasculaire', detail: 'Travail posté en 3x8, impact physiologique à anticiper', niveau: 'important' },
    ],
    restrictions: [
      'Troubles visuels non corrigibles',
      'Pathologies affectant la concentration ou la vigilance',
      'Épilepsie',
      'Troubles du sommeil sévères impactant le travail de nuit',
    ],
    parcours: [
      { etape: 'Visite médicale initiale', description: 'Bilan médical complet, contrôle des aptitudes sensorielles et cognitives.' },
      { etape: 'Évaluation psychologique', description: 'Tests de capacité à gérer plusieurs tâches simultanément.' },
      { etape: 'Visites périodiques', description: 'Renouvellement selon les protocoles en vigueur.' },
    ],
    note: 'Informations basées sur les exigences générales connues. Les opérateurs appliquent leurs propres protocoles médicaux.',
  },
  'controleur-asct': {
    aptitudes: [
      { label: 'Aptitude physique générale', detail: 'Station debout prolongée, déplacements dans les voitures', niveau: 'important' },
      { label: 'Vision', detail: 'Pour la lecture des documents et la surveillance des voyageurs', niveau: 'standard' },
      { label: 'Audition', detail: 'Communication avec les voyageurs, les annonces à bord', niveau: 'important' },
      { label: 'Résistance au travail posté', detail: 'Horaires décalés, travail de nuit possible', niveau: 'important' },
    ],
    restrictions: [
      'Problèmes locomoteurs importants',
      'Pathologies affectant la communication verbale',
      'Troubles de l\'équilibre',
    ],
    parcours: [
      { etape: 'Visite médicale d\'embauche', description: 'Bilan médical général, aptitude aux horaires décalés et au travail physique.' },
      { etape: 'Visites périodiques', description: 'Renouvellement selon le protocole de l\'opérateur.' },
    ],
    note: 'Les contraintes médicales sont moins strictes que pour les postes de conduite ou de circulation, mais l\'aptitude générale reste exigée.',
  },
  'agent-vente': {
    aptitudes: [
      { label: 'Aptitude physique générale', detail: 'Station debout, travail en agence ou en gare', niveau: 'standard' },
      { label: 'Vision', detail: 'Lecture des écrans, des documents, des billets', niveau: 'important' },
    ],
    restrictions: [
      'Pathologies rendant difficile la communication ou le service au public',
    ],
    parcours: [
      { etape: 'Visite médicale d\'embauche', description: 'Bilan médical standard d\'aptitude au poste.' },
    ],
    note: 'Poste moins contraint médicalement que les métiers d\'exploitation ou de conduite.',
  },
  'agent-escale': {
    aptitudes: [
      { label: 'Aptitude physique', detail: 'Station debout prolongée, déplacements fréquents en gare', niveau: 'important' },
      { label: 'Résistance au bruit', detail: 'Environnement sonore des halls de gare', niveau: 'standard' },
      { label: 'Audition', detail: 'Communication avec les voyageurs et les équipes', niveau: 'important' },
    ],
    restrictions: [
      'Pathologies importantes affectant la mobilité ou la communication',
    ],
    parcours: [
      { etape: 'Visite médicale d\'embauche', description: 'Bilan médical général.' },
      { etape: 'Visites périodiques', description: 'Selon le protocole de l\'employeur.' },
    ],
    note: 'Exigences médicales standards. Les postes en zone ferrée peuvent avoir des contraintes supplémentaires.',
  },
  'technicien-maintenance': {
    aptitudes: [
      { label: 'Aptitude physique', detail: 'Travail en atelier, port de charges, postures contraignantes', niveau: 'obligatoire' },
      { label: 'Vision', detail: 'Acuité visuelle pour les travaux techniques de précision', niveau: 'important' },
      { label: 'Audition', detail: 'Environnement bruyant (ateliers, halls de maintenance)', niveau: 'important' },
      { label: 'Aptitude au travail de nuit', description: 'Travail en 3x8, nuits régulières', niveau: 'obligatoire' } as never,
    ] as never,
    restrictions: [
      'Pathologies lombaires ou articulaires sévères',
      'Allergies graves aux huiles, graisses ou produits chimiques utilisés en atelier',
      'Troubles de l\'équilibre incompatibles avec le travail en hauteur ou sous les trains',
    ],
    parcours: [
      { etape: 'Visite médicale d\'embauche', description: 'Bilan médical complet, aptitude aux postures de travail contraignantes et au travail de nuit.' },
      { etape: 'Évaluation des risques professionnels', description: 'Bilan adapté aux risques du poste (bruit, vibrations, produits chimiques).' },
      { etape: 'Visites périodiques', description: 'Suivi régulier, fréquence selon les risques professionnels.' },
    ],
    note: 'Poste à risques professionnels spécifiques (bruit, vibrations, risque chimique). Le médecin du travail établit un suivi adapté.',
  },
  'technicien-voie-signalisation': {
    aptitudes: [
      { label: 'Aptitude physique', detail: 'Travail extérieur, port de charges, résistance aux conditions météo', niveau: 'obligatoire' },
      { label: 'Vision', detail: 'Travail de nuit, repérage visuel en voie, vision des couleurs (signalisation)', niveau: 'obligatoire' },
      { label: 'Aptitude au travail de nuit', detail: 'La majorité des travaux de voie se font la nuit', niveau: 'obligatoire' },
      { label: 'Résistance physique', detail: 'Travail debout, en extérieur, par tout temps', niveau: 'obligatoire' },
    ],
    restrictions: [
      'Problèmes cardiovasculaires importants',
      'Pathologies locomotrices sévères',
      'Troubles de la vision des couleurs (signalisation)',
      'Intolérance au travail de nuit ou en extérieur',
    ],
    parcours: [
      { etape: 'Visite médicale d\'embauche', description: 'Bilan complet, aptitude au travail physique intense en extérieur de nuit.' },
      { etape: 'Formation sécurité ferroviaire', description: 'Habilitations spécifiques incluant des vérifications d\'aptitude.' },
      { etape: 'Visites périodiques', description: 'Suivi médical régulier, adapté aux contraintes du poste.' },
    ],
    note: 'Métier physiquement exigeant avec des contraintes spécifiques liées au travail de nuit en zone ferrée.',
  },
}

interface MetierTabsProps {
  metier: FicheMetier
}

function CompetenceBar({ score, label }: { score: number; label: string }) {
  const color = score >= 4 ? 'bg-red-500' : score >= 3 ? 'bg-amber-400' : 'bg-gray-300'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-44 flex-shrink-0 leading-tight">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-500 w-10 text-right">{score}/5</span>
    </div>
  )
}

export default function MetierTabs({ metier }: MetierTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('presentation')
  const medical = MEDICAL_DATA[metier.slug] || null

  return (
    <div>
      {/* Navigation onglets — scrollable sur mobile */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mx-4 px-4 mb-8">
        <div className="flex overflow-x-auto gap-0 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ONGLET PRÉSENTATION */}
      {activeTab === 'presentation' && (
        <div className="space-y-8">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">{metier.description}</p>
          </div>

          {/* Journée type */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Journée type</h3>
            <p className="text-sm text-gray-500 italic mb-5">{metier.journee_type.intro}</p>
            <div className="space-y-4">
              {metier.journee_type.etapes.map((etape, i) => (
                <div key={i} className="flex gap-4">
                  <span className="font-mono text-sm text-blue-600 w-20 flex-shrink-0 pt-0.5 font-semibold">
                    {etape.heure}
                  </span>
                  <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                    <p className="text-gray-700 text-sm leading-relaxed">{etape.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {metier.journee_type.note && (
              <p className="mt-4 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
                {metier.journee_type.note}
              </p>
            )}
          </div>

          {/* Avantages / Contraintes */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-xs">✔</span>
                Avantages
              </h3>
              <ul className="space-y-2">
                {metier.avantages.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 flex-shrink-0 mt-0.5">+</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-xs">!</span>
                Contraintes
              </h3>
              <ul className="space-y-2">
                {metier.contraintes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-500 flex-shrink-0 mt-0.5">—</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Idées reçues */}
          {metier.idees_recues?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">💭 Idées reçues</h3>
              <div className="space-y-4">
                {metier.idees_recues.map((ir, i) => (
                  <div key={i} className="border-l-4 border-blue-200 pl-4">
                    <p className="text-sm font-medium text-gray-800 line-through opacity-70">{ir.idee}</p>
                    <p className="text-sm text-gray-600 mt-1">{ir.realite}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONGLET MISSIONS */}
      {activeTab === 'missions' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-5">Missions principales</h3>
            <ul className="space-y-3">
              {metier.missions.map((m, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {metier.difficultes?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-2">🧠 Ce que les candidats sous-estiment</h3>
              <p className="text-sm text-gray-400 mb-5 italic">Difficultés réelles du métier</p>
              <ul className="space-y-3">
                {metier.difficultes.map((d, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-red-400 flex-shrink-0 mt-1">▸</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metier.erreurs_frequentes?.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h3 className="font-bold text-red-900 mb-4">Erreurs fréquentes en entretien</h3>
              <ul className="space-y-2">
                {metier.erreurs_frequentes.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="flex-shrink-0">✗</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ONGLET COMPÉTENCES */}
      {activeTab === 'competences' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-2">Profil idéal par dimension</h3>
            <p className="text-xs text-gray-400 mb-6">
              Niveau d'exigence requis pour ce poste (1 = peu requis, 5 = indispensable)
            </p>
            <div className="space-y-4">
              {Object.entries(metier.profil_ideal)
                .sort(([, a], [, b]) => b - a)
                .map(([dim, score]) => (
                  <CompetenceBar
                    key={dim}
                    score={score}
                    label={DIMENSION_LABELS[dim] || dim}
                  />
                ))}
            </div>
          </div>

          {metier.qualites_recherchees?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Qualités recherchées</h3>
              <div className="space-y-4">
                {metier.qualites_recherchees.map((q, i) => (
                  <div key={i} className="border-l-4 border-blue-200 pl-4">
                    <p className="font-semibold text-gray-900 text-sm">{q.qualite}</p>
                    <p className="text-sm text-gray-600 mt-1">{q.pourquoi}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métiers proches */}
          {metier.metiers_proches?.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-bold text-blue-900 mb-3">Métiers proches</h3>
              <div className="flex flex-wrap gap-2">
                {metier.metiers_proches.map((m, i) => (
                  <span key={i} className="text-sm bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONGLET SALAIRE */}
      {activeTab === 'salaire' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-6">Grille salariale indicative</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Débutant</p>
                <p className="text-xl font-black text-gray-900">{metier.salaire.brut_debutant}</p>
                <p className="text-xs text-gray-400">brut/mois</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-xs text-blue-500 mb-1">Expérimenté</p>
                <p className="text-xl font-black text-blue-700">{metier.salaire.brut_experimente}</p>
                <p className="text-xs text-blue-400">brut/mois</p>
              </div>
            </div>

            {metier.salaire.avantages_nature?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-3 text-sm">Avantages en nature :</p>
                <div className="flex flex-wrap gap-2">
                  {metier.salaire.avantages_nature.map((av: string, i: number) => (
                    <span key={i} className="text-xs bg-green-50 border border-green-100 text-green-700 px-3 py-1.5 rounded-full">
                      ✔ {av}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {metier.salaire.note_validation && (
              <p className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-xl p-3">
                ⚠ {metier.salaire.note_validation}
              </p>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
            Les salaires indiqués sont des estimations basées sur des données publiques (juin 2026).
            Ils varient selon l'opérateur, l'ancienneté, le lieu d'affectation et les primes.
          </div>
        </div>
      )}

      {/* ONGLET HORAIRES */}
      {activeTab === 'horaires' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900 mb-4">Organisation du temps de travail</h3>
            {[
              { label: 'Type d\'horaires', value: metier.horaires.type },
              { label: 'Détail', value: metier.horaires.details },
              { label: 'Roulement', value: metier.horaires.roulement },
              { label: 'Astreintes', value: metier.horaires.astreintes ? 'Oui, possibles' : 'Non' },
            ].map((row, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-semibold text-gray-500 sm:w-40 flex-shrink-0">{row.label}</span>
                <span className={`text-sm text-gray-700 ${row.label === 'Astreintes' && metier.horaires.astreintes ? 'text-orange-600 font-medium' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
            {metier.horaires.note_validation && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3 mt-2">
                {metier.horaires.note_validation}
              </p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Impact sur la vie personnelle</h3>
            <div className="space-y-3">
              {[
                { icon: '🌙', label: 'Nuits', desc: 'Travail de nuit fréquent à anticiper dans l\'organisation familiale' },
                { icon: '📅', label: 'Week-ends et fériés', desc: 'Les week-ends et jours fériés sont travaillés selon les roulements' },
                { icon: '🔄', label: 'Rythme variable', desc: 'Les jours de repos ne sont pas fixes — ils varient selon les planning' },
                { icon: '⏱️', label: 'Amplitudes', desc: 'Les journées peuvent avoir des amplitudes horaires importantes' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ONGLET FORMATION */}
      {activeTab === 'formation' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-6">Parcours de formation</h3>
            <div className="space-y-4">
              {[
                { label: 'Niveau requis', value: metier.formation.niveau_requis },
                { label: 'Durée de formation', value: metier.formation.duree },
                { label: 'Lieu de formation', value: metier.formation.lieu },
              ].map((row, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-semibold text-gray-500 sm:w-44 flex-shrink-0">{row.label}</span>
                  <span className="text-sm text-gray-700">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {metier.formation.contenu_general?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">Contenu de la formation</h3>
              <div className="space-y-3">
                {metier.formation.contenu_general.map((item: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 pt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metier.formation.note && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-4">
              ⚠ {metier.formation.note}
            </p>
          )}
        </div>
      )}

      {/* ONGLET MÉDICAL */}
      {activeTab === 'medical' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-sm text-blue-800">
              <strong>Information :</strong> Cette section est purement informative. Seul un médecin agréé
              par l'opérateur ferroviaire peut déterminer votre aptitude médicale au poste.
              RailReady ne délivre aucun avis médical.
            </p>
          </div>

          {medical ? (
            <>
              {/* Aptitudes */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-5">Aptitudes généralement requises</h3>
                <div className="space-y-4">
                  {medical.aptitudes.map((apt, i) => (
                    <div key={i} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                      <div className={`w-20 flex-shrink-0 flex items-start`}>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          apt.niveau === 'obligatoire'
                            ? 'bg-red-100 text-red-700'
                            : apt.niveau === 'important'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {apt.niveau === 'obligatoire' ? 'Requis' : apt.niveau === 'important' ? 'Important' : 'Standard'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{apt.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{apt.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restrictions */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-2">Contre-indications potentielles</h3>
                <p className="text-xs text-gray-400 mb-4 italic">
                  Ces éléments peuvent, selon leur nature et leur sévérité, être incompatibles avec le poste.
                  Chaque situation est évaluée individuellement par le médecin.
                </p>
                <ul className="space-y-2">
                  {medical.restrictions.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parcours médical */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-5">Parcours médical type</h3>
                <div className="space-y-4">
                  {medical.parcours.map((p, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        {i < medical.parcours.length - 1 && (
                          <div className="w-0.5 bg-green-100 flex-1 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold text-sm text-gray-900">{p.etape}</p>
                        <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl p-4">
                {medical.note}
              </p>
            </>
          ) : (
            <div className="card p-8 text-center text-gray-400">
              <p>Informations médicales spécifiques à ce métier non encore disponibles.</p>
              <p className="text-sm mt-2">Contactez l'opérateur pour connaître les exigences exactes.</p>
            </div>
          )}
        </div>
      )}

      {/* ONGLET CONSEILS */}
      {activeTab === 'conseils' && (
        <div className="space-y-6">
          {metier.conseils_terrain?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5">💬 Conseils terrain</h3>
              <div className="space-y-4">
                {metier.conseils_terrain.map((conseil, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{conseil}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA entretien simulé */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Prêt à vous entraîner ?</h3>
            <p className="text-blue-200 text-sm mb-5">
              Simulez un entretien pour ce poste avec notre recruteur IA. Feedback détaillé à la fin.
            </p>
            <Link
              href={`/entretien?metier=${metier.slug}`}
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors"
            >
              🎤 Simuler un entretien {metier.nom}
            </Link>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
            <h3 className="font-semibold text-purple-900 mb-2">🧠 S'entraîner aux psychotechniques</h3>
            <p className="text-sm text-purple-700 mb-4">
              Les tests psychotechniques font partie du recrutement ferroviaire. Entraînez-vous avant votre convocation.
            </p>
            <Link
              href="/psychotechnique"
              className="inline-flex items-center gap-2 bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-purple-800 transition-colors"
            >
              Accéder aux exercices →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
