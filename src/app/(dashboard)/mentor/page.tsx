'use client'

import { useState, useRef, useEffect } from 'react'
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Quel metier ferroviaire me correspond ?',
  "C'est quoi vraiment la vie de conducteur de train ?",
  'Je veux me reconvertir dans le ferroviaire, par ou commencer ?',
  'Les horaires decales, comment ca se passe vraiment ?',
]

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [betaModalOpen, setBetaModalOpen] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadWelcome() {
      try {
        const res = await fetch('/api/agents/mentor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [], context: {} }),
        })
        const data = await res.json()
        if (data.message) setMessages([{ role: 'assistant', content: data.message }])
      } catch {
        setMessages([{ role: 'assistant', content: 'Bonjour ! Je suis le Mentor Ferroviaire de RailReady. Posez-moi vos questions sur les metiers du rail.' }])
      } finally {
        setIsInitializing(false)
      }
    }
    loadWelcome()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)
    setMsgCount(c => c + 1)

    try {
      const res = await fetch('/api/agents/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      if (!res.ok) throw new Error()

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

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
                  assistantContent += parsed.text
                  setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                    return updated
                  })
                }
              } catch { /* ignore */ }
            }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desole, une erreur est survenue. Pouvez-vous reformuler votre question ?' }])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] lg:h-screen max-w-3xl mx-auto">
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg">🚆</div>
          <div>
            <h1 className="font-bold text-gray-900">Mentor Ferroviaire</h1>
            <p className="text-xs text-gray-500">Orientation · Realites terrain · Preparation candidature</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">En ligne</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isInitializing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-1">🚆</div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'
            }`}>
              {msg.content || (isLoading && i === messages.length - 1
                ? <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} /><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} /></div>
                : null)}
            </div>
          </div>
        ))}

        {messages.length === 1 && !isInitializing && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-gray-400 text-center">Questions suggerees</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgCount >= 4 && (
          <div className="flex justify-center pt-2">
            <button onClick={() => setBetaModalOpen(true)}
              className="text-xs text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
              Donner mon retour terrain sur le Mentor
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-4 py-1">
        <p className="text-xs text-gray-400 text-center">
          Le Mentor repond sur les realites terrain et l&apos;orientation. Il ne fournit pas de procedures techniques ou contenus d&apos;examen officiels.
        </p>
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question au Mentor Ferroviaire..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-gray-400"
            style={{ maxHeight: '120px' }}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              input.trim() && !isLoading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400'
            }`}>
            {isLoading
              ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            }
          </button>
        </div>
      </div>

      <BetaFeedbackModal module="mentor_ia" isOpen={betaModalOpen} onClose={() => setBetaModalOpen(false)} />
    </div>
  )
}
