export const ASSISTANT_CONFIG_STORAGE_KEY = 'tapdata.aiAssistant.config'

export interface AssistantConfig {
  baseUrl: string
  authToken: string
  model: string
}

export interface AssistantTablePreview {
  columns: string[]
  rows: Record<string, string | number>[]
}

export interface AssistantResult {
  id: string
  type: 'connection' | 'task' | 'table' | 'model'
  label: string
  description: string
  route?: {
    name: string
    params?: Record<string, string>
    query?: Record<string, string>
  }
  source?: Record<string, unknown>
  tablePreview?: AssistantTablePreview
  metadata?: Record<string, string | number | boolean | undefined>
}

export type AssistantToolCallStatus = 'running' | 'success' | 'error'

export interface AssistantToolCall {
  id: string
  name: string
  status: AssistantToolCallStatus
  arguments: Record<string, unknown>
  result?: unknown
  results: AssistantResult[]
  expanded: boolean
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  workedSeconds?: number
  results: AssistantResult[]
  toolCalls: AssistantToolCall[]
}

export type AssistantContentPart =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'result'
      result: AssistantResult
    }

export interface AssistantTextContentBlock {
  id: string
  type: 'paragraph' | 'list-item'
  parts: AssistantContentPart[]
}

export interface AssistantCodeContentBlock {
  id: string
  type: 'code'
  language: string
  content: string
  closed: boolean
}

export type AssistantTableAlignment = 'left' | 'center' | 'right' | ''

export interface AssistantTableCell {
  parts: AssistantContentPart[]
}

export interface AssistantTableContentBlock {
  id: string
  type: 'table'
  headers: AssistantTableCell[]
  alignments: AssistantTableAlignment[]
  rows: AssistantTableCell[][]
}

export type AssistantContentBlock =
  | AssistantTextContentBlock
  | AssistantCodeContentBlock
  | AssistantTableContentBlock

interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

let messageSeed = 0

export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  baseUrl: 'https://api.openai.com/v1',
  authToken: '',
  model: 'gpt-4.1',
}

export function normalizeAssistantConfig(
  value: Partial<AssistantConfig> = {},
): AssistantConfig {
  const baseUrl = (value.baseUrl || DEFAULT_ASSISTANT_CONFIG.baseUrl)
    .trim()
    .replace(/\/+$/, '')
  const authToken = (value.authToken || '').trim()
  const model = (value.model || DEFAULT_ASSISTANT_CONFIG.model).trim()

  return {
    baseUrl,
    authToken,
    model,
  }
}

export function loadAssistantConfig(storage: StorageLike): AssistantConfig {
  const raw = storage.getItem(ASSISTANT_CONFIG_STORAGE_KEY)
  if (!raw) return { ...DEFAULT_ASSISTANT_CONFIG }

  try {
    return normalizeAssistantConfig(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_ASSISTANT_CONFIG }
  }
}

