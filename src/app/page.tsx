import Link from 'next/link'
import { METIERS } from '@/data/metiers'

// ============================================================
// RAILREADY — Landing Page
// ============================================================

const FEATURES = [
  {
    icon: '🧭',
    title: 'Test de compatibilité',
    desc: '14 questions sur 8 dimensions. Découvrez les métiers qui correspondent à votre profil réel.',
  },
  {
    icon: '🎤',
    title: 'Simulateur d\'entretien IA',
    desc: 'Entraînez-vous face à un recruteur IA. Obtenez un rapport détaillé pour progresser.',
  },
  {
    icon: '💬',
    title: 'Mentor Ferroviaire',
    desc: 'Posez toutes vos questions à un expert terrain. Honnête, bienveillant, disponible 24h/24.',
  },
  {
    icon: '📋',
    title: '7 fiches métiers complètes',
    desc: 'Réalités du terrain, journées type, contraintes, salaires, évolutions. Sans langue de bois.',
  },
]

const FAQ = [
  {
    q: 'RailReady est-il affilié à la SNCF ?',
    a: 'Non. RailReady est une plateforme indépendante, créée par un professionnel du secteur ferroviaire. Nous ne représentons aucun opérateur et ne sommes pas un service officiel de recrutement.',
  },
  {
    q: 'Le test de compatibilité prédit-il mon aptitude aux postes ?',
    a: 'Non. C\'est un outil d\'orientation et de réflexion personnelle, pas un test psychotechnique officiel. Il aide à identifier les métiers les plus adaptés à votre profil, pas à certifier une aptitude.',
  },
  {
    q: 'Le simulateur d\'entretien ressemble-t-il aux vrais entretiens SNCF ?',
    a: 'Il s\'inspire des pratiques réelles du secteur, reformulées avec une approche pédagogique. Il ne reproduit pas de sujets d\'examen officiels. L\'objectif est de vous préparer comportementalement.',
  },
  {
    q: 'Qui peut utiliser RailReady ?',
    a: 'Toute personne intéressée par les métiers ferroviaires : candidats en reconversion, étudiants, personnes souhaitant changer de secteur, ou curieux qui veulent comprendre ces métiers de l\'intérieur.',
  },
  {
    q: 'C\'est gratuit ?',
    a: 'En phase bêta, toutes les fonctionnalités sont accessibles gratuitement. L\'objectif est de valider la plateforme avec de vrais utilisateurs avant toute décision sur le modèle économique.',
  },
]

