import Cookie from '@tap/shared/src/cookie'
import { requestClient } from '../request'

export const AI_AGENT_CHAT_STREAM_ENDPOINT = '/api/ai-agent/chat/stream'

export interface AiAgentLlmConfig {
  baseUrl: string
  authToken: string
  model: string
}

export interface AiAgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AiAgentChatPayload {
  llm: AiAgentLlmConfig
  messages: AiAgentMessage[]
}

export interface AiAgentToolCallStartEvent {
  id?: string
  name?: string
  arguments?: Record<string, unknown>
}

export interface AiAgentToolCallResultEvent {
  id?: string
  name?: string
  result?: unknown
}

export interface AiAgentStreamEvent {
  eventName: string
  data: any
}

export interface AiAgentStreamCallbacks {
  onEvent?: (event: AiAgentStreamEvent) => void
  onMessageDelta?: (content: string) => void
  onToolCallStart?: (event: AiAgentToolCallStartEvent) => void
  onToolCallResult?: (event: AiAgentToolCallResultEvent) => void
  onDone?: () => void
  onError?: (message: string) => void
  onAbort?: () => void
}

export function buildAiAgentChatPayload(
  llm: AiAgentLlmConfig,
  messages: AiAgentMessage[],
): AiAgentChatPayload {
  return {
    llm: {
      baseUrl: llm.baseUrl.trim().replace(/\/+$/, ''),
      authToken: llm.authToken.trim(),
      model: llm.model.trim(),
    },
    messages: messages
      .filter((message) => message.content.trim())
      .map((message) => ({
        role: message.role,
        content: message.content,
      })),
  }
}

export function parseAiAgentSseFrame(frame: string): AiAgentStreamEvent | null {
  let eventName = ''
  const dataLines: string[] = []

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim())
    }
  }

  if (!dataLines.length) return null

  const rawData = dataLines.join('\n')
  if (rawData === '[DONE]') {
    return { eventName, data: rawData }
  }

  try {
    return { eventName, data: JSON.parse(rawData) }
  } catch {
    return { eventName, data: rawData }
  }
}

export function parseAiAgentSseText(text: string) {
  const parts = text.split(/\r?\n\r?\n/)
  const rest = parts.pop() || ''
  const events = parts
    .map(parseAiAgentSseFrame)
    .filter((event): event is AiAgentStreamEvent => !!event)

  return { events, rest }
}

function emitStreamEvent(
  event: AiAgentStreamEvent,
  callbacks: AiAgentStreamCallbacks,
) {
  callbacks.onEvent?.(event)

  if (event.eventName === 'message_delta') {
    callbacks.onMessageDelta?.(event.data?.content || '')
  } else if (event.eventName === 'tool_call_start') {
    callbacks.onToolCallStart?.(event.data || {})
  } else if (event.eventName === 'tool_call_result') {
    callbacks.onToolCallResult?.(event.data || {})
  }
}

function getStreamErrorMessage(event: AiAgentStreamEvent) {
  if (typeof event.data === 'string') return event.data
  return event.data?.message || event.data?.error || 'Unknown error'
}

function waitForStreamPaintFrame() {
  return new Promise<void>((resolve) => {
    if (
      typeof window !== 'undefined' &&
      typeof window.requestAnimationFrame === 'function'
    ) {
      window.requestAnimationFrame(() => resolve())
      return
    }

    setTimeout(resolve, 0)
  })
}

export function resolveAiAgentStreamUrl(
  baseURL = requestClient.getBaseURL(),
  endpoint = AI_AGENT_CHAT_STREAM_ENDPOINT,
  accessToken = '',
) {
  const origin = window.location.origin
  const normalizedBase = baseURL || './'
  const base = normalizedBase.endsWith('/')
    ? normalizedBase
    : `${normalizedBase}/`
  const path = endpoint.replace(/^\/+/, '')
  const resolvedBase = /^https?:\/\//i.test(base)
    ? new URL(base)
    : new URL(base, `${origin}/`)
  const url = new URL(path, resolvedBase)

  if (accessToken && !url.searchParams.has('access_token')) {
    url.searchParams.set('access_token', accessToken)
  }

  return url.origin === origin
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString()
}

async function readResponseError(response: Response) {
  const text = await response.text().catch(() => '')
  if (!text) return `HTTP error: ${response.status}`

  try {
    const data = JSON.parse(text)
    return data?.message || data?.msg || data?.error || text
  } catch {
    return text
  }
}

export function streamAiAgentChat(
  payload: AiAgentChatPayload,
  callbacks: AiAgentStreamCallbacks,
): AbortController {
  const controller = new AbortController()
  const accessToken = Cookie.get('access_token')
  let buffer = ''
  let settled = false

  const finish = () => {
    if (settled) return
    settled = true
    callbacks.onDone?.()
  }

  const fail = (message: string) => {
    if (settled) return
    settled = true
    callbacks.onError?.(message)
  }

  const processText = async (text: string) => {
    console.log('text', text)
    buffer += text

    const parsed = parseAiAgentSseText(buffer)
    buffer = parsed.rest

    for (const event of parsed.events) {
      if (event.eventName === 'error') {
        fail(getStreamErrorMessage(event))
        return
      } else {
        emitStreamEvent(event, callbacks)
      }

      if (event.eventName === 'done' || event.data === '[DONE]') {
        finish()
        return
      }

      if (!settled) {
        await waitForStreamPaintFrame()
      }
    }
  }

  fetch(
    resolveAiAgentStreamUrl(
      requestClient.getBaseURL(),
      AI_AGENT_CHAT_STREAM_ENDPOINT,
      accessToken,
    ),
    {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json;charset=utf-8',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
      signal: controller.signal,
    },
  )
    .then(async (response) => {
      if (!response.ok) {
        fail(await readResponseError(response))
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        fail('The response does not contain a readable stream')
        return
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        await processText(decoder.decode(value, { stream: true }))
      }

      const tail = decoder.decode()
      if (tail) {
        await processText(tail)
      }

      if (buffer.trim()) {
        const event = parseAiAgentSseFrame(buffer)
        if (event) {
          if (event.eventName === 'error') {
            fail(getStreamErrorMessage(event))
          } else {
            emitStreamEvent(event, callbacks)
          }
        }
      }
      finish()
    })
    .catch((error: any) => {
      if (error?.name === 'AbortError') {
        callbacks.onAbort?.()
        return
      }
      fail(error?.message || 'Network error')
    })

  return controller
}