export function saveAssistantConfig(
  config: Partial<AssistantConfig>,
  storage: StorageLike,
) {
  const normalized = normalizeAssistantConfig(config)
  storage.setItem(ASSISTANT_CONFIG_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

function extractContentFromJson(eventName: string, value: any): string {
  if (eventName === 'message_delta') {
    return value?.content || ''
  }

  if (eventName === 'tool_call_start') {
    return ''
  }

  if (eventName === 'tool_call_result') {
    return ''
  }

  if (eventName === 'error') {
    return value?.message || value?.error || ''
  }

  if (eventName === 'done') {
    return ''
  }

  return (
    value?.choices?.[0]?.delta?.content ||
    value?.choices?.[0]?.message?.content ||
    value?.content ||
    value?.message ||
    value?.text ||
    value?.data?.content ||
    ''
  )
}

function parseSseFrame(frame: string) {
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

export function extractStreamContent(chunk: string): string {
  const frames = chunk.split(/\r?\n\r?\n/).filter((frame) => frame.trim())
  const events = frames.map(parseSseFrame).filter(Boolean)

  if (!events.length) return chunk

  return events
    .map((event) => {
      if (!event) return ''
      if (event.data === '[DONE]') return ''
      if (typeof event.data === 'string') return event.data
      return extractContentFromJson(event.eventName, event.data)
    })
    .join('')
}

export function createAssistantMessage(
  role: AssistantMessage['role'],
  content: string,
  options: Partial<Omit<AssistantMessage, 'id' | 'role' | 'content'>> = {},
): AssistantMessage {
  messageSeed += 1

  return {
    id: `assistant-message-${Date.now()}-${messageSeed}`,
    role,
    content,
    createdAt: Date.now(),
    results: [],
    toolCalls: [],
    ...options,
  }
}

function normalizeToolName(name = '') {
  return name.replaceAll(/[_\s-]+/g, '').toLowerCase()
}

function parseToolResult(result: unknown): unknown {
  if (typeof result !== 'string') return result

  try {
    return JSON.parse(result)
  } catch {
    return result
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function textValue(
  source: Record<string, unknown> | undefined,
  keys: string[],
): string {
  if (!source) return ''

  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
  }

  return ''
}

function normalizeCellValue(value: unknown): string | number {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'boolean') return String(value)
  if (value == null) return ''

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function findRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord)
  }

  if (!isRecord(value)) return []

  for (const key of ['items', 'rows', 'data', 'records', 'list']) {
    const nested = value[key]
    if (Array.isArray(nested)) return nested.filter(isRecord)
    if (isRecord(nested)) {
      const rows = findRows(nested)
      if (rows.length) return rows
    }
  }

  return []
}

function rowsFromToolPayload(value: unknown): Record<string, unknown>[] {
  const parsed = parseToolResult(value)
  return findRows(parsed)
}

function createTablePreview(
  rows: Record<string, unknown>[],
): AssistantTablePreview {
  const columns = Array.from(
    rows.slice(0, 10).reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set<string>()),
  ).slice(0, 8)

  return {
    columns,
    rows: rows.slice(0, 20).map((row) =>
      columns.reduce<Record<string, string | number>>((nextRow, column) => {
        nextRow[column] = normalizeCellValue(row[column])
        return nextRow
      }, {}),
    ),
  }
}

function createConnectionResult(
  record: Record<string, unknown>,
): AssistantResult | null {
  const id = textValue(record, ['id', 'connectionId'])
  const label =
    textValue(record, ['name', 'connectionName', 'connection_name']) || id
  if (!label) return null

  const databaseType = textValue(record, ['databaseType', 'database_type'])
  const connectionType = textValue(record, [
    'connectionType',
    'connection_type',
  ])
  const tableCount = textValue(record, ['tableCount'])
  const message = textValue(record, ['message', 'status'])
  const descriptionParts = [message || databaseType, connectionType]
  if (tableCount) {
    descriptionParts.push(`${tableCount} tables`)
  }

  return {
    id: `connection-${id || label}`,
    type: 'connection',
    label,
    description: descriptionParts.filter(Boolean).join(' · ') || 'Connection',
    route: id
      ? {
          name: 'connectionsEdit',
          params: { id },
        }
      : undefined,
    source: record,
    metadata: {
      id,
      databaseType,
      connectionType,
      tableCount,
    },
  }
}

function createTaskResult(
  record: Record<string, unknown>,
): AssistantResult | null {
  const id = textValue(record, ['id', 'taskId'])
  if (!id) return null

  const label = textValue(record, ['name', 'taskName']) || id

  return {
    id: `task-${id}`,
    type: 'task',
    label,
    description:
      textValue(record, ['message', 'syncType', 'status']) ||
      'Task created successfully',
    route: {
      name: 'MigrateEditor',
      params: { id },
    },
    source: record,
    metadata: {
      id,
    },
  }
}

