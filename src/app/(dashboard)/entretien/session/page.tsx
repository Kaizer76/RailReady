'use client'

// ============================================================
// RAILREADY — Session de simulation d'entretien
// /entretien/session?poste=conducteur-de-train&niveau=debutant
// ============================================================

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMetierBySlug } from '@/data/metiers'
import FeedbackWidget from '@/components/feedback/FeedbackWidget'
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

interface Evaluation {
  score_global: number
  niveau: string
  dimensions: Record<string, { score: number; label: string; commentaire: string }>
  points_forts: string[]
  axes_travail: string[]
  reponses_faibles?: Array<{ question: string; probleme: string; suggestion: string }>
  feedback_global: string
  prochaines_etapes: string[]
}

function EntretienSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get('poste') || 'conducteur-de-train'
  const niveau = (searchParams.get('niveau') || 'debutant') as 'debutant' | 'intermediaire' | 'avance'

  const metier = getMetierBySlug(slug)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [betaModalOpen, setBetaModalOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Message d'ouverture
  useEffect(() => {
    async function startSession() {
      try {
        const res = await fetch('/api/agents/recrutement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [],
            sessionId,
            config: { slug, niveau, poste: metier?.nom || slug },
            isOpening: true,
          }),
        })

        if (!res.ok) throw new Error()
        const data = await res.json()

        if (data.opening) {
          setMessages([{
            role: 'assistant',
            content: data.opening,
            timestamp: new Date(),
          }])
        }
      } catch {
        // Message de secours en cas d'erreur API
        const metierLabel = metier?.nom || slug
        setMessages([{
          role: 'assistant',
          content: `Bonjour ! Je suis votre recruteur pour cet entretien de simulation concernant le poste de **${metierLabel}**.\n\nNous allons avoir un échange d'environ 30 minutes. Je commencerai par vous demander de vous présenter, puis nous aborderons vos motivations et votre connaissance du métier.\n\nTapez **/fin** à tout moment pour obtenir votre rapport d'évaluation.\n\n**Pouvez-vous commencer par vous présenter brièvement ?**`,
          timestamp: new Date(),
        }])
      } finally {
        setIsInitializing(false)
      }
    }
    startSession()
  }, [sessionId, slug, niveau, metier])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus sur l'input après chaque réponse
  useEffect(() => {
    if (!isLoading && !isInitializing && !evaluation) {
      inputRef.current?.focus()
    }
  }, [isLoading, isInitializing, evaluation])

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading || evaluation) return

    // Commande /fin → évaluation
    if (text.toLowerCase() === '/fin') {
      setInput('')
      await handleEvaluation()
      return
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text, timestamp: new Date() }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/agents/recrutement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId,
          config: { slug, niveau, poste: metier?.nom || slug },
        }),
      })

      if (!res.ok) throw new Error()

      // Streaming
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.text) {
                  content += parsed.text
                  setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content,
                      timestamp: new Date(),
                    }
                    return updated
                  })
                }
              } catch { /* ignore */ }
            }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Une erreur est survenue. Veuillez reformuler votre réponse.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEvaluation() {
    setIsEvaluating(true)
    setMessages(prev => [...prev, {
      role: 'user',
      content: '/fin — Générez mon évaluation complète.',
      timestamp: new Date(),
    }])

    try {
      const res = await fetch('/api/agents/recrutement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          sessionId,
          config: { slug, niveau, poste: metier?.nom || slug },
          isFinal: true,
        }),
      })

      const data = await res.json()

      if (data.evaluation) {
        try {
          const parsed = typeof data.evaluation === 'string'
            ? JSON.parse(data.evaluation.match(/\{[\s\S]*\}/)?.[0] || '{}')
            : data.evaluation
          setEvaluation(parsed)
        } catch {
          setEvaluation(null)
        }
      }
    } catch {
      setEvaluation(null)
    } finally {
      setIsEvaluating(false)
      setShowFeedback(true)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const scoreColor = (s: number) =>
    s >= 70 ? 'text-green-600' : s >= 45 ? 'text-orange-500' : 'text-red-500'

  return (
    <div className="flex flex-col h-screen lg:h-[calc(100vh)] max-w-4xl mx-auto">
      {/* Header session */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/entretien" className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">
          ←
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{metier?.emoji || '🎤'}</span>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">
              Entretien — {metier?.nom || slug}
            </div>
            <div className="text-xs text-gray-400">
              Niveau {niveau} · Tapez <code className="bg-gray-100 px-1 rounded">/fin</code> pour terminer
            </div>
          </div>
        </div>
        <button
          onClick={() => { if (confirm('Terminer et obtenir votre évaluation ?')) handleEvaluation() }}
          disabled={isEvaluating || !!evaluation || messages.length < 4}
          className="flex-shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {isEvaluating ? 'Évaluation...' : 'Terminer →'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4">
        {isInitializing && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm flex-shrink-0">👔</div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-auto mb-1">
                👔
              </div>
            )}
            <div className="max-w-[80%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded text-xs">$1</code>')
                    || (isLoading && i === messages.length - 1
                      ? '<div class="flex gap-1.5"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>'
                      : '')
                }}
              />
              {msg.timestamp && (
                <div className={`text-xs text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0 ml-2 mt-auto mb-1 text-white font-bold">
                V
              </div>
            )}
          </div>
        ))}

        {/* Rapport d'évaluation */}
        {evaluation && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 mt-4 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">📊 Rapport d'évaluation</h3>
              <div className={`text-5xl font-black ${scoreColor(evaluation.score_global)}`}>
                {evaluation.score_global}/100
              </div>
              <div className="text-gray-500 text-sm mt-1">{evaluation.niveau}</div>
            </div>

            {/* Dimensions */}
            <div className="space-y-3 mb-6">
              {Object.entries(evaluation.dimensions).map(([key, dim]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-sm font-bold ${scoreColor(dim.score * 5)}`}>
                      {dim.score}/20
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dim.score >= 14 ? 'bg-green-500' : dim.score >= 8 ? 'bg-orange-400' : 'bg-red-400'}`}
                      style={{ width: `${(dim.score / 20) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{dim.commentaire}</p>
                </div>
              ))}
            </div>

            {/* Points forts */}
            {evaluation.points_forts?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-green-700 mb-2">✅ Points forts</h4>
                <ul className="space-y-1">
                  {evaluation.points_forts.map((p, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0">+</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Axes à travailler */}
            {evaluation.axes_travail?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-orange-700 mb-2">🔧 Axes à travailler</h4>
                <ul className="space-y-1">
                  {evaluation.axes_travail.map((a, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 flex-shrink-0">→</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feedback global */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">💬 Feedback du recruteur</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{evaluation.feedback_global}</p>
            </div>

            {/* Prochaines étapes */}
            {evaluation.prochaines_etapes?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-700 mb-2">📋 Prochaines étapes recommandées</h4>
                <ul className="space-y-1">
                  {evaluation.prochaines_etapes.map((e, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 flex-shrink-0">{i + 1}.</span>{e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions post-évaluation */}
            <div className="flex gap-3 mt-6 flex-wrap">
              <Link href="/entretien" className="btn-primary flex-1 justify-center">
                Nouvel entretien
              </Link>
              <Link href="/metiers" className="btn-secondary flex-1 justify-center">
                Explorer les métiers
              </Link>
            </div>
          </div>
        )}

        {isEvaluating && (
          <div className="text-center py-8 text-gray-500">
            <div className="flex gap-2 justify-center mb-3">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
            <p className="text-sm">Génération de votre rapport d'évaluation...</p>
          </div>
        )}

        {/* Feedback bêta — affiché après évaluation */}
        {showFeedback && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🏗️</span>
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Version bêta — votre avis compte</p>
                <p className="text-xs text-amber-700 mb-3">
                  Cheminot(e) ou candidat(e) ? Votre retour terrain aide à calibrer les questions d'entretien.
                </p>
                <button
                  onClick={() => setBetaModalOpen(true)}
                  className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                >
                  Donner mon retour →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal feedback bêta */}
        <BetaFeedbackModal
          module="entretien_ia"
          isOpen={betaModalOpen}
          onClose={() => setBetaModalOpen(false)}
          contexte={metier?.nom}
        />

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Zone de saisie */}
      {!evaluation && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? 'Le recruteur rédige sa réponse...' : 'Votre réponse... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)'}
              disabled={isLoading || isEvaluating}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isEvaluating}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading
                ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                : <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              }
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Répondez comme en vrai entretien - Tapez <code className="bg-gray-100 px-1 rounded">/fin</code> pour terminer
          </p>
        </div>
      )}
    </div>
  )
}

// Wrapper Suspense — requis par Next.js 14 pour useSearchParams
export default function EntretienSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 text-sm">Chargement de la session...</div>
      </div>
    }>
      <EntretienSessionContent />
    </Suspense>
  )
}
