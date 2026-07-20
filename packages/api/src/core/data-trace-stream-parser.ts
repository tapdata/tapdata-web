export interface TraceStreamProcessor {
  (text: string): void
  flush: () => void
}

export function createTraceStreamProcessor(
  onTraceValue: (nodeId: string, data: Record<string, any>) => void,
): TraceStreamProcessor {
  let lastIndex = 0
  let pendingLine = ''

  function parseLine(line: string) {
    const trimmed = line.trim()
    if (!trimmed) return

    const parsed = JSON.parse(trimmed)
    if (parsed.nodeId !== undefined && parsed.type === 'TRACE_VALUE') {
      onTraceValue(parsed.nodeId, parsed)
    }
  }

  const processChunk = ((text: string) => {
    const newText = text.slice(lastIndex)
    lastIndex = text.length

    const lines = (pendingLine + newText).split('\n')
    pendingLine = lines.pop() ?? ''

    for (const line of lines) {
      try {
        parseLine(line)
      } catch {
        // Ignore malformed non-trace lines from the stream.
      }
    }
  }) as TraceStreamProcessor

  processChunk.flush = () => {
    if (!pendingLine.trim()) return

    try {
      parseLine(pendingLine)
    } catch {
      // Ignore an incomplete final line.
    } finally {
      pendingLine = ''
    }
  }

  return processChunk
}