function createModelResult(
  record: Record<string, unknown>,
  toolArguments: Record<string, unknown>,
): AssistantResult | null {
  const id = textValue(record, ['id', 'metadataId'])
  const label =
    textValue(record, ['name', 'collectionName', 'originalName']) || id
  if (!label) return null

  const connectionId = textValue(toolArguments, ['connectionId'])
  const modelType = textValue(record, ['type', 'metaType'])
  const fieldCount = Array.isArray(record.fields)
    ? String(record.fields.length)
    : ''
  const descriptionParts = [modelType || 'Data model']
  if (fieldCount) {
    descriptionParts.push(`${fieldCount} fields`)
  }

  return {
    id: `model-${id || connectionId || label}`,
    type: 'model',
    label,
    description: descriptionParts.filter(Boolean).join(' · '),
    source: record,
    metadata: {
      id,
      metadataId: id,
      connectionId,
      modelType,
      collectionName: textValue(record, ['collectionName', 'name']),
    },
  }
}

export function createAssistantResultsFromToolResult(
  toolName = '',
  result: unknown,
  toolArguments: Record<string, unknown> = {},
): AssistantResult[] {
  const normalizedToolName = normalizeToolName(toolName)
  const payload = parseToolResult(result)
  const payloadRecord = isRecord(payload) ? payload : undefined

  if (normalizedToolName === 'createconnection') {
    const connectionResult = payloadRecord
      ? createConnectionResult(payloadRecord)
      : null
    return connectionResult ? [connectionResult] : []
  }

  if (normalizedToolName === 'listconnection') {
    return rowsFromToolPayload(payload)
      .map(createConnectionResult)
      .filter((item): item is AssistantResult => !!item)
  }

  if (
    normalizedToolName === 'createmigratetask' ||
    normalizedToolName === 'createmergetabletask'
  ) {
    const taskResult = payloadRecord ? createTaskResult(payloadRecord) : null
    return taskResult ? [taskResult] : []
  }

  if (normalizedToolName === 'listdatamodel') {
    return rowsFromToolPayload(payload)
      .map((row) => createModelResult(row, toolArguments))
      .filter((item): item is AssistantResult => !!item)
  }

  if (
    normalizedToolName === 'sampledata' ||
    normalizedToolName === 'querydata' ||
    normalizedToolName === 'query'
  ) {
    const rows = findRows(payload)
    if (!rows.length) return []

    const label =
      textValue(toolArguments, ['tableName', 'collectionName', 'schemaName']) ||
      textValue(payloadRecord, ['tableName', 'collectionName', 'schemaName']) ||
      toolName ||
      'Table preview'

    return [
      {
        id: `table-${label}`,
        type: 'table',
        label,
        description: `${rows.length} rows`,
        source: payloadRecord,
        tablePreview: createTablePreview(rows),
        metadata: {
          tableName: label,
          connectionId: textValue(toolArguments, ['connectionId']),
        },
      },
    ]
  }

  return []
}

export function appendAssistantResults(
  message: AssistantMessage,
  results: AssistantResult[],
) {
  const existingIds = new Set(message.results.map((result) => result.id))
  const nextResults = results.filter((result) => !existingIds.has(result.id))
  if (nextResults.length) {
    message.results.push(...nextResults)
  }
}

export function appendAssistantToolCallStart(
  message: AssistantMessage,
  event: { id?: string; name?: string; arguments?: Record<string, unknown> },
): AssistantToolCall {
  const id =
    event.id || `tool-call-${message.id}-${message.toolCalls.length + 1}`
  const existing = message.toolCalls.find((toolCall) => toolCall.id === id)
  if (existing) {
    existing.name = event.name || existing.name
    existing.status = 'running'
    existing.arguments = event.arguments || existing.arguments || {}
    return existing
  }

  const toolCall: AssistantToolCall = {
    id,
    name: event.name || 'tool',
    status: 'running',
    arguments: event.arguments || {},
    results: [],
    expanded: false,
  }
  message.toolCalls.push(toolCall)
  return toolCall
}

export function formatAssistantToolCallJson(toolCall: AssistantToolCall) {
  const payload =
    toolCall.result !== undefined ? toolCall.result : toolCall.arguments || {}

  try {
    return JSON.stringify(payload, null, 2) || ''
  } catch {
    return String(payload)
  }
}