const ETAPES = [
  { num: '01', titre: 'Créez votre compte', desc: 'Inscription en 30 secondes. Email et mot de passe — c\'est tout.' },
  { num: '02', titre: 'Faites le test de compatibilité', desc: '14 questions pour identifier votre profil et les métiers qui vous correspondent.' },
  { num: '03', titre: 'Explorez les fiches métiers', desc: 'Lisez les réalités terrain pour chaque métier. Confrontez vos idées à la réalité.' },
  { num: '04', titre: 'Simulez votre entretien', desc: 'Entraînez-vous, recevez un feedback, recommencez jusqu\'à être prêt.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚆</span>
            <span className="font-bold text-xl text-gray-900">RailReady</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#metiers" className="text-sm text-gray-600 hover:text-blue-700 transition-colors">Métiers</Link>
            <Link href="#comment" className="text-sm text-gray-600 hover:text-blue-700 transition-colors">Comment ça marche</Link>
            <Link href="/a-propos" className="text-sm text-gray-600 hover:text-blue-700 transition-colors">À propos</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-700 font-medium transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge indépendance */}
          <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-700 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"></span>
            <span className="text-sm text-blue-200">Plateforme indépendante · Non affiliée à la SNCF</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Préparez votre<br />
            <span className="text-orange-400">carrière ferroviaire</span><br />
            avec sérieux.
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            La réalité du terrain. L'honnêteté sur les contraintes. Les outils pour réussir votre recrutement.
            Par quelqu'un qui a fait ces métiers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
              Commencer gratuitement →
            </Link>
            <Link href="#metiers" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 transition-colors">
              Voir les métiers
            </Link>
          </div>

          <p className="mt-6 text-sm text-blue-300">Version bêta · Accès 100% gratuit · Aucune carte bancaire requise</p>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-4">
          {[
            { n: '7', label: 'Métiers documentés' },
            { n: '14', label: 'Questions de compatibilité' },
            { n: '8', label: 'Dimensions évaluées' },
          ].map((s, i) => (
            <div key={i} className="text-center bg-white/10 rounded-2xl p-5 border border-white/10">
              <div className="text-4xl font-black text-orange-400">{s.n}</div>
              <div className="text-sm text-blue-200 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Tout ce dont vous avez besoin<br />pour vous préparer</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              RailReady n'est pas un organisme de formation. C'est un outil de préparation honnête, construit par quelqu'un qui a vécu ces métiers de l'intérieur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="card p-6 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MÉTIERS ─── */}
      <section id="metiers" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Les 7 métiers ferroviaires</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Chaque fiche : réalités terrain, journée type, contraintes, salaires indicatifs, conseils pour réussir.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {METIERS.map((m) => (
              <Link
                key={m.slug}
                href={`/metiers/${m.slug}`}
                className="card p-5 hover:border-blue-300 hover:shadow-md transition-all text-center group"
              >
                <div className="text-3xl mb-2">{m.emoji}</div>
                <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors leading-snug">{m.nom}</div>
              </Link>
            ))}
            {/* Dernier carré CTA */}
            <Link
              href="/register"
              className="card p-5 bg-blue-700 border-blue-700 hover:bg-blue-800 transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="text-3xl">→</div>
              <div className="text-sm font-semibold text-white leading-snug">Voir toutes<br />les fiches</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section id="comment" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Comment ça marche</h2>
            <p className="section-subtitle">4 étapes pour être prêt le jour J.</p>
          </div>

          <div className="space-y-6">
            {ETAPES.map((e, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-lg">
                  {e.num}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-gray-900 mb-1">{e.titre}</h3>
                  <p className="text-gray-500 text-sm">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              Je commence maintenant →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── À PROPOS FONDATEUR ─── */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-orange-400 font-semibold mb-3 text-sm uppercase tracking-wide">Le fondateur</div>
              <h2 className="text-3xl font-bold mb-6">
                RailReady est né<br />d'une expérience terrain
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Après plusieurs années dans le secteur ferroviaire — agent circulation, contrôleur, conducteur de train — j'ai compris que les candidats manquaient d'une ressource honnête.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Pas des brochures de recrutement. Pas des sujets d'examen. La réalité du terrain : les contraintes, les nuits, ce que ça fait de prendre cette responsabilité chaque jour.
              </p>
              <Link href="/a-propos" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium transition-colors">
                En savoir plus sur RailReady →
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { emoji: '🔀', poste: 'Agent Circulation', desc: 'Gestion des circulations et coordination en temps réel.' },
                { emoji: '🎫', poste: 'Contrôleur / ASCT', desc: 'Relation client, sûreté à bord, gestion des conflits.' },
                { emoji: '🚆', poste: 'Conducteur de Train', desc: 'La cabine, la responsabilité, la réalité de la conduite.' },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-800 rounded-xl p-4">
                  <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">{p.poste}</div>
                    <div className="text-sm text-gray-400">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-gray-800">
            <div className="bg-gray-800 rounded-xl p-5 text-center">
              <span className="text-gray-400 text-sm">
                ⚠️ RailReady est une plateforme indépendante. Nous ne sommes pas affiliés à la SNCF ni à aucun opérateur ferroviaire.
                Nous ne sommes pas un organisme de formation agréé.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Questions fréquentes</h2>
          </div>

          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <details key={i} className="card p-5 group cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900 list-none cursor-pointer">
                  <span>{item.q}</span>
                  <span className="text-gray-400 ml-4 flex-shrink-0 text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20 px-4 bg-blue-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Prêt à vous préparer sérieusement ?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Rejoignez RailReady. Accès bêta gratuit, sans engagement.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
            Créer mon compte gratuitement →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-500 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🚆</span>
            <span className="font-semibold text-gray-300">RailReady</span>
            <span>· Plateforme indépendante</span>
          </div>
          <div className="flex gap-6">
            <Link href="/a-propos" className="hover:text-gray-300 transition-colors">À propos</Link>
            <Link href="/metiers" className="hover:text-gray-300 transition-colors">Métiers</Link>
            <span>Non affilié à la SNCF</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
