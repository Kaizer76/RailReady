import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { METIERS } from '@/data/metiers'

export const metadata = { title: 'Tableau de bord — RailReady' }

// ── Gauge SVG circulaire ──────────────────────────────────────
function ScoreGauge({ score, size = 100 }: { score: number | null; size?: number }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const filled = score !== null ? Math.round((score / 100) * circumference) : 0
  const color = score === null ? '#e5e7eb'
    : score >= 72 ? '#10b981' : score >= 48 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10"/>
      <circle cx="45" cy="45" r={radius} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
        transform="rotate(-90 45 45)"/>
      <text x="45" y="49" textAnchor="middle" fontSize="16" fontWeight="900"
        fill={score === null ? '#d1d5db' : color}>
        {score !== null ? score : '—'}
      </text>
    </svg>
  )
}

// ── Mini bar chart pour progression entretiens ──────────────────
function ScoreBarChart({ scores }: { scores: Array<{ score: number | null; label: string }> }) {
  if (scores.length === 0) return null
  const barW = 24, gap = 6, chartH = 60
  const width = scores.length * (barW + gap) - gap + 2
  return (
    <svg width={width} height={chartH + 20} viewBox={`0 0 ${width} ${chartH + 20}`}>
      {scores.map((s, i) => {
        const h = s.score !== null ? Math.round((s.score / 100) * chartH) : 4
        const x = i * (barW + gap), y = chartH - h
        const color = s.score === null ? '#e5e7eb'
          : s.score >= 72 ? '#10b981' : s.score >= 48 ? '#f59e0b' : '#ef4444'
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="4" fill={color} opacity="0.85"/>
            {s.score !== null && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="9"
                fill={color} fontWeight="700">{s.score}</text>
            )}
            <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize="8"
              fill="#9ca3af">{s.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Étape de progression ────────────────────────────────────────
function EtapeItem({ done, label, href, detail }: {
  done: boolean; label: string; href: string; detail: string
}) {
  return (
    <Link href={href} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
      done ? 'opacity-60' : 'hover:bg-blue-50 cursor-pointer'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
        done ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
        {done ? '✓' : '→'}
      </div>
      <div>
        <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{detail}</p>
      </div>
    </Link>
  )
}

// ── Types ───────────────────────────────────────────────────────
interface AiSession {
  id: string; poste: string | null; score: number | null; created_at: string
}
interface QuizSession {
  id: string; score: number | null
  results: {
    metiersRecommandes?: Array<{ slug: string; nom: string; emoji: string; compatibilite: number }>
    dimensions?: Array<{ dimension: string; label: string; score: number; niveau: string }>
    pointsForts?: string[]
    pointsVigilance?: string[]
  } | null
  completed_at: string | null
}
interface PsychoSession {
  id: string; module: string; score: number; niveau: number; created_at: string
}

// ── Page ────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const prenom = user?.user_metadata?.prenom || 'Candidat'

  const [quizRes, entretienRes, profileRes, psychoRes] = await Promise.all([
    supabase.from('user_quiz_sessions').select('id, score, results, completed_at')
      .eq('user_id', user!.id).eq('status', 'completed')
      .order('completed_at', { ascending: false }).limit(3),
    supabase.from('ai_sessions').select('id, poste, score, created_at')
      .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('profiles').select('metier_vise, age, region, disponibilite')
      .eq('id', user!.id).single(),
    supabase.from('psycho_sessions').select('id, module, score, niveau, created_at')
      .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(50),
  ])

  const quizSessions: QuizSession[] = (quizRes.data || []) as QuizSession[]
  const sessions: AiSession[] = (entretienRes.data || []) as AiSession[]
  const profile = profileRes.data
  const psychoSessions: PsychoSession[] = (psychoRes.data || []) as PsychoSession[]

  // Statistiques psychotechniques (P9)
  const psychoTotal = psychoSessions.length
  const psychoLast = psychoSessions[0]?.score ?? null
  const psychoPrev = psychoSessions[1]?.score ?? null
  const psychoBest = psychoTotal > 0 ? Math.max(...psychoSessions.map(p => p.score)) : null
  const psychoProgression = (psychoLast !== null && psychoPrev !== null) ? psychoLast - psychoPrev : null

  const lastQuiz = quizSessions[0] ?? null
  const score = lastQuiz?.score ?? null
  const hasQuiz = score !== null
  const topMetier = lastQuiz?.results?.metiersRecommandes?.[0] ?? null
  const metierViseSlug = profile?.metier_vise || topMetier?.slug || null
  const metierViseData = metierViseSlug ? METIERS.find(m => m.slug === metierViseSlug) : null

  const scoreColor = !hasQuiz ? 'text-gray-300'
    : score >= 72 ? 'text-emerald-600' : score >= 48 ? 'text-amber-500' : 'text-red-500'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir'

  const chartScores = [...sessions].reverse().slice(-5).map((s, i) => ({
    score: s.score, label: `E${i + 1}`,
  }))

  const scoredSessions = sessions.filter(s => s.score !== null)
  const avgScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((a, s) => a + (s.score ?? 0), 0) / scoredSessions.length)
    : null
  const lastScore = scoredSessions[0]?.score ?? null
  const prevScore = scoredSessions[1]?.score ?? null
  const progression = (lastScore !== null && prevScore !== null) ? lastScore - prevScore : null

  const topDimensions = (lastQuiz?.results?.dimensions ?? [])
    .slice().sort((a, b) => b.score - a.score).slice(0, 3)
  const weakDimensions = (lastQuiz?.results?.dimensions ?? [])
    .slice().sort((a, b) => a.score - b.score).filter(d => d.score < 48).slice(0, 2)

  const stepsComplete = [
    hasQuiz, sessions.length > 0, sessions.length >= 3,
    !!profile?.region, sessions.length >= 5,
  ].filter(Boolean).length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 lg:pb-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {prenom} &#x1F44B;</h1>
          <p className="text-gray-400 text-sm mt-0.5">Espace de preparation aux metiers ferroviaires</p>
        </div>
        {metierViseData && (
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0">
            <span>{metierViseData.emoji}</span>
            <span>{metierViseData.nom}</span>
          </div>
        )}
      </div>

      {/* ONBOARDING BANNER */}
      {!hasQuiz && sessions.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-800 text-white p-6 md:p-8">
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">&#x1F686;</span>
              <div>
                <h2 className="font-bold text-xl mb-2">Bienvenue sur RailReady !</h2>
                <p className="text-blue-200 text-sm leading-relaxed mb-5 max-w-lg">
                  Commencez par le test de compatibilite pour decouvrir les metiers
                  ferroviaires qui vous correspondent. 27 questions &middot; 10 minutes &middot; Resultats immediats.
                </p>
                <Link href="/test-compatibilite"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-lg">
                  Faire le test de compatibilite &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRILLE : Score + Metier + Entretiens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Score gauge */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Compatibilite</p>
              {hasQuiz && (
                <p className={`text-xs mt-0.5 font-medium ${scoreColor}`}>
                  {score !== null && score >= 72 ? 'Profil solide'
                    : score !== null && score >= 48 ? 'A developper' : 'A travailler'}
                </p>
              )}
            </div>
            <Link href={hasQuiz ? '/test-compatibilite/resultats' : '/test-compatibilite'}
              className="text-xs text-blue-600 hover:underline">
              {hasQuiz ? 'Voir resultats' : 'Faire le test'}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ScoreGauge score={score} size={90}/>
            <div className="flex-1 min-w-0">
              {!hasQuiz && <p className="text-xs text-gray-400">Aucun test effectue</p>}
              {hasQuiz && topDimensions.length > 0 && (
                <div className="space-y-1.5">
                  {topDimensions.slice(0, 3).map(d => (
                    <div key={d.dimension} className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${d.score}%` }}/>
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{d.score}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 mt-1">Top 3 dimensions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metier recommande */}
        <div className="card p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Metier recommande
          </p>
          {(topMetier || metierViseData) ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{topMetier?.emoji ?? metierViseData?.emoji}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-snug">
                    {topMetier?.nom ?? metierViseData?.nom}
                  </p>
                  {topMetier && (
                    <span className="text-xs text-emerald-600 font-semibold">
                      {topMetier.compatibilite}% de compatibilite
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {metierViseSlug && (
                  <Link href={`/metiers/${metierViseSlug}`}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                    Fiche metier
                  </Link>
                )}
                <Link href="/entretien"
                  className="text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Simuler entretien
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <p className="text-gray-300 text-3xl mb-2">&#x1F3AF;</p>
              <p className="text-xs text-gray-400">Faites le test pour voir votre metier ideal</p>
              <Link href="/test-compatibilite" className="text-xs text-blue-600 hover:underline mt-1">
                Demarrer
              </Link>
            </div>
          )}
        </div>

        {/* Entretiens progression */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Entretiens simules</p>
            <Link href="/entretien" className="text-xs text-blue-600 hover:underline">Simuler</Link>
          </div>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <p className="text-gray-300 text-3xl mb-2">&#x1F3A4;</p>
              <p className="text-xs text-gray-400">Aucun entretien simule</p>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-4 mb-3">
                <div>
                  <span className={`text-3xl font-black ${lastScore !== null
                    ? lastScore >= 72 ? 'text-emerald-600' : lastScore >= 48 ? 'text-amber-500' : 'text-red-500'
                    : 'text-gray-300'}`}>
                    {lastScore ?? '—'}
                  </span>
                  <span className="text-gray-400 text-sm ml-1">/100</span>
                </div>
                {progression !== null && (
                  <span className={`text-sm font-semibold ${progression > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {progression > 0 ? `+${progression}` : `${progression}`}
                  </span>
                )}
              </div>
              <div className="flex items-start gap-3">
                <ScoreBarChart scores={chartScores}/>
                <div className="flex-1 text-xs text-gray-400 space-y-1">
                  <p><span className="font-semibold text-gray-600">{sessions.length}</span> session{sessions.length > 1 ? 's' : ''}</p>
                  {avgScore !== null && (
                    <p>Moyenne : <span className="font-semibold text-gray-600">{avgScore}</span></p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PSYCHOTECHNIQUE — statistiques (P9) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Psychotechnique</h2>
          <Link href="/psychotechnique" className="text-xs text-blue-600 hover:underline">S&apos;entraîner</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: '&#x1F9E0;',
              value: psychoLast !== null ? `${psychoLast} %` : '—',
              label: 'Dernier score',
              color: psychoLast === null ? 'text-gray-300' : psychoLast >= 70 ? 'text-emerald-600' : psychoLast >= 50 ? 'text-amber-500' : 'text-red-500',
            },
            {
              icon: '&#x1F4C8;',
              value: psychoProgression === null ? '—' : psychoProgression > 0 ? `+${psychoProgression}` : `${psychoProgression}`,
              label: 'Progression',
              color: psychoProgression === null ? 'text-gray-300' : psychoProgression >= 0 ? 'text-emerald-600' : 'text-red-500',
            },
            {
              icon: '&#x1F3C6;',
              value: psychoBest !== null ? `${psychoBest} %` : '—',
              label: 'Meilleur score',
              color: psychoBest === null ? 'text-gray-300' : 'text-blue-700',
            },
            {
              icon: '&#x2705;',
              value: psychoTotal,
              label: 'Exercices realises',
              color: psychoTotal > 0 ? 'text-gray-900' : 'text-gray-300',
            },
          ].map((kpi, i) => (
            <Link key={i} href="/psychotechnique"
              className="card p-4 hover:border-blue-200 transition-all group">
              <div className="text-xl mb-1" dangerouslySetInnerHTML={{ __html: kpi.icon }}/>
              <div className={`text-2xl font-black ${kpi.color} group-hover:scale-105 transition-transform`}>
                {kpi.value}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* POINTS FORTS / À TRAVAILLER — issus du test de compatibilité (P10) */}
      {hasQuiz && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">&#x1F4AA; Points forts</h3>
            {(lastQuiz?.results?.pointsForts?.length ?? 0) > 0 ? (
              <ul className="space-y-2">
                {lastQuiz!.results!.pointsForts!.slice(0, 5).map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500 flex-shrink-0">&#x2713;</span> {p}
                  </li>
                ))}
              </ul>
            ) : topDimensions.length > 0 ? (
              <ul className="space-y-2">
                {topDimensions.map(d => (
                  <li key={d.dimension} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500 flex-shrink-0">&#x2713;</span> {d.label} ({d.score}%)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Faites le test de compatibilite pour identifier vos forces.</p>
            )}
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">&#x1F3AF; A travailler</h3>
            {(lastQuiz?.results?.pointsVigilance?.length ?? 0) > 0 ? (
              <ul className="space-y-2">
                {lastQuiz!.results!.pointsVigilance!.slice(0, 5).map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 flex-shrink-0">&#x2192;</span> {p}
                  </li>
                ))}
              </ul>
            ) : weakDimensions.length > 0 ? (
              <ul className="space-y-2">
                {weakDimensions.map(d => (
                  <li key={d.dimension} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 flex-shrink-0">&#x2192;</span> {d.label} ({d.score}%)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Aucun point de vigilance majeur detecte. &#x1F44F;</p>
            )}
          </div>
        </div>
      )}

      {/* PROCHAINES ETAPES */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 mb-1">Prochaines etapes</h2>
        <p className="text-xs text-gray-400 mb-4">
          Parcours de preparation &middot; {stepsComplete}/5 etapes completees
        </p>
        <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${(stepsComplete / 5) * 100}%` }}/>
        </div>
        <div className="space-y-0.5">
          <EtapeItem done={hasQuiz} label="Faire le test de compatibilite"
            href="/test-compatibilite" detail="27 questions · Decouvrez vos metiers compatibles"/>
          <EtapeItem done={!!profile?.region} label="Completer votre profil"
            href="/profil" detail="Region, experience, disponibilite — personnalise les entretiens IA"/>
          <EtapeItem done={sessions.length > 0} label="Simuler votre premier entretien"
            href="/entretien" detail="IA recruteur · Questions realistes · Feedback personnalise"/>
          <EtapeItem done={sessions.length >= 3} label="Atteindre 3 entretiens simules"
            href="/entretien" detail="La regularite est la cle — chaque session ameliore vos reponses"/>
          <EtapeItem done={sessions.length >= 5} label="5 entretiens — niveau confirme"
            href="/entretien" detail="Les candidats bien prepares ont 3x plus de chances"/>
        </div>
      </div>

      {/* DERNIERS ENTRETIENS */}
      {sessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Derniers entretiens</h2>
            <Link href="/entretien" className="text-xs text-blue-600 hover:underline">Nouveau</Link>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 4).map((s, i) => (
              <div key={s.id} className="card px-4 py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                  &#x1F3A4;
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {s.poste || 'Entretien ferroviaire'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </div>
                </div>
                {s.score !== null && (
                  <div className="text-right flex-shrink-0 flex items-center gap-1">
                    <div className={`font-black text-lg ${s.score >= 72 ? 'text-emerald-600' : s.score >= 48 ? 'text-amber-500' : 'text-red-500'}`}>
                      {s.score}
                    </div>
                    <div className="text-xs text-gray-400">/100</div>
                    {i === 0 && progression !== null && (
                      <span className={`ml-1 text-xs font-semibold ${progression > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {progression > 0 ? `▲${progression}` : `▼${Math.abs(progression)}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {([
            { href: '/test-compatibilite', icon: '&#x1F9ED;', label: hasQuiz ? 'Refaire le test' : 'Test compatibilite', desc: '27 questions · 10 min', bg: 'bg-blue-700 hover:bg-blue-800 text-white' },
            { href: '/entretien', icon: '&#x1F3A4;', label: 'Entretien simule', desc: '7 metiers · IA', bg: 'bg-gray-800 hover:bg-gray-900 text-white' },
            { href: '/psychotechnique', icon: '&#x1F9E0;', label: 'Psychotechnique', desc: '4 modules · 3 niveaux', bg: 'bg-purple-700 hover:bg-purple-800 text-white' },
            { href: '/mentor', icon: '&#x1F4AC;', label: 'Mentor IA', desc: 'Conseils terrain', bg: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200' },
          ] as const).map((a, i) => (
            <Link key={i} href={a.href}
              className={`flex flex-col gap-2 p-4 rounded-2xl transition-all ${a.bg}`}>
              <span className="text-2xl" dangerouslySetInnerHTML={{ __html: a.icon }}/>
              <div>
                <div className="font-semibold text-sm leading-snug">{a.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* EXPLORER LES METIERS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Explorer les metiers</h2>
          <Link href="/metiers" className="text-xs text-blue-600 hover:underline">Voir tout</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METIERS.slice(0, 4).map(m => {
            const ms = lastQuiz?.results?.metiersRecommandes?.find(mr => mr.slug === m.slug)
            return (
              <Link key={m.slug} href={`/metiers/${m.slug}`}
                className="card p-4 text-center hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors leading-snug mb-1">
                  {m.nom}
                </div>
                {ms && (
                  <div className={`text-xs font-bold ${
                    ms.compatibilite >= 72 ? 'text-emerald-600'
                      : ms.compatibilite >= 48 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {ms.compatibilite}%
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