export function takeAssistantDeltaFrame(content: string, maxChars = 6) {
  if (!content) {
    return { content: '', rest: '' }
  }

  const size = Math.max(1, maxChars)
  const frame = content.slice(0, size)
  return {
    content: frame,
    rest: content.slice(frame.length),
  }
}

function richTextCandidates(results: AssistantResult[]) {
  return results
    .filter((result) => result.label && result.label.trim().length >= 2)
    .sort((a, b) => b.label.length - a.label.length)
}

function findNextResultToken(
  text: string,
  results: AssistantResult[],
  start: number,
) {
  let next:
    | {
        index: number
        result: AssistantResult
      }
    | undefined

  for (const result of results) {
    const index = text.indexOf(result.label, start)
    if (index === -1) continue
    if (!next || index < next.index) {
      next = { index, result }
    }
  }

  return next
}

function buildAssistantContentParts(
  text: string,
  results: AssistantResult[],
): AssistantContentPart[] {
  if (!text) return []

  const candidates = richTextCandidates(results)
  if (!candidates.length) return [{ type: 'text', text }]

  const parts: AssistantContentPart[] = []
  let cursor = 0

  while (cursor < text.length) {
    const next = findNextResultToken(text, candidates, cursor)
    if (!next) break

    if (next.index > cursor) {
      parts.push({ type: 'text', text: text.slice(cursor, next.index) })
    }
    parts.push({ type: 'result', result: next.result })
    cursor = next.index + next.result.label.length
  }

  if (cursor < text.length) {
    parts.push({ type: 'text', text: text.slice(cursor) })
  }

  return parts
}

function splitMarkdownTableRow(line: string): string[] {
  const trimmed = line.trim()
  let source = trimmed
  if (source.startsWith('|')) source = source.slice(1)
  if (source.endsWith('|') && source.at(-2) !== '\\') {
    source = source.slice(0, -1)
  }
  const cells: string[] = []
  let cell = ''
  let escaped = false

  for (const char of source) {
    if (escaped) {
      cell += char
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '|') {
      cells.push(cell.trim())
      cell = ''
      continue
    }

    cell += char
  }

  if (escaped) cell += '\\'
  cells.push(cell.trim())
  return cells
}

function tableAlignment(cell: string): AssistantTableAlignment | null {
  const normalized = cell.trim()
  if (!/^:?-{3,}:?$/.test(normalized)) return null
  const startsWithColon = normalized.startsWith(':')
  const endsWithColon = normalized.endsWith(':')
  if (startsWithColon && endsWithColon) return 'center'
  if (endsWithColon) return 'right'
  if (startsWithColon) return 'left'
  return ''
}

function parseMarkdownTableDelimiter(line: string, columnCount: number) {
  if (!line.includes('|')) return null
  const alignments = splitMarkdownTableRow(line).map(tableAlignment)
  if (
    alignments.length !== columnCount ||
    alignments.includes(null)
  ) {
    return null
  }
  return alignments as AssistantTableAlignment[]
}

function isMarkdownTableRow(line: string) {
  return line.includes('|') && splitMarkdownTableRow(line).length > 1
}

function createMarkdownTableCell(
  text: string,
  results: AssistantResult[],
): AssistantTableCell {
  return {
    parts: buildAssistantContentParts(text, results),
  }
}

