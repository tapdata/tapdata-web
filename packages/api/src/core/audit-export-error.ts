export async function auditExportError(error: unknown): Promise<unknown> {
  let body =
    (error as { response?: { data?: unknown } })?.response?.data ?? error

  if (body instanceof Blob) {
    const text = await body.text()
    try {
      body = JSON.parse(text)
    } catch (parseError) {
      if (parseError instanceof SyntaxError) return error
      throw parseError
    }
  }

  if (body instanceof Error) return body
  if (body && typeof body === 'object') {
    const { message, code } = body as { message?: unknown; code?: unknown }
    if (typeof message === 'string' && message) return new Error(message)
    if (typeof code === 'string' && code) return new Error(code)
  }
  return error
}
