import axios from 'axios'

const AI_BASE_URL = 'http://localhost:3090/api/ai'

export interface AiGenerateRequest {
  prompt: string
  fields?: any[]
  existingCode?: string
}

export interface AiGenerateResponse {
  code: string
  message?: string
  model?: string
}

export interface SSEEvent {
  event: 'chunk' | 'done' | 'error'
  data: {
    content?: string
    code?: string
    model?: string
    error?: string
  }
}

export interface SSECallbacks {
  onChunk?: (content: string) => void
  onDone?: (code: string, model?: string) => void
  onError?: (error: string) => void
}

/**
 * Generate JavaScript code using AI (non-streaming)
 * @param data - The request data containing prompt and optional context
 * @returns The generated code
 */
export async function generateAiCode(
  data: AiGenerateRequest,
): Promise<AiGenerateResponse> {
  const response = await axios.post<AiGenerateResponse>(
    `${AI_BASE_URL}/generate`,
    data,
  )
  return response.data
}

/**
 * Generate JavaScript code using AI with SSE streaming
 * @param data - The request data containing prompt and optional fields
 * @param callbacks - Callbacks for handling SSE events
 * @returns AbortController to cancel the request
 */
export function generateAiCodeStream(
  data: AiGenerateRequest,
  callbacks: SSECallbacks,
): AbortController {
  const controller = new AbortController()

  fetch(`${AI_BASE_URL}/generate/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(data),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        callbacks.onError?.(
          errorData.message || `HTTP error: ${response.status}`,
        )
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        callbacks.onError?.('No response body')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events from buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        let currentEvent = ''
        let currentData = ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6)
          } else if (line === '' && currentEvent && currentData) {
            // Empty line signals end of event
            try {
              const parsed = JSON.parse(currentData)
              if (currentEvent === 'chunk' && parsed.content) {
                callbacks.onChunk?.(parsed.content)
              } else if (currentEvent === 'done' && parsed.code) {
                callbacks.onDone?.(parsed.code, parsed.model)
              } else if (currentEvent === 'error') {
                callbacks.onError?.(parsed.error || 'Unknown error')
              }
            } catch {
              // Ignore parse errors
            }
            currentEvent = ''
            currentData = ''
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        callbacks.onError?.(error.message || 'Network error')
      }
    })

  return controller
}