export function buildAssistantContentBlocks(
  content: string,
  results: AssistantResult[] = [],
): AssistantContentBlock[] {
  const blocks: AssistantContentBlock[] = []
  const lines = content.split(/\r?\n/)
  let index = 0

  const pushTextBlock = (line: string) => {
    const match = /^(\s*)[-*•]\s+(.*)$/.exec(line)
    const text = match ? match[2] : line
    blocks.push({
      id: `content-block-${blocks.length}`,
      type: match ? 'list-item' : 'paragraph',
      parts: buildAssistantContentParts(text, results),
    })
  }

  while (index < lines.length) {
    const line = lines[index]

    if (isMarkdownTableRow(line)) {
      let delimiterIndex = index + 1
      while (delimiterIndex < lines.length && !lines[delimiterIndex].trim()) {
        delimiterIndex += 1
      }

      const headerCells = splitMarkdownTableRow(line)
      const alignments =
        delimiterIndex < lines.length
          ? parseMarkdownTableDelimiter(
              lines[delimiterIndex],
              headerCells.length,
            )
          : null

      if (alignments) {
        const rows: AssistantTableCell[][] = []
        index = delimiterIndex + 1

        while (index < lines.length && isMarkdownTableRow(lines[index])) {
          const rowCells = splitMarkdownTableRow(lines[index])
          rows.push(
            headerCells.map((_, cellIndex) =>
              createMarkdownTableCell(rowCells[cellIndex] || '', results),
            ),
          )
          index += 1
        }

        blocks.push({
          id: `content-block-${blocks.length}`,
          type: 'table',
          headers: headerCells.map((cell) =>
            createMarkdownTableCell(cell, results),
          ),
          alignments,
          rows,
        })
        continue
      }
    }

    const openingFence = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line)

    if (!openingFence) {
      pushTextBlock(line)
      index += 1
      continue
    }

    const fence = openingFence[2]
    const fenceChar = fence[0]
    const info = openingFence[3].trim()
    if (fenceChar === '`' && info.includes('`')) {
      pushTextBlock(line)
      index += 1
      continue
    }

    const codeLines: string[] = []
    let closed = false
    index += 1

    while (index < lines.length) {
      const nextLine = lines[index]
      const closingFence = /^( {0,3})(`{3,}|~{3,})[ \t]*$/.exec(nextLine)
      const closingMarker = closingFence?.[2] || ''

      if (
        closingMarker &&
        closingMarker[0] === fenceChar &&
        closingMarker.length >= fence.length
      ) {
        closed = true
        index += 1
        break
      }

      codeLines.push(nextLine)
      index += 1
    }

    blocks.push({
      id: `content-block-${blocks.length}`,
      type: 'code',
      language: info.split(/\s+/)[0] || '',
      content: codeLines.join('\n'),
      closed,
    })
  }

  return blocks
}

export function applyAssistantToolCallResult(
  message: AssistantMessage,
  event: { id?: string; name?: string; result?: unknown },
): AssistantToolCall {
  let toolCall = event.id
    ? message.toolCalls.find((item) => item.id === event.id)
    : undefined

  if (!toolCall) {
    toolCall = appendAssistantToolCallStart(message, {
      id: event.id,
      name: event.name,
    })
  }

  toolCall.name = event.name || toolCall.name
  toolCall.status = 'success'
  toolCall.result = event.result
  toolCall.results = createAssistantResultsFromToolResult(
    toolCall.name,
    event.result,
    toolCall.arguments,
  )

  appendAssistantResults(message, toolCall.results)
  return toolCall
}

export function createDemoAssistantMessage(prompt: string): AssistantMessage {
  const content = prompt.includes('Task')
    ? 'The connection has been created and a task draft is ready. Click the object name to view more details.'
    : 'The connection has been created, and a preview of the table is now available. Click the object name to view more details.'

  return createAssistantMessage('assistant', content, {
    workedSeconds: 8,
    results: [
      {
        id: 'demo_mysql',
        type: 'connection',
        label: 'demo_mysql',
        description: 'Connection created successfully',
        route: {
          name: 'connectionsList',
          query: { keyword: 'demo_mysql' },
        },
      },
      {
        id: 'mysql_to_pg_sync',
        type: 'task',
        label: 'mysql_to_pg_sync',
        description: 'Draft task created',
        route: {
          name: 'MigrateEditor',
          params: { id: 'mysql_to_pg_sync' },
        },
      },
      {
        id: 'user',
        type: 'table',
        label: 'user',
        description: 'Table preview',
        tablePreview: {
          columns: ['id', 'name', 'email'],
          rows: [
            { id: 1, name: 'Ada', email: 'ada@example.com' },
            { id: 2, name: 'Lin', email: 'lin@example.com' },
            { id: 3, name: 'Ken', email: 'ken@example.com' },
          ],
        },
      },
    ],
  })
}
