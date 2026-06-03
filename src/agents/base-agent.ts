// ============================================================
// RAILREADY — Agent de base
// Classe abstraite commune à tous les agents IA
// ============================================================

import OpenAI from 'openai'

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AgentConfig {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export interface StreamChunk {
  content: string
  isComplete: boolean
  usage?: { promptTokens: number; completionTokens: number }
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export abstract class BaseAgent {
  protected config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config
  }

  // Stream une réponse — retourne un ReadableStream compatible Next.js
  async streamResponse(
    messages: AgentMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<ReadableStream<Uint8Array>> {
    const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]

    const stream = await openai.chat.completions.create({
      model: this.config.model,
      messages: allMessages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream: true,
    })

    const encoder = new TextEncoder()

    return new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            if (onChunk) onChunk(text)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })
  }

  // Réponse complète (non-streaming) pour les analyses post-session
  async getCompletion(messages: AgentMessage[]): Promise<string> {
    const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]

    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: allMessages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    })

    return response.choices[0]?.message?.content || ''
  }
}
