export const metadata = {
  title: 'À propos — RailReady',
  description: 'Plateforme indépendante de préparation aux métiers ferroviaires.',
}

export default function AProposPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 pb-24">

      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Plateforme indépendante
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          À propos de RailReady
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed">
          Une plateforme créée par des professionnels et passionnés du secteur ferroviaire.
        </p>
      </div>

      {/* Mission */}
      <div className="space-y-8 mb-16">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notre mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            RailReady est né d&apos;un constat simple : trop de candidats aux métiers ferroviaires se présentent
            aux recrutements sans avoir mesuré les réalités concrètes de ces postes. Résultat : des abandons
            en formation, des orientations mal choisies, et des déceptions des deux côtés.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Notre mission est d&apos;aider les futurs professionnels du rail à <strong>découvrir les métiers</strong>,
            à <strong>évaluer leur compatibilité</strong> réelle, et à <strong>se préparer sérieusement</strong>
            aux entretiens et aux formations — avant d&apos;aller plus loin dans leur projet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: '🎯', title: 'Orientation éclairée', desc: 'Un test de compatibilité pensé pour révéler honnêtement les métiers qui correspondent à votre profil — sans filtre complaisant.' },
            { icon: '🎤', title: 'Préparation réaliste', desc: 'Des simulations d\'entretien avec un recruteur IA qui pose des vraies questions et analyse vos réponses avec feedback détaillé.' },
            { icon: '📋', title: 'Information de terrain', desc: 'Des fiches métiers construites à partir de l\'expérience réelle : horaires, salaires, difficultés, idées reçues, conseils pratiques.' },
            { icon: '🧠', title: 'Entraînement ciblé', desc: 'Des exercices psychotechniques inspirés des typologies rencontrées en recrutement ferroviaire pour aborder les tests avec confiance.' },
          ].map((item, i) => (
            <div key={i} className="card p-6">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Positionnement */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Ce que RailReady n&apos;est pas</h2>
        <ul className="space-y-3">
          {[
            'Nous ne sommes pas un organisme de formation ferroviaire',
            'Nous ne sommes pas affiliés à la SNCF ni à aucun opérateur ferroviaire',
            'Nous ne délivrons aucune certification ni habilitation officielle',
            'Nous ne reproduisons pas de procédures internes confidentielles ni de sujets d\'examen réels',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-blue-800 text-sm">
              <span className="text-blue-400 flex-shrink-0 mt-0.5">—</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Sources */}
      <div className="card p-8 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Nos sources</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Toutes les informations présentes sur RailReady sont basées sur des données publiques,
          des retours d&apos;expérience terrain reformulés, et des contenus pédagogiques originaux.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Certains éléments sont signalés <em className="text-amber-600">[À VALIDER]</em> lorsqu&apos;ils
          nécessitent encore une confirmation par des professionnels du secteur. La plateforme
          est mise à jour régulièrement.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          RailReady · Plateforme indépendante d&apos;information ferroviaire · Non affiliée à la SNCF
        </p>
      </div>
    </div>
  )
}
