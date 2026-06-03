// ============================================================
// RAILREADY — Page À Propos / Le Fondateur
// /a-propos
// ⚠️ [À VALIDER] par le fondateur — contenu à personnaliser
// ============================================================

import Link from 'next/link'

export const metadata = {
  title: 'À propos — RailReady',
  description: 'Découvrez RailReady, la plateforme indépendante de préparation aux métiers ferroviaires, et l\'histoire de son fondateur.',
}

export default function AProposPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">À propos de RailReady</h1>
        <p className="text-gray-500 text-sm italic">
          ⚠️ [À VALIDER PAR LE FONDATEUR] — Ce texte est une base à personnaliser avec votre histoire réelle.
        </p>
      </div>

      {/* Note importante — indépendance */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-10">
        <p className="text-blue-800 font-medium mb-1">RailReady est une plateforme indépendante.</p>
        <p className="text-blue-700 text-sm">
          RailReady n'est ni affilié à la SNCF, ni à aucun opérateur ferroviaire. Nous ne sommes
          pas un organisme de formation agréé. Nous sommes une plateforme d'information, d'orientation
          et de préparation — conçue par quelqu'un qui connaît ces métiers de l'intérieur.
        </p>
      </div>

      {/* Le fondateur */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Le fondateur</h2>

        {/* Photo placeholder */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-4xl">
              🚆
            </div>
            <p className="text-xs text-center text-gray-400 mt-1">⚠️ [Ajouter photo]</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              ⚠️ [Votre prénom et nom]
            </h3>
            <p className="text-gray-500 text-sm mb-3">Fondateur de RailReady</p>
            <p className="text-gray-700 leading-relaxed">
              J'ai passé plusieurs années dans le secteur ferroviaire, à des postes très différents,
              qui m'ont donné une vision globale et authentique de ce que ces métiers représentent vraiment.
            </p>
          </div>
        </div>

        {/* Expérience terrain */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">🔀</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Agent Circulation</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  ⚠️ [À VALIDER] J'ai travaillé comme agent circulation, gérant les circulations
                  depuis un poste d'aiguillage. J'ai appris ce que signifie prendre une décision
                  en quelques secondes avec la sécurité de trains en jeu — et ce que ça fait
                  quand les choses ne se passent pas comme prévu.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">🎫</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Contrôleur / Agent Commercial Trains</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  ⚠️ [À VALIDER] J'ai été contrôleur à bord des trains. J'y ai appris la gestion
                  des conflits, la relation client dans ce qu'elle a de plus direct et parfois de
                  plus difficile, et la solitude relative du travail à bord. Ce poste m'a formé
                  humainement autant que professionnellement.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">🚆</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Conducteur de Train</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  ⚠️ [À VALIDER] Conduire un train, c'est une expérience à part entière.
                  La cabine, la solitude, la responsabilité — et ces moments où tout ce
                  qu'on vous a appris entre en jeu. J'ai vécu ce métier dans ce qu'il a
                  de plus beau et dans ce qu'il a de plus exigeant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi RailReady */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi RailReady</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Au fil de mes années dans le secteur, j'ai vu beaucoup de candidats arriver avec
            une image fausse de ces métiers. Pas par mauvaise volonté — mais parce qu'il
            n'existait pas de ressource honnête, accessible, qui parle de la vraie réalité du terrain.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Les offres d'emploi décrivent les postes, pas le quotidien. Les formations préparent
            à la technicité, pas à la réalité humaine. Et les candidats arrivent aux entretiens
            avec des lacunes que personne ne les a aidés à combler.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            RailReady est né de cette observation simple : les candidats ferroviaires méritent
            mieux. Ils méritent de savoir à quoi s'attendre. De comprendre les contraintes avant
            de signer. De se préparer vraiment — pas en surface.
          </p>
          <p className="text-gray-700 leading-relaxed">
            ⚠️ [À VALIDER / PERSONNALISER par le fondateur]
          </p>
        </div>
      </section>

      {/* Ce que RailReady est — et n'est pas */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que RailReady est — et n'est pas</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-green-800 mb-3">✅ Ce que nous sommes</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>Une plateforme d'orientation et d'information</li>
              <li>Un outil de préparation aux entretiens</li>
              <li>Un guide honnête sur les réalités du terrain</li>
              <li>Un espace de réflexion sur votre projet professionnel</li>
              <li>Une ressource indépendante de toute entreprise ferroviaire</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-3">❌ Ce que nous ne sommes pas</h3>
            <ul className="space-y-2 text-sm text-red-700">
              <li>Un organisme de formation agréé</li>
              <li>Un service affilié à la SNCF ou à un opérateur</li>
              <li>Un service officiel de recrutement</li>
              <li>Une garantie d'embauche</li>
              <li>Un dispensateur de procédures techniques officielles</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h2 className="font-bold text-gray-900 mb-2">Contact</h2>
        <p className="text-gray-600 text-sm mb-3">
          Une question sur RailReady ? Une information à corriger ? Une suggestion ?
        </p>
        <p className="text-sm text-gray-500">
          ⚠️ [À VALIDER] Adresse email de contact à ajouter ici.
        </p>
      </section>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/metiers"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Explorer les métiers ferroviaires
        </Link>
      </div>
    </div>
  )
}
